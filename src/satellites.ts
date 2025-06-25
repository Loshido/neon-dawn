import { Mesh, MeshBasicMaterial, Scene, SphereGeometry } from "three/webgpu"
import { Group, Tween } from "@tweenjs/tween.js"

interface Payload {
    position: [number, number, number]
    couleur: [number, number, number]
}

export default class Satellite {
    name: string
    url: string
    position: [number, number, number]
    mesh: Mesh<SphereGeometry, MeshBasicMaterial>
    
    private couleur: [number, number, number]
    private position_animation?: Tween
    private couleur_animation?: Tween
    private position_call?: NodeJS.Timeout
    private couleur_call?: NodeJS.Timeout
    private socket?: WebSocket
    private position_interval: number = 200 // in ms
    private couleur_interval: number = 1000 
    constructor({ position, couleur, name, url }: Payload & { name: string, url: string }, group: Group) {
        this.position = position,
        this.couleur = couleur
        this.url = url
        this.name = name
        this.mesh = this.createMesh()
        this.setupCalls()        
        this.setupAnimation(group)
    }
    private setupCalls() {
        if(this.url.startsWith('ws')) {
            this.setupSocket()
            return
        }

        fetch(this.url + ':7192/health')
            .then(response => response.json())
            .catch((error) => {
                console.error(`Failed to intercept ${this.name}'s health`, error)
                return null
            })
            .then(data => {
                if(data == null) return
                else if(typeof data === 'object' 
                && 'position' in data && 'couleur' in data) {
                    this.position_interval = data.position
                    this.couleur_interval = data.couleur
                    this.setupIntervals()
                }
            })
    }
    private setupSocket() {
        this.socket = new WebSocket(this.url + ':7192')
        this.socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data)
            if(!('type' in data)) {
                return
            }
            switch(data.type) {
                case 'position':
                    if(data.position instanceof Array && data.position.length == 3) {
                        const position = data.position as [number, number, number]
                        this.update({
                            position
                        })
                    }
                    break;
                case 'couleur':
                    if(data.couleur instanceof Array && data.couleur.length == 3) {
                        const couleur = data.couleur as [number, number, number]
                        this.update({
                            couleur
                        })
                    }
                    break;
                case 'health':
                    if('position' in data && 'couleur' in data
                        && typeof data.position === 'number'
                        && typeof data.couleur === 'number' ) {
                        this.position_interval = data.position
                        this.couleur_interval = data.couleur
                    }
                    break;
            }
        })
    }
    private setupIntervals() {
        let controller_position: AbortController | null = null
        this.position_call = setInterval(async () => {
            if(controller_position) controller_position.abort()
            controller_position = new AbortController()

            try {
                const response = await fetch(this.url + ':7192/position', {
                    signal: controller_position.signal
                })
                if(response.status != 200) return
    
                const position = await response.json()
                if(position instanceof Array) this.update({ 
                    position: position as [number, number, number] 
                })
            } catch(error) {
                console.error(`Failed to intercept ${this.name}'s position`, error)
            } finally {
                controller_position = null
            }
        }, this.position_interval)

        let controller_couleur: AbortController | null = null
        this.couleur_call = setInterval(async () => {
            if(controller_couleur) controller_couleur.abort()
            controller_couleur = new AbortController()

            try {
                const response = await fetch(this.url + ':7192/color', {
                    signal: controller_couleur.signal
                })
    
                if(response.status != 200) return
                const couleur = await response.json()
                if(couleur instanceof Array) this.update({ 
                    couleur: couleur as [number, number, number] 
                })
            } catch (error) {
                console.error(`Failed to intercept ${this.name}'s color`, error)
            } finally {
                controller_couleur = null
            }
        }, this.couleur_interval);
    }
    private createMesh() {
        const geometry = new SphereGeometry(0.05, 32, 32)
        const texture = new MeshBasicMaterial({
            color: `rgb(${this.couleur[0]}, ${this.couleur[1]}, ${this.couleur[2]})`
        })

        const mesh = new Mesh(geometry, texture)
        mesh.position.x = this.position[0]
        mesh.position.y = this.position[1]
        mesh.position.z = this.position[2]
        
        return mesh
    }
    private setupAnimation(group: Group) {
        const position_animation = new Tween({
            x: this.position[0],
            y: this.position[1],
            z: this.position[2],
        })
        .onUpdate(({ x, y, z }) => this.mesh.position.set(x, y, z))
        .duration(this.position_interval)

        group.add(position_animation)
        this.position_animation = position_animation

        const couleur_animation = new Tween({
            r: this.couleur[0],
            g: this.position[1],
            b: this.position[2],
        })
        .onUpdate(({ r, g, b }) => this.mesh.material.color
            .fromArray([r / 255, g / 255, b / 255])
        )
        .duration(this.couleur_interval)

        group.add(couleur_animation)
        this.couleur_animation = couleur_animation
    }
    animate(type: 'position' | 'couleur') {
        if(type == 'couleur' && this.couleur_animation) {
            this.couleur_animation.stop()
            this.couleur_animation.to({
                r: this.couleur[0],
                g: this.couleur[1],
                b: this.couleur[2],
            })
            this.couleur_animation.startFromCurrentValues()
        } else if(type == 'position' && this.position_animation) {
            this.position_animation.stop()
            this.position_animation.to({
                x: this.position[0],
                y: this.position[1],
                z: this.position[2],
            })
            this.position_animation.startFromCurrentValues()
        }
    }
    update(payload: Omit<Payload, 'position'> | Omit<Payload, 'couleur'>) {
        if('position' in payload && this.position_animation) {
            this.position = payload.position
            this.animate('position')
        } else if(this.couleur_animation && 'couleur' in payload) {
            this.couleur = payload.couleur
            this.animate('couleur')
        }
    }
    cleanup(scene: Scene) {
        if(this.couleur_call) clearTimeout(this.couleur_call)
        if(this.position_call) clearTimeout(this.position_call)
        if(this.socket) this.socket.close()

        this.mesh.material.dispose()
        this.mesh.clear()
        scene.remove(this.mesh)
    }
}