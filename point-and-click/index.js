const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d')
document.body.style.cursor = "url('../assets/snipe.png'), auto";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d')
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;


let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;
let score = 0;
let gameOver = false;

let ravens = [];
let particles = [];

class Raven {
    constructor (name) {
        this.sizeModifier = Math.random () * 1 + 1
        this.width = 100 * this.sizeModifier;
        this.height = 50 * this.sizeModifier;
        this.x = canvas.width;
        // want the raven to spawn at any height but subtract the height of the bird so it appears on screen
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 1 + 1;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = '../assets/raven.png'
        this.spriteWidth = 271;
        this.spriteHeight = 194
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 75 + 25;
        this.randomColors = [Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)]
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')'
        this.hasTrail = Math.random() > 0.5
    }

    update(deltatime) {
        // bounce in opposite direction when hitting top or bottom of screen
        if (this.y < 0 || this.y > canvas.height - this.height) this.directionY = this.directionY * -1;
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.frame > this.maxFrame) this.frame = 0;
        this.timeSinceFlap += deltatime;
        if (this.timeSinceFlap > this.flapInterval) {
            this.timeSinceFlap = 0;
            this.frame++;
            if (this.hasTrail) {
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(this.x, this.y, this.width, this.color))
                }
            }
        }
        // if raven is not on screen, mark the raven for deletion
        if (this.x < 0 - this.width) this.markdForDeletione = true;
        if (this.x < 0 - this.width) gameOver = true;
    }

    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height)
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
    }
}

let explosions = [];
class Explosion {
    constructor (x, y, size){
        this.image = new Image();
        this.image.src = '../assets/boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src ='../assets/Fire impact 1.wav'
        this.sound.volume = 0.3
        this.timeSinceLastFrame = 0;
        this.frameInterval = 100;
        this.markdForDeletion = false;

    }

    update(deltatime) {
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltatime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5) this.markedForDeletion = true;
        }
    }

    draw() {
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - (this.size/4), this.size, this.size)
    }
}


class Particle {
    constructor(x, y, size, color) {
        this.size = size;
        this.x = x + (this.size/2) + Math.random() * 50 -25;
        this.y = y + (this.size/4) + Math.random() * 50 -25;
        this.radius = Math.random() * this.size/10;
        this.maxRadius = Math.random() * 20 + 10;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5
        this.color = color;
    }

    update() {
        this.x += this.speedX;
        this.radius += 0.1;
        if (this.radius > this.maxRadius - 3) this.markedForDeletion = true;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = 1 - this.radius/this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();  // Fill the path
        ctx.restore();
    }
}

function drawScore () {
    ctx.font = "50px Impact";
    ctx.fillStyle = 'black'
    ctx.fillText('Score: '+ score, 45,70)
    ctx.fillStyle = 'white';
    ctx.fillText('Score: '+ score, 50, 75)
}

function drawGameOver () {
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black';
    ctx.fillText('GAME OVER, your score is ' + score, canvas.width/2, canvas.height/2)
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER, your score is ' + score, canvas.width/2 + 5, canvas.height/2 + 5)
    
}

window.addEventListener('click', (e) => {
    // first two arguments is the area being 'scanned', width and height of clicked area is one pixel (one pixel precision)
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    // console.log(detectPixelColor)
    const pc = detectPixelColor.data;
    ravens.forEach(object => {
        if (object.randomColors[0] === pc[0]
            && object.randomColors[1] === pc[1]
            && object.randomColors[2] === pc[2]) {
                object.markedForDeletion = true;
                score++;
                explosions.push(new Explosion(object.x, object.y, object.width))
                console.log(explosions);
            }
    })
})

function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    let deltatime = timestamp - lastTime
    lastTime = timestamp
    timeToNextRaven += deltatime;
    if (timeToNextRaven > ravenInterval) {
        ravens.push(new Raven());
        timeToNextRaven = 0
        ravens.sort((a,b) => {
            // small ones drawn first
            return a.width - b.width
        })
    }

    // by putting particles first, it goes behind the ravens and explosions
    [...particles, ...ravens, ...explosions].forEach(object => {
        object.update(deltatime)
        object.draw()
    })
    drawScore();
    ravens = ravens.filter((object) => {
        return !object.markedForDeletion
    })
    explosions = explosions.filter((object) => {
        return !object.markedForDeletion
    })
    particles = particles.filter((object) => {
        return !object.markedForDeletion
    })
    if (!gameOver) requestAnimationFrame(animate)
    else drawGameOver();
}

animate(0);

 