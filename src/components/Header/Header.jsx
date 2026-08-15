// import styles from "./Header.module.css"
import "../Header/Header.css";
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom'
function Header() {
    return(
        <header >
            <div className="logo"  >
                <div className="logo-circle">K</div>
                <h1 className="company-name">Kento Café</h1>
            </div>
            <div className="navigation">
                <Link to="/cadastro"  className="link">Cadastro</Link>
                <Link to="/login" className="link" >Login</Link>
                <Link to="/dashboard"  className="link">Dashboard</Link>
            </div>
        </header>

    )
}
export default Header;