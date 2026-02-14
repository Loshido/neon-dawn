const earth_view = document.getElementById('earth') as HTMLButtonElement | undefined
const satellites_menu = document.getElementById('show-satellites') as HTMLButtonElement | undefined
const ping = document.getElementById('ping') as HTMLDivElement | undefined

interface Listeners {
    focusOnEarthView: () => void,
}

let latest_ping = 0
export const initialize = (listeners: Listeners) => {
    if(!earth_view || !satellites_menu || !ping)
        throw "Les boutons d'actions ne sont pas disponibles."

    earth_view.addEventListener('click', () => {
        earth_view.classList.toggle('active', true)
        listeners.focusOnEarthView()
    })
    
    satellites_menu.addEventListener('click', () => {
        satellites_menu.classList.toggle('active')
    })

    return {
        onPing() {
            const t = Date.now()
            latest_ping = t
            ping.classList.toggle('ping', true)
            
            setTimeout(() => {
                if(latest_ping === t) 
                    ping.classList.toggle('ping', false)
            }, 500)
        },
        onToggleEarthView(focused: boolean) {
            earth_view.classList.toggle('active', focused)
        }
    }
}