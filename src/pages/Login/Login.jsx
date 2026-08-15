import styles from './Login.module.css';
import { useState } from "react";

function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

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

        console.log("FORM LOGIN:", email);
        console.log("FORM SENHA:", senha);

        try {
            const resposta = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: senha,
                }),
            });
            if (resposta.ok) {
                const json = await resposta.json();

                console.log(json);
                localStorage.setItem("token", json.token);

                setTimeout(() => {
                    window.location = "./index.html";
                }, 1000);
            } else {
                setErro("Email ou Senha Inválidos");
                setMostrarErro(true);

                // setTimeout(sumirMensagem, 5000);

            }
        } catch (erro) {
            console.log(erro);
            setErro("Erro ao conectar com o servidor");
            setMostrarErro(true);

            setTimeout(sumirMensagem, 5000);
        }
    }

    return (
        <main>

            <div className={styles.login}>
                <div className={styles.alerta_erro}>
                    {   
                    mostrarErro && (
                        <div className={styles.card_erro}>
                            <span>{erro}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.card}>
                <h2>Acesso</h2>

                <div className={styles.formulario}>
                    <div className={styles.campo}>
                        <span>Email:</span>
                        <input
                            type="text"
                            placeholder="meuemail@provedor.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className={styles.campo}>
                        <span>Senha:</span>
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
        </main>
    );
}

export default Login;
