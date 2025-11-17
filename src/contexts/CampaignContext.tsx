import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import type { CampaignData } from '../utils/exportData';
import { 
  loadQuests, saveQuests, 
  loadNPCs, saveNPCs, 
  loadBusinessIdeas, saveBusinessIdeas,
  loadHubs, saveHubs,
  loadLeads, saveLeads,
  loadActiveHubId, saveActiveHubId,
  loadCharacterProfile, saveCharacterProfile,
  loadSessionEvents, saveSessionEvents, appendSessionEvent,
  loadCampaigns, saveCampaigns,
  loadActiveCampaignId, saveActiveCampaignId,
  migrateToMultiCampaign
} from '../storage';
import { generateId } from '../utils/id';
import type { Quest, NPC, BusinessIdea, Hub, Lead, CharacterProfile, SessionEvent, Campaign } from '../types';

interface CampaignContextType {
  // Campaign management
  campaigns: Campaign[];
  activeCampaignId: string | null;
  activeCampaign: Campaign | null;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => Campaign;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  setActiveCampaignId: (campaignId: string | null) => void;
  // Filtered entities (by activeCampaignId)
  quests: Quest[];
  npcs: NPC[];
  businessIdeas: BusinessIdea[];
  hubs: Hub[];
  leads: Lead[];
  activeHubId: string | null;
  characterProfile: CharacterProfile | null;
  sessionEvents: SessionEvent[];
  // Entity methods
  addQuest: (quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt' | 'campaignId'>) => Quest;
  updateQuest: (id: string, updates: Partial<Quest>) => void;
  deleteQuest: (id: string) => void;
  addNPC: (npc: Omit<NPC, 'id' | 'createdAt' | 'updatedAt' | 'campaignId'>) => NPC;
  updateNPC: (id: string, updates: Partial<NPC>) => void;
  deleteNPC: (id: string) => void;
  addBusinessIdea: (business: Omit<BusinessIdea, 'id' | 'createdAt' | 'updatedAt' | 'campaignId'>) => BusinessIdea;
  updateBusinessIdea: (id: string, updates: Partial<BusinessIdea>) => void;
  deleteBusinessIdea: (id: string) => void;
  addHub: (hub: Omit<Hub, 'id' | 'createdAt' | 'updatedAt' | 'campaignId'>) => Hub;
  updateHub: (id: string, updates: Partial<Hub>) => void;
  deleteHub: (id: string) => void;
  setActiveHubId: (hubId: string | null) => void;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'campaignId'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  loadSeahavenSeed: () => Promise<void>;
  setCharacterProfile: (profile: CharacterProfile | null) => void;
  addSessionEvent: (event: Omit<SessionEvent, 'id' | 'createdAt' | 'campaignId'>) => SessionEvent;
  updateSessionEvent: (id: string, updates: Partial<SessionEvent>) => void;
  deleteSessionEvent: (id: string) => void;
  importData: (data: CampaignData, mode?: 'merge' | 'overwrite') => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: ReactNode }) {
  // All data (not filtered)
  const [allQuests, setAllQuests] = useState<Quest[]>([]);
  const [allNPCs, setAllNPCs] = useState<NPC[]>([]);
  const [allBusinessIdeas, setAllBusinessIdeas] = useState<BusinessIdea[]>([]);
  const [allHubs, setAllHubs] = useState<Hub[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [allSessionEvents, setAllSessionEvents] = useState<SessionEvent[]>([]);
  
  // Campaign state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignIdState] = useState<string | null>(null);
  const [activeHubId, setActiveHubIdState] = useState<string | null>(null);
  const [characterProfile, setCharacterProfileState] = useState<CharacterProfile | null>(null);

  // Run migration on mount
  useEffect(() => {
    const migratedCampaignId = migrateToMultiCampaign();
    const loadedCampaigns = loadCampaigns();
    const loadedActiveCampaignId = loadActiveCampaignId() || migratedCampaignId;
    
    setCampaigns(loadedCampaigns);
    setActiveCampaignIdState(loadedActiveCampaignId);
    
    // Load all data
    setAllQuests(loadQuests());
    setAllNPCs(loadNPCs());
    setAllBusinessIdeas(loadBusinessIdeas());
    setAllHubs(loadHubs());
    setAllLeads(loadLeads());
    setActiveHubIdState(loadActiveHubId());
    setCharacterProfileState(loadCharacterProfile());
    setAllSessionEvents(loadSessionEvents());
  }, []);

  // Filter entities by activeCampaignId
  const quests = useMemo(() => 
    activeCampaignId ? allQuests.filter(q => q.campaignId === activeCampaignId) : [],
    [allQuests, activeCampaignId]
  );
  const npcs = useMemo(() => 
    activeCampaignId ? allNPCs.filter(n => n.campaignId === activeCampaignId) : [],
    [allNPCs, activeCampaignId]
  );
  const businessIdeas = useMemo(() => 
    activeCampaignId ? allBusinessIdeas.filter(b => b.campaignId === activeCampaignId) : [],
    [allBusinessIdeas, activeCampaignId]
  );
  const hubs = useMemo(() => 
    activeCampaignId ? allHubs.filter(h => h.campaignId === activeCampaignId) : [],
    [allHubs, activeCampaignId]
  );
  const leads = useMemo(() => 
    activeCampaignId ? allLeads.filter(l => l.campaignId === activeCampaignId) : [],
    [allLeads, activeCampaignId]
  );
  const sessionEvents = useMemo(() => 
    activeCampaignId ? allSessionEvents.filter(e => e.campaignId === activeCampaignId) : [],
    [allSessionEvents, activeCampaignId]
  );
  const activeCampaign = useMemo(() => 
    activeCampaignId ? campaigns.find(c => c.id === activeCampaignId) || null : null,
    [campaigns, activeCampaignId]
  );

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveCampaigns(campaigns);
  }, [campaigns]);

  useEffect(() => {
    saveActiveCampaignId(activeCampaignId);
  }, [activeCampaignId]);

  useEffect(() => {
    saveQuests(allQuests);
  }, [allQuests]);

  useEffect(() => {
    saveNPCs(allNPCs);
  }, [allNPCs]);

  useEffect(() => {
    saveBusinessIdeas(allBusinessIdeas);
  }, [allBusinessIdeas]);

  useEffect(() => {
    saveHubs(allHubs);
  }, [allHubs]);

  useEffect(() => {
    saveLeads(allLeads);
  }, [allLeads]);

  useEffect(() => {
    saveActiveHubId(activeHubId);
  }, [activeHubId]);

  useEffect(() => {
    saveCharacterProfile(characterProfile);
  }, [characterProfile]);

  useEffect(() => {
    saveSessionEvents(allSessionEvents);
  }, [allSessionEvents]);

  // Campaign methods
  const addCampaign = (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Campaign => {
    const now = Date.now();
    const campaign: Campaign = {
      ...campaignData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setCampaigns(prev => [...prev, campaign]);
    return campaign;
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev =>
      prev.map(campaign =>
        campaign.id === id
          ? { ...campaign, ...updates, updatedAt: Date.now() }
          : campaign
      )
    );
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    // If deleting active campaign, switch to first available or null
    if (activeCampaignId === id) {
      const remaining = campaigns.filter(c => c.id !== id);
      setActiveCampaignIdState(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const setActiveCampaignId = (campaignId: string | null) => {
    setActiveCampaignIdState(campaignId);
  };

  // Quest methods
  const addQuest = (questData: Omit<Quest, 'id' | 'createdAt' | 'updatedAt' | 'campaignId'>): Quest => {
    if (!activeCampaignId) {
      throw new Error('No active campaign. Please select or create a campaign first.');
    }
    const now = Date.now();
    const quest: Quest = {
      ...questData,
      campaignId: activeCampaignId,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setAllQuests(prev => [...prev, quest]);
    return quest;
  };

  const updateQuest = (id: string, updates: Partial<Quest>) => {
    setAllQuests(prev =>
      prev.map(quest =>
        quest.id === id
          ? { ...quest, ...updates, updatedAt: Date.now() }
          : quest
      )
    );
  };

  const deleteQuest = (id: string) => {
    setAllQuests(prev => prev.filter(q => q.id !== id));
  };

  // NPC methods
  const addNPC = (npcData: Omit<NPC, 'id' | 'createdAt' | 'updatedAt' | 'campaignId'>): NPC => {
    if (!activeCampaignId) {
      throw new Error('No active campaign. Please select or create a campaign first.');
    }
    const now = Date.now();
    const npc: NPC = {
      ...npcData,
      campaignId: activeCampaignId,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setAllNPCs(prev => [...prev, npc]);
    return npc;
  };

  const updateNPC = (id: string, updates: Partial<NPC>) => {
    setAllNPCs(prev =>
      prev.map(npc =>
        npc.id === id
          ? { ...npc, ...updates, updatedAt: Date.now() }
          : npc
      )
    );
  };

  const deleteNPC = (id: string) => {
    setAllNPCs(prev => prev.filter(n => n.id !== id));
  };

  // Business Idea methods
  const addBusinessIdea = (businessData: Omit<BusinessIdea, 'id' | 'createdAt' | 'updatedAt' | 'campaignId'>): BusinessIdea => {
    if (!activeCampaignId) {
      throw new Error('No active campaign. Please select or create a campaign first.');
    }
    const now = Date.now();
    const business: BusinessIdea = {
      ...businessData,
      campaignId: activeCampaignId,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setAllBusinessIdeas(prev => [...prev, business]);
    return business;
  };

  const updateBusinessIdea = (id: string, updates: Partial<BusinessIdea>) => {
    setAllBusinessIdeas(prev =>
      prev.map(business =>
        business.id === id
          ? { ...business, ...updates, updatedAt: Date.now() }
          : business
      )
    );
  };

  const deleteBusinessIdea = (id: string) => {
    setAllBusinessIdeas(prev => prev.filter(b => b.id !== id));
  };

  // Hub methods
  const addHub = (hubData: Omit<Hub, 'id' | 'createdAt' | 'updatedAt' | 'campaignId'>): Hub => {
    if (!activeCampaignId) {
      throw new Error('No active campaign. Please select or create a campaign first.');
    }
    const now = Date.now();
    const hub: Hub = {
      ...hubData,
      campaignId: activeCampaignId,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setAllHubs(prev => [...prev, hub]);
    return hub;
  };

  const updateHub = (id: string, updates: Partial<Hub>) => {
    setAllHubs(prev =>
      prev.map(hub =>
        hub.id === id
          ? { ...hub, ...updates, updatedAt: Date.now() }
          : hub
      )
    );
  };

  const deleteHub = (id: string) => {
    setAllHubs(prev => prev.filter(h => h.id !== id));
  };

  const setActiveHubId = (hubId: string | null) => {
    setActiveHubIdState(hubId);
  };

  // Lead methods
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'campaignId'>): Lead => {
    if (!activeCampaignId) {
      throw new Error('No active campaign. Please select or create a campaign first.');
    }
    const now = Date.now();
    const lead: Lead = {
      ...leadData,
      campaignId: activeCampaignId,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setAllLeads(prev => [...prev, lead]);
    return lead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setAllLeads(prev =>
      prev.map(lead =>
        lead.id === id
          ? { ...lead, ...updates, updatedAt: Date.now() }
          : lead
      )
    );
  };

  const deleteLead = (id: string) => {
    setAllLeads(prev => prev.filter(l => l.id !== id));
  };

  // Load Seahaven seed data
  const loadSeahavenSeed = async () => {
    if (!activeCampaignId) {
      throw new Error('No active campaign. Please select or create a campaign first.');
    }
    try {
      // Dynamic import to avoid circular dependencies
      const { loadSeahavenSeed: loadSeed } = await import('../seeds/seahaven');
      const seed = loadSeed();
    
      // Add campaignId to seed data
      const hubWithCampaign = { ...seed.hub, campaignId: activeCampaignId };
      const npcsWithCampaign = seed.npcs.map(n => ({ ...n, campaignId: activeCampaignId }));
      const questsWithCampaign = seed.quests.map(q => ({ ...q, campaignId: activeCampaignId }));
      const leadsWithCampaign = seed.leads.map(l => ({ ...l, campaignId: activeCampaignId }));
    
      // Check if hub already exists
      const existingHub = allHubs.find(h => h.id === hubWithCampaign.id);
      if (!existingHub) {
        setAllHubs(prev => [...prev, hubWithCampaign]);
      }
      
      // Merge NPCs (avoid duplicates by name)
      npcsWithCampaign.forEach(npc => {
        const existing = allNPCs.find(n => n.name === npc.name && n.hubId === npc.hubId && n.campaignId === npc.campaignId);
        if (!existing) {
          setAllNPCs(prev => [...prev, npc]);
        }
      });
      
      // Merge quests (avoid duplicates by title)
      questsWithCampaign.forEach(quest => {
        const existing = allQuests.find(q => q.title === quest.title && q.hubId === quest.hubId && q.campaignId === quest.campaignId);
        if (!existing) {
          setAllQuests(prev => [...prev, quest]);
        }
      });
      
      // Merge leads (avoid duplicates by title)
      leadsWithCampaign.forEach(lead => {
        const existing = allLeads.find(l => l.title === lead.title && l.hubId === lead.hubId && l.campaignId === lead.campaignId);
        if (!existing) {
          setAllLeads(prev => [...prev, lead]);
        }
      });
      
    // Set active hub to Seahaven
    setActiveHubIdState(hubWithCampaign.id);
    } catch (error) {
      console.error('Error loading Seahaven seed:', error);
      throw error;
    }
  };

  const setCharacterProfile = (profile: CharacterProfile | null) => {
    if (!profile) {
      setCharacterProfileState(null);
      return;
    }

    // Ensure the character profile is associated with the active campaign when available
    const normalized: CharacterProfile = {
      ...profile,
      campaignId: profile.campaignId || activeCampaignId || undefined,
      updatedAt: Date.now(),
      createdAt: profile.createdAt || Date.now(),
    } as CharacterProfile;

    setCharacterProfileState(normalized);
  };

  // Import full campaign data into context (applies and persists)
  const importData = (data: CampaignData, mode: 'merge' | 'overwrite' = 'overwrite') => {
    try {
      const campaign = data.campaign;
      const cid = campaign.id;
      const importedQuests = (data.quests || []).map(q => ({ ...q, campaignId: cid }));
      const importedNPCs = (data.npcs || []).map(n => ({ ...n, campaignId: cid }));
      const importedBusiness = (data.businessIdeas || []).map(b => ({ ...b, campaignId: cid }));
      const importedHubs = (data.hubs || []).map(h => ({ ...h, campaignId: cid }));
      const importedLeads = (data.leads || []).map(l => ({ ...l, campaignId: cid }));
      const importedEvents = (data.sessionEvents || []).map(e => ({ ...e, campaignId: cid }));
      const importedCharacter = data.characterProfile ? { ...data.characterProfile, campaignId: cid } : null;

      if (mode === 'overwrite') {
        // Replace everything with imported campaign
        setCampaigns([campaign]);
        setAllQuests(importedQuests);
        setAllNPCs(importedNPCs);
        setAllBusinessIdeas(importedBusiness);
        setAllHubs(importedHubs);
        setAllLeads(importedLeads);
        setAllSessionEvents(importedEvents);
        setCharacterProfileState(importedCharacter);
        setActiveHubIdState(importedHubs && importedHubs.length > 0 ? importedHubs[0].id : null);
        setActiveCampaignIdState(cid);
      } else {
        // Merge: append imported items to existing collections (IDs should be resolved beforehand)
        setCampaigns(prev => {
          const exists = prev.some(c => c.id === campaign.id);
          return exists ? prev : [...prev, campaign];
        });

        setAllQuests(prev => [...prev, ...importedQuests]);
        setAllNPCs(prev => [...prev, ...importedNPCs]);
        setAllBusinessIdeas(prev => [...prev, ...importedBusiness]);
        setAllHubs(prev => [...prev, ...importedHubs]);
        setAllLeads(prev => [...prev, ...importedLeads]);
        setAllSessionEvents(prev => [...prev, ...importedEvents]);
        if (importedCharacter) {
          // prefer existing character if IDs differ; add or replace based on id
          setCharacterProfileState(prev => {
            if (!prev) return importedCharacter;
            if (prev.id === importedCharacter.id) return importedCharacter;
            // keep existing profile but do not overwrite by default
            return prev;
          });
        }

        // Activate imported campaign
        setActiveCampaignIdState(cid);
        setActiveHubIdState(importedHubs && importedHubs.length > 0 ? importedHubs[0].id : activeHubId);
      }

      // Persist migration flag so migration routine won't overwrite imported data
      try {
        localStorage.setItem('campaign-copilot-migration-v0.5', JSON.stringify(true));
      } catch (err) {
        console.warn('Could not set migration flag in localStorage', err);
      }
    } catch (err) {
      console.error('Error importing campaign data into context:', err);
      throw err;
    }
  };

  // Session Event methods
  const addSessionEvent = (eventData: Omit<SessionEvent, 'id' | 'createdAt' | 'campaignId'>): SessionEvent => {
    if (!activeCampaignId) {
      throw new Error('No active campaign. Please select or create a campaign first.');
    }
    const event: SessionEvent = {
      ...eventData,
      campaignId: activeCampaignId,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    appendSessionEvent(event);
    setAllSessionEvents(prev => [event, ...prev].slice(0, 200));
    return event;
  };

  const updateSessionEvent = (id: string, updates: Partial<SessionEvent>) => {
    setAllSessionEvents(prev =>
      prev.map(event =>
        event.id === id ? { ...event, ...updates } : event
      )
    );
  };

  const deleteSessionEvent = (id: string) => {
    setAllSessionEvents(prev => prev.filter(e => e.id !== id));
  };

  const value: CampaignContextType = {
    campaigns,
    activeCampaignId,
    activeCampaign,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    setActiveCampaignId,
    quests,
    npcs,
    businessIdeas,
    hubs,
    leads,
    activeHubId,
    addQuest,
    updateQuest,
    deleteQuest,
    addNPC,
    updateNPC,
    deleteNPC,
    addBusinessIdea,
    updateBusinessIdea,
    deleteBusinessIdea,
    addHub,
    updateHub,
    deleteHub,
    setActiveHubId,
    addLead,
    updateLead,
    deleteLead,
    loadSeahavenSeed,
    characterProfile,
    setCharacterProfile,
    sessionEvents,
    addSessionEvent,
    updateSessionEvent,
    deleteSessionEvent,
    importData,
  };

  return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>;
}

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
}

