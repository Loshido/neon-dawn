import type { Canvas } from "~/canvas/mod"
const POST_PROCESSING = false

export default (c: Canvas, _time: number) => {
    if(POST_PROCESSING && c.postProcess) {
        c.postProcess.render()
    } else {
        c.renderer.render(c.scene, c.camera)
    }
}
