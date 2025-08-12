import { serveDir } from "jsr:@std/http/file-server";

type Router = {
    [path: string]: (req: Request, info: Deno.ServeHandlerInfo<Deno.NetAddr>) 
        => Response | Promise<Response>
}

const streams = new Set<ReadableStreamDefaultController>()
const routes: Router = {
    '/events': req => {
        const stream = new ReadableStream({
            start(controller) {
                streams.add(controller)

                const keepAlive = setInterval(() => {
                    controller.enqueue('event: ping\n\n')
                }, 15000);

                req.signal.addEventListener('abort', () => {
                    controller.close()
                    streams.delete(controller)
                    clearInterval(keepAlive)
                })
            }
        })

        return new Response(stream.pipeThrough(new TextEncoderStream()), {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": '*'
            }
        })
    },
    '/register': async (req, info) => {
        let type: string = 'http'
        let name: string = 'inconnu'
        if(req.method == 'POST') {
            const payload = await req.json()
            if(!payload.type || !payload.name) 
                // illisible
                return new Response(
                    "Vous devez joindre un type de transport et un nom.\n"
                    + JSON.stringify({ 
                        type: 'http ou ws', 
                        name: 'string' 
                    }, undefined, 4), 
                    {
                        status: 400
                    }
                )

            type = payload.type
            name = payload.name
        }
        
        if(type !== 'ws' && type !== 'http')
            return new Response('"type" invalide.', { status: 400 })

        const url = type + '://' + info.remoteAddr.hostname
        
        streams.forEach(stream => {
            stream.enqueue(`data: ${
                JSON.stringify({ name, url })
            }\n\n`)
        })

        return new Response('ok', { status: 200 })
    }
}

Deno.serve({
    port: 81,
    hostname: '0.0.0.0'
}, (req, info) => {
    const url = new URL(req.url)

    if(url.pathname in routes) {
        return routes[url.pathname](req, info)
    }
    
    return serveDir(req, {
        fsRoot: './public',
        showIndex: true,
        showDotfiles: false,
        showDirListing: false
    })
})