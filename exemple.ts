import type { ServerWebSocket } from "bun"

const altitude = 1.3
let elapsed = 0.0
const position: [number, number, number] = [0, altitude, 0]
const couleur: [number, number, number] = [0, 255, 0]

const sockets: ServerWebSocket<any>[] = []
setInterval(() => {
    elapsed += 0.075
    position[0] = Math.cos(0.01 * elapsed)
    position[1] = altitude * Math.cos(0.3 * elapsed)
    position[2] = altitude * Math.sin(0.3 * elapsed)

    sockets.forEach(s => s.send(JSON.stringify({
        type: 'position',
        position
    })))
}, 75);

setInterval(() => {
    couleur[0] = Math.floor(127.5 * (Math.cos(elapsed) + 1))
    couleur[1] = 127
    couleur[2] = 0
    sockets.forEach(s => s.send(JSON.stringify({
        type: 'couleur',
        couleur
    })))
}, 1000);

Bun.serve({
    port: 7192,
    routes: {
        '/health': () => {
            return new Response(JSON.stringify({
                position: 200,
                couleur: 1000
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://localhost:5173'
                }
            })
        },
        '/position': () => {
            return new Response(JSON.stringify(position), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://localhost:5173'
                }
            })
        },
        '/color': () => {
            return new Response(JSON.stringify(couleur), {
                headers: {
                    'Content-Type': 'application/text',
                    'Access-Control-Allow-Origin': 'http://localhost:5173'
                }
            })
        }
    },
    fetch(req, server) {
        const success = server.upgrade(req)
        if(success) return undefined

        return new Response('Not found!', {
            status: 400
        })
    }, 
    websocket: {
        async open(ws) {
            sockets.push(ws)

            ws.send(JSON.stringify({
                type: "health",
                position: 75,
                couleur: 1000
            }))
        },
        message(){

        },
        async close(ws) {
            const i = sockets.findIndex(s => s == ws)
            if(i >= 0) sockets.splice(i, 1)
        }
    }
})