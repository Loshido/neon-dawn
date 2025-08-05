import { BufferGeometry, Float32BufferAttribute, Line, Scene, type Object3D  } from "npm:three/webgpu"
import { Group as TweenGroup, Tween } from "npm:@tweenjs/tween.js"
import { chargerModele } from "./models.ts"

interface Payload {
    position: [number, number, number]
}

export default class Satellite {
    name: string
    url: string
    position: [number, number, number]
    historique: number[] = []
    line?: Line
    mesh?: Object3D
    
    private position_animation?: Tween
    private position_call?: number
    private socket?: WebSocket
    private position_interval: number = 200 // in ms
    private destroy: () => void
    constructor({ position, name, url, destroy }: Payload & { name: string, url: string, destroy: () => void }, group: TweenGroup, scene: Scene) {
        this.position = position,
        this.url = url
        this.name = name
        this.createMesh(scene)
        this.setupCalls()        
        this.setupAnimation(group)
        this.destroy = destroy
    }
    private setupCalls() {
        if(this.url.startsWith('ws')) {
            this.setupSocket()
            return
        }
        this.setupIntervals()
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
            }
        })
        this.socket.addEventListener('close', () => {
            this.destroy()
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
                controller_position.abort()
                clearInterval(this.position_call)
                this.destroy()
            } finally {
                controller_position = null
            }
        }, this.position_interval)
    }
    private createMesh(scene: Scene) {
        chargerModele("./model/satellite.glb", (modele => {
            if(modele.scene.children.length == 0) {
                throw new Error('Empty modele');
            }
            this.mesh = modele.scene.children[0]
            this.mesh.name = this.name
            this.mesh.position.x = this.position[0]
            this.mesh.position.y = this.position[1]
            this.mesh.position.z = this.position[2]
            this.mesh.scale.x = 0.001
            this.mesh.scale.y = 0.001
            this.mesh.scale.z = 0.001
            scene.add(this.mesh)
        }))
    }
    private setupAnimation(group: TweenGroup) {
        const position_animation = new Tween({
            x: this.position[0],
            y: this.position[1],
            z: this.position[2],
        })
        .onUpdate(({ x, y, z }) => {
            this.mesh?.position.set(x, y, z)
            this.mesh?.lookAt(0, 0, 0)
            this.mesh?.rotateY(Math.PI / 2)
        })
        .duration(this.position_interval)

        group.add(position_animation)
        this.position_animation = position_animation
    }
    animate(type: 'position') {
        if(type == 'position' && this.position_animation) {
            this.position_animation.stop()
            this.position_animation.to({
                x: this.position[0],
                y: this.position[1],
                z: this.position[2],
            })
            this.position_animation.startFromCurrentValues()
        }
    }
    update(payload: Payload) {
        if('position' in payload && this.position_animation && this.mesh) {
            this.position = payload.position
            this.historique.push(...this.mesh.position)
            if(this.line) {
                this.line.geometry.dispose()

                const geo = new BufferGeometry()

                geo.setAttribute('position', new Float32BufferAttribute( this.historique, 3 ))

                this.line.geometry = geo
            }
            this.animate('position')

        }
    }
    cleanup(scene: Scene) {
        if(this.position_call) clearTimeout(this.position_call)
        if(this.socket) this.socket.close()
        if(this.mesh) scene.remove(this.mesh)
    }
}