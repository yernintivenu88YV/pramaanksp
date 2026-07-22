import React, { useState } from 'react';
import { WorkPanel } from '../ui/Layout.jsx';
import { Search, User, Phone, Car, MapPin, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { profiles, searchTypes } from '../../data/resolution.js';

export default function ResolutionView() {
  const [expandedId, setExpandedId] = useState(null);

  const getStrengthColor = (strength) => {
    if (strength > 0.8) return 'bg-pramaan-success';
    if (strength > 0.5) return 'bg-pramaan-warning';
    return 'bg-pramaan-critical';
  };

  return (
    <WorkPanel className="flex flex-col h-full bg-pramaan-bg text-pramaan-text p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-4">Identity Resolution</h1>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-pramaan-text-secondary" size={18} />
          <input 
            type="text" 
            placeholder="Search across all entities, aliases, phones, vehicles..." 
            className="w-full bg-pramaan-surface border border-pramaan-border rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-pramaan-primary transition-colors"
          />
        </div>
        <div className="flex gap-2 mt-3">
          {['Person', 'Phone', 'Vehicle', 'Location', 'Alias'].map(type => (
            <span key={type} className="px-3 py-1 bg-pramaan-elevated border border-pramaan-border rounded-full text-xs cursor-pointer hover:bg-pramaan-surface transition-colors">
              {type}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {(profiles || [
          { id: '1', name: 'Ravi Kumar', aliases: ['RK', 'Rocky'], matchScore: 0.95, matches: ['Phone', 'Vehicle'], phones: ['+91 98765 43210'], addresses: ['123 Main St, Sector 4'] },
          { id: '2', name: 'Raj Kumar', aliases: ['Raju'], matchScore: 0.65, matches: ['Name similarity'], phones: ['+91 99999 11111'], addresses: ['45 Industrial Area'] }
        ]).map(profile => {
          const isExpanded = expandedId === profile.id;
          return (
            <div key={profile.id} className="bg-pramaan-surface border border-pramaan-border rounded-lg overflow-hidden transition-all">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-pramaan-elevated"
                onClick={() => setExpandedId(isExpanded ? null : profile.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-pramaan-elevated rounded-full flex items-center justify-center text-pramaan-text-secondary">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{profile.name}</h3>
                    <div className="text-xs text-pramaan-text-secondary mt-0.5">
                      Aliases: {profile.aliases?.join(', ') || 'None'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <div className="text-xs text-pramaan-text-secondary mb-1">Match Confidence</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStrengthColor(profile.matchScore)}`}></div>
                      <span className="font-medium">{Math.round(profile.matchScore * 100)}%</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-pramaan-text-secondary" /> : <ChevronDown size={20} className="text-pramaan-text-secondary" />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 pt-0 border-t border-pramaan-border bg-pramaan-elevated/30">
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div>
                      <h4 className="text-xs font-semibold text-pramaan-text-secondary uppercase mb-3">Contact & Location</h4>
                      <div className="space-y-3">
                        {profile.phones?.map((p, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <Phone size={14} className="text-pramaan-primary" /> {p}
                          </div>
                        ))}
                        {profile.addresses?.map((a, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <MapPin size={14} className="text-pramaan-primary" /> {a}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-pramaan-text-secondary uppercase mb-3">Match Signals</h4>
                      <div className="space-y-2">
                        {profile.matches?.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm bg-pramaan-surface p-2 rounded border border-pramaan-border">
                            <div className="w-1.5 h-1.5 rounded-full bg-pramaan-success"></div>
                            {m}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </WorkPanel>
  );
}
