import Cadastro from '../components/Cadastro';
import '../styles/SignUp.css' ;
function SignUp() {
    return (

        <main>
            <div class="login">
                <div class="alerta_erro">
                    <div class="card_erro" id="cardErro">
                        <span id="mensagem_erro"></span>
                    </div>
                </div>
            </div>
            <div class="card card-cadastro">
                <h2>Bem-vindo!</h2>
                <div class="formulario">
                    <div class="campo">
                        <span>Nome:</span>
                        <input id="nome_input" type="text" placeholder="Seu nome" />
                    </div>
                    <div class="campo">
                        <span>E-mail:</span>
                        <input id="email_input" type="text" placeholder="meuemail@provedor.com" />
                    </div>

                    <div class="campo">
                        <span>Senha:</span>
                        <input id="senha_input" type="password" placeholder="******" />
                    </div>
                    <div class="campo">
                        <span>Confirmação da Senha:</span>
                        <input id="confirmacao_senha_input" type="password" placeholder="******" />
                        <a href="login.html">Já me cadastrei</a>
                    </div>
                    <button class="botao" onclick="cadastrar()">Cadastrar</button>
                </div>
                <div id="div_aguardar" class="loading-div">
                    <img src="./assets/circle-loading.gif" id="loading-gif" />
                </div>

                <div id="div_erros_login"></div>
            </div>
        </main>

    )
}

export default SignUp