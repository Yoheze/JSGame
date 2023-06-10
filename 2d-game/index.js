window.addEventListener('load', () => {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 720;
    let enemies = [];
    let score = 0;
    let gameOver = false;
    const fullScreenButton = document.getElementById('fullScreenButton')

    class InputHandler {
        constructor() {
            this.keys = [];
            this.touchY;
            this.touchThreshold = 30;
            // normally the window event listener cannot detect the this keyword being attached to the class, but arrow functions carry that out in the form of 'lexical scoping'
            window.addEventListener('keydown', (e) => {
                // if not in the array, indexOf returns -1
                if  ((e.key === 'w' || 
                    e.key === 'a' || 
                    e.key === 's' || 
                    e.key === 'd' ||
                    e.key === ' ') 
                    && this.keys.indexOf(e.key) === -1) {
                    this.keys.push(e.key)
                    console.log(this.keys)
                } else if (e.key === "Enter" && gameOver) restartGame();
            })
            
            window.addEventListener('keyup', (e) => {
                // if not in the array, indexOf returns -1
                if  ((e.key === 'w' || 
                    e.key === 'a' || 
                    e.key === 's' || 
                    e.key === 'd' ||
                    e.key === ' ')) {
                    this.keys.splice(this.keys.indexOf(e.key), 1)
                }
            })

            // this is for mobile
            // touching the screen initially
            window.addEventListener('touchstart', e => {
                this.touchY = e.changedTouches[0].pageY
            })

            // moving finger around the screen
            window.addEventListener('touchmove', e => {
                const swipeDistance = e.changedTouches[0].pageY - this.touchY
                if (swipeDistance < -this.touchThreshold && this.keys.indexOf('swipe up') === -1) this.keys.push('swipe up');
                else if (swipeDistance > this.touchThreshold && this.keys.indexOf('swipe down') === -1) {
                    this.keys.push('swipe down')
                    if (gameOver) restartGame();
                }
            })

            // finger off the screen
            window.addEventListener('touchend', e => {
                this.keys.splice(this.keys.indexOf('swipe up'), 1);
                this.keys.splice(this.keys.indexOf('swipe down'), 1)
            })
        }
    }

    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 200;
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.image = playerImage;
            this.frameX = 0;
            this.maxFrame = 8;
            this.frameY = 0;
            this.fps = 24;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.speed = 0;
            this.vy = 0;
            this.weight = 0.1;
        }

        restart() {
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.maxFrame = 8;
            this.frameY = 0;
        }

        draw(context) {
            context.lineWidth = 5
            context.strokeStyle = 'white'
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height)
            context.beginPath();
            context.arc(this.x + this.width/2, this.y + this.height/2 + 20, this.width/3, 0, Math.PI * 2)
            context.stroke();
        }

        update(input, deltaTime, enemies) {
            // collision detection
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.width/2 - 20) - (this.x + this.width/2);
                const dy = (enemy.y + enemy.height/2) - (this.y + this.height/2 + 20);
                const distance = Math.sqrt(dx**2 + dy**2)
                if (distance < enemy.width/3 + this.width/3){
                    gameOver = true;
                }
            })

            // sprite animation
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime
            }

            // controls
            if (input.keys.includes('d')) {
                this.speed = 5;
            }
            
            if (input.keys.includes('a')) {
                this.speed = -5;
            }
            
            if (!input.keys.includes('d') && !input.keys.includes('a')) {
                this.speed = 0;
            }            

            if ((input.keys.includes(' ') || input.keys.includes('swipe up')) && this.onGround()) {
                this.vy -= 10;
            }
            
            // horizontal movement
            this.x += this.speed;
            if (this.x <= 0) this.x = 0;
            else if (this.x >= canvas.width - this.width) this.x = canvas.width - this.width

            // vertical movement
            this.y += this.vy
            if (!this.onGround()) {
                this.vy += this.weight;
                this.maxFrame = 6;
                this.frameY = 1;
            } else {
                this.vy = 0;
                this.maxFrame = 8;
                this.frameY = 0;
            }

            if (this.y >= canvas.height - this.height) this.y = canvas.height - this.height;
        }

        onGround() {
            // remember this.gameHeight is based on the css top so this.gameHeight is the bottom of the canvas
            return this.y >= this.gameHeight - this.height;
        }
    }

    class Background {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = backgroundImage;
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 2;
        }
        
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y)
        }

        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }
    
        restart() {
            this.x = 0;
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.image = enemyImage;
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.speed = 3;
            // only for the enemy we will apply 24 fps
            this.fps = 24;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.maxFrame = 5;
            this.markedForDeletion = false;
        }

        draw(context) {
            context.strokeStyle = 'white'
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height)
            context.beginPath();
            context.arc(this.x + this.width/2 - 20, this.y + this.height/2, this.width/3, 0, Math.PI * 2)
            context.stroke();
        }

        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed;

            if (this.x < 0 - this.width) {
                this.markedForDeletion = true;
                score++;
            }
        }
    }

    
    function handleEnemies (deltaTime) {
        if (enemyTimer > randomEnemyInterval){
            enemies.push(new Enemy(canvas.width, canvas.height));
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }
        
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        })

        enemies = enemies.filter(enemy => !enemy.markedForDeletion)
    }

    function displayStatusText(context) {
        context.textAlign = 'left'
        context.fillStyle = 'black';
        context.font = '40px Helvetica';
        context.fillText('Score: ' + score, 20, 50)
        context.fillStyle = 'white'
        context.fillText('Score: ' + score, 23, 53)
        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'black'
            context.fillText('Game Over, press Enter or swipe down to restart', canvas.width/2, 200);
            context.fillStyle = 'white'
            context.fillText('Game Over, press Enter or swipe down to restart', canvas.width/2+3, 203);
        }
    }

    function restartGame() {
        player.restart();
        background.restart();
        enemies = [];
        score = 0;
        gameOver = false;
        animate(0);
    }

    function toggleFullScreen() {
        // document.fullscreenElement returns null if it is not fullscreen
        if (!document.fullscreenElement) {
            canvas.requestFullscreen()
            .catch(err => {
                alert(`Error, can\'t enable full-screen mode: ${err.message}`)
            })
        } else {
            document.exitFullscreen();
        }
    }

    fullScreenButton.addEventListener('click', toggleFullScreen);

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    let lastTime = 0;
    let enemyTimer = 0;
    let randomEnemyInterval = Math.random() * 1000 + 1500

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime
        lastTime = timeStamp
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        background.draw(ctx);
        background.update();
        player.draw(ctx)
        player.update(input, deltaTime, enemies);
        handleEnemies(deltaTime);
        displayStatusText(ctx);
        if (!gameOver) requestAnimationFrame(animate)
    }

    animate(0);
})