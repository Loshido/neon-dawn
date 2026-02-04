
import { type PerspectiveCamera, type PostProcessing, Raycaster, type WebGPURenderer, type DirectionalLight, Scene, Mesh } from "three/webgpu"
import type { OrbitControls } from "three/addons";

import sun from "./objects/sun.ts";
const renderer = (await import('./objects/renderer')).default
const globe = (await import('./objects/globe')).default
const atmosphere = (await import('./objects/atmosphere')).default
import runtime from "../runtime/mod"
import controls from "./objects/controls.ts"
import camera from "./objects/camera.ts"
import postprocess from "./objects/postprocess.ts";

const POST_PROCESSING = false

export default () => {
    const canvas = new Canvas(runtime)

    return canvas
}

export class Canvas {
    camera: PerspectiveCamera
    postProcess: PostProcessing | null
    scene: Scene
    globe: Mesh
    renderer: WebGPURenderer
    controls: OrbitControls
    raycast: Raycaster
    sun: DirectionalLight
    constructor(runtime: ((canvas: Canvas, time: number) => void)[]) {
        this.scene = new Scene()

        this.sun = sun()
        this.scene.add(this.sun)

        this.globe = globe(this.sun)
        this.scene.add(this.globe)

        const atmosphereMesh = atmosphere(this.sun)
        this.scene.add(atmosphereMesh)

        this.camera = camera()
        this.renderer = renderer((time: number) => {
            runtime.forEach(update => update(this, time))
        })
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