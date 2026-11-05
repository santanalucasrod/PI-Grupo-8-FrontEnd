import { useEffect, useRef, useState } from 'react';
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
import { enviarImagemProduto } from './produtoImagemApi';
import { buscarCatalogo, buscarListaProduto, requisitarProduto, sincronizarTamanhos } from './produtoApi';

const CATALOGOS = {
  categoria: { endpoint: 'categorias', titulo: 'Categoria', limite: LIMITES.categoria },
  ingrediente: { endpoint: 'ingredientes', titulo: 'Ingredientes', limite: LIMITES.ingrediente },
  personalizacao: { endpoint: 'personalizacoes', titulo: 'Personalização', limite: LIMITES.personalizacao },
};

function unirRegistros(catalogo, vinculados) {
  return [...new Map([...catalogo, ...vinculados].map((item) => [item.id, item])).values()];
}

export default function FormularioProduto({ produtoId }) {
  const navigate = useNavigate();
  const envioEmAndamento = useRef(false);
  const editando = produtoId !== undefined;
  const [idSalvo, setIdSalvo] = useState(produtoId);
  const [produto, setProduto] = useState({ nome: '', preco: '', descricao: '', categoria: '', categoriaId: null });
  const [catalogos, setCatalogos] = useState({ categoria: [], ingrediente: [], personalizacao: [] });
  const [selecionados, setSelecionados] = useState({ ingrediente: [], personalizacao: [] });
  const [tamanhos, setTamanhos] = useState([]);
  const [precosTamanho, setPrecosTamanho] = useState({});
  const [pathFt, setPathFt] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [preview, setPreview] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState('');
  const [erros, setErros] = useState({});
  const [modal, setModal] = useState(null);
  const [salvandoModal, setSalvandoModal] = useState(false);
  const [erroModal, setErroModal] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    async function carregar() {
      try {
        if (editando && (!Number.isSafeInteger(produtoId) || produtoId <= 0)) throw new Error('Produto inválido.');
        const [categorias, ingredientes, personalizacoes, catalogoTamanhos, dados, vinculados, personalizacoesProduto, tamanhosProduto] = await Promise.all([
          buscarCatalogo('/categorias', signal), buscarCatalogo('/ingredientes', signal),
          buscarCatalogo('/personalizacoes', signal), buscarListaProduto('/tamanhos', signal),
          editando ? requisitarProduto(`/produtos/${produtoId}`, { signal }) : null,
          editando ? buscarListaProduto(`/produtos/${produtoId}/ingredientes`, signal) : [],
          editando ? buscarListaProduto(`/produtos/${produtoId}/personalizacoes`, signal) : [],
          editando ? buscarListaProduto(`/produtos/${produtoId}/tamanhos`, signal) : [],
        ]);
        if (signal.aborted) return;
        setCatalogos({
          categoria: unirRegistros(categorias, dados?.categoria ? [dados.categoria] : []),
          ingrediente: unirRegistros(ingredientes, vinculados),
          personalizacao: unirRegistros(personalizacoes, personalizacoesProduto),
        });
        setTamanhos(unirRegistros(catalogoTamanhos, tamanhosProduto.map((item) => ({ id: item.tamanhoId, nome: item.nomeTamanho, volumeMl: item.volumeMl }))));
        if (dados) {
          setProduto({ nome: dados.nome ?? '', preco: String(dados.precoUnidade ?? ''), descricao: dados.descricao ?? '', categoria: dados.categoria?.nome ?? '', categoriaId: dados.categoria?.id ?? null });
          setPathFt(dados.pathFt ?? '');
          setSelecionados({ ingrediente: vinculados.map((item) => item.id), personalizacao: personalizacoesProduto.map((item) => item.id) });
          setPrecosTamanho(Object.fromEntries(tamanhosProduto.map((item) => [item.tamanhoId, String(item.precoUnidade)])));
        }
      } catch (erro) {
        if (!signal.aborted) setErroCarga(erro.status === 404 ? 'Produto não encontrado. Volte à lista e escolha outro produto.' : 'Não foi possível carregar todos os dados do formulário. Tente novamente antes de salvar.');
      } finally {
        if (!signal.aborted) setCarregando(false);
      }
    }
    carregar();
    return () => controller.abort();
  }, [editando, produtoId, tentativa]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function alterar(campo, valor) {
    setProduto((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  function selecionar(tipo, valor) {
    const item = catalogos[tipo].find((opcao) => String(opcao.id) === String(valor));
    if (!item) return;
    if (tipo === 'categoria') {
      setProduto((atual) => ({ ...atual, categoria: item.nome, categoriaId: item.id }));
      setErros((atual) => ({ ...atual, categoria: undefined }));
    }
    else setSelecionados((atual) => ({ ...atual, [tipo]: [...new Set([...atual[tipo], item.id])] }));
  }

  async function criarOpcao(nome) {
    if (salvandoModal) return;
    const tipo = modal;
    try {
      setSalvandoModal(true);
      setErroModal('');
      const criada = await requisitarProduto(`/${CATALOGOS[tipo].endpoint}`, { method: 'POST', body: { nome: nome.trim() } });
      if (!criada?.id || !criada.nome) throw new Error('Registro inválido.');
      setCatalogos((atual) => ({ ...atual, [tipo]: unirRegistros(atual[tipo], [criada]) }));
      if (tipo === 'categoria') {
        setProduto((atual) => ({ ...atual, categoria: criada.nome, categoriaId: criada.id }));
        setErros((atual) => ({ ...atual, categoria: undefined }));
      }
      else setSelecionados((atual) => ({ ...atual, [tipo]: [...new Set([...atual[tipo], criada.id])] }));
      setModal(null);
    } catch {
      setErroModal('Não foi possível cadastrar. Verifique o nome e tente novamente.');
    } finally { setSalvandoModal(false); }
  }

  async function salvar() {
    if (envioEmAndamento.current || carregando || erroCarga) return;
    const encontrados = validarProduto(produto);
    const categoria = catalogos.categoria.find((item) => item.id === produto.categoriaId);
    if (!categoria?.id) encontrados.categoria = 'Selecione uma categoria cadastrada ou use o botão + para criar.';
    const tamanhosSelecionados = Object.entries(precosTamanho).map(([id, precoUnidade]) => ({ tamanhoId: Number(id), precoUnidade }));
    if (tamanhosSelecionados.some((item) => !/^\d{1,3}(\.\d{1,2})?$/.test(item.precoUnidade) || Number(item.precoUnidade) <= 0)) {
      encontrados.tamanhos = 'Informe um preço entre R$ 0,01 e R$ 999,99 para cada tamanho selecionado.';
    }
    setErros(encontrados);
    if (Object.keys(encontrados).length) return;
    envioEmAndamento.current = true;
    setSalvando(true);
    setErroSalvar('');
    const novo = !idSalvo;
    try {
      const dados = await requisitarProduto(novo ? '/produtos' : `/produtos/${idSalvo}`, {
        method: novo ? 'POST' : 'PUT',
        body: { nome: produto.nome.trim(), precoUnidade: Number(produto.preco), descricao: produto.descricao.trim(), categoria: { id: categoria.id, nome: categoria.nome } },
      });
      if (!dados?.id) throw new Error('Produto retornado sem ID.');
      setIdSalvo(dados.id);
      const falhas = [];
      // Salva relações em sequência: as transações compartilham a entidade Produto.
      for (const [tipo, endpoint] of [['ingrediente', 'ingredientes'], ['personalizacao', 'personalizacoes']]) {
        try { await requisitarProduto(`/produtos/${dados.id}/${endpoint}`, { method: 'PUT', body: selecionados[tipo] }); }
        catch { falhas.push(endpoint); }
      }
      try { await sincronizarTamanhos(dados.id, tamanhosSelecionados); }
      catch { falhas.push('tamanhos e preços'); }
      if (arquivo) {
        try {
          const atualizado = await enviarImagemProduto(dados.id, arquivo);
          setPathFt(atualizado.pathFt ?? '');
          setArquivo(null);
          setPreview('');
        } catch { falhas.push('foto'); }
      }
      if (falhas.length) {
        setErroSalvar(`O produto foi salvo, mas faltou salvar: ${falhas.join(', ')}. Tente salvar novamente para concluir.`);
        return;
      }
      navigate('/produtos', { state: novo ? { produtoCriado: dados } : null });
    } catch {
      setErroSalvar('Não foi possível salvar o produto. Seus dados foram mantidos para tentar novamente.');
    } finally { envioEmAndamento.current = false; setSalvando(false); }
  }

  return (
    <div className={styles.container}>
      <Header title="Produtos" onCancel={() => { if (!salvando) navigate('/produtos'); }} />
      <main className={styles.mainContent}>
        {carregando && <p role="status">Carregando dados do formulário...</p>}
        {erroCarga && <div className={styles.aviso} role="alert"><p>{erroCarga}</p><button type="button" onClick={() => { setErroCarga(''); setCarregando(true); setTentativa((atual) => atual + 1); }}>Tentar novamente</button></div>}
        {!carregando && !erroCarga && <>
          <ImageUpload title={editando ? 'Editar produto' : 'Cadastrar produto'} produtoId={idSalvo} pathFt={pathFt} imageSrc={preview} onFileSelect={(imagem) => { if (!salvando) { setArquivo(imagem); setPreview(URL.createObjectURL(imagem)); } }} />
          {erroSalvar && <p className={styles.aviso} role="alert">{erroSalvar}</p>}
          <form className={styles.form} onSubmit={(evento) => { evento.preventDefault(); salvar(); }}>
            <fieldset className={styles.campos} disabled={salvando}>
              <Input label="Nome do produto" value={produto.nome} onChange={(e) => alterar('nome', e.target.value)} maxLength={LIMITES.nome} error={erros.nome} />
              <Input label="Preço" value={produto.preco} onChange={(e) => alterar('preco', e.target.value)} type="number" min="0.01" max="999.99" step="0.01" error={erros.preco} />
              <TextArea label="Descrição" value={produto.descricao} onChange={(e) => alterar('descricao', e.target.value)} maxLength={LIMITES.descricao} error={erros.descricao} />
              {Object.entries(CATALOGOS).map(([tipo, config]) => <SelectGroup
                key={tipo} label={config.titulo} value={tipo === 'categoria' ? produto.categoriaId : ''}
                onChange={(e) => selecionar(tipo, e.target.value)} options={catalogos[tipo].map((item) => ({ value: item.id, label: item.nome }))}
                onAdd={() => { setErroModal(''); setModal(tipo); }}
                items={tipo === 'categoria' ? undefined : catalogos[tipo].filter((item) => selecionados[tipo].includes(item.id))}
                onRemove={(removerId) => setSelecionados((atual) => ({ ...atual, [tipo]: atual[tipo].filter((id) => id !== removerId) }))}
                maxLength={config.limite} error={tipo === 'categoria' ? erros.categoria : undefined}
              />)}
              <section className={styles.tamanhos} aria-labelledby="titulo-tamanhos">
                <h3 id="titulo-tamanhos">Tamanhos e preços</h3>
                <p>Selecione os tamanhos disponíveis e informe o preço de cada um.</p>
                {tamanhos.length === 0 && <p>Nenhum tamanho cadastrado.</p>}
                {tamanhos.map((item) => <div className={styles.tamanho} key={item.id}>
                  <label><input type="checkbox" checked={Object.hasOwn(precosTamanho, item.id)} onChange={(e) => setPrecosTamanho((atual) => {
                    const proximo = { ...atual };
                    if (e.target.checked) proximo[item.id] = produto.preco;
                    else delete proximo[item.id];
                    return proximo;
                  })} /> {item.nome}{item.volumeMl ? ` · ${item.volumeMl} ml` : ''}</label>
                  {Object.hasOwn(precosTamanho, item.id) && <input aria-label={`Preço ${item.nome}`} type="number" min="0.01" max="999.99" step="0.01" value={precosTamanho[item.id]} onChange={(e) => setPrecosTamanho((atual) => ({ ...atual, [item.id]: e.target.value }))} />}
                </div>)}
                {erros.tamanhos && <p className={styles.aviso} role="alert">{erros.tamanhos}</p>}
              </section>
            </fieldset>
          </form>
        </>}
      </main>
      <Footer onCadastrar={salvar} text={salvando ? 'Salvando...' : editando || idSalvo ? 'Salvar alterações' : 'Cadastrar'} disabled={carregando || Boolean(erroCarga) || salvando || salvandoModal} />
      {modal && <ModalAdicionar isOpen title={`Adicionar ${CATALOGOS[modal].titulo}`} maxLength={CATALOGOS[modal].limite} onClose={() => setModal(null)} onAdd={criarOpcao} salvando={salvandoModal} erro={erroModal} />}
    </div>
  );
}
