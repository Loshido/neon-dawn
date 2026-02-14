import type { Payload } from "../../main"
import '../../styles/helper-listen.css'
import { handleEvent } from "./events"
import { startListening, stopListening } from "./listeners"


export default async (_payload: Payload) => {
    const start = document.getElementById('listen-start') as HTMLButtonElement | null
    const stop = document.getElementById('listen-stop') as HTMLButtonElement | null
    const output = document.getElementById('listen-output') as HTMLDivElement | null

    if(!start || !stop || !output) 
        throw "listen template didn't load"

    start.addEventListener('click', () => startListening({ start, stop, output }, handleEvent))
    stop.addEventListener('click', () => stopListening({ start, stop, output }))
}