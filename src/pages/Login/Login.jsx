import styles from './Login.module.css';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider.jsx';
import Header from '../../components/Header/Header.jsx';

function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const navigate = useNavigate();
    const { login: loginAuth } = useAuth();

    const [erro, setErro] = useState("");
    const [mostrarErro, setMostrarErro] = useState(false);

    function sumirMensagem() {
        setMostrarErro(false);
        setErro("");
    }

    async function login() {
        if (email === "" || senha === "") {
            setErro("(todos os campos estão em branco)");
            setMostrarErro(true);

            setTimeout(sumirMensagem, 5000);
            return;
        }

        try {
            const resposta = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha,
                }),
            });
            if (resposta.ok) {
                const json = await resposta.json();
                const usuario = json?.usuario ?? json?.funcionario ?? json?.user ?? {};
                const gerente = json?.gerente ?? usuario?.gerente ?? usuario?.isGerente ?? false;

                localStorage.setItem("token", json.token);
                loginAuth({
                    token: json.token,
                    user: usuario,
                    gerente,
                });

                if (json.id != null) {
                    localStorage.setItem("funcionarioId", String(json.id));
                }

                setTimeout(() => {
                    navigate(gerente ? '/dashboard' : '/cardapio');
                }, 500);
            } else {
                setErro("Email ou Senha Inválidos");
                setMostrarErro(true);
            }
        } catch (erro) {
            console.log(erro);
            setErro("Erro ao conectar com o servidor");
            setMostrarErro(true);

            setTimeout(sumirMensagem, 5000);
        }
    }

    return (
        <>
            <Header />
            <main className={styles.main}>

            <div className={styles.alerta_erro}>
                {
                mostrarErro && (
                    <div className={styles.card_erro}>
                        <span>{erro}</span>
                    </div>
                )}
            </div>

            <div className={styles.card}>
                <div className={styles.imagem}>
                    <img
                        src="../fundo_cafe.jpg"
                        alt="Grãos de café"
                        className={styles.imagemFoto}
                    />
                </div>

                <div className={styles.conteudo}>
                    <h2>Acesso</h2>

                    <div className={styles.formulario}>
                        <div className={styles.campo}>
                            <span>Email</span>
                            <input
                                type="text"
                                placeholder="meuemail@provedor.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className={styles.campo}>
                            <span>Senha</span>
                            <input
                                type="password"
                                placeholder="******"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                            />
                        </div>

                        <button className={styles.botao} onClick={login}>
                            Acessar
                        </button>
                    </div>
                </div>
            </div>
        </main>
        </>
    );
}

export default Login;