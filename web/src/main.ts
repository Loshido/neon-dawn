const canvas = (await import('./canvas/mod')).default
const ui = (await import('./ui/mod')).default
const sse = (await import('./sse')).default

canvas()

const { onPing, onRecolor, onRename, onSatelliteCrashed, onSatelliteLaunched } = ui({
    toggleRotation() {
        console.log('rotation')
    },
    focusOnSatellite(name: string) {
        console.log('focus on', name)
    },
    focusOnEarthView() {
        console.log('focus on earth')
    },
    showTraceOfSatellite(name: string, show?: boolean) {
        console.log('show trace of', name, show)
    },
    satellites: [],
})

sse({
    onOpened() {
        console.log('Connection opened')
    },
    onClosed() {
        console.log('Connection closed')
    },
    onEvent(event) {
        onPing()
        switch(event.type) {
            case 'Crash':
                onSatelliteCrashed(event.name)
                break;
            case 'Launch':
                onSatelliteLaunched(event.name, event.color)
                break;
            case 'Position':
                break;
            case 'Sync':
                event.satellites.forEach(s => 
                    onSatelliteLaunched(s.name, s.color))
                break;
            case 'Update':
                if(event.color)
                    onRecolor(event.name, event.color)
                if(event.new_name)
                    onRename(event.name, event.new_name)
                break;
        }  
    },
})