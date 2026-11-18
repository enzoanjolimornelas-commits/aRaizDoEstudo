const fila = document.querySelectorAll('.fila');
const setas = document.querySelectorAll('.fila img');
const descP = document.querySelectorAll('.fila p')

let nums = [];

for(let i = 0; i < 3; i++) {
    nums[i]= Number(descP[i].textContent);
}

for(let i = 0; i < 6; i++) {
    if(i % 2 == 0) {
        setas[i].addEventListener('click', () => {
            let numero = nums[Math.ceil(i/2)]++;

            if(numero === 10) {
                descP[Math.ceil(i/2)].textContent = 0;
                descP[Math.ceil(i/2) + 1] = nums[Math.ceil(i/2) - 1] + 1;
            } else {
                descP[Math.ceil(i/2)].textContent = numero;
            }

        });
    } else {
        setas[i].addEventListener('click', () => {
            nums[Math.floor(i/2)]--;
            descP[Math.floor(i/2)].textContent = nums[Math.floor(i/2)];
        });
    }
}