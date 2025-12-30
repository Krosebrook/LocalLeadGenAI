
import { useState, useCallback } from 'react';
import { BusinessLead, BusinessAudit, SearchState, OpportunityType } from '../types';
import { findLeads, auditBusiness, generatePitch } from '../services/geminiService';
import { useLocalStorage } from './useLocalStorage';

export function useLeads() {
  const [leads, setLeads] = useLocalStorage<BusinessLead[]>('app_leads_cache', []);
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);
  const [audit, setAudit] = useState<BusinessAudit | null>(null);
  const [pitch, setPitch] = useState<string | null>(null);
  const [loading, setLoading] = useState({ leads: false, audit: false, pitch: false });
  const [error, setError] = useState<string | null>(null);
  const [lastPitchConfig, setLastPitchConfig] = useState<{focus: string, tone: string, length: string} | null>(null);

  const performSearch = useCallback(async (search: SearchState) => {
    if (!search.niche || !search.city) return;
    setLoading(prev => ({ ...prev, leads: true }));
    setError(null);
    setSelectedLead(null);
    setAudit(null);
    setPitch(null);
    setLastPitchConfig(null);
    
    try {
      const results = await findLeads(search.niche, search.city);
      setLeads(results);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leads. Check your connection.');
    } finally {
      setLoading(prev => ({ ...prev, leads: false }));
    }
  }, [setLeads]);

  const performAudit = useCallback(async (lead: BusinessLead) => {
    setSelectedLead(lead);
    setAudit(null);
    setPitch(null);
    setLastPitchConfig(null);
    setLoading(prev => ({ ...prev, audit: true }));
    setError(null);
    
    try {
      const result = await auditBusiness(lead);
      setAudit(result);
    } catch (err: any) {
      setError('Audit failed. The business data might be restricted.');
    } finally {
      setLoading(prev => ({ ...prev, audit: false }));
    }
  }, []);

  const createPitch = useCallback(async (pitchFocus: string, tone: string, length: string) => {
    if (!selectedLead || !audit) return;
    setLoading(prev => ({ ...prev, pitch: true }));
    setError(null);
    setLastPitchConfig({ focus: pitchFocus, tone, length });
    
    try {
      const result = await generatePitch(selectedLead, audit, pitchFocus, tone, length);
      setPitch(result);
    } catch (err: any) {
      setError('Pitch generation failed.');
    } finally {
      setLoading(prev => ({ ...prev, pitch: false }));
    }
  }, [selectedLead, audit]);

  const regeneratePitch = useCallback(() => {
    if (lastPitchConfig) {
        createPitch(lastPitchConfig.focus, lastPitchConfig.tone, lastPitchConfig.length);
    }
  }, [createPitch, lastPitchConfig]);

  const clearSelectedLead = useCallback(() => {
    setSelectedLead(null);
    setAudit(null);
    setPitch(null);
    setLastPitchConfig(null);
    setError(null);
  }, []);

  return {
    leads,
    selectedLead,
    audit,
    pitch,
    loading,
    error,
    setError,
    setSelectedLead,
    performSearch,
    performAudit,
    createPitch,
    regeneratePitch,
    clearSelectedLead
  };
}
