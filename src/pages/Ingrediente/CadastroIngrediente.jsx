import styles from './CadastroIngrediente.module.css';
import { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Formulario from '../../components/Formulario/Formulario';
import Header from '../../components/CadastrarProduto/Header';

function CadastroIngrediente() {
    const location = useLocation();
    const navigate = useNavigate();
    const dadosEdicao = location.state?.item ?? null;
    const estaEditando = location.state?.editar ?? null;
    const [nome, setNome] = useState(dadosEdicao?.nome ?? '');

    const [erro, setErro] = useState('');
    const [mostrarErro, setMostrarErro] = useState(false);

    function cadastrar() {
        if (nome === '') {
            setErro('Todos os campos devem ser preenchidos!');
            setMostrarErro(true);

            setTimeout(() => {
                setMostrarErro(false);
                setErro('');
            }, 5000);

            return;
        }

        if (estaEditando) {
            axios.put(
                `http://localhost:8080/ingredientes/${dadosEdicao.id}`,
                { nome },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            )
                .then(() => {
                    setErro('Ingrediente atualizado com sucesso!');
                    setMostrarErro(true);

                    setTimeout(() => navigate('/ingredientes'), 1000);
                })
                .catch(() => {
                    setErro('Erro ao atualizar ingrediente.');
                    setMostrarErro(true);

                    setTimeout(() => {
                        setMostrarErro(false);
                        setErro('');
                    }, 5000);
                });
        } else {
            axios.post(
                'http://localhost:8080/ingredientes',
                { nome },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            )
                .then(() => {
                    setErro('Ingrediente cadastrado com sucesso!');
                    setMostrarErro(true);

                    setTimeout(() => navigate('/ingredientes'), 1000);
                })
                .catch(() => {
                    setErro('Erro ao cadastrar ingrediente.');
                    setMostrarErro(true);

                    setTimeout(() => {
                        setMostrarErro(false);
                        setErro('');
                    }, 5000);
                });
        }
    }

    const campos = [
        {
            nome: 'Nome',
            placeholder: 'Nome',
            tipo: 'text',
            valor: nome,
            setValor: setNome
        }
    ];

    const titulo = estaEditando ? 'Editar Ingrediente' : 'Adicionar Ingrediente';

    return (
        <>
        <Header title={titulo} onCancel={() => navigate('/ingredientes')} />
        <main className={styles.main}>
            <Formulario
                campos={campos}
                titulo={titulo}
                cadastrar={cadastrar}
                erro={erro}
                mostrarErro={mostrarErro}
                textoBotao={estaEditando ? 'Editar' : 'Adicionar'}
                />
        </main>
        </>
    );
}

export default CadastroIngrediente;
