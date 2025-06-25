import { Mesh, MeshBasicMaterial, Scene, SphereGeometry } from "three/webgpu"
import { Group, Tween } from "@tweenjs/tween.js"
import { FETCH_INTERVAL } from "./main"

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
    constructor({ position, couleur, name, url }: Payload & { name: string, url: string }, group: Group) {
        this.position = position,
        this.couleur = couleur
        this.url = url
        this.name = name
        this.mesh = this.createMesh()
        this.setupAnimation(group)
        this.setupCalls()        
    }
    private setupCalls() {
        let controller_position: AbortController | null = null
        this.position_call = setInterval(async () => {
            if(controller_position) controller_position.abort()
            controller_position = new AbortController()

            try {
                const response = await fetch(this.url + '/position', {
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
        }, FETCH_INTERVAL)

        let controller_couleur: AbortController | null = null
        this.couleur_call = setInterval(async () => {
            if(controller_couleur) controller_couleur.abort()
            controller_couleur = new AbortController()

            try {
                const response = await fetch(this.url + '/couleur', {
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
        }, 1000);
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
        .duration(FETCH_INTERVAL)

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
        .duration(1000)

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
        clearTimeout(this.couleur_call)
        clearTimeout(this.position_call)
        this.mesh.material.dispose()
        this.mesh.clear()
        scene.remove(this.mesh)
    }
}