import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ToastProvider } from './components/ToastProvider';
import { Toaster } from 'react-hot-toast';

import { ThemeProvider } from './components/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
          <App />
          <Toaster position="bottom-right" />
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);
