import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely suppress benign WebSocket closure errors (e.g. Vite HMR in proxied environments or transient socket closures)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = typeof reason === 'string' ? reason : (reason?.message || '');
    if (msg.includes('WebSocket') || msg.includes('closed without opened')) {
      event.preventDefault();
      console.debug('[Suppressed benign websocket unhandled rejection]:', msg);
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (msg.includes('WebSocket') || msg.includes('closed without opened')) {
      event.preventDefault();
      console.debug('[Suppressed benign websocket error]:', msg);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

