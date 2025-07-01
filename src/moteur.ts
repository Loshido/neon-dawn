import { OrbitControls } from "three/examples/jsm/Addons.js";
import { ACESFilmicToneMapping, type PerspectiveCamera, WebGPURenderer } from "three/webgpu";

interface RendererProps {
    animate: () => void,
    camera: PerspectiveCamera
}

export default ({ animate, camera }: RendererProps) => {
    // renderer
	const renderer = new WebGPURenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	renderer.setAnimationLoop( animate );
    renderer.shadowMap.enabled = true
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 1

	document.body.appendChild( renderer.domElement );
    
	// controls
	const controls = new OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.minDistance = 0.1;
	controls.maxDistance = 50;
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.25
    controls.enablePan = false

    return {
        renderer,
        controls
    }
}