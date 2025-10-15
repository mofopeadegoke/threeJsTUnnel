import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import spline from './spline.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
const w = window.innerWidth;
const h = window.innerHeight;
renderer.setSize(w, h);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
document.body.appendChild(renderer.domElement);
const fov = 75;
const aspect = w / h;
const far = 30;
const near = 0.1;
const camera = new THREE.PerspectiveCamera(fov, aspect, far, near);
camera.position.z = 5;
const scene = new THREE.Scene();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

// create tube geometry from spline
const geometry = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);
const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    wireframe: true
});
const taurMesh = new THREE.Mesh(geometry, material);

// create edge geometry from spline
const edge = new THREE.EdgesGeometry(geometry, 0.2);
const line = new THREE.LineSegments(
    edge,
    new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
);
scene.add(line);

// Create boxes along the path of the tube wihh a slight offset
const numBoxes = 100;
const size = 0.08;
const boxGeometry = new THREE.BoxGeometry(size, size, size);
for (let i = 0; i < numBoxes; i++) {
    const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    const p = (i / numBoxes + Math.random() * 0.1) % 1;

    const pos = geometry.parameters.path.getPointAt(p);
    pos.x += Math.random() - 0.5;
    pos.z += Math.random() - 0.5;
    box.position.copy(pos);
    const route = new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    ).normalize();
    box.rotation.set(route.x, route.y, route.z);
    const helper = new THREE.BoxHelper(box, 0xffffff);
    scene.add(helper);
    scene.add(box);
}

//update camera inside the path of the tube
function updateCamera(t) {
    const time = t * 0.05;
    const looptime = 8 * 1000;
    const t1 = (time % looptime) / looptime;

    const pos = geometry.parameters.path.getPointAt(t1);
    const lookAt = geometry.parameters.path.getPointAt((t1 + 0.01) % 1);

    camera.position.copy(pos);
    camera.lookAt(lookAt);
}

scene.add(taurMesh);
scene.fog = new THREE.FogExp2(0x000000, 0.3);

function animate(t = 0) {
    requestAnimationFrame(animate)
    updateCamera(t);
    // mesh.rotation.y = t * 0.0001;
    renderer.render(scene, camera);
    controls.update();
}


animate();




