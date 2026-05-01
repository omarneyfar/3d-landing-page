import * as THREE from 'three';

// REELZ color palette in hex numbers
const PURPLE = 0x8B3DFF;
const PINK   = 0xFF1B6B;
const ORANGE = 0xFF8C00;

/* ─────────────────────────────────────────────────────────
   HERO SCENE — Film reel torus + floating rings + particles
   ───────────────────────────────────────────────────────── */
export function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  // ── Lights ───────────────────────────────────────────────
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

  // ── Main Hero Object: Torus (film reel) ──────────────────
  const torusGeo = new THREE.TorusGeometry(1.4, 0.4, 24, 80);
  const torusMat = new THREE.MeshStandardMaterial({
    color: 0x1a0a2e,
    roughness: 0.2,
    metalness: 0.9,
    envMapIntensity: 1,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.rotation.x = Math.PI * 0.1;
  scene.add(torus);

  // Wireframe overlay on torus
  const wireTorusMat = new THREE.MeshBasicMaterial({
    color: PURPLE,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const wireTorus = new THREE.Mesh(torusGeo, wireTorusMat);
  wireTorus.rotation.copy(torus.rotation);
  scene.add(wireTorus);

  // ── Inner Torus Knot (core detail) ───────────────────────
  const knotGeo = new THREE.TorusKnotGeometry(0.55, 0.18, 100, 16);
  const knotMat = new THREE.MeshStandardMaterial({
    color: 0x0d0020,
    roughness: 0.1,
    metalness: 1.0,
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  scene.add(knot);

  // ── Floating Rings ────────────────────────────────────────
  const rings = [];
  const ringData = [
    { r: 2.2, tube: 0.02, color: PINK,   pos: [0, 0, 0], rot: [0.3, 0, 0.5] },
    { r: 2.8, tube: 0.015, color: PURPLE, pos: [0, 0, 0], rot: [0.8, 0.4, 0] },
    { r: 3.5, tube: 0.01,  color: ORANGE, pos: [0, 0, 0], rot: [1.2, 0.2, 0.8] },
  ];

  ringData.forEach(d => {
    const geo = new THREE.TorusGeometry(d.r, d.tube, 6, 100);
    const mat = new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.5 });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.set(...d.rot);
    scene.add(ring);
    rings.push(ring);
  });

  // ── Particle System ───────────────────────────────────────
  const isMobile  = window.innerWidth < 768;
  const count     = isMobile ? 600 : 2500;
  const positions = new Float32Array(count * 3);
  const colors    = new Float32Array(count * 3);
  const palette   = [
    new THREE.Color(PURPLE),
    new THREE.Color(PINK),
    new THREE.Color(ORANGE),
  ];

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    const c = palette[Math.floor(Math.random() * 3)];
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const pMat = new THREE.PointsMaterial({
    size: 0.025,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ── Mouse tracking ────────────────────────────────────────
  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Resize ────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  let elapsed = 0;

  return function renderHero(delta = 0.016) {
    elapsed += delta;

    // Lerp mouse
    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;

    // Torus slow rotation + mouse influence
    torus.rotation.y = elapsed * 0.25 + targetX * 0.6;
    torus.rotation.x = Math.PI * 0.1 + targetY * 0.3;
    wireTorus.rotation.copy(torus.rotation);

    // Knot counter-rotation
    knot.rotation.x = elapsed * 0.4;
    knot.rotation.z = elapsed * 0.3;

    // Rings slow drift
    rings[0].rotation.z += 0.003;
    rings[1].rotation.x += 0.002;
    rings[2].rotation.y += 0.0015;

    // Particles gentle drift
    particles.rotation.y = elapsed * 0.04;
    particles.rotation.x = elapsed * 0.02;

    // Light orbit
    purpleLight.position.x = Math.sin(elapsed * 0.6) * 4;
    purpleLight.position.y = Math.cos(elapsed * 0.4) * 3;
    pinkLight.position.x   = Math.cos(elapsed * 0.5) * 4;
    pinkLight.position.z   = Math.sin(elapsed * 0.7) * 3;

    renderer.render(scene, camera);
  };
}

/* ─────────────────────────────────────────────────────────
   CONTACT SCENE — Ambient particle cloud background
   ───────────────────────────────────────────────────────── */
export function initContactScene() {
  const canvas = document.getElementById('contact-canvas');
  if (!canvas) return () => {};

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
  camera.position.z = 4;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.setPixelRatio(1);

  // Floating icosahedra for contact section
  const group = new THREE.Group();
  const icoGeo = new THREE.IcosahedronGeometry(0.15, 0);
  const colors = [PURPLE, PINK, ORANGE];

  for (let i = 0; i < 12; i++) {
    const mat  = new THREE.MeshBasicMaterial({ color: colors[i % 3], wireframe: true, transparent: true, opacity: 0.4 });
    const mesh = new THREE.Mesh(icoGeo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 3,
    );
    mesh.userData.speed = 0.3 + Math.random() * 0.5;
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
      mesh.position.y  = mesh.userData.offset + Math.sin(elapsed * mesh.userData.speed) * 0.3;
    });
    renderer.render(scene, camera);
  };
}
