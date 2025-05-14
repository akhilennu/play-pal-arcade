
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a loading element
const loadingElement = document.createElement('div');
loadingElement.className = 'app-loading';
loadingElement.innerHTML = `
  <div class="app-loading-content">
    <div class="app-loading-spinner"></div>
    <div class="app-loading-text">Loading Game Hub...</div>
  </div>
`;

// Insert loading element
document.body.appendChild(loadingElement);

// Initialize the app with a small delay to show loading indicator
setTimeout(() => {
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
  
  // Remove loading element after app renders
  setTimeout(() => {
    loadingElement.classList.add('app-loading-fade-out');
    setTimeout(() => {
      if (document.body.contains(loadingElement)) {
        document.body.removeChild(loadingElement);
      }
    }, 500);
  }, 500);
}, 300);
