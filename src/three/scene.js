import * as THREE from 'three';

const PURPLE = 0x8B3DFF;
const PINK   = 0xFF1B6B;
const ORANGE = 0xFF8C00;

/* ══════════════════════════════════════════════════════════
   INTRO SCENE — Floating particles orbiting around center
   ══════════════════════════════════════════════════════════ */
export function initIntroScene() {
  const canvas = document.getElementById('intro-canvas');
  if (!canvas) return () => {};

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particles orbiting center — creates "film reel dust" feel
  const count = 800;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [new THREE.Color(PURPLE), new THREE.Color(PINK), new THREE.Color(ORANGE)];

  for (let i = 0; i < count; i++) {
    // Distribute on a torus shape (ring pattern)
    const angle  = Math.random() * Math.PI * 2;
    const radius = 2.5 + Math.random() * 2;
    const ySpread = (Math.random() - 0.5) * 1.5;
    positions[i * 3]     = Math.cos(angle) * radius;
    positions[i * 3 + 1] = ySpread;
    positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 2;

    const c = palette[Math.floor(Math.random() * 3)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.025, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // Outer wireframe ring
  const ringGeo = new THREE.TorusGeometry(3.5, 0.015, 4, 120);
  const ringMat = new THREE.MeshBasicMaterial({ color: PURPLE, transparent: true, opacity: 0.15 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI * 0.5;
  scene.add(ring);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let elapsed = 0;
  return function renderIntro(delta = 0.016) {
    elapsed += delta;
    particles.rotation.y = elapsed * 0.15;
    particles.rotation.x = Math.sin(elapsed * 0.1) * 0.1;
    ring.rotation.z = elapsed * 0.08;
    renderer.render(scene, camera);
  };
}

/* ══════════════════════════════════════════════════════════
   HERO SCENE — Film reel torus + torus knot + rings + particles
   ══════════════════════════════════════════════════════════ */
export function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const purpleLight = new THREE.PointLight(PURPLE, 4, 12);
  purpleLight.position.set(-3, 2, 3);
  scene.add(purpleLight);
  const pinkLight = new THREE.PointLight(PINK, 4, 12);
  pinkLight.position.set(3, -1, 2);
  scene.add(pinkLight);
  const orangeLight = new THREE.PointLight(ORANGE, 2, 8);
  orangeLight.position.set(0, -3, 1);
  scene.add(orangeLight);

  // Main Torus (film reel)
  const torusGeo = new THREE.TorusGeometry(1.4, 0.4, 24, 80);
  const torusMat = new THREE.MeshStandardMaterial({
    color: 0x1a0a2e, roughness: 0.2, metalness: 0.9,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.rotation.x = Math.PI * 0.1;
  scene.add(torus);

  // Wireframe overlay
  const wireMat = new THREE.MeshBasicMaterial({ color: PURPLE, wireframe: true, transparent: true, opacity: 0.12 });
  const wireTorus = new THREE.Mesh(torusGeo, wireMat);
  wireTorus.rotation.copy(torus.rotation);
  scene.add(wireTorus);

  // Inner Torus Knot
  const knotGeo = new THREE.TorusKnotGeometry(0.55, 0.18, 100, 16);
  const knotMat = new THREE.MeshStandardMaterial({ color: 0x0d0020, roughness: 0.1, metalness: 1.0 });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  scene.add(knot);

  // Floating Rings
  const rings = [];
  [
    { r: 2.2, tube: 0.02, color: PINK,   rot: [0.3, 0, 0.5] },
    { r: 2.8, tube: 0.015, color: PURPLE, rot: [0.8, 0.4, 0] },
    { r: 3.5, tube: 0.01,  color: ORANGE, rot: [1.2, 0.2, 0.8] },
  ].forEach(d => {
    const geo = new THREE.TorusGeometry(d.r, d.tube, 6, 100);
    const mat = new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.5 });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.set(...d.rot);
    scene.add(ring);
    rings.push(ring);
  });

  // Particles
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 600 : 2500;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [new THREE.Color(PURPLE), new THREE.Color(PINK), new THREE.Color(ORANGE)];
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    const c = palette[Math.floor(Math.random() * 3)];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.025, vertexColors: true, transparent: true, opacity: 0.75, sizeAttenuation: true });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // Mouse tracking
  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  let elapsed = 0;
  return function renderHero(delta = 0.016) {
    elapsed += delta;
    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;

    torus.rotation.y = elapsed * 0.25 + targetX * 0.6;
    torus.rotation.x = Math.PI * 0.1 + targetY * 0.3;
    wireTorus.rotation.copy(torus.rotation);
    knot.rotation.x = elapsed * 0.4;
    knot.rotation.z = elapsed * 0.3;

    rings[0].rotation.z += 0.003;
    rings[1].rotation.x += 0.002;
    rings[2].rotation.y += 0.0015;

    particles.rotation.y = elapsed * 0.04;
    particles.rotation.x = elapsed * 0.02;

    purpleLight.position.x = Math.sin(elapsed * 0.6) * 4;
    purpleLight.position.y = Math.cos(elapsed * 0.4) * 3;
    pinkLight.position.x = Math.cos(elapsed * 0.5) * 4;
    pinkLight.position.z = Math.sin(elapsed * 0.7) * 3;

    renderer.render(scene, camera);
  };
}

/* ══════════════════════════════════════════════════════════
   CONTACT SCENE — Floating wireframe icosahedra
   ══════════════════════════════════════════════════════════ */
export function initContactScene() {
  const canvas = document.getElementById('contact-canvas');
  if (!canvas) return () => {};

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
  camera.position.z = 4;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.setPixelRatio(1);

  const group = new THREE.Group();
  const icoGeo = new THREE.IcosahedronGeometry(0.15, 0);
  const cols = [PURPLE, PINK, ORANGE];

  for (let i = 0; i < 15; i++) {
    const mat  = new THREE.MeshBasicMaterial({ color: cols[i % 3], wireframe: true, transparent: true, opacity: 0.35 });
    const mesh = new THREE.Mesh(icoGeo, mat);
    mesh.position.set((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3);
    mesh.userData.speed  = 0.3 + Math.random() * 0.5;
    mesh.userData.offset = Math.random() * Math.PI * 2;
    group.add(mesh);
  }
  scene.add(group);

  window.addEventListener('resize', () => {
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
    camera.updateProjectionMatrix();
  });

  let elapsed = 0;
  return function renderContact(delta = 0.016) {
    elapsed += delta;
    group.children.forEach(mesh => {
      mesh.rotation.x += mesh.userData.speed * 0.02;
      mesh.rotation.y += mesh.userData.speed * 0.015;
      mesh.position.y = mesh.userData.offset + Math.sin(elapsed * mesh.userData.speed) * 0.4;
    });
    renderer.render(scene, camera);
  };
}
