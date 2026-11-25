const frutas = document.querySelectorAll(".fruta");
const cestas = document.querySelectorAll(".cesta");

let arrastando = false;
let offsetX = 0;
let offsetY = 0;

frutas.forEach((fruta) => {
    fruta.addEventListener('pointerdown', (event) => {
    arrastando = true;
    // Calcula a distância entre o clique e a borda do elemento
    offsetX = event.clientX - fruta.offsetLeft;
    offsetY = event.clientY - fruta.offsetTop;
    fruta.style.cursor = 'grabbing';
    });

    document.addEventListener('pointermove', (e) => {
    if (!arrastando) return;
    fruta.style.left = `${e.clientX - offsetX}px`;
    fruta.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener('pointerup', () => {
    arrastando = false;
    fruta.style.cursor = 'grab';
    })
});

