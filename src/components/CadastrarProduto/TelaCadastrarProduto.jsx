import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TelaCadastrarProduto.module.css';
import Header from './Header';
import Footer from './Footer';
import ImageUpload from './ImageUpload';
import Input from './Input';
import TextArea from './TextArea';
import SelectGroup from './SelectGroup';
import ModalAdicionar from './ModalAdicionar';
import { validarProduto, LIMITES } from './validacaoProduto';
import { vincularIngredienteAoProduto } from './produtoIngredienteApi';
import { enviarImagemProduto } from './produtoImagemApi';

const API_BASE_URL = 'http://localhost:8080';

export default function TelaCadastrarProduto() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState('https://images.unsplash.com/photo-1559525839-b184a4d698c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80');
  const [arquivoImagem, setArquivoImagem] = useState(null);

  const [opcoesCategoria, setOpcoesCategoria] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [categoriasApi, setCategoriasApi] = useState([]); // lista completa {id, nome} vinda da API

  const [opcoesIngrediente, setOpcoesIngrediente] = useState([]);
  const [ingredienteAtual, setIngredienteAtual] = useState('');
  const [ingredientes, setIngredientes] = useState([]);
  const [ingredientesApi, setIngredientesApi] = useState([]); // lista completa {id, nome} vinda da API

  const [opcoesPersonalizacao, setOpcoesPersonalizacao] = useState(['Sem açúcar', 'Chantilly', 'Gelo extra']);
  const [personalizacaoAtual, setPersonalizacaoAtual] = useState('');
  const [personalizacoes, setPersonalizacoes] = useState([]);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', title: '' });
  const [erros, setErros] = useState({});
  const [salvandoModal, setSalvandoModal] = useState(false);
  const [erroModal, setErroModal] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState(null);

  // Busca a lista de ingredientes disponíveis na API para o select
  useEffect(() => {
    async function buscarIngredientes() {
      try {
        const resposta = await fetch(`${API_BASE_URL}/ingredientes`, {
          method: 'GET',
          headers: { accept: '*/*' },
        });

        if (!resposta.ok) {
          throw new Error(`Erro ${resposta.status} ao buscar ingredientes`);
        }

        const dados = await resposta.json();
        const nomes = (dados || []).map((item) => item.nome).filter(Boolean);
        setOpcoesIngrediente(nomes);
        setIngredientesApi(dados || []);
      } catch (err) {
        console.error('Erro ao buscar ingredientes:', err);
      }
    }

    buscarIngredientes();
  }, []);

  // Busca a lista de categorias disponíveis na API para o select
  useEffect(() => {
    async function buscarCategorias() {
      try {
        const resposta = await fetch(`${API_BASE_URL}/categorias`, {
          method: 'GET',
          headers: { accept: '*/*' },
        });

        if (!resposta.ok) {
          throw new Error(`Erro ${resposta.status} ao buscar categorias`);
        }

        const dados = await resposta.json();
        setCategoriasApi(dados || []);
        const nomes = (dados || []).map((item) => item.nome).filter(Boolean);
        setOpcoesCategoria(nomes);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    }

    buscarCategorias();
  }, []);

  const handleCadastrar = async () => {
    const errosEncontrados = validarProduto({ nome, preco, descricao, categoria });

    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados);
      return;
    }

    setErros({});

    // Encontra o objeto completo da categoria selecionada (id + nome) na lista vinda da API
    const categoriaSelecionada = categoriasApi.find((c) => c.nome === categoria);

    const payload = {
      nome,
      precoUnidade: Number(preco) || 0,
      descricao,
      // O backend exige pathFt não-vazio (@NotBlank). Nesse momento ainda não temos o id
      // real do produto pra montar o nome definitivo da imagem, então mandamos um
      // placeholder — se o usuário escolheu uma foto, ele é substituído pelo nome real
      // logo depois, quando enviamos a imagem pra POST /produtos/{id}/imagem.
      pathFt: 'sem-imagem.jpg',
      categoria: categoriaSelecionada
        ? { id: categoriaSelecionada.id, nome: categoriaSelecionada.nome }
        : { id: 0, nome: categoria },
    };

    try {
      setSalvando(true);
      setErroSalvar(null);

      const resposta = await fetch(`${API_BASE_URL}/produtos`, {
        method: 'POST',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!resposta.ok) {
        let detalhe = '';
        try {
          detalhe = await resposta.text();
        } catch {
          // ignora falha ao ler o corpo do erro
        }
        console.error(`POST ${API_BASE_URL}/produtos falhou (${resposta.status}):`, detalhe);
        throw new Error(`Erro ${resposta.status} ao cadastrar produto`);
      }

      let produtoAtual = await resposta.json();

      // Se o usuário escolheu uma foto, envia agora que já temos o id real do produto
      const falhasImagem = [];
      if (arquivoImagem) {
        try {
          produtoAtual = await enviarImagemProduto(produtoAtual.id, arquivoImagem);
        } catch (err) {
          console.error('Erro ao enviar imagem do produto:', err);
          falhasImagem.push('imagem do produto');
        }
      }

      // Vincula na tabela produto_ingrediente cada ingrediente selecionado ao produto recém-criado
      const produtoVinculo = {
        id: produtoAtual.id,
        nome: produtoAtual.nome ?? payload.nome,
        categoria: produtoAtual.categoria ?? payload.categoria,
        precoUnidade: produtoAtual.precoUnidade ?? payload.precoUnidade,
        descricao: produtoAtual.descricao ?? payload.descricao,
        pathFt: produtoAtual.pathFt ?? payload.pathFt,
      };

      const resultados = await Promise.allSettled(
        ingredientes.map(async (nomeIngrediente) => {
          let ingredienteObj = ingredientesApi.find(
            (i) => i.nome?.trim().toLowerCase() === nomeIngrediente.trim().toLowerCase()
          );

          if (!ingredienteObj) {
            ingredienteObj = await criarNaApi('ingredientes', nomeIngrediente);
            if (ingredienteObj?.id != null) {
              setIngredientesApi((atual) => [...atual, ingredienteObj]);
            }
          }

          if (!ingredienteObj?.id) {
            throw new Error(`Ingrediente "${nomeIngrediente}" sem id válido, não foi possível vincular`);
          }

          return vincularIngredienteAoProduto(produtoVinculo, ingredienteObj);
        })
      );

      const falhas = [...falhasImagem];
      resultados.forEach((resultado, indice) => {
        if (resultado.status === 'rejected') {
          console.error(`Erro ao vincular ingrediente "${ingredientes[indice]}":`, resultado.reason);
          falhas.push(ingredientes[indice]);
        }
      });

      if (falhas.length > 0) {
        // Mantém a tela aberta para o usuário ver o erro, já que o produto foi criado
        // mas nem tudo foi vinculado/enviado com sucesso.
        setErroSalvar(
          `Produto cadastrado, mas não foi possível salvar: ${falhas.join(', ')}. Veja o console (F12) para detalhes.`
        );
        return;
      }

      navigate('/produtos');
    } catch (err) {
      console.error('Erro ao cadastrar produto:', err);
      setErroSalvar('Não foi possível cadastrar o produto. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const openModal = (type, title) => {
    setErroModal(null);
    setModalConfig({ isOpen: true, type, title });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: '', title: '' });
    setErroModal(null);
  };

  // Cria a categoria ou ingrediente na API e retorna o registro salvo (id + nome)
  async function criarNaApi(endpoint, nome) {
    const resposta = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome }),
    });

    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status} ao criar`);
    }

    return resposta.json();
  }

  const handleModalAdd = async (value) => {
    const nomeLimpo = value.trim();
    if (!nomeLimpo) return;

    if (modalConfig.type === 'categoria') {
      try {
        setSalvandoModal(true);
        setErroModal(null);
        const criada = await criarNaApi('categorias', nomeLimpo);
        const nomeSalvo = criada?.nome || nomeLimpo;
        if (!opcoesCategoria.includes(nomeSalvo)) setOpcoesCategoria([...opcoesCategoria, nomeSalvo]);
        setCategoria(nomeSalvo);
        closeModal();
      } catch (err) {
        console.error('Erro ao criar categoria:', err);
        setErroModal('Não foi possível criar a categoria. Tente novamente.');
      } finally {
        setSalvandoModal(false);
      }
    } else if (modalConfig.type === 'ingrediente') {
      try {
        setSalvandoModal(true);
        setErroModal(null);
        const criado = await criarNaApi('ingredientes', nomeLimpo);
        const nomeSalvo = criado?.nome || nomeLimpo;
        if (!opcoesIngrediente.includes(nomeSalvo)) setOpcoesIngrediente([...opcoesIngrediente, nomeSalvo]);
        if (!ingredientes.includes(nomeSalvo)) setIngredientes([...ingredientes, nomeSalvo]);
        if (criado?.id != null) {
          setIngredientesApi((atual) => [...atual, criado]);
        }
        closeModal();
      } catch (err) {
        console.error('Erro ao criar ingrediente:', err);
        setErroModal('Não foi possível criar o ingrediente. Tente novamente.');
      } finally {
        setSalvandoModal(false);
      }
    } else if (modalConfig.type === 'personalizacao') {
      if (!opcoesPersonalizacao.includes(nomeLimpo)) setOpcoesPersonalizacao([...opcoesPersonalizacao, nomeLimpo]);
      if (!personalizacoes.includes(nomeLimpo)) setPersonalizacoes([...personalizacoes, nomeLimpo]);
      closeModal();
    }
  };

  const handleSelectIngrediente = (e) => {
    const val = e.target.value;
    setIngredienteAtual(val);
    if (val && !ingredientes.includes(val)) {
      setIngredientes([...ingredientes, val]);
      setIngredienteAtual(''); // Reset select after adding
    }
  };

  const handleRemoveIngrediente = (item) => {
    setIngredientes(ingredientes.filter(i => i !== item));
  };

  const handleSelectPersonalizacao = (e) => {
    const val = e.target.value;
    setPersonalizacaoAtual(val);
    if (val && !personalizacoes.includes(val)) {
      setPersonalizacoes([...personalizacoes, val]);
      setPersonalizacaoAtual(''); // Reset select after adding
    }
  };

  const handleRemovePersonalizacao = (item) => {
    setPersonalizacoes(personalizacoes.filter(p => p !== item));
  };

  const handleSelecionarImagem = (arquivo) => {
    setArquivoImagem(arquivo);
    setImagem(URL.createObjectURL(arquivo)); // preview local, antes de enviar pro backend
  };

  return (
    <div className={styles.container}>
      <Header title="Produtos" onCancel={() => navigate('/produtos')} />

      <main className={styles.mainContent}>
        {erroSalvar && <p style={{ textAlign: 'center', color: '#B00020' }}>{erroSalvar}</p>}

        <ImageUpload imageSrc={imagem} onFileSelect={handleSelecionarImagem} />

        <form className={styles.form}>
          <Input
            label="Nome do produto"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              if (erros.nome) setErros((atual) => ({ ...atual, nome: undefined }));
            }}
            maxLength={LIMITES.nome}
            error={erros.nome}
          />

          <Input
            label="Preço"
            value={preco}
            onChange={(e) => {
              setPreco(e.target.value);
              if (erros.preco) setErros((atual) => ({ ...atual, preco: undefined }));
            }}
            type="number"
            min="0"
            max="999.99"
            step="0.01"
            error={erros.preco}
          />

          <TextArea
            label="Descrição"
            value={descricao}
            onChange={(e) => {
              setDescricao(e.target.value);
              if (erros.descricao) setErros((atual) => ({ ...atual, descricao: undefined }));
            }}
            maxLength={LIMITES.descricao}
            error={erros.descricao}
          />

          <SelectGroup
            label="Categoria"
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value);
              if (erros.categoria) setErros((atual) => ({ ...atual, categoria: undefined }));
            }}
            options={opcoesCategoria}
            onAdd={() => openModal('categoria', 'Adicionar Categoria')}
            maxLength={LIMITES.categoria}
            error={erros.categoria}
          />

          <SelectGroup
            label="Ingredientes"
            value={ingredienteAtual}
            onChange={handleSelectIngrediente}
            options={opcoesIngrediente}
            onAdd={() => openModal('ingrediente', 'Adicionar Ingrediente')}
            items={ingredientes}
            onRemove={handleRemoveIngrediente}
            maxLength={LIMITES.ingrediente}
          />

          <SelectGroup
            label="Personalização"
            value={personalizacaoAtual}
            onChange={handleSelectPersonalizacao}
            options={opcoesPersonalizacao}
            onAdd={() => openModal('personalizacao', 'Adicionar Personalização')}
            items={personalizacoes}
            onRemove={handleRemovePersonalizacao}
            maxLength={LIMITES.personalizacao}
          />
        </form>
      </main>

      <Footer onCadastrar={handleCadastrar} text={salvando ? 'Salvando...' : 'Cadastrar'} disabled={salvando} />

      <ModalAdicionar
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        onClose={closeModal}
        onAdd={handleModalAdd}
        salvando={salvandoModal}
        erro={erroModal}
      />
    </div>
  );
}