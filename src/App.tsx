import { SessionPanel } from './components/SessionPanel';
import { QuestTracker } from './components/QuestTracker';
import { NPCBusinessPanel } from './components/NPCBusinessPanel';
import { LeadsPanel } from './components/LeadsPanel';
import { CharacterPanel } from './components/CharacterPanel';
import { SessionTimeline } from './components/SessionTimeline';
import { HandoffSummary } from './components/HandoffSummary';
import { CampaignSwitcher } from './components/CampaignSwitcher';
import { RulesReferencePanel } from './components/RulesReferencePanel';
import { CampaignProvider } from './contexts/CampaignContext';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <ToastProvider>
      <CampaignProvider>
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="min-h-screen bg-gray-900 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-6">
              <h1 className="text-4xl font-bold text-gray-100 mb-2">Campaign Copilot</h1>
              <p className="text-gray-400">Your D&D 5e session assistant</p>
            </header>

            {/* Main Layout: Four Panels */}
            <main id="main-content" className="space-y-6">
              {/* Campaign Switcher */}
              <CampaignSwitcher />
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Panel: Quest Tracker & Leads (on mobile, appears second) */}
                <div className="lg:order-1 order-2 space-y-6">
                  <QuestTracker />
                  <LeadsPanel />
                </div>

                {/* Center-Left Panel: Character (on mobile, appears fourth) */}
                <div className="lg:order-2 order-4">
                  <CharacterPanel />
                </div>

                {/* Center Panel: Session Input & AI (on mobile, appears first) */}
                <div className="lg:order-3 order-1">
                  <SessionPanel />
                </div>

                {/* Right Panel: NPC & Business (on mobile, appears third) */}
                <div className="lg:order-4 order-3">
                  <NPCBusinessPanel />
                </div>
              </div>

              {/* Timeline and Handoff Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SessionTimeline />
                <HandoffSummary />
              </div>

              <RulesReferencePanel />
            </main>
          </div>
        </div>
      </CampaignProvider>
    </ToastProvider>
  );
}

export default App;
