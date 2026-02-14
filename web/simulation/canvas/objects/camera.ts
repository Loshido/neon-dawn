const { PerspectiveCamera } = await import("three/webgpu")

export default () => {
    const camera = new PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.fov = 20
    camera.zoom = 2.0
    camera.position.set( 4.5, 2, 3 );
    camera.far = 30000

    return camera
}