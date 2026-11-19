const fila = document.querySelectorAll('.fila');
const setas = document.querySelectorAll('.fila img');
const descP = document.querySelectorAll('.fila p')

let nums = [];

for(let i = 0; i < 3; i++) {
    nums[i]= Number(descP[i].textContent);
}

for(let i = 0; i < 6; i++) {
    if(i % 2 == 0) {
        setas[i].addEventListener('click', (event) => {
            event.preventDefault();

            let numero = ++nums[Math.floor(i/2)];

            if(numero === 10) {
                descP[Math.floor(i/2)].textContent = '0';
                nums[Math.floor(i/2)] = 0;
                numero = 0;
                nums[Math.floor(i/2) - 1]++;
                if(nums[Math.floor(i/2) - 1] === 10) {
                    nums[Math.floor(i/2) - 2]++;
                    descP[Math.floor(i/2) - 2].textContent = nums[Math.floor(i/2) - 2];

                    nums[Math.floor(i/2) - 1] = 0;
                    descP[Math.floor(i/2) - 1].textContent =  nums[Math.floor(i/2) - 1];
                } else {
                    descP[Math.floor(i/2) - 1].textContent = nums[Math.floor(i/2) - 1];
                }
                
            } else {
                descP[Math.floor(i/2)].textContent = numero;
            }

        });
    } else {
        setas[i].addEventListener('click', (event) => {
            event.preventDefault();

            if(nums[Math.floor(i/2)] === 0) {
                nums[Math.floor(i/2)] = 9;
                descP[Math.floor(i/2)].textContent = nums[Math.floor(i/2)];
                if(nums[Math.floor(i/2) - 1] !== 0) {
                    --nums[Math.floor(i/2) - 1];
                    descP[Math.floor(i/2) - 1].textContent = nums[Math.floor(i/2) - 1];
                }
            } else {
                --nums[Math.floor(i/2)];
                descP[Math.floor(i/2)].textContent = nums[Math.floor(i/2)];
            }

        });
    }
}