import * as THREE from 'three';

type Walker = {
  group: THREE.Group;
  phase: number;
  speed: number;
  route: number;
  legL: THREE.Mesh;
  legR: THREE.Mesh;
  armL: THREE.Mesh;
  armR: THREE.Mesh;
};

const routes = [
  [new THREE.Vector3(-76, 0, -12), new THREE.Vector3(76, 0, -12), new THREE.Vector3(76, 0, 12), new THREE.Vector3(-76, 0, 12)],
  [new THREE.Vector3(-12, 0, -76), new THREE.Vector3(12, 0, -76), new THREE.Vector3(12, 0, 76), new THREE.Vector3(-12, 0, 76)],
  [new THREE.Vector3(22, 0, -96), new THREE.Vector3(96, 0, -96), new THREE.Vector3(96, 0, -22), new THREE.Vector3(22, 0, -22)]
];

const routeLengths = routes.map(route => {
  let total = 0;
  for (let i = 0; i < route.length; i++) total += route[i].distanceTo(route[(i + 1) % route.length]);
  return total;
});

function segmentAt(routeIndex: number, distance: number) {
  const route = routes[routeIndex];
  let remaining = distance % routeLengths[routeIndex];
  for (let i = 0; i < route.length; i++) {
    const a = route[i];
    const b = route[(i + 1) % route.length];
    const length = a.distanceTo(b);
    if (remaining <= length) {
      return { position: a.clone().lerp(b, length > 0 ? remaining / length : 0), direction: b.clone().sub(a).normalize() };
    }
    remaining -= length;
  }
  return { position: route[0].clone(), direction: new THREE.Vector3(1, 0, 0) };
}

export function addPedestrians(scene: THREE.Scene, count = 26) {
  const walkers: Walker[] = [];
  const skinColors = ['#8d5a3c', '#b87951', '#d39a70', '#70452f'];
  const shirtColors = ['#2f6f83', '#b84c3f', '#d0a33f', '#4e7854', '#e4e0d5', '#62517e', '#293b4b'];
  const pantsColors = ['#26313b', '#41464b', '#5a4b3d', '#263f36'];
  const box = new THREE.BoxGeometry(1, 1, 1);
  const sphere = new THREE.SphereGeometry(0.22, 10, 8);
  const limbGeometry = new THREE.BoxGeometry(0.14, 0.52, 0.14);

  for (let i = 0; i < count; i++) {
    const group = new THREE.Group();
    const shirt = new THREE.MeshStandardMaterial({ color: shirtColors[i % shirtColors.length], roughness: 0.85 });
    const pants = new THREE.MeshStandardMaterial({ color: pantsColors[i % pantsColors.length], roughness: 0.9 });
    const skin = new THREE.MeshStandardMaterial({ color: skinColors[i % skinColors.length], roughness: 0.9 });
    const hair = new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? '#211d1a' : '#30251f', roughness: 1 });

    const torso = new THREE.Mesh(box, shirt);
    torso.scale.set(0.42, 0.62, 0.24);
    torso.position.y = 1.05;
    group.add(torso);

    const head = new THREE.Mesh(sphere, skin);
    head.scale.set(0.86, 1.05, 0.86);
    head.position.y = 1.52;
    group.add(head);
    const hairCap = new THREE.Mesh(sphere, hair);
    hairCap.scale.set(0.9, 0.45, 0.9);
    hairCap.position.set(0, 1.68, -0.015);
    group.add(hairCap);

    const legL = new THREE.Mesh(limbGeometry, pants);
    const legR = new THREE.Mesh(limbGeometry, pants);
    legL.position.set(-0.12, 0.48, 0);
    legR.position.set(0.12, 0.48, 0);
    group.add(legL, legR);

    const armL = new THREE.Mesh(limbGeometry, shirt);
    const armR = new THREE.Mesh(limbGeometry, shirt);
    armL.scale.set(0.85, 1, 0.85);
    armR.scale.set(0.85, 1, 0.85);
    armL.position.set(-0.29, 1.05, 0);
    armR.position.set(0.29, 1.05, 0);
    group.add(armL, armR);

    group.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    const route = i % routes.length;
    const phase = (routeLengths[route] * (Math.floor(i / routes.length) + 0.35) / Math.ceil(count / routes.length)) % routeLengths[route];
    const walker: Walker = { group, phase, speed: 1.05 + (i % 5) * 0.16, route, legL, legR, armL, armR };
    walkers.push(walker);
    scene.add(group);
  }

  return {
    update(dt: number) {
      for (const walker of walkers) {
        walker.phase += walker.speed * dt;
        const { position, direction } = segmentAt(walker.route, walker.phase);
        walker.group.position.set(position.x, 0.12, position.z);
        walker.group.rotation.y = Math.atan2(direction.x, direction.z);
        const swing = Math.sin(walker.phase * 5.2) * 0.42;
        walker.legL.rotation.x = swing;
        walker.legR.rotation.x = -swing;
        walker.armL.rotation.x = -swing * 0.72;
        walker.armR.rotation.x = swing * 0.72;
      }
    }
  };
}
