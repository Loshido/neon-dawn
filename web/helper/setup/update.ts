import type { Payload } from "../main";
import '../styles/helper-form.css'

const submit = document.querySelector('button[type="submit"]') as HTMLButtonElement
const name = document.getElementById('satellite-name') as HTMLInputElement
const color = document.getElementById('satellite-color') as HTMLInputElement
const erreur = document.getElementById('satellite-error') as HTMLParagraphElement
const launchIn = document.getElementById('satellite-in') as HTMLPreElement
const launchOut = document.getElementById('satellite-out') as HTMLPreElement

function checkForIncorrectInput(): string | null {
    if(name.value.length === 0)
        return "Vous devez donner un nom au satellite!"

    return null
}

function colorHexToArray(color: string): [number, number, number] {
    if(color.length != 7)
        return [225, 30, 152]

    const r = parseInt(color.slice(1, 3), 16) 
    const g = parseInt(color.slice(3, 5), 16) 
    const b = parseInt(color.slice(5, 7), 16) 
    return [r, g, b]
}

async function process() {
    const erreurs = checkForIncorrectInput()
    if(erreurs) {
        erreur.style.display = 'block'
        erreur.innerText = erreurs
        return
    } else erreur.style.display = 'none'
    
    const body = {
        name: name.value,
        color: colorHexToArray(color.value),
    }

    const bodySerialized = JSON.stringify(body)

    launchIn.innerText = '// entête\nPOST /orbit/update HTTP/?'
        + '\nHost: https://neon-dawn.loshido.me'
        + '\nUser-Agent: neon-dawn-helper'
        + '\nContent-Type: application/json'
        + '\nContent-Length: ' + bodySerialized.length
        + '\n\n// corps\n' + JSON.stringify(body, undefined, 4)

    const url = new URL('/orbit/update', location.origin)
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'neon-dawn-helper'
        },
        body: bodySerialized
    })

    console.info('POST /orbit/update', response)

    let responseBody = 'vide'
    if(response.headers.get('content-length') === '0') {
        responseBody = await response.text()
    }
    launchOut.innerText = '// entête'
        + `\nHTTP/1.1 ${ response.status } ${ response.statusText }`
        + Array.from(response.headers.entries()).map(h => 
            `\n${ h[0] }: ${ h[1] }`)
        + '\n\n// corps\n' 
        + responseBody
}

export default async (_payload: Payload) => {
    submit.addEventListener('click', process)
}