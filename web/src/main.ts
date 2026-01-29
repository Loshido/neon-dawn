const canvas = (await import('./canvas/mod')).default
const ui = (await import('./ui/mod')).default

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
    satellites: [
        {
            name: 'IE235',
            color: [0, 33, 0]
        },
        {
            name: 'IE236',
            color: [0, 66, 0]
        },
        {
            name: 'IE237',
            color: [0, 99, 0]
        },
        {
            name: 'IE238',
            color: [0, 132, 0]
        },
        {
            name: 'IE239',
            color: [0, 165, 0]
        },
    ],
})

onRename('IE238', 'IE238')

// sse

// satellites