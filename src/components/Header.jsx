import styles from "./Header.module.css"
function Header() {
    return(
        <header style={styles.header}>
            <div className="logo" >
                <h1>Teste</h1>
            </div>
            <div className="navigation">
                <h2>Cadastro</h2>
                <h2>Login</h2>
                <h2>Dashboard</h2>
            </div>
        </header>

    )
}
export default Header;