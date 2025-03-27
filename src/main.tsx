
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { toast, Toaster } from 'sonner';

// Display a notification that the database is disconnected
setTimeout(() => {
  toast.info('Database connection disabled', {
    description: 'The application is running without database connectivity',
    duration: 5000
  });
}, 1000);

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster position="top-right" />
  </>
);
