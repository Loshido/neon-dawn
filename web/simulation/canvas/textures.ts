const { TextureLoader, SRGBColorSpace } = await import("three/webgpu")

const textureLoader = new TextureLoader();
export default {
    day() {
        const dayTexture = textureLoader.load('/textures/earth-color-map.webp');
        dayTexture.colorSpace = SRGBColorSpace;
        dayTexture.anisotropy = 8;

        return dayTexture
    },
    night() {
        const nightTexture = textureLoader.load('/textures/earth-night-map.webp');
        nightTexture.colorSpace = SRGBColorSpace;
        nightTexture.anisotropy = 8;

        return nightTexture
    },
    clouds() {
        const cloudsTexture = textureLoader.load('/textures/earth-cloud-map.webp');
        cloudsTexture.anisotropy = 8;
        
        return cloudsTexture
    },
    bumps() {
        const bumpsTexture = textureLoader.load('/textures/earth-bump-map.webp');
        bumpsTexture.anisotropy = 8;
        
        return bumpsTexture
    },
    skybox() {
        const skybox = textureLoader.load('/textures/skybox.svg');
        
        return skybox
    }
}