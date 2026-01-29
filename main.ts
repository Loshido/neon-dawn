// deno -A main.ts
// bun main.ts

// const eventSource = new EventSource("http://localhost/listen")

// eventSource.addEventListener('open', _ => console.log('open'))
// eventSource.addEventListener('message', e => console.log(e.data))
// eventSource.addEventListener('error', console.log)

const ws = new WebSocket('http://localhost/ws')

let interval: number | undefined
ws.addEventListener('open', _ => {
    const launch = {
        type: "Launch",
        name: "IE250",
        color: [250, 250, 250],
        citation: "Deno on his way"
    }

    ws.send(JSON.stringify(launch))

    interval = setInterval(() => {
        const position = {
            type: "Signal",
            position: [
                Math.floor(Math.random() * 10E6),
                Math.floor(Math.random() * 10E6),
                Math.floor(Math.random() * 10E6),
            ]
        }

        ws.send(JSON.stringify(position))
    }, 1000);
})

ws.addEventListener('close', _ => clearInterval(interval))
ws.addEventListener('error', _ => clearInterval(interval))