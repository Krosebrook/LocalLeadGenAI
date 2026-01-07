
import React, { useState, useMemo, Suspense } from 'react';
import { 
  Search, MapPin, Target, Database, BarChart3, Mail, 
  ExternalLink, Loader2, Sparkles, ChevronRight, RefreshCw, 
  X, ShieldAlert, Globe, Clock, MessageSquare, ChevronDown
} from 'lucide-react';
import { useLeads } from './hooks/useLeads';
import { useLocalStorage } from './hooks/useLocalStorage';
import { OpportunityType, BusinessLead, SearchState } from './types';
import OpportunityBadge from './components/OpportunityBadge';
import { UI_CONFIG, ERROR_MESSAGES } from './config/constants';

// Header Component
const Header: React.FC<{
  onSearch: (s: SearchState) => void;
  loading: boolean;
}> = ({ onSearch, loading }) => {
  const [search, setSearch] = useLocalStorage<SearchState>('app_search_params', { niche: 'Dentist', city: 'Austin, TX' });

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4 flex flex-col md:flex-row items-center gap-4">
      <div className="flex items-center gap-2 mr-auto">
        <div className="w-10 h-10 cyber-gradient rounded-xl flex items-center justify-center neon-border-purple shadow-lg">
          <Target className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            LEADGEN<span className="text-purple-400">AI</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Sales Accelerator</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 w-full md:w-auto shadow-inner">
        <div className="flex items-center bg-slate-800/30 px-3 py-2 rounded-xl gap-2 flex-1 md:flex-none min-w-[160px] focus-within:ring-1 ring-purple-500/30 transition-all">
          <Search size={14} className="text-slate-500" />
          <input
            className="bg-transparent border-none outline-none text-xs w-full placeholder:text-slate-600 text-slate-200"
            placeholder="Niche (e.g. Lawyers)"
            value={search.niche}
            onChange={(e) => setSearch({ ...search, niche: e.target.value })}
          />
        </div>
        <div className="flex items-center bg-slate-800/30 px-3 py-2 rounded-xl gap-2 flex-1 md:flex-none min-w-[160px] focus-within:ring-1 ring-purple-500/30 transition-all">
          <MapPin size={14} className="text-slate-500" />
          <input
            className="bg-transparent border-none outline-none text-xs w-full placeholder:text-slate-600 text-slate-200"
            placeholder="City"
            value={search.city}
            onChange={(e) => setSearch({ ...search, city: e.target.value })}
          />
        </div>
        <button
          onClick={() => onSearch(search)}
          disabled={loading.leads}
          className="cyber-gradient px-6 py-2 rounded-xl text-xs font-black text-white flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading.leads ? <Loader2 className="animate-spin" size={14} /> : <Database size={14} />}
          SCAN AREA
        </button>
      </div>
    </header>
  );
};

// Main Layout component
const App: React.FC = () => {
  const { 
    leads, selectedLead, audit, pitch, loading, error, 
    setError, performSearch, performAudit, createPitch,
    clearSelectedLead, regeneratePitch
  } = useLeads();

  // Load saved preferences from localStorage
  const [tone, setTone] = useLocalStorage<string>('app_pitch_tone', 'Friendly');
  const [length, setLength] = useLocalStorage<string>('app_pitch_length', 'Medium');
  const [lastPitchFocus, setLastPitchFocus] = useLocalStorage<string>('app_pitch_focus', 'automation');

  const isMissingWebsite = useMemo(() => 
    selectedLead?.opportunities.includes(OpportunityType.MISSING_INFO), 
  [selectedLead]);

  const handleGeneratePitch = (focus: string) => {
    setLastPitchFocus(focus);
    createPitch(focus, tone, length);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header onSearch={performSearch} loading={loading.leads} />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Leads */}
        <aside className="w-full lg:w-[400px] border-r border-white/5 bg-slate-950/20 overflow-y-auto flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-white/5 sticky top-0 bg-slate-950/80 backdrop-blur z-10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <BarChart3 size={12} /> Live Prospects
            </h2>
            <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">
              {leads.length} Active
            </span>
          </div>

          <div className="p-4 space-y-3">
            {loading.leads ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 bg-slate-900/50 rounded-2xl animate-pulse-soft border border-white/5" />
              ))
            ) : leads.length === 0 ? (
              <div className="py-20 text-center px-6">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <Target size={24} className="text-slate-700" />
                </div>
                <h3 className="text-sm font-bold text-slate-400">No leads targeted yet</h3>
                <p className="text-xs text-slate-600 mt-1">Search for a niche and location to populate your pipeline.</p>
              </div>
            ) : (
              leads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => performAudit(lead)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border group relative ${
                    selectedLead?.id === lead.id
                      ? 'bg-purple-500/10 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.05)]'
                      : 'bg-slate-900/40 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-white truncate max-w-[80%]">
                      {lead.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-yellow-500 font-bold">
                      {lead.rating} ★
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {lead.opportunities.map((opp) => (
                      <OpportunityBadge key={opp} type={opp} />
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 font-medium">{lead.reviews} Reviews</span>
                    <ChevronRight size={14} className={`transition-transform ${selectedLead?.id === lead.id ? 'translate-x-1 text-purple-400' : 'text-slate-800'}`} />
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Right Panel: Detail & AI */}
        <section className="flex-1 overflow-y-auto bg-[#020617] relative">
          {!selectedLead ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 p-8 max-w-md mx-auto text-center">
              <div className="relative mb-6">
                 <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-10 rounded-full"></div>
                 <Sparkles size={48} className="relative text-slate-800" />
              </div>
              <h2 className="text-xl font-bold text-slate-400 mb-2">Target Analysis Pending</h2>
              <p className="text-sm opacity-60">Select a lead from the pipeline to perform a deep-dive digital audit and generate high-conversion pitches.</p>
            </div>
          ) : (
            <div className="p-8 max-w-4xl mx-auto">
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-3xl font-black tracking-tight text-white">{selectedLead.name}</h2>
                    {selectedLead.website && (
                      <a href={selectedLead.website} target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-white/10 transition-all">
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><MapPin size={14} /> {selectedLead.address}</span>
                    <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                    <span className="flex items-center gap-1.5"><BarChart3 size={14} /> {selectedLead.rating} Avg Rating</span>
                  </div>
                </div>
                <button onClick={clearSelectedLead} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                  Close Detail <X size={14} />
                </button>
              </div>

              {/* Audit Content */}
              <div className="space-y-12">
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                      <Search size={14} className="text-blue-500" /> Grounded Audit
                    </h3>
                    <button 
                      onClick={() => performAudit(selectedLead)}
                      disabled={loading.audit}
                      title="Refresh Audit Data"
                      className="p-1.5 bg-slate-900 border border-white/5 rounded-xl text-slate-500 hover:text-white transition-all disabled:opacity-20"
                    >
                      <RefreshCw size={14} className={loading.audit ? 'animate-spin' : ''} />
                    </button>
                  </div>

                  {loading.audit ? (
                    <div className="glass-panel p-10 rounded-3xl border-dashed border-white/10 flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
                        <Loader2 className="animate-spin text-blue-500 relative" size={32} />
                      </div>
                      <p className="text-xs font-bold text-slate-500 animate-pulse tracking-widest uppercase">Analyzing Digital Footprint...</p>
                    </div>
                  ) : audit ? (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="glass-panel p-6 rounded-3xl text-sm leading-relaxed text-slate-300">
                        {audit.content.split('\n').map((line, i) => (
                          <p key={i} className="mb-2">{line}</p>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass-panel p-5 rounded-3xl border-red-500/10 bg-red-500/[0.02]">
                          <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Critical Gaps Found</h4>
                          <div className="flex flex-wrap gap-2">
                            {audit.gaps.map((gap, i) => (
                              <span key={i} className="px-2.5 py-1 bg-red-500/10 text-red-300 border border-red-500/20 rounded-lg text-[10px] font-bold">
                                {gap}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="glass-panel p-5 rounded-3xl bg-blue-500/[0.02]">
                          <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Verification Sources</h4>
                          <div className="space-y-2">
                            {audit.sources.map((s, i) => (
                              <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="block text-[10px] text-slate-500 hover:text-blue-400 transition-colors truncate">
                                [{i+1}] {s.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </section>

                {/* Pitch Engine */}
                {audit && (
                  <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 mb-6">
                      <Sparkles size={14} className="text-purple-500" /> Pitch Engine
                    </h3>

                    <div className="glass-panel p-8 rounded-3xl border-purple-500/20 shadow-2xl overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <Mail size={120} className="text-purple-400" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-600 mb-3 block tracking-widest">Audience Tone</label>
                          <div className="relative">
                            <select 
                              value={tone}
                              onChange={(e) => setTone(e.target.value)}
                              className="w-full bg-slate-900/80 border border-white/5 rounded-xl px-4 py-2.5 text-[10px] font-bold text-slate-300 appearance-none outline-none focus:border-purple-500/50 transition-all cursor-pointer hover:bg-slate-900"
                            >
                              <option value="Formal">Formal</option>
                              <option value="Friendly">Friendly</option>
                              <option value="Urgent">Urgent</option>
                              <option value="Humorous">Humorous</option>
                              <option value="Authoritative">Authoritative</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-600 mb-3 block tracking-widest">Draft length</label>
                          <div className="relative">
                            <select 
                              value={length}
                              onChange={(e) => setLength(e.target.value)}
                              className="w-full bg-slate-900/80 border border-white/5 rounded-xl px-4 py-2.5 text-[10px] font-bold text-slate-300 appearance-none outline-none focus:border-cyan-500/50 transition-all cursor-pointer hover:bg-slate-900"
                            >
                              <option value="Very Short">Very Short</option>
                              <option value="Short">Short</option>
                              <option value="Medium">Medium</option>
                              <option value="Long">Long</option>
                              <option value="Very Long">Very Long</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                          </div>
                        </div>
                      </div>

                      <div className={`grid grid-cols-1 ${isMissingWebsite ? 'md:grid-cols-2' : ''} gap-4 mb-8`}>
                        <button
                          onClick={() => handleGeneratePitch('automation')}
                          disabled={loading.pitch}
                          className={`w-full p-4 rounded-2xl font-black text-white text-xs flex items-center justify-center gap-3 shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 ${lastPitchFocus === 'automation' ? 'cyber-gradient ring-2 ring-purple-500/50' : 'bg-slate-800 border border-white/10'}`}
                        >
                          {loading.pitch && lastPitchFocus === 'automation' ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                          AI Automation Pitch
                        </button>

                        {isMissingWebsite && (
                          <button
                            onClick={() => handleGeneratePitch('website')}
                            disabled={loading.pitch}
                            className={`w-full p-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 ${lastPitchFocus === 'website' ? 'bg-cyan-600 border-2 border-cyan-400 text-white shadow-cyan-500/20' : 'bg-cyan-600/20 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-600/30'}`}
                          >
                            {loading.pitch && lastPitchFocus === 'website' ? <Loader2 className="animate-spin" size={16} /> : <Globe size={16} />}
                            Website Launchpad Pitch
                          </button>
                        )}
                      </div>

                      {pitch && (
                        <div className="animate-in zoom-in-95 duration-500">
                          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-6 font-mono text-[13px] leading-relaxed text-slate-300 whitespace-pre-wrap selection:bg-purple-500/30">
                            {pitch}
                          </div>
                          <div className="mt-4 flex gap-3">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(pitch);
                                alert('Pitch copied to clipboard!');
                              }}
                              className="bg-white text-slate-950 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                            >
                              Copy Draft
                            </button>
                            <button 
                              onClick={regeneratePitch}
                              disabled={loading.pitch}
                              className="bg-slate-800 border border-white/10 text-slate-300 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors flex items-center gap-2"
                            >
                              <RefreshCw size={14} className={loading.pitch ? 'animate-spin' : ''} />
                              Refresh Pitch
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Persistent Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[100] animate-in slide-in-from-right-full">
          <ShieldAlert size={20} className="shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest">System Error</p>
            <p className="text-xs opacity-90">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-white/10 rounded-lg">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
