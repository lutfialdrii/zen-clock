import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker for PWA offline capabilities (browser only)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && typeof acquireVsCodeApi === 'undefined') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => {
        console.log('Zen Clock Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.log('Zen Clock Service Worker registration failed:', err);
      });
  });
}

