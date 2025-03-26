
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Main.tsx is executing")

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found')
  throw new Error('Root element not found')
}

console.log("Rendering App component")
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
