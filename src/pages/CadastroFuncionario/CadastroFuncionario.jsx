import styles from './CadastroFuncionario.module.css';
import { useEffect, useState } from "react";

function CadastroFuncionario() {

    function cadastrar() {
        var emailVar = nome_input ? nome_input.value : document.getElementById('email_input')?.value;
        var nomeVar = document.getElementById('nome_input')?.value;
        var senhaVar = document.getElementById('senha_input')?.value;

        if (emailVar == "" || senhaVar == "") {
            const cardErro = document.getElementById('div_erros_login')
            if (cardErro) cardErro.style.display = "block"
            const mensagem_erro = document.getElementById('mensagem_erro')
            if (mensagem_erro) mensagem_erro.innerHTML = "(todos os campos estão em branco)";
            
            return false;
        }
        else {
            setInterval(sumirMensagem, 5000)
        }

        console.log("FORM LOGIN: ", emailVar);
        console.log("FORM SENHA: ", senhaVar);

        fetch("http://localhost:8080/funcionario/cadastro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nome: nomeVar,
                email: emailVar,
                senha: senhaVar,
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

                    setTimeout(function () {
                        window.location = "./index.html";
                    }, 1000); // apenas para exibir o loading

                });

            } else {

                console.log("Houve um erro ao tentar realizar o login!");

                resposta.text().then(texto => {
                    console.error(texto);
                    
                });
            }

        }).catch(function (erro) {
            console.log(erro);
        })

        return false;
        
    }
    
    function sumirMensagem() {
        const cardErro = document.getElementById('div_erros_login')
        if (cardErro) cardErro.style.display = "none"
    }
    

    return (
        <> 
        <main className={styles.main}>
            <div className={styles.card}>
                <h2>Adicionar Funcionario</h2>
                <div className={styles.formulario}>
                    <div className={styles.campo}>
                        <span>Nome:</span>
                        <input id="nome_input" type="text" placeholder="Nome" />
                    </div>

                    <div className={styles.campo}>
                        <span>Email:</span>
                        <input id="email_input" type="text" placeholder="meuemail@provedor.com" />
                    </div>

                    <div className={styles.campo}>
                        <span>Senha:</span>
                        <input id="senha_input" type="password" placeholder="******" />
                    </div>
                    
                    <button className={styles.botao} onClick={cadastrar}>Adicionar</button>
                </div>
                <div id="div_aguardar" className={styles['loading-div']}>
                    <img src="./assets/circle-loading.gif" id="loading-gif" />
                </div>

                <div id="div_erros_login"></div>
            </div>
        </main>
        
        </>
    )
}

export default CadastroFuncionario
