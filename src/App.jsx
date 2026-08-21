import Login from './pages/Login/Login.jsx'
import CadastroFuncionario from './pages/CadastroFuncionario/CadastroFuncionario.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Funcionarios from './pages/Funcionarios/Funcionarios.jsx'
import Pedidos from './pages/Pedidos/Pedidos.jsx'
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
        <Route path="/funcionarios" element={<Funcionarios />} />
        <Route path="/pedidos" element={<Pedidos />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
