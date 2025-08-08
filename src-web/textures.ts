import { TextureLoader, SRGBColorSpace, type Texture, type UniformNode, type Color } from 'npm:three/webgpu';
import { color, uniform, type ShaderNodeObject } from 'npm:three/tsl';

export interface Textures {
    dayTexture: Texture,
    // nightTexture: Texture,
    // bumpRoughnessCloudsTexture: Texture,
    atmosphereDayColor: ShaderNodeObject<UniformNode<Color>>,
    atmosphereTwilightColor: ShaderNodeObject<UniformNode<Color>>,
    roughnessLow: ShaderNodeObject<UniformNode<number>>,
    roughnessHigh: ShaderNodeObject<UniformNode<number>>
}

export default (): Textures => {
    const atmosphereDayColor = uniform( color( '#df4701ff' ) );
    const atmosphereTwilightColor = uniform( color( '#481414' ) );
    const roughnessLow = uniform( 0.4 );
    const roughnessHigh = uniform( 0.45 );

    const textureLoader = new TextureLoader();
    const dayTexture = textureLoader.load( './textures/8k_mars.jpg' );
    dayTexture.colorSpace = SRGBColorSpace;
    dayTexture.anisotropy = 8;
    // const nightTexture = textureLoader.load( './textures/8k_earth_nightmap.jpg' );
    // nightTexture.colorSpace = SRGBColorSpace;
    // nightTexture.anisotropy = 8;
    // const bumpRoughnessCloudsTexture = textureLoader.load( './textures/8k_earth_clouds.jpg' );
    // bumpRoughnessCloudsTexture.anisotropy = 8;

    return {
        dayTexture,
        // nightTexture,
        // bumpRoughnessCloudsTexture,
        atmosphereDayColor,
        atmosphereTwilightColor,
        roughnessLow,
        roughnessHigh
    }
}