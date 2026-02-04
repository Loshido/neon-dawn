import type { Tween } from "@tweenjs/tween.js";
import type { Canvas } from "~/canvas/mod"

const group = new Set<Tween>()
export function TweenUpdateRegister(tween: Tween) {
    group.add(tween)
}

export default (_c: Canvas, time: number) => {
    group.forEach(tween => tween.update(time))
}
