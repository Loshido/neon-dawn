import { GLTFLoader, type GLTF } from "npm:three/examples/jsm/Addons.js";

export function chargerModele(chemin: string, callback: (modele: GLTF) => void) {
    const loader = new GLTFLoader()
    loader.load(chemin, callback)
}