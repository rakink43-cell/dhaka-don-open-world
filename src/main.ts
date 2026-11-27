import * as THREE from 'three';
import './style.css';

const mount = document.querySelector<HTMLDivElement>('#game-canvas-wrap')!;
const speedLabel = document.querySelector<HTMLElement>('#speed')!;
const introCard = document.querySelector<HTMLElement>('#intro-card')!;
const startButton = document.querySelector<HTMLButtonElement>('#start-button')!;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#9bbcc9');
scene.fog = new THREE.Fog('#9bbcc9', 90, 310);

const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 6, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
mount.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe4f5ff, 0x4d4638, 2.1));
const sun = new THREE.DirectionalLight(0xfff0d5, 3.2);
sun.position.set(-35, 70, 25);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

const mat = (color: string, roughness = 0.9) => new THREE.MeshStandardMaterial({ color, roughness });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), mat('#8b9b78'));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

function box(w: number, h: number, d: number, color: string, x: number, y: number, z: number) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  mesh.position.set(x, y + h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

// Compact road blockout: broad cross roads and sidewalks.
box(18, 0.12, 220, '#41464a', 0, 0.06, 0);
box(220, 0.12, 18, '#41464a', 0, 0.06, 0);
box(3, 0.13, 220, '#e5d9b5', 0, 0.13, 0);
box(220, 0.13, 3, '#e5d9b5', 0, 0.13, 0);

// Dashed lane markings.
for (let i = -100; i <= 100; i += 12) {
  box(0.22, 0.025, 5, '#e8e4d7', 0, 0.15, i);
  box(5, 0.025, 0.22, '#e8e4d7', i, 0.15, 0);
}

// Low-poly Dhaka-inspired building blocks with colorful shop-level accents.
const palette = ['#c8b49b', '#d8c9ad', '#b7c1b8', '#d0b6a5', '#9faeb2', '#d8d1bf'];
let seed = 17;
const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
for (let x = -78; x <= 78; x += 26) {
  for (let z = -78; z <= 78; z += 26) {
    if (Math.abs(x) < 18 || Math.abs(z) < 18) continue;
    const w = 13 + random() * 7;
    const d = 13 + random() * 7;
    const h = 8 + random() * 28;
    box(w, h, d, palette[Math.floor(random() * palette.length)], x, 0.14, z);
    // Roof tank / rooftop room.
    if (random() > 0.45) box(w * 0.35, 2.1, d * 0.3, '#8c9695', x - 1, h + 0.14, z);
    // Storefront color strip facing nearby road.
    if (Math.abs(z) < 44) box(w * 0.72, 1.2, 0.35, '#2d6b70', x, 1.2, z + Math.sign(z) * d * 0.52);
  }
}

// Roadside trees as simple instanced geometry.
const trunkGeo = new THREE.CylinderGeometry(0.28, 0.42, 3.2, 6);
const crownGeo = new THREE.IcosahedronGeometry(2.2, 1);
const trunkMat = mat('#6d4c35');
const crownMat = mat('#47734d');
for (let i = -90; i <= 90; i += 18) {
  for (const side of [-1, 1]) {
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(side * 14, 1.7, i);
    trunk.castShadow = true;
    scene.add(trunk);
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.set(side * 14, 4.4, i);
    crown.scale.set(1, 1.15, 1);
    crown.castShadow = true;
    scene.add(crown);
  }
}

const car = new THREE.Group();
const carBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.72, 4.2), mat('#b94135', 0.45));
carBody.position.y = 0.85;
carBody.castShadow = true;
car.add(carBody);
const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.72, 1.9), mat('#263b46', 0.35));
cabin.position.set(0, 1.48, -0.15);
cabin.castShadow = true;
car.add(cabin);
const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.28, 12);
const wheelMat = mat('#17191a', 0.8);
for (const x of [-1.08, 1.08]) for (const z of [-1.35, 1.35]) {
  const wheel = new THREE.Mesh(wheelGeo, wheelMat);
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(x, 0.48, z);
  car.add(wheel);
}
car.position.set(0, 0.1, 5);
scene.add(car);

const keys = new Set<string>();
let started = false;
let velocity = 0;
let steer = 0;
addEventListener('keydown', (e) => { keys.add(e.code); keys.add(e.key.toLowerCase()); if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault(); });
addEventListener('keyup', (e) => { keys.delete(e.code); keys.delete(e.key.toLowerCase()); });
document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(button => {
  const key = button.dataset.key!;
  const down = (e: Event) => { e.preventDefault(); keys.add(key); };
  const up = (e: Event) => { e.preventDefault(); keys.delete(key); };
  button.addEventListener('pointerdown', down);
  button.addEventListener('pointerup', up);
  button.addEventListener('pointerleave', up);
  button.addEventListener('pointercancel', up);
});

startButton.addEventListener('click', () => { started = true; introCard.classList.add('hidden'); });

const desiredCamera = new THREE.Vector3();
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.04);
  if (started) {
    const forward = keys.has('KeyW') || keys.has('w') || keys.has('ArrowUp');
    const reverse = keys.has('KeyS') || keys.has('s') || keys.has('ArrowDown');
    const left = keys.has('KeyA') || keys.has('a') || keys.has('ArrowLeft');
    const right = keys.has('KeyD') || keys.has('d') || keys.has('ArrowRight');
    const brake = keys.has('Space');
    if (forward) velocity = Math.min(velocity + 15 * dt, 24);
    else if (reverse) velocity = Math.max(velocity - 12 * dt, -7);
    else velocity *= Math.pow(0.965, dt * 60);
    if (brake) velocity *= Math.pow(0.82, dt * 60);
    const steerInput = (left ? 1 : 0) - (right ? 1 : 0);
    steer = THREE.MathUtils.lerp(steer, steerInput, 5 * dt);
    car.rotation.y += steer * (velocity / 24) * 1.65 * dt;
    car.position.x += Math.sin(car.rotation.y) * velocity * dt;
    car.position.z += Math.cos(car.rotation.y) * velocity * dt;
    car.position.x = THREE.MathUtils.clamp(car.position.x, -105, 105);
    car.position.z = THREE.MathUtils.clamp(car.position.z, -105, 105);
    speedLabel.textContent = String(Math.round(Math.abs(velocity) * 3.6)).padStart(3, '0');
  }
  desiredCamera.set(car.position.x - Math.sin(car.rotation.y) * 10, car.position.y + 5.2, car.position.z - Math.cos(car.rotation.y) * 10);
  camera.position.lerp(desiredCamera, 1 - Math.exp(-4 * dt));
  camera.lookAt(car.position.x, car.position.y + 1, car.position.z);
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setSize(innerWidth, innerHeight);
});
