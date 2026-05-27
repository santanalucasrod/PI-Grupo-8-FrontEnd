import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Login from './pages/Login.jsx'
import CadastroFuncionario from './pages/CadastroFuncionario.jsx'
import './index.css'
import App from './App.jsx'
import Header from './components/Header.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Header />
    <CadastroFuncionario />
  </StrictMode>,
)
