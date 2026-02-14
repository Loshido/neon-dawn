
/* This piece allows to listen for incoming events */
const eventSource = new EventSource("https://neon-dawn.loshido.me/listen")
eventSource.addEventListener('open', _ => console.log('open'))
eventSource.addEventListener('message', e => console.log(e.data))
eventSource.addEventListener('error', console.log)

/* This piece allows to send events to the hub (earth) */
const ws = new WebSocket('https://neon-dawn.loshido.me/ws')

let interval: number | undefined
let interval_duration = 333
let t = 0;
ws.addEventListener('open', _ => {
    const launch = {
        type: "Launch",
        name: "IE" + Math.floor(Math.random() * 255).toString().padStart(3, '0'),
        color: [0, 250, 250],
        citation: "Deno on his way"
    }

    ws.send(JSON.stringify(launch))

    interval = setInterval(() => {
        t += interval_duration / 100
        const position = {
            type: "Signal",
            position: [
                1.5 * Math.cos(t / 100),
                1.5 * Math.sin(t / 100),
                1.5 * Math.sin(t / 50) ,
            ],
            rotation: [
                Math.PI * Math.cos(t / 100),
                Math.PI * Math.cos(t / 100),
                Math.PI * Math.cos(t / 100),
            ]
        }

        ws.send(JSON.stringify(position))
    }, interval_duration);
})

ws.addEventListener('close', _ => clearInterval(interval))
ws.addEventListener('error', _ => clearInterval(interval))