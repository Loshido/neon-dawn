export const ui = {
    init(callback: { 
        lock: () => boolean, 
        rotation: () => boolean, 
        validate: (name: string, url: string) => boolean 
        invalidate: (name: string) => void
    }) {
        const lock = document.querySelector('svg#lock')
        const rotation = document.querySelector('svg#rotate')
        const orbit = document.querySelector('svg#orbit')
        if(!lock || !rotation || !orbit) return
    
        lock.addEventListener('click', () => {
            this.lock(callback.lock())
        })
        rotation.addEventListener('click', () => {
            this.rotation(callback.rotation())
        })
        orbit.addEventListener('click', () => {
            this.orbit()
        })

        const div = document.querySelector('main > div:not(.active)')
        if(!div) return
        initialise(div, { 
            validate: callback.validate,
            invalidate: callback.invalidate
         })
    },
    lock: (state: boolean) => {
        const element = document.querySelector('svg#lock')
        if(!element) return

        element.classList.toggle('active', state)
    },
    rotation: (state: boolean) => {
        const element = document.querySelector('svg#rotate')
        if(!element) return

        element.classList.toggle('active', !state)
    },
    orbit: (state?: boolean) => {
        const element = document.querySelector('svg#orbit')
        if(!element) return

        element.classList.toggle('active', state)
    }
}

function initialise(div: Element, callback: { 
    validate: (name: string, url: string) => boolean, invalidate: (name: string) => void
}) {
    let svg = div.querySelector('svg') as Element | null
    if(!svg) return
    
    // on first click
    svg.addEventListener('click', () => {
        let name = div.querySelector('p.name') as HTMLParagraphElement | null
        let url = div.querySelector('p.url') as HTMLParagraphElement | null
        // if already clicked return
        if(div.classList.contains('active') || !name || !url) return

        // we instanciate the new satellite
        const identifier = name.innerText
        if(!callback.validate(identifier, url.innerText)) {
            return
        }

        // make sure we can delete the div
        let svg = div.querySelector('svg') as HTMLElement | null
        if(!svg) return
        svg.addEventListener('click', () => {
            callback.invalidate(identifier)
            div.remove()
        })

        // clone the div
        const copy = div.cloneNode(true) as HTMLDivElement 

        // activate the div
        div.classList.toggle('active', true)
        // disable inputs
        div.querySelectorAll('p').forEach(p => p.contentEditable = "false")

        if(!div.parentElement) return 
        
        // reset inputs
        name = copy.querySelector('p.name') as HTMLParagraphElement | null
        url = copy.querySelector('p.url') as HTMLParagraphElement | null
        svg = copy.querySelector('svg') as HTMLElement | null
        if(!name || !url || !svg) return 
        name.innerText = "Nom du groupe"
        url.innerText = "http://localhost:5173"
        initialise(copy, callback)
        
        div.parentElement.appendChild(copy)
    })
}