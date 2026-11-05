import { useId, useRef, useState, useEffect } from 'react';
import styles from './SelectGroup.module.css';

// Busca apenas registros persistidos. Novos registros são criados pelo modal +.
export default function SelectGroup({ label, value, onChange, options = [], onAdd, items, onRemove, maxLength, error }) {
  const id = useId();
  const containerRef = useRef(null);
  const [busca, setBusca] = useState(null);
  const [aberto, setAberto] = useState(false);
  const [indice, setIndice] = useState(-1);
  const nomeSelecionado = options.find((opcao) => String(opcao.value) === String(value))?.label ?? '';
  const texto = busca ?? nomeSelecionado;
  const filtradas = options.filter((opcao) => opcao.label.toLocaleLowerCase('pt-BR').includes(texto.trim().toLocaleLowerCase('pt-BR')));

  useEffect(() => {
    function fechar(evento) {
      if (!containerRef.current?.contains(evento.target)) {
        setAberto(false);
        setBusca(null);
        setIndice(-1);
      }
    }
    document.addEventListener('mousedown', fechar);
    return () => document.removeEventListener('mousedown', fechar);
  }, []);

  function selecionar(opcao) {
    onChange?.({ target: { value: opcao.value } });
    setBusca(null);
    setAberto(false);
    setIndice(-1);
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.header}>
        <label className={styles.label} htmlFor={id}>{label}</label>
        {onAdd && <button className={styles.btnAdd} onClick={onAdd} type="button" aria-label={`Adicionar ${label.toLowerCase()}`}>+</button>}
      </div>
      <div className={styles.selectWrapper}>
        <input id={id} type="text" role="combobox" aria-expanded={aberto} aria-controls={`${id}-opcoes`} aria-autocomplete="list"
          aria-activedescendant={aberto && indice >= 0 ? `${id}-${indice}` : undefined}
          aria-invalid={Boolean(error)} className={`${styles.select} ${error ? styles.selectError : ''}`}
          value={texto} placeholder="Digite para buscar..." autoComplete="off" maxLength={maxLength}
          onChange={(e) => { setBusca(e.target.value); setAberto(true); setIndice(-1); }}
          onFocus={() => { setBusca(''); setAberto(true); }}
          onBlur={(e) => { if (!containerRef.current?.contains(e.relatedTarget)) { setAberto(false); setBusca(null); } }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              setAberto(true);
              setIndice((atual) => filtradas.length ? (atual + (e.key === 'ArrowDown' ? 1 : filtradas.length - 1) + filtradas.length) % filtradas.length : -1);
            } else if (e.key === 'Enter') {
              e.preventDefault();
              const opcao = filtradas[indice] ?? filtradas.find((item) => item.label.toLowerCase() === texto.trim().toLowerCase());
              if (opcao) selecionar(opcao);
            } else if (e.key === 'Escape') { setAberto(false); setBusca(null); }
          }} />
        <span className={styles.arrowIcon} aria-hidden="true">▼</span>
        {aberto && <ul id={`${id}-opcoes`} className={styles.dropdownList} role="listbox" aria-label={label}>
          {filtradas.map((opcao, numero) => <li id={`${id}-${numero}`} key={opcao.value} role="option" aria-selected={numero === indice}
            className={`${styles.dropdownItem} ${numero === indice ? styles.dropdownItemAtivo : ''}`}
            onMouseDown={(e) => { e.preventDefault(); selecionar(opcao); }} onMouseEnter={() => setIndice(numero)}>{opcao.label}</li>)}
          {filtradas.length === 0 && <li className={styles.dropdownItem}>Nenhuma opção encontrada. Use + para cadastrar.</li>}
        </ul>}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
      {items?.length > 0 && <ul className={styles.itemList}>{items.map((item) => <li key={item.id} className={styles.item}>
        <span className={styles.itemText}>{item.nome}</span>
        <button className={styles.btnRemove} onClick={() => onRemove(item.id)} type="button" aria-label={`Remover ${item.nome}`}>−</button>
      </li>)}</ul>}
    </div>
  );
}
