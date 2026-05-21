import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './amplifyConfig.js';
import '@aws-amplify/ui-react/styles.css';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
