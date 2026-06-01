import { useState } from 'react'
import Login from './pages/Login.jsx'
import CadastroFuncionario from './pages/CadastroFuncionario.jsx'
import Dashboard from './pages/Dashboardhideo.jsx'
import './index.css'
import Header from './components/Header.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import VLibras from './components/VLibras.jsx'

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