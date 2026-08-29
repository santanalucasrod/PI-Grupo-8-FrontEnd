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
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom'
import VLibras from './components/Vlibras.jsx'
import Header from './components/Header/Header.jsx'
import './styles/colors.css';
import TelaListarProdutos from './components/ListarProdutos/TelaListarProdutos.jsx'
import TelaCadastrarProduto from './components/CadastrarProduto/TelaCadastrarProduto.jsx'
import TelaEditarProduto from './components/CadastrarProduto/TelaEditarProduto.jsx'
import TelaCardapio from './components/Cardapio/TelaCardapio.jsx'
import TelaProdutoDetalhe from './components/Cardapio/TelaProdutoDetalhe.jsx'
import TelaSacola from './components/Cardapio/TelaSacola.jsx'
import { CartProvider } from './providers/CartContext.jsx'

function HeaderCondicional() {
  const location = useLocation();
  if (location.pathname.startsWith('/produtos')) return null;
  if (location.pathname.startsWith('/cardapio')) return null;
  if (location.pathname.startsWith('/personalizacoes/cadastro')) return null;
  if (location.pathname.startsWith('/categorias/cadastro')) return null;
  if (location.pathname.startsWith('/ingredientes/cadastro')) return null;
  if (location.pathname.startsWith('/funcionarios/cadastro')) return null;
  return <Header />;
}

function LayoutCardapio() {
  return (
    <CartProvider>
      <Outlet />
    </CartProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <VLibras />
      <HeaderCondicional />
      <Routes>
        <Route path="/funcionarios/cadastro" element={<CadastroFuncionario />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/funcionarios" element={<Funcionarios />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/categorias/cadastro" element={<CadastroCategoria />} />
        <Route path="/ingredientes" element={<Ingredientes />} />
        <Route path="/ingredientes/cadastro" element={<CadastroIngrediente />} />
        <Route path="/personalizacoes" element={<Personalizacoes />} />
        <Route path="/personalizacoes/cadastro" element={<CadastroPersonalizacao />} />
        <Route path="/produtos" element={<TelaListarProdutos />} />
        <Route path="/produtos/cadastro" element={<TelaCadastrarProduto />} />
        <Route path="/produtos/editar/:id" element={<TelaEditarProduto />} />
        <Route element={<LayoutCardapio />}>
          <Route path="/cardapio" element={<TelaCardapio />} />
          <Route path="/cardapio/produto/:id" element={<TelaProdutoDetalhe />} />
          <Route path="/cardapio/sacola" element={<TelaSacola />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
export default App