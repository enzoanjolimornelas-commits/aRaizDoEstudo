const formulario = document.getElementById('formulario');
const level = document.getElementById('nivel');
const questao = document.getElementById('questao');
const recorde = document.getElementById('recorde');
const resposta = document.getElementById('resposta');
const barraTempo = document.getElementById('barra-tempo');
const barraVidas = document.getElementById('vidas');
const folhas = document.querySelectorAll('.folha');
const cardJogo = document.querySelector('#velocidade .cardGrandeCurso');

const containerGeometria = document.createElement('div');
containerGeometria.id = 'container-geometria';
if (questao && questao.parentNode) {
    questao.parentNode.insertBefore(containerGeometria, questao);
}

let resultado, nivel = 1;
let save = 0;
let tempoTotal;
let timerJogo; 
let normalMode = false;
let vidas;
let cont = 2;
let ultimoNivelNotificado = 0;
let timerAviso;
let jogoAtivo = false;

resposta.disabled = true;

let estatisticasErros = {
    somaSubtracao: 0,
    multiplicacao: 0,
    divisao: 0,
    expressoes: 0,
    algebraPotencia: 0,
    geometria: 0
};

let tipoQuestaoAtual = 'somaSubtracao';

const avisoElemento = document.createElement('div');
avisoElemento.classList.add('aviso-dificuldade');
document.body.appendChild(avisoElemento);

const modalErro = document.createElement('div');
modalErro.classList.add('modal-erro-overlay');
modalErro.innerHTML = `
    <div class="modal-erro-conteudo">
        <h3>Ops! Fim da linha ou Vida perdida!</h3>
        <p id="modal-texto-erro"></p>
        <div id="modal-dica-conteudo" class="modal-dica"></div>
        <div id="modal-estatisticas" class="modal-stats"></div>
        <button type="button" id="modal-btn-continuar">Continuar Jogando</button>
    </div>
`;
document.body.appendChild(modalErro);

const modalBtnContinuar = document.getElementById('modal-btn-continuar');
let callbackModalFechado = null;

modalBtnContinuar.addEventListener('click', () => {
    modalErro.classList.remove('mostrar');
    jogoAtivo = true;
    resposta.disabled = false;
    if (typeof callbackModalFechado === 'function') {
        callbackModalFechado();
        callbackModalFechado = null;
    }
    if (!window.matchMedia("(max-width: 768px)").matches) {
        resposta.focus();
    }
});

function mostrarModalErro(mensagem, dica, estatisticasTexto, aoFechar) {
    jogoAtivo = false;
    resposta.disabled = true;
    document.getElementById('modal-texto-erro').textContent = mensagem;
    document.getElementById('modal-dica-conteudo').innerHTML = `<strong>Dica de Estudo:</strong> ${dica}`;
    document.getElementById('modal-estatisticas').innerHTML = `<strong>Áreas para melhorar:</strong><br>${estatisticasTexto}`;
    callbackModalFechado = aoFechar;
    modalErro.classList.add('mostrar');
}

const seletorDaltonismo = document.createElement('select');
seletorDaltonismo.id = 'seletor-daltonismo';
seletorDaltonismo.innerHTML = `
    <option value="padrao">Cores Padrão</option>
    <option value="acessivel">Daltonismo (Alto Contraste)</option>
`;
seletorDaltonismo.addEventListener('change', (e) => {
    if (e.target.value === 'acessivel') {
        document.body.classList.add('modo-daltonico');
    } else {
        document.body.classList.remove('modo-daltonico');
    }
});

const headerElement = document.querySelector('header');
if (headerElement) {
    let headerDiv = headerElement.querySelector('div');
    if (!headerDiv) {
        headerDiv = document.createElement('div');
        headerElement.appendChild(headerDiv);
    }
    headerDiv.innerHTML = '';
    headerDiv.appendChild(seletorDaltonismo);
}

function configurarTecladoVirtual() {
    const isMobile = window.matchMedia("(max-width: 768px)").matches || ('ontouchstart' in window);
    if (isMobile) {
        resposta.setAttribute('inputmode', 'none');
    }

    const teclado = document.createElement('div');
    teclado.classList.add('teclado-virtual');

    const teclas = [
        '7', '8', '9',
        '4', '5', '6',
        '1', '2', '3',
        '-', '0', '⌫'
    ];

    teclas.forEach(t => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = t;
        btn.classList.add('tecla-virtual');
        if (t === '-' || t === '⌫') {
            btn.classList.add('tecla-acao');
        }

        btn.addEventListener('click', () => {
            if (!jogoAtivo) return;
            if (t === '⌫') {
                resposta.value = resposta.value.slice(0, -1);
            } else if (t === '-') {
                if (resposta.value.startsWith('-')) {
                    resposta.value = resposta.value.slice(1);
                } else {
                    resposta.value = '-' + resposta.value;
                }
            } else {
                resposta.value += t;
            }
        });

        teclado.appendChild(btn);
    });

    const btnEnviar = document.createElement('button');
    btnEnviar.type = 'submit';
    btnEnviar.textContent = 'Responder';
    btnEnviar.classList.add('tecla-virtual', 'tecla-enviar');
    teclado.appendChild(btnEnviar);

    formulario.appendChild(teclado);
}

configurarTecladoVirtual();

window.addEventListener('resize', () => {
    if (window.matchMedia("(max-width: 768px)").matches) {
        resposta.setAttribute('inputmode', 'none');
    } else {
        resposta.removeAttribute('inputmode');
    }
});

function mostrarAviso(titulo, mensagem) {
    clearTimeout(timerAviso);
    avisoElemento.innerHTML = `<h4>${titulo}</h4><p>${mensagem}</p>`;
    avisoElemento.classList.add('mostrar');

    timerAviso = setTimeout(() => {
        avisoElemento.classList.remove('mostrar');
    }, 8000);
}

function verificarSaltoDificuldade() {
    if (nivel === ultimoNivelNotificado) return;

    const marcos = {
        1: { titulo: "Aquecimento!", texto: "Soma e Subtração básica!" },
        21: { titulo: "Subindo o Nível!", texto: "Multiplicação e números negativos!" },
        36: { titulo: "Nova Operação!", texto: "Foco em Divisão e Multiplicação!" },
        61: { titulo: "Desafio Maior!", texto: "Expressões com 3 números!" },
        81: { titulo: "Álgebra e Potências!", texto: "Descubra o valor de X e faça potenciações!" },
        101: { titulo: "Geometria Visual!", texto: "Áreas, perímetros e Pitágoras!" },
        122: { titulo: "Modo Infinito!", texto: "Todos os tipos de questões misturados! Menos tempo!" }
    };

    if (marcos[nivel]) {
        ultimoNivelNotificado = nivel;
        mostrarAviso(marcos[nivel].titulo, marcos[nivel].texto);
        if (nivel > 1) {
            tocarSom('levelup');
        }
    }
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function tocarSom(tipo) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const agora = audioCtx.currentTime;

    if (tipo === 'acerto') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, agora);
        osc.frequency.exponentialRampToValueAtTime(880, agora + 0.12);
        gain.gain.setValueAtTime(0.2, agora);
        gain.gain.exponentialRampToValueAtTime(0.01, agora + 0.2);
        osc.start(agora);
        osc.stop(agora + 0.2);
    } else if (tipo === 'levelup') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, agora);
        osc.frequency.setValueAtTime(554.37, agora + 0.1);
        osc.frequency.setValueAtTime(659.25, agora + 0.2);
        osc.frequency.setValueAtTime(880, agora + 0.3);
        gain.gain.setValueAtTime(0.25, agora);
        gain.gain.exponentialRampToValueAtTime(0.01, agora + 0.45);
        osc.start(agora);
        osc.stop(agora + 0.45);
    } else if (tipo === 'erro') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, agora);
        osc.frequency.linearRampToValueAtTime(110, agora + 0.25);
        gain.gain.setValueAtTime(0.2, agora);
        gain.gain.exponentialRampToValueAtTime(0.01, agora + 0.25);
        osc.start(agora);
        osc.stop(agora + 0.25);
    } else if (tipo === 'gameover') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, agora);
        osc.frequency.linearRampToValueAtTime(100, agora + 0.5);
        gain.gain.setValueAtTime(0.3, agora);
        gain.gain.exponentialRampToValueAtTime(0.01, agora + 0.5);
        osc.start(agora);
        osc.stop(agora + 0.5);
    }
}

function aplicarEfeitoVisual(classe) {
    cardJogo.classList.remove('efeito-acerto', 'efeito-erro');
    void cardJogo.offsetWidth;
    cardJogo.classList.add(classe);
    setTimeout(() => {
        cardJogo.classList.remove(classe);
    }, 350);
}

const random = (range = 1) => Math.ceil(Math.random() * range);
const randomIntervalo = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

level.textContent = "Nível " + nivel; 

function carregarRecorde() {
    const chave = normalMode ? "saveNormal" : "saveDificil";
    save = Number(localStorage.getItem(chave)) || 0;
    if (save > 1) {
        recorde.textContent = `Recorde: ${save}`;
        recorde.style.display = 'block';
    } else {
        recorde.style.display = 'none';
    }
}

function checarRecorde() {
    const chave = normalMode ? "saveNormal" : "saveDificil";
    if(nivel > save) {
        localStorage.setItem(chave, nivel);
        save = nivel;
        recorde.textContent = `Recorde: ${save}`;
        recorde.style.display = 'block';
    }
}

function obterDicaEducativa(tipo) {
    switch(tipo) {
        case 'somaSubtracao':
            return "Lembre-se de alinhar as unidades e revisar se somou ou subtraiu o sinal corretamente.";
        case 'multiplicacao':
            return "Na multiplicação, repasse a tabuada com calma. Sinais iguais dão positivo, diferentes dão negativo.";
        case 'divisao':
            return "Na divisão, pense no inverso da multiplicação: qual número multiplicado pelo divisor resulta no dividendo?";
        case 'expressoes':
            return "Em expressões, siga a ordem das operações: primeiro multiplicações e divisões, depois somas e subtrações.";
        case 'algebraPotencia':
            return "Em Álgebra e potências, isole o X passando os termos com sinal trocado ou calcule a base multiplicada por ela mesma.";
        case 'geometria':
            return "Revise as fórmulas: Área do retângulo = base × altura; Triângulo = (base × altura) ÷ 2; Perímetro = soma de todos os lados; Pitágoras: a² + b² = c²; Área do círculo = π x raio x raio; Circunferência = 2 x π x raio.";
        default:
            return "Revise os cálculos básicos e preste atenção aos sinais e regras matemáticas.";
    }
}

function obterTextoEstatisticas() {
    let maiorErro = 'somaSubtracao';
    let maxVal = -1;
    for (let chave in estatisticasErros) {
        if (estatisticasErros[chave] > maxVal) {
            maxVal = estatisticasErros[chave];
            maiorErro = chave;
        }
    }

    const nomesFormatados = {
        somaSubtracao: "Soma e Subtração Básica",
        multiplicacao: "Multiplicação",
        divisao: "Divisão",
        expressoes: "Expressões Numéricas",
        algebraPotencia: "Álgebra e Potências",
        geometria: "Geometria"
    };

    if (maxVal === 0) {
        return "Você ainda não acumula erros significativos! Continue assim.";
    }

    return `Sua área com mais dificuldade atualmente é: <strong>${nomesFormatados[maiorErro]}</strong> (${maxVal} erros registrados). Pratique mais esse tópico!`;
}

function perderVida() {
    clearTimeout(timerJogo);
    barraTempo.style.transition = 'none';
    vidas -= 1;

    estatisticasErros[tipoQuestaoAtual]++;

    aplicarEfeitoVisual('efeito-erro');

    if(normalMode && cont >= 0) {
        folhas[cont].style.display = 'none';
        cont--;
    }

    const dica = obterDicaEducativa(tipoQuestaoAtual);
    const stats = obterTextoEstatisticas();

    if(vidas <= 0) {
        tocarSom('gameover');
        mostrarModalErro(
            `As folhas acabaram! Nível atingido: ${nivel}. O resultado correto era: ${resultado}`,
            dica,
            stats,
            () => {
                checarRecorde();
                nivel = 1;
                ultimoNivelNotificado = 0;
                cont = 2;
                vidas = normalMode ? 3 : 1;
                for(let i = 0; i < 3; i++) {
                    folhas[i].style.display = 'inline';
                }
                level.textContent = "Nível " + nivel;
                gerarNovaQuestao();
            }
        );
    } else {
        tocarSom('erro');
        mostrarModalErro(
            `Você errou! Resposta correta era: ${resultado}. Vidas restantes: ${vidas}`,
            dica,
            stats,
            () => {
                gerarNovaQuestao();
            }
        );
    }
}

function iniciarCronometro() {
    clearTimeout(timerJogo);
    
    barraTempo.style.transition = 'none';
    barraTempo.style.width = '100%';
    
    void barraTempo.offsetWidth;

    barraTempo.style.transition = `width ${tempoTotal}s linear`;
    barraTempo.style.width = '0%';

    timerJogo = setTimeout(() => {
        perderVida();
    }, tempoTotal * 1000);
}

function limparSVGGeometria() {
    containerGeometria.style.display = 'none';
    containerGeometria.innerHTML = '';
}

function gerarFase1(tempoPersonalizado = null) {
    tipoQuestaoAtual = 'somaSubtracao';
    tempoTotal = tempoPersonalizado !== null ? tempoPersonalizado : (normalMode ? 10 : 5);
    let numero1 = random(10);
    let numero2 = random(10);
    let operacao;

    switch(random(2)) {
        case 1:
            operacao = '+';
            resultado = numero1 + numero2;
            break;
        case 2:
            operacao = '-';
            if (numero2 > numero1) {
                [numero1, numero2] = [numero2, numero1];
            }
            resultado = numero1 - numero2;
            break;
    }
    questao.textContent = `${numero1} ${operacao} ${numero2}`;
}

function gerarFase2(tempoPersonalizado = null) {
    tempoTotal = tempoPersonalizado !== null ? tempoPersonalizado : (normalMode ? 10 : 7);
    let numero1, numero2, operacao;

    switch(random(3)) {
        case 1:
            tipoQuestaoAtual = 'somaSubtracao';
            operacao = '-';
            numero1 = randomIntervalo(2, 12);
            numero2 = randomIntervalo(numero1 + 1, 20);
            resultado = numero1 - numero2;
            break;
        case 2:
        case 3:
            tipoQuestaoAtual = 'multiplicacao';
            operacao = 'x';
            numero1 = randomIntervalo(3, 10);
            numero2 = randomIntervalo(3, 10);
            resultado = numero1 * numero2;
            break;
    }
    questao.textContent = `${numero1} ${operacao} ${numero2}`;
}

function gerarFase3(tempoPersonalizado = null) {
    tempoTotal = tempoPersonalizado !== null ? tempoPersonalizado : (normalMode ? 15 : 10);
    let numero1, numero2, operacao;

    switch(random(2)) {
        case 1:
            tipoQuestaoAtual = 'multiplicacao';
            operacao = 'x';
            numero1 = randomIntervalo(4, 12);
            numero2 = randomIntervalo(4, 12);
            resultado = numero1 * numero2;
            break;
        case 2:
            tipoQuestaoAtual = 'divisao';
            operacao = '÷';
            numero2 = randomIntervalo(3, 12);
            resultado = randomIntervalo(3, 12);
            numero1 = numero2 * resultado;
            break;
    }
    questao.textContent = `${numero1} ${operacao} ${numero2}`;
}

function gerarFase4(tempoPersonalizado = null) {
    tempoTotal = tempoPersonalizado !== null ? tempoPersonalizado : (normalMode ? 30 : 20);
    let numero1, numero2, numero3, operacao, operacao2;

    switch (random(4)) {
        case 1:
            switch(random(2)) {
                case 1:
                    tipoQuestaoAtual = 'multiplicacao';
                    numero1 = randomIntervalo(6, 16);
                    numero2 = randomIntervalo(6, 16);
                    operacao = 'x';
                    resultado = numero1 * numero2;
                    break;
                case 2:
                    tipoQuestaoAtual = 'divisao';
                    numero2 = randomIntervalo(4, 20);
                    resultado = randomIntervalo(6, 35);
                    numero1 = numero2 * resultado;
                    operacao = '÷';
                    break;
            }
            questao.textContent = `${numero1} ${operacao} ${numero2}`;
            break;
        case 2:
        case 3:
        case 4:
            tipoQuestaoAtual = 'expressoes';
            switch(random(4)) {
                case 1:
                    numero1 = randomIntervalo(15, 50);
                    numero2 = randomIntervalo(15, 50);
                    numero3 = randomIntervalo(15, 50);
                    operacao = '+';
                    operacao2 = '-';
                    resultado = numero1 + numero2 - numero3;
                    break;
                case 2:
                    numero1 = randomIntervalo(3, 10);
                    numero2 = randomIntervalo(3, 10);
                    numero3 = randomIntervalo(2, 8);
                    operacao = 'x';
                    operacao2 = 'x';
                    resultado = numero1 * numero2 * numero3;
                    break;
                case 3:
                    numero1 = randomIntervalo(4, 12);
                    numero2 = randomIntervalo(4, 12);
                    numero3 = randomIntervalo(10, 50);
                    operacao = 'x';
                    operacao2 = '+';
                    resultado = (numero1 * numero2) + numero3;
                    break;
                case 4:
                    numero1 = randomIntervalo(10, 50);
                    numero2 = randomIntervalo(4, 12);
                    numero3 = randomIntervalo(4, 12);
                    operacao = '+';
                    operacao2 = 'x';
                    resultado = numero1 + (numero2 * numero3);
                    break;
            }
            questao.textContent = `${numero1} ${operacao} ${numero2} ${operacao2} ${numero3}`;
            break;
    }
}

function gerarFase5(tempoPersonalizado = null) {
    tipoQuestaoAtual = 'algebraPotencia';
    tempoTotal = tempoPersonalizado !== null ? tempoPersonalizado : (normalMode ? 35 : 30);
    let numero1, numero2, numero3;

    switch(random(16)) {
        case 1:
            numero1 = randomIntervalo(5, 25);
            numero2 = randomIntervalo(5, 25);
            resultado = numero2 - numero1;
            questao.textContent = `X + ${numero1} = ${numero2}`;
            break;
        case 2:
            numero1 = randomIntervalo(5, 25);
            numero2 = randomIntervalo(5, 25);
            resultado = numero1 + numero2;
            questao.textContent = `X - ${numero1} = ${numero2}`;
            break;
        case 3:
            numero3 = randomIntervalo(2, 5);
            resultado = randomIntervalo(-6, 10);
            if (resultado === 0) resultado = 3;
            numero1 = randomIntervalo(4, 20);
            numero2 = numero3 * resultado + numero1;
            questao.textContent = `${numero3}X + ${numero1} = ${numero2}`;
            break;
        case 4:
            numero2 = randomIntervalo(2, 5);
            numero3 = numero2 + randomIntervalo(1, 4);
            resultado = randomIntervalo(2, 12);
            numero1 = (numero3 - numero2) * resultado;
            questao.textContent = `${numero3}X - ${numero1} = ${numero2}X`;
            break;
        case 5:
            numero2 = randomIntervalo(2, 5);
            numero3 = randomIntervalo(2, 5);
            resultado = randomIntervalo(2, 12);
            numero1 = (numero3 + numero2) * resultado;
            questao.textContent = `${numero3}X + ${numero2}X = ${numero1}`;
            break;
        case 6:
            numero1 = randomIntervalo(10, 50);
            numero2 = randomIntervalo(10, 50);
            resultado = 2 * (numero1 + numero2);
            questao.textContent = `${numero1} + ${numero2} = X/2`;
            break;
        case 7:
            numero1 = randomIntervalo(4, 20);
            resultado = numero1 * numero1;
            questao.textContent = `${numero1}²`;
            break;
        case 8:
            numero1 = randomIntervalo(4, 14);
            numero2 = randomIntervalo(2, 13);
            resultado = numero1 * numero1 - numero2 * numero2;
            questao.textContent = `${numero1}² - ${numero2}²`;
            break;
        case 9:
            numero1 = randomIntervalo(4, 14);
            numero2 = randomIntervalo(2, 13);
            resultado = numero1 * numero1 - numero2 * numero2;
            questao.textContent = `(${numero1} + ${numero2})(${numero1} - ${numero2})`;
            break;
        case 10:
            numero1 = randomIntervalo(2, 5);
            numero2 = random(2) + 2;
            resultado = Math.pow(numero1, numero2);
            if(numero2 === 3) questao.textContent = `${numero1}³`;
            else questao.textContent = `${numero1}⁴`;
            break;
        case 11:
            numero1 = randomIntervalo(2, 6);
            numero2 = randomIntervalo(2, 6);
            numero3 = random(2) + 2;
            resultado = Math.pow(numero1 + numero2, numero3);
            if(numero3 === 3) questao.textContent = `(${numero1} + ${numero2})³`;
            else questao.textContent = `(${numero1} + ${numero2})⁴`;
            break;
        case 12:
            numero1 = Math.pow(randomIntervalo(4, 16), 2);
            resultado = Math.sqrt(numero1);
            questao.textContent = `√(${numero1})`;
            break;
        case 13:
            numero1 = Math.pow(randomIntervalo(3, 15), 2);
            numero2 = Math.pow(randomIntervalo(3, 15), 2);
            resultado = Math.sqrt(numero1) + Math.sqrt(numero2);
            questao.textContent = `√(${numero1}) + √(${numero2})`;
            break;
        case 14:
            numero1 = Math.pow(2, randomIntervalo(3, 10));
            resultado = Math.log2(numero1);
            questao.textContent = `2^X = ${numero1}`;
            break;
        case 15:
            numero1 = Math.pow(10, randomIntervalo(2, 5));
            resultado = Math.log10(numero1);
            questao.textContent = `10^X = ${numero1}`;
            break;
        case 16:
            numero1 = randomIntervalo(2, 5);
            numero2 = randomIntervalo(2, 5);
            resultado = numero2 - 1;
            let termos = Array(numero1).fill(`${numero1}^X`).join(' + ');
            questao.textContent = `${termos} = ${numero1}^${numero2}`;
            break;
    }
}

function gerarQuestaoGeometria(tempoPersonalizado = null) {
    tipoQuestaoAtual = 'geometria';
    tempoTotal = tempoPersonalizado !== null ? tempoPersonalizado : (normalMode ? 35 : 30);
    containerGeometria.style.display = 'flex';

    const tipoGeo = random(7);

    if (tipoGeo === 1) {
        const b = randomIntervalo(4, 18);
        const h = randomIntervalo(3, 14);
        const pedirArea = random(2) === 1;
        resultado = pedirArea ? b * h : 2 * (b + h);
        containerGeometria.innerHTML = `
            <svg viewBox="0 0 240 140">
                <rect x="45" y="20" width="150" height="85" class="svg-forma" />
                <text x="120" y="125" class="svg-texto">${b}</text>
                <text x="215" y="65" class="svg-texto">${h}</text>
            </svg>
        `;
        questao.textContent = pedirArea ? "Área do retângulo?" : "Perímetro do retângulo?";
    } else if (tipoGeo === 2) {
        const l = randomIntervalo(3, 16);
        const pedirArea = random(2) === 1;
        resultado = pedirArea ? l * l : 4 * l;
        containerGeometria.innerHTML = `
            <svg viewBox="0 0 240 145">
                <rect x="75" y="15" width="90" height="90" class="svg-forma" />
                <text x="120" y="125" class="svg-texto">${l}</text>
                <text x="185" y="60" class="svg-texto">${l}</text>
            </svg>
        `;
        questao.textContent = pedirArea ? "Área do quadrado?" : "Perímetro do quadrado?";
    } else if (tipoGeo === 3) {
        const b = randomIntervalo(2, 10) * 2;
        const h = randomIntervalo(3, 15);
        resultado = (b * h) / 2;
        containerGeometria.innerHTML = `
            <svg viewBox="0 0 240 145">
                <polygon points="120,15 45,110 195,110" class="svg-forma" />
                <line x1="120" y1="15" x2="120" y2="110" class="svg-linha-aux" />
                <rect x="110" y="55" width="28" height="20" rx="4" fill="#3E2723" />
                <text x="124" y="66" class="svg-texto">h=${h}</text>
                <rect x="95" y="116" width="50" height="20" rx="4" fill="#3E2723" />
                <text x="120" y="127" class="svg-texto">b=${b}</text>
            </svg>
        `;
        questao.textContent = "Área do triângulo?";
    } else if (tipoGeo === 4) {
        const triplas = [
            [3, 4, 5],
            [6, 8, 10],
            [5, 12, 13],
            [9, 12, 15],
            [8, 15, 17],
            [12, 16, 20]
        ];
        const [c1, c2, hip] = triplas[randomIntervalo(0, triplas.length - 1)];
        resultado = hip;
        containerGeometria.innerHTML = `
            <svg viewBox="0 0 240 145">
                <polygon points="55,20 55,110 185,110" class="svg-forma" />
                <rect x="55" y="96" width="14" height="14" fill="none" stroke="#F5F5DC" stroke-width="2" />
                <text x="35" y="65" class="svg-texto">${c1}</text>
                <text x="120" y="130" class="svg-texto">${c2}</text>
                <text x="135" y="55" class="svg-texto">X</text>
            </svg>
        `;
        questao.textContent = "Hipotenusa X?";
    } else if (tipoGeo === 5) {
        const triplas = [
            [3, 4, 5],
            [6, 8, 10],
            [5, 12, 13],
            [9, 12, 15],
            [8, 15, 17]
        ];
        const [c1, c2, hip] = triplas[randomIntervalo(0, triplas.length - 1)];
        resultado = c2;
        containerGeometria.innerHTML = `
            <svg viewBox="0 0 240 145">
                <polygon points="55,20 55,110 185,110" class="svg-forma" />
                <rect x="55" y="96" width="14" height="14" fill="none" stroke="#F5F5DC" stroke-width="2" />
                <text x="35" y="65" class="svg-texto">${c1}</text>
                <text x="120" y="130" class="svg-texto">X</text>
                <text x="135" y="55" class="svg-texto">${hip}</text>
            </svg>
        `;
        questao.textContent = "Cateto X?";
    } else if (tipoGeo === 6) {
        const r = randomIntervalo(2, 10);
        const pedirArea = random(2) === 1;
        resultado = pedirArea ? 3 * r * r : 2 * 3 * r;
        containerGeometria.innerHTML = `
            <svg viewBox="0 0 240 140">
                <circle cx="120" cy="70" r="50" class="svg-forma" />
                <line x1="120" y1="70" x2="170" y2="70" class="svg-linha-aux" />
                <circle cx="120" cy="70" r="3" fill="#F5F5DC" />
                <text x="145" y="55" class="svg-texto">r = ${r}</text>
            </svg>
        `;
        questao.textContent = pedirArea ? "Área? (use π = 3)" : "Circunferência? (π = 3)";
    } else {
        const l1 = randomIntervalo(4, 15);
        const l2 = randomIntervalo(4, 15);
        const l3 = randomIntervalo(Math.abs(l1 - l2) + 2, l1 + l2 - 1);
        resultado = l1 + l2 + l3;
        containerGeometria.innerHTML = `
            <svg viewBox="0 0 240 145">
                <polygon points="120,20 50,110 190,110" class="svg-forma" />
                <text x="70" y="60" class="svg-texto">${l1}</text>
                <text x="170" y="60" class="svg-texto">${l2}</text>
                <text x="120" y="130" class="svg-texto">${l3}</text>
            </svg>
        `;
        questao.textContent = "Perímetro do triângulo?";
    }
}

function gerarNovaQuestao() {
    clearTimeout(timerJogo);
    verificarSaltoDificuldade();
    limparSVGGeometria();

    if (nivel <= 20) {
        gerarFase1();
    } else if (nivel <= 35) {
        gerarFase2();
    } else if (nivel <= 60) {
        gerarFase3();
    } else if (nivel <= 80) {
        gerarFase4();
    } else if (nivel <= 100) {
        gerarFase5();
    } else if (nivel <= 121) {
        gerarQuestaoGeometria();
    } else {
        const tempoInfinito = 15;
        const sorteio = random(6);
        switch (sorteio) {
            case 1:
                gerarFase1(tempoInfinito);
                break;
            case 2:
                gerarFase2(tempoInfinito);
                break;
            case 3:
                gerarFase3(tempoInfinito);
                break;
            case 4:
                gerarFase4(tempoInfinito);
                break;
            case 5:
                gerarFase5(tempoInfinito);
                break;
            case 6:
                gerarQuestaoGeometria(tempoInfinito + 2);
                break;
        }
    }

    iniciarCronometro();
}

formulario.addEventListener('submit', function(event) {
    event.preventDefault();
    if (!jogoAtivo) return;

    const valorLimpo = resposta.value.trim();
    if (valorLimpo === '' || valorLimpo === '-') return;

    const respostaDoJogador = Number(valorLimpo);

    if(respostaDoJogador === resultado) {
        tocarSom('acerto');
        aplicarEfeitoVisual('efeito-acerto');
        nivel += 1;
        checarRecorde();
        level.textContent = "Nível " + nivel;
        gerarNovaQuestao(); 
    } else {
        perderVida();
    }

    formulario.reset();
    if (!window.matchMedia("(max-width: 768px)").matches) {
        resposta.focus();
    }
});

document.addEventListener("DOMContentLoaded", () => {

    const overlayDificuldade = document.createElement("div");
    const popUp = document.createElement("div");
    const tituloModal = document.createElement("h3");
    const containerOpcoes = document.createElement("div");
    const normal = document.createElement("div");
    const dificil = document.createElement("div");

    overlayDificuldade.classList.add("modal-dificuldade-overlay");
    popUp.classList.add("popup-dificuldade");
    tituloModal.classList.add("popup-dificuldade-titulo");
    containerOpcoes.classList.add("popup-dificuldade-opcoes");
    normal.classList.add("cardCurso");
    dificil.classList.add("cardCurso");

    tituloModal.textContent = 'Escolha a Dificuldade';

    const h2F = document.createElement("h2");
    h2F.textContent = 'Modo Normal';
    const h2D = document.createElement("h2");
    h2D.textContent = 'Modo Difícil';
    
    const pF = document.createElement("p");
    pF.textContent = 'Mais tempo e 3 vidas';
    const pD = document.createElement("p");
    pD.textContent = 'Apenas uma vida';

    normal.appendChild(h2F);
    dificil.appendChild(h2D);

    normal.appendChild(pF);
    dificil.appendChild(pD);

    containerOpcoes.appendChild(normal);
    containerOpcoes.appendChild(dificil);

    popUp.appendChild(tituloModal);
    popUp.appendChild(containerOpcoes);
    overlayDificuldade.appendChild(popUp);

    document.body.appendChild(overlayDificuldade);

    normal.addEventListener('click', () => {
        overlayDificuldade.style.display = 'none';
        barraVidas.style.display = 'flex';
        normalMode = true;
        vidas = 3;
        jogoAtivo = true;
        resposta.disabled = false;
        carregarRecorde();

        gerarNovaQuestao();
        if (!window.matchMedia("(max-width: 768px)").matches) {
            resposta.focus();
        }
    });

    dificil.addEventListener('click', () => {
        overlayDificuldade.style.display = 'none';
        barraVidas.style.display = 'none';
        normalMode = false;
        vidas = 1;
        jogoAtivo = true;
        resposta.disabled = false;
        carregarRecorde();

        gerarNovaQuestao();
        if (!window.matchMedia("(max-width: 768px)").matches) {
            resposta.focus();
        }
    });
});