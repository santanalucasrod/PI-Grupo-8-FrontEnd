import { useEffect, useState } from 'react';
import { carregarImagemProduto } from './CadastrarProduto/produtoImagemApi';
import imagemPadrao from '../assets/img-cafe.png';

export default function ImagemProduto({ produtoId, pathFt, preview, alt = '', ...props }) {
  const [imagem, setImagem] = useState(null);
  const [falha, setFalha] = useState(null);
  const chave = JSON.stringify([produtoId, pathFt]);
  const src = preview || (imagem?.chave === chave ? imagem.url : null) || imagemPadrao;

  useEffect(() => {
    if (preview) return undefined;
    let ativo = true;
    let url;
    carregarImagemProduto(produtoId, pathFt).then((blob) => {
      if (!ativo || !blob) return;
      url = URL.createObjectURL(blob);
      setImagem({ chave: JSON.stringify([produtoId, pathFt]), url });
    });
    return () => {
      ativo = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [produtoId, pathFt, preview]);

  return (
    <img
      {...props}
      src={falha === src ? imagemPadrao : src}
      alt={alt}
      onError={() => setFalha(src)}
    />
  );
}
