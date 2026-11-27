import * as THREE from 'three';

type TrafficCar = { group: THREE.Group; route: number; distance: number; speed: number };

const routes = [
  [new THREE.Vector3(-105, 0, -7), new THREE.Vector3(105, 0, -7), new THREE.Vector3(105, 0, 7), new THREE.Vector3(-105, 0, 7)],
  [new THREE.Vector3(7, 0, -105), new THREE.Vector3(7, 0, 105), new THREE.Vector3(-7, 0, 105), new THREE.Vector3(-7, 0, -105)]
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

export function addAmbientTraffic(scene: THREE.Scene, count = 5) {
  const cars: TrafficCar[] = [];
  const colors = ['#c84f3d', '#d5d1c6', '#3d627d', '#d0a33f', '#46534b'];
  for (let i = 0; i < count; i++) {
    const group = new THREE.Group();
    const paint = new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.65, metalness: 0.12 });
    const glass = new THREE.MeshStandardMaterial({ color: '#263b49', roughness: 0.25, metalness: 0.2 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.72, 3.9), paint);
    body.position.y = 0.72;
    group.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.68, 1.75), glass);
    cabin.position.set(0, 1.35, -0.15);
    group.add(cabin);
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 10);
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#202326', roughness: 1 });
    for (const x of [-1.02, 1.02]) for (const z of [-1.25, 1.25]) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.38, z);
      group.add(wheel);
    }
    group.traverse(o => { if (o instanceof THREE.Mesh) { o.castShadow = true; o.receiveShadow = true; } });
    const route = i % 2;
    cars.push({ group, route, distance: lengths[route] * (i + 1) / (count + 1), speed: 5.2 + (i % 3) * 1.1 });
    scene.add(group);
  }
  return {
    update(dt: number) {
      for (const car of cars) {
        car.distance += car.speed * dt;
        const { p, dir } = at(car.route, car.distance);
        car.group.position.set(p.x, 0.12, p.z);
        car.group.rotation.y = Math.atan2(dir.x, dir.z);
      }
    }
  };
}
