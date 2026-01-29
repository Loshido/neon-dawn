import { BufferAttribute, BufferGeometry, DynamicDrawUsage, Line, LineBasicMaterial, Material, Scene, type Object3D } from "three/webgpu"
import { chargerSatellite } from "../canvas/models"

export class SatelliteMesh {
    name: string
    mesh?: Object3D<any>
    line: Line

    private positions: Float32Array
    private currentPointCount: number = 0
    private maxPoints: number

    constructor(name: string, color: [number, number, number], scene: Scene, maxPoints: number = 1000) {
        this.name = name
        this.maxPoints = maxPoints
        this.positions = new Float32Array(maxPoints * 3)
        this.line = SatelliteMesh.createLine(color, this.positions)

        SatelliteMesh.createMesh(name).then(mesh => {
            this.mesh = mesh
            scene.add(this.mesh)
            scene.add(this.line)
        })
    }

    async waitForMesh() {
        while (!this.mesh) {
            await new Promise(resolve => setTimeout(resolve, 10))
        }
        return this.mesh
    }

    async update(position: [number, number, number]) {
        (await this.waitForMesh()).position.fromArray(position)
        this.newPoint(position)
    }

    toggleTrace(force?: boolean) {
        if(force === undefined) this.line.visible = !this.line.visible
        else this.line.visible = force
    }

    private newPoint(position: [number, number, number]) {
        if (this.currentPointCount >= this.maxPoints) {
            this.positions.copyWithin(0, 3)
            this.currentPointCount--
        }
        
        const index = this.currentPointCount * 3
        this.positions[index] = position[0]
        this.positions[index + 1] = position[1]
        this.positions[index + 2] = position[2]
        
        this.currentPointCount++
        
        const positionAttribute = this.line.geometry.getAttribute('position') as BufferAttribute
        positionAttribute.needsUpdate = true
        
        this.line.geometry.setDrawRange(0, this.currentPointCount)
    }

    private static async createMesh(name: string) {
        const collection = await chargerSatellite()
        const mesh = collection.scene.children[0]

        mesh.name = name
        mesh.scale.set(0.05, 0.05, 0.05)
        return mesh
    }

    private static createLine(color: [number, number, number], positions: Float32Array) {
        const geometry = new BufferGeometry()
        const positionAttribute = new BufferAttribute(positions, 3)
        positionAttribute.setUsage(DynamicDrawUsage)
        geometry.setAttribute('position', positionAttribute)
        geometry.setDrawRange(0, 0)
        
        const material = new LineBasicMaterial({ 
            color: `rgb(` + color.join(', ') + `)` 
        })
        const line = new Line(geometry, material)

        return line
    }

    recolor(color: [number, number, number]) {
        const material = new LineBasicMaterial({
            color: `rgb(` + color.join(', ') + `)`
        });
        (this.line.material as Material).dispose()
        this.line.material = material
    }

    rename(name: string) {
        this.name = name
        if(this.mesh) this.mesh.name = name
    }

    dispose(scene: Scene) {
        if(this.mesh) {
            this.mesh.clear()
            scene.remove(this.mesh)
        }
        this.line.geometry.dispose();
        (this.line.material as Material).dispose()
        scene.remove(this.line)
    }
}