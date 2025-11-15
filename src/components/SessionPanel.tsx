import { useState } from 'react';
import { getNextOptions } from '../aiClient';
import { saveSessionNote, saveCurrentLocation, loadCurrentLocation } from '../storage';
import type { NextOption, SessionContext, Quest, NPC } from '../types';

interface SessionPanelProps {
  openQuests: Quest[];
  npcs: NPC[];
}

export function SessionPanel({ openQuests, npcs }: SessionPanelProps) {
  const [sessionText, setSessionText] = useState('');
  const [currentLocation, setCurrentLocation] = useState(loadCurrentLocation());
  const [suggestions, setSuggestions] = useState<NextOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuggestOptions = async () => {
    if (!sessionText.trim()) return;

    setIsLoading(true);
    try {
      // Save session note
      saveSessionNote({
        id: Date.now().toString(),
        text: sessionText,
        location: currentLocation,
        timestamp: Date.now()
      });

      // Get suggestions
      const ctx: SessionContext = {
        text: sessionText,
        currentLocationName: currentLocation,
        openQuests: openQuests.filter(q => q.status !== 'Resolved'),
        npcs
      };

      const options = await getNextOptions(ctx);
      setSuggestions(options);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = (location: string) => {
    setCurrentLocation(location);
    saveCurrentLocation(location);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">Session Brain</h2>
      
      {/* Location Input */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
          Current Location
        </label>
        <input
          id="location"
          type="text"
          value={currentLocation}
          onChange={(e) => handleLocationChange(e.target.value)}
          placeholder="e.g. Seahaven, Grove Village, Two Weeks at Sea"
          className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Session Text Input */}
      <div>
        <label htmlFor="session-text" className="block text-sm font-medium text-gray-300 mb-2">
          What just happened?
        </label>
        <textarea
          id="session-text"
          value={sessionText}
          onChange={(e) => setSessionText(e.target.value)}
          placeholder="Describe the most recent development or situation..."
          rows={6}
          className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        />
      </div>

      {/* Suggest Button */}
      <button
        onClick={handleSuggestOptions}
        disabled={isLoading || !sessionText.trim()}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
      >
        {isLoading ? 'Thinking...' : 'Suggest Next 3 Options'}
      </button>

      {/* Suggestions Output */}
      {suggestions.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-semibold text-gray-200">Suggestions:</h3>
          {suggestions.map((option, idx) => (
            <div key={option.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <h4 className="text-lg font-semibold text-blue-400 mb-2">
                {idx + 1}. {option.title}
              </h4>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {option.bullets.map((bullet, bulletIdx) => (
                  <li key={bulletIdx}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
