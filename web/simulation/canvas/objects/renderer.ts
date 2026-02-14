const { WebGPURenderer } = await import("three/webgpu")

export default (animate: (time: number) => void) => {
    const renderer = new WebGPURenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.alpha = true

    renderer.setAnimationLoop(animate);
    renderer.shadowMap.enabled = true

    document.body.appendChild( renderer.domElement );

    return renderer
}