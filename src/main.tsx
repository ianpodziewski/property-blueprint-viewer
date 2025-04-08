
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Log when the application starts
console.log("Application starting, initializing from localStorage...");

// Create root and render app
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("Root element not found");
}
