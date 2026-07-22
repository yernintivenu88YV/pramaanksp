import React from 'react';

/**
 * PublicHelpDesk: Isolated public-facing citizen help-desk page.
 * Strictly isolated: Contains ZERO case data, ZERO suspect records,
 * and NO link back to authenticated intelligence views.
 */
export function PublicHelpDesk() {
  return (
    <div className="min-h-screen bg-[#0b0d10] text-[#e8eaed] p-6 max-w-4xl mx-auto space-y-8 font-sans">
      {/* Public Header */}
      <div className="text-center space-y-2 border-b border-white/10 pb-6">
        <div className="inline-block px-3 py-1 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded text-xs font-bold font-mono">
          PUBLIC CITIZEN ASSISTANT PORTAL
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಸಾರ್ವಜನಿಕ ಸಹಾಯವಾಣಿ
        </h1>
        <h2 className="text-lg font-medium text-gray-300">
          Karnataka State Police — Citizen Assistance & Emergency Helpline
        </h2>
        <p className="text-xs text-gray-400 max-w-lg mx-auto">
          Official public portal for police assistance, lost report registration, and emergency contact numbers.
        </p>
      </div>

      {/* Emergency Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#14171c] border border-red-500/30 p-4 rounded-lg space-y-2">
          <div className="text-xs text-red-400 font-bold uppercase">🚨 Emergency Assistance</div>
          <div className="text-3xl font-bold text-white font-mono">112</div>
          <div className="text-xs text-gray-400">NERRS 24x7 Toll-Free Emergency Line</div>
        </div>

        <div className="bg-[#14171c] border border-amber-500/30 p-4 rounded-lg space-y-2">
          <div className="text-xs text-amber-400 font-bold uppercase">🛡️ Cyber Crime Helpline</div>
          <div className="text-3xl font-bold text-white font-mono">1930</div>
          <div className="text-xs text-gray-400">National Cyber Crime Reporting Portal</div>
        </div>

        <div className="bg-[#14171c] border border-cyan-500/30 p-4 rounded-lg space-y-2">
          <div className="text-xs text-cyan-400 font-bold uppercase">📞 Women Helpline</div>
          <div className="text-3xl font-bold text-white font-mono">1091</div>
          <div className="text-xs text-gray-400">Dedicated Police Help Desk for Women</div>
        </div>
      </div>

      {/* Public Services Info */}
      <div className="bg-[#14171c] border border-white/10 p-6 rounded-lg space-y-4 text-xs text-gray-300">
        <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2">
          Public Citizen Services Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-cyan-400 mb-1">E-Lost Report Registration</h4>
            <p className="text-gray-400 leading-relaxed">
              Report lost documents, mobile phones, or articles digitally via the official KSP Mobile App without visiting a police station.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-emerald-400 mb-1">Police Verification Certificates</h4>
            <p className="text-gray-400 leading-relaxed">
              Apply online for job verification, tenant verification, and passport clearance certificates through Seva Sindhu portal.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-gray-500 border-t border-white/10 pt-4">
        Official Public Portal · Karnataka State Police Department · Government of Karnataka
      </div>
    </div>
  );
}
