import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Handle GitHub Pages SPA redirect
(function() {
  const redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect && redirect !== location.href) {
    // Extract the path from the stored redirect URL
    const redirectUrl = new URL(redirect);
    const newPath = redirectUrl.pathname + redirectUrl.search + redirectUrl.hash;
    history.replaceState({}, '', newPath);
  }
})();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
