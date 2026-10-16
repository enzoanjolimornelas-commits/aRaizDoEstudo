const formulario = document.getElementById('formulario');
const level = document.getElementById('nivel');
const questao = document.getElementById('questao');
const recorde = document.getElementById('recorde');
const resposta = document.getElementById('resposta');
const barraTempo = document.getElementById('barra-tempo');
const barraVidas = document.getElementById('vidas');
const folhas = document.querySelectorAll('.folha');
const cardJogo = document.querySelector('#velocidade .cardGrandeCurso');
const btnMenos = document.getElementById('btn-menos');

questao.style.wordSpacing = "1.0em";
questao.style.letterSpacing = "0.1em";

let resultado, nivel = 1;
let save = 0;
let tempoTotal;
let timerJogo; 
let normalMode = false;
let vidas;
let cont = 2;
let ultimoNivelNotificado = 0;
let timerAviso;
let dicaNegativoMostrada = false;
let timerDicaNegativo;

const avisoElemento = document.createElement('div');
avisoElemento.classList.add('aviso-dificuldade');
document.body.appendChild(avisoElemento);

const dicaNegativo = document.createElement('div');
dicaNegativo.classList.add('dica-negativo');
dicaNegativo.textContent = 'Toque em +/- para número negativo!';

if (btnMenos && btnMenos.parentElement) {
    btnMenos.parentElement.style.position = 'relative';
    btnMenos.parentElement.appendChild(dicaNegativo);
}

function mostrarDicaNegativo() {
    if (dicaNegativoMostrada || !btnMenos) return;
    dicaNegativoMostrada = true;
    clearTimeout(timerDicaNegativo);
    dicaNegativo.classList.add('mostrar');

    timerDicaNegativo = setTimeout(() => {
        dicaNegativo.classList.remove('mostrar');
    }, 5000);
}

function mostrarAviso(titulo, mensagem) {
    clearTimeout(timerAviso);
    avisoElemento.innerHTML = `<h4>${titulo}</h4><p>${mensagem}</p>`;
    avisoElemento.classList.add('mostrar');

    timerAviso = setTimeout(() => {
        avisoElemento.classList.remove('mostrar');
    }, 3500);
}

function verificarSaltoDificuldade() {
    if (nivel === ultimoNivelNotificado) return;

    const marcos = {
        1: { titulo: "Aquecimento!", texto: "Soma e Subtração básica!" },
        11: { titulo: "Subindo o Nível!", texto: "Multiplicação e números negativos!" },
        21: { titulo: "Nova Operação!", texto: "Divisão exata liberada!" },
        36: { titulo: "Desafio Maior!", texto: "Expressões com 3 números!" },
        61: { titulo: "Álgebra e Potências!", texto: "Descubra o valor de X e faça potênciações!" }
    };

    if (marcos[nivel]) {
        ultimoNivelNotificado = nivel;
        mostrarAviso(marcos[nivel].titulo, marcos[nivel].texto);
        if (nivel === 11) {
            mostrarDicaNegativo();
        }
        if (nivel > 1) {
            tocarSom('levelup');
        }
    }
}

if (btnMenos) {
    btnMenos.addEventListener('click', () => {
        dicaNegativo.classList.remove('mostrar');
        if (resposta.value.startsWith('-')) {
            resposta.value = resposta.value.slice(1);
        } else {
            resposta.value = '-' + resposta.value;
        }
        resposta.focus();
    });
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

function perderVida() {
    clearTimeout(timerJogo);
    barraTempo.style.transition = 'none';
    vidas -= 1;

    aplicarEfeitoVisual('efeito-erro');

    if(normalMode && cont >= 0) {
        folhas[cont].style.display = 'none';
        cont--;
    }

    if(vidas <= 0) {
        tocarSom('gameover');
        setTimeout(() => {
            alert("As folhas acabaram! Nível: " + nivel + "\nResultado: " + resultado);
            checarRecorde();
            nivel = 1;
            ultimoNivelNotificado = 0;
            dicaNegativoMostrada = false;
            cont = 2;
            vidas = normalMode ? 3 : 1;
            for(let i = 0; i < 3; i++) {
                folhas[i].style.display = 'inline';
            }
            level.textContent = "Nível " + nivel;
            gerarNovaQuestao();
        }, 100);
    } else {
        tocarSom('erro');
        gerarNovaQuestao();
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

function gerarNovaQuestao() {
    clearTimeout(timerJogo);
    verificarSaltoDificuldade();

    if(nivel <= 10) {
        tempoTotal = normalMode ? 10 : 5;
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

    } else if(nivel <= 20) {
        tempoTotal = normalMode ? 10 : 7;
        let numero1 = random(12);
        let numero2 = random(12);
        let operacao;

        switch(random(3)) {
            case 1:
                operacao = '+';
                resultado = numero1 + numero2;
                break;
            case 2:
                operacao = '-';
                resultado = numero1 - numero2;
                break;
            case 3:
                operacao = 'x';
                if(numero1 >= 11 || numero2 >= 11) {
                    numero1 = random(10);
                    numero2 = random(10);
                }
                resultado = numero1 * numero2;
                break;
        }
        questao.textContent = `${numero1} ${operacao} ${numero2}`;

    } else if (nivel <= 35) {
        tempoTotal = normalMode ? 15 : 10;
        let numero1 = random(20);
        let numero2 = random(20);
        let operacao;

        switch(random(4)) {
            case 1:
                operacao = '+';
                resultado = numero1 + numero2;
                break;
            case 2:
                operacao = '-';
                resultado = numero1 - numero2;
                break;
            case 3:
                operacao = 'x';
                if(numero1 >= 12 || numero2 >= 12){
                    numero1 = random(12);
                    numero2 = random(12);
                }
                resultado = numero1 * numero2;
                break;
            case 4:
                operacao = '÷';
                numero2 = random(10);
                resultado = random(10);
                numero1 = numero2 * resultado;
                break;
        }
        questao.textContent = `${numero1} ${operacao} ${numero2}`;

    } else if (nivel <= 60) {
        tempoTotal = normalMode ? 30 : 20;
        let numero1;
        let numero2;
        let numero3;
        let operacao;
        let operacao2;

        switch (random(4)) {
            case 1:
            case 2:
            case 3:
                switch(random(4)) {
                    case 1:
                        numero1 = random(50);
                        numero2 = random(50);
                        operacao = '+';
                        resultado = numero1 + numero2;
                        break;
                    case 2:
                        numero1 = random(50);
                        numero2 = random(50);
                        operacao = '-';
                        resultado = numero1 - numero2;
                        break;
                    case 3:
                        numero1 = random(16);
                        numero2 = random(16);
                        operacao = 'x';
                        resultado = numero1 * numero2;
                        break;
                    case 4:
                        numero2 = random(20);
                        resultado = random(50);
                        numero1 = numero2 * resultado;
                        operacao = '÷';
                        break;
                }
                questao.textContent = `${numero1} ${operacao} ${numero2}`;
                break;
            case 4:
                switch(random(4)) {
                    case 1:
                        numero1 = random(50);
                        numero2 = random(50);
                        numero3 = random(50);
                        operacao = '+';
                        operacao2 = '+';
                        resultado = numero1 + numero2 + numero3;
                        break;
                    case 2:
                        numero1 = random(12);
                        numero2 = random(12);
                        numero3 = random(12);
                        operacao = 'x';
                        operacao2 = 'x';
                        resultado = numero1 * numero2 * numero3;
                        break;
                    case 3:
                        numero1 = random(12);
                        numero2 = random(12);
                        numero3 = random(50);
                        operacao = 'x';
                        operacao2 = '+';
                        resultado = (numero1 * numero2) + numero3;
                        break;
                    case 4:
                        numero1 = random(50);
                        numero2 = random(12);
                        numero3 = random(12);
                        operacao = '+';
                        operacao2 = 'x';
                        resultado = numero1 + (numero2 * numero3);
                        break;
                }
                questao.textContent = `${numero1} ${operacao} ${numero2} ${operacao2} ${numero3}`;
                break;
        }

    } else {
        tempoTotal = normalMode ? 40 : 35;
        let numero1;
        let numero2;
        let numero3;
        let operacao;
        let operacao2;

        switch(random(2)) {
            case 1:
                switch(random(16)) {
                    case 1:
                        numero1 = random(20);
                        numero2 = random(20);
                        resultado = numero2 - numero1;
                        questao.textContent = `X + ${numero1} = ${numero2}`;
                        break;
                    case 2:
                        numero1 = random(20);
                        numero2 = random(20);
                        resultado = numero1 + numero2;
                        questao.textContent = `X - ${numero1} = ${numero2}`;
                        break;
                    case 3:
                        numero3 = random(3) + 1;
                        resultado = random(10) - 5;
                        numero1 = random(20);
                        numero2 = numero3 * resultado + numero1;
                        questao.textContent = `${numero3}X + ${numero1} = ${numero2}`;
                        break;
                    case 4:
                        numero2 = random(3) + 1;
                        numero3 = numero2 + random(3);
                        resultado = random(10);
                        numero1 = (numero3 - numero2) * resultado;
                        questao.textContent = `${numero3}X - ${numero1} = ${numero2}X`;
                        break;
                    case 5:
                        numero2 = random(3) + 1;
                        numero3 = random(3) + 1;
                        resultado = random(10);
                        numero1 = (numero3 + numero2) * resultado;
                        questao.textContent = `${numero3}X + ${numero2}X = ${numero1}`;
                        break;
                    case 6:
                        numero1 = random(50);
                        numero2 = random(50);
                        resultado = 2*(numero1 + numero2);
                        questao.textContent = `${numero1} + ${numero2} = X/2`;
                        break;
                    case 7:
                        numero1 = random(20);
                        resultado = numero1 * numero1;
                        questao.textContent = `${numero1}²`;
                        break;
                    case 8:
                        numero1 = random(13);
                        numero2 = random(13);
                        resultado = numero1 * numero1 - numero2 * numero2;
                        questao.textContent = `${numero1}² - ${numero2}²`;
                        break;
                    case 9:
                        numero1 = random(13);
                        numero2 = random(13);
                        resultado = numero1 * numero1 - numero2 * numero2;
                        questao.textContent = `(${numero1} + ${numero2})(${numero1} - ${numero2})`;
                        break;
                    case 10:
                        numero1 = random(5);
                        numero2 = random(2) + 2;
                        resultado = Math.pow(numero1, numero2);
                        if(numero2 === 3) questao.textContent = `${numero1}³`;
                        else questao.textContent = `${numero1}⁴`;
                        break;
                    case 11:
                        numero1 = random(7);
                        numero2 = random(7);
                        numero3 = random(2) + 2;
                        resultado = Math.pow(numero1 + numero2, numero3);
                        if(numero3 === 3) questao.textContent = `(${numero1} + ${numero2})³`;
                        else questao.textContent = `(${numero1} + ${numero2})⁴`;
                        break;
                    case 12:
                        numero1 = Math.pow(random(15), 2);
                        resultado = Math.sqrt(numero1);
                        questao.textContent = `√(${numero1})`;
                        break;
                    case 13:
                        numero1 = Math.pow(random(15), 2);
                        numero2 = Math.pow(random(15), 2);
                        resultado = Math.sqrt(numero1) + Math.sqrt(numero2);
                        questao.textContent = `√(${numero1}) + √(${numero2})`;
                        break;
                    case 14:
                        numero1 = Math.pow(2, random(10));
                        resultado = Math.log2(numero1);
                        questao.textContent = `2^X = ${numero1}`;
                        break;
                    case 15:
                        numero1 = Math.pow(10, random(5));
                        resultado = Math.log10(numero1);
                        questao.textContent = `10^X = ${numero1}`;
                        break;
                    case 16:
                        numero1 = random(4) + 1;
                        numero2 = random(5);
                        resultado = numero2 - 1;
                        let termos = Array(numero1).fill(`${numero1}^X`).join(' + ');
                        questao.textContent = `${termos} = ${numero1}^${numero2}`;
                        break;
                }
            break;
            case 2:
                switch(random(4)) {
                    case 1:
                        numero1 = random(50);
                        numero2 = random(50);
                        numero3 = random(50);
                        operacao = '+';
                        operacao2 = '+';
                        resultado = numero1 + numero2 + numero3;
                        break;
                    case 2:
                        numero1 = random(12);
                        numero2 = random(12);
                        numero3 = random(12);
                        operacao = 'x';
                        operacao2 = 'x';
                        resultado = numero1 * numero2 * numero3;
                        break;
                    case 3:
                        numero1 = random(12);
                        numero2 = random(12);
                        numero3 = random(50);
                        operacao = 'x';
                        operacao2 = '+';
                        resultado = (numero1 * numero2) + numero3;
                        break;
                    case 4:
                        numero1 = random(50);
                        numero2 = random(12);
                        numero3 = random(12);
                        operacao = '+';
                        operacao2 = 'x';
                        resultado = numero1 + (numero2 * numero3);
                        break;
                }
                questao.textContent = `${numero1} ${operacao} ${numero2} ${operacao2} ${numero3}`;
                break;
        }
    }

    if (resultado < 0) {
        mostrarDicaNegativo();
    }

    iniciarCronometro();
}

formulario.addEventListener('submit', function(event) {
    event.preventDefault();

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
    resposta.focus(); 
});

document.addEventListener("DOMContentLoaded", () => {

    const popUp = document.createElement("div");
    const normal = document.createElement("div");
    const dificil = document.createElement("div");

    popUp.classList.add("popup-dificuldade");
    normal.classList.add("cardCurso");
    dificil.classList.add("cardCurso");

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

    popUp.appendChild(normal);
    popUp.appendChild(dificil);

    document.body.appendChild(popUp);

    normal.addEventListener('click', () => {
        popUp.style.display = 'none';
        barraVidas.style.display = 'flex';
        normalMode = true;
        vidas = 3;
        carregarRecorde();

        gerarNovaQuestao();
    });

    dificil.addEventListener('click', () => {
        popUp.style.display = 'none';
        barraVidas.style.display = 'none';
        normalMode = false;
        vidas = 1;
        carregarRecorde();

        gerarNovaQuestao();
    });
});