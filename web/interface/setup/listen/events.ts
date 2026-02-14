type Vec3<T> = [T, T, T]

type Position = {
    type: 'Position',
    name: string,
    position: Vec3<number>,
    rotation: Vec3<number> | null
}
type Launch = {
    type: 'Launch',
    name: string,
    color: Vec3<number>,
    payload: string
}
type Update = {
    type: 'Update',
    name: string,
    new_name: string | null,
    color: Vec3<number> | null
}
type Crash = {
    type: 'Crash',
    name: string
}

type Sync = {
    type: "Sync",
    satellites: {
        name: string,
        color: Vec3<number>,
        position: Vec3<number>,
        rotation: Vec3<number> | null
    }[]
}

function removeFirstChildren(div: HTMLDivElement, n: number) {
    if(div.children.length >= n) {
        for(let i = 0; i < n; i++) {
            div.firstChild?.remove()
        }
    } else {
        const n_children = div.children.length
        for(let i = 0; i < n_children; i++) {
            div.firstChild?.remove()
        }
    }
}

function handleChildrenCap(div: HTMLDivElement) {
    const cap = window.innerWidth < 1000 ? 24 : 128
    if(div.children.length >= cap) {
        removeFirstChildren(div, div.children.length - cap + 1)
    }
}

function computeDescription(event: Event): string {
    switch(event.type) {
        case 'Position':
            return `Went to ${event.position.join(', ')}`
        case 'Sync': 
            return event.satellites.map(s => s.name).join(', ')
        case 'Crash': 
            return event.name
        case 'Launch':
            return event.payload
        case 'Update': {
            if(event.new_name) return event.new_name
            if(event.color) return 'rgb(' + event.color.join(', ') + ')'
        }
    }
    return ''
}

export type Event = Position | Launch | Update | Crash | Sync
export function handleEvent(event: Event, output: HTMLDivElement) {
    handleChildrenCap(output)

    const t = new Date().toLocaleTimeString('fr-FR')
    const span = document.createElement('div')
    const desc = computeDescription(event)
    const title = event.type !== 'Sync' ? event.name : `${ event.satellites.length } Satellites` 
    span.innerHTML = `<span class="event ${ event.type }" title="${ t }">${ event.type }</span>`
        + `<p title="${desc}">${ title }</p>`

    output.append(span)
}