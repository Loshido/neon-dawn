import type { Canvas } from "~/canvas/mod"

export default (c: Canvas, _time: number) => {
    c.controls.update()
}
