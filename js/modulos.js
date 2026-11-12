document.addEventListener('DOMContentLoaded', () => {
    const quadro = document.querySelector('.modulo-quadro');
    const container = document.querySelector('.modulo-conteudo');
    const btnVoltar = document.getElementById('btn-voltar');
    const btnAvancar = document.getElementById('btn-avancar');

    if (quadro && container) {
        let paginasExistentes = Array.from(container.querySelectorAll('.pagina'));
        const totalConfigurado = parseInt(quadro.dataset.paginas, 10);

        if (!isNaN(totalConfigurado) && totalConfigurado > 0) {
            while (paginasExistentes.length < totalConfigurado) {
                const novaPagina = document.createElement('section');
                novaPagina.className = 'pagina';
                novaPagina.innerHTML = `
                    <div class="teoria">
                        <div class="teoria-texto">
                            <p></p>
                        </div>
                        <div class="teoria-imagem"></div>
                    </div>
                `;
                container.appendChild(novaPagina);
                paginasExistentes.push(novaPagina);
            }

            if (paginasExistentes.length > totalConfigurado) {
                paginasExistentes.slice(totalConfigurado).forEach(p => p.remove());
            }
        }
    }

    const paginas = Array.from(document.querySelectorAll('.pagina'));
    let paginaAtual = 0;

    function atualizarPagina() {
        paginas.forEach((pagina, index) => {
            pagina.classList.toggle('ativa', index === paginaAtual);
        });

        if (btnVoltar) {
            btnVoltar.disabled = paginaAtual === 0;
        }
    }

    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            if (paginaAtual > 0) {
                paginaAtual--;
                atualizarPagina();
            }
        });
    }

    if (btnAvancar) {
        btnAvancar.addEventListener('click', () => {
            if (paginaAtual < paginas.length - 1) {
                paginaAtual++;
                atualizarPagina();
            }
        });
    }

    if (paginas.length > 0) {
        atualizarPagina();
    }
});
