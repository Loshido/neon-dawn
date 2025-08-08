// @ts-types="npm:@types/three/webgpu"
import { 
    PerspectiveCamera, Scene, WebGPURenderer, 
    MeshStandardNodeMaterial, Mesh,
    Raycaster, Vector2, type Object3D,
    PostProcessing,
    Line,
    BufferGeometry,
    LineBasicMaterial,
    Float32BufferAttribute,
} from 'npm:three/webgpu';
import { Group } from 'npm:@tweenjs/tween.js';

import type { OrbitControls } from 'npm:three/addons/controls/OrbitControls.js';
import textures from './textures.ts';
import objets from './objets.ts';
import moteur from './moteur.ts';
import Satellite from './satellites.ts';
import { ui } from './ui.ts';
import { pass } from 'npm:three/tsl';
import { smaa } from 'npm:three/examples/jsm/tsl/display/SMAANode.js';

const MODE: 'remote' | 'local' = 'remote'
document.body.setAttribute('data-mode', MODE)

let camera: PerspectiveCamera;
let scene: Scene;
let renderer: WebGPURenderer;
let controls: OrbitControls;
let globe: MeshStandardNodeMaterial | Mesh;
let tween: Group
let raycast: Raycaster
const pointer: Vector2 = new Vector2()
let post: PostProcessing
let selected = -1;
export let locked = true;
const satellites: Satellite[] = []
let line: Line | undefined

init();

// La plus grande partie du code vient de https://threejs.org/examples/?q=earth#webgpu_tsl_earth
function init() {
	const t = textures()
    const o = objets(t)
    globe = o.globe
    scene = o.scene
    camera = o.camera
    raycast = o.raycast
    tween = new Group()
	
	scene.add( o.sun );
	scene.add( o.globe );
	// scene.add( o.atmosphere );

    const m = moteur({ animate, camera })
    renderer = m.renderer
    controls = m.controls

    let sats: null | [string, string][] = []
    if(MODE === 'local') {
        const url = new URL(window.location.toString())
        const param = url.searchParams.get('satellite')
        if(param && (param.startsWith('http://') || param.startsWith('ws://'))) {
            sats = [["URL", param]]
        } else {
            const s = localStorage.getItem('satellites')
            if(s) {
                sats = JSON.parse(s) as [string, string][]
            }
        }
    }

    const connect = ui.init({
        mode: MODE,
        satellites: typeof sats == 'object' && !!sats ? sats : [],
        lock() {
            locked = !locked
            return locked
        },
        rotation() {
            controls.autoRotate = !controls.autoRotate
            return controls.autoRotate
        },
        invalidate(name) {
            const i = satellites.reduce((i, s, index) => {
                if(s.name == name) {
                    s.cleanup(scene)
                    return index
                }
                return i
            }, -1)

            if(i === -1) return;
            satellites.splice(i, 1)
            localStorage.setItem('satellites', JSON.stringify(satellites.map(s => [s.name, s.url])))
        },
        validate(name, url) {
            if(satellites.some(s => s.name == name)) {
                return false
            }
            const s = new Satellite({
                position: [1.1, 0, 0],
                url,
                name,
                destroy() {
                    const i = satellites.reduce((i, s, index) => {
                        if(s.name == name) {
                            s.cleanup(scene)
                            return index
                        }
                        return i
                    }, -1)
                    
                    if(i === -1) return;
                    satellites.splice(i, 1)
                    
                    document.getElementById(`satellite-${ name }`)?.parentElement?.remove()
                    
                    if(globe instanceof Mesh) {
                        selected = -1
                        controls.target = globe.position
                        if(line) {
                            scene.remove(line)
                            line = undefined
                        }
                    }
                    controls.update()
                }
            }, tween, scene)
            satellites.push(s)
            localStorage.setItem('satellites', JSON.stringify(satellites.map(s => [s.name, s.url])))
            return true
        },
        focus(name?: string) {
            if(line) {
                satellites[selected].line = undefined 
                line.geometry.dispose()
                scene.remove(line)
                line = undefined
            }
            if(name) {
                const i = satellites.findIndex(s => s.name == name)
                if(i >= 0 && satellites[i].mesh) {
                    controls.target = satellites[i].mesh.position

                    
                    const geo = new BufferGeometry()
                    geo.setAttribute('position', new Float32BufferAttribute( satellites[i].historique, 3 ))
                    
                    const mat = new LineBasicMaterial( { color: 0xffffff })
                    line = new Line(geo, mat)
                    scene.add(line)
                    satellites[i].line = line
                    selected = i
                }
                
            } else if(globe instanceof Mesh) {
                selected = -1
                controls.target = globe.position
            }
            controls.update()
        }
    })

    if(MODE === 'remote' && connect) {
        const events = new EventSource(new URL('/events', location.origin))
        events.addEventListener('open', () => {
            console.log('en attente de satellites')
        })
        events.addEventListener('message', (event) => {
            const { name, url } = JSON.parse(event.data) as { name: string, url: string }
            connect(name, url)
        })
    }

    window.addEventListener('click', onClick)
	window.addEventListener( 'resize', onWindowResize );
    window.addEventListener('keydown', onKeyDown)

    // post processing
    post = new PostProcessing(renderer)
    
    const scenePass = pass(scene, camera)
    const smaaPass = smaa( scenePass )
    post.outputNode = smaaPass
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
            if(s.mesh && s.mesh.name == distances[0][1].name) {
                if(i != selected && satellites[i].mesh) {
                    const geo = new BufferGeometry()
                    geo.setAttribute('position', new Float32BufferAttribute( satellites[i].historique, 3 ))
                    
                    const mat = new LineBasicMaterial( { color: 0xffffff })
                    line = new Line(geo, mat)
                    scene.add(line)
                    satellites[i].line = line
                    satellites[selected].line = undefined 
                    selected = i
                    controls.target = s.mesh.position
                }
            }
        })
        if(globe == distances[0][1]) {
            if(line) {
                satellites[selected].line = undefined
                scene.remove(line)
                line = undefined
            }
            selected = -1
            controls.target = globe.position
        }
        controls.update()
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

function animate() {
    tween.update()
	controls.update();
	renderer.render( scene, camera );
    // post.render()
}