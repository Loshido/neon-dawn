import { instanceIndex, Fn, vec3, range, hash, mod, time, sin, positionLocal } from "three/tsl";
import { AdditiveBlending, InstancedMesh, MeshBasicNodeMaterial, SphereGeometry } from "three/webgpu";

const RADIUS = 10000;
const SPEED = 0.08;
const COUNT = 50000;

export default () => {
    const geometry = new SphereGeometry(0.5, 12, 8); // bigger during debug, later 1–2

    const material = new MeshBasicNodeMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        blending: AdditiveBlending,
    });

    const stars = new InstancedMesh(geometry, material, COUNT);
    stars.frustumCulled = false;

    material.positionNode = Fn(() => {
        const id = instanceIndex;

        const seed = id.mul(0.621).add(17.123);

        const offset = vec3(
            range(-RADIUS, RADIUS).mul(hash(seed)),
            range(-RADIUS, RADIUS).mul(hash(seed.add(1.618))),
            range(-RADIUS, RADIUS).mul(hash(seed.add(2.718)))
        );

        const zAnimated = mod(offset.z.sub(time.mul(SPEED)), RADIUS * 2).sub(RADIUS);

        const instancePos = vec3(offset.x, offset.y, zAnimated);

        return positionLocal.add(instancePos);
    })();

    material.colorNode = Fn(() => {
        const id = instanceIndex;
        const brightness = sin(time.add(hash(id).mul(25)))
            .mul(0.35)
            .add(0.65)
            .pow(1.4);

        const hueShift = hash(id.add(7)).mul(0.15);
        const base = vec3(hueShift.add(0.9), 0.9, hueShift.mul(0.5).negate().add(1));

        return base.mul(brightness);
    })();

    return stars;
};