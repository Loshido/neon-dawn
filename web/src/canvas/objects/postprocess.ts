import { Camera, Scene, WebGPURenderer } from "three/webgpu"

const { PostProcessing } = await import("three/webgpu")
const { smaa } = await import("three/examples/jsm/tsl/display/SMAANode.js")
const { pass } = await import("three/tsl")

export default (scene: Scene, camera: Camera, renderer: WebGPURenderer) => {
    const postProcess = new PostProcessing(renderer)

    // postProcess.outputColorTransform = false

    const scenePass = pass(scene, camera)
    const smaaPass = smaa( scenePass )

    postProcess.outputNode = smaaPass

    return postProcess
}