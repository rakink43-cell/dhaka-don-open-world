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
    if (random() > 0.45) box(w * 0.35, 2.1, d * 0.3, '#8c9695', x - 1, h + 0.14, z);
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

// Procedural Bangladeshi traffic: CNG, cycle-rickshaw, local bus and microbus.
// Each vehicle has a simple physical footprint used by the player collision check.
type TrafficKind = 'cng' | 'rickshaw' | 'bus' | 'microbus';
type TrafficActor = { mesh: THREE.Group; x: number; z: number; yaw: number; speed: number; radius: number; kind: TrafficKind };
const traffic: TrafficActor[] = [];
const trafficMaterials = {
  black: mat('#171b1c', 0.75), glass: mat('#18343c', 0.3), metal: mat('#a7b0b1', 0.45),
  red: mat('#c53e32', 0.45), green: mat('#26815d', 0.45), yellow: mat('#e3b84e', 0.5),
  blue: mat('#3479a5', 0.45), cream: mat('#e4d8bd', 0.55), trim: mat('#f2d56b', 0.5)
};
function part(parent: THREE.Group, w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function trafficWheel(parent: THREE.Group, x: number, z: number, radius = 0.35) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.18, 10), trafficMaterials.black);
  m.rotation.z = Math.PI / 2; m.position.set(x, radius, z); m.castShadow = true; parent.add(m);
}
function makeTraffic(kind: TrafficKind, x: number, z: number, yaw: number, speed: number) {
  const g = new THREE.Group();
  if (kind === 'cng') {
    part(g, 1.45, 0.85, 2.0, trafficMaterials.green, 0, 0.85, 0);
    part(g, 1.3, 0.62, 1.05, trafficMaterials.green, 0, 1.55, -0.15);
    part(g, 1.18, 0.48, 0.08, trafficMaterials.glass, 0, 1.58, 0.39);
    part(g, 1.2, 0.13, 0.12, trafficMaterials.yellow, 0, 1.15, 1.02);
    part(g, 0.08, 0.8, 0.08, trafficMaterials.metal, -0.72, 1.35, 0.4);
    part(g, 0.08, 0.8, 0.08, trafficMaterials.metal, 0.72, 1.35, 0.4);
    for (const wx of [-0.78, 0.78]) for (const wz of [-0.65, 0.65]) trafficWheel(g, wx, wz, 0.28);
    // CNG canopy roof and small side mirrors.
    part(g, 1.52, 0.12, 1.2, trafficMaterials.yellow, 0, 2.0, -0.12);
    part(g, 0.22, 0.07, 0.12, trafficMaterials.black, -0.85, 1.62, 0.48);
    part(g, 0.22, 0.07, 0.12, trafficMaterials.black, 0.85, 1.62, 0.48);
  } else if (kind === 'rickshaw') {
    part(g, 0.72, 0.25, 1.7, trafficMaterials.red, 0, 1.0, -0.15);
    part(g, 0.95, 0.14, 1.05, trafficMaterials.yellow, 0, 1.55, -0.35);
    part(g, 0.82, 0.42, 0.12, trafficMaterials.red, 0, 1.28, -0.72);
    part(g, 0.08, 0.55, 0.08, trafficMaterials.metal, -0.42, 1.25, 0.45);
    part(g, 0.08, 0.55, 0.08, trafficMaterials.metal, 0.42, 1.25, 0.45);
    trafficWheel(g, 0, 0.62, 0.32);
    trafficWheel(g, -0.48, -0.68, 0.28); trafficWheel(g, 0.48, -0.68, 0.28);
    part(g, 0.9, 0.1, 0.45, trafficMaterials.green, 0, 1.78, -0.35);
    // Decorative canopy stripes.
    for (let i = -2; i <= 2; i++) part(g, 0.12, 0.03, 0.88, trafficMaterials.trim, i * 0.17, 1.85, -0.35);
  } else if (kind === 'bus') {
    part(g, 2.45, 1.75, 6.3, trafficMaterials.blue, 0, 1.25, 0);
    part(g, 2.25, 0.75, 5.8, trafficMaterials.cream, 0, 2.0, 0);
    part(g, 2.3, 0.16, 6.0, trafficMaterials.red, 0, 1.62, 0);
    for (let zWin = -2.35; zWin <= 2.4; zWin += 0.95) {
      part(g, 0.05, 0.52, 0.72, trafficMaterials.glass, -1.16, 2.35, zWin);
      part(g, 0.05, 0.52, 0.72, trafficMaterials.glass, 1.16, 2.35, zWin);
    }
    part(g, 1.6, 0.28, 0.08, trafficMaterials.yellow, 0, 2.92, 3.12);
    // Local destination board: simple high-contrast DHAKA • LOCAL label.
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96;
    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.fillStyle = '#14232a'; ctx.fillRect(0, 0, 512, 96); ctx.fillStyle = '#f4d66e'; ctx.font = 'bold 54px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('DHAKA • LOCAL', 256, 67); }
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.27), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) }));
    sign.position.set(0, 2.92, 3.17); g.add(sign);
    for (const wx of [-1.22, 1.22]) for (const wz of [-2.15, 2.15]) trafficWheel(g, wx, wz, 0.48);
  } else {
    part(g, 1.95, 0.85, 4.25, trafficMaterials.cream, 0, 0.95, 0);
    part(g, 1.62, 0.78, 2.05, trafficMaterials.blue, 0, 1.72, -0.25);
    part(g, 1.48, 0.58, 0.08, trafficMaterials.glass, 0, 1.78, 0.82);
    part(g, 1.5, 0.12, 0.12, trafficMaterials.red, 0, 1.18, 2.12);
    // Sliding-door seam and side windows.
    part(g, 0.04, 0.72, 1.25, trafficMaterials.metal, 0.82, 1.5, -0.35);
    for (const side of [-1, 1]) {
      part(g, 0.05, 0.48, 0.72, trafficMaterials.glass, side * 0.83, 1.88, -0.65);
      part(g, 0.05, 0.48, 0.72, trafficMaterials.glass, side * 0.83, 1.88, 0.18);
      trafficWheel(g, side * 0.98, -1.35, 0.38); trafficWheel(g, side * 0.98, 1.35, 0.38);
      part(g, 0.2, 0.08, 0.12, trafficMaterials.black, side * 1.05, 1.8, 0.92);
    }
  }
  g.position.set(x, 0.1, z); g.rotation.y = yaw; scene.add(g);
  const radius = kind === 'bus' ? 3.5 : kind === 'microbus' ? 2.4 : kind === 'cng' ? 1.45 : 1.2;
  traffic.push({ mesh: g, x, z, yaw, speed, radius, kind });
}
makeTraffic('cng', -5.3, -34, 0, 4.5);
makeTraffic('rickshaw', 4.8, 26, Math.PI, 2.2);
makeTraffic('bus', 5.3, -72, 0, 3.0);
makeTraffic('microbus', -5.2, 72, Math.PI, 5.2);
makeTraffic('cng', 34, 5.2, -Math.PI / 2, 3.8);
makeTraffic('rickshaw', -36, -5.2, Math.PI / 2, 1.8);

// Low-poly Dhaka pedestrians on the footpaths (kept outside the vehicle lanes).
type Pedestrian = { mesh: THREE.Group; limbs: THREE.Group[]; axis: 'z' | 'x'; fixed: number; progress: number; speed: number; phase: number };
const pedestrians: Pedestrian[] = [];
const shirtColors = ['#d94f42', '#e0b23d', '#327b9b', '#6d8b4d', '#a65c91', '#e8e1ce', '#df7b35'];
const trouserColors = ['#263c4b', '#3e4548', '#55473b', '#29302f'];
function makePedestrian(axis: 'z' | 'x', fixed: number, progress: number, index: number) {
  const person = new THREE.Group();
  const shirt = mat(shirtColors[index % shirtColors.length], 0.9);
  const trousers = mat(trouserColors[index % trouserColors.length], 0.95);
  const skin = mat(index % 3 === 0 ? '#9a6245' : index % 3 === 1 ? '#bd865f' : '#d19a70', 0.95);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.72, 0.28), shirt);
  torso.position.y = 1.15; torso.castShadow = true; person.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 6), skin);
  head.position.y = 1.67; head.castShadow = true; person.add(head);
  const limbs: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(side * 0.31, 1.42, 0);
    const armMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 0.15), shirt);
    armMesh.position.y = -0.25; armMesh.castShadow = true; arm.add(armMesh);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.075, 6, 5), skin);
    hand.position.y = -0.53; arm.add(hand); person.add(arm); limbs.push(arm);
    const leg = new THREE.Group(); leg.position.set(side * 0.13, 0.82, 0);
    const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.62, 0.18), trousers);
    legMesh.position.y = -0.31; legMesh.castShadow = true; leg.add(legMesh);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.28), trafficMaterials.black);
    shoe.position.set(0, -0.62, 0.04); leg.add(shoe); person.add(leg); limbs.push(leg);
  }
  person.position.set(axis === 'z' ? fixed : progress, 0.12, axis === 'z' ? progress : fixed);
  person.rotation.y = axis === 'z' ? (fixed < 0 ? Math.PI : 0) : (fixed < 0 ? -Math.PI / 2 : Math.PI / 2);
  scene.add(person);
  pedestrians.push({ mesh: person, limbs, axis, fixed, progress, speed: 0.65 + (index % 4) * 0.13, phase: index * 0.8 });
}
for (let i = 0; i < 12; i++) makePedestrian('z', i % 2 ? 10.6 : -10.6, -92 + i * 16.5, i);
for (let i = 0; i < 8; i++) makePedestrian('x', i % 2 ? 10.6 : -10.6, -78 + i * 22, i + 12);

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
    const nextX = car.position.x + Math.sin(car.rotation.y) * velocity * dt;
    const nextZ = car.position.z + Math.cos(car.rotation.y) * velocity * dt;
    // Keep the player inside the blockout and stop the car before traffic overlap.
    let blocked = Math.abs(nextX) > 105 || Math.abs(nextZ) > 105;
    for (const actor of traffic) {
      const dx = nextX - actor.x, dz = nextZ - actor.z;
      if (dx * dx + dz * dz < (actor.radius + 1.25) ** 2) { blocked = true; break; }
    }
    if (!blocked) { car.position.x = nextX; car.position.z = nextZ; }
    else velocity *= -0.12;
    // Ambient traffic creeps along the local roads, then loops within the compact map.
    for (const actor of traffic) {
      if (Math.abs(actor.yaw) < 0.01 || Math.abs(Math.abs(actor.yaw) - Math.PI) < 0.01) {
        actor.z += Math.cos(actor.yaw) * actor.speed * dt;
        if (actor.z > 108) actor.z = -108;
        if (actor.z < -108) actor.z = 108;
      } else {
        actor.x += Math.sin(actor.yaw) * actor.speed * dt;
        if (actor.x > 108) actor.x = -108;
        if (actor.x < -108) actor.x = 108;
      }
      actor.mesh.position.set(actor.x, 0.1, actor.z);
    }
    // Walk pedestrians along sidewalk loops; swing arms and legs for a visible gait.
    const walkTime = clock.elapsedTime;
    for (const person of pedestrians) {
      person.progress += person.speed * dt;
      if (person.progress > 102) person.progress = -102;
      if (person.axis === 'z') person.mesh.position.set(person.fixed, 0.12, person.progress);
      else person.mesh.position.set(person.progress, 0.12, person.fixed);
      const gait = Math.sin(walkTime * 5 + person.phase) * 0.38;
      person.limbs[0].rotation.x = gait;
      person.limbs[1].rotation.x = -gait;
      person.limbs[2].rotation.x = -gait;
      person.limbs[3].rotation.x = gait;
    }
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
