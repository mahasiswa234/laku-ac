import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { setupAuthInterceptor } from './utils/auth.js';
import { ThemeProvider } from './context/ThemeContext';

// Inisialisasi interceptor JWT untuk seluruh panggilan API
try {
  setupAuthInterceptor();
} catch (e) {
  console.warn('Gagal memuat auth interceptor:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
