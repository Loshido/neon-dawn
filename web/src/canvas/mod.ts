
import { type PerspectiveCamera, type PostProcessing, Raycaster, type WebGPURenderer, type DirectionalLight, Scene } from "three/webgpu"
import type { OrbitControls } from "three/addons";

import sun from "./objects/sun.ts";
const renderer = (await import('./objects/renderer')).default
const globe = (await import('./objects/globe')).default
const atmosphere = (await import('./objects/atmosphere')).default
import controls from "./objects/controls.ts"
import camera from "./objects/camera.ts"
import postprocess from "./objects/postprocess.ts";

const POST_PROCESSING = false

export default () => {
    const canvas = new Canvas(c => ((time: number) => {
        if(POST_PROCESSING && c.postProcess) {
            c.postProcess.render()
        } else {
            c.renderer.render(c.scene, c.camera)
        }

        const radius = 5;
        const speed = 0.00005;
        
        c.sun.position.x = Math.cos(time * speed) * radius;
        c.sun.position.z = Math.sin(time * speed) * radius;
        c.sun.position.y = Math.sin(time * speed * 0.5) * radius * 0.4;
        
        c.sun.target.position.set(0, 0, 0);
        c.sun.target.updateMatrixWorld();
    }))

    return canvas
}
class Canvas {
    camera: PerspectiveCamera
    postProcess: PostProcessing | null
    scene: Scene
    renderer: WebGPURenderer
    controls: OrbitControls
    raycast: Raycaster
    sun: DirectionalLight
    constructor(make_animate: (canvas: Canvas) => ((time: number) => void)) {
        this.scene = new Scene()

        this.sun = sun()
        this.scene.add(this.sun)

        const globeMesh = globe(this.sun)
        this.scene.add(globeMesh)

        const atmosphereMesh = atmosphere(this.sun)
        this.scene.add(atmosphereMesh)

        this.camera = camera()
        this.renderer = renderer(make_animate(this))
        this.controls = controls(this.camera, this.renderer.domElement)
        this.raycast = new Raycaster()

        this.postProcess = POST_PROCESSING ? postprocess(this.scene, this.camera, this.renderer) : null

        window.addEventListener('resize', this.onWindowResize)
        window.addEventListener('click', this.onClick)
        window.addEventListener('keydown', this.onKeyDown)
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    onClick() {
        // logic
    }

    onKeyDown(_event: KeyboardEvent) {

    }

    
}