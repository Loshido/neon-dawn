import { GLTFLoader, type GLTF } from "three/examples/jsm/Addons.js";

export async function chargerModele(chemin: string, callback: (modele: GLTF) => void) {
    const loader = new GLTFLoader()
    loader.load(chemin, callback)
}