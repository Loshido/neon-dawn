import type { Payload } from "../main"
import '../styles/helper-listen.css'

export default async (_payload: Payload) => {
    const start = document.getElementById('listen-start') as HTMLButtonElement | null
    const stop = document.getElementById('listen-stop') as HTMLButtonElement | null
    const output = document.getElementById('listen-output') as HTMLDivElement | null

    if(!start || !stop || !output) 
        throw "listen template didn't load"

    let sse: EventSource | null = null
    start.addEventListener('click', () => {
        if(sse) return
        
        const url = new URL('/listen', 'https://neon-dawn.loshido.me')
        sse = new EventSource(url)

        sse.addEventListener('message', e => {
            output.innerText += '\n' + e.data
        })

        start.classList.toggle('active')
        stop.classList.toggle('active')
    })
    
    stop.addEventListener('click', () => {
        if(!sse) return
        sse.close()
        sse = null
        
        start.classList.toggle('active')
        stop.classList.toggle('active')
    })
}