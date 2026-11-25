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
                osc.frequency.setValueAtTime(320, agora);
                osc.frequency.exponentialRampToValueAtTime(480, agora + 0.06);
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
    function mostrarAvisoLateral(titulo, mensagem, duracao = 5500) {
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

        function atualizarVisores(colunasDestacadas = [], origemInput = false) {
            filas.forEach((fila, idx) => {
                const p = fila.querySelector('p');
                if (p) p.textContent = String(digitos[idx]);

                const detalheOrdem = fila.querySelector('.popup-ordem-detalhe');
                if (detalheOrdem) {
                    const ordem = fila.dataset.ordem;
                    const nomeOrdem = fila.dataset.nomeOrdem;
                    const fator = Number(fila.dataset.fator) || 1;
                    const valorPosicional = digitos[idx] * fator;
                    detalheOrdem.textContent = `${ordem}ª Ordem (${nomeOrdem}): cada passo vale ${formatarNumeroBR(fator)}. Agora: ${digitos[idx]} × ${formatarNumeroBR(fator)} = ${formatarNumeroBR(valorPosicional)}!`;
                }

                if (colunasDestacadas.includes(idx)) {
                    fila.classList.remove('destaque-vai-um');
                    void fila.offsetWidth;
                    fila.classList.add('destaque-vai-um');
                    setTimeout(() => fila.classList.remove('destaque-vai-um'), 650);
                }
            });

            if (typeof opcoes.aoMudar === 'function') {
                opcoes.aoMudar(obterValorTotal(), [...digitos], origemInput);
            }
        }

        function definirValor(novoValor, silencioso = true, origemInput = false) {
            const limpo = Math.max(0, Math.min(maxValor, Math.floor(Number(novoValor) || 0)));
            const str = String(limpo).padStart(totalColunas, '0');
            for (let i = 0; i < totalColunas; i++) {
                digitos[i] = Number(str[i]);
            }
            atualizarVisores([], origemInput);
            if (!silencioso && opcoes.mostrarAvisos) {
                mostrarAvisoLateral('Pascalina Atualizada', `Número ajustado para ${formatarNumeroBR(limpo)}.`);
            }
        }

        function alterarOrdem(indiceColuna, delta) {
            const filaAlvo = filas[indiceColuna];
            const ordemNum = Number(filaAlvo.dataset.ordem) || (totalColunas - indiceColuna);
            const nomeOrdem = filaAlvo.dataset.nomeOrdem || `${ordemNum}ª Ordem`;
            const fator = Math.pow(10, totalColunas - 1 - indiceColuna);
            const valorAntes = obterValorTotal();
            const valorDepois = valorAntes + delta * fator;

            if (valorDepois > maxValor) {
                tocarSom('erro');
                mostrarAvisoLateral(
                    'Limite da Pascalina!',
                    `Esta Pascalina de ${totalColunas} ordens mostra números até ${formatarNumeroBR(maxValor)}. Diminua ou zere para continuar!`
                );
                return;
            }

            if (valorDepois < 0) {
                tocarSom('erro');
                mostrarAvisoLateral(
                    'Atenção na Subtração!',
                    `Não é possível tirar ${formatarNumeroBR(fator)} (${nomeOrdem}) de ${formatarNumeroBR(valorAntes)}. Adicione um valor maior primeiro!`
                );
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

            if (opcoes.mostrarAvisos) {
                const classeAntesMilhar = Math.floor(valorAntes / 1000);
                const classeDepoisMilhar = Math.floor(valorDepois / 1000);

                if (delta > 0 && houveVaiUmOuEmprestimo) {
                    const maisAltaIdx = Math.min(...colunasAlteradas);
                    const filaDestino = filas[maisAltaIdx];
                    const ordemDestino = filaDestino.dataset.ordem;
                    const nomeDestino = filaDestino.dataset.nomeOrdem;

                    if (classeAntesMilhar === 0 && classeDepoisMilhar > 0) {
                        mostrarAvisoLateral(
                            'Nova Classe: Milhares!',
                            `Vai um! 10 Centenas viraram 1 Unidade de Milhar (${ordemDestino}ª Ordem), entrando na 2ª Classe (Classe dos Milhares)!`
                        );
                    } else {
                        mostrarAvisoLateral(
                            `Vai Um! (${ordemNum}ª para ${ordemDestino}ª Ordem)`,
                            `A ${ordemNum}ª Ordem (${nomeOrdem}) completou 10 e voltou para 0, somando +1 na ${ordemDestino}ª Ordem (${nomeDestino})!`
                        );
                    }
                } else if (delta < 0 && houveVaiUmOuEmprestimo) {
                    const maisAltaIdx = Math.min(...colunasAlteradas);
                    const filaOrigem = filas[maisAltaIdx];
                    const ordemOrigem = filaOrigem.dataset.ordem;
                    const nomeOrigem = filaOrigem.dataset.nomeOrdem;

                    mostrarAvisoLateral(
                        'Empréstimo entre Ordens!',
                        `A ${ordemNum}ª Ordem (${nomeOrdem}) estava em 0 e pediu 1 unidade emprestada da ${ordemOrigem}ª Ordem (${nomeOrigem})!`
                    );
                } else {
                    const classeTexto = ordemNum >= 4 ? '2ª Classe: Milhares' : '1ª Classe: Unidades Simples';
                    mostrarAvisoLateral(
                        `${ordemNum}ª Ordem — ${nomeOrdem}`,
                        `${classeTexto} | Agora tem ${digitos[indiceColuna]} ${nomeOrdem}(s) = ${formatarNumeroBR(digitos[indiceColuna] * fator)}. Total: ${formatarNumeroBR(valorDepois)}`
                    );
                }
            }
        }

        filas.forEach((fila, idx) => {
            const setaCima = fila.querySelector('.seta-cima') || fila.querySelectorAll('img')[0];
            const setaBaixo = fila.querySelector('.seta-baixo') || fila.querySelectorAll('img')[1];
            const badgeOrdem = fila.querySelector('.badge-ordem');

            if (setaCima) {
                setaCima.addEventListener('click', (e) => {
                    e.preventDefault();
                    alterarOrdem(idx, 1);
                });
                setaCima.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        alterarOrdem(idx, 1);
                    }
                });
            }

            if (setaBaixo) {
                setaBaixo.addEventListener('click', (e) => {
                    e.preventDefault();
                    alterarOrdem(idx, -1);
                });
                setaBaixo.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        alterarOrdem(idx, -1);
                    }
                });
            }

            if (badgeOrdem) {
                badgeOrdem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const jaAberto = fila.classList.contains('popup-aberto');
                    containerMaquina.querySelectorAll('.popup-aberto').forEach(el => el.classList.remove('popup-aberto'));
                    if (!jaAberto) fila.classList.add('popup-aberto');

                    const ordem = fila.dataset.ordem;
                    const nomeOrdem = fila.dataset.nomeOrdem;
                    const fator = Number(fila.dataset.fator) || 1;
                    const classeNome = fila.dataset.classeNome || '';
                    mostrarAvisoLateral(
                        `${ordem}ª Ordem: ${nomeOrdem}`,
                        `Pertence à ${classeNome}. Cada passo nesta roda vale ${formatarNumeroBR(fator)}. Valor atual nesta ordem: ${formatarNumeroBR(digitos[idx] * fator)}.`
                    );
                });
            }
        });

        const badgesClasse = containerMaquina.querySelectorAll('.badge-classe');
        badgesClasse.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const grupo = btn.closest('.grupo-classe');
                if (grupo) {
                    const jaAberto = grupo.classList.contains('popup-aberto');
                    containerMaquina.querySelectorAll('.popup-aberto').forEach(el => el.classList.remove('popup-aberto'));
                    if (!jaAberto) grupo.classList.add('popup-aberto');
                }
                const numClasse = btn.dataset.classeInfo;
                if (numClasse === '2') {
                    mostrarAvisoLateral(
                        '2ª Classe: Classe dos Milhares',
                        'Formada pela 4ª Ordem (Unidade de Milhar), 5ª Ordem (Dezena de Milhar) e 6ª Ordem (Centena de Milhar). Vai de 1.000 a 999.000!'
                    );
                } else {
                    mostrarAvisoLateral(
                        '1ª Classe: Unidades Simples',
                        'Formada pelas 3 primeiras ordens da direita para a esquerda: 1ª Ordem (Unidade), 2ª Ordem (Dezena) e 3ª Ordem (Centena)!'
                    );
                }
            });
        });

        document.addEventListener('click', () => {
            containerMaquina.querySelectorAll('.popup-aberto').forEach(el => el.classList.remove('popup-aberto'));
        });

        atualizarVisores();

        return {
            obterValorTotal,
            definirValor,
            obterDigitos: () => [...digitos]
        };
    }

    const elValorTotalTeoria = document.getElementById('pascalina-valor-total');
    const elDecomposicaoTeoria = document.getElementById('pascalina-decomposicao-texto');
    const btnZerarPascalina = document.getElementById('btn-zerar-pascalina');

    const nomesOrdens6 = [
        { ordem: 6, nome: 'Centena de Milhar', sigla: 'CM', fator: 100000, classe: '2ª Classe (Milhares)' },
        { ordem: 5, nome: 'Dezena de Milhar', sigla: 'DM', fator: 10000, classe: '2ª Classe (Milhares)' },
        { ordem: 4, nome: 'Unidade de Milhar', sigla: 'UM', fator: 1000, classe: '2ª Classe (Milhares)' },
        { ordem: 3, nome: 'Centena', sigla: 'C', fator: 100, classe: '1ª Classe (Unidades Simples)' },
        { ordem: 2, nome: 'Dezena', sigla: 'D', fator: 10, classe: '1ª Classe (Unidades Simples)' },
        { ordem: 1, nome: 'Unidade', sigla: 'U', fator: 1, classe: '1ª Classe (Unidades Simples)' }
    ];

    function gerarResumoDecomposicao(valor, digitos) {
        if (valor === 0) {
            return '0 Unidades (1ª Classe: Unidades Simples — clique nas setas para testar!)';
        }
        const partes = [];
        digitos.forEach((d, idx) => {
            if (d > 0) {
                const info = nomesOrdens6[idx];
                partes.push(`${d} ${info.sigla} (${formatarNumeroBR(d * info.fator)})`);
            }
        });
        const classesAtivas = valor >= 1000
            ? '2 Classes: Milhares e Unidades Simples'
            : '1 Classe: Unidades Simples';
        return `${partes.join(' + ')} | ${classesAtivas}`;
    }

    const pascalinaTeoria = criarControladorPascalina(
        document.getElementById('pascalina-teoria'),
        {
            mostrarAvisos: true,
            aoMudar: (valor, digitos) => {
                if (elValorTotalTeoria) {
                    elValorTotalTeoria.textContent = formatarNumeroBR(valor);
                }
                if (elDecomposicaoTeoria) {
                    elDecomposicaoTeoria.textContent = gerarResumoDecomposicao(valor, digitos);
                }
            }
        }
    );

    if (btnZerarPascalina && pascalinaTeoria) {
        btnZerarPascalina.addEventListener('click', () => {
            pascalinaTeoria.definirValor(0, true);
            tocarSom('engrenagem');
            mostrarAvisoLateral('Pascalina Zerada!', 'Todas as rodas da Pascalina voltaram para 0.');
        });
    }

    const QUESTOES_MODULO1 = [
        {
            id: 1,
            categoria: 'Troca de Ordem na Pascalina',
            modo: 'pascalina',
            valorInicial: 9,
            respostaCorreta: 10,
            dicaPascalina: 'A Pascalina está em 9. Clique 1 vez na seta para cima da 1ª Ordem (Unidades) e veja o que acontece!',
            enunciado: 'A Pascalina começa marcando <strong>9</strong> na 1ª Ordem (Unidades). Gire apenas <strong>+1 na roda das Unidades</strong> (<strong>9 + 1</strong>) para ver 10 unidades virarem 1 dezena!',
            explicacaoAcerto: 'Isso mesmo! No Sistema Decimal, ao juntar 10 unidades, a 1ª Ordem volta para 0 e soma +1 na 2ª Ordem (Dezenas), formando 10.',
            dicaErro: 'Clique na seta para cima da 1ª Ordem (U — Unidades) apenas uma vez. Como 9 + 1 = 10, a máquina gira automaticamente para 1 na 2ª Ordem (Dezenas) e 0 na 1ª Ordem.'
        },
        {
            id: 2,
            categoria: 'Troca de Ordem na Pascalina',
            modo: 'pascalina',
            valorInicial: 99,
            respostaCorreta: 100,
            dicaPascalina: 'A Pascalina está em 99. Clique 1 vez na seta para cima da 1ª Ordem (Unidades) para chegar à 3ª Ordem!',
            enunciado: 'Com a Pascalina marcando <strong>99</strong> (9 dezenas e 9 unidades), adicione <strong>+1 na roda das Unidades</strong> (<strong>99 + 1</strong>) e observe a passagem para a <strong>3ª Ordem (Centenas)</strong>!',
            explicacaoAcerto: 'Perfeito! 99 + 1 = 100. Dez dezenas formam 1 Centena (3ª Ordem)!',
            dicaErro: 'Partindo de 99, basta aumentar 1 na 1ª Ordem (U). O 9 das unidades vira 0 e passa +1 para as dezenas; o 9 das dezenas também vira 0 e passa +1 para a 3ª Ordem (Centenas), formando 100.'
        },
        {
            id: 3,
            categoria: 'Mudança de Classe na Pascalina',
            modo: 'pascalina',
            valorInicial: 999,
            respostaCorreta: 1000,
            dicaPascalina: 'A Pascalina está no maior número da 1ª Classe (999). Adicione +1 nas Unidades para entrar na 2ª Classe!',
            enunciado: 'A Pascalina está em <strong>999</strong> (o maior número da 1ª Classe: Unidades Simples). Gire <strong>+1 na roda das Unidades</strong> (<strong>999 + 1</strong>) para atravessar para a <strong>2ª Classe (Milhares)</strong>!',
            explicacaoAcerto: 'Fantástico! 999 + 1 = 1.000. Quando completamos 10 centenas, entramos na 4ª Ordem (Unidade de Milhar), abrindo a 2ª Classe: Classe dos Milhares!',
            dicaErro: 'Aumente apenas 1 na 1ª Ordem (Unidades). As três ordens da 1ª Classe (9, 9 e 9) zeram juntas e empurram +1 para a 4ª Ordem (Unidade de Milhar), formando 1.000.'
        },
        {
            id: 4,
            categoria: 'Empréstimo de Ordens na Pascalina',
            modo: 'pascalina',
            valorInicial: 100,
            respostaCorreta: 99,
            dicaPascalina: 'A Pascalina está em 100. Clique 1 vez na seta para baixo da 1ª Ordem (Unidades) para ver o empréstimo!',
            enunciado: 'Agora faça o caminho inverso! A Pascalina marca <strong>100</strong> (1 Centena na 3ª Ordem). Gire <strong>-1 na roda das Unidades</strong> (<strong>100 - 1</strong>) para observar como a Centena empresta para as ordens menores!',
            explicacaoAcerto: 'Muito bem! 100 - 1 = 99. Como as Unidades e Dezenas estavam em 0, a 3ª Ordem (Centenas) emprestou 1 centena, que virou 9 dezenas e 9 unidades!',
            dicaErro: 'Clique 1 vez na seta para baixo da 1ª Ordem (Unidades). A máquina empresta automaticamente da 3ª Ordem (Centenas) para a 2ª e 1ª Ordens, mostrando 99.'
        },

        {
            id: 5,
            categoria: 'Que ordem é essa?',
            modo: 'teclado',
            quadroLegenda: 'Descubra quem ocupa a 4ª Ordem (Unidades de Milhar):',
            quadroTokens: [
                { texto: '6', destaque: false },
                { texto: '3', destaque: false },
                { texto: '9', destaque: false },
                { ponto: '.' },
                { texto: '4', destaque: false },
                { texto: '8', destaque: false },
                { texto: '2', destaque: false }
            ],
            enunciado: 'No número <strong>639.482</strong>, digite qual é o algarismo que ocupa a <strong>4ª Ordem (Unidades de Milhar)</strong>:',
            respostaCorreta: 9,
            explicacaoAcerto: 'Exato! Da direita para a esquerda: 2 (1ª), 8 (2ª), 4 (3ª) e 9 está na 4ª Ordem (Unidades de Milhar)!',
            dicaErro: 'Não conte da esquerda para a direita! As ordens começam na direita: 1ª ordem = 2, 2ª ordem = 8, 3ª ordem = 4, e a 4ª ordem (logo antes do ponto de milhar) é o algarismo 9.'
        },
        {
            id: 6,
            categoria: 'Valor na Ordem',
            modo: 'teclado',
            quadroLegenda: 'Algarismo 6 destacado na 2ª Ordem (Dezenas):',
            quadroTokens: [
                { texto: '7', destaque: false },
                { texto: '2', destaque: false },
                { ponto: '.' },
                { texto: '3', destaque: false },
                { texto: '6', destaque: true },
                { texto: '5', destaque: false }
            ],
            enunciado: 'No número <strong>72.365</strong>, o algarismo <strong>6</strong> está na 2ª Ordem (Dezenas). Digite quanto vale esse algarismo nessa posição:',
            respostaCorreta: 60,
            explicacaoAcerto: 'Perfeito! O 6 está na 2ª Ordem (Dezenas), e 6 dezenas equivalem a 6 × 10 = 60 unidades!',
            dicaErro: 'O 5 está na 1ª ordem (Unidades) e o 6 está logo à esquerda dele, na 2ª Ordem (Dezenas). Como cada dezena vale 10, o 6 nessa posição vale 60.'
        },
        {
            id: 7,
            categoria: 'Valor na Ordem',
            modo: 'teclado',
            quadroLegenda: 'Algarismo 8 destacado na 4ª Ordem (Unidades de Milhar):',
            quadroTokens: [
                { texto: '4', destaque: false },
                { texto: '8', destaque: true },
                { ponto: '.' },
                { texto: '2', destaque: false },
                { texto: '0', destaque: false },
                { texto: '9', destaque: false }
            ],
            enunciado: 'No número <strong>48.209</strong>, o algarismo <strong>8</strong> está destacado na 4ª Ordem (Unidades de Milhar). Digite quanto vale o 8 nessa posição:',
            respostaCorreta: 8000,
            explicacaoAcerto: 'Muito bem! Como o 8 está na 4ª Ordem (Unidades de Milhar), cada unidade ali vale 1.000: 8 × 1.000 = 8.000!',
            dicaErro: 'Conte da direita para a esquerda: 9 (Unidade), 0 (Dezena), 2 (Centena) e 8 (Unidade de Milhar). Cada unidade de milhar vale 1.000, então 8 unidades de milhar valem 8000.'
        },
        {
            id: 8,
            categoria: 'Contagem de Ordens',
            modo: 'teclado',
            quadroLegenda: 'Conte quantas ordens possui o número 125.430:',
            quadroTokens: [
                { texto: '1', destaque: true },
                { texto: '2', destaque: true },
                { texto: '5', destaque: true },
                { ponto: '.' },
                { texto: '4', destaque: true },
                { texto: '3', destaque: true },
                { texto: '0', destaque: true }
            ],
            enunciado: 'Cada algarismo de um número ocupa uma ordem. Quantas <strong>ordens</strong> tem o número <strong>125.430</strong> ao todo?',
            respostaCorreta: 6,
            explicacaoAcerto: 'Correto! O número 125.430 tem 6 algarismos, portanto possui 6 ordens (da 1ª Ordem até a 6ª Ordem: Centena de Milhar)!',
            dicaErro: 'Basta contar quantos algarismos formam o número 125.430: são 6 algarismos (0, 3, 4, 5, 2 e 1), ou seja, 6 ordens.'
        },
        {
            id: 9,
            categoria: 'Contagem de Classes',
            modo: 'teclado',
            quadroLegenda: 'Observe os grupos de 3 ordens no número 450.219:',
            quadroTokens: [
                { texto: '4', destaque: true },
                { texto: '5', destaque: true },
                { texto: '0', destaque: true },
                { ponto: '.' },
                { texto: '2', destaque: false },
                { texto: '1', destaque: false },
                { texto: '9', destaque: false }
            ],
            enunciado: 'A cada três ordens formamos uma classe. Quantas <strong>classes</strong> possui o número <strong>450.219</strong>?',
            respostaCorreta: 2,
            explicacaoAcerto: 'Exato! O número 450.219 tem 2 classes completas: 219 na 1ª Classe (Unidades Simples) e 450 na 2ª Classe (Milhares)!',
            dicaErro: 'Separe os grupos de 3 algarismos da direita para a esquerda: o grupo 219 é a 1ª Classe (Unidades Simples) e o grupo 450 é a 2ª Classe (Milhares). Total: 2 classes.'
        },

        {
            id: 10,
            categoria: 'Que ordem é essa?',
            modo: 'multipla',
            quadroLegenda: 'Algarismo 7 destacado — contando da direita para a esquerda:',
            quadroTokens: [
                { texto: '4', destaque: false },
                { ponto: '.' },
                { texto: '7', destaque: true },
                { texto: '2', destaque: false },
                { texto: '9', destaque: false }
            ],
            enunciado: 'Observe o número <strong>4.729</strong> no quadro abaixo, onde o algarismo <strong>7</strong> está em destaque. <strong>Que ordem é essa</strong> que o algarismo 7 ocupa?',
            opcoes: [
                '2ª Ordem — Dezenas',
                '3ª Ordem — Centenas',
                '4ª Ordem — Unidades de Milhar',
                '1ª Ordem — Unidades'
            ],
            respostaCorreta: '3ª Ordem — Centenas',
            explicacaoAcerto: 'Correto! Contando da direita para a esquerda: 9 é a 1ª ordem (Unidades), 2 é a 2ª ordem (Dezenas) e 7 é a 3ª Ordem (Centenas), valendo 700!',
            dicaErro: 'Lembre-se: as ordens são sempre contadas da DIREITA para a ESQUERDA! 1ª ordem = 9 (Unidade), 2ª ordem = 2 (Dezena), 3ª ordem = 7 (Centena), 4ª ordem = 4 (Unidade de Milhar).'
        },
        {
            id: 11,
            categoria: 'Que ordem é essa?',
            modo: 'multipla',
            quadroLegenda: 'Algarismo 5 destacado no número 58.314:',
            quadroTokens: [
                { texto: '5', destaque: true },
                { texto: '8', destaque: false },
                { ponto: '.' },
                { texto: '3', destaque: false },
                { texto: '1', destaque: false },
                { texto: '4', destaque: false }
            ],
            enunciado: 'No número <strong>58.314</strong>, o algarismo <strong>5</strong> está destacado. <strong>Que ordem é essa?</strong>',
            opcoes: [
                '4ª Ordem — Unidades de Milhar',
                '2ª Ordem — Dezenas Simples',
                '5ª Ordem — Dezenas de Milhar',
                '6ª Ordem — Centenas de Milhar'
            ],
            respostaCorreta: '5ª Ordem — Dezenas de Milhar',
            explicacaoAcerto: 'Isso aí! O 5 está na 5ª posição da direita para a esquerda: 5ª Ordem (Dezenas de Milhar), valendo 50.000!',
            dicaErro: 'Conte cada posição da direita para a esquerda: 4 (1ª: Unidade), 1 (2ª: Dezena), 3 (3ª: Centena), 8 (4ª: Unidade de Milhar) e 5 (5ª Ordem: Dezena de Milhar).'
        },
        {
            id: 12,
            categoria: 'Que ordem é essa?',
            modo: 'multipla',
            quadroLegenda: 'Algarismo 8 destacado na posição mais à esquerda:',
            quadroTokens: [
                { texto: '8', destaque: true },
                { texto: '0', destaque: false },
                { texto: '4', destaque: false },
                { ponto: '.' },
                { texto: '1', destaque: false },
                { texto: '5', destaque: false },
                { texto: '6', destaque: false }
            ],
            enunciado: 'Olhe para o número <strong>804.156</strong>, com o algarismo <strong>8</strong> em destaque. <strong>Que ordem é essa?</strong>',
            opcoes: [
                '6ª Ordem — Centenas de Milhar',
                '3ª Ordem — Centenas Simples',
                '5ª Ordem — Dezenas de Milhar',
                '7ª Ordem — Unidades de Milhão'
            ],
            respostaCorreta: '6ª Ordem — Centenas de Milhar',
            explicacaoAcerto: 'Muito bem! O algarismo 8 ocupa a 6ª Ordem (Centenas de Milhar), representando 800.000 unidades!',
            dicaErro: 'O número 804.156 tem 6 algarismos. Contando da direita (6 = 1ª ordem) até a esquerda (8 = 6ª ordem), o 8 é a Centena da Classe dos Milhares: 6ª Ordem (Centenas de Milhar).'
        },
        {
            id: 13,
            categoria: 'Que ordem é essa?',
            modo: 'multipla',
            quadroLegenda: 'Algarismo 9 destacado na extrema direita de 31.409:',
            quadroTokens: [
                { texto: '3', destaque: false },
                { texto: '1', destaque: false },
                { ponto: '.' },
                { texto: '4', destaque: false },
                { texto: '0', destaque: false },
                { texto: '9', destaque: true }
            ],
            enunciado: 'No número <strong>31.409</strong>, o algarismo <strong>9</strong> está destacado na extrema direita. <strong>Que ordem é essa?</strong>',
            opcoes: [
                '3ª Ordem — Centenas',
                '5ª Ordem — Dezenas de Milhar',
                '2ª Ordem — Dezenas',
                '1ª Ordem — Unidades'
            ],
            respostaCorreta: '1ª Ordem — Unidades',
            explicacaoAcerto: 'Isso mesmo! O primeiro algarismo da direita é sempre a 1ª Ordem (Unidades)!',
            dicaErro: 'A contagem das ordens começa sempre pela direita! Por isso, o último algarismo à direita (9) ocupa a 1ª Ordem (Unidades).'
        },
        {
            id: 14,
            categoria: 'Que ordem é essa?',
            modo: 'multipla',
            quadroLegenda: 'Algarismo 2 destacado na 3ª Classe de 2.740.315:',
            quadroTokens: [
                { texto: '2', destaque: true },
                { ponto: '.' },
                { texto: '7', destaque: false },
                { texto: '4', destaque: false },
                { texto: '0', destaque: false },
                { ponto: '.' },
                { texto: '3', destaque: false },
                { texto: '1', destaque: false },
                { texto: '5', destaque: false }
            ],
            enunciado: 'Observe o número <strong>2.740.315</strong>, com o algarismo <strong>2</strong> em destaque. <strong>Que ordem é essa?</strong>',
            opcoes: [
                '4ª Ordem — Unidades de Milhar',
                '7ª Ordem — Unidades de Milhão',
                '6ª Ordem — Centenas de Milhar',
                '8ª Ordem — Dezenas de Milhão'
            ],
            respostaCorreta: '7ª Ordem — Unidades de Milhão',
            explicacaoAcerto: 'Excelente! Depois das 3 ordens das Unidades Simples e das 3 ordens dos Milhares, o 2 ocupa a 7ª Ordem: Unidades de Milhão!',
            dicaErro: 'Conte da direita para a esquerda: 315 ocupa as 1ª, 2ª e 3ª ordens; 740 ocupa as 4ª, 5ª e 6ª ordens; logo, o algarismo 2 está na 7ª Ordem (Unidades de Milhão).'
        },

        {
            id: 15,
            categoria: 'Que classe é essa?',
            modo: 'multipla',
            quadroLegenda: 'Grupo das 3 primeiras ordens (829) destacado:',
            quadroTokens: [
                { texto: '1', destaque: false },
                { texto: '4', destaque: false },
                { ponto: '.' },
                { texto: '8', destaque: true },
                { texto: '2', destaque: true },
                { texto: '9', destaque: true }
            ],
            enunciado: 'No número <strong>14.829</strong>, o grupo dos três primeiros algarismos da direita (<strong>829</strong>) está destacado. <strong>Que classe é essa?</strong>',
            opcoes: [
                '2ª Classe — Classe dos Milhares',
                '3ª Classe — Classe dos Milhões',
                '1ª Classe — Classe das Unidades Simples',
                '4ª Classe — Classe dos Bilhões'
            ],
            respostaCorreta: '1ª Classe — Classe das Unidades Simples',
            explicacaoAcerto: 'Correto! As 3 primeiras ordens da direita para a esquerda (1ª, 2ª e 3ª ordens: 829) formam a 1ª Classe: Classe das Unidades Simples!',
            dicaErro: 'As classes agrupam as ordens de 3 em 3 da direita para a esquerda. O primeiro trio da direita (Unidades, Dezenas e Centenas = 829) é sempre a 1ª Classe: Classe das Unidades Simples.'
        },
        {
            id: 16,
            categoria: 'Que classe é essa?',
            modo: 'multipla',
            quadroLegenda: 'Grupo da 4ª, 5ª e 6ª ordens (345) destacado:',
            quadroTokens: [
                { texto: '3', destaque: true },
                { texto: '4', destaque: true },
                { texto: '5', destaque: true },
                { ponto: '.' },
                { texto: '1', destaque: false },
                { texto: '2', destaque: false },
                { texto: '0', destaque: false }
            ],
            enunciado: 'Observe o grupo destacado (<strong>345</strong>) no número <strong>345.120</strong>. <strong>Que classe é essa</strong> formada pelas 4ª, 5ª e 6ª ordens?',
            opcoes: [
                '1ª Classe — Classe das Unidades Simples',
                '3ª Classe — Classe dos Milhões',
                '4ª Classe — Classe dos Bilhões',
                '2ª Classe — Classe dos Milhares'
            ],
            respostaCorreta: '2ª Classe — Classe dos Milhares',
            explicacaoAcerto: 'Isso mesmo! O segundo grupo de 3 algarismos da direita para a esquerda (345) pertence à 2ª Classe: Classe dos Milhares (345 mil)!',
            dicaErro: 'A cada três ordens mudamos de classe: 120 está na 1ª Classe (Unidades Simples) e 345 (que vem antes do primeiro ponto) está na 2ª Classe (Classe dos Milhares).'
        },
        {
            id: 17,
            categoria: 'Que classe é essa?',
            modo: 'multipla',
            quadroLegenda: 'Grupo da 7ª e 8ª ordens (27) destacado:',
            quadroTokens: [
                { texto: '2', destaque: true },
                { texto: '7', destaque: true },
                { ponto: '.' },
                { texto: '5', destaque: false },
                { texto: '0', destaque: false },
                { texto: '4', destaque: false },
                { ponto: '.' },
                { texto: '8', destaque: false },
                { texto: '9', destaque: false },
                { texto: '0', destaque: false }
            ],
            enunciado: 'No número <strong>27.504.890</strong>, o grupo <strong>27</strong> está em destaque. <strong>Que classe é essa?</strong>',
            opcoes: [
                '4ª Classe — Classe dos Bilhões',
                '2ª Classe — Classe dos Milhares',
                '3ª Classe — Classe dos Milhões',
                '1ª Classe — Classe das Unidades Simples'
            ],
            respostaCorreta: '3ª Classe — Classe dos Milhões',
            explicacaoAcerto: 'Parabéns! 890 é a 1ª Classe (Unidades Simples), 504 é a 2ª Classe (Milhares) e 27 é a 3ª Classe (Classe dos Milhões: 27 milhões)!',
            dicaErro: 'Conte os grupos separados por ponto da direita para a esquerda: 1º grupo (890) = Unidades Simples; 2º grupo (504) = Milhares; 3º grupo (27) = 3ª Classe (Classe dos Milhões)!'
        },
        {
            id: 18,
            categoria: 'Que classe é essa?',
            modo: 'multipla',
            quadroLegenda: 'Algarismo 9 na 10ª ordem destacado:',
            quadroTokens: [
                { texto: '9', destaque: true },
                { ponto: '.' },
                { texto: '1', destaque: false },
                { texto: '3', destaque: false },
                { texto: '0', destaque: false },
                { ponto: '.' },
                { texto: '4', destaque: false },
                { texto: '0', destaque: false },
                { texto: '0', destaque: false },
                { ponto: '.' },
                { texto: '0', destaque: false },
                { texto: '0', destaque: false },
                { texto: '0', destaque: false }
            ],
            enunciado: 'Olhando para o número <strong>9.130.400.000</strong>, o algarismo <strong>9</strong> (na 10ª ordem) pertence a <strong>que classe?</strong>',
            opcoes: [
                '3ª Classe — Classe dos Milhões',
                '4ª Classe — Classe dos Bilhões',
                '2ª Classe — Classe dos Milhares',
                '1ª Classe — Classe das Unidades Simples'
            ],
            respostaCorreta: '4ª Classe — Classe dos Bilhões',
            explicacaoAcerto: 'Fantástico! Depois das Unidades Simples (1ª), Milhares (2ª) e Milhões (3ª), a 10ª, 11ª e 12ª ordens formam a 4ª Classe: Classe dos Bilhões!',
            dicaErro: 'Observe a tabela de classes da direita para a esquerda: 1º trio (000) = Unidades Simples; 2º trio (400) = Milhares; 3º trio (130) = Milhões; 4º grupo (9) = 4ª Classe (Bilhões).'
        },
        {
            id: 19,
            categoria: 'Ordens e Classes',
            modo: 'multipla',
            quadroLegenda: 'Analise todas as ordens e classes de 45.231:',
            quadroTokens: [
                { texto: '4', destaque: true },
                { texto: '5', destaque: true },
                { ponto: '.' },
                { texto: '2', destaque: false },
                { texto: '3', destaque: false },
                { texto: '1', destaque: false }
            ],
            enunciado: 'O número <strong>45.231</strong> possui quantas <strong>ordens</strong> e quantas <strong>classes</strong> ao todo?',
            opcoes: [
                '5 ordens e 5 classes',
                '2 ordens e 5 classes',
                '6 ordens e 3 classes',
                '5 ordens e 2 classes (Unidades Simples e Milhares)'
            ],
            respostaCorreta: '5 ordens e 2 classes (Unidades Simples e Milhares)',
            explicacaoAcerto: 'Perfeito! São 5 algarismos (5 ordens) divididos em 2 classes: 231 na 1ª Classe (Unidades Simples) e 45 na 2ª Classe (Milhares)!',
            dicaErro: 'Cada algarismo ocupa 1 ordem: como 45.231 tem 5 algarismos, ele tem 5 ordens. Já as classes agrupam de 3 em 3: (231) é a 1ª classe e (45) é a 2ª classe, totalizando 2 classes!'
        },

        {
            id: 20,
            categoria: 'Desafio Final na Pascalina',
            modo: 'pascalina',
            valorInicial: 0,
            respostaCorreta: 1205,
            dicaPascalina: 'Gire cada ordem da Pascalina para montar o número pedido e clique em Responder com a Pascalina!',
            enunciado: 'Desafio Final! Gire as rodas da Pascalina para montar o número formado por <strong>1 Unidade de Milhar (4ª Ordem)</strong>, <strong>2 Centenas (3ª Ordem)</strong>, <strong>0 Dezenas (2ª Ordem)</strong> e <strong>5 Unidades (1ª Ordem)</strong>.',
            explicacaoAcerto: 'Parabéns, você dominou o Sistema Decimal, as Ordens, as Classes e a Pascalina! 1 Unidade de Milhar + 2 Centenas + 0 Dezenas + 5 Unidades = 1.205!',
            dicaErro: 'Ajuste cada roda da Pascalina na ordem certa: coloque 1 na 4ª Ordem (UM), 2 na 3ª Ordem (C), deixe 0 na 2ª Ordem (D) e coloque 5 na 1ª Ordem (U), formando 1.205.'
        }
    ];

    const CHAVE_STORAGE_QUESTOES = 'modulo1_questoes_concluidas';
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
                    if (!isNaN(numId) && QUESTOES_MODULO1.some(q => q.id === numId)) {
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
            const q = QUESTOES_MODULO1[indiceQuestaoAtual];
            if (q && q.modo === 'pascalina') {
                pascalinaExercicio.definirValor(q.valorInicial || 0, true);
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
        QUESTOES_MODULO1.forEach((q, idx) => {
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
            elPlacar.textContent = `Acertos: ${questoesConcluidas.size} / ${QUESTOES_MODULO1.length}`;
        }
        if (typeof window.atualizarBarraProgressoModulo === 'function') {
            const painelEx = document.getElementById('painel-exercicios');
            if (painelEx && painelEx.classList.contains('ativo')) {
                const perc = questoesConcluidas.size > 0
                    ? (questoesConcluidas.size / QUESTOES_MODULO1.length) * 100
                    : ((indiceQuestaoAtual + 1) / QUESTOES_MODULO1.length) * 100;
                window.atualizarBarraProgressoModulo(perc);
            }
        }
        construirTrilhaPilulas();

        if (elResumoFinal) {
            if (questoesConcluidas.size === QUESTOES_MODULO1.length) {
                elResumoFinal.style.display = 'flex';
                elResumoFinal.innerHTML = `
                    <h3>Parabéns! Você concluiu todas as 20 questões!</h3>
                    <p>Você dominou o Sistema Decimal, as Ordens, as Classes e o funcionamento da Pascalina!</p>
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
        const q = QUESTOES_MODULO1[indiceQuestaoAtual];
        if (!q) return;

        if (elProgressoTexto) elProgressoTexto.textContent = `Questão ${indiceQuestaoAtual + 1} de ${QUESTOES_MODULO1.length}`;
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
                pascalinaExercicio.definirValor(valorParaMostrar, true);
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
            btnProximaQuestao.disabled = indiceQuestaoAtual === QUESTOES_MODULO1.length - 1;
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
            `Acertos: ${questoesConcluidas.size} de ${QUESTOES_MODULO1.length}. Continue assim!`
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
            extraHTML: `<strong>Assunto da Questão:</strong> ${questao.categoria}<br>Progresso atual: <strong>${questoesConcluidas.size} de ${QUESTOES_MODULO1.length}</strong> questões concluídas.`,
            textoBotao: 'Tentar Novamente'
        });
    }

    if (btnResponderPascalina) {
        btnResponderPascalina.addEventListener('click', () => {
            const q = QUESTOES_MODULO1[indiceQuestaoAtual];
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
            const q = QUESTOES_MODULO1[indiceQuestaoAtual];
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
            if (indiceQuestaoAtual < QUESTOES_MODULO1.length - 1) {
                indiceQuestaoAtual++;
                renderizarQuestaoAtual();
            }
        });
    }

    renderizarQuestaoAtual();
});
