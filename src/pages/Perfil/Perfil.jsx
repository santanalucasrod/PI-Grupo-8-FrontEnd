import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../providers/axiosClient.ts';
import { useAuth } from '../../providers/AuthProvider.jsx';
import { getUsuarioInfo, setUsuarioAtual } from '../../utils/userSession.js';
import styles from './Perfil.module.css';

function Perfil() {
  const { logout, login, usuario } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarErro, setMostrarErro] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);

  useEffect(() => {
    const dados = getUsuarioInfo();
    setNome(dados.nome || usuario?.nome || '');
    setEmail(dados.email || usuario?.email || '');
    setSenha('');
  }, [usuario]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function ativarEdicao() {
    setModoEdicao(true);
    setMostrarErro(false);
    setErro('');
  }

  function cancelarEdicao() {
    const dados = getUsuarioInfo();
    setNome(dados.nome || usuario?.nome || '');
    setEmail(dados.email || usuario?.email || '');
    setSenha('');
    setModoEdicao(false);
    setMostrarErro(false);
    setErro('');
  }

  function salvarPerfil() {
    if (!nome || !email) {
      setErro('Nome e email são obrigatórios.');
      setMostrarErro(true);
      return;
    }

    const usuarioAtual = getUsuarioInfo();
    const funcionarioId = usuarioAtual.id ?? usuario?.id ?? Number(localStorage.getItem('funcionarioId')) ?? null;

    if (!funcionarioId) {
      setErro('Não foi possível identificar o usuário logado.');
      setMostrarErro(true);
      return;
    }

    setCarregando(true);

    const payload = {
      nome,
      email,
      gerente: Boolean(usuario?.gerente ?? usuarioAtual.gerente ?? false),
    };

    if (senha) {
      payload.senha = senha;
    }

    api.put(
      `/funcionarios/crud/${funcionarioId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )
      .then((resposta) => {
        const dadosAtualizados = {
          ...(usuario ?? {}),
          id: funcionarioId,
          nome,
          email,
          gerente: Boolean(resposta.data?.gerente ?? usuario?.gerente ?? usuarioAtual.gerente ?? false),
        };

        setUsuarioAtual(dadosAtualizados);
        login({
          token: localStorage.getItem('token'),
          user: dadosAtualizados,
          gerente: dadosAtualizados.gerente,
        });

        setSenha('');
        setModoEdicao(false);
        setErro('Perfil atualizado com sucesso!');
        setMostrarErro(true);
      })
      .catch((error) => {
        console.error('Erro ao atualizar perfil:', error);
        setErro('Não foi possível atualizar o perfil.');
        setMostrarErro(true);
      })
      .finally(() => {
        setCarregando(false);
      });
  }

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <div className={styles.topo}>
          <h2 className={styles.titulo}>Perfil</h2>

          {!modoEdicao && (
            <button type="button" className={styles.botaoEditar} onClick={ativarEdicao} aria-label="Editar perfil">
              ✎
            </button>
          )}
        </div>

        <div className={styles.formulario}>
          <div className={styles.campo}>
            <span>Nome</span>
            {modoEdicao ? (
              <input
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Nome completo"
              />
            ) : (
              <label className={styles.labelValor}>{nome || 'Não informado'}</label>
            )}
          </div>

          <div className={styles.campo}>
            <span>Email</span>
            {modoEdicao ? (
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="meuemail@provedor.com"
              />
            ) : (
              <label className={styles.labelValor}>{email || 'Não informado'}</label>
            )}
          </div>

          <div className={styles.campo}>
            <span>Senha</span>
            {modoEdicao ? (
              <input
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Nova senha"
              />
            ) : (
              <label className={styles.labelValor}>••••••••</label>
            )}
          </div>
        </div>

        {modoEdicao && (
          <div className={styles.acoes}>
            <button type="button" className={styles.botaoSalvar} onClick={salvarPerfil} disabled={carregando}>
              {carregando ? 'Salvando...' : 'Salvar'}
            </button>

            <button type="button" className={styles.botaoCancelar} onClick={cancelarEdicao}>
              Cancelar
            </button>
          </div>
        )}

        {!modoEdicao && (
          <button type="button" className={styles.botaoLogout} onClick={handleLogout}>
            Logout
          </button>
        )}

        {mostrarErro && (
          <div className={styles.alerta_erro}>
            <div className={styles.card_erro}>
              <span>{erro}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Perfil;
