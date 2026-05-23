import Cadastro from '../components/Cadastro';
import '../pages/Login.css' ;
function Login() {

    function cadastrar() {
        console.log("Botão clicado")
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
                    
                    <button className="botao" onClick={cadastrar}>Acessar</button>
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