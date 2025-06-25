import { MeshStandardNodeMaterial, SphereGeometry, Mesh, DirectionalLight, MeshBasicNodeMaterial, BackSide} from 'three/webgpu';
import { step, normalWorld, output, texture, vec3, vec4, normalize, 
    positionWorld, bumpMap, cameraPosition,
    mix, uv, max } from 'three/tsl';
import type { Textures } from './textures';

export default (t: Textures) => {
    // sun
	const sun = new DirectionalLight( '#ffffff', 2 );
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
    const cloudsStrength = texture( t.bumpRoughnessCloudsTexture, uv() ).b.smoothstep( 0.2, 1 );
    globeMaterial.colorNode = mix( texture( t.dayTexture ), vec3( 1 ), cloudsStrength.mul( 2 ) );
    const roughness = max(
        texture( t.bumpRoughnessCloudsTexture ).g,
        step( 0.01, cloudsStrength )
    );
    globeMaterial.roughnessNode = roughness.remap( 0, 1, t.roughnessLow, t.roughnessHigh );
    const night = texture( t.nightTexture );
    const dayStrength = sunOrientation.smoothstep( - 0.25, 0.5 );
    const atmosphereDayStrength = sunOrientation.smoothstep( - 0.5, 1 );
    const atmosphereMix = atmosphereDayStrength.mul( fresnel.pow( 2 ) ).clamp( 0, 1 );
    let finalOutput = mix( night.rgb, output.rgb, dayStrength );
    finalOutput = mix( finalOutput, atmosphereColor, atmosphereMix );
    globeMaterial.outputNode = vec4( finalOutput, output.a );
    const bumpElevation = max(
        texture( t.bumpRoughnessCloudsTexture ).r,
        cloudsStrength
    );
    globeMaterial.normalNode = bumpMap( bumpElevation );
    const sphereGeometry = new SphereGeometry( 1, 64, 64 );
    const globe = new Mesh( sphereGeometry, globeMaterial );


    // atmosphere
    const atmosphereMaterial = new MeshBasicNodeMaterial( { side: BackSide, transparent: true } );
    let alpha: any = fresnel.remap( 0.73, 1, 1, 0 ).pow( 3 );
    alpha = alpha.mul( sunOrientation.smoothstep( - 0.5, 1 ) );
    atmosphereMaterial.outputNode = vec4( atmosphereColor, alpha );
    const atmosphere = new Mesh( sphereGeometry, atmosphereMaterial );
    atmosphere.scale.setScalar( 1.04 );

    return {
        globe,
        sun,
        atmosphere
    }
}