/** @type {HTMLCanvasElement} */

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
CANVAS_WIDTH = canvas.width = 500;
CANVAS_HEIGHT = canvas.height = 800;
const numberOfEnemies = 100;
const enemiesArray = [];
let gameFrame = 0;

class Enemy {
    constructor () {
        this.image = new Image();
        this.image.src = '../assets/enemy1.png'
        // random number between 0-4 and then subtracting 2 from that number
        this.speed = Math.random() * 4 - 2
        this.spriteWidth = 293;
        this.spriteHeight = 155;
        this.width = this.spriteWidth / 3;
        this.height = this.spriteHeight / 3;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = Math.random() * (canvas.height- this.height);
        this.frame = 0;
        this.flapSpeed = Math.floor(Math.random() * 3 + 3);
    }

    update() {
        this.x += Math.random()*6-3;
        this.y += Math.random()*6-3;
        if (gameFrame % this.flapSpeed === 0) {this.frame > 4 ? this.frame = 0 : this.frame++};
    }

    draw() {
        ctx.drawImage(this.image, this.frame*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
    }
}

for (let i = 0; i < numberOfEnemies; i++) {
    enemiesArray.push(new Enemy())
} 

function animate () {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    enemiesArray.forEach((enemy) => {
        enemy.update();
        enemy.draw();
    })
    gameFrame++;
    requestAnimationFrame(animate)
}

animate();