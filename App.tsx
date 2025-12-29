
import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Target, Database, BarChart3, Mail, ExternalLink, Loader2, Sparkles, ChevronRight, RefreshCw, X, ShieldAlert, Globe, Clock, MessageSquare, ListCheck } from 'lucide-react';
import { findLeads, auditBusiness, generatePitch } from './services/geminiService';
import { BusinessLead, SearchState, BusinessAudit, OpportunityType } from './types';
import OpportunityBadge from './components/OpportunityBadge';

const App: React.FC = () => {
  const [search, setSearch] = useState<SearchState>({ niche: 'Dentist', city: 'Austin, TX' });
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);
  const [audit, setAudit] = useState<BusinessAudit | null>(null);
  const [pitch, setPitch] = useState<string | null>(null);
  const [pitchTone, setPitchTone] = useState<string>('Friendly');
  const [pitchLength, setPitchLength] = useState<string>('Medium');
  const [loading, setLoading] = useState<{ leads: boolean; audit: boolean; pitch: boolean }>({
    leads: false,
    audit: false,
    pitch: false
  });
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!search.niche || !search.city) return;
    setLoading(prev => ({ ...prev, leads: true }));
    setError(null);
    setSelectedLead(null);
    setAudit(null);
    setPitch(null);
    
    try {
      const results = await findLeads(search.niche, search.city);
      setLeads(results);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leads');
    } finally {
      setLoading(prev => ({ ...prev, leads: false }));
    }
  };

  const handleAudit = async (lead: BusinessLead) => {
    setSelectedLead(lead);
    setAudit(null);
    setPitch(null);
    setLoading(prev => ({ ...prev, audit: true }));
    
    try {
      const result = await auditBusiness(lead);
      setAudit(result);
    } catch (err: any) {
      console.error(err);
      setError('Audit failed. Please try refreshing or selecting another lead.');
    } finally {
      setLoading(prev => ({ ...prev, audit: false }));
    }
  };

  const handleGeneratePitch = async (pitchFocus: string = 'automation') => {
    if (!selectedLead || !audit) return;
    setLoading(prev => ({ ...prev, pitch: true }));
    setPitch(null);
    
    try {
      const result = await generatePitch(selectedLead, audit, pitchFocus, pitchTone, pitchLength);
      setPitch(result);
    } catch (err: any) {
      console.error(err);
      setError('Pitch generation failed.');
    } finally {
      setLoading(prev => ({ ...prev, pitch: false }));
    }
  };

  const isMissingWebsite = selectedLead?.opportunities.includes(OpportunityType.MISSING_INFO);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-purple-500/30">
      {/* Top Navigation / Search */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2 mr-auto">
          <div className="w-10 h-10 cyber-gradient rounded-lg flex items-center justify-center neon-glow">
            <Target className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            LEADGEN<span className="text-purple-400">AI</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/5 w-full md:w-auto">
          <div className="flex items-center bg-slate-800/50 px-3 py-2 rounded-lg gap-2 flex-1 md:flex-none min-w-[150px]">
            <Search size={16} className="text-slate-500" />
            <input
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600"
              placeholder="Industry (e.g. Roofers)"
              value={search.niche}
              onChange={(e) => setSearch({ ...search, niche: e.target.value })}
            />
          </div>
          <div className="flex items-center bg-slate-800/50 px-3 py-2 rounded-lg gap-2 flex-1 md:flex-none min-w-[150px]">
            <MapPin size={16} className="text-slate-500" />
            <input
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600"
              placeholder="City (e.g. Austin, TX)"
              value={search.city}
              onChange={(e) => setSearch({ ...search, city: e.target.value })}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading.leads}
            className="cyber-gradient px-6 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {loading.leads ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />}
            FIND LEADS
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-81px)] overflow-hidden">
        {/* Left Panel: Lead List */}
        <div className="lg:col-span-4 border-r border-white/5 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <RefreshCw size={14} /> Pipeline Results
            </h2>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
              {leads.length} leads found
            </span>
          </div>

          {loading.leads && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
              <Loader2 className="animate-spin text-purple-500" size={32} />
              <p className="animate-pulse">Scouring Google Maps for data points...</p>
            </div>
          )}

          {!loading.leads && leads.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600 border-2 border-dashed border-white/5 rounded-2xl">
              <Target size={40} className="mb-4 opacity-20" />
              <p className="text-sm">Initiate a search to discover local opportunities.</p>
            </div>
          )}

          {leads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => handleAudit(lead)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border group relative ${
                selectedLead?.id === lead.id
                  ? 'bg-purple-500/10 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                  : 'bg-slate-900/40 border-white/5 hover:border-white/20 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                  {lead.name}
                </h3>
                <div className="flex items-center gap-1 text-xs font-mono text-yellow-500/80 bg-yellow-500/5 px-1.5 py-0.5 rounded border border-yellow-500/20">
                  <BarChart3 size={10} />
                  {lead.rating}
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 mb-3">{lead.address}</p>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {lead.opportunities.map((opp) => (
                  <OpportunityBadge key={opp} type={opp} />
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest flex items-center gap-1">
                   {lead.reviews} Reviews
                </span>
                <ChevronRight size={16} className={`transition-transform ${selectedLead?.id === lead.id ? 'translate-x-1 text-purple-400' : 'text-slate-700'}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Right Panel: Detail, Audit & Pitch */}
        <div className="lg:col-span-8 overflow-y-auto bg-slate-950/50 relative">
          {!selectedLead ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
              <div className="relative mb-6">
                 <div className="absolute inset-0 cyber-gradient blur-3xl opacity-10 rounded-full"></div>
                 <BarChart3 size={64} className="relative opacity-20" />
              </div>
              <p className="text-lg font-medium">Select a business to begin digital auditing</p>
              <p className="text-sm opacity-60">Analyze web presence, identify gaps, and generate pitches.</p>
            </div>
          ) : (
            <div className="p-8 max-w-4xl mx-auto">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
                    {selectedLead.name}
                    {selectedLead.website && (
                      <a href={selectedLead.website} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-purple-400 transition-colors">
                        <ExternalLink size={20} />
                      </a>
                    )}
                  </h2>
                  <p className="text-slate-500 flex items-center gap-2">
                    <MapPin size={16} /> {selectedLead.address}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="p-2 hover:bg-white/5 rounded-full text-slate-600 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Audit Section */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                      <Search size={20} />
                    </div>
                    <h3 className="text-xl font-bold">Digital Presence Audit</h3>
                    {loading.audit && <Loader2 className="animate-spin text-blue-400 ml-2" size={16} />}
                  </div>
                  
                  {/* Refresh Audit Button */}
                  <button 
                    onClick={() => handleAudit(selectedLead)}
                    disabled={loading.audit}
                    title="Refresh Data"
                    className="p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/5 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw size={18} className={`${loading.audit ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loading.audit ? (
                  <div className="glass-panel p-6 rounded-3xl border-dashed border-white/10 flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="animate-pulse">Analyzing search results and grounding data...</p>
                  </div>
                ) : audit ? (
                  <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-3xl space-y-4">
                      <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                        {audit.content.split('\n').map((line, i) => (
                          <p key={i} className="mb-2 leading-relaxed">{line}</p>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="glass-panel p-5 rounded-3xl border-red-500/10 bg-red-500/[0.02]">
                        <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Target size={14} /> Gap Identification
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {audit.gaps.map((gap, i) => (
                            <span key={i} className="px-3 py-1 bg-red-500/10 text-red-300 border border-red-500/20 rounded-lg text-xs font-medium">
                              {gap}
                            </span>
                          ))}
                          {audit.gaps.length === 0 && <span className="text-xs text-slate-600 italic">No significant gaps detected.</span>}
                        </div>
                      </div>
                      
                      <div className="glass-panel p-5 rounded-3xl">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <ExternalLink size={14} /> Grounding Sources
                        </h4>
                        <div className="flex flex-col gap-2">
                          {audit.sources.map((source, i) => (
                            <a 
                              key={i} 
                              href={source.uri} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-xs text-blue-400 hover:underline flex items-center justify-between group"
                            >
                              <span className="truncate mr-2">{source.title}</span>
                              <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Pitch Configuration Controls */}
                    <div className="glass-panel p-6 rounded-3xl border-white/5 bg-slate-900/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3 block flex items-center gap-2">
                            <MessageSquare size={12} /> Target Tone
                          </label>
                          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                            {['Formal', 'Friendly', 'Urgent'].map((t) => (
                              <button
                                key={t}
                                onClick={() => setPitchTone(t)}
                                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                  pitchTone === t 
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-inner shadow-purple-500/10' 
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3 block flex items-center gap-2">
                            <Clock size={12} /> Pitch Length
                          </label>
                          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                            {['Short', 'Medium', 'Long'].map((l) => (
                              <button
                                key={l}
                                onClick={() => setPitchLength(l)}
                                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                  pitchLength === l 
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-inner shadow-cyan-500/10' 
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className={`grid grid-cols-1 ${isMissingWebsite ? 'md:grid-cols-2' : ''} gap-4`}>
                        <button
                          onClick={() => handleGeneratePitch('automation')}
                          disabled={loading.pitch}
                          className="w-full cyber-gradient p-4 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-xl hover:shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                          {loading.pitch ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                          GENERATE AUTOMATION PITCH
                        </button>

                        {isMissingWebsite && (
                          <button
                            onClick={() => handleGeneratePitch('website')}
                            disabled={loading.pitch}
                            className="w-full bg-cyan-600/20 border border-cyan-500/40 p-4 rounded-2xl font-black text-cyan-100 flex items-center justify-center gap-3 shadow-xl hover:bg-cyan-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
                          >
                            {loading.pitch ? <Loader2 className="animate-spin" /> : <Globe size={20} />}
                            WEBSITE LAUNCHPAD PITCH
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border border-white/5 rounded-3xl bg-slate-900/30 text-center text-slate-500 italic">
                    Audit data will appear here. Select a lead or click the refresh button to begin analysis.
                  </div>
                )}
              </div>

              {/* Pitch Section */}
              {pitch && (
                <div className="mt-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
                        <Mail size={20} />
                      </div>
                      <h3 className="text-xl font-bold">Personalized Sales Pitch</h3>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-300 uppercase font-bold tracking-wider">{pitchTone}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 uppercase font-bold tracking-wider">{pitchLength}</span>
                    </div>
                  </div>
                  
                  <div className="glass-panel p-8 rounded-3xl border-purple-500/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles size={80} className="text-purple-400" />
                    </div>
                    
                    <div className="relative z-10 font-mono text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                      {pitch}
                    </div>

                    <div className="mt-8 flex gap-3 relative z-10">
                      <button 
                        className="bg-white text-slate-950 px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                        onClick={() => navigator.clipboard.writeText(pitch)}
                      >
                        Copy to Clipboard
                      </button>
                      <button className="bg-slate-800 text-slate-200 px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">
                        Edit Draft
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Notifications / Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-500/90 text-white px-6 py-3 rounded-2xl shadow-2xl backdrop-blur flex items-center gap-3 animate-in slide-in-from-right-full">
          <ShieldAlert size={20} />
          <span className="font-medium text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-4 hover:opacity-70"><X size={16} /></button>
        </div>
      )}
    </div>
  );
};

export default App;
