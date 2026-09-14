import React, { useState, useEffect } from 'react';
import FlipClock from './components/FlipClock';
import PrayerTime from './components/PrayerTime';
import PomodoroTimer from './components/PomodoroTimer';
import { Timer, Clock } from 'lucide-react';
import { getVsCodeApi } from './utils/notification';
import { getTranslations } from './utils/i18n';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('clock'); // 'clock' | 'pomodoro'
  const [language, setLanguage] = useState('id'); // 'id' | 'en'

  useEffect(() => {
    const handleMessage = (event) => {
      const message = event.data;
      if (!message) return;
      if (message.type === 'THEME_COLOR_UPDATED' && message.data) {
        const { hex, hover, text, glow } = message.data;
        if (hex) document.documentElement.style.setProperty('--zen-accent', hex);
        if (hover) document.documentElement.style.setProperty('--zen-accent-hover', hover);
        if (text) document.documentElement.style.setProperty('--zen-accent-text', text);
        if (glow) document.documentElement.style.setProperty('--zen-accent-glow', glow);
      } else if (message.type === 'LANGUAGE_UPDATED' && message.language) {
        setLanguage(message.language);
      }
    };

    window.addEventListener('message', handleMessage);
    const api = getVsCodeApi();
    if (api) {
      api.postMessage({ type: 'GET_THEME_COLOR' });
      api.postMessage({ type: 'GET_LANGUAGE' });
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const t = getTranslations(language);

  return (
    <div className="app-container">
      <div className="app-header-nav">
        <button
          className={`nav-btn ${activeTab === 'clock' ? 'active' : ''}`}
          onClick={() => setActiveTab('clock')}
          title="Flip Clock & Prayer Times"
        >
          <Clock size={18} />
          <span>{t.ui.navClock}</span>
        </button>
        <button
          className={`nav-btn ${activeTab === 'pomodoro' ? 'active' : ''}`}
          onClick={() => setActiveTab('pomodoro')}
          title="Pomodoro Timer"
        >
          <Timer size={18} />
          <span>{t.ui.navPomodoro}</span>
        </button>
      </div>

      <div className="app-content">
        {activeTab === 'clock' ? (
          <>
            <FlipClock language={language} />
            <PrayerTime language={language} />
          </>
        ) : (
          <PomodoroTimer language={language} />
        )}
      </div>
    </div>
  );
}

export default App;
