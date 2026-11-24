document.addEventListener('DOMContentLoaded', () => {
    const quadro = document.querySelector('.modulo-quadro');
    const container = document.querySelector('.modulo-conteudo');
    const btnVoltar = document.getElementById('btn-voltar');
    const btnAvancar = document.getElementById('btn-avancar');
    const indicadorPagina = document.getElementById('indicador-pagina');

    const abaBtnTeoria = document.getElementById('aba-btn-teoria');
    const abaBtnExercicios = document.getElementById('aba-btn-exercicios');
    const painelTeoria = document.getElementById('painel-teoria');
    const painelExercicios = document.getElementById('painel-exercicios');

    function alternarAba(nomeAba) {
        const modoExercicios = nomeAba === 'exercicios';
        if (abaBtnTeoria && abaBtnExercicios && painelTeoria && painelExercicios) {
            abaBtnTeoria.classList.toggle('ativa', !modoExercicios);
            abaBtnTeoria.setAttribute('aria-selected', String(!modoExercicios));

            abaBtnExercicios.classList.toggle('ativa', modoExercicios);
            abaBtnExercicios.setAttribute('aria-selected', String(modoExercicios));

            painelTeoria.classList.toggle('ativo', !modoExercicios);
            painelExercicios.classList.toggle('ativo', modoExercicios);
        }
    }

    window.abrirAbaModulo = alternarAba;

    if (abaBtnTeoria) {
        abaBtnTeoria.addEventListener('click', () => alternarAba('teoria'));
    }
    if (abaBtnExercicios) {
        abaBtnExercicios.addEventListener('click', () => alternarAba('exercicios'));
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('etapa') === 'exercicios') {
        alternarAba('exercicios');
    }

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

    function salvarNoLocalStorage() {
        localStorage.setItem('progresso', JSON.stringify(paginaAtual));
    }

    function carregarDoLocalStorage() {
        const salvo = JSON.parse(localStorage.getItem('progresso'));
        if (salvo !== null && !isNaN(salvo) && salvo >= 0 && salvo < paginas.length) {
            paginaAtual = Number(salvo);
        }
    }

    function atualizarPagina() {
        paginas.forEach((pagina, index) => {
            pagina.classList.toggle('ativa', index === paginaAtual);
        });

        if (indicadorPagina) {
            indicadorPagina.textContent = `Página ${paginaAtual + 1} de ${paginas.length}`;
        }

        if (btnVoltar) {
            btnVoltar.style.visibility = paginaAtual === 0 ? 'hidden' : 'visible';
            btnVoltar.disabled = paginaAtual === 0;
        }

        if (btnAvancar) {
            if (paginaAtual === paginas.length - 1) {
                btnAvancar.textContent = painelExercicios ? 'Ir para Exercícios →' : 'Concluído';
            } else {
                btnAvancar.textContent = 'Avançar';
            }
        }
    }

    carregarDoLocalStorage();
    if (paginas.length > 0) {
        atualizarPagina();
    }

    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            if (paginaAtual > 0) {
                paginaAtual--;
                salvarNoLocalStorage();
                atualizarPagina();
            }
        });
    }

    if (btnAvancar) {
        btnAvancar.addEventListener('click', () => {
            if (paginaAtual < paginas.length - 1) {
                paginaAtual++;
                salvarNoLocalStorage();
                atualizarPagina();
            } else if (painelExercicios) {
                alternarAba('exercicios');
            }
        });
    }

    document.addEventListener('keydown', (evento) => {
        const tag = (evento.target && evento.target.tagName) ? evento.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        if (painelTeoria && !painelTeoria.classList.contains('ativo')) return;

        if (evento.key === 'ArrowRight' && btnAvancar) {
            evento.preventDefault();
            btnAvancar.click();
        }

        if (evento.key === 'ArrowLeft' && btnVoltar && paginaAtual > 0) {
            evento.preventDefault();
            btnVoltar.click();
        }
    });
});
