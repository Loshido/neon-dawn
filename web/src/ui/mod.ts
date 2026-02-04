import Satellite from './satellite'

const { initialize: initialize_actions } = (await import('./actions'))

interface Callback {
    focusOnSatellite(name: string): void,
    focusOnEarthView(): void,
    showTraceOfSatellite(name: string, show?: boolean): void,
    satellites: {
        name: string,
        color: [number, number, number]
    }[],
}

export interface Listeners {
    onSatelliteLaunched: (name: string, color: [number, number, number]) => void,
    onSatelliteCrashed: (name: string) => void,
    onPing: () => void,
    onRecolor: (name: string, color: [number, number, number]) => void,
    onRename: (name: string, new_name: string) => void,
} 

export default (parameters: Callback): Listeners => {
    const satellites: Satellite[] = []
    
    const { onPing, onToggleEarthView } = initialize_actions({
        focusOnEarthView: () => {
            satellites.forEach(s => s.unfocus())
            parameters.focusOnEarthView()
        },
    })

    const newSatellite = (name: string, color: [number, number, number]) => 
        new Satellite({
            name,
            color,
            onFocus(focused) {
                onToggleEarthView(!focused)
                satellites
                    .filter(s => s.name !== name || !focused)
                    .forEach(s => s.unfocus())
                
                if(focused) parameters.focusOnSatellite(name)
                else parameters.focusOnEarthView()
            },
            onShowTrace(show) {
                parameters.showTraceOfSatellite(name, show)
            },
        })

    for(const { name, color } of parameters.satellites) {
        const satellite = newSatellite(name, color)

        satellites.push(satellite)
    }

    return {
        onPing,
        onRecolor(name, color) {
            satellites.find(s => s.name === name)?.recolor(color)
        },
        onRename(name, new_name) {
            satellites.find(s => s.name === name)?.rename(new_name)
        },
        onSatelliteCrashed(name) {
            satellites.find(s => s.name === name)?.remove()
        },
        onSatelliteLaunched(name, color) {
            const satellite = newSatellite(name, color)

            satellites.push(satellite)
        },
    }
}