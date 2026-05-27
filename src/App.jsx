import { useState } from 'react'
import Login from './pages/Login.jsx'
import CadastroFuncionario from './pages/CadastroFuncionario.jsx'
import Dashboard from './pages/Dashboard.jsx'
import './index.css'
import Header from './components/Header.jsx'
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom'

function App()  {
  return (
    <BrowserRouter>
      <Header/>
      <Routes>
        <Route path="/cadastro" element={<CadastroFuncionario />} />
        <Route path="/login" element={<Login />}/>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
