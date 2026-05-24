import '../pages/Login.css' ;
import { useEffect, useState } from "react";
function Login() {
     
    function login() {
        var emailVar = email_input.value;
        var senhaVar = senha_input.value;

        if (emailVar == "" || senhaVar == "") {
            cardErro.style.display = "block"
            mensagem_erro.innerHTML = "(todos os campos estão em branco)";
            
            return false;
        }
        else {
            setInterval(sumirMensagem, 5000)
        }

        console.log("FORM LOGIN: ", emailVar);
        console.log("FORM SENHA: ", senhaVar);

        fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: emailVar,
                password: senhaVar
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
        cardErro.style.display = "none"
    }
    return (
        <>
        <header>
            
        </header>
        <main>
            <div className="login">
                <div className="alerta_erro">
                    <div className="card_erro" id="cardErro">
                        <span id="mensagem_erro"></span>
                    </div>
                </div>
            </div>
            <div className="card card-cadastro">
                <h2>Acesso</h2>
                <div className="formulario">
                    <div className="campo">
                        <span>Email:</span>
                        <input id="email_input" type="text" placeholder="meuemail@provedor.com" />
                    </div>

                    <div className="campo">
                        <span>Senha:</span>
                        <input id="senha_input" type="password" placeholder="******" />
                    </div>
                    
                    <button className="botao" onClick={login}>Acessar</button>
                </div>
                <div id="div_aguardar" className="loading-div">
                    <img src="./assets/circle-loading.gif" id="loading-gif" />
                </div>

                <div id="div_erros_login"></div>
            </div>
        </main>
        
        </>
    )
}

export default Login