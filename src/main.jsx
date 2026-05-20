import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SignUp from './pages/SignUp.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SignUp />
  </StrictMode>,
)
