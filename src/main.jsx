import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { applyGlobalVisualSettings, getGlobalSettings } from '@/lib/adminConfig';
import '@/index.css';

applyGlobalVisualSettings(getGlobalSettings());

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((error) => {
            console.error('SW registration failed', error);
        });
    });
}
