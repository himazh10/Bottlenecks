import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import './styles.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error(
    'Root element not found. Ensure index.html contains <div id="root"></div>.'
  );
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
