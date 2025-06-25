const altitude = 1.3
let elapsed = 0.0
const positions: [number, number, number] = [0, altitude, 0]
const couleur: [number, number, number] = [0, 255, 0]

setInterval(() => {
    elapsed += 0.075
    positions[0] = Math.cos(0.01 * elapsed)
    positions[1] = altitude * Math.cos(0.3 * elapsed)
    positions[2] = altitude * Math.sin(0.3 * elapsed)
}, 75);

setInterval(() => {
    couleur[0] = Math.floor(127.5 * (Math.cos(elapsed) + 1))
    couleur[1] = 127
    couleur[2] = 0
}, 1000);

Bun.serve({
    port: 7901,
    routes: {
        '/health': () => {
            return new Response('ok')
        },
        '/position': () => {
            return new Response(JSON.stringify(positions), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://localhost:5173'
                }
            })
        },
        '/couleur': () => {
            return new Response(JSON.stringify(couleur), {
                headers: {
                    'Content-Type': 'application/text',
                    'Access-Control-Allow-Origin': 'http://localhost:5173'
                }
            })
        }
    },
    fetch(req) {
        return new Response('not found', {
            status: 400
        })
    }, 
})