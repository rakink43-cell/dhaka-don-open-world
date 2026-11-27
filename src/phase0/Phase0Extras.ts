import * as THREE from 'three';

export type VehicleMode = 'SEDAN' | 'CNG';

export function addDhanmondiLoop(scene: THREE.Scene): THREE.Box3[] {
  const curbBounds: THREE.Box3[] = [];
  const roadMaterial = new THREE.MeshStandardMaterial({ color: '#3b4145', roughness: 0.96 });
  const curbMaterial = new THREE.MeshStandardMaterial({ color: '#c7c4b9', roughness: 1 });
  const waterMaterial = new THREE.MeshStandardMaterial({ color: '#4d9da8', roughness: 0.32, metalness: 0.05 });
  const cx = 58;
  const cz = -58;

  const road = (w: number, d: number, x: number, z: number) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, d), roadMaterial);
    mesh.position.set(x, 0.12, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
  };
  // A compact four-sided neighborhood loop around a small lake.
  road(112, 10, cx, cz - 51);
  road(112, 10, cx, cz + 51);
  road(10, 92, cx - 51, cz);
  road(10, 92, cx + 51, cz);

  const curb = (w: number, d: number, x: number, z: number) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, d), curbMaterial);
    mesh.position.set(x, 0.19, z);
    scene.add(mesh);
    curbBounds.push(new THREE.Box3().setFromObject(mesh));
  };
  curb(94, 1.2, cx, cz - 44);
  curb(94, 1.2, cx, cz + 44);
  curb(1.2, 78, cx - 44, cz);
  curb(1.2, 78, cx + 44, cz);

  const lake = new THREE.Mesh(new THREE.PlaneGeometry(62, 48), waterMaterial);
  lake.rotation.x = -Math.PI / 2;
  lake.position.set(cx, 0.17, cz);
  scene.add(lake);

  // Simple local road markings around the loop.
  const marking = new THREE.MeshStandardMaterial({ color: '#e8e2ce', roughness: 1 });
  for (let i = -42; i <= 42; i += 12) {
    for (const z of [cz - 51, cz + 51]) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.025, 0.18), marking);
      dash.position.set(cx + i, 0.205, z);
      scene.add(dash);
    }
    for (const x of [cx - 51, cx + 51]) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 4.2), marking);
      dash.position.set(x, 0.205, cz + i);
      scene.add(dash);
    }
  }

  // Four low-poly street lamps, shared geometry/material.
  const poleGeometry = new THREE.CylinderGeometry(0.12, 0.16, 5.4, 6);
  const poleMaterial = new THREE.MeshStandardMaterial({ color: '#515a5d', roughness: 0.8 });
  const lampGeometry = new THREE.BoxGeometry(0.8, 0.18, 0.3);
  const lampMaterial = new THREE.MeshStandardMaterial({ color: '#f4dca0', emissive: '#b68b3e', emissiveIntensity: 0.45 });
  for (const [x, z] of [[cx - 36, cz - 36], [cx + 36, cz - 36], [cx - 36, cz + 36], [cx + 36, cz + 36]]) {
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(x, 2.8, z);
    scene.add(pole);
    const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
    lamp.position.set(x, 5.45, z);
    scene.add(lamp);
  }
  return curbBounds;
}

export function installCngSwitch(car: THREE.Group) {
  const sedanParts = [...car.children];
  const cng = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color: '#24834d', roughness: 0.48, metalness: 0.08 });
  const dark = new THREE.MeshStandardMaterial({ color: '#202b2d', roughness: 0.7 });
  const glass = new THREE.MeshStandardMaterial({ color: '#29434b', roughness: 0.28, metalness: 0.1 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.68, 2.75), paint);
  body.position.y = 0.78;
  body.castShadow = true;
  cng.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.72, 1.65), glass);
  cabin.position.set(0, 1.42, -0.15);
  cabin.castShadow = true;
  cng.add(cabin);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.16, 1.8), paint);
  roof.position.set(0, 1.82, -0.15);
  cng.add(roof);
  const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.22, 12);
  const wheels: THREE.Mesh[] = [];
  for (const [x, z] of [[-0.78, -0.92], [0.78, -0.92], [0, 1.12]]) {
    const wheel = new THREE.Mesh(wheelGeo, dark);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.38, z);
    cng.add(wheel);
    wheels.push(wheel);
  }
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.18, 0.18), dark);
  bumper.position.set(0, 0.48, 1.4);
  cng.add(bumper);
  car.add(cng);
  cng.visible = false;

  let mode: VehicleMode = 'SEDAN';
  let toggleWasDown = false;
  return {
    get mode() { return mode; },
    get maxSpeed() { return mode === 'SEDAN' ? 24 : 15; },
    get label() { return mode === 'SEDAN' ? 'SEDAN' : 'CNG AUTO-RICKSHAW'; },
    update(keys: Set<string>) {
      const down = keys.has('KeyV') || keys.has('v');
      if (down && !toggleWasDown) {
        mode = mode === 'SEDAN' ? 'CNG' : 'SEDAN';
        sedanParts.forEach(part => { part.visible = mode === 'SEDAN'; });
        cng.visible = mode === 'CNG';
      }
      toggleWasDown = down;
    }
  };
}
