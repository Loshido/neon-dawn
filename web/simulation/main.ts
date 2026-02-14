import { SatelliteMesh } from './satellite/mod'
import './style.css'

const canvas = (await import('./canvas/mod')).default
const ui = (await import('./ui/mod')).default
const sse = (await import('./sse')).default

const ctx = canvas()
const meshes: SatelliteMesh[] = []

const { onPing, onRecolor, onRename, onSatelliteCrashed, onSatelliteLaunched } = ui({
    focusOnSatellite(name: string) {
        const target = meshes.find(m => m.name === name)?.mesh
        if(target) ctx.controls.target = target.position
    },
    focusOnEarthView() {
        ctx.controls.target = ctx.globe.position
    },
    showTraceOfSatellite(name: string, show?: boolean) {
        const s = meshes.find(m => m.name === name) 
        if(s) s.toggleTrace(show)
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
    async onEvent(event) {
        onPing()
        switch(event.type) {
            case 'Crash': {
                const s = meshes.find(m => m.name === event.name)
                if(s) s.dispose(ctx.scene)
                onSatelliteCrashed(event.name)
                break;
            }
            case 'Launch': {
                const s = new SatelliteMesh(event.name, event.color, ctx.scene)
                meshes.push(s)

                onSatelliteLaunched(event.name, event.color)
                break;
            }
            case 'Position':
                const s = meshes.find(m => m.name === event.name)
                if(s) s.update(event.position, event.rotation ?? undefined)
                // todo: rotation
                break;
            case 'Sync':
                for(const satellite of event.satellites) {
                    const s = new SatelliteMesh(satellite.name, satellite.color, ctx.scene)
                    meshes.push(s)
                    
                    s.update(satellite.position)
                    onSatelliteLaunched(satellite.name, satellite.color)
                }
                break;
            case 'Update': {
                const s = meshes.find(m => m.name === event.name)
                if(event.color && s) {
                    s.recolor(event.color)
                    onRecolor(event.name, event.color)
                }
                if(event.new_name && s) {
                    s.rename(event.new_name)
                    onRename(event.name, event.new_name)
                }
                break;
            }
        }  
    },
})