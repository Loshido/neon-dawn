
const altitude = 1.3
let elapsed = 0.0
let decalage = 0.0
const position: [number, number, number] = [0, altitude, 0]

const sockets: WebSocket[] = []
setInterval(() => {
    elapsed += 0.075
    position[0] = Math.cos(elapsed)
    position[1] = altitude * Math.cos(0.3 * elapsed)
    position[2] = altitude * Math.sin(0.3 * elapsed)

    sockets.forEach(s => {
        if(!s.OPEN) return
        s.send(JSON.stringify({
            type: 'position',
            position
        }))
    })
}, 75);
setTimeout(() => {
    decalage += 10;
}, 2 * Math.PI);

setTimeout(async () => {
    const response = await fetch('http://192.168.1.68:8000/register', {
        method: 'POST',
        body: JSON.stringify({
            name: "echo",
            type: "ws"
        })
    })
    console.log(response.status)
}, 50)

Deno.serve({
    port: 7192
}, (req) => {
    const url = new URL(req.url)
    switch(url.pathname) {
        case '/position':
            return new Response(JSON.stringify(position), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://localhost:8000'
                }
            })
    }

    
    if(req.headers.get('upgrade') === 'websocket') {
        const { socket, response } = Deno.upgradeWebSocket(req)
        sockets.push(socket)

        socket.addEventListener('close', () => {
            const i = sockets.findIndex(s => s == socket)
            if(i >= 0) sockets.splice(i, 1)
        })

        return response
    }

    return new Response('Not Found', { status: 404 })
})