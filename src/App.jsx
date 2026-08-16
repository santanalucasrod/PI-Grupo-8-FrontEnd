import { useState } from 'react'
import Login from './pages/Login/Login.jsx'
import CadastroFuncionario from './pages/CadastroFuncionario/CadastroFuncionario.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import './index.css'
import Header from './components/Header/Header.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import VLibras from './components/Vlibras.jsx'
import './styles/colors.css';

function App() {
  return (
    <BrowserRouter>
      <VLibras />
      <Header />
      <Routes>
        <Route path="/cadastro" element={<CadastroFuncionario />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App