import type { Payload } from "../main";
import '../styles/helper-form.css'

const submit = document.querySelector('button[type="submit"]') as HTMLButtonElement
const position = document.getElementById('satellite-position') as HTMLInputElement
const rotation = document.getElementById('satellite-rotation') as HTMLInputElement
const erreur = document.getElementById('satellite-error') as HTMLParagraphElement
const launchIn = document.getElementById('satellite-in') as HTMLPreElement
const launchOut = document.getElementById('satellite-out') as HTMLPreElement

function stringToVec3(vec: string): [number, number, number] | string {
    if(!vec.startsWith('[') || !vec.endsWith(']'))
        return 'Le vecteur est malformé'

    const s = vec.slice(1, -1).split(',') as [string, string, string]
    if(s.length !== 3 || s.some(sx => sx.length === 0))
        return 'Le vecteur n\'est pas complet'
    
    const n = s.map(sx => parseFloat(sx)) as [number, number, number]

    if(n.some(nx => isNaN(nx)))
        return 'Les valeurs sont intraitables'

    return n
}

async function process() {
    const body = {
        position: stringToVec3(position.value),
        rotation: rotation.value.length > 0 ? stringToVec3(rotation.value) : undefined,
    }

    if(typeof body.position === 'string' || typeof body.rotation === 'string') {
        erreur.style.display = 'block'

        erreur.innerText = typeof body.position === 'string' ? body.position : ''
        erreur.innerText += '\n' + (typeof body.rotation === 'string' ? body.rotation : '')
        return
    } else erreur.style.display = 'none'

    const bodySerialized = JSON.stringify(body)

    launchIn.innerText = '// entête\nPOST /orbit/signal HTTP/?'
        + '\nHost: https://neon-dawn.loshido.me'
        + '\nUser-Agent: neon-dawn-helper'
        + '\nContent-Type: application/json'
        + '\nContent-Length: ' + bodySerialized.length
        + '\n\n// corps\n' + JSON.stringify(body, undefined, 4)

    const url = new URL('/orbit/signal', location.origin)
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'neon-dawn-helper'
        },
        body: bodySerialized
    })

    console.info('POST /orbit/signal', response)
    launchOut.innerText = '// entête'
        + `\nHTTP/1.1 ${ response.status } ${ response.statusText }`
        + Array.from(response.headers.entries()).map(h => 
            `\n${ h[0] }: ${ h[1] }`)
        + '\n\n// corps\n' 
        + (response.headers.get('content-length') !== '0' 
            ? await response.text() 
            : 'vide')
}

export default async (_payload: Payload) => {
    submit.addEventListener('click', process)
}