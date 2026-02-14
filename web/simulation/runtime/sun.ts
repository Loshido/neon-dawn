import type { Canvas } from "~/canvas/mod"

export default (c: Canvas, time: number) => {
    const radius = 5;
    const speed = 0.00005;
    
    c.sun.position.x = Math.cos(time * speed) * radius;
    c.sun.position.z = Math.sin(time * speed) * radius;
    c.sun.position.y = Math.sin(time * speed * 0.5) * radius * 0.4;
    
    c.sun.target.position.set(0, 0, 0);
    c.sun.target.updateMatrixWorld();
}
