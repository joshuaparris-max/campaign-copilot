import { useState, useEffect } from 'react';
import { SessionPanel } from './components/SessionPanel';
import { QuestTracker } from './components/QuestTracker';
import { NPCBusinessPanel } from './components/NPCBusinessPanel';
import { loadQuests, loadNPCs } from './storage';
import type { Quest, NPC } from './types';

function App() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [npcs, setNPCs] = useState<NPC[]>([]);

  useEffect(() => {
    // Load data from localStorage on mount
    setQuests(loadQuests());
    setNPCs(loadNPCs());
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">Campaign Copilot</h1>
          <p className="text-gray-400">Your D&D 5e session assistant</p>
        </header>

        {/* Main Layout: Three Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Quest Tracker (on mobile, appears second) */}
          <div className="lg:order-1 order-2">
            <QuestTracker />
          </div>

          {/* Center Panel: Session Input & AI (on mobile, appears first) */}
          <div className="lg:order-2 order-1">
            <SessionPanel openQuests={quests} npcs={npcs} />
          </div>

          {/* Right Panel: NPC & Business (on mobile, appears third) */}
          <div className="lg:order-3 order-3">
            <NPCBusinessPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
