import { Material, Mesh, MeshBasicMaterial, SphereGeometry } from "three"
import { Group, Tween } from "@tweenjs/tween.js"
import { FETCH_INTERVAL } from "./main"

interface Payload {
    position: [number, number, number]
    couleur: string
}

export default class Satellite {
    position: [number, number, number]
    private couleur: string
    mesh: Mesh
    private animation: Tween
    constructor({ position, couleur }: Payload, group: Group) {
        this.position = position,
        this.couleur = couleur
        this.mesh = this.createMesh()
        const animation = new Tween({
            x: this.position[0],
            y: this.position[1],
            z: this.position[2]
        })
        .onUpdate(({ x, y, z}) => this.mesh.position.set(x, y, z))
        .duration(FETCH_INTERVAL)

        group.add(animation)
        this.animation = animation
    }
    private createMesh() {
        const geometry = new SphereGeometry(0.01, 32, 32)
        const texture = new MeshBasicMaterial({
            color: this.couleur
        })

        const mesh = new Mesh(geometry, texture)
        mesh.position.x = this.position[0]
        mesh.position.y = this.position[1]
        mesh.position.z = this.position[2]
        
        return mesh
    }
    update(payload: Partial<Payload>) {
        if(payload.position) {
            this.animation.stop()
            this.animation.to({
                x: payload.position[0],
                y: payload.position[1],
                z: payload.position[2],
            })

            this.position = payload.position
            // this.mesh.position.set(...this.position)
            this.animation.startFromCurrentValues()
        }
        if(payload.couleur) {
            if (this.mesh.material && this.mesh.material instanceof Material) {
                this.mesh.material.dispose(); 
            }
            this.couleur = payload.couleur
            this.mesh.material = new MeshBasicMaterial({ color: payload.couleur })
        }
    }
}