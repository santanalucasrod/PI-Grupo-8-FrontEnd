import styles from "./Formulario.module.css";

function Formulario({
    campos,
    titulo,
    cadastrar,
    erro,
    mostrarErro
}) {
    return (
        <div className={styles.card}>
            <h2>{titulo}</h2>

            <div className={styles.formulario}>

                {campos.map((campo) => (
                    <div className={styles.campo} key={campo.nome}>
                        <span>
                            {campo.nome}:
                        </span>

                        <input
                            id={`${campo.nome}_input`}
                            type={campo.tipo}
                            placeholder={campo.placeholder}
                            value={campo.valor}
                            onChange={(e) => campo.setValor(e.target.value)}
                        />
                    </div>
                ))}

                <button
                    className={styles.botao}
                    onClick={cadastrar}
                >
                    Adicionar
                </button>

            </div>

            <div
                id="div_aguardar"
                className={styles['loading-div']}
            >
                <img
                    src="./assets/circle-loading.gif"
                    id="loading-gif"
                />
            </div>

            {mostrarErro && (
                <div className={styles.alerta_erro}>
                    <div className={styles.card_erro}>
                        <span>{erro}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Formulario;