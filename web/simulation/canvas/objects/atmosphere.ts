import { BackSide, DirectionalLight, Mesh, MeshBasicNodeMaterial, SphereGeometry, UniformNode, Vector3 } from "three/webgpu";
const { color, uniform, mix, normalize, cameraPosition, positionWorld, vec4, normalWorld } = await import('three/tsl')

const atmosphereDayColor = uniform(color('#082d49'));
const atmosphereTwilightColor = uniform(color('#481414'));

export const atmosphereColor = (sunPositionUniform: UniformNode<Vector3>) => {
    const sunOrientation = normalWorld.dot(normalize(sunPositionUniform)).toVar();
    return mix(atmosphereTwilightColor, atmosphereDayColor, sunOrientation.smoothstep(-0.25, 0.75));
}

export default (sun: DirectionalLight) => {
    // Create uniform for reactive sun position
    const sunPositionUniform = uniform(sun.position);
    
    const sunOrientation = normalWorld.dot(normalize(sunPositionUniform)).toVar();
    
    const viewDirection = positionWorld.sub(cameraPosition).normalize().dot(normalWorld).abs().oneMinus().toVar();
    
    const atmosphereMaterial = new MeshBasicNodeMaterial({ side: BackSide, transparent: true });
    
    const alpha = viewDirection.remap(0.73, 1, 1, 0).pow(3).mul(sunOrientation.smoothstep(-0.5, 1));
    atmosphereMaterial.outputNode = vec4(atmosphereColor(sunPositionUniform), alpha);
    
    const sphereGeometry = new SphereGeometry(1, 64, 64);
    const atmosphere = new Mesh(sphereGeometry, atmosphereMaterial);
    atmosphere.scale.setScalar(1.04);
    
    return atmosphere;
}