import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactFlowProvider } from 'reactflow'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

// Initialize theme as early as possible on startup
const savedTheme = localStorage.getItem('theme') || 'system'
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark')
} else if (savedTheme === 'light') {
  document.documentElement.setAttribute('data-theme', 'light')
} else {
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light')
}

if (import.meta.env.DEV) {
  console.log('Gemini API Key defined:', !!import.meta.env.VITE_GEMINI_API_KEY)
  console.log('Supabase URL configured:', !!import.meta.env.VITE_SUPABASE_URL)
  console.log('Supabase Key configured:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ReactFlowProvider>
        <App />
      </ReactFlowProvider>
    </AuthProvider>
  </StrictMode>,
)

