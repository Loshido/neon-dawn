const { DirectionalLight } = await import("three/webgpu")

export default () => {
    const sun = new DirectionalLight( '#ffffff', 2 );
    sun.position.set( 0, 0, 3 );

    return sun
}