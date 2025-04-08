
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Log when the application starts
console.log("Application starting, initializing from localStorage...");

// Check for localStorage keys related to our app
if (typeof window !== 'undefined' && window.localStorage) {
  const modelKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('realEstateModel_')
  );
  
  if (modelKeys.length > 0) {
    console.log("Found existing data in localStorage with keys:", modelKeys);
  } else {
    console.log("No existing data found in localStorage");
  }
}

// Create root and render app
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("Root element not found");
}
