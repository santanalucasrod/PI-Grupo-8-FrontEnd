import Login from './pages/Login/Login.jsx'
import CadastroFuncionario from './pages/Funcionarios/CadastroFuncionario.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Funcionarios from './pages/Funcionarios/Funcionarios.jsx'
import Pedidos from './pages/Pedidos/Pedidos.jsx'
import Categorias from './pages/Categorias/Categorias.jsx'
import CadastroCategoria from './pages/Categorias/CadastroCategoria.jsx'
import Ingredientes from './pages/Ingrediente/Ingredientes.jsx'
import CadastroIngrediente from './pages/Ingrediente/CadastroIngrediente.jsx'
import Personalizacoes from './pages/Personalizacao/Personalizacoes.jsx'
import CadastroPersonalizacao from './pages/Personalizacao/CadastroPersonalizacao.jsx'
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
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/categorias/cadastro" element={<CadastroCategoria />} />
        <Route path="/ingredientes" element={<Ingredientes />} />
        <Route path="/ingredientes/cadastro" element={<CadastroIngrediente />} />
        <Route path="/personalizacoes" element={<Personalizacoes />} />
        <Route path="/personalizacoes/cadastro" element={<CadastroPersonalizacao />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
