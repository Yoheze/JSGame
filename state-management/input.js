export default class InputHandler {
    constructor() {
        this.lastKey = '';
        window.addEventListener('keydown', (e) => {
            switch(e.key) {
                case "a":
                    this.lastKey = 'PRESS left';
                    break;
                case "d":
                    this.lastKey = 'PRESS right';
                    break;
            }
        })

        window.addEventListener('keyup', (e) => {
            switch(e.key) {
                case "a":
                    this.lastKey = 'RELEASE left';
                    break;
                case "d":
                    this.lastKey = 'RELEASE right';
                    break;
            }
        })

        
    }
}