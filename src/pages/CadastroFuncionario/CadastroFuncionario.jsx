import styles from './CadastroFuncionario.module.css';
import { useEffect, useState } from "react";

function CadastroFuncionario() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [nome, setNome] = useState("");

    const [erro, setErro] = useState("");
    const [mostrarErro, setMostrarErro] = useState(false);

    function sumirMensagem() {
        setMostrarErro(false);
        setErro("");
    }


    function cadastrar() {
        if (nome === "" || email === "" || senha === "") {
            setErro("Todos os campos devem ser preenchidos!");
            setMostrarErro(true);

            setTimeout(() => {
                setMostrarErro(false);
                setErro("");
            }, 5000);

            return;
        }

        console.log("FORM LOGIN: ", email);
        console.log("FORM SENHA: ", senha);

        fetch("http://localhost:8080/funcionario/cadastro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nome: nome,
                email: email,
                senha: senha,
                gerente: false
            })
        }).then(function (resposta) {
            console.log("ESTOU NO THEN DO entrar()!")

            if (resposta.ok) {
                console.log(resposta);

                resposta.json().then(json => {
                    console.log(json);
                    console.log(JSON.stringify(json));
                    localStorage.token = json.token;

                    setErro("Funcionário cadastrado com sucesso!");
                    setMostrarErro(true);
                    setTimeout(function () {
                        window.location = "./index.html";
                    }, 1000); // apenas para exibir o loading

                });

            } else {

                setErro("Não foi possível cadastrar o funcionário.");
                setMostrarErro(true);

                setTimeout(() => {
                    setMostrarErro(false);
                    setErro("");
                }, 5000);
            }

        }).catch(function (erro) {
            console.log(erro);

            setErro("Erro ao conectar com o servidor.");
            setMostrarErro(true);

            setTimeout(() => {
                setMostrarErro(false);
                setErro("");
            }, 5000);
        })

        return false;

    }


    return (
        <>
            <main className={styles.main}>
                <div className={styles.card}>
                    <h2>Adicionar Funcionario</h2>
                    <div className={styles.formulario}>
                        <div className={styles.campo}>
                            <span>Nome:</span>
                            <input
                                id="nome_input"
                                type="text"
                                placeholder="Nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                        </div>

                        <div className={styles.campo}>
                            <span>Email:</span>
                            <input
                                id="email_input"
                                type="text"
                                placeholder="meuemail@provedor.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className={styles.campo}>
                            <span>Senha:</span>
                            <input
                                id="senha_input"
                                type="password"
                                placeholder="******"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                            />
                        </div>

                        <button className={styles.botao} onClick={cadastrar}>Adicionar</button>
                    </div>
                    <div id="div_aguardar" className={styles['loading-div']}>
                        <img src="./assets/circle-loading.gif" id="loading-gif" />
                    </div>

                    {mostrarErro && (
                        <div className={styles.alerta_erro}>
                            <div className={styles.card_erro}>
                                <span>{erro}</span>
                            </div>
                        </div>
                    )}


                </div>
            </main>

        </>
    )
}

export default CadastroFuncionario
