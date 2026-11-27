import * as THREE from 'three';

type TrafficVehicle = { group: THREE.Group; route: number; distance: number; speed: number; wheelMeshes: THREE.Mesh[] };

const routes = [
  [new THREE.Vector3(-105, 0, -5.5), new THREE.Vector3(105, 0, -5.5), new THREE.Vector3(105, 0, 5.5), new THREE.Vector3(-105, 0, 5.5)],
  [new THREE.Vector3(5.5, 0, -105), new THREE.Vector3(5.5, 0, 105), new THREE.Vector3(-5.5, 0, 105), new THREE.Vector3(-5.5, 0, -105)]
];
const lengths = routes.map(route => route.reduce((sum, p, i) => sum + p.distanceTo(route[(i + 1) % route.length]), 0));

function at(routeIndex: number, distance: number) {
  const route = routes[routeIndex];
  let d = distance % lengths[routeIndex];
  for (let i = 0; i < route.length; i++) {
    const a = route[i], b = route[(i + 1) % route.length];
    const len = a.distanceTo(b);
    if (d <= len) return { p: a.clone().lerp(b, d / len), dir: b.clone().sub(a).normalize() };
    d -= len;
  }
  return { p: route[0].clone(), dir: new THREE.Vector3(1, 0, 0) };
}

const mat = (color: string, roughness = 0.82, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
function part(group: THREE.Group, geo: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number, scale?: THREE.Vector3) {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  if (scale) mesh.scale.copy(scale);
  mesh.castShadow = true; mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}
function box(group: THREE.Group, w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number) {
  return part(group, new THREE.BoxGeometry(w, h, d), material, x, y, z);
}
function wheels(group: THREE.Group, wheelMeshes: THREE.Mesh[], wheelbase: number, width: number, radius: number, count = 4) {
  const geo = new THREE.CylinderGeometry(radius, radius, 0.18, 12);
  const rubber = mat('#202326', 1);
  const xs = count === 3 ? [0] : [-width / 2, width / 2];
  const zs = count === 3 ? [-wheelbase / 2, wheelbase / 2, wheelbase / 2] : [-wheelbase / 2, wheelbase / 2];
  xs.forEach((x, xi) => zs.forEach((z, zi) => {
    if (count === 3 && xi !== 0) return;
    const w = part(group, geo, rubber, x, radius, z);
    w.rotation.z = Math.PI / 2;
    wheelMeshes.push(w);
  }));
}
function sedan(group: THREE.Group, wheelsOut: THREE.Mesh[], color: string) {
  const paint = mat(color, 0.55, 0.12), glass = mat('#243b48', 0.24, 0.18);
  box(group, 1.9, 0.62, 3.75, paint, 0, 0.72, 0);
  box(group, 1.55, 0.65, 1.75, glass, 0, 1.3, -0.18);
  box(group, 1.68, 0.12, 0.18, mat('#fff1c8'), 0, 0.78, 1.9);
  box(group, 1.68, 0.12, 0.16, mat('#c94436'), 0, 0.76, -1.9);
  wheels(group, wheelsOut, 2.45, 1.95, 0.34);
}
function cng(group: THREE.Group, wheelsOut: THREE.Mesh[]) {
  const green = mat('#16884c', 0.72), black = mat('#24282a'), hood = mat('#d7d6c8');
  // Bangladesh-style three-wheeler: narrow front, passenger canopy and open sides.
  box(group, 1.18, 0.38, 1.15, green, 0, 0.62, 0.48);
  box(group, 1.38, 0.78, 1.55, green, 0, 1.2, -0.55);
  box(group, 1.12, 0.1, 1.35, mat('#252c2c'), 0, 1.66, -0.55);
  box(group, 1.05, 0.55, 0.08, mat('#b9d5d4', 0.28), 0, 1.2, -1.32);
  box(group, 0.12, 0.6, 1.38, black, -0.66, 1.16, -0.55);
  box(group, 0.12, 0.6, 1.38, black, 0.66, 1.16, -0.55);
  box(group, 0.62, 0.24, 0.62, hood, 0, 0.83, 0.78);
  const geo = new THREE.CylinderGeometry(0.3, 0.3, 0.16, 12), rubber = mat('#202326', 1);
  const front = part(group, geo, rubber, 0, 0.3, 1.05); front.rotation.z = Math.PI / 2; wheelsOut.push(front);
  for (const x of [-0.68, 0.68]) { const w = part(group, geo, rubber, x, 0.3, -0.82); w.rotation.z = Math.PI / 2; wheelsOut.push(w); }
}
function rickshaw(group: THREE.Group, wheelsOut: THREE.Mesh[]) {
  const frame = mat('#cf352f', 0.75), canopy = mat('#dbb447'), seat = mat('#243c35');
  box(group, 0.82, 0.16, 1.9, frame, 0, 0.56, -0.08);
  box(group, 0.7, 0.14, 0.7, seat, 0, 0.78, -0.28);
  // Decorative curved-looking canopy approximated with bright roof and side supports.
  box(group, 1.02, 0.12, 1.35, canopy, 0, 1.72, -0.28);
  for (const x of [-0.42, 0.42]) for (const z of [-0.82, 0.34]) box(group, 0.06, 0.88, 0.06, frame, x, 1.22, z);
  const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.12, 12), rubber = mat('#202326', 1);
  const rear = part(group, wheelGeo, rubber, 0, 0.36, -0.94); rear.rotation.z = Math.PI / 2; wheelsOut.push(rear);
  for (const x of [-0.52, 0.52]) { const w = part(group, wheelGeo, rubber, x, 0.3, 0.68); w.rotation.z = Math.PI / 2; wheelsOut.push(w); }
  box(group, 0.08, 0.48, 0.08, frame, 0, 0.88, 1.0);
}
function bus(group: THREE.Group, wheelsOut: THREE.Mesh[]) {
  const paint = mat('#e5d9c4', 0.68), green = mat('#16824a'), glass = mat('#2c4655', 0.25);
  box(group, 2.35, 2.15, 7.0, paint, 0, 1.45, 0);
  box(group, 2.38, 0.42, 7.02, green, 0, 0.55, 0);
  for (let z = -2.55; z <= 2.6; z += 1.28) {
    box(group, 0.08, 0.58, 0.9, glass, -1.2, 1.95, z);
    box(group, 0.08, 0.58, 0.9, glass, 1.2, 1.95, z);
  }
  box(group, 1.8, 0.62, 0.08, glass, 0, 2.0, 3.52);
  box(group, 1.8, 0.52, 0.08, glass, 0, 1.9, -3.52);
  wheels(group, wheelsOut, 4.8, 2.35, 0.48);
}
function microbus(group: THREE.Group, wheelsOut: THREE.Mesh[]) {
  const paint = mat('#d5d6d0', 0.62), glass = mat('#2b4655', 0.25);
  box(group, 2.05, 1.65, 5.1, paint, 0, 1.25, 0);
  box(group, 1.78, 0.75, 3.2, glass, 0, 1.85, -0.2);
  box(group, 1.88, 0.18, 0.16, mat('#e9e3d5'), 0, 0.85, 2.58);
  wheels(group, wheelsOut, 3.4, 2.05, 0.38);
}
function buildVehicle(kind: number, color: string, group: THREE.Group, wheelMeshes: THREE.Mesh[]) {
  switch (kind % 5) {
    case 0: sedan(group, wheelMeshes, color); break;
    case 1: cng(group, wheelMeshes); break;
    case 2: rickshaw(group, wheelMeshes); break;
    case 3: bus(group, wheelMeshes); break;
    default: microbus(group, wheelMeshes); break;
  }
}

export function addAmbientTraffic(scene: THREE.Scene, count = 8) {
  const cars: TrafficVehicle[] = [];
  const colors = ['#c84f3d', '#d5d1c6', '#3d627d', '#d0a33f', '#46534b', '#f2f0e7'];
  for (let i = 0; i < count; i++) {
    const group = new THREE.Group();
    const wheelMeshes: THREE.Mesh[] = [];
    buildVehicle(i, colors[i % colors.length], group, wheelMeshes);
    group.traverse(o => { if (o instanceof THREE.Mesh) { o.castShadow = true; o.receiveShadow = true; } });
    const route = i % 2;
    cars.push({ group, route, distance: lengths[route] * (i + 1) / (count + 1), speed: [6.3, 4.1, 2.5, 4.4, 5.5][i % 5], wheelMeshes });
    scene.add(group);
  }
  return {
    update(dt: number) {
      for (const car of cars) {
        car.distance += car.speed * dt;
        const { p, dir } = at(car.route, car.distance);
        car.group.position.set(p.x, 0.12, p.z);
        car.group.rotation.y = Math.atan2(dir.x, dir.z);
        for (const wheel of car.wheelMeshes) wheel.rotation.x += car.speed * dt / 0.34;
      }
    }
  };
}
