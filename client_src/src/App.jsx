import React, { useState, useEffect } from 'react'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('case_twin')
  const [errorMsg, setErrorMsg] = useState('')

  // Entity Resolution state
  const [erRecordA, setErRecordA] = useState({
    name: 'Mohammed Rafi',
    age: 45,
    gender: 'Male',
    address: 'No 12, 5th Cross, Malleshwaram, Bengaluru',
    phone: '9845012345',
    vehicle_reg: 'KA-02-MB-1234'
  })
  const [erRecordB, setErRecordB] = useState({
    name: 'Mohammad Rafi',
    age: 45,
    gender: 'Male',
    address: 'No 12, 5th Cross, Malleshwaram, Bengaluru',
    phone: '',
    vehicle_reg: ''
  })
  const [erResult, setErResult] = useState(null)
  const [erError, setErError] = useState(null)

  // Case Twin state
  const [ctTopK, setCtTopK] = useState(2)
  const [ctResult, setCtResult] = useState(null)
  const [ctError, setCtError] = useState(null)

  // Intent Router state
  const [irQuery, setIrQuery] = useState('Find similar burglary cases to CASE-001')
  const [irResult, setIrResult] = useState(null)
  const [irError, setIrError] = useState(null)
  const [irPending, setIrPending] = useState(false)

  // Graph Network state
  const [graphCanonId, setGraphCanonId] = useState('CANON-0042')
  const [graphData, setGraphData] = useState(null)
  const [graphError, setGraphError] = useState(null)
  const [graphPending, setGraphPending] = useState(false)
  const [communityData, setCommunityData] = useState(null)
  const [communityError, setCommunityError] = useState(null)
  const [communityPending, setCommunityPending] = useState(false)

  // Target case (CASE-001)
  const targetCase = {
    case_id: "CASE-001",
    crime_type: "Burglary",
    modus_operandi: "Rear window forced entry using crowbar, night time",
    narrative_text: "Complainant reported burglary at residence. Entry made through rear window using a crowbar. Occurred between 1 AM and 3 AM. Jewelry and cash stolen.",
    latitude: 12.9352,
    longitude: 77.6245,
    date_time: "2026-07-11T02:00:00",
    weapon: "crowbar",
    canonical_suspect_ids: ["CANON-0042"]
  }

  // Candidate cases (CASE-002, CASE-003, CASE-004, CASE-005)
  const candidateCases = [
    {
      case_id: "CASE-002",
      crime_type: "Burglary",
      modus_operandi: "Rear window entry with crowbar, late night",
      narrative_text: "Victim reported house burglary. Entry via rear window using a crowbar, between midnight and 2 AM. Cash and gold ornaments stolen.",
      latitude: 12.9784,
      longitude: 77.6408,
      date_time: "2026-07-04T01:30:00",
      weapon: "crowbar",
      canonical_suspect_ids: []
    },
    {
      case_id: "CASE-003",
      crime_type: "Burglary",
      modus_operandi: "Front door lock picked during daytime while owners away",
      narrative_text: "Complainant returned home to find front door lock picked and valuables missing during daytime hours.",
      latitude: 12.9600,
      longitude: 77.6100,
      date_time: "2026-07-07T14:00:00",
      weapon: null,
      canonical_suspect_ids: []
    },
    {
      case_id: "CASE-004",
      crime_type: "Chain snatching",
      modus_operandi: "Snatched gold chain from pedestrian on motorbike",
      narrative_text: "Victim was walking on the street when two men on a motorbike snatched her gold chain and fled.",
      latitude: 12.2958,
      longitude: 76.6394,
      date_time: "2026-07-08T11:00:00",
      weapon: null,
      canonical_suspect_ids: []
    },
    {
      case_id: "CASE-005",
      crime_type: "Vehicle theft",
      modus_operandi: "Motorcycle stolen from parking area",
      narrative_text: "Complainant's motorcycle was stolen from outside a shopping complex.",
      latitude: 13.0827,
      longitude: 77.5877,
      date_time: "2026-06-01T16:00:00",
      weapon: null,
      canonical_suspect_ids: ["CANON-0042"]
    }
  ]

  useEffect(() => {
    // Check if user is authenticated
    if (window.catalyst && window.catalyst.auth) {
      window.catalyst.auth.isUserAuthenticated()
        .then(res => {
          setIsAuthenticated(true)
          setUser(res.content)
          setLoading(false)
        })
        .catch(err => {
          setIsAuthenticated(false)
          setLoading(false)
          // Initialize Embedded Authentication
          setTimeout(() => {
            if (document.getElementById('loginDiv')) {
              window.catalyst.auth.signIn('loginDiv')
            }
          }, 200)
        })
    } else {
      setErrorMsg('Catalyst Web SDK is not loaded.')
      setLoading(false)
    }
  }, [])

  const handleLogout = () => {
    if (window.catalyst && window.catalyst.auth) {
      window.catalyst.auth.signOut('/app/index.html')
    }
  }

  const runEntityResolution = () => {
    setErResult(null)
    setErError(null)

    const payload = {
      record_a: erRecordA,
      record_b: erRecordB
    }

    fetch('/server/entity_resolution_fn/resolve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(async resp => {
        const data = await resp.json()
        if (resp.status === 200) {
          setErResult(data)
        } else {
          setErError(data.error || `HTTP Error ${resp.status}`)
        }
      })
      .catch(err => {
        setErError(err.message || 'Network error')
      })
  }

  const runCaseTwinMatch = () => {
    setCtResult(null)
    setCtError(null)

    const payload = {
      target: targetCase,
      candidates: candidateCases,
      top_k: Number(ctTopK)
    }

    fetch('/server/case_twin_fn/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(async resp => {
        const data = await resp.json()
        if (resp.status === 200) {
          setCtResult(data)
        } else {
          setCtError(data.error || `HTTP Error ${resp.status}`)
        }
      })
      .catch(err => {
        setCtError(err.message || 'Network error')
      })
  }

  const runIntentRoute = () => {
    setIrResult(null)
    setIrError(null)
    setIrPending(true)

    fetch('/server/intent_router_fn/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: irQuery })
    })
      .then(async resp => {
        const data = await resp.json()
        setIrPending(false)
        if (resp.status === 200) {
          setIrResult(data)
        } else {
          setIrError(data.error || `HTTP Error ${resp.status}`)
        }
      })
      .catch(err => {
        setIrPending(false)
        setIrError(err.message || 'Network error')
      })
  }

  const runGraphTraverse = (canonId) => {
    setGraphData(null)
    setGraphError(null)
    setGraphPending(true)

    fetch('/server/graph_fn/traverse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ canonical_id: canonId || graphCanonId })
    })
      .then(async resp => {
        const data = await resp.json()
        setGraphPending(false)
        if (resp.status === 200) {
          setGraphData(data)
        } else {
          setGraphError(data.error || `HTTP Error ${resp.status}`)
        }
      })
      .catch(err => {
        setGraphPending(false)
        setGraphError(err.message || 'Network error')
      })
  }

  const runCommunitiesLeiden = () => {
    setCommunityData(null)
    setCommunityError(null)
    setCommunityPending(true)

    fetch('/server/graph_fn/communities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(async resp => {
        const data = await resp.json()
        setCommunityPending(false)
        if (resp.status === 200) {
          setCommunityData(data.communities)
        } else {
          setCommunityError(data.error || `HTTP Error ${resp.status}`)
        }
      })
      .catch(err => {
        setCommunityPending(false)
        setCommunityError(err.message || 'Network error')
      })
  }

  const renderSVGGraph = () => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) return null;
    
    const center = { x: 250, y: 250 };
    const radius = 150;
    const numNodes = graphData.nodes.length;
    
    const positions = {
      [graphData.canonical_id]: center
    };
    
    graphData.nodes.forEach((node, idx) => {
      const angle = (idx * 2 * Math.PI) / numNodes;
      positions[node.id] = {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      };
    });

    return (
      <svg width="500" height="500" style={{ background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
        {/* Render lines */}
        {graphData.relationships.map((rel, idx) => {
          const start = positions[rel.source] || center;
          const end = positions[rel.target] || center;
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          
          return (
            <g key={idx}>
              <line 
                x1={start.x} y1={start.y} 
                x2={end.x} y2={end.y} 
                stroke="#64748b" strokeWidth="2" 
                strokeDasharray="4 4"
              />
              <rect x={midX - 45} y={midY - 8} width="90" height="16" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <text 
                x={midX} y={midY + 4} 
                fill="#94a3b8" fontSize="10" 
                fontWeight="bold" textAnchor="middle"
              >
                {rel.type}
              </text>
            </g>
          );
        })}

        {/* Central query node */}
        <circle cx={center.x} cy={center.y} r="24" fill="#eab308" stroke="#ca8a04" strokeWidth="3" />
        <text x={center.x} y={center.y + 4} fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">
          TARGET
        </text>
        <text x={center.x} y={center.y + 40} fill="#eab308" fontSize="12" fontWeight="bold" textAnchor="middle">
          {graphData.canonical_id}
        </text>

        {/* Surrounding nodes */}
        {graphData.nodes.map((node) => {
          const pos = positions[node.id] || center;
          const color = node.label === 'Case' ? '#3b82f6' : node.label === 'Vehicle' ? '#ef4444' : '#10b981';
          const strokeColor = node.label === 'Case' ? '#1d4ed8' : node.label === 'Vehicle' ? '#b91c1c' : '#047857';
          
          return (
            <g key={node.id}>
              <circle cx={pos.x} cy={pos.y} r="18" fill={color} stroke={strokeColor} strokeWidth="2" />
              <text x={pos.x} y={pos.y + 4} fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">
                {node.label[0]}
              </text>
              <text x={pos.x} y={pos.y + 30} fill="#cbd5e1" fontSize="11" textAnchor="middle">
                {node.id}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  if (loading) {
    return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Loading Catalyst Application...</div>
  }

  if (errorMsg) {
    return <div style={{ padding: '20px', color: 'red', fontFamily: 'sans-serif' }}>Error: {errorMsg}</div>
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center' }}>Pramaan Login</h1>
        <p style={{ textAlign: 'center', color: '#666' }}>Internal Crime-Intelligence Gateway</p>
        <div id="loginDiv" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px', minHeight: '300px' }}></div>
      </div>
    )
  }

  const roleName = user.role_details?.role_name || 'UNKNOWN'

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>Pramaan Gateway</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span>User: <strong>{user.first_name} {user.last_name}</strong> ({user.email_id})</span>
            <span style={{
              background: '#e0e7ff',
              color: '#3730a3',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              Role: {roleName}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('case_twin')} 
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'case_twin' ? '3px solid #2563eb' : 'none',
            background: activeTab === 'case_twin' ? '#eff6ff' : '#f3f4f6',
            color: activeTab === 'case_twin' ? '#1e40af' : '#4b5563',
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: '4px 4px 0 0'
          }}
        >
          Case-Twin Finder
        </button>
        <button 
          onClick={() => setActiveTab('entity_res')} 
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'entity_res' ? '3px solid #2563eb' : 'none',
            background: activeTab === 'entity_res' ? '#eff6ff' : '#f3f4f6',
            color: activeTab === 'entity_res' ? '#1e40af' : '#4b5563',
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: '4px 4px 0 0'
          }}
        >
          Entity Resolution
        </button>
        <button 
          onClick={() => setActiveTab('intent_router')} 
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'intent_router' ? '3px solid #2563eb' : 'none',
            background: activeTab === 'intent_router' ? '#eff6ff' : '#f3f4f6',
            color: activeTab === 'intent_router' ? '#1e40af' : '#4b5563',
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: '4px 4px 0 0'
          }}
        >
          Intent Router (NL Search)
        </button>
        <button 
          onClick={() => setActiveTab('graph_network')} 
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'graph_network' ? '3px solid #2563eb' : 'none',
            background: activeTab === 'graph_network' ? '#eff6ff' : '#f3f4f6',
            color: activeTab === 'graph_network' ? '#1e40af' : '#4b5563',
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: '4px 4px 0 0'
          }}
        >
          Graph Relations (GDS)
        </button>
      </div>

      {/* Case Twin panel */}
      {activeTab === 'case_twin' && (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '0 0 8px 8px' }}>
          <h2>Case-Twin Signature Match Engine</h2>
          <p style={{ color: '#555' }}>Ranks candidate cases against Target Case (CASE-001) using modus operandi, location, time patterns, and TF-IDF narrative similarities.</p>

          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
            <h3>Target Case: CASE-001</h3>
            <p><strong>Type:</strong> {targetCase.crime_type}</p>
            <p><strong>Modus Operandi:</strong> {targetCase.modus_operandi}</p>
            <p><strong>Narrative:</strong> {targetCase.narrative_text}</p>
            <p><strong>Weapon:</strong> {targetCase.weapon || 'None'}</p>
            <p><strong>Coordinates:</strong> {targetCase.latitude}, {targetCase.longitude}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Top-K matches to return:</label>
            <input 
              type="number" 
              value={ctTopK} 
              onChange={e => setCtTopK(e.target.value)} 
              min="1" max="4"
              style={{ width: '60px', padding: '5px' }}
            />
          </div>

          <button onClick={runCaseTwinMatch} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Find Signature Twins
          </button>

          {/* Error Feedback */}
          {ctError && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', borderRadius: '6px' }}>
              <h3>Access Denied / Query Failed</h3>
              <p>{ctError}</p>
            </div>
          )}

          {/* Results Feedback */}
          {ctResult && (
            <div style={{ marginTop: '20px' }}>
              <h3>Ranked Similarity Matches</h3>
              {ctResult.ranked_similarity && ctResult.ranked_similarity.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #ddd' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Case ID</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Similarity Score</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Sub-Score Breakdown</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ctResult.ranked_similarity.map(item => (
                      <tr key={item.case_id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.case_id}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                            {Number(item.total_score).toFixed(3)}
                          </span>
                        </td>
                        <td style={{ padding: '10px', fontSize: '13px', color: '#666' }}>
                          Location: {Number(item.breakdown.location).toFixed(2)} | 
                          Time: {Number(item.breakdown.time).toFixed(2)} | 
                          MO: {Number(item.breakdown.mo).toFixed(2)} | 
                          Weapon: {Number(item.breakdown.weapon).toFixed(2)} | 
                          Narrative: {Number(item.breakdown.narrative).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No similarity matches found.</p>
              )}

              <h3>Flagged Shared-Suspect Cases</h3>
              {ctResult.flagged_shared_suspect && ctResult.flagged_shared_suspect.length > 0 ? (
                <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '15px', borderRadius: '6px' }}>
                  {ctResult.flagged_shared_suspect.map(item => (
                    <div key={item.case_id} style={{ margin: '5px 0' }}>
                      ⚠️ <strong>{item.case_id}</strong> is flagged separately because it shares a confirmed suspect (via Entity Resolution), although it did not rank high on similarity metrics alone (Similarity Score: {Number(item.total_score).toFixed(3)}).
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666' }}>No suspect link matches flagged.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Entity Resolution panel */}
      {activeTab === 'entity_res' && (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '0 0 8px 8px' }}>
          <h2>Deterministic & Probabilistic Entity Resolution</h2>
          <p style={{ color: '#555' }}>Resolves identity pairs and links records using Fellegi-Sunter log-likelihood weights.</p>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div style={{ flex: 1, border: '1px solid #eee', padding: '15px', borderRadius: '6px' }}>
              <h3>Record A</h3>
              <label>Name:</label>
              <input type="text" value={erRecordA.name} onChange={e => setErRecordA({...erRecordA, name: e.target.value})} style={{ width: '100%', padding: '5px', marginBottom: '10px' }} />
              <label>Phone:</label>
              <input type="text" value={erRecordA.phone} onChange={e => setErRecordA({...erRecordA, phone: e.target.value})} style={{ width: '100%', padding: '5px', marginBottom: '10px' }} />
              <label>Vehicle Reg:</label>
              <input type="text" value={erRecordA.vehicle_reg} onChange={e => setErRecordA({...erRecordA, vehicle_reg: e.target.value})} style={{ width: '100%', padding: '5px' }} />
            </div>

            <div style={{ flex: 1, border: '1px solid #eee', padding: '15px', borderRadius: '6px' }}>
              <h3>Record B</h3>
              <label>Name:</label>
              <input type="text" value={erRecordB.name} onChange={e => setErRecordB({...erRecordB, name: e.target.value})} style={{ width: '100%', padding: '5px', marginBottom: '10px' }} />
              <label>Phone:</label>
              <input type="text" value={erRecordB.phone} onChange={e => setErRecordB({...erRecordB, phone: e.target.value})} style={{ width: '100%', padding: '5px', marginBottom: '10px' }} />
              <label>Vehicle Reg:</label>
              <input type="text" value={erRecordB.vehicle_reg} onChange={e => setErRecordB({...erRecordB, vehicle_reg: e.target.value})} style={{ width: '100%', padding: '5px' }} />
            </div>
          </div>

          <button onClick={runEntityResolution} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Resolve Identity Pair
          </button>

          {/* Error Feedback */}
          {erError && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', borderRadius: '6px' }}>
              <h3>Access Denied / Query Failed</h3>
              <p>{erError}</p>
            </div>
          )}

          {/* Results Feedback */}
          {erResult && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px' }}>
              <h3>Resolution Result</h3>
              <p><strong>Decision:</strong> <span style={{
                background: erResult.decision === 'auto_merge' ? '#d1fae5' : erResult.decision === 'review_queue' ? '#fef3c7' : '#fee2e2',
                color: erResult.decision === 'auto_merge' ? '#065f46' : erResult.decision === 'review_queue' ? '#92400e' : '#991b1b',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}>{erResult.decision.toUpperCase()}</span></p>
              <p><strong>Combined Match Score:</strong> {erResult.score !== null ? Number(erResult.score).toFixed(3) : 'Deterministic Link'}</p>
              <h4>Resolution Evidence:</h4>
              <ul>
                {erResult.evidence && erResult.evidence.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Intent Router panel */}
      {activeTab === 'intent_router' && (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '0 0 8px 8px' }}>
          <h2>Conversational Intent Query Router</h2>
          <p style={{ color: '#555' }}>Enter a natural language query in English, Kannada, or code-mixed. The LLM will classify the intent and forward parameters to the correct target engine.</p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Query Box:</label>
            <textarea
              value={irQuery}
              onChange={e => setIrQuery(e.target.value)}
              rows="3"
              style={{ width: '100%', padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #ccc' }}
              placeholder="e.g. Find similar burglary cases to CASE-001"
            />
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
              Suggestions: <br />
              • <em>Find similar burglary cases to CASE-001</em> <br />
              • <em>Resolve identities for Mohammed Rafi (phone 9845012345) and Mohammad Rafi (Malleshwaram)</em> <br />
              • <em>Who is linked to suspect CANON-0042?</em>
            </div>
          </div>

          <button 
            onClick={runIntentRoute} 
            disabled={irPending}
            style={{ 
              padding: '10px 20px', 
              background: irPending ? '#93c5fd' : '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: irPending ? 'not-allowed' : 'pointer', 
              fontWeight: 'bold' 
            }}
          >
            {irPending ? 'Analyzing Query...' : 'Send Query'}
          </button>

          {/* Error Feedback */}
          {irError && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', borderRadius: '6px' }}>
              <h3>Access Denied / Routing Failed</h3>
              <p>{irError}</p>
            </div>
          )}

          {/* Results Feedback */}
          {irResult && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
              <h3>Routing Decisions & Classification Output</h3>
              <p><strong>Detected Intent:</strong> <span style={{
                background: '#dcfce7',
                color: '#166534',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}>{irResult.intent}</span></p>
              
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                <strong>LLM Structured Parameters:</strong>
                <pre style={{ margin: '5px 0 0 0', background: '#1e293b', color: '#f8fafc', padding: '10px', borderRadius: '4px', fontSize: '13px' }}>
                  {JSON.stringify(irResult.classification, null, 2)}
                </pre>
              </div>

              {/* Render routed response */}
              {irResult.response && (
                <div style={{ marginTop: '15px' }}>
                  <strong>Routed Endpoint Response:</strong>
                  <pre style={{ margin: '5px 0 0 0', background: '#0f172a', color: '#38bdf8', padding: '10px', borderRadius: '4px', fontSize: '13px' }}>
                    {JSON.stringify(irResult.response, null, 2)}
                  </pre>
                </div>
              )}

              {/* Stub Message for Graph */}
              {irResult.message && (
                <div style={{ marginTop: '15px', background: '#fffbeb', border: '1px solid #fef3c7', padding: '10px', borderRadius: '4px', color: '#92400e' }}>
                  ℹ️ {irResult.message}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Graph Network panel */}
      {activeTab === 'graph_network' && (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '0 0 8px 8px' }}>
          <h2>GDS Criminal Network Explorer</h2>
          <p style={{ color: '#555' }}>Visualize relationships between cases, vehicles, and canonical suspects. Runs real-time neighbor traversals and Leiden associate clustering.</p>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Suspect Canonical ID:</label>
              <input
                type="text"
                value={graphCanonId}
                onChange={e => setGraphCanonId(e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '15px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '10px' }}
              />
              <button
                onClick={() => runGraphTraverse(graphCanonId)}
                disabled={graphPending}
                style={{
                  padding: '10px 20px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginRight: '10px'
                }}
              >
                {graphPending ? 'Traversing...' : 'Traverse Suspect Network'}
              </button>
              <button
                onClick={runCommunitiesLeiden}
                disabled={communityPending}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {communityPending ? 'Running Leiden...' : 'Run Leiden Associate Clustering'}
              </button>
            </div>
          </div>

          {/* Errors */}
          {graphError && (
            <div style={{ marginBottom: '20px', padding: '15px', background: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', borderRadius: '6px' }}>
              <h3>Traversal Failed</h3>
              <p>{graphError}</p>
            </div>
          )}
          {communityError && (
            <div style={{ marginBottom: '20px', padding: '15px', background: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', borderRadius: '6px' }}>
              <h3>Associate Clustering Failed</h3>
              <p>{communityError}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* Visual graph */}
            {graphData && (
              <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3>Visual Relationship Topology ({graphData.mode === 'mock' ? 'Mock Mode' : 'Live Mode'})</h3>
                {renderSVGGraph()}
              </div>
            )}

            {/* Communities */}
            {communityData && (
              <div style={{ flex: '1 1 400px' }}>
                <h3>Leiden Associate Clusters</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Community ID</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Suspect Name</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Canonical ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {communityData.map((row, idx) => (
                      <tr key={idx} style={{ background: row.communityId % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                          <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '12px' }}>
                            Cluster #{row.communityId}
                          </span>
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.name}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd', fontFamily: 'monospace' }}>{row.canonical_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
