
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { toast, Toaster } from 'sonner';

// Display a notification that the database is disconnected
setTimeout(() => {
  toast.info('Sandbox Mode Active', {
    description: 'The application is running without database connectivity for preview purposes',
    duration: 5000
  });
}, 1000);

// Create root without strict mode to prevent double initialization
// which might be causing issues with the preview
createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster position="top-right" />
  </>
);
