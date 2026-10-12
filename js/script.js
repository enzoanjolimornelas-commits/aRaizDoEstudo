const aside = document.getElementById('sobre');
let frases = [
    ["Antes de escalar grandes galhos é preciso garantir que suas raízes estejam firmes na terra...", "Para aprender assuntos mais complexos, primeiro deve-se fortalecer as bases da matemática."],
    ["É impossível ser um matemático sem ser um poeta da alma.", "-Sofya Kovalevskaya"],
    ["A Geometria é o conhecmento do que existe eternamente.", "-Pitágoras"]
];
let i = 0;

function trocarFrase () {
    aside.innerHTML = '';
    
    const h2 = document.createElement('h2');
    const p = document.createElement('p');

    h2.textContent = frases[i][0];
    p.textContent = frases[i][1];

    aside.appendChild(h2);
    aside.appendChild(p);

    i++;

    if(i >= frases.length) {
        i = 0;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    trocarFrase();
    
    setInterval(() => {
        trocarFrase();
    }, 6000);
});