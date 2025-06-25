import { SRGBColorSpace } from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import type { Textures } from './textures';

export default (t: Textures) => {
    // debug
	const gui = new GUI();
	gui
		.addColor( { color: t.atmosphereDayColor.value.getHex( SRGBColorSpace ) }, 'color' )
		.onChange( ( value ) => {
			t.atmosphereDayColor.value.set( value );
		} )
		.name( 'atmosphereDayColor' );
	gui
		.addColor( { color: t.atmosphereTwilightColor.value.getHex( SRGBColorSpace ) }, 'color' )
		.onChange( ( value ) => {
			t.atmosphereTwilightColor.value.set( value );
		} )
		.name( 'atmosphereTwilightColor' );
	gui.add( t.roughnessLow, 'value', 0, 1, 0.001 ).name( 'roughnessLow' );
	gui.add( t.roughnessHigh, 'value', 0, 1, 0.001 ).name( 'roughnessHigh' );
}