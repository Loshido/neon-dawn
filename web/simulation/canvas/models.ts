const { MeshoptDecoder } = await import("three/examples/jsm/libs/meshopt_decoder.module.js")
const { GLTFLoader } = await import("three/examples/jsm/Addons.js")

export async function chargerModele(chemin: string) {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder);

    return await loader.loadAsync(chemin)
}

export async function chargerSatellite() {
    return await chargerModele("/models/satellite-small.glb")
}