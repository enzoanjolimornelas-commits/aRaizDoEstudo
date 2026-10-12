const formulario = document.getElementById('formulario');
const level = document.getElementById('nivel');
const questao = document.getElementById('questao');
const recorde = document.getElementById('recorde');
const resposta = document.getElementById('resposta');
const barraTempo = document.getElementById('barra-tempo');

questao.style.wordSpacing = "1.5em";
questao.style.letterSpacing = "0.1em";

let resultado, nivel = 1;
let save = Number(localStorage.getItem("save"));
let contador;
let tempoTotal;
let intervalo; 

const random = (range = 1) => Math.ceil(Math.random() * range);

if(save > 1) {
    recorde.textContent = `Recorde: ${save}`;
    recorde.style.display = 'block';
}

level.textContent = "Nível " + nivel; 

function checarRecorde() {
    if(nivel > save) {
        localStorage.setItem("save", nivel);
        save = Number(localStorage.getItem("save"));
        recorde.textContent = `Recorde: ${save}`;
        recorde.style.display = 'block';
    }
}

function gerarNovaQuestao() {
    clearInterval(intervalo);

    if(nivel <= 10) {
        tempoTotal = 5;
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
                while(numero2 > numero1) {
                    numero2 = random(10);
                }
                resultado = numero1 - numero2;
                break;
        }
        questao.textContent = `${numero1} ${operacao} ${numero2}`;

    } else if(nivel <= 20) {
        tempoTotal = 7;
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
        tempoTotal = 10;
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
                while(numero1 % numero2 !== 0){
                    numero2 = random(20);
                }
                resultado = numero1 / numero2;
                break;
        }
        questao.textContent = `${numero1} ${operacao} ${numero2}`;

    } else if (nivel <= 60) {
        tempoTotal = 20;
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
                        numero1 = random(1000);
                        numero2 = random(200);
                        operacao = '÷';
                        while(numero1 % numero2 !== 0){
                            numero2 = random(20);
                        }
                        resultado = numero1 / numero2;
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

    } else if (nivel <= 100) {
        tempoTotal = 35;
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
                        operacao = '+';
                        resultado = numero2 - numero1;
                        questao.textContent = `X + ${numero1} = ${numero2}`;
                        break;
                    case 2:
                        numero1 = random(20);
                        numero2 = random(20);
                        operacao = '-';
                        resultado = numero1 + numero2;
                        questao.textContent = `X - ${numero1} = ${numero2}`;
                        break;
                    case 3:
                        numero1 = random(20);
                        numero2 = random(20);
                        numero3 = random(3) + 1;
                        while((numero2 - numero1) % numero3 !== 0){
                            numero1 = random(20);
                            numero2 = random(20);
                            numero3 = random(3) + 1;
                        }
                        resultado = (numero2 - numero1)/numero3;
                        questao.textContent = `${numero3}X + ${numero1} = ${numero2}`;
                        break;
                    case 4:
                        numero1 = random(20);
                        numero2 = random(3) + 1;
                        numero3 = random(3) + 1;
                        while(numero1 % (numero3 - numero2) !== 0){
                            numero1 = random(20);
                            numero2 = random(3) + 1;
                            numero3 = random(3) + 1;
                        }
                        resultado = numero1/(numero3 - numero2);
                        questao.textContent = `${numero3}X - ${numero1} = ${numero2}X`;
                        break;
                    case 5:
                        numero1 = random(20);
                        numero2 = random(3) + 1;
                        numero3 = random(3) + 1;
                        while(numero1 % (numero3 + numero2) !== 0){
                            numero1 = random(20);
                            numero2 = random(3) + 1;
                            numero3 = random(3) + 1;
                        }
                        resultado = numero1/(numero3 + numero2);
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
                        numero1 = random(5);
                        numero2 = random(5);
                        resultado = numero2 - 1;
                        questao.textContent = ``;
                        for(let i = 0; i < numero1; i++) {
                            questao.textContent += `${numero1}^X + `;
                        }
                        questao.textContent += `= ${numero1}^${numero2}`;
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

    contador = tempoTotal;
    
    barraTempo.style.transition = 'none';
    barraTempo.style.width = '100%';
    
    setTimeout(() => {
        barraTempo.style.transition = `width ${tempoTotal}s linear`;
        barraTempo.style.width = '0%';
    }, 10);

    intervalo = setInterval(() => {
        contador -= 1;
        
        if(contador <= 0) {
            clearInterval(intervalo);
            setTimeout(() => {
                alert("Tempo acabou! Nível: " + nivel);
                checarRecorde();
                nivel = 1;
                level.textContent = "Nível " + nivel;
                gerarNovaQuestao();
            }, 100); 
        }
    }, 1000);
}

formulario.addEventListener('submit', function(event) {
    event.preventDefault();

    const respostaDoJogador = Number(resposta.value);

    if(respostaDoJogador === resultado) {
        nivel += 1;
        level.textContent = "Nível " + nivel;
        gerarNovaQuestao(); 
    } else {
        alert("Erro! Nível: " + nivel + "\nResultado: " + resultado);
        checarRecorde();
        nivel = 1;
        level.textContent = "Nível " + nivel;
        gerarNovaQuestao();
    }

    formulario.reset();
    resposta.focus(); 
});

gerarNovaQuestao();