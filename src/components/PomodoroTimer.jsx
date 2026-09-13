import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import FlipUnit from './FlipUnit';
import { sendNotification, requestWebNotificationPermission, getVsCodeApi } from '../utils/notification';

export default function PomodoroTimer() {
  const [mode, setMode] = useState('work'); // 'work' | 'break'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Sync status to VS Code status bar
  useEffect(() => {
    const api = getVsCodeApi();
    if (api) {
      api.postMessage({
        type: 'POMODORO_STATUS',
        isRunning,
        mode,
        timeLeft
      });
    }
  }, [isRunning, timeLeft, mode]);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      document.title = `(${formattedTime}) ${mode === 'work' ? 'Work' : 'Break'} - Zen Clock`;

      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      const isWorkFinished = mode === 'work';
      const notificationMsg = isWorkFinished
        ? 'Sesi Work (25m) selesai! Waktunya Istirahat (Break 5m).'
        : 'Sesi Break (5m) selesai! Siap untuk kembali bekerja (Work 25m)?';

      sendNotification(isWorkFinished ? '🍅 Pomodoro' : '⚡ Break Finished', notificationMsg, 'info');

      if (isWorkFinished) {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
      }
      setIsRunning(false);
      document.title = 'Zen Flip Clock';
    } else if (!isRunning) {
      document.title = 'Zen Flip Clock';
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const togglePlay = () => {
    if (!isRunning) {
      requestWebNotificationPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'work') {
      setTimeLeft(25 * 60);
    } else {
      setTimeLeft(5 * 60);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === 'work') {
      setTimeLeft(25 * 60);
    } else {
      setTimeLeft(5 * 60);
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
        <button className="pomodoro-btn" onClick={togglePlay} aria-label={isRunning ? 'Pause' : 'Start'}>
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button className="pomodoro-btn" onClick={resetTimer} aria-label="Reset">
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}
