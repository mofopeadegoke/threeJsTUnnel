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
const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    wireframe: true
});
const taurMesh = new THREE.Mesh(geometry, material);

//update camera inside the path of the tube
function updateCamera(t) {
    const time = t * 0.05;
    const looptime = 10 * 1000;
    const t1 = (time % looptime) / looptime;

    const pos = geometry.parameters.path.getPointAt(t1);
    const lookAt = geometry.parameters.path.getPointAt((t1 + 0.01) % 1);

    camera.position.copy(pos);
    camera.lookAt(lookAt);
}

const hemi = new THREE.HemisphereLight(0x0099ff, 0xD4AF37);
scene.add(hemi);
scene.add(taurMesh);

function animate(t = 0) {
    requestAnimationFrame(animate)
    updateCamera(t);
    // mesh.rotation.y = t * 0.0001;
    renderer.render(scene, camera);
    controls.update();
}


animate();




