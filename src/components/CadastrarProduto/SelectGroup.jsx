import { useState, useEffect, useRef, useMemo } from 'react';
import styles from './SelectGroup.module.css';

// Extrai o texto exibido de uma opção, aceitando string simples ou { value, label }
function getOptionText(opt) {
  if (opt == null) return '';
  if (typeof opt === 'string') return opt;
  return opt.label ?? opt.value ?? String(opt);
}

// Combobox com busca (digitar para filtrar) e criação de novas opções (tagging),
// no estilo do select2 (https://select2.org/tagging/), mantendo o design original do select.
export default function SelectGroup({ label, value, onChange, options, onAdd, items, onRemove, maxLength, error }) {
  const [inputValue, setInputValue] = useState(getOptionText(value) || '');
  const [aberto, setAberto] = useState(false);
  const [extraOpcoes, setExtraOpcoes] = useState([]);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Mantém o texto do input sincronizado quando o valor vem de fora (ex.: fetch da API)
  useEffect(() => {
    setInputValue(getOptionText(value) || '');
  }, [value]);

  // Combina as opções vindas por props com as criadas localmente via digitação, sem duplicar
  const opcoesCombinadas = useMemo(() => {
    const vistas = new Set();
    const resultado = [];
    [...(options || []), ...extraOpcoes].forEach((opt) => {
      const texto = getOptionText(opt);
      const chave = texto.trim().toLowerCase();
      if (chave && !vistas.has(chave)) {
        vistas.add(chave);
        resultado.push(texto);
      }
    });
    return resultado;
  }, [options, extraOpcoes]);

  const termoBusca = inputValue.trim().toLowerCase();

  const opcoesFiltradas = termoBusca
    ? opcoesCombinadas.filter((opt) => opt.toLowerCase().includes(termoBusca))
    : opcoesCombinadas;

  const existeCorrespondenciaExata = opcoesCombinadas.some(
    (opt) => opt.toLowerCase() === termoBusca
  );

  const podeCriarNovaTag = termoBusca.length > 0 && !existeCorrespondenciaExata;

  const dispararChange = (novoValor) => {
    if (onChange) {
      onChange({ target: { value: novoValor } });
    }
  };

  const selecionarOpcao = (opcaoTexto) => {
    setInputValue(opcaoTexto);
    setAberto(false);
    setIndiceAtivo(-1);
    dispararChange(opcaoTexto);
  };

  const criarNovaTag = (texto) => {
    const textoLimpo = texto.trim();
    if (!textoLimpo) return;

    const jaExiste = opcoesCombinadas.some((opt) => opt.toLowerCase() === textoLimpo.toLowerCase());
    if (!jaExiste) {
      setExtraOpcoes((atual) => [...atual, textoLimpo]);
    }
    selecionarOpcao(textoLimpo);
  };

  const confirmarEntrada = () => {
    if (indiceAtivo >= 0 && opcoesFiltradas[indiceAtivo]) {
      selecionarOpcao(opcoesFiltradas[indiceAtivo]);
      return;
    }

    if (existeCorrespondenciaExata) {
      const opcaoExata = opcoesCombinadas.find((opt) => opt.toLowerCase() === termoBusca);
      selecionarOpcao(opcaoExata);
      return;
    }

    if (podeCriarNovaTag) {
      criarNovaTag(inputValue);
      return;
    }

    setAberto(false);
  };

  const handleInputChange = (e) => {
    const novoValor = maxLength ? e.target.value.slice(0, maxLength) : e.target.value;
    setInputValue(novoValor);
    setAberto(true);
    setIndiceAtivo(-1);
  };

  const handleFocus = () => {
    setAberto(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAberto(true);
      setIndiceAtivo((atual) => {
        const total = opcoesFiltradas.length + (podeCriarNovaTag ? 1 : 0);
        return total === 0 ? -1 : (atual + 1) % total;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAberto(true);
      setIndiceAtivo((atual) => {
        const total = opcoesFiltradas.length + (podeCriarNovaTag ? 1 : 0);
        if (total === 0) return -1;
        return atual <= 0 ? total - 1 : atual - 1;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (indiceAtivo === opcoesFiltradas.length && podeCriarNovaTag) {
        criarNovaTag(inputValue);
      } else {
        confirmarEntrada();
      }
    } else if (e.key === 'Escape') {
      setAberto(false);
      setIndiceAtivo(-1);
      setInputValue(getOptionText(value) || '');
    }
  };

  // Fecha o dropdown ao clicar fora do componente
  useEffect(() => {
    function handleClickFora(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAberto(false);
        setIndiceAtivo(-1);
      }
    }

    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const mostrarDropdown = aberto && (opcoesFiltradas.length > 0 || podeCriarNovaTag);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.header}>
        <label className={styles.label}>{label}</label>
        {onAdd && (
          <button className={styles.btnAdd} onClick={onAdd} type="button">
            +
          </button>
        )}
      </div>

      <div className={styles.selectWrapper}>
        <input
          ref={inputRef}
          type="text"
          className={`${styles.select} ${error ? styles.selectError : ''}`}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Digite para buscar..."
          autoComplete="off"
          maxLength={maxLength}
        />
        <span className={styles.arrowIcon}>▼</span>

        {mostrarDropdown && (
          <ul className={styles.dropdownList}>
            {opcoesFiltradas.map((opt, idx) => (
              <li
                key={opt}
                className={`${styles.dropdownItem} ${idx === indiceAtivo ? styles.dropdownItemAtivo : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selecionarOpcao(opt);
                }}
                onMouseEnter={() => setIndiceAtivo(idx)}
              >
                {opt}
              </li>
            ))}

            {podeCriarNovaTag && (
              <li
                className={`${styles.dropdownItem} ${styles.dropdownItemNovo} ${
                  indiceAtivo === opcoesFiltradas.length ? styles.dropdownItemAtivo : ''
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  criarNovaTag(inputValue);
                }}
                onMouseEnter={() => setIndiceAtivo(opcoesFiltradas.length)}
              >
                + Adicionar "{inputValue.trim()}"
              </li>
            )}
          </ul>
        )}
      </div>

      {error && <span className={styles.errorText}>{error}</span>}

      {items && items.length > 0 && (
        <ul className={styles.itemList}>
          {items.map((item, idx) => (
            <li key={idx} className={styles.item}>
              <span className={styles.itemText}>{item}</span>
              <button className={styles.btnRemove} onClick={() => onRemove(item)} type="button">
                -
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
