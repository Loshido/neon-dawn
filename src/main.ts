import { 
    PerspectiveCamera, Scene, WebGPURenderer, 
    MeshStandardNodeMaterial, Mesh,
    Raycaster, Vector2, type Object3D,
} from 'three/webgpu';
import { Group } from '@tweenjs/tween.js';

import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import textures from './textures';
import objets from './objets';
import moteur from './moteur';
import Satellite from './satellites';
import { ui } from './ui';

let camera: PerspectiveCamera;
let scene: Scene;
let renderer: WebGPURenderer;
let controls: OrbitControls;
let globe: MeshStandardNodeMaterial | Mesh;
let tween: Group
let raycast: Raycaster
let pointer: Vector2 = new Vector2()
let selected = -1;
export let locked = false;
const satellites: Satellite[] = []

export const FETCH_INTERVAL = 200 //ms

init();

// La plus grande partie du code vient de https://threejs.org/examples/?q=earth#webgpu_tsl_earth
function init() {
	camera = new PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.fov = 20
    camera.zoom = 2.0
	camera.position.set( 4.5, 2, 3 );
	scene = new Scene();
    raycast = new Raycaster()

	const t = textures()
    const o = objets(t)
    globe = o.globe
    tween = new Group()
	
	scene.add( o.sun );
	scene.add( o.globe );
	scene.add( o.atmosphere );

    const r = moteur({ animate, camera })
    renderer = r.renderer
    controls = r.controls

    ui.init({
        lock() {
            locked = !locked
            return locked
        },
        rotation() {
            controls.autoRotate = !controls.autoRotate
            return controls.autoRotate
        },
        invalidate(name) {
            satellites.forEach(s => {
                if(s.name == name) {
                    s.cleanup(scene)
                }
            })
        },
        validate(name, url) {
            if(satellites.some(s => s.name == name)) {
                return false
            }
            const s = new Satellite({
                position: [1.1, 0, 0],
                couleur: [255, 255, 0],
                url,
                name,
            }, tween)
            satellites.push(s)
            scene.add(s.mesh)
            return true
        }
    })

    window.addEventListener('click', onClick)
	window.addEventListener( 'resize', onWindowResize );
    window.addEventListener('keydown', onKeyDown)
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onClick(event: MouseEvent) {
    if(locked) return

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycast.setFromCamera(pointer, camera)

    const intersects = raycast.intersectObjects(scene.children, false)
    const distances = intersects.map(i => [i.distance, i.object]) satisfies [number, Object3D][]
    distances.sort((a, b) => a[0] - b[0])
    if(distances.length > 0) {
        satellites.forEach((s, i) => {
            if(s.mesh == distances[0][1]) {
                if(i != selected) {
                    selected = i
                    controls.target = s.mesh.position
                }
            }
        })
        if(globe == distances[0][1]) {
            selected = -1
            controls.target = globe.position
            controls.update
        }
    }
}

function onKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement
    if(target.tagName === 'P') return;
    switch(event.key) {
        case ' ':
            controls.autoRotate = !controls.autoRotate
            ui.rotation(controls.autoRotate)
            break;
        case 'ArrowUp':
            controls.autoRotateSpeed += 0.25
            break;
        case 'ArrowDown':
            if(controls.autoRotateSpeed <= 0.0) break;
            controls.autoRotateSpeed -= 0.25
            break;
        case 'l':
            locked = !locked
            ui.lock(locked)
            break;
        case 'o':
            ui.orbit()
            break;
    }
}

async function animate() {
    tween.update()
	controls.update();
	renderer.render( scene, camera );
}