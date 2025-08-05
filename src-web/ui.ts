export const ui = {
    init(callback: {
        mode: 'local' | 'remote',
        satellites: [string, string][],
        lock: () => boolean, 
        rotation: () => boolean, 
        validate: (name: string, url: string) => boolean 
        invalidate: (name: string) => void,
        focus: (name?: string) => void
    }) {
        const lock = document.querySelector('svg#lock')
        const rotation = document.querySelector('svg#rotate')
        const open = document.querySelector('svg#open')
        const orbit = document.querySelector('svg#orbit')
        if(!lock || !rotation || !orbit || !open) return
    
        lock.addEventListener('click', () => {
            this.lock(callback.lock())
        })
        rotation.addEventListener('click', () => {
            this.rotation(callback.rotation())
        })
        orbit.addEventListener('click', () => {
            this.orbit()
        })
        open.addEventListener('click', () => {
            this.show()
        })

        let div = document.querySelector('main > div:not(.active)')
        if(!div) return

        for(const [name, url] of callback.satellites) {
            const pname = document.querySelector('p.name') as HTMLParagraphElement | null
            const purl = document.querySelector('p.url') as HTMLParagraphElement | null
            if(pname && purl) {
                pname.innerText = name
                purl.innerText = url
            }
            if(callback.mode !== 'remote') {
                div = next(div, name, url, {
                    validate: callback.validate,
                    invalidate: callback.invalidate,
                    focus: callback.focus
                })
            }

            if(name === "URL") {
                setTimeout(() => {
                    callback.focus(name)
                }, 1500)
            }
        }
        if(callback.mode !== 'remote') {
            initialise(div, { 
                validate: callback.validate,
                invalidate: callback.invalidate,
                focus: callback.focus
            })
        }
        return (name: string, url: string) => {
            next(div, name, url, {
                validate: callback.validate,
                invalidate: callback.invalidate,
                focus: callback.focus
            })
        }
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
    },
    show(state?: boolean) {
        const element = document.querySelector('svg#open')
        if(!element) return

        if(element.classList.toggle('active', state)) {
            this.orbit(false)
        }
    }
}

type CB = {
    validate: (name: string, url: string) => boolean, invalidate: (name: string) => void,
    focus: (name?: string) => void
}

function initialise(div: Element, callback: CB) {
    let svg = div.querySelector('svg') as Element | null
    if(!svg) return
    
    // on first click
    svg.addEventListener('click', () => {
        let name = div.querySelector('p.name') as HTMLParagraphElement | null
        let url = div.querySelector('p.url') as HTMLParagraphElement | null
        // if already clicked return
        if(div.classList.contains('active') || !name || !url) return

        next(div, name.innerText, url.innerText, callback)
    })
}

function next(div: Element, name: string, url: string, cb: CB): Element {
    // we instanciate the new satellite
    if(!cb.validate(name, url)) {
        return div
    }
    let name_p = div.querySelector('p.name') as HTMLParagraphElement | null
    let url_p = div.querySelector('p.url') as HTMLParagraphElement | null

    if(!name_p || !url_p) return div

    // make sure we can delete the div
    let svg = div.querySelector('svg') as HTMLElement | null
    if(!svg) return div
    svg.addEventListener('click', () => {
        cb.invalidate(name)
        div.remove()
    })

    // clone the div
    const copy = div.cloneNode(true) as HTMLDivElement 

    // activate the div
    div.classList.toggle('active', true)
    // disable inputs
    div.querySelectorAll('p').forEach(p => p.contentEditable = "false")
    name_p.addEventListener('click', () => {
        cb.focus(name)
    })
    name_p.id = `satellite-${name}`
    name_p.innerText = name
    url_p.innerText = url

    if(!div.parentElement) return div
        
    // reset inputs
    name_p = copy.querySelector('p.name') as HTMLParagraphElement | null
    url_p = copy.querySelector('p.url') as HTMLParagraphElement | null
    svg = copy.querySelector('svg') as HTMLElement | null
    if(!name_p || !url_p || !svg) return div
    name_p.innerText = "Nom du groupe"
    url_p.innerText = "http://localhost"
    initialise(copy, cb)
        
    div.parentElement.appendChild(copy)

    return copy
}