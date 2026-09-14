import React, { useState } from 'react';
import FlipClock from './components/FlipClock';
import PrayerTime from './components/PrayerTime';
import PomodoroTimer from './components/PomodoroTimer';
import { Timer, Clock } from 'lucide-react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('clock'); // 'clock' | 'pomodoro'

  return (
    <div className="app-container">
      <div className="app-header-nav">
        <button
          className={`nav-btn ${activeTab === 'clock' ? 'active' : ''}`}
          onClick={() => setActiveTab('clock')}
          title="Flip Clock & Prayer Times"
        >
          <Clock size={18} />
          <span>Clock</span>
        </button>
        <button
          className={`nav-btn ${activeTab === 'pomodoro' ? 'active' : ''}`}
          onClick={() => setActiveTab('pomodoro')}
          title="Pomodoro Timer"
        >
          <Timer size={18} />
          <span>Pomodoro</span>
        </button>
      </div>

      <div className="app-content">
        {activeTab === 'clock' ? (
          <>
            <FlipClock />
            <PrayerTime />
          </>
        ) : (
          <PomodoroTimer />
        )}
      </div>
    </div>
  );
}

export default App;
