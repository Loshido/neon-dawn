import { MeshStandardNodeMaterial, SphereGeometry, Mesh, DirectionalLight, 
    Scene, Raycaster, PerspectiveCamera
} from 'npm:three/webgpu';
import { normalWorld, output, texture, vec4, normalize, 
    positionWorld, cameraPosition,
    mix } from 'npm:three/tsl';
import type { Textures } from './textures.ts';

export default (t: Textures) => {
    // sun
	const sun = new DirectionalLight( '#ffd1abff', 2 );
	sun.position.set( 0, 0, 3 );

    // fresnel
    const viewDirection = positionWorld.sub( cameraPosition ).normalize();
    const fresnel = viewDirection.dot( normalWorld ).abs().oneMinus().toVar();
    // sun orientation
    const sunOrientation = normalWorld.dot( normalize( sun.position ) ).toVar();
    // atmosphere color
    const atmosphereColor = mix( t.atmosphereTwilightColor, t.atmosphereDayColor, sunOrientation.smoothstep( - 0.25, 0.75 ) );
    // globe
    const globeMaterial = new MeshStandardNodeMaterial();
    globeMaterial.colorNode = texture( t.dayTexture )
    const atmosphereDayStrength = sunOrientation.smoothstep( - 0.5, 1 );
    const atmosphereMix = atmosphereDayStrength.mul( fresnel.pow( 2 ) ).clamp( 0, 1 );
    let finalOutput = output.rgb
    finalOutput = mix( finalOutput, atmosphereColor, atmosphereMix );
    globeMaterial.outputNode = vec4( finalOutput, output.a );
    const sphereGeometry = new SphereGeometry( 1, 64, 64 );
    const globe = new Mesh( sphereGeometry, globeMaterial );

    // camera
    const camera = new PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.fov = 20
    camera.zoom = 2.0
	camera.position.set( 4.5, 2, 3 );

    // scene & raycast
	const scene = new Scene();
    const raycast = new Raycaster()

    return {
        globe,
        sun,
        // atmosphere,
        camera,
        scene,
        raycast
    }
}