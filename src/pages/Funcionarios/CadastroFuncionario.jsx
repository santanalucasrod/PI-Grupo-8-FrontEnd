import styles from './CadastroFuncionario.module.css';
import { useEffect, useState } from "react";
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Formulario from '../../components/Formulario/Formulario';

function CadastroFuncionario() {
    const location = useLocation();
    const navigate = useNavigate();
    const dadosEdicao = location.state?.funcionario ?? null;
    const estaEditando =location.state?.editar ?? null;
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [nome, setNome] = useState("");

    const [erro, setErro] = useState("");
    const [mostrarErro, setMostrarErro] = useState(false);

    useEffect(() => {
        if (estaEditando && dadosEdicao) {
            setNome(dadosEdicao.nome ?? "");
            setEmail(dadosEdicao.email ?? "");
        }
    }, [dadosEdicao, estaEditando]);

    function sumirMensagem() {
        setMostrarErro(false);
        setErro("");
    }


    function cadastrar() {
        if (nome === "" || email === "" || (!estaEditando && senha === "")) {
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
        if (estaEditando) {

            axios.put(
                `http://localhost:8080/funcionarios/crud/${dadosEdicao.id}`,

                {
                    nome: nome,
                    email: email,
                    senha: senha,
                    gerente: false
                },

                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            )
                .then(function (resposta) {
                    console.log("FUNCIONÁRIO ATUALIZADO!");
                    console.log(resposta);
                    console.log(resposta.data);

                    setErro("Funcionário atualizado com sucesso!");
                    setMostrarErro(true);

                    setTimeout(function () {
                        navigate("/funcionarios");
                    }, 1000);
                })
                .catch(function (erro) {
                    console.log(erro);

                    setErro("Erro ao atualizar funcionário.");
                    setMostrarErro(true);

                    setTimeout(function () {
                        setMostrarErro(false);
                        setErro("");
                    }, 5000);
                });

        } else {

            axios.post(
                "http://localhost:8080/funcionarios/cadastro",

                {
                    nome: nome,
                    email: email,
                    senha: senha,
                    gerente: false
                },

                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            )
                .then(function (resposta) {
                    console.log("FUNCIONÁRIO CADASTRADO!");
                    console.log(resposta);
                    console.log(resposta.data);

                    if (resposta.data?.token) {
                        localStorage.token = resposta.data.token;
                    }

                    setErro("Funcionário cadastrado com sucesso!");
                    setMostrarErro(true);

                    setTimeout(function () {
                        navigate("/funcionarios");
                    }, 1000);
                })
                .catch(function (erro) {
                    console.log(erro);

                    setErro("Erro ao cadastrar funcionário.");
                    setMostrarErro(true);

                    setTimeout(function () {
                        setMostrarErro(false);
                        setErro("");
                    }, 5000);
                });
        }

    }

    const campos = [
        {
            nome: "Nome",
            placeholder: "Nome",
            tipo: "text",
            valor: nome,
            setValor: setNome
        },
        {
            nome: "Email",
            placeholder: "meuemail@provedor.com",
            tipo: "email",
            valor: email,
            setValor: setEmail
        },
        {
            nome: "Senha",
            placeholder: "******",
            tipo: "password",
            valor: senha,
            setValor: setSenha
        }
    ]
    const titulo = estaEditando ? "Editar Funcionário" : "Adicionar Funcionários";


    return (
        <>
            <main className={styles.main}>
                <Formulario
                    campos={campos}
                    titulo={titulo}
                    cadastrar={cadastrar}
                    erro={erro}
                    mostrarErro={mostrarErro}
                    textoBotao={estaEditando ? "Editar" : "Adicionar"}
                />
            </main>

        </>
    )
}

export default CadastroFuncionario