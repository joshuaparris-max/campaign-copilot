import { useState, useEffect } from 'react';
import { saveQuests, loadQuests } from '../storage';
import type { Quest } from '../types';

export function QuestTracker() {
  const [quests, setQuests] = useState<Quest[]>(loadQuests());
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestLocation, setNewQuestLocation] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    saveQuests(quests);
  }, [quests]);

  const handleAddQuest = () => {
    if (!newQuestTitle.trim()) return;

    const quest: Quest = {
      id: Date.now().toString(),
      title: newQuestTitle,
      location: newQuestLocation || 'Unknown',
      status: 'Open',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setQuests([...quests, quest]);
    setNewQuestTitle('');
    setNewQuestLocation('');
    setShowAddForm(false);
  };

  const handleToggleStatus = (questId: string) => {
    setQuests(quests.map(quest => {
      if (quest.id === questId) {
        const statusOrder: Quest['status'][] = ['Open', 'In Progress', 'Resolved'];
        const currentIndex = statusOrder.indexOf(quest.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        return { ...quest, status: nextStatus, updatedAt: Date.now() };
      }
      return quest;
    }));
  };

  const handleDeleteQuest = (questId: string) => {
    if (confirm('Delete this quest?')) {
      setQuests(quests.filter(q => q.id !== questId));
    }
  };

  const filteredQuests = filterLocation
    ? quests.filter(q => q.location.toLowerCase().includes(filterLocation.toLowerCase()))
    : quests;

  const statusColors = {
    'Open': 'bg-green-600',
    'In Progress': 'bg-yellow-600',
    'Resolved': 'bg-gray-600'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">Quests & Rumours</h2>

      {/* Filter */}
      <div>
        <input
          type="text"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          placeholder="Filter by location..."
          className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Add Quest Form */}
      {showAddForm ? (
        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
          <input
            type="text"
            value={newQuestTitle}
            onChange={(e) => setNewQuestTitle(e.target.value)}
            placeholder="Quest title..."
            className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAddQuest()}
            autoFocus
          />
          <input
            type="text"
            value={newQuestLocation}
            onChange={(e) => setNewQuestLocation(e.target.value)}
            placeholder="Location (optional)..."
            className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAddQuest()}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddQuest}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Add Quest
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewQuestTitle('');
                setNewQuestLocation('');
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-lg"
        >
          Add Quest
        </button>
      )}

      {/* Quest List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredQuests.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No quests yet. Add one to get started!</p>
        ) : (
          filteredQuests.map(quest => (
            <div
              key={quest.id}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-100 flex-1">{quest.title}</h3>
                <button
                  onClick={() => handleDeleteQuest(quest.id)}
                  className="text-red-400 hover:text-red-300 ml-2"
                  title="Delete quest"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-2">📍 {quest.location}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(quest.id)}
                  className={`px-3 py-1 rounded text-sm font-medium text-white ${statusColors[quest.status]}`}
                >
                  {quest.status}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
