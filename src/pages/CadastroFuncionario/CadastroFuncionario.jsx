import styles from './CadastroFuncionario.module.css';
import axios from 'axios';
import { useEffect, useState } from "react";
import Formulario from '../../components/Formulario/Formulario';

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

        axios.post("http://localhost:8080/funcionario/cadastro", {
            nome: nome,
            email: email,
            senha: senha,
            gerente: false

        }).then(function (resposta) {
            console.log("ESTOU NO THEN DO CADASTRO!");

            console.log(resposta);
            console.log(resposta.data);

            localStorage.token = resposta.data.token;

            setErro("Funcionário cadastrado com sucesso!");
            setMostrarErro(true);

            setTimeout(function () {
                window.location = "./index.html";
            }, 1000);

        }).catch(function (erro) {
            console.log(erro);

            setErro("Erro ao conectar com o servidor.");
            setMostrarErro(true);

            setTimeout(() => {
                setMostrarErro(false);
                setErro("");
            }, 5000);
        })

    }

    campos = [
        {
            nome: "nome",
            placeholder: "Digite seu nome",
            tipo: "text"
        },
        {
            nome: "email",
            placeholder: "Digite seu email",
            tipo: "email"
        }
    ]
    titulo = "Adicionar Funcionarios"
    

    return (
        <>
            <main className={styles.main}>
                <Formulario
                    campos={campos}
                    titulo={titulo}
                    cadastrar={cadastrar}
                />
            </main>

        </>
    )
}

export default CadastroFuncionario
