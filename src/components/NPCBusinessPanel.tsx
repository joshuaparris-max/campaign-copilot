import { useState, useEffect } from 'react';
import { saveNPCs, loadNPCs, saveBusinessIdeas, loadBusinessIdeas } from '../storage';
import type { NPC, BusinessIdea } from '../types';

export function NPCBusinessPanel() {
  const [npcs, setNPCs] = useState<NPC[]>(loadNPCs());
  const [businessIdeas, setBusinessIdeas] = useState<BusinessIdea[]>(loadBusinessIdeas());
  const [activeTab, setActiveTab] = useState<'npcs' | 'business'>('npcs');
  const [showNPCForm, setShowNPCForm] = useState(false);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [newNPC, setNewNPC] = useState({ name: '', role: '', location: '', notes: '' });
  const [newBusiness, setNewBusiness] = useState({ title: '', location: '', description: '' });

  useEffect(() => {
    saveNPCs(npcs);
  }, [npcs]);

  useEffect(() => {
    saveBusinessIdeas(businessIdeas);
  }, [businessIdeas]);

  const handleAddNPC = () => {
    if (!newNPC.name.trim()) return;

    const npc: NPC = {
      id: Date.now().toString(),
      name: newNPC.name,
      role: newNPC.role || 'Unknown',
      location: newNPC.location || 'Unknown',
      notes: newNPC.notes,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setNPCs([...npcs, npc]);
    setNewNPC({ name: '', role: '', location: '', notes: '' });
    setShowNPCForm(false);
  };

  const handleAddBusiness = () => {
    if (!newBusiness.title.trim()) return;

    const business: BusinessIdea = {
      id: Date.now().toString(),
      title: newBusiness.title,
      location: newBusiness.location || 'Unknown',
      description: newBusiness.description,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setBusinessIdeas([...businessIdeas, business]);
    setNewBusiness({ title: '', location: '', description: '' });
    setShowBusinessForm(false);
  };

  const handleDeleteNPC = (id: string) => {
    if (confirm('Delete this NPC?')) {
      setNPCs(npcs.filter(n => n.id !== id));
    }
  };

  const handleDeleteBusiness = (id: string) => {
    if (confirm('Delete this business idea?')) {
      setBusinessIdeas(businessIdeas.filter(b => b.id !== id));
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">NPCs & Business</h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('npcs')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'npcs'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          NPCs
        </button>
        <button
          onClick={() => setActiveTab('business')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'business'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Business Ideas
        </button>
      </div>

      {/* NPCs Tab */}
      {activeTab === 'npcs' && (
        <div className="space-y-4">
          {showNPCForm ? (
            <div className="bg-gray-700 rounded-lg p-4 space-y-3">
              <input
                type="text"
                value={newNPC.name}
                onChange={(e) => setNewNPC({ ...newNPC, name: e.target.value })}
                placeholder="NPC name..."
                className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <input
                type="text"
                value={newNPC.role}
                onChange={(e) => setNewNPC({ ...newNPC, role: e.target.value })}
                placeholder="Role (e.g. Guard Captain, Tavern Owner)..."
                className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={newNPC.location}
                onChange={(e) => setNewNPC({ ...newNPC, location: e.target.value })}
                placeholder="Location..."
                className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={newNPC.notes}
                onChange={(e) => setNewNPC({ ...newNPC, notes: e.target.value })}
                placeholder="Notes (optional)..."
                rows={2}
                className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddNPC}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Add NPC
                </button>
                <button
                  onClick={() => {
                    setShowNPCForm(false);
                    setNewNPC({ name: '', role: '', location: '', notes: '' });
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNPCForm(true)}
              className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              Add NPC
            </button>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {npcs.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No NPCs yet. Add one to get started!</p>
            ) : (
              npcs.map(npc => (
                <div key={npc.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-100">{npc.name}</h3>
                      <p className="text-sm text-gray-400">{npc.role}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteNPC(npc.id)}
                      className="text-red-400 hover:text-red-300 ml-2"
                      title="Delete NPC"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">📍 {npc.location}</p>
                  {npc.notes && (
                    <p className="text-sm text-gray-300 mt-2">{npc.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Business Ideas Tab */}
      {activeTab === 'business' && (
        <div className="space-y-4">
          {showBusinessForm ? (
            <div className="bg-gray-700 rounded-lg p-4 space-y-3">
              <input
                type="text"
                value={newBusiness.title}
                onChange={(e) => setNewBusiness({ ...newBusiness, title: e.target.value })}
                placeholder="Business idea title..."
                className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <input
                type="text"
                value={newBusiness.location}
                onChange={(e) => setNewBusiness({ ...newBusiness, location: e.target.value })}
                placeholder="Location..."
                className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={newBusiness.description}
                onChange={(e) => setNewBusiness({ ...newBusiness, description: e.target.value })}
                placeholder="Description (optional)..."
                rows={3}
                className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddBusiness}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Add Business Idea
                </button>
                <button
                  onClick={() => {
                    setShowBusinessForm(false);
                    setNewBusiness({ title: '', location: '', description: '' });
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowBusinessForm(true)}
              className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              Add Business Idea
            </button>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {businessIdeas.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No business ideas yet. Add one to get started!</p>
            ) : (
              businessIdeas.map(business => (
                <div key={business.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-100">{business.title}</h3>
                    </div>
                    <button
                      onClick={() => handleDeleteBusiness(business.id)}
                      className="text-red-400 hover:text-red-300 ml-2"
                      title="Delete business idea"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">📍 {business.location}</p>
                  {business.description && (
                    <p className="text-sm text-gray-300 mt-2">{business.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
