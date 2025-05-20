import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Wrap the app in BrowserRouter to enable routing */}
    <BrowserRouter>
      {/* Apply Material-UI baseline styling across the app */}
      <CssBaseline />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
