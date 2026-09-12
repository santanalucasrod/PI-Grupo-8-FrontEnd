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
import { BrowserRouter, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom'
import VLibras from './components/Vlibras.jsx'
import Header from './components/Header/Header.jsx'
import './styles/colors.css';
import TelaListarProdutos from './components/ListarProdutos/TelaListarProdutos.jsx'
import TelaCadastrarProduto from './components/CadastrarProduto/TelaCadastrarProduto.jsx'
import TelaEditarProduto from './components/CadastrarProduto/TelaEditarProduto.jsx'
import Cardapio from './pages/Cardapio/Cardapio.jsx'
import Sacola from './pages/Cardapio/Sacola.jsx'
import Perfil from './pages/Perfil/Perfil.jsx'
import { CartProvider } from './providers/CartContext.jsx'
import { AuthProvider, useAuth } from './providers/AuthProvider.jsx'

const ROTAS_GERENTE = [
  '/dashboard',
  '/funcionarios',
  '/funcionarios/cadastro',
  '/pedidos',
  '/categorias',
  '/categorias/cadastro',
  '/ingredientes',
  '/ingredientes/cadastro',
  '/personalizacoes',
  '/personalizacoes/cadastro',
  '/produtos',
  '/produtos/cadastro',
  '/produtos/editar',
  '/cardapio',
  '/cardapio/sacola',
];

const ROTAS_NAO_GERENTE = ['/pedidos', '/cardapio', '/cardapio/sacola','/perfil'];

function HeaderCondicional() {
  const location = useLocation();
  if (location.pathname === '/login') return null;
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

function PublicRoute({ children }) {
  const { isAuthenticated, isGerente } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={isGerente ? '/dashboard' : '/cardapio'} replace state={{ from: location }} />;
  }

  return children;
}

function isRotaPermitida(pathname, isGerente) {
  const caminho = pathname.split('?')[0];

  if (isGerente) {
    return ROTAS_GERENTE.some((rota) => caminho === rota || caminho.startsWith(`${rota}/`));
  }

  return ROTAS_NAO_GERENTE.some((rota) => caminho === rota || caminho.startsWith(`${rota}/`));
}

function PrivateRoute({ children }) {
  const { isAuthenticated, isGerente } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isGerente && !isRotaPermitida(location.pathname, false)) {
    return <Navigate to="/cardapio" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <VLibras />
        <HeaderCondicional />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
          <Route path="/funcionarios/cadastro" element={<PrivateRoute><CadastroFuncionario /></PrivateRoute>} />
          <Route path="/funcionarios" element={<PrivateRoute><Funcionarios /></PrivateRoute>} />
          <Route path="/pedidos" element={<PrivateRoute><Pedidos /></PrivateRoute>} />
          <Route path="/categorias" element={<PrivateRoute><Categorias /></PrivateRoute>} />
          <Route path="/categorias/cadastro" element={<PrivateRoute><CadastroCategoria /></PrivateRoute>} />
          <Route path="/ingredientes" element={<PrivateRoute><Ingredientes /></PrivateRoute>} />
          <Route path="/ingredientes/cadastro" element={<PrivateRoute><CadastroIngrediente /></PrivateRoute>} />
          <Route path="/personalizacoes" element={<PrivateRoute><Personalizacoes /></PrivateRoute>} />
          <Route path="/personalizacoes/cadastro" element={<PrivateRoute><CadastroPersonalizacao /></PrivateRoute>} />
          <Route path="/produtos" element={<PrivateRoute><TelaListarProdutos /></PrivateRoute>} />
          <Route path="/produtos/cadastro" element={<PrivateRoute><TelaCadastrarProduto /></PrivateRoute>} />
          <Route path="/produtos/editar/:id" element={<PrivateRoute><TelaEditarProduto /></PrivateRoute>} />

          <Route element={<LayoutCardapio />}>
            <Route path="/cardapio" element={<PrivateRoute><Cardapio /></PrivateRoute>} />
            <Route path="/cardapio/sacola" element={<PrivateRoute><Sacola /></PrivateRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
export default App
