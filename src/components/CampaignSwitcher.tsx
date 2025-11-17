import { useState, useRef } from 'react';
import { useCampaign } from '../contexts/CampaignContext';
import { useToast } from '../contexts/ToastContext';
import { exportCampaignData, importCampaignData, downloadData } from '../utils/exportData';
import type { CampaignData } from '../utils/exportData';
import { validateCampaignData, computeConflicts, resolveMerge } from '../utils/importUtils';
import {
  saveCampaigns,
  saveQuests,
  saveNPCs,
  saveBusinessIdeas,
  saveHubs,
  saveLeads,
  saveSessionEvents,
  saveCharacterProfile,
  saveActiveCampaignId,
  saveCurrentLocation,
  loadSessionNotes,
  loadCurrentLocation,
} from '../storage';

export function CampaignSwitcher() {
  const { 
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
    characterProfile,
    sessionEvents,
    importData,
  } = useCampaign();
  const { showSuccess, showError } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDescription, setNewCampaignDescription] = useState('');
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importPreview, setImportPreview] = useState<CampaignData | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>('merge');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [conflictSummary, setConflictSummary] = useState<any>(null);

  const handleCreateCampaign = () => {
    if (!newCampaignName.trim()) {
      showError('Campaign name is required');
      return;
    }

    try {
      const campaign = addCampaign({
        name: newCampaignName.trim(),
        description: newCampaignDescription.trim() || undefined,
      });
      setActiveCampaignId(campaign.id);
      setNewCampaignName('');
      setNewCampaignDescription('');
      setIsCreating(false);
      showSuccess(`Campaign "${campaign.name}" created and activated`);
    } catch (error) {
      showError('Failed to create campaign');
      console.error('Error creating campaign:', error);
    }
  };

  const handleStartEdit = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      setIsEditing(campaignId);
      setEditingName(campaign.name);
      setEditingDescription(campaign.description || '');
    }
  };

  const handleSaveEdit = (campaignId: string) => {
    if (!editingName.trim()) {
      showError('Campaign name is required');
      return;
    }

    try {
      updateCampaign(campaignId, {
        name: editingName.trim(),
        description: editingDescription.trim() || undefined,
      });
      setIsEditing(null);
      showSuccess('Campaign updated');
    } catch (error) {
      showError('Failed to update campaign');
      console.error('Error updating campaign:', error);
    }
  };

  const handleDeleteCampaign = (campaignId: string) => {
    if (!window.confirm(`Delete campaign "${campaigns.find(c => c.id === campaignId)?.name}"? This will delete all quests, NPCs, leads, and events in this campaign.`)) {
      return;
    }

    try {
      deleteCampaign(campaignId);
      showSuccess('Campaign deleted');
    } catch (error) {
      showError('Failed to delete campaign');
      console.error('Error deleting campaign:', error);
    }
  };

  const handleExport = () => {
    if (!activeCampaign || !activeCampaignId) {
      showError('No active campaign to export');
      return;
    }

    try {
      const sessionNotes = loadSessionNotes();
      const currentLocation = loadCurrentLocation();
      const json = exportCampaignData(
        activeCampaign,
        quests,
        npcs,
        businessIdeas,
        sessionNotes,
        sessionEvents,
        hubs,
        leads,
        characterProfile || undefined,
        currentLocation || ''
      );
      const safeName = (activeCampaign.name || 'campaign').replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
      const filename = `${safeName}-${Date.now()}.json`;
      downloadData(json, filename);
      showSuccess('Export started — check your downloads folder');
    } catch (error) {
      console.error('Export failed:', error);
      showError('Failed to export campaign');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = String(ev.target?.result || '');
        const imported = importCampaignData(text);
        if (!imported) {
          showError('Failed to parse import file');
          return;
        }

        const validation = validateCampaignData(imported as unknown);
        setValidationErrors(validation.errors);
        setValidationWarnings(validation.warnings);

        const conflicts = computeConflicts(imported);
        setConflictSummary(conflicts);

        setImportPreview(imported);
        setPreviewFilename(file.name);
      } catch (error) {
        console.error('Import parse error:', error);
        showError('Failed to parse import file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const cancelImportPreview = () => {
    setImportPreview(null);
    setPreviewFilename(null);
  };

  const confirmImport = () => {
    const imported = importPreview;
    if (!imported) return;

    try {
      if (validationErrors && validationErrors.length > 0) {
        showError('Import file has errors — fix them before importing');
        return;
      }
      // Apply import directly into context (this persists via context effects)
      if (importData) {
        if (importMode === 'merge') {
          const merged = resolveMerge(imported);
          importData(merged as CampaignData, 'merge');
          showSuccess('Import merged successfully');
          setImportPreview(null);
          setPreviewFilename(null);
          return;
        }
        // overwrite
        importData(imported, 'overwrite');
        showSuccess('Import applied');
        setImportPreview(null);
        setPreviewFilename(null);
        return;
      }

      // Fallback to legacy behavior: persist directly and reload
      const campaignId = imported.campaign.id;

      const questsToSave = imported.quests.map(q => ({ ...q, campaignId }));
      const npcsToSave = imported.npcs.map(n => ({ ...n, campaignId }));
      const businessToSave = imported.businessIdeas.map(b => ({ ...b, campaignId }));
      const hubsToSave = imported.hubs.map(h => ({ ...h, campaignId }));
      const leadsToSave = imported.leads.map(l => ({ ...l, campaignId }));
      const eventsToSave = imported.sessionEvents.map(ev2 => ({ ...ev2, campaignId }));
      const characterToSave = imported.characterProfile ? { ...imported.characterProfile, campaignId } : null;

      saveCampaigns([imported.campaign]);
      saveQuests(questsToSave);
      saveNPCs(npcsToSave);
      saveBusinessIdeas(businessToSave);
      saveHubs(hubsToSave);
      saveLeads(leadsToSave);
      saveSessionEvents(eventsToSave);
      if (characterToSave) saveCharacterProfile(characterToSave);
      saveActiveCampaignId(campaignId);
      saveCurrentLocation(imported.currentLocation || '');

      try {
        localStorage.setItem('campaign-copilot-migration-v0.5', 'true');
      } catch (err) {
        console.warn('Could not set migration flag in localStorage', err);
      }

      showSuccess('Import applied — reloading to apply data');
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      console.error('Import confirmation error:', error);
      showError('Failed to apply imported data');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-100">Campaigns</h2>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileChange} className="hidden" />
          <button
            onClick={handleImportClick}
            className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
            title="Import campaign from file"
          >
            Import
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
            title="Export active campaign to file"
          >
            Export
          </button>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              + New Campaign
            </button>
          )}
        </div>
      </div>

      {/* Import preview modal */}
      {importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" onClick={cancelImportPreview} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-6 w-11/12 max-w-2xl text-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Import preview</h3>
                {previewFilename && <p className="text-sm text-gray-400">File: {previewFilename}</p>}
                <p className="mt-2 text-sm">Campaign: <span className="font-medium text-gray-200">{importPreview.campaign?.name || importPreview.campaign.id}</span></p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div>Quests: <strong>{importPreview.quests?.length ?? 0}</strong></div>
                <div>NPCs: <strong>{importPreview.npcs?.length ?? 0}</strong></div>
                <div>Business Ideas: <strong>{importPreview.businessIdeas?.length ?? 0}</strong></div>
                <div>Session Events: <strong>{importPreview.sessionEvents?.length ?? 0}</strong></div>
              </div>
              <div className="space-y-1">
                <div>Hubs: <strong>{importPreview.hubs?.length ?? 0}</strong></div>
                <div>Leads: <strong>{importPreview.leads?.length ?? 0}</strong></div>
                <div>Character: <strong>{importPreview.characterProfile?.name || '—'}</strong></div>
                <div>Location: <strong>{importPreview.currentLocation || '—'}</strong></div>
              </div>
            </div>

            {/* Validation errors/warnings */}
            {(validationErrors.length > 0 || validationWarnings.length > 0) && (
              <div className="mt-4 p-3 bg-red-900 bg-opacity-20 border border-red-700 rounded text-sm">
                {validationErrors.length > 0 && (
                  <div className="mb-2">
                    <strong className="text-red-300">Errors:</strong>
                    <ul className="list-disc list-inside">
                      {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}
                {validationWarnings.length > 0 && (
                  <div>
                    <strong className="text-yellow-300">Warnings:</strong>
                    <ul className="list-disc list-inside">
                      {validationWarnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Merge / Overwrite options */}
            <div className="mt-4">
              <label className="inline-flex items-center mr-4">
                <input type="radio" name="importMode" value="merge" checked={importMode === 'merge'} onChange={() => setImportMode('merge')} className="mr-2" />
                Merge (keep existing, rename imported on ID collision)
              </label>
              <label className="inline-flex items-center">
                <input type="radio" name="importMode" value="overwrite" checked={importMode === 'overwrite'} onChange={() => setImportMode('overwrite')} className="mr-2" />
                Overwrite (replace existing with imported)
              </label>
            </div>

            {/* Conflict summary for merge */}
            {importMode === 'merge' && conflictSummary && (
              <div className="mt-3 p-3 bg-gray-800 border border-gray-700 rounded text-sm">
                <div className="font-medium mb-1">Merge conflict summary</div>
                {conflictSummary.details.length === 0 ? (
                  <div className="text-sm text-gray-300">No ID collisions detected — safe to merge.</div>
                ) : (
                  <ul className="list-disc list-inside text-sm text-gray-300">
                    {conflictSummary.details.map((d: string, i: number) => <li key={i}>{d}</li>)}
                  </ul>
                )}
              </div>
            )}

            {/* Quick counts: existing vs imported */}
            <div className="mt-3 p-3 bg-gray-800 border border-gray-700 rounded text-sm">
              <div className="font-medium mb-1">Import summary</div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                <div>
                  <div>Existing:</div>
                  <ul className="list-disc list-inside">
                    <li>Campaigns: <strong>{campaigns.length}</strong></li>
                    <li>Quests: <strong>{quests.length}</strong></li>
                    <li>NPCs: <strong>{npcs.length}</strong></li>
                    <li>Hubs: <strong>{hubs.length}</strong></li>
                    <li>Leads: <strong>{leads.length}</strong></li>
                  </ul>
                </div>
                <div>
                  <div>Imported:</div>
                  <ul className="list-disc list-inside">
                    <li>Campaign: <strong>{importPreview.campaign ? 1 : 0}</strong></li>
                    <li>Quests: <strong>{importPreview.quests?.length ?? 0}</strong></li>
                    <li>NPCs: <strong>{importPreview.npcs?.length ?? 0}</strong></li>
                    <li>Hubs: <strong>{importPreview.hubs?.length ?? 0}</strong></li>
                    <li>Leads: <strong>{importPreview.leads?.length ?? 0}</strong></li>
                  </ul>
                </div>
              </div>
              {importMode === 'merge' && conflictSummary && (
                <div className="mt-2 text-sm text-gray-300">
                  <div>On merge: <strong>{(importPreview.quests?.length ?? 0) + (importPreview.npcs?.length ?? 0) + (importPreview.hubs?.length ?? 0) + (importPreview.leads?.length ?? 0)} items</strong> will be added. {conflictSummary.details.length > 0 ? <span className="text-yellow-300">{conflictSummary.details.length} collisions will be renamed.</span> : null}</div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={cancelImportPreview} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded">Cancel</button>
              <button onClick={confirmImport} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded">Confirm Import</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Form */}
      {isCreating && (
        <div className="mb-4 p-3 bg-gray-700 rounded">
          <input
            type="text"
            placeholder="Campaign name (e.g. 'Pets of the Spider Queen')"
            value={newCampaignName}
            onChange={(e) => setNewCampaignName(e.target.value)}
            className="w-full px-3 py-2 mb-2 bg-gray-800 text-gray-100 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={newCampaignDescription}
            onChange={(e) => setNewCampaignDescription(e.target.value)}
            className="w-full px-3 py-2 mb-2 bg-gray-800 text-gray-100 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateCampaign}
              className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewCampaignName('');
                setNewCampaignDescription('');
              }}
              className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-gray-300 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Campaign List */}
      <div className="space-y-2">
        {campaigns.length === 0 ? (
          <p className="text-gray-400 text-sm">No campaigns yet. Create one to get started!</p>
        ) : (
          campaigns.map((campaign) => {
            const isActive = campaign.id === activeCampaignId;
            const isEditingThis = isEditing === campaign.id;

            return (
              <div
                key={campaign.id}
                className={`p-3 rounded border ${
                  isActive
                    ? 'bg-blue-900 border-blue-600'
                    : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                }`}
              >
                {isEditingThis ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full px-2 py-1 bg-gray-800 text-gray-100 rounded border border-gray-600 text-sm"
                      autoFocus
                    />
                    <textarea
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      className="w-full px-2 py-1 bg-gray-800 text-gray-100 rounded border border-gray-600 text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(campaign.id)}
                        className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(null)}
                        className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveCampaignId(campaign.id)}
                          className={`font-medium text-left ${
                            isActive ? 'text-blue-300' : 'text-gray-200 hover:text-gray-100'
                          }`}
                        >
                          {campaign.name}
                          {isActive && <span className="ml-2 text-xs text-blue-400">(Active)</span>}
                        </button>
                      </div>
                      {campaign.description && (
                        <p className="text-xs text-gray-400 mt-1">{campaign.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartEdit(campaign.id)}
                        className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 rounded"
                        title="Edit campaign"
                      >
                        Edit
                      </button>
                      {campaigns.length > 1 && (
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                          title="Delete campaign"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

