import type { Camera } from "three/webgpu";

const { OrbitControls } = await import("three/addons/controls/OrbitControls.js")

export default (camera: Camera, canvas: HTMLCanvasElement) => {
    const controls = new OrbitControls( camera, canvas );
    controls.enableDamping = true;
    controls.minDistance = 0.1;
    controls.maxDistance = 50;
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.25
    controls.enablePan = false

    return controls
}