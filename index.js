import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";
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

// post-processing
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
bloomPass.threshold = 0.002;
bloomPass.strength = 1;
bloomPass.radius = 0;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

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
    new THREE.LineBasicMaterial({ color: 0xADD8E6, linewidth: 2 })
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
    const edge = new THREE.EdgesGeometry(boxGeometry, 0.2);
    // const color = new THREE.Color().setHSL(1.0 - p, 1, 0.5);
    const boxLine = new THREE.LineSegments(
        edge,
        new THREE.LineBasicMaterial({ color:0xFFD700, linewidth: 2 })
    );
    boxLine.position.copy(pos);
    boxLine.rotation.set(route.x, route.y, route.z);
    scene.add(boxLine);
}


// Track scroll for infinite movement
let scrollOffset = 0;
let targetScrollOffset = 0; // Target position
let currentScrollOffset = 0; // Current position (smoothed)

//update camera inside the path of the tube
function updateCamera() {
    const looptime = 8 * 1000;
    
    // Smoothly interpolate towards target (lerp)
    currentScrollOffset += (targetScrollOffset - currentScrollOffset) * 0.01; // 0.1 = smoothing factor
    
    // Use smoothed scrollOffset
    const time = currentScrollOffset * looptime;
    let t1 = (time % looptime) / looptime;
    
    // Ensure t1 stays between 0 and 1
    t1 = t1 % 1;
    if (t1 < 0) t1 += 1;

    const pos = geometry.parameters.path.getPointAt(t1);
    const lookAt = geometry.parameters.path.getPointAt((t1 + 0.01) % 1);

    camera.position.copy(pos);
    camera.lookAt(lookAt);
}

// Use wheel event instead of scroll event
window.addEventListener('wheel', (e) => {
    e.preventDefault(); // Prevent actual scrolling
    
    // Update target offset (adjust 0.0001 for speed)
    targetScrollOffset += e.deltaY * 0.0001;
}, { passive: false });

scene.add(taurMesh);
scene.fog = new THREE.FogExp2(0x000000, 0.3);

function animate(t = 0) {
    requestAnimationFrame(animate)
    updateCamera(); // Now updates every frame with smooth interpolation
    composer.render(scene, camera);
    controls.update();
}

animate();

// Prevent scrolling via CSS
document.body.style.overflow = 'hidden';

