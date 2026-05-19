import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: '!bg-white !text-neutral-900 !border !border-neutral-200 !shadow-lg !text-sm',
      }}
    />
  </StrictMode>
);