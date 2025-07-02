import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// React 18の新しいAPIを使用
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(<App />);

console.log('React app rendered');