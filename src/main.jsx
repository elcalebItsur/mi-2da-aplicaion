import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ListasPersonas from './ListasPersonas.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ListasPersonas />
  </StrictMode>,
)
