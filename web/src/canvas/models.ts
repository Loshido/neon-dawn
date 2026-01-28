const { GLTFLoader } = await import("three/examples/jsm/Addons.js")

export async function chargerModele(chemin: string) {
    const loader = new GLTFLoader()
    return await loader.loadAsync(chemin)
}

export async function chargerSatellite() {
    return await chargerModele("./models/satellite.glb")
}