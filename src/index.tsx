import React from 'react';
import ReactDOM from 'react-dom/client';

import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.tsx';
import { App } from './App.tsx';
import { ErrorState } from './components';

import './css/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorState}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
