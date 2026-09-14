import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import FlipUnit from './FlipUnit';
import { getVsCodeApi } from '../utils/notification';

export default function PomodoroTimer() {
  const [mode, setMode] = useState('work'); // 'work' | 'break'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // 1. Subscribe to Extension Host single Pomodoro Engine
  useEffect(() => {
    const api = getVsCodeApi();

    // Ask extension host for live state immediately
    if (api) {
      api.postMessage({ type: 'GET_POMODORO_STATE' });
    }

    const handleMessage = (event) => {
      const msg = event.data;
      if (!msg) return;

      if (msg.type === 'POMODORO_SYNC' && msg.state) {
        setIsRunning(!!msg.state.isRunning);
        setMode(msg.state.mode || 'work');
        if (typeof msg.state.timeLeft === 'number') {
          setTimeLeft(msg.state.timeLeft);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 2. Standalone browser fallback timer (if running outside VS Code)
  useEffect(() => {
    const api = getVsCodeApi();
    if (api) return; // In VS Code, Extension Host owns the timer loop!

    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      if (mode === 'work') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
      }
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  // 3. Command Dispatches to Extension Host
  const togglePlay = () => {
    const api = getVsCodeApi();
    if (api) {
      api.postMessage({
        type: 'POMODORO_CMD',
        action: isRunning ? 'pause' : 'start'
      });
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    const api = getVsCodeApi();
    if (api) {
      api.postMessage({
        type: 'POMODORO_CMD',
        action: 'reset'
      });
    } else {
      setIsRunning(false);
      setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
    }
  };

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    const api = getVsCodeApi();
    if (api) {
      api.postMessage({
        type: 'POMODORO_CMD',
        action: 'switchMode',
        mode: newMode
      });
    } else {
      setMode(newMode);
      setIsRunning(false);
      setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="pomodoro-container">
      <div className="pomodoro-header">
        <button
          className={`pomodoro-tab ${mode === 'work' ? 'active' : ''}`}
          onClick={() => switchMode('work')}
        >
          Work (25m)
        </button>
        <button
          className={`pomodoro-tab ${mode === 'break' ? 'active' : ''}`}
          onClick={() => switchMode('break')}
        >
          Break (5m)
        </button>
      </div>

      <div className="flip-clock pomodoro-flip-clock">
        <FlipUnit digit={minutes} />
        <FlipUnit digit={seconds} />
      </div>

      <div className="pomodoro-controls">
        <button
          className={`pomodoro-btn ${isRunning ? 'active-playing' : ''}`}
          onClick={togglePlay}
          aria-label={isRunning ? 'Pause Pomodoro' : 'Start Pomodoro'}
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          className="pomodoro-btn"
          onClick={resetTimer}
          aria-label="Reset Pomodoro"
          title="Reset"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}
