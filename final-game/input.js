export class InputHandler {
    constructor() {
        this.keys = [];
        
        window.addEventListener('keydown', (e) => {
            console.log(this.keys)
            if ((   e.key === 'a' || 
                    e.key === 's' || 
                    e.key === 'd' || 
                    e.key === 'w' || 
                    e.key === ' '
            ) && !this.keys.includes(e.key)) this.keys.push(e.key)
        })

        window.addEventListener('keyup', (e) => {
            console.log(this.keys)
            if (    e.key === 'a' || 
                    e.key === 's' || 
                    e.key === 'd' || 
                    e.key === 'w' || 
                    e.key === ' ') this.keys.splice(this.keys.indexOf(e.key), 1)
        })
    }
}