import { 
    Clock, PerspectiveCamera, Scene, WebGPURenderer, 
    MeshStandardNodeMaterial, Mesh,
    Raycaster,
    Vector2,
} from 'three/webgpu';
import { Group } from '@tweenjs/tween.js';

import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import textures from './textures';
import objets from './objets';
import gui from './gui';
import moteur from './moteur';
import Satellite from './satellites';

let camera: PerspectiveCamera;
let clock: Clock;
let scene: Scene;
let renderer: WebGPURenderer;
let controls: OrbitControls;
let globe: MeshStandardNodeMaterial | Mesh;
let tween: Group
let raycast: Raycaster
let pointer: Vector2 = new Vector2()
const satellites: Satellite[] = []

const GLISSEMENT = 0.05
export const FETCH_INTERVAL = 200 //ms
// const NB_SATELLITES = 100

init();

// La plus grande partie du code vient de https://threejs.org/examples/?q=earth#webgpu_tsl_earth
function init() {
	clock = new Clock();
	camera = new PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 0.1, 100 );
	camera.position.set( 4.5, 2, 3 );
	scene = new Scene();
    raycast = new Raycaster()

	const t = textures()
    const o = objets(t)
    globe = o.globe
	
	scene.add( o.sun );
	scene.add( o.globe );
	scene.add( o.atmosphere );

    tween = new Group()

    const s = new Satellite({ position: [2, 0, 0], couleur: '#f00'}, tween)
    satellites.push(s)
    scene.add(s.mesh)

    // for(let i = 0; i < NB_SATELLITES; i++) {
    //     satellites.push(new Satellite({  
    //         position: [0, i * 1.2, 0], 
    //         couleur: `#${Math.random().toString(16).slice(2, 8)}`
    //     }))
    // }
    // satellites.forEach(s => {
    //     g.add(s.mesh)
    // })

    gui(t)
    const r = moteur({ animate, camera })
    renderer = r.renderer
    controls = r.controls

    window.addEventListener('mousemove', onPointerMove)
	window.addEventListener( 'resize', onWindowResize );
}

setInterval(async () => {
    const response = await fetch('http://localhost:7901/position')
    if(response.status != 200) return
    const position = await response.json()
    if(position instanceof Array && satellites.length == 1) {
        satellites[0].update({
            position: position as [number, number, number],
        })
    }
}, FETCH_INTERVAL);

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onPointerMove(event: MouseEvent) {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

// let last_step = 0;
async function animate() {
	const delta = clock.getDelta();
    if(globe instanceof Mesh) {
        globe.rotation.y += delta * GLISSEMENT;
    }

    tween.update()

    // satellites.forEach((s, i) => {
    //     const offset = (i / satellites.length) * Math.PI * 2;
    //     s.update({
    //         position: [
    //             Math.cos(0.01 * clock.elapsedTime + offset), 
    //             1.1 * Math.cos(((-1) ** i) * 0.25 * clock.elapsedTime + offset), 
    //             1.1 * Math.sin(((-1) ** i) * 0.25 * clock.elapsedTime + offset)
    //         ],
    //     })
    // })
    // if(Math.floor(clock.elapsedTime % 5) == 0 && last_step != Math.floor(clock.elapsedTime)) {
    //     last_step = Math.floor(clock.elapsedTime)
    //     satellites.forEach(satellite => {
    //         satellite.update({
    //             couleur: `#${Math.random().toString(16).slice(2, 8)}`
    //         })
    //     })
    // } 

	controls.update();
	renderer.render( scene, camera );
}