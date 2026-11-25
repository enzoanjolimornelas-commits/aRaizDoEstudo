document.addEventListener('DOMContentLoaded', () => {
    let audioCtx = null;

    function tocarSom(tipo) {
        try {
            if (!audioCtx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioContextClass) return;
                audioCtx = new AudioContextClass();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const agora = audioCtx.currentTime;

            if (tipo === 'engrenagem') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(340, agora);
                osc.frequency.exponentialRampToValueAtTime(510, agora + 0.06);
                gain.gain.setValueAtTime(0.12, agora);
                gain.gain.exponentialRampToValueAtTime(0.01, agora + 0.07);
                osc.start(agora);
                osc.stop(agora + 0.07);
            } else if (tipo === 'vaium') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, agora);
                osc.frequency.exponentialRampToValueAtTime(740, agora + 0.16);
                gain.gain.setValueAtTime(0.18, agora);
                gain.gain.exponentialRampToValueAtTime(0.01, agora + 0.18);
                osc.start(agora);
                osc.stop(agora + 0.18);
            } else if (tipo === 'acerto') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, agora);
                osc.frequency.exponentialRampToValueAtTime(880, agora + 0.15);
                gain.gain.setValueAtTime(0.2, agora);
                gain.gain.exponentialRampToValueAtTime(0.01, agora + 0.22);
                osc.start(agora);
                osc.stop(agora + 0.22);
            } else if (tipo === 'erro') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(165, agora);
                osc.frequency.linearRampToValueAtTime(110, agora + 0.25);
                gain.gain.setValueAtTime(0.18, agora);
                gain.gain.exponentialRampToValueAtTime(0.01, agora + 0.25);
                osc.start(agora);
                osc.stop(agora + 0.25);
            }
        } catch (_) {
        }
    }

    const avisoLateral = document.createElement('div');
    avisoLateral.classList.add('aviso-dificuldade');
    avisoLateral.setAttribute('role', 'status');
    avisoLateral.setAttribute('aria-live', 'polite');
    document.body.appendChild(avisoLateral);

    let timerAviso = null;
    function mostrarAvisoLateral(titulo, mensagem, duracao = 5000) {
        clearTimeout(timerAviso);
        avisoLateral.innerHTML = `<h4>${titulo}</h4><p>${mensagem}</p>`;
        avisoLateral.classList.add('mostrar');
        timerAviso = setTimeout(() => {
            avisoLateral.classList.remove('mostrar');
        }, duracao);
    }

    const modalSite = document.createElement('div');
    modalSite.classList.add('modal-erro-overlay');
    modalSite.innerHTML = `
        <div class="modal-erro-conteudo" role="dialog" aria-modal="true" aria-labelledby="modal-modulo-titulo">
            <h3 id="modal-modulo-titulo">Ops! Vamos revisar!</h3>
            <p id="modal-texto-erro"></p>
            <div id="modal-dica-conteudo" class="modal-dica"></div>
            <div id="modal-estatisticas" class="modal-stats"></div>
            <button type="button" id="modal-btn-continuar">Entendi!</button>
        </div>
    `;
    document.body.appendChild(modalSite);

    const modalTitulo = document.getElementById('modal-modulo-titulo');
    const modalTexto = document.getElementById('modal-texto-erro');
    const modalDica = document.getElementById('modal-dica-conteudo');
    const modalStats = document.getElementById('modal-estatisticas');
    const modalBtnContinuar = document.getElementById('modal-btn-continuar');

    function abrirModalSite({ titulo, mensagem, dicaHTML, extraHTML, textoBotao = 'Entendi!' }) {
        if (modalTitulo) modalTitulo.textContent = titulo;
        if (modalTexto) modalTexto.innerHTML = mensagem;
        if (modalDica) {
            modalDica.style.display = dicaHTML ? 'block' : 'none';
            modalDica.innerHTML = dicaHTML || '';
        }
        if (modalStats) {
            modalStats.style.display = extraHTML ? 'block' : 'none';
            modalStats.innerHTML = extraHTML || '';
        }
        if (modalBtnContinuar) modalBtnContinuar.textContent = textoBotao;
        modalSite.classList.add('mostrar');
    }

    if (modalBtnContinuar) {
        modalBtnContinuar.addEventListener('click', () => {
            modalSite.classList.remove('mostrar');
        });
    }

    modalSite.addEventListener('click', (e) => {
        if (e.target === modalSite) {
            modalSite.classList.remove('mostrar');
        }
    });

    function formatarNumeroBR(num) {
        return Number(num).toLocaleString('pt-BR');
    }

    const estoqueAdicao = document.getElementById('estoque-adicao');
    const cestaParcela1 = document.getElementById('cesta-parcela-1');
    const cestaParcela2 = document.getElementById('cesta-parcela-2');
    const tituloParcela1 = document.getElementById('titulo-parcela-1');
    const tituloParcela2 = document.getElementById('titulo-parcela-2');
    const listaResultadoSoma = document.getElementById('lista-resultado-soma');
    const textoResultadoSoma = document.getElementById('texto-resultado-soma');
    const btnResetarAdicao = document.getElementById('btn-resetar-adicao');

    function atualizarPlacarAdicao() {
        if (!cestaParcela1 || !cestaParcela2) return;
        const lista1 = cestaParcela1.querySelector('.cesta-frutas-lista');
        const lista2 = cestaParcela2.querySelector('.cesta-frutas-lista');
        const qtd1 = lista1 ? lista1.querySelectorAll('.fruta').length : 0;
        const qtd2 = lista2 ? lista2.querySelectorAll('.fruta').length : 0;
        const total = qtd1 + qtd2;

        if (tituloParcela1) tituloParcela1.textContent = `1ª Cesta (Parcela): ${qtd1}`;
        if (tituloParcela2) tituloParcela2.textContent = `2ª Cesta (Parcela): ${qtd2}`;
        if (textoResultadoSoma) {
            textoResultadoSoma.textContent = `${qtd1} (1ª Parcela) + ${qtd2} (2ª Parcela) = Soma: ${total} fruta${total === 1 ? '' : 's'}.`;
        }

        if (listaResultadoSoma) {
            listaResultadoSoma.innerHTML = '';
            for (let i = 0; i < total; i++) {
                const img = document.createElement('img');
                img.src = '../img/Fresh_Red_Apple_PNG_Clip_Art_Image.png';
                img.alt = 'Maçã somada';
                img.className = 'fruta-resultado-item';
                listaResultadoSoma.appendChild(img);
            }
        }
    }

    function moverFrutaAdicaoParaZona(frutaEl, zonaEl) {
        if (!frutaEl || !zonaEl) return;
        const destinoContainer = zonaEl.classList.contains('cesta')
            ? zonaEl.querySelector('.cesta-frutas-lista')
            : zonaEl;
        if (!destinoContainer || destinoContainer === frutaEl.parentElement) return;

        destinoContainer.appendChild(frutaEl);
        tocarSom('engrenagem');
        atualizarPlacarAdicao();
    }

    const estoqueSubtracao = document.getElementById('estoque-subtracao');
    const cestaMinuendo = document.getElementById('cesta-minuendo');
    const cestaSubtraendo = document.getElementById('cesta-subtraendo');
    const listaMinuendo = document.getElementById('lista-minuendo');
    const listaSubtraendo = document.getElementById('lista-subtraendo');
    const tituloMinuendo = document.getElementById('titulo-minuendo');
    const tituloSubtraendo = document.getElementById('titulo-subtraendo');
    const listaResultadoSubtracao = document.getElementById('lista-resultado-subtracao');
    const textoResultadoSubtracao = document.getElementById('texto-resultado-subtracao');
    const btnResetarSubtracao = document.getElementById('btn-resetar-subtracao');

    function atualizarPlacarSubtracao() {
        if (!listaMinuendo || !listaSubtraendo) return;
        const qtd1 = listaMinuendo.querySelectorAll('.fruta-sub').length;
        const qtd2 = listaSubtraendo.querySelectorAll('.fruta-sub').length;
        const diferenca = qtd1 - qtd2;

        if (tituloMinuendo) {
            tituloMinuendo.textContent = `1ª Cesta (Minuendo): ${qtd1}`;
        }
        if (tituloSubtraendo) {
            tituloSubtraendo.textContent = `2ª Cesta (Subtraendo): ${qtd2}`;
        }
        if (textoResultadoSubtracao) {
            if (diferenca >= 0) {
                textoResultadoSubtracao.textContent = `${qtd1} (1ª Cesta) - ${qtd2} (2ª Cesta) = Resto: ${diferenca} fruta${diferenca === 1 ? '' : 's'}.`;
            } else {
                textoResultadoSubtracao.textContent = `${qtd1} (1ª Cesta) - ${qtd2} (2ª Cesta) = ${diferenca} (coloque mais maçãs na 1ª Cesta!)`;
            }
        }

        if (listaResultadoSubtracao) {
            listaResultadoSubtracao.innerHTML = '';
            const totalMostrar = Math.max(0, diferenca);
            for (let i = 0; i < totalMostrar; i++) {
                const img = document.createElement('img');
                img.src = '../img/Fresh_Red_Apple_PNG_Clip_Art_Image.png';
                img.alt = 'Maçã restante';
                img.className = 'fruta-resultado-item';
                listaResultadoSubtracao.appendChild(img);
            }
        }
    }

    function moverFrutaSubtracaoParaZona(frutaEl, zonaEl) {
        if (!frutaEl || !zonaEl) return;
        const destinoContainer = zonaEl.classList.contains('cesta')
            ? zonaEl.querySelector('.cesta-frutas-lista')
            : zonaEl;
        if (!destinoContainer || destinoContainer === frutaEl.parentElement) return;

        destinoContainer.appendChild(frutaEl);
        tocarSom('engrenagem');
        atualizarPlacarSubtracao();
    }

    function configurarArrasteFrutas(seletorFrutas, seletorZonas, aoMover, aoClicarAlternar) {
        const listaFrutas = document.querySelectorAll(seletorFrutas);
        const zonas = Array.from(document.querySelectorAll(seletorZonas));

        listaFrutas.forEach(fruta => {
            let fantasma = null;
            let iniciouArraste = false;
            let startX = 0;
            let startY = 0;

            fruta.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                startX = e.clientX;
                startY = e.clientY;
                iniciouArraste = false;
                fruta.setPointerCapture(e.pointerId);

                const onMove = (ev) => {
                    const dx = ev.clientX - startX;
                    const dy = ev.clientY - startY;
                    if (!iniciouArraste && Math.hypot(dx, dy) > 6) {
                        iniciouArraste = true;
                        fruta.classList.add('arrastando-ativa');
                        fantasma = document.createElement('img');
                        fantasma.src = fruta.src;
                        fantasma.className = 'fruta-fantasma';
                        document.body.appendChild(fantasma);
                    }

                    if (iniciouArraste && fantasma) {
                        fantasma.style.left = `${ev.clientX}px`;
                        fantasma.style.top = `${ev.clientY}px`;

                        zonas.forEach(z => {
                            const rect = z.getBoundingClientRect();
                            const dentro = ev.clientX >= rect.left && ev.clientX <= rect.right &&
                                           ev.clientY >= rect.top && ev.clientY <= rect.bottom;
                            z.classList.toggle('zona-destaque', dentro);
                        });
                    }
                };

                const onUp = (ev) => {
                    fruta.removeEventListener('pointermove', onMove);
                    fruta.removeEventListener('pointerup', onUp);
                    fruta.removeEventListener('pointercancel', onUp);
                    fruta.classList.remove('arrastando-ativa');
                    zonas.forEach(z => z.classList.remove('zona-destaque'));

                    if (fantasma) {
                        fantasma.remove();
                        fantasma = null;
                    }

                    if (iniciouArraste) {
                        const zonaAlvo = zonas.find(z => {
                            const rect = z.getBoundingClientRect();
                            return ev.clientX >= rect.left && ev.clientX <= rect.right &&
                                   ev.clientY >= rect.top && ev.clientY <= rect.bottom;
                        });
                        if (zonaAlvo) {
                            aoMover(fruta, zonaAlvo);
                        }
                    } else if (typeof aoClicarAlternar === 'function') {
                        aoClicarAlternar(fruta);
                    }
                };

                fruta.addEventListener('pointermove', onMove);
                fruta.addEventListener('pointerup', onUp);
                fruta.addEventListener('pointercancel', onUp);
            });
        });
    }

    configurarArrasteFrutas(
        '.fruta',
        '#estoque-adicao, #cesta-parcela-1, #cesta-parcela-2',
        moverFrutaAdicaoParaZona,
        (fruta) => {
            const pai = fruta.parentElement;
            if (pai === estoqueAdicao && cestaParcela1 && cestaParcela2) {
                const l1 = cestaParcela1.querySelector('.cesta-frutas-lista');
                const l2 = cestaParcela2.querySelector('.cesta-frutas-lista');
                const destino = (l1 && l2 && l1.children.length <= l2.children.length) ? cestaParcela1 : cestaParcela2;
                moverFrutaAdicaoParaZona(fruta, destino);
            } else if (estoqueAdicao) {
                moverFrutaAdicaoParaZona(fruta, estoqueAdicao);
            }
        }
    );

    configurarArrasteFrutas(
        '.fruta-sub',
        '#estoque-subtracao, #cesta-minuendo, #cesta-subtraendo',
        moverFrutaSubtracaoParaZona,
        (fruta) => {
            const pai = fruta.parentElement;
            if (pai === estoqueSubtracao && cestaMinuendo && cestaSubtraendo) {
                const l1 = cestaMinuendo.querySelector('.cesta-frutas-lista');
                const l2 = cestaSubtraendo.querySelector('.cesta-frutas-lista');
                const destino = (l1 && l2 && l1.children.length <= l2.children.length) ? cestaMinuendo : cestaSubtraendo;
                moverFrutaSubtracaoParaZona(fruta, destino);
            } else if (estoqueSubtracao) {
                moverFrutaSubtracaoParaZona(fruta, estoqueSubtracao);
            }
        }
    );

    [cestaParcela1, cestaParcela2].forEach(cesta => {
        if (!cesta) return;
        cesta.addEventListener('click', (e) => {
            if (e.target.closest('.fruta')) return;
            const frutaDisponivel = estoqueAdicao ? estoqueAdicao.querySelector('.fruta') : null;
            if (frutaDisponivel) {
                moverFrutaAdicaoParaZona(frutaDisponivel, cesta);
            }
        });
    });

    [cestaMinuendo, cestaSubtraendo].forEach(cesta => {
        if (!cesta) return;
        cesta.addEventListener('click', (e) => {
            if (e.target.closest('.fruta-sub')) return;
            const frutaDisponivel = estoqueSubtracao ? estoqueSubtracao.querySelector('.fruta-sub') : null;
            if (frutaDisponivel) {
                moverFrutaSubtracaoParaZona(frutaDisponivel, cesta);
            }
        });
    });

    if (btnResetarAdicao && estoqueAdicao) {
        btnResetarAdicao.addEventListener('click', () => {
            document.querySelectorAll('#picnic .fruta').forEach(f => estoqueAdicao.appendChild(f));
            tocarSom('engrenagem');
            atualizarPlacarAdicao();
            mostrarAvisoLateral('Piquenique Reiniciado', 'Todas as maçãs voltaram para a toalha!');
        });
    }

    if (btnResetarSubtracao && estoqueSubtracao) {
        btnResetarSubtracao.addEventListener('click', () => {
            document.querySelectorAll('#picnic-subtracao .fruta-sub').forEach(f => estoqueSubtracao.appendChild(f));
            tocarSom('engrenagem');
            atualizarPlacarSubtracao();
            mostrarAvisoLateral('Piquenique Reiniciado', 'Todas as maçãs voltaram para a toalha!');
        });
    }

    atualizarPlacarAdicao();
    atualizarPlacarSubtracao();

    function criarControladorPascalina(containerMaquina, opcoes = {}) {
        if (!containerMaquina) return null;

        const filas = Array.from(containerMaquina.querySelectorAll('.fila'));
        const totalColunas = filas.length;
        const digitos = filas.map(f => {
            const p = f.querySelector('p');
            return p ? (Number(p.textContent) || 0) : 0;
        });

        const maxValor = Math.pow(10, totalColunas) - 1;

        function obterValorTotal() {
            let total = 0;
            for (let i = 0; i < totalColunas; i++) {
                total = total * 10 + digitos[i];
            }
            return total;
        }

        function atualizarVisores(colunasDestacadas = []) {
            filas.forEach((fila, idx) => {
                const p = fila.querySelector('p');
                if (p) p.textContent = String(digitos[idx]);

                if (colunasDestacadas.includes(idx)) {
                    fila.classList.remove('destaque-vai-um');
                    void fila.offsetWidth;
                    fila.classList.add('destaque-vai-um');
                    setTimeout(() => fila.classList.remove('destaque-vai-um'), 650);
                }
            });

            if (typeof opcoes.aoMudar === 'function') {
                opcoes.aoMudar(obterValorTotal(), [...digitos]);
            }
        }

        function definirValor(novoValor) {
            const limpo = Math.max(0, Math.min(maxValor, Math.floor(Number(novoValor) || 0)));
            const str = String(limpo).padStart(totalColunas, '0');
            for (let i = 0; i < totalColunas; i++) {
                digitos[i] = Number(str[i]);
            }
            atualizarVisores();
        }

        function alterarOrdem(indiceColuna, delta) {
            const filaAlvo = filas[indiceColuna];
            const ordemNum = Number(filaAlvo.dataset.ordem) || (totalColunas - indiceColuna);
            const nomeOrdem = filaAlvo.dataset.nomeOrdem || `${ordemNum}ª Ordem`;
            const fator = Math.pow(10, totalColunas - 1 - indiceColuna);
            const valorAntes = obterValorTotal();
            const valorDepois = valorAntes + delta * fator;

            if (valorDepois > maxValor || valorDepois < 0) {
                tocarSom('erro');
                return;
            }

            const digitosAntes = [...digitos];
            const strDepois = String(valorDepois).padStart(totalColunas, '0');
            const colunasAlteradas = [];

            for (let i = 0; i < totalColunas; i++) {
                digitos[i] = Number(strDepois[i]);
                if (digitos[i] !== digitosAntes[i]) {
                    colunasAlteradas.push(i);
                }
            }

            const houveVaiUmOuEmprestimo = colunasAlteradas.length > 1;
            tocarSom(houveVaiUmOuEmprestimo ? 'vaium' : 'engrenagem');
            atualizarVisores(colunasAlteradas);

            if (opcoes.mostrarAvisos && houveVaiUmOuEmprestimo) {
                const maisAltaIdx = Math.min(...colunasAlteradas);
                const filaDestino = filas[maisAltaIdx];
                const ordemDestino = filaDestino.dataset.ordem;
                const nomeDestino = filaDestino.dataset.nomeOrdem;

                if (delta > 0) {
                    mostrarAvisoLateral(
                        `Vai Um! (${ordemNum}ª para ${ordemDestino}ª Ordem)`,
                        `A ${ordemNum}ª Ordem (${nomeOrdem}) completou 10 e somou +1 na ${ordemDestino}ª Ordem (${nomeDestino})!`
                    );
                } else {
                    mostrarAvisoLateral(
                        'Empréstimo entre Ordens!',
                        `A ${ordemNum}ª Ordem (${nomeOrdem}) pediu 1 unidade emprestada da ${ordemDestino}ª Ordem (${nomeDestino})!`
                    );
                }
            }
        }

        filas.forEach((fila, idx) => {
            const setaCima = fila.querySelector('.seta-cima') || fila.querySelectorAll('img')[0];
            const setaBaixo = fila.querySelector('.seta-baixo') || fila.querySelectorAll('img')[1];

            if (setaCima) {
                setaCima.addEventListener('click', (e) => {
                    e.preventDefault();
                    alterarOrdem(idx, 1);
                });
            }
            if (setaBaixo) {
                setaBaixo.addEventListener('click', (e) => {
                    e.preventDefault();
                    alterarOrdem(idx, -1);
                });
            }
        });

        atualizarVisores();

        return {
            obterValorTotal,
            definirValor
        };
    }

    const QUESTOES_MODULO2 = [
        {
            id: 1,
            categoria: 'Adição na Pascalina',
            modo: 'pascalina',
            valorInicial: 123,
            respostaCorreta: 377,
            dicaPascalina: 'A Pascalina iniciou em 123. Aumente 2 nas Centenas, 5 nas Dezenas e 4 nas Unidades!',
            enunciado: 'A Pascalina começa marcando <strong>123</strong>. Gire as setas da máquina abaixo para <strong>somar 254</strong> (<strong>123 + 254</strong>) e clique em Responder com a Pascalina.',
            explicacaoAcerto: 'Excelente! 123 + 254 = 377 (3 Centenas, 7 Dezenas e 7 Unidades).',
            dicaErro: 'Some ordem com ordem a partir de 123: Centenas: 1 + 2 = 3; Dezenas: 2 + 5 = 7; Unidades: 3 + 4 = 7. Forme 377 na Pascalina.'
        },
        {
            id: 2,
            categoria: 'Adição com Vai-Um na Pascalina',
            modo: 'pascalina',
            valorInicial: 48,
            respostaCorreta: 83,
            dicaPascalina: 'Partindo de 48, aumente 3 Dezenas (+30) e 5 Unidades (+5) nas setas da máquina!',
            enunciado: 'Partindo de <strong>48</strong> na Pascalina, faça a adição <strong>48 + 35</strong> girando as rodas da máquina. Observe o <em>"vai-um"</em> das Unidades para as Dezenas!',
            explicacaoAcerto: 'Muito bem! 48 + 35 = 83. As 8 + 5 = 13 unidades deixam 3 na 1ª ordem e passam +1 dezena para a 2ª ordem!',
            dicaErro: 'Na 1ª ordem (Unidades), 8 + 5 = 13: ficam 3 unidades e vai 1 dezena para a 2ª ordem (4 + 3 + 1 = 8 dezenas). Deixe a Pascalina em 83.'
        },
        {
            id: 3,
            categoria: 'Adição na Pascalina',
            modo: 'pascalina',
            valorInicial: 275,
            respostaCorreta: 423,
            dicaPascalina: 'Partindo de 275, adicione 1 Centena, 4 Dezenas e 8 Unidades nas rodas da Pascalina!',
            enunciado: 'Com a Pascalina marcando <strong>275</strong>, realize a adição <strong>275 + 148</strong> girando as rodas da máquina.',
            explicacaoAcerto: 'Perfeito! 275 + 148 = 423 com vai-um nas dezenas e nas centenas!',
            dicaErro: 'Unidades: 5 + 8 = 13 (fica 3 e vai 1). Dezenas: 7 + 4 + 1 = 12 (fica 2 e vai 1). Centenas: 2 + 1 + 1 = 4. Forme 423 na Pascalina.'
        },
        {
            id: 4,
            categoria: 'Adição na Pascalina',
            modo: 'pascalina',
            valorInicial: 850,
            respostaCorreta: 1220,
            dicaPascalina: 'Partindo de 850, aumente 3 Centenas (+300) e 7 Dezenas (+70) na máquina!',
            enunciado: 'A Pascalina está em <strong>850</strong>. Gire as rodas da máquina para somar <strong>370</strong> (<strong>850 + 370</strong>).',
            explicacaoAcerto: 'Isso mesmo! 850 + 370 = 1.220!',
            dicaErro: 'Dezenas: 5 + 7 = 12 (fica 2 e vai 1 centena). Centenas: 8 + 3 + 1 = 12 (fica 2 e vai 1 unidade de milhar). Forme 1.220 na máquina.'
        },
        {
            id: 5,
            categoria: 'Subtração na Pascalina',
            modo: 'pascalina',
            valorInicial: 589,
            respostaCorreta: 343,
            dicaPascalina: 'A Pascalina inicia em 589. Gire as setas de baixo: -2 nas Centenas, -4 nas Dezenas e -6 nas Unidades!',
            enunciado: 'A Pascalina marca <strong>589</strong>. Use as setas de baixo da máquina para <strong>subtrair 246</strong> (<strong>589 - 246</strong>).',
            explicacaoAcerto: 'Correto! 589 - 246 = 343 formado na Pascalina!',
            dicaErro: 'Subtraia em cada ordem girando as setas de baixo: Centenas: 5 - 2 = 3; Dezenas: 8 - 4 = 4; Unidades: 9 - 6 = 3. Forme 343.'
        },
        {
            id: 6,
            categoria: 'Subtração com Empréstimo na Pascalina',
            modo: 'pascalina',
            valorInicial: 94,
            respostaCorreta: 57,
            dicaPascalina: 'Partindo de 94, diminua 3 Dezenas (-30) e 7 Unidades (-7) nas setas de baixo!',
            enunciado: 'Partindo de <strong>94</strong> na Pascalina, calcule <strong>94 - 37</strong> girando as rodas da máquina e observe o empréstimo da Dezena para a Unidade!',
            explicacaoAcerto: 'Muito bem! 94 - 37 = 57!',
            dicaErro: 'Ao tirar 7 unidades de 4, a máquina empresta 1 dezena (14 - 7 = 7 unidades) e restam 8 - 3 = 5 dezenas. Deixe a Pascalina em 57.'
        },
        {
            id: 7,
            categoria: 'Subtração na Pascalina',
            modo: 'pascalina',
            valorInicial: 305,
            respostaCorreta: 177,
            dicaPascalina: 'A máquina está em 305. Diminua 1 Centena, 2 Dezenas e 8 Unidades!',
            enunciado: 'Com a Pascalina em <strong>305</strong>, subtraia <strong>128</strong> (<strong>305 - 128</strong>) girando as rodas da máquina.',
            explicacaoAcerto: 'Exato! 305 - 128 = 177!',
            dicaErro: 'Para tirar 8 de 5 unidades, o empréstimo atravessa a dezena 0 vindo da centena (3 vira 2, dezena fica 9 e unidade 15 - 8 = 7). Depois 9 - 2 = 7 dezenas e 2 - 1 = 1 centena = 177.'
        },
        {
            id: 8,
            categoria: 'Subtração na Pascalina',
            modo: 'pascalina',
            valorInicial: 1000,
            respostaCorreta: 755,
            dicaPascalina: 'Começando em 1.000, diminua 2 Centenas, 4 Dezenas e 5 Unidades nas setas de baixo!',
            enunciado: 'Partindo de <strong>1.000</strong> na Pascalina, gire as setas de baixo para calcular <strong>1.000 - 245</strong>.',
            explicacaoAcerto: 'Excelente! 1.000 - 245 = 755!',
            dicaErro: 'Tirando 2 centenas, 4 dezenas e 5 unidades de 1.000 na máquina, obtemos 755.'
        },
        {
            id: 9,
            categoria: 'Conceitos da Adição',
            modo: 'multipla',
            enunciado: 'Na operação de adição <strong>15 + 24 = 39</strong>, como são chamados os números <strong>15 e 24</strong> e como é chamado o resultado <strong>39</strong>?',
            opcoes: [
                '15 e 24 são as somas, e 39 é a parcela',
                '15 é o minuendo, 24 é o subtraendo e 39 é o resto',
                '15 e 24 são as parcelas, e 39 é a soma ou total',
                '15 e 24 são as diferenças, e 39 é o produto'
            ],
            respostaCorreta: '15 e 24 são as parcelas, e 39 é a soma ou total',
            explicacaoAcerto: 'Correto! Na adição, os números que juntamos são as parcelas e o resultado final é a soma ou total.',
            dicaErro: 'Lembre-se da teoria: os valores que somamos recebem o nome de parcelas, enquanto o resultado da adição é chamado de soma ou total.'
        },
        {
            id: 10,
            categoria: 'Conceitos da Subtração',
            modo: 'multipla',
            enunciado: 'Na subtração <strong>50 - 18 = 32</strong>, qual é o nome dado ao resultado <strong>32</strong>?',
            opcoes: [
                'Soma ou total',
                'Resto ou diferença',
                'Parcela',
                'Subtraendo'
            ],
            respostaCorreta: 'Resto ou diferença',
            explicacaoAcerto: 'Isso mesmo! Na subtração, 50 é o minuendo, 18 é o subtraendo e 32 é o resto ou diferença!',
            dicaErro: 'Na subtração, a quantidade inicial (50) é o minuendo, o que tiramos (18) é o subtraendo, e o que sobra (32) é o resto ou diferença.'
        },
        {
            id: 11,
            categoria: 'Adição no Teclado',
            modo: 'teclado',
            respostaCorreta: 92,
            enunciado: 'Em um piquenique, a primeira cesta tem <strong>47 maçãs</strong> e a segunda cesta tem <strong>45 maçãs</strong>. Quantas maçãs há no total (<strong>47 + 45</strong>)?',
            explicacaoAcerto: 'Muito bem! 47 + 45 = 92 maçãs no total!',
            dicaErro: 'Some as unidades: 7 + 5 = 12 (fica 2 e vai 1 dezena). Some as dezenas: 4 + 4 + 1 = 9 dezenas. Total: 92.'
        },
        {
            id: 12,
            categoria: 'Subtração no Teclado',
            modo: 'teclado',
            respostaCorreta: 38,
            enunciado: 'Uma cesta tinha <strong>73 frutas</strong>. Durante o piquenique foram consumidas <strong>35 frutas</strong>. Quantas frutas restaram na cesta (<strong>73 - 35</strong>)?',
            explicacaoAcerto: 'Correto! 73 - 35 = 38 frutas restantes!',
            dicaErro: 'Nas unidades, 3 pede 1 dezena emprestada ao 7: 13 - 5 = 8 unidades. Nas dezenas restaram 6 - 3 = 3 dezenas. Resultado: 38.'
        },
        {
            id: 13,
            categoria: 'Adição no Teclado',
            modo: 'teclado',
            respostaCorreta: 614,
            enunciado: 'Calcule o resultado da adição <strong>358 + 256</strong>:',
            explicacaoAcerto: 'Perfeito! 358 + 256 = 614!',
            dicaErro: 'Unidades: 8 + 6 = 14 (fica 4, vai 1). Dezenas: 5 + 5 + 1 = 11 (fica 1, vai 1). Centenas: 3 + 2 + 1 = 6. Resultado: 614.'
        },
        {
            id: 14,
            categoria: 'Subtração no Teclado',
            modo: 'teclado',
            respostaCorreta: 264,
            enunciado: 'Calcule o resto ou diferença da subtração <strong>500 - 236</strong>:',
            explicacaoAcerto: 'Excelente! 500 - 236 = 264!',
            dicaErro: 'As 5 centenas emprestam 1 centena, deixando 4 centenas, 9 dezenas e 10 unidades: 10 - 6 = 4 unidades; 9 - 3 = 6 dezenas; 4 - 2 = 2 centenas. Total: 264.'
        },
        {
            id: 15,
            categoria: 'Quanto Falta (Subtração)',
            modo: 'teclado',
            respostaCorreta: 45,
            enunciado: 'Você precisa juntar <strong>120 pontos</strong> em um jogo e já tem <strong>75 pontos</strong>. Quantos pontos faltam para alcançar a meta (<strong>120 - 75</strong>)?',
            explicacaoAcerto: 'Isso aí! Para descobrir quanto falta, fazemos a diferença: 120 - 75 = 45 pontos!',
            dicaErro: 'Para saber quanto falta de 75 até 120, subtraímos 120 - 75: 10 - 5 = 5 nas unidades e 11 - 7 = 4 nas dezenas. Faltam 45 pontos.'
        },
        {
            id: 16,
            categoria: 'Operações Inversas',
            modo: 'multipla',
            enunciado: 'Se sabemos que <strong>140 + 85 = 225</strong>, qual é o resultado de <strong>225 - 85</strong> sem precisar refazer toda a conta?',
            opcoes: [
                '310, pois devemos somar 225 com 85',
                '85, pois as parcelas são iguais',
                '155, pois tiramos 70',
                '140, pois a subtração é a operação inversa da adição'
            ],
            respostaCorreta: '140, pois a subtração é a operação inversa da adição',
            explicacaoAcerto: 'Perfeito! Como a subtração desfaz o que a adição juntou, tirar 85 de 225 devolve exatamente a primeira parcela (140)!',
            dicaErro: 'A adição e a subtração são operações inversas: se juntamos 140 com 85 e deu 225, ao retirar 85 de 225 voltamos exatamente para 140.'
        },
        {
            id: 17,
            categoria: 'Adição com 3 Parcelas',
            modo: 'teclado',
            respostaCorreta: 100,
            enunciado: 'Três cestas de piquenique têm <strong>32</strong>, <strong>28</strong> e <strong>40</strong> frutas. Qual é a soma das três cestas (<strong>32 + 28 + 40</strong>)?',
            explicacaoAcerto: 'Muito bem! 32 + 28 = 60, e 60 + 40 = 100 frutas!',
            dicaErro: 'Some primeiro as duas primeiras parcelas: 32 + 28 = 60. Depois some o resultado com a terceira parcela: 60 + 40 = 100.'
        },
        {
            id: 18,
            categoria: 'Problema de Adição e Subtração',
            modo: 'teclado',
            respostaCorreta: 65,
            enunciado: 'Uma árvore tinha <strong>80 maçãs</strong>. Caíram <strong>25 maçãs</strong> pela manhã, mas nasceram <strong>10 maçãs</strong> novas. Com quantas maçãs a árvore ficou (<strong>80 - 25 + 10</strong>)?',
            explicacaoAcerto: 'Correto! 80 - 25 = 55, e 55 + 10 = 65 maçãs!',
            dicaErro: 'Faça em duas etapas: primeiro retire as 25 que caíram (80 - 25 = 55) e depois acrescente as 10 novas (55 + 10 = 65).'
        },
        {
            id: 19,
            categoria: 'Desafio na Pascalina (Adição)',
            modo: 'pascalina',
            valorInicial: 1420,
            respostaCorreta: 2105,
            dicaPascalina: 'A Pascalina começa em 1.420. Aumente 6 Centenas, 8 Dezenas e 5 Unidades nas rodas!',
            enunciado: 'Com a Pascalina em <strong>1.420</strong>, gire as rodas da máquina para <strong>somar 685</strong> (<strong>1.420 + 685</strong>).',
            explicacaoAcerto: 'Brilhante! 1.420 + 685 = 2.105 formado na Pascalina!',
            dicaErro: 'Partindo de 1.420: Unidades: 0 + 5 = 5. Dezenas: 2 + 8 = 10 (fica 0 e vai 1 centena). Centenas: 4 + 6 + 1 = 11 (fica 1 e vai 1 milhar). Milhares: 1 + 1 = 2. Forme 2.105.'
        },
        {
            id: 20,
            categoria: 'Desafio Final na Pascalina (Subtração)',
            modo: 'pascalina',
            valorInicial: 2350,
            respostaCorreta: 1170,
            dicaPascalina: 'Partindo de 2.350, diminua 1 Unidade de Milhar (-1.000), 1 Centena (-100) e 8 Dezenas (-80)!',
            enunciado: 'Desafio Final! Com a Pascalina marcando <strong>2.350</strong>, subtraia <strong>1.180</strong> (<strong>2.350 - 1.180</strong>) girando as rodas da máquina.',
            explicacaoAcerto: 'Parabéns! Você concluiu todas as 20 questões de Adição e Subtração do Módulo 2! 2.350 - 1.180 = 1.170!',
            dicaErro: 'Em 2.350 - 1.180: Unidades: 0 - 0 = 0. Dezenas: 5 empresta 1 centena (15 - 8 = 7). Centenas: restaram 2 - 1 = 1. Milhares: 2 - 1 = 1. Forme 1.170 na máquina.'
        }
    ];

    const CHAVE_STORAGE_QUESTOES = 'modulo2_questoes_concluidas';
    let indiceQuestaoAtual = 0;
    const questoesConcluidas = new Set();

    function salvarQuestoesNoLocalStorage() {
        localStorage.setItem(CHAVE_STORAGE_QUESTOES, JSON.stringify(Array.from(questoesConcluidas)));
    }

    function carregarQuestoesDoLocalStorage() {
        try {
            const salvo = JSON.parse(localStorage.getItem(CHAVE_STORAGE_QUESTOES));
            if (Array.isArray(salvo)) {
                salvo.forEach(id => {
                    const numId = Number(id);
                    if (!isNaN(numId) && QUESTOES_MODULO2.some(q => q.id === numId)) {
                        questoesConcluidas.add(numId);
                    }
                });
            }
        } catch (_) {
        }
    }

    carregarQuestoesDoLocalStorage();

    const elProgressoTexto = document.getElementById('exercicio-progresso-texto');
    const elTipoBadge = document.getElementById('exercicio-tipo-badge');
    const elPlacar = document.getElementById('exercicio-placar');
    const elTrilha = document.getElementById('exercicios-trilha');
    const elCardExercicio = document.getElementById('exercicio-card');
    const elTituloExercicio = document.getElementById('exercicio-titulo');
    const elEnunciadoExercicio = document.getElementById('exercicio-enunciado');
    const elQuadroVisual = document.getElementById('exercicio-quadro-visual');
    const elPascalinaArea = document.getElementById('exercicio-pascalina-area');
    const elPascalinaDica = document.getElementById('exercicio-pascalina-dica');
    const elPascalinaExValor = document.getElementById('pascalina-ex-valor');
    const btnResetarPascalinaEx = document.getElementById('btn-resetar-pascalina-ex');
    const btnResponderPascalina = document.getElementById('btn-responder-pascalina');
    const elInputBox = document.getElementById('exercicio-input-box');
    const elInputResposta = document.getElementById('exercicio-input-resposta');
    const btnVerificarInput = document.getElementById('btn-verificar-input');
    const elOpcoes = document.getElementById('exercicio-opcoes');
    const elFeedbackInline = document.getElementById('exercicio-feedback-inline');
    const elResumoFinal = document.getElementById('exercicio-resumo-final');
    const btnQuestaoAnterior = document.getElementById('btn-questao-anterior');
    const btnProximaQuestao = document.getElementById('btn-proxima-questao');

    const pascalinaExercicio = criarControladorPascalina(
        document.getElementById('pascalina-exercicio'),
        {
            mostrarAvisos: true,
            aoMudar: (valor) => {
                if (elPascalinaExValor) {
                    elPascalinaExValor.textContent = formatarNumeroBR(valor);
                }
            }
        }
    );

    function configurarTecladoVirtual() {
        if (!elInputBox || !elInputResposta) return;
        const isMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window);
        if (isMobile) {
            elInputResposta.setAttribute('inputmode', 'none');
        }

        const teclado = document.createElement('div');
        teclado.classList.add('teclado-virtual');

        const teclas = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '-', '0', '⌫'];

        teclas.forEach(t => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = t;
            btn.classList.add('tecla-virtual');
            if (t === '-' || t === '⌫') {
                btn.classList.add('tecla-acao');
            }

            btn.addEventListener('click', () => {
                if (t === '⌫') {
                    elInputResposta.value = elInputResposta.value.slice(0, -1);
                } else if (t === '-') {
                    if (elInputResposta.value.startsWith('-')) {
                        elInputResposta.value = elInputResposta.value.slice(1);
                    } else {
                        elInputResposta.value = '-' + elInputResposta.value;
                    }
                } else {
                    elInputResposta.value += t;
                }
            });

            teclado.appendChild(btn);
        });

        const btnEnviar = document.createElement('button');
        btnEnviar.type = 'button';
        btnEnviar.textContent = 'Responder';
        btnEnviar.classList.add('tecla-virtual', 'tecla-enviar');
        btnEnviar.addEventListener('click', () => {
            if (btnVerificarInput) btnVerificarInput.click();
        });
        teclado.appendChild(btnEnviar);

        elInputBox.appendChild(teclado);
    }

    configurarTecladoVirtual();

    window.addEventListener('resize', () => {
        if (elInputResposta) {
            if (window.matchMedia('(max-width: 768px)').matches) {
                elInputResposta.setAttribute('inputmode', 'none');
            } else {
                elInputResposta.removeAttribute('inputmode');
            }
        }
    });

    if (elInputResposta) {
        elInputResposta.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (btnVerificarInput) btnVerificarInput.click();
            }
        });
    }

    if (btnResetarPascalinaEx && pascalinaExercicio) {
        btnResetarPascalinaEx.addEventListener('click', () => {
            const q = QUESTOES_MODULO2[indiceQuestaoAtual];
            if (q && q.modo === 'pascalina') {
                pascalinaExercicio.definirValor(q.valorInicial || 0);
                tocarSom('engrenagem');
                mostrarAvisoLateral('Pascalina Reiniciada', `Número inicial ${formatarNumeroBR(q.valorInicial || 0)} colocado de volta na máquina.`);
            }
        });
    }

    function aplicarEfeitoCard(classe) {
        if (!elCardExercicio) return;
        elCardExercicio.classList.remove('efeito-acerto', 'efeito-erro');
        void elCardExercicio.offsetWidth;
        elCardExercicio.classList.add(classe);
        setTimeout(() => elCardExercicio.classList.remove(classe), 400);
    }

    function construirTrilhaPilulas() {
        if (!elTrilha) return;
        elTrilha.innerHTML = '';
        QUESTOES_MODULO2.forEach((q, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pilula-questao';
            btn.textContent = String(idx + 1);
            btn.setAttribute('aria-label', `Ir para questão ${idx + 1}`);
            if (idx === indiceQuestaoAtual) btn.classList.add('atual');
            if (questoesConcluidas.has(q.id)) btn.classList.add('concluida');
            btn.addEventListener('click', () => {
                indiceQuestaoAtual = idx;
                renderizarQuestaoAtual();
            });
            elTrilha.appendChild(btn);
        });

        const pilulaAtiva = elTrilha.querySelector('.pilula-questao.atual');
        if (pilulaAtiva && typeof pilulaAtiva.scrollIntoView === 'function') {
            pilulaAtiva.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    function atualizarPlacarETrilha() {
        if (elPlacar) {
            elPlacar.textContent = `Acertos: ${questoesConcluidas.size} / ${QUESTOES_MODULO2.length}`;
        }
        if (typeof window.atualizarBarraProgressoModulo === 'function') {
            const painelEx = document.getElementById('painel-exercicios');
            if (painelEx && painelEx.classList.contains('ativo')) {
                const perc = questoesConcluidas.size > 0
                    ? (questoesConcluidas.size / QUESTOES_MODULO2.length) * 100
                    : ((indiceQuestaoAtual + 1) / QUESTOES_MODULO2.length) * 100;
                window.atualizarBarraProgressoModulo(perc);
            }
        }
        construirTrilhaPilulas();

        if (elResumoFinal) {
            if (questoesConcluidas.size === QUESTOES_MODULO2.length) {
                elResumoFinal.style.display = 'flex';
                elResumoFinal.innerHTML = `
                    <h3>Parabéns! Você concluiu todas as 20 questões do Módulo 2!</h3>
                    <p>Você dominou a Adição, a Subtração, os conceitos de parcelas, soma, resto e os cálculos com vai-um e empréstimo!</p>
                    <button type="button" id="btn-reiniciar-exercicios" class="btn-secundario-modulo">Refazer Lista de 20 Questões</button>
                `;
                const btnReiniciar = document.getElementById('btn-reiniciar-exercicios');
                if (btnReiniciar) {
                    btnReiniciar.addEventListener('click', () => {
                        questoesConcluidas.clear();
                        salvarQuestoesNoLocalStorage();
                        indiceQuestaoAtual = 0;
                        renderizarQuestaoAtual();
                    });
                }
            } else {
                elResumoFinal.style.display = 'none';
            }
        }
    }

    function renderizarQuestaoAtual() {
        const q = QUESTOES_MODULO2[indiceQuestaoAtual];
        if (!q) return;

        if (elProgressoTexto) elProgressoTexto.textContent = `Questão ${indiceQuestaoAtual + 1} de ${QUESTOES_MODULO2.length}`;
        if (elTipoBadge) elTipoBadge.textContent = q.categoria;
        if (elTituloExercicio) elTituloExercicio.textContent = `Questão ${indiceQuestaoAtual + 1} — ${q.categoria}`;
        if (elEnunciadoExercicio) elEnunciadoExercicio.innerHTML = q.enunciado;

        if (elFeedbackInline) {
            if (questoesConcluidas.has(q.id)) {
                elFeedbackInline.style.display = 'block';
                elFeedbackInline.innerHTML = `<strong>Questão Concluída!</strong> ${q.explicacaoAcerto}`;
            } else {
                elFeedbackInline.style.display = 'none';
                elFeedbackInline.innerHTML = '';
            }
        }

        if (elQuadroVisual) {
            if (q.quadroTokens && q.quadroTokens.length > 0) {
                elQuadroVisual.style.display = 'flex';
                const tokensHTML = q.quadroTokens.map(t => {
                    if (t.ponto) {
                        return `<span class="digito-ponto">${t.ponto}</span>`;
                    }
                    return `<span class="digito-caixa ${t.destaque ? 'destacado' : ''}">${t.texto}</span>`;
                }).join('');
                elQuadroVisual.innerHTML = `
                    <span class="quadro-visual-legenda">${q.quadroLegenda || 'Observe o número abaixo:'}</span>
                    <div class="quadro-visual-numero">${tokensHTML}</div>
                `;
            } else {
                elQuadroVisual.style.display = 'none';
                elQuadroVisual.innerHTML = '';
            }
        }

        if (q.modo === 'pascalina') {
            if (elPascalinaArea) elPascalinaArea.style.display = 'flex';
            if (elInputBox) elInputBox.style.display = 'none';
            if (elOpcoes) elOpcoes.style.display = 'none';
            if (elPascalinaDica) elPascalinaDica.textContent = q.dicaPascalina || 'Gire as rodas da Pascalina para calcular!';

            const valorParaMostrar = questoesConcluidas.has(q.id) ? q.respostaCorreta : (q.valorInicial || 0);
            if (pascalinaExercicio) {
                pascalinaExercicio.definirValor(valorParaMostrar);
            }
        } else if (q.modo === 'teclado') {
            if (elPascalinaArea) elPascalinaArea.style.display = 'none';
            if (elInputBox) elInputBox.style.display = 'flex';
            if (elOpcoes) elOpcoes.style.display = 'none';

            if (elInputResposta) {
                elInputResposta.value = questoesConcluidas.has(q.id) ? String(q.respostaCorreta) : '';
            }
        } else {
            if (elPascalinaArea) elPascalinaArea.style.display = 'none';
            if (elInputBox) elInputBox.style.display = 'none';
            if (elOpcoes) {
                elOpcoes.style.display = 'grid';
                elOpcoes.innerHTML = '';

                q.opcoes.forEach((textoOpcao, i) => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'btn-opcao-exercicio';
                    const letra = ['A', 'B', 'C', 'D'][i] || '';
                    btn.innerHTML = `<span><strong>${letra})</strong> ${textoOpcao}</span>`;

                    if (questoesConcluidas.has(q.id) && textoOpcao === q.respostaCorreta) {
                        btn.classList.add('opcao-correta');
                    }

                    btn.addEventListener('click', () => {
                        verificarRespostaMultipla(q, textoOpcao, btn);
                    });

                    elOpcoes.appendChild(btn);
                });
            }
        }

        if (btnQuestaoAnterior) {
            btnQuestaoAnterior.disabled = indiceQuestaoAtual === 0;
        }
        if (btnProximaQuestao) {
            btnProximaQuestao.disabled = indiceQuestaoAtual === QUESTOES_MODULO2.length - 1;
        }

        atualizarPlacarETrilha();
    }

    function registrarAcerto(questao) {
        questoesConcluidas.add(questao.id);
        salvarQuestoesNoLocalStorage();
        tocarSom('acerto');
        aplicarEfeitoCard('efeito-acerto');

        if (elFeedbackInline) {
            elFeedbackInline.style.display = 'block';
            elFeedbackInline.innerHTML = `<strong>Resposta Correta!</strong> ${questao.explicacaoAcerto}`;
        }

        mostrarAvisoLateral(
            `Questão ${questao.id} Correta!`,
            `Acertos: ${questoesConcluidas.size} de ${QUESTOES_MODULO2.length}. Continue assim!`
        );

        atualizarPlacarETrilha();
    }

    function exibirFeedbackErro(questao, respostaDadaTexto) {
        tocarSom('erro');
        aplicarEfeitoCard('efeito-erro');

        abrirModalSite({
            titulo: `Ops! Vamos revisar a Questão ${questao.id}!`,
            mensagem: `Sua resposta foi <strong>"${respostaDadaTexto}"</strong>, mas ainda não é a resposta certa.`,
            dicaHTML: `<strong>Dica Passo a Passo:</strong><br>${questao.dicaErro}`,
            extraHTML: `<strong>Assunto da Questão:</strong> ${questao.categoria}<br>Progresso atual: <strong>${questoesConcluidas.size} de ${QUESTOES_MODULO2.length}</strong> questões concluídas.`,
            textoBotao: 'Tentar Novamente'
        });
    }

    if (btnResponderPascalina) {
        btnResponderPascalina.addEventListener('click', () => {
            const q = QUESTOES_MODULO2[indiceQuestaoAtual];
            if (!q || q.modo !== 'pascalina' || !pascalinaExercicio) return;

            const valorNaPascalina = pascalinaExercicio.obterValorTotal();
            if (valorNaPascalina === q.respostaCorreta) {
                registrarAcerto(q);
            } else {
                exibirFeedbackErro(q, formatarNumeroBR(valorNaPascalina));
            }
        });
    }

    if (btnVerificarInput) {
        btnVerificarInput.addEventListener('click', () => {
            const q = QUESTOES_MODULO2[indiceQuestaoAtual];
            if (!q || q.modo !== 'teclado') return;

            const textoDigitado = elInputResposta ? elInputResposta.value.trim() : '';
            if (textoDigitado === '' || textoDigitado === '-') {
                mostrarAvisoLateral('Digite sua resposta!', 'Informe um número antes de responder.');
                return;
            }

            const valorUsuario = Number(textoDigitado);
            if (isNaN(valorUsuario)) {
                mostrarAvisoLateral('Número Inválido!', 'Digite apenas números para responder.');
                return;
            }

            if (valorUsuario === q.respostaCorreta) {
                registrarAcerto(q);
            } else {
                exibirFeedbackErro(q, formatarNumeroBR(valorUsuario));
            }
        });
    }

    function verificarRespostaMultipla(questao, opcaoEscolhida, botaoClicado) {
        if (opcaoEscolhida === questao.respostaCorreta) {
            if (elOpcoes) {
                elOpcoes.querySelectorAll('.btn-opcao-exercicio').forEach(b => {
                    b.classList.remove('opcao-errada');
                });
            }
            botaoClicado.classList.add('opcao-correta');
            registrarAcerto(questao);
        } else {
            botaoClicado.classList.add('opcao-errada');
            exibirFeedbackErro(questao, opcaoEscolhida);
        }
    }

    if (btnQuestaoAnterior) {
        btnQuestaoAnterior.addEventListener('click', () => {
            if (indiceQuestaoAtual > 0) {
                indiceQuestaoAtual--;
                renderizarQuestaoAtual();
            }
        });
    }

    if (btnProximaQuestao) {
        btnProximaQuestao.addEventListener('click', () => {
            if (indiceQuestaoAtual < QUESTOES_MODULO2.length - 1) {
                indiceQuestaoAtual++;
                renderizarQuestaoAtual();
            }
        });
    }

    renderizarQuestaoAtual();
});
