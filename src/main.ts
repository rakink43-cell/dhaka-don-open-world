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
const buildingColliders: { x: number; z: number; halfW: number; halfD: number }[] = [];
function hitsBuilding(x: number, z: number, padding = 0) {
  return buildingColliders.some(o => Math.abs(x - o.x) < o.halfW + padding && Math.abs(z - o.z) < o.halfD + padding);
}
const palette = ['#c8b49b', '#d8c9ad', '#b7c1b8', '#d0b6a5', '#9faeb2', '#d8d1bf'];
let seed = 17;
const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
for (let x = -78; x <= 78; x += 26) {
  for (let z = -78; z <= 78; z += 26) {
    if (Math.abs(x) < 18 || Math.abs(z) < 18) continue;
    const w = 13 + random() * 7;
    const d = 13 + random() * 7;
    const h = 8 + random() * 28;
    buildingColliders.push({ x, z, halfW: w / 2 + 1.2, halfD: d / 2 + 1.2 });
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
  person.rotation.y = axis === 'z' ? 0 : Math.PI / 2;
  scene.add(person);
  pedestrians.push({ mesh: person, limbs, axis, fixed, progress, speed: 0.65 + (index % 4) * 0.13, phase: index * 0.8 });
}
for (let i = 0; i < 12; i++) makePedestrian('z', i % 2 ? 10.6 : -10.6, -92 + i * 16.5, i);
for (let i = 0; i < 8; i++) makePedestrian('x', i % 2 ? 10.6 : -10.6, -78 + i * 22, i + 12);

// On-foot player avatar: toggle E to leave/enter the car.
const player = new THREE.Group();
const playerShirt = mat('#c94b3d', 0.85);
const playerPants = mat('#263b4a', 0.9);
const playerSkin = mat('#b77c57', 0.95);
const playerTorso = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.78, 0.32), playerShirt);
playerTorso.position.y = 1.25; playerTorso.castShadow = true; player.add(playerTorso);
const playerHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), playerSkin);
playerHead.position.y = 1.83; playerHead.castShadow = true; player.add(playerHead);
const playerLimbs: THREE.Group[] = [];
for (const side of [-1, 1]) {
  const arm = new THREE.Group(); arm.position.set(side * 0.36, 1.55, 0);
  const armMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.17), playerShirt);
  armMesh.position.y = -0.29; armMesh.castShadow = true; arm.add(armMesh); player.add(arm); playerLimbs.push(arm);
  const leg = new THREE.Group(); leg.position.set(side * 0.16, 0.88, 0);
  const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.68, 0.2), playerPants);
  legMesh.position.y = -0.32; legMesh.castShadow = true; leg.add(legMesh);
  const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.3), trafficMaterials.black);
  shoe.position.set(0, -0.67, 0.05); leg.add(shoe); player.add(leg); playerLimbs.push(leg);
}
player.position.set(-2.2, 0.12, 5);
player.visible = false;
scene.add(player);
let onFoot = false;
let playerHeading = 0;
let walkPhase = 0;
let toggleQueued = false;

const keys = new Set<string>();
let started = false;
let velocity = 0;
let steer = 0;
addEventListener('keydown', (e) => { keys.add(e.code); keys.add(e.key.toLowerCase()); if (e.code === 'KeyE' && !e.repeat) toggleQueued = true; if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault(); });
addEventListener('keyup', (e) => { keys.delete(e.code); keys.delete(e.key.toLowerCase()); });
document.querySelector<HTMLButtonElement>('[data-action="toggle"]')?.addEventListener('click', (e) => { e.preventDefault(); toggleQueued = true; });
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
    if (toggleQueued) {
      toggleQueued = false;
      if (!onFoot) {
        // Try both sides of the vehicle, relative to its heading. Never spawn the
        // player inside a building, pedestrian, or another vehicle.
        const heading = car.rotation.y;
        const sideX = Math.cos(heading), sideZ = -Math.sin(heading);
        const exitSpots = [
          { x: car.position.x + sideX * 2.2, z: car.position.z + sideZ * 2.2 },
          { x: car.position.x - sideX * 2.2, z: car.position.z - sideZ * 2.2 },
          { x: car.position.x - Math.sin(heading) * 3.0, z: car.position.z - Math.cos(heading) * 3.0 }
        ];
        const clearSpot = (spot: { x: number; z: number }) => {
          if (Math.abs(spot.x) > 103 || Math.abs(spot.z) > 103 || hitsBuilding(spot.x, spot.z, 0.45)) return false;
          if (pedestrians.some(p => Math.hypot(spot.x - p.mesh.position.x, spot.z - p.mesh.position.z) < 1.05)) return false;
          if (traffic.some(a => Math.hypot(spot.x - a.x, spot.z - a.z) < a.radius + 0.85)) return false;
          return true;
        };
        const exitSpot = exitSpots.find(clearSpot);
        if (exitSpot) {
          onFoot = true; player.visible = true; car.visible = false;
          player.position.set(exitSpot.x, 0.12, exitSpot.z);
          playerHeading = heading;
        }
      } else {
        const nearCar = Math.hypot(player.position.x - car.position.x, player.position.z - car.position.z) < 4.2;
        if (nearCar) { onFoot = false; player.visible = false; car.visible = true; }
      }
    }
    if (onFoot) {
      const moveX = (right ? 1 : 0) - (left ? 1 : 0);
      const moveZ = (forward ? 1 : 0) - (reverse ? 1 : 0);
      const length = Math.hypot(moveX, moveZ);
      if (length > 0) {
        const nx = player.position.x + (moveX / length) * 5.2 * dt;
        const nz = player.position.z + (moveZ / length) * 5.2 * dt;
        let personBlocked = Math.abs(nx) > 103 || Math.abs(nz) > 103;
        for (const obstacle of buildingColliders) {
          if (Math.abs(nx - obstacle.x) < obstacle.halfW + 0.35 && Math.abs(nz - obstacle.z) < obstacle.halfD + 0.35) { personBlocked = true; break; }
        }
        if (!personBlocked) for (const walker of pedestrians) {
          const px = walker.mesh.position.x, pz = walker.mesh.position.z;
          if (Math.hypot(nx - px, nz - pz) < 0.9) { personBlocked = true; break; }
        }
        for (const actor of traffic) {
          if (Math.hypot(nx - actor.x, nz - actor.z) < actor.radius + 0.65) { personBlocked = true; break; }
        }
        if (!personBlocked) { player.position.x = nx; player.position.z = nz; }
        playerHeading = Math.atan2(moveX, moveZ);
        walkPhase += dt * 7.5;
      }
      player.rotation.y = playerHeading;
      const gait = length > 0 ? Math.sin(walkPhase) * 0.42 : 0;
      playerLimbs[0].rotation.x = gait; playerLimbs[1].rotation.x = -gait;
      playerLimbs[2].rotation.x = -gait; playerLimbs[3].rotation.x = gait;
      velocity = 0;
      speedLabel.textContent = 'WALK';
      const actionButton = document.querySelector<HTMLButtonElement>('[data-action="toggle"]');
      if (actionButton) actionButton.textContent = Math.hypot(player.position.x - car.position.x, player.position.z - car.position.z) < 4.2 ? 'ENTER' : 'WALK';
    } else {
      if (forward) velocity = Math.min(velocity + 15 * dt, 24);
      else if (reverse) velocity = Math.max(velocity - 12 * dt, -7);
      else velocity *= Math.pow(0.965, dt * 60);
      if (brake) velocity *= Math.pow(0.82, dt * 60);
      const steerInput = (left ? 1 : 0) - (right ? 1 : 0);
      steer = THREE.MathUtils.lerp(steer, steerInput, 5 * dt);
      car.rotation.y += steer * (velocity / 24) * 1.65 * dt;
      const nextX = car.position.x + Math.sin(car.rotation.y) * velocity * dt;
      const nextZ = car.position.z + Math.cos(car.rotation.y) * velocity * dt;
      let blocked = Math.abs(nextX) > 105 || Math.abs(nextZ) > 105 || hitsBuilding(nextX, nextZ, 1.35);
      for (const actor of traffic) {
        const dx = nextX - actor.x, dz = nextZ - actor.z;
        if (dx * dx + dz * dz < (actor.radius + 1.25) ** 2) { blocked = true; break; }
      }
      if (!blocked) { car.position.x = nextX; car.position.z = nextZ; }
      else velocity *= -0.12;
      speedLabel.textContent = String(Math.round(Math.abs(velocity) * 3.6)).padStart(3, '0');
      const actionButton = document.querySelector<HTMLButtonElement>('[data-action="toggle"]');
      if (actionButton) actionButton.textContent = 'EXIT';
    }
    // Ambient traffic creeps along the local roads, then loops within the compact map.
    for (const actor of traffic) {
      const verticalRoad = Math.abs(actor.yaw) < 0.01 || Math.abs(Math.abs(actor.yaw) - Math.PI) < 0.01;
      let nx = actor.x + (verticalRoad ? 0 : Math.sin(actor.yaw) * actor.speed * dt);
      let nz = actor.z + (verticalRoad ? Math.cos(actor.yaw) * actor.speed * dt : 0);
      if (nx > 108) nx = -108; if (nx < -108) nx = 108;
      if (nz > 108) nz = -108; if (nz < -108) nz = 108;
      let trafficBlocked = false;
      for (const other of traffic) {
        if (other === actor) continue;
        const otherVertical = Math.abs(other.yaw) < 0.01 || Math.abs(Math.abs(other.yaw) - Math.PI) < 0.01;
        if (verticalRoad === otherVertical && Math.hypot(nx - other.x, nz - other.z) < actor.radius + other.radius + 1.1) {
          trafficBlocked = true; break;
        }
      }
      const activeX = onFoot ? player.position.x : car.position.x;
      const activeZ = onFoot ? player.position.z : car.position.z;
      if (Math.hypot(nx - activeX, nz - activeZ) < actor.radius + (onFoot ? 1.1 : 2.4)) trafficBlocked = true;
      if (!trafficBlocked) { actor.x = nx; actor.z = nz; }
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
  }
  const focus = onFoot ? player.position : car.position;
  const heading = onFoot ? playerHeading : car.rotation.y;
  const followDistance = onFoot ? 6.2 : 10;
  const followHeight = onFoot ? 3.5 : 5.2;
  desiredCamera.set(focus.x - Math.sin(heading) * followDistance, focus.y + followHeight, focus.z - Math.cos(heading) * followDistance);
  camera.position.lerp(desiredCamera, 1 - Math.exp(-4 * dt));
  camera.lookAt(focus.x, focus.y + (onFoot ? 1.25 : 1), focus.z);
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setSize(innerWidth, innerHeight);
});
