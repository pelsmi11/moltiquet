import './styles/globals.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initRendererI18n } from './lib/i18n'

async function boot(): Promise<void> {
  const lng = await window.api.getLanguage()
  initRendererI18n(lng)
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

boot()
