import type { Camera } from "three/webgpu";

const { OrbitControls } = await import("three/addons/controls/OrbitControls.js")

export default (camera: Camera, canvas: HTMLCanvasElement) => {
    const controls = new OrbitControls( camera, canvas );
    controls.enableDamping = false;
    controls.minDistance = 0.1;
    controls.maxDistance = 50;

    controls.dampingFactor = 0.07
    controls.autoRotate = false
    controls.autoRotateSpeed = 0.001
    controls.enablePan = false

    return controls
}