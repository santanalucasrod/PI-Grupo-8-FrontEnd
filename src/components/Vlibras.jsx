import { useEffect } from 'react';

let vlibrasInitialized = false;

function VLibras() {
  useEffect(() => {
    if (vlibrasInitialized) return;
    vlibrasInitialized = true;

    const wrapper = document.createElement('div');
    wrapper.setAttribute('vw', '');
    wrapper.classList.add('enabled');
    wrapper.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    `;
    document.body.appendChild(wrapper);

    // Injeta o script oficial
    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.onload = () => {
      if (window.VLibras) {
        new window.VLibras.Widget('https://vlibras.gov.br/app');
      }
    };
    document.body.appendChild(script);

  }, []);

  return null;
}

export default VLibras;