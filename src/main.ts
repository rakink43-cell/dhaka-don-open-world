import * as THREE from 'three';
import './style.css';
import { addDhanmondiLoop, installCngSwitch } from './phase0/Phase0Extras';
import { addPedestrians } from './phase0/Pedestrians';
import { addAmbientTraffic } from './phase0/AmbientTraffic';

const mount = document.querySelector<HTMLDivElement>('#game-canvas-wrap')!;
const speedLabel = document.querySelector<HTMLElement>('#speed')!;
const roadStatus = document.querySelector<HTMLElement>('#road-status')!;
const introCard = document.querySelector<HTMLElement>('#intro-card')!;
const startButton = document.querySelector<HTMLButtonElement>('#start-button')!;
const pauseButton = document.querySelector<HTMLButtonElement>('#pause-button')!;
const recoverButton = document.querySelector<HTMLButtonElement>('#recover-button')!;
const touchResetButton = document.querySelector<HTMLButtonElement>('#touch-reset')!;
const pauseOverlay = document.querySelector<HTMLElement>('#pause-overlay')!;
const resumeButton = document.querySelector<HTMLButtonElement>('#resume-button')!;

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

// Add a small Dhanmondi-inspired loop and lake as a second drivable district.
const loopCurbBounds = addDhanmondiLoop(scene);

// Low-poly Dhaka-inspired building blocks with colorful shop-level accents.
const solidBuildings: THREE.Box3[] = [];
const buildingMeshes: THREE.Mesh[] = [];
const palette = ['#c8b49b', '#d8c9ad', '#b7c1b8', '#d0b6a5', '#9faeb2', '#d8d1bf'];
let seed = 17;
const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
for (let x = -78; x <= 78; x += 26) {
  for (let z = -78; z <= 78; z += 26) {
    if (Math.abs(x) < 18 || Math.abs(z) < 18) continue;
    // Keep the lake-loop district clear so its roads and water remain visible.
    if (x >= 20 && x <= 96 && z <= -20 && z >= -96) continue;
    const w = 13 + random() * 7;
    const d = 13 + random() * 7;
    const h = 8 + random() * 28;
    const building = box(w, h, d, palette[Math.floor(random() * palette.length)], x, 0.14, z);
    solidBuildings.push(new THREE.Box3().setFromObject(building));
    buildingMeshes.push(building);
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
const vehicle = installCngSwitch(car);
const pedestrians = addPedestrians(scene, 26);
const ambientTraffic = addAmbientTraffic(scene, 5);

const keys = new Set<string>();
let started = false;
let paused = false;
let velocity = 0;
let steer = 0;
addEventListener('keydown', (e) => {
  if (e.code === 'KeyR' && started && !paused) { resetCar(); return; }
  if (e.code === 'Escape') {
    e.preventDefault();
    if (started) setPaused(!paused);
    return;
  }
  keys.add(e.code);
  keys.add(e.key.toLowerCase());
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', (e) => { keys.delete(e.code); keys.delete(e.key.toLowerCase()); });
addEventListener('blur', () => keys.clear());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    keys.clear();
    if (started) setPaused(true);
  }
});
const releaseTouchKeys = () => document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(button => keys.delete(button.dataset.key!));
document.addEventListener('pointerup', releaseTouchKeys);
document.addEventListener('pointercancel', releaseTouchKeys);
document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(button => {
  const key = button.dataset.key!;
  const down = (e: Event) => { e.preventDefault(); keys.add(key); };
  const up = (e: Event) => { e.preventDefault(); keys.delete(key); };
  button.addEventListener('pointerdown', down);
  button.addEventListener('pointerup', up);
  button.addEventListener('pointerleave', up);
  button.addEventListener('pointercancel', up);
});

function setPaused(next: boolean) {
  if (!started) return;
  paused = next;
  keys.clear();
  pauseOverlay.classList.toggle('hidden', !paused);
  pauseOverlay.setAttribute('aria-hidden', String(!paused));
  pauseButton.textContent = paused ? 'RESUME' : 'PAUSE';
  pauseButton.setAttribute('aria-label', paused ? 'Resume game' : 'Pause game');
}
function resetCar() {
  car.position.set(0, 0.1, 5);
  car.rotation.set(0, 0, 0);
  velocity = 0;
  steer = 0;
  keys.clear();
  speedLabel.textContent = '000';
  roadStatus.textContent = 'ROAD';
  roadStatus.classList.remove('off-road');
}
recoverButton.addEventListener('click', resetCar);
touchResetButton.addEventListener('click', resetCar);
startButton.addEventListener('click', () => { started = true; introCard.classList.add('hidden'); setPaused(false); });
pauseButton.addEventListener('click', () => setPaused(!paused));
resumeButton.addEventListener('click', () => setPaused(false));

const desiredCamera = new THREE.Vector3();
const lakeBounds = new THREE.Box2(
  new THREE.Vector2(58 - 31, -58 - 24),
  new THREE.Vector2(58 + 31, -58 + 24)
);
function overlapsLake(position: THREE.Vector3) {
  const footprint = getVehicleFootprint(position);
  return footprint.max.x > lakeBounds.min.x && footprint.min.x < lakeBounds.max.x &&
    footprint.max.y > lakeBounds.min.y && footprint.min.y < lakeBounds.max.y;
}
function getVehicleFootprint(position: THREE.Vector3) {
  const halfWidth = 1.2;
  const halfLength = vehicle.mode === 'SEDAN' ? 2.25 : 1.65;
  const sin = Math.abs(Math.sin(car.rotation.y));
  const cos = Math.abs(Math.cos(car.rotation.y));
  const extentX = cos * halfWidth + sin * halfLength;
  const extentZ = sin * halfWidth + cos * halfLength;
  return new THREE.Box2(new THREE.Vector2(position.x - extentX, position.z - extentZ), new THREE.Vector2(position.x + extentX, position.z + extentZ));
}
function hitsBuilding(position: THREE.Vector3) {
  const footprint = getVehicleFootprint(position);
  return solidBuildings.some(bounds =>
    footprint.max.x > bounds.min.x && footprint.min.x < bounds.max.x &&
    footprint.max.y > bounds.min.z && footprint.min.y < bounds.max.z
  );
}
const drivableRoads = [
  { minX: -9, maxX: 9, minZ: -120, maxZ: 120 },
  { minX: -120, maxX: 120, minZ: -9, maxZ: 9 },
  { minX: 2, maxX: 114, minZ: -114, maxZ: -104 },
  { minX: 2, maxX: 114, minZ: -12, maxZ: -2 },
  { minX: 2, maxX: 12, minZ: -104, maxZ: -12 },
  { minX: 104, maxX: 114, minZ: -104, maxZ: -12 },
  { minX: 53, maxX: 63, minZ: -29, maxZ: 9 },
  { minX: 29, maxX: 87, minZ: -63, maxZ: -53 }
];
function roadCoverage(position: THREE.Vector3) {
  const footprint = getVehicleFootprint(position);
  const width = footprint.max.x - footprint.min.x;
  const length = footprint.max.y - footprint.min.y;
  const footprintArea = Math.max(width * length, 0.001);

  // Sweep across the footprint and union the road intervals in each slice.
  // This avoids counting overlapping road rectangles twice at junctions.
  const xEdges = [footprint.min.x, footprint.max.x];
  for (const road of drivableRoads) {
    const left = Math.max(footprint.min.x, road.minX);
    const right = Math.min(footprint.max.x, road.maxX);
    if (right > left) xEdges.push(left, right);
  }
  xEdges.sort((a, b) => a - b);

  let coveredArea = 0;
  for (let i = 0; i < xEdges.length - 1; i++) {
    const left = xEdges[i];
    const right = xEdges[i + 1];
    const sliceWidth = right - left;
    if (sliceWidth <= 0.0001) continue;
    const middleX = (left + right) * 0.5;
    const intervals = drivableRoads
      .filter(road => middleX >= road.minX && middleX <= road.maxX)
      .map(road => ({
        min: Math.max(footprint.min.y, road.minZ),
        max: Math.min(footprint.max.y, road.maxZ)
      }))
      .filter(interval => interval.max > interval.min)
      .sort((a, b) => a.min - b.min);

    let coveredLength = 0;
    let intervalEnd = 0;
    for (const interval of intervals) {
      if (coveredLength === 0) {
        intervalEnd = interval.max;
        coveredLength = intervalEnd - interval.min;
      } else if (interval.min <= intervalEnd) {
        const added = Math.max(0, interval.max - intervalEnd);
        coveredLength += added;
        intervalEnd = Math.max(intervalEnd, interval.max);
      } else {
        coveredArea += sliceWidth * coveredLength;
        intervalEnd = interval.max;
        coveredLength = intervalEnd - interval.min;
      }
    }
    if (coveredLength > 0) coveredArea += sliceWidth * coveredLength;
  }
  return THREE.MathUtils.clamp(coveredArea / footprintArea, 0, 1);
}
function isOnRoad(position: THREE.Vector3) {
  return roadCoverage(position) >= 0.62;
}
function hitsLoopCurb(position: THREE.Vector3) {
  const footprint = getVehicleFootprint(position);
  return loopCurbBounds.some(bounds =>
    footprint.max.x > bounds.min.x && footprint.min.x < bounds.max.x &&
    footprint.max.y > bounds.min.z && footprint.min.y < bounds.max.z
  );
}
const cameraRaycaster = new THREE.Raycaster();
const cameraFocus = new THREE.Vector3();
const cameraDirection = new THREE.Vector3();
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.04);
  if (started && !paused) {
    pedestrians.update(dt);
    ambientTraffic.update(dt);
    vehicle.update(keys);
    velocity = THREE.MathUtils.clamp(velocity, -7, vehicle.maxSpeed);
    const forward = keys.has('KeyW') || keys.has('w') || keys.has('ArrowUp');
    const reverse = keys.has('KeyS') || keys.has('s') || keys.has('ArrowDown');
    const left = keys.has('KeyA') || keys.has('a') || keys.has('ArrowLeft');
    const right = keys.has('KeyD') || keys.has('d') || keys.has('ArrowRight');
    const brake = keys.has('Space');
    const onRoadBeforeMove = isOnRoad(car.position);
    const offRoadFactor = onRoadBeforeMove ? 1 : 0.42;
    if (forward) velocity = Math.min(velocity + 15 * offRoadFactor * dt, vehicle.maxSpeed * offRoadFactor);
    else if (reverse) velocity = Math.max(velocity - 12 * dt, -7);
    else velocity *= Math.pow(onRoadBeforeMove ? 0.982 : 0.90, dt * 60);
    // Braking is stronger and more predictable than rolling friction.
    if (brake) velocity *= Math.pow(0.72, dt * 60);
    // Keep reverse speed modest and prevent abrupt forward/reverse transitions.
    velocity = THREE.MathUtils.clamp(velocity, -7, vehicle.maxSpeed);
    const steerInput = (left ? 1 : 0) - (right ? 1 : 0);
    steer = THREE.MathUtils.lerp(steer, steerInput, 5 * dt);
    const speedFactor = THREE.MathUtils.clamp(Math.abs(velocity) / 8, 0, 1);
    car.rotation.y += steer * speedFactor * Math.sign(velocity || 1) * 1.35 * (onRoadBeforeMove ? 1 : 0.68) * dt;
    const moveX = Math.sin(car.rotation.y) * velocity * dt;
    const moveZ = Math.cos(car.rotation.y) * velocity * dt;
    const blocked = () => overlapsLake(car.position) || hitsBuilding(car.position) || hitsLoopCurb(car.position);

    // Resolve movement per axis: the car can slide along walls instead of
    // snapping backward whenever one corner touches an obstacle.
    const previousX = car.position.x;
    car.position.x = THREE.MathUtils.clamp(previousX + moveX, -120, 120);
    if (blocked()) {
      car.position.x = previousX;
      velocity *= 0.92;
    }
    const previousZ = car.position.z;
    car.position.z = THREE.MathUtils.clamp(previousZ + moveZ, -120, 120);
    if (blocked()) {
      car.position.z = previousZ;
      velocity *= 0.92;
    }
    const onRoadAfterMove = isOnRoad(car.position);
    roadStatus.textContent = onRoadAfterMove ? 'ROAD' : 'OFF-ROAD';
    roadStatus.classList.toggle('off-road', !onRoadAfterMove);
    speedLabel.textContent = String(Math.round(Math.abs(velocity) * 3.6)).padStart(3, '0');
    const vehicleName = document.querySelector<HTMLElement>('#vehicle-name');
    if (vehicleName) vehicleName.textContent = vehicle.label;
  }
  cameraFocus.set(car.position.x, car.position.y + 1.15, car.position.z);
  desiredCamera.set(car.position.x - Math.sin(car.rotation.y) * 10, car.position.y + 5.2, car.position.z - Math.cos(car.rotation.y) * 10);
  // Pull the follow camera forward when a building is between the car and camera.
  cameraDirection.copy(desiredCamera).sub(cameraFocus);
  const cameraDistance = cameraDirection.length();
  cameraDirection.normalize();
  cameraRaycaster.set(cameraFocus, cameraDirection);
  cameraRaycaster.far = cameraDistance;
  const cameraHits = cameraRaycaster.intersectObjects(buildingMeshes, false);
  const cameraTarget = desiredCamera.clone();
  if (cameraHits.length > 0) {
    cameraTarget.copy(cameraFocus).addScaledVector(cameraDirection, Math.max(2.8, cameraHits[0].distance - 0.65));
  }
  camera.position.lerp(cameraTarget, 1 - Math.exp(-6 * dt));
  camera.lookAt(cameraFocus);
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setSize(innerWidth, innerHeight);
});
