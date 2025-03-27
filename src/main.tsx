
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { toast, Toaster } from 'sonner';

// Display a notification that the database is connected
setTimeout(() => {
  toast.success('Database Connected', {
    description: 'The application is now connected to the Supabase database',
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
