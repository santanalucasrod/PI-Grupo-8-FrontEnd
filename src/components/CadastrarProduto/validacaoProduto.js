// Regras de validação alinhadas ao schema do banco (tabela `produto`):
//   nome           VARCHAR(45)  NOT NULL
//   preco_unidade  DECIMAL(5,2) NULL   -> até 3 dígitos inteiros + 2 decimais (máx. 999.99)
//   descricao      VARCHAR(200) NULL
//   categoria_id   BIGINT       NOT NULL -> categoria é obrigatória
// Tabelas `categoria`, `ingrediente` (VARCHAR(50)) e `personalizacao` (VARCHAR(60))
// definem os limites de caracteres usados nos respectivos selects.

export const LIMITES = {
  nome: 45,
  descricao: 200,
  categoria: 50,
  ingrediente: 50,
  personalizacao: 60,
};

const REGEX_PRECO = /^\d{1,3}(\.\d{1,2})?$/; // até 3 dígitos inteiros, até 2 casas decimais

export function validarProduto({ nome, preco, descricao, categoria }) {
  const erros = {};

  const nomeLimpo = (nome || '').trim();
  if (!nomeLimpo) {
    erros.nome = 'Informe o nome do produto.';
  } else if (nomeLimpo.length > LIMITES.nome) {
    erros.nome = `O nome pode ter no máximo ${LIMITES.nome} caracteres.`;
  }

  const precoTexto = String(preco ?? '').trim();
  if (!precoTexto) {
    erros.preco = 'Informe o preço.';
  } else if (!REGEX_PRECO.test(precoTexto)) {
    erros.preco = 'Preço inválido. Use até 3 dígitos inteiros e 2 casas decimais (ex: 12.50).';
  } else {
    const precoNumero = Number(precoTexto);
    if (Number.isNaN(precoNumero) || precoNumero <= 0) {
      erros.preco = 'O preço deve ser maior que zero.';
    } else if (precoNumero > 999.99) {
      erros.preco = 'O preço não pode ser maior que 999,99.';
    }
  }

  const descricaoLimpa = (descricao || '').trim();
  if (descricaoLimpa.length > LIMITES.descricao) {
    erros.descricao = `A descrição pode ter no máximo ${LIMITES.descricao} caracteres.`;
  }

  const categoriaLimpa = (categoria || '').trim();
  if (!categoriaLimpa) {
    erros.categoria = 'Selecione uma categoria.';
  } else if (categoriaLimpa.length > LIMITES.categoria) {
    erros.categoria = `O nome da categoria pode ter no máximo ${LIMITES.categoria} caracteres.`;
  }

  return erros;
}
