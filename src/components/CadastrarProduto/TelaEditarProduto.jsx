import { useParams } from 'react-router-dom';
import FormularioProduto from './FormularioProduto';

export default function TelaEditarProduto() {
  const { id } = useParams();
  return <FormularioProduto key={id} produtoId={Number(id)} />;
}
