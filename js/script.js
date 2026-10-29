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

    trocarFrase();
    
    setInterval(() => {
        trocarFrase();
    }, 6000);
});