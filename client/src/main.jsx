import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/theme.css'
import './styles/public.css'
import './styles/admin.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SiteSettingsProvider } from './context/SiteSettingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SiteSettingsProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SiteSettingsProvider>
    </BrowserRouter>
  </StrictMode>,
)
