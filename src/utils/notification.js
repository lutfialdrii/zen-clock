let vscodeApiInstance = null;

export const getVsCodeApi = () => {
  if (!vscodeApiInstance && typeof acquireVsCodeApi !== 'undefined') {
    try {
      vscodeApiInstance = acquireVsCodeApi();
    } catch (e) {
      console.log('acquireVsCodeApi already called or unavailable');
    }
  }
  return vscodeApiInstance;
};

export const playAudioChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playNote = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Soft pleasant chime sound
    playNote(523.25, 0, 0.2); // C5
    playNote(659.25, 0.15, 0.3); // E5
    playNote(783.99, 0.3, 0.4); // G5
  } catch (e) {
    console.error('Audio chime playback error:', e);
  }
};

export const requestWebNotificationPermission = async () => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      try {
        const res = await Notification.requestPermission();
        return res;
      } catch (err) {
        console.error('Notification permission error:', err);
      }
    }
    return Notification.permission;
  }
  return 'denied';
};

export const sendNotification = (title, message, level = 'info') => {
  const api = getVsCodeApi();
  if (api) {
    // VS Code Webview Environment
    api.postMessage({
      type: 'SHOW_NOTIFICATION',
      text: `${title ? title + ': ' : ''}${message}`,
      level
    });
  } else {
    // Standard Web Environment
    playAudioChime();

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/favicon.svg'
        });
      } else if (Notification.permission === 'default') {
        requestWebNotificationPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification(title, {
              body: message,
              icon: '/favicon.svg'
            });
          }
        });
      }
    }
  }
};
