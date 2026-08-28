import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './TelaCadastrarProduto.module.css';
import Header from './Header';
import Footer from './Footer';
import ImageUpload from './ImageUpload';
import Input from './Input';
import TextArea from './TextArea';
import SelectGroup from './SelectGroup';
import ModalAdicionar from './ModalAdicionar';
import { validarProduto, LIMITES } from './validacaoProduto';
import { vincularIngredienteAoProduto, desvincularIngredienteDoProduto } from './produtoIngredienteApi';
import { enviarImagemProduto } from './produtoImagemApi';
import { authHeader } from '../../utils/authHeader';

const API_BASE_URL = 'http://localhost:8080';

export default function TelaEditarProduto() {
  const navigate = useNavigate();
  const { id } = useParams();
  const produtoId = Number(id);

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState('');
  const [arquivoImagem, setArquivoImagem] = useState(null); // arquivo novo escolhido, ainda não enviado

  const [opcoesCategoria, setOpcoesCategoria] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [categoriasApi, setCategoriasApi] = useState([]); // lista completa {id, nome} vinda da API
  const [pathFt, setPathFt] = useState(''); // nome do arquivo da foto, mantido ao salvar

  const [opcoesIngrediente, setOpcoesIngrediente] = useState([]);
  const [ingredienteAtual, setIngredienteAtual] = useState('');
  const [ingredientes, setIngredientes] = useState([]);
  const [ingredientesApi, setIngredientesApi] = useState([]); // lista completa {id, nome} vinda da API
  const [ingredientesVinculados, setIngredientesVinculados] = useState([]); // nomes já vinculados a este produto na API

  const [opcoesPersonalizacao, setOpcoesPersonalizacao] = useState([]);
  const [personalizacaoAtual, setPersonalizacaoAtual] = useState('');
  const [personalizacoes, setPersonalizacoes] = useState([]);
  const [personalizacoesApi, setPersonalizacoesApi] = useState([]); // lista completa {id, nome} vinda da API

  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', title: '' });

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState(null);
  const [erros, setErros] = useState({});
  const [salvandoModal, setSalvandoModal] = useState(false);
  const [erroModal, setErroModal] = useState(null);

  // Busca a lista de ingredientes disponíveis na API para o select
  useEffect(() => {
    async function buscarIngredientesDisponiveis() {
      try {
        const resposta = await fetch(`${API_BASE_URL}/ingredientes`, {
          method: 'GET',
          headers: { accept: '*/*', ...authHeader() },
        });

        if (!resposta.ok) {
          throw new Error(`Erro ${resposta.status} ao buscar ingredientes`);
        }

        const dados = await resposta.json();
        const nomes = (dados || []).map((item) => item.nome).filter(Boolean);
        setOpcoesIngrediente((atual) => {
          const combinados = [...atual, ...nomes];
          return Array.from(new Set(combinados));
        });
        setIngredientesApi((atual) => {
          const idsAtuais = new Set(atual.map((i) => i.id));
          const novos = (dados || []).filter((i) => i && !idsAtuais.has(i.id));
          return [...atual, ...novos];
        });
      } catch (err) {
        console.error('Erro ao buscar ingredientes:', err);
      }
    }

    buscarIngredientesDisponiveis();
  }, []);

  // Busca a lista de categorias disponíveis na API para o select
  useEffect(() => {
    async function buscarCategorias() {
      try {
        const resposta = await fetch(`${API_BASE_URL}/categorias`, {
          method: 'GET',
          headers: { accept: '*/*', ...authHeader() },
        });

        if (!resposta.ok) {
          throw new Error(`Erro ${resposta.status} ao buscar categorias`);
        }

        const dados = await resposta.json();
        setCategoriasApi(dados || []);

        const nomes = (dados || []).map((item) => item.nome).filter(Boolean);
        setOpcoesCategoria((atual) => {
          const combinados = [...atual, ...nomes];
          return Array.from(new Set(combinados));
        });
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    }

    buscarCategorias();
  }, []);

  // Busca a lista de personalizações disponíveis na API para o select
  useEffect(() => {
    async function buscarPersonalizacoes() {
      try {
        const resposta = await fetch(`${API_BASE_URL}/personalizacoes`, {
          method: 'GET',
          headers: { accept: '*/*', ...authHeader() },
        });

        if (!resposta.ok) {
          throw new Error(`Erro ${resposta.status} ao buscar personalizações`);
        }

        const dados = await resposta.json();
        setPersonalizacoesApi(dados || []);
        const nomes = (dados || []).map((item) => item.nome).filter(Boolean);
        setOpcoesPersonalizacao((atual) => Array.from(new Set([...atual, ...nomes])));
      } catch (err) {
        console.error('Erro ao buscar personalizações:', err);
      }
    }

    buscarPersonalizacoes();
  }, []);

  // Busca os dados reais do produto na API e preenche o formulário
  useEffect(() => {
    async function buscarProduto() {
      if (!produtoId) {
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        setErro(null);

        const resposta = await fetch(`${API_BASE_URL}/produtos/${produtoId}`, {
          method: 'GET',
          headers: { accept: '*/*', ...authHeader() },
        });

        if (!resposta.ok) {
          throw new Error(`Erro ${resposta.status} ao buscar produto`);
        }

        const dados = await resposta.json();

        setNome(dados.nome || '');
        setPreco(dados.precoUnidade != null ? String(dados.precoUnidade) : '');
        setDescricao(dados.descricao || '');

        const nomeCategoria = dados.categoria?.nome || '';
        setCategoria(nomeCategoria);
        setOpcoesCategoria((atual) =>
          nomeCategoria && !atual.includes(nomeCategoria) ? [...atual, nomeCategoria] : atual
        );
        if (dados.categoria) {
          setCategoriasApi((atual) =>
            atual.some((c) => c.id === dados.categoria.id) ? atual : [...atual, dados.categoria]
          );
        }

        setPathFt(dados.pathFt || '');
        if (dados.pathFt) {
          setImagem(`${API_BASE_URL}/imagens/${dados.pathFt}`);
        }
      } catch (err) {
        console.error('Erro ao buscar produto:', err);
        setErro('Não foi possível carregar os dados do produto. Verifique se a API está rodando em ' + API_BASE_URL);
      } finally {
        setCarregando(false);
      }
    }

    buscarProduto();
  }, [produtoId]);

  // Busca os ingredientes já vinculados ao produto e marca como já adicionados
  useEffect(() => {
    async function buscarIngredientesDoProduto() {
      if (!produtoId) return;

      try {
        const resposta = await fetch(
          `${API_BASE_URL}/produtos/${produtoId}/ingredientes`,
          { method: 'GET', headers: { accept: '*/*', ...authHeader() } }
        );

        if (!resposta.ok) {
          throw new Error(`Erro ${resposta.status} ao buscar ingredientes do produto`);
        }

        const dados = await resposta.json();
        // A rota devolve os ingredientes do produto diretamente: [{ id, nome }, ...]
        const ingredientesDoProduto = (dados || []).filter(Boolean);
        const nomesIngredientes = ingredientesDoProduto.map((item) => item.nome).filter(Boolean);

        setIngredientes(nomesIngredientes);
        setIngredientesVinculados(nomesIngredientes);
        setOpcoesIngrediente((atual) => {
          const novos = nomesIngredientes.filter((nome) => !atual.includes(nome));
          return novos.length ? [...atual, ...novos] : atual;
        });
        setIngredientesApi((atual) => {
          const idsAtuais = new Set(atual.map((i) => i.id));
          const novos = ingredientesDoProduto.filter((i) => i && !idsAtuais.has(i.id));
          return [...atual, ...novos];
        });
      } catch (err) {
        console.error('Erro ao buscar ingredientes do produto:', err);
      }
    }

    buscarIngredientesDoProduto();
  }, [produtoId]);

  const handleEditar = async () => {
    if (!produtoId) return;

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
      pathFt,
      categoria: categoriaSelecionada
        ? { id: categoriaSelecionada.id, nome: categoriaSelecionada.nome }
        : { id: 0, nome: categoria },
    };

    try {
      setSalvando(true);
      setErroSalvar(null);

      const resposta = await fetch(`${API_BASE_URL}/produtos/${produtoId}`, {
        method: 'PUT',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
          ...authHeader(),
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
        console.error(`PUT ${API_BASE_URL}/produtos/${produtoId} falhou (${resposta.status}):`, detalhe);
        throw new Error(`Erro ${resposta.status} ao salvar produto`);
      }

      let pathFtAtual = payload.pathFt;

      // Se o usuário escolheu uma foto nova, envia agora que o produto já está salvo
      const falhasImagem = [];
      if (arquivoImagem) {
        try {
          const produtoComImagem = await enviarImagemProduto(produtoId, arquivoImagem);
          pathFtAtual = produtoComImagem?.pathFt || pathFtAtual;
          setPathFt(pathFtAtual);
          setArquivoImagem(null);
        } catch (err) {
          console.error('Erro ao enviar imagem do produto:', err);
          falhasImagem.push('imagem do produto');
        }
      }

      // Vincula na tabela produto_ingrediente cada ingrediente da lista que ainda não estava associado
      const produtoVinculo = {
        id: produtoId,
        nome: payload.nome,
        categoria: payload.categoria,
        precoUnidade: payload.precoUnidade,
        descricao: payload.descricao,
        pathFt: pathFtAtual,
      };

      const novosIngredientes = ingredientes.filter((nome) => !ingredientesVinculados.includes(nome));
      const ingredientesRemovidos = ingredientesVinculados.filter((nome) => !ingredientes.includes(nome));

      // Para cada ingrediente novo: acha o objeto {id, nome} já conhecido, ou (se foi digitado
      // direto no combobox como tag nova, sem passar pelo modal "+") cria na API antes de vincular.
      const resultadosVincular = await Promise.allSettled(
        novosIngredientes.map(async (nomeIngrediente) => {
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

      // Para cada ingrediente que estava vinculado e foi removido da lista, desfaz o vínculo na API
      const resultadosDesvincular = await Promise.allSettled(
        ingredientesRemovidos.map(async (nomeIngrediente) => {
          const ingredienteObj = ingredientesApi.find(
            (i) => i.nome?.trim().toLowerCase() === nomeIngrediente.trim().toLowerCase()
          );

          if (!ingredienteObj?.id) {
            throw new Error(`Ingrediente "${nomeIngrediente}" sem id válido, não foi possível remover`);
          }

          return desvincularIngredienteDoProduto(produtoId, ingredienteObj.id);
        })
      );

      const falhas = [...falhasImagem];
      const naoVinculados = [];
      resultadosVincular.forEach((resultado, indice) => {
        if (resultado.status === 'rejected') {
          console.error(`Erro ao vincular ingrediente "${novosIngredientes[indice]}":`, resultado.reason);
          falhas.push(novosIngredientes[indice]);
          naoVinculados.push(novosIngredientes[indice]);
        }
      });

      const naoRemovidos = [];
      resultadosDesvincular.forEach((resultado, indice) => {
        if (resultado.status === 'rejected') {
          console.error(`Erro ao remover ingrediente "${ingredientesRemovidos[indice]}":`, resultado.reason);
          falhas.push(ingredientesRemovidos[indice]);
          naoRemovidos.push(ingredientesRemovidos[indice]);
        }
      });

      // Reflete no estado só o que realmente ficou vinculado na API: a lista atual menos
      // o que falhou ao vincular, mais o que falhou ao remover (continua vinculado de fato).
      setIngredientesVinculados(
        Array.from(new Set([...ingredientes.filter((nome) => !naoVinculados.includes(nome)), ...naoRemovidos]))
      );

      if (falhas.length > 0) {
        // Mantém a tela de edição aberta para o usuário ver o erro e poder tentar de novo,
        // em vez de navegar para trás como se tudo tivesse dado certo.
        setErroSalvar(
          `Produto salvo, mas não foi possível salvar: ${falhas.join(', ')}. Veja o console (F12) para detalhes e tente novamente.`
        );
        return;
      }

      navigate('/produtos');
    } catch (err) {
      console.error('Erro ao editar produto:', err);
      setErroSalvar('Não foi possível salvar as alterações. Tente novamente.');
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
        ...authHeader(),
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
        if (criada?.id != null) {
          setCategoriasApi((atual) => [...atual, criada]);
        }
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
      try {
        setSalvandoModal(true);
        setErroModal(null);
        const criada = await criarNaApi('personalizacoes', nomeLimpo);
        const nomeSalvo = criada?.nome || nomeLimpo;
        if (!opcoesPersonalizacao.includes(nomeSalvo)) setOpcoesPersonalizacao([...opcoesPersonalizacao, nomeSalvo]);
        if (!personalizacoes.includes(nomeSalvo)) setPersonalizacoes([...personalizacoes, nomeSalvo]);
        if (criada?.id != null) {
          setPersonalizacoesApi((atual) => [...atual, criada]);
        }
        closeModal();
      } catch (err) {
        console.error('Erro ao criar personalização:', err);
        setErroModal('Não foi possível criar a personalização. Tente novamente.');
      } finally {
        setSalvandoModal(false);
      }
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
        {carregando && <p style={{ textAlign: 'center' }}>Carregando produto...</p>}
        {!carregando && erro && <p style={{ textAlign: 'center', color: '#B00020' }}>{erro}</p>}
        {erroSalvar && <p style={{ textAlign: 'center', color: '#B00020' }}>{erroSalvar}</p>}

        <ImageUpload
          title="Editar produtos"
          imageSrc={imagem || "https://images.unsplash.com/photo-1559525839-b184a4d698c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"}
          onFileSelect={handleSelecionarImagem}
        />

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

      <Footer onCadastrar={handleEditar} text={salvando ? 'Salvando...' : 'Editar'} disabled={salvando} />

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