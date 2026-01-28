import type { DirectionalLight } from "three/webgpu";

const { Mesh, MeshStandardNodeMaterial, SphereGeometry } = await import("three/webgpu")
const { 
    bumpMap, max, mix, normalize, normalWorld, positionWorld, 
    cameraPosition, step, texture, uniform, uv, vec3, vec4, 
    time 
} = await import("three/tsl")

import { atmosphereColor } from "./atmosphere.ts";
import textures from "../textures.ts";

const roughnessLow = uniform(0.25);
const roughnessHigh = uniform(0.35);
const cloudSpeed = uniform(0.00025);

export default (sun: DirectionalLight) => {
    const dayTexture = textures.day();
    const nightTexture = textures.night();
    const cloudsTexture = textures.clouds();
    
    const globeMaterial = new MeshStandardNodeMaterial({
        bumpMap: textures.bumps(),
        bumpScale: 100
    });
    
    // Create a uniform that references the sun's position (this updates automatically)
    const sunPositionUniform = uniform(sun.position);
    const nightBrightness = uniform(0.5);
    const cloudOffset = time.mul(cloudSpeed)

    const baseUV = uv()
    const cloudUV = baseUV.add(vec3(cloudOffset, 0, 0))

    const dayColor = texture(dayTexture, uv());
    const nightColor = texture(nightTexture, uv());
    const cloudsData = texture(cloudsTexture, cloudUV);
    
    const cloudsStrength = cloudsData.b.smoothstep(0.2, 1);
    
    globeMaterial.colorNode = dayColor.rgb;
    
    // Roughness
    const roughness = max(
        cloudsData.g,
        step(0.01, cloudsStrength)
    );
    globeMaterial.roughnessNode = roughness.remap(0, 1, roughnessLow, roughnessHigh);
    
    // Calculate sun orientation (how much surface faces the sun)
    const sunDirection = normalize(sunPositionUniform);
    const sunDot = normalWorld.dot(sunDirection).toVar();
    
    // Day/night transition (-1 = night, 1 = day)
    const dayStrength = sunDot.smoothstep(-0.25, 0.5);
    const atmosphereDayStrength = sunDot.smoothstep(-0.5, 1);
    
    // Fresnel for atmosphere
    const viewDirection = positionWorld.sub(cameraPosition).normalize();
    const fresnel = viewDirection.dot(normalWorld).abs().oneMinus().toVar();
    const atmosphereMix = atmosphereDayStrength.mul(fresnel.pow(2)).clamp(0, 1);
    
    // Add ambient light to prevent pure black
    const ambientStrength = uniform(0.05);
    const litColor = dayColor.rgb.mul(dayStrength.max(ambientStrength));
    
    // Mix night lights into the dark areas
    const nightStrength = dayStrength.oneMinus().mul(2).clamp(0, 1);
    const nightEmission = nightColor.rgb.mul(nightColor.a).mul(nightBrightness); // Control emission intensity
    let finalColor = mix(litColor, nightEmission, nightStrength);
    
    const cloudColor = vec3(1).mul(dayStrength.max(ambientStrength.mul(0.5)))
    finalColor = mix(finalColor, cloudColor, cloudsStrength.mul(0.75))

    // Add atmosphere glow
    finalColor = mix(finalColor, atmosphereColor(sunPositionUniform), atmosphereMix);
    
    globeMaterial.outputNode = vec4(finalColor, 1);
    
    // Bump mapping
    const bumpElevation = max(
        cloudsData.r,
        cloudsStrength
    );
    globeMaterial.normalNode = bumpMap(bumpElevation);
    
    const sphereGeometry = new SphereGeometry(1, 64, 64);
    const globe = new Mesh(sphereGeometry, globeMaterial);
    
    return globe;
}