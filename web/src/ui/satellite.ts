interface SatelliteConstructor {
    name: string
    color: [number, number, number]
    onFocus: (focused: boolean) => void,
    onShowTrace: (show: boolean) => void
}

const aside = document.querySelector('aside') as HTMLElement | undefined
export default class Satellite {
    name: string
    private color: string
    private element: HTMLDivElement

    constructor({ name, color, onFocus, onShowTrace }: SatelliteConstructor) {
        if(!aside) 
            throw "Le menu n'est pas disponible"

        this.name = name
        this.color = `rgb(` + color.join(', ') + `)`

        this.element = document.createElement('div')
        this.element.classList.add('satellite')
        this.element.innerHTML = `
            <div class="color active"><div></div></div>
            <div class="name"></div>
            <div class="actions">
                <img src="images/cctv.svg" alt="CCTV" class="focus">
            </div>`

        this.recolor(color)
        this.rename(name)

        const satellite_focus = this.element.querySelector('.actions > .focus') as HTMLImageElement
        satellite_focus.addEventListener('click', () => {
            const focus = satellite_focus.classList.toggle('active')
            onFocus(focus) 
        })

        const satellite_color = this.element.querySelector('.color') as HTMLDivElement
        satellite_color.addEventListener('click', () => {
            const show = satellite_color.classList.toggle('active')
            onShowTrace(show)
        })

        aside.appendChild(this.element)
    }

    rename(name: string) {
        this.name = name

        const satellite_name = this.element.querySelector('.name') as HTMLDivElement
        satellite_name.innerText = this.name
    }

    recolor(color: [number, number, number]) {
        this.color = `rgb(` + color.join(', ') + `)`
        const satellite_color = this.element.querySelector('.color') as HTMLDivElement
        satellite_color.setAttribute('style', `--color: ${ this.color };`)
    }

    focus() {
        const satellite_focus = this.element.querySelector('.actions > .focus') as HTMLImageElement
        satellite_focus.classList.toggle('active', true)
    }

    unfocus() {
        const satellite_focus = this.element.querySelector('.actions > .focus') as HTMLImageElement
        satellite_focus.classList.toggle('active', false)
    }

    remove() {
        this.element.remove()
    }
}