import type { Event } from "./events"

interface Elements {
    start: HTMLButtonElement,
    stop: HTMLButtonElement,
    output: HTMLDivElement
}

let sse: EventSource | null = null
export function startListening({ output, start, stop }: Elements, eventHandler: (event: Event, output: HTMLDivElement) => void) {
    if(sse) return
        
    const url = new URL('/listen', 'https://neon-dawn.loshido.me')
    sse = new EventSource(url)

    sse.addEventListener('message', e => {
        const event = JSON.parse(e.data) as Event
        eventHandler(event, output)
    })

    start.classList.toggle('active')
    stop.classList.toggle('active')
}

export function stopListening({ start, stop }: Elements) {
    if(!sse) return
    sse.close()
    sse = null
        
    start.classList.toggle('active')
    stop.classList.toggle('active')
}