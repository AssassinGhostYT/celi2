import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

// -------------------------------------------------------------
// 1. GALAXIA ESPIRAL PRINCIPAL
// -------------------------------------------------------------
const parameters = {};
parameters.count = 100000;
parameters.size = 0.01;
parameters.radius = 2.15;
parameters.branches = 3;
parameters.spin = 3;
parameters.randomness = 5;
parameters.randomnessPower = 4;
parameters.insideColor = '#ffb3d9';
parameters.outsideColor = '#8a2be2';

const galaxyMaterial = new THREE.PointsMaterial({
  size: parameters.size,
  sizeAttenuation: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true
});

const galaxyGeometry = new THREE.BufferGeometry();
const galaxyPositions = new Float32Array(parameters.count * 3);
const galaxyColors = new Float32Array(parameters.count * 3);

const colorInside = new THREE.Color(parameters.insideColor);
const colorOutside = new THREE.Color(parameters.outsideColor);

for (let i = 0; i < parameters.count; i++) {
  const i3 = i * 3;
  const radius = Math.pow(Math.random() * parameters.randomness, Math.random() * parameters.radius);
  const spinAngle = radius * parameters.spin;
  const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

  const negPos = [1, -1];
  const randomX = Math.pow(Math.random(), parameters.randomnessPower) * negPos[Math.floor(Math.random() * negPos.length)];
  const randomY = Math.pow(Math.random(), parameters.randomnessPower) * negPos[Math.floor(Math.random() * negPos.length)];
  const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * negPos[Math.floor(Math.random() * negPos.length)];

  galaxyPositions[i3] = Math.cos(branchAngle + spinAngle) * (radius) + randomX;
  galaxyPositions[i3 + 1] = randomY;
  galaxyPositions[i3 + 2] = Math.sin(branchAngle + spinAngle) * (radius) + randomZ;

  const mixedColor = colorInside.clone();
  mixedColor.lerp(colorOutside, Math.random() * radius / parameters.radius);

  galaxyColors[i3] = mixedColor.r;
  galaxyColors[i3 + 1] = mixedColor.g;
  galaxyColors[i3 + 2] = mixedColor.b;
}

galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3));
galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));

const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
scene.add(galaxy);

// -------------------------------------------------------------
// 2. SISTEMA SUPERIOR: NOMBRE + CORAZÓN
// -------------------------------------------------------------
const nameCanvas = document.createElement('canvas');
const nameCtx = nameCanvas.getContext('2d');
nameCanvas.width = 600;
nameCanvas.height = 150;
nameCtx.fillStyle = '#000000';
nameCtx.fillRect(0, 0, nameCanvas.width, nameCanvas.height);
nameCtx.font = 'bold 55px Arial';
nameCtx.fillStyle = '#ffffff';
nameCtx.textAlign = 'center';
nameCtx.textBaseline = 'middle';
nameCtx.fillText("Celisbeth", nameCanvas.width / 2, nameCanvas.height / 2);

const nameImgData = nameCtx.getImageData(0, 0, nameCanvas.width, nameCanvas.height).data;
const namePixels = [];

for (let y = 0; y < nameCanvas.height; y++) {
  for (let x = 0; x < nameCanvas.width; x++) {
    const idx = (y * nameCanvas.width + x) * 4;
    if (nameImgData[idx] > 128) {
      namePixels.push({
        x: (x - nameCanvas.width / 2) * 0.0035,
        y: -(y - nameCanvas.height / 2) * 0.0035,
        z: (Math.random() - 0.5) * 0.02
      });
    }
  }
}

namePixels.sort((a, b) => a.x - b.x);

// Corazón envolvente central
const heartPixels = [];
const heartCount = 6000;

for (let i = 0; i < heartCount; i++) {
  const t = Math.PI * 2 * (i / heartCount);
  const fill = 0.9 + Math.random() * 0.1;
  const hx = 16 * Math.pow(Math.sin(t), 3) * 0.075 * fill;
  const hy = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.075 * fill;
  const hz = (Math.random() - 0.5) * 0.04;

  heartPixels.push({ x: hx, y: hy, z: hz });
}

const totalTopCount = namePixels.length + heartPixels.length;
const topPositions = new Float32Array(totalTopCount * 3);
const topColors = new Float32Array(totalTopCount * 3);

let pIndex = 0;

namePixels.forEach(pt => {
  topPositions[pIndex * 3] = pt.x;
  topPositions[pIndex * 3 + 1] = pt.y;
  topPositions[pIndex * 3 + 2] = pt.z;

  topColors[pIndex * 3] = 1.0;
  topColors[pIndex * 3 + 1] = 0.4;
  topColors[pIndex * 3 + 2] = 0.8;

  pIndex++;
});

heartPixels.forEach(pt => {
  topPositions[pIndex * 3] = pt.x;
  topPositions[pIndex * 3 + 1] = pt.y;
  topPositions[pIndex * 3 + 2] = pt.z;

  topColors[pIndex * 3] = 1.0;
  topColors[pIndex * 3 + 1] = 0.2;
  topColors[pIndex * 3 + 2] = 0.6;

  pIndex++;
});

const topGeometry = new THREE.BufferGeometry();
topGeometry.setAttribute('position', new THREE.BufferAttribute(topPositions, 3));
topGeometry.setAttribute('color', new THREE.BufferAttribute(topColors, 3));

const topMaterial = new THREE.PointsMaterial({
  size: 0.015,
  sizeAttenuation: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
  transparent: true,
  opacity: 0.95
});

const topGroup = new THREE.Group();
const topPoints = new THREE.Points(topGeometry, topMaterial);
topGroup.add(topPoints);
topGroup.position.set(0, 1.7, 0);
scene.add(topGroup);

// -------------------------------------------------------------
// 3. ANILLO SECUNDARIO DE POLVO ESTELAR
// -------------------------------------------------------------
const ringCount = 20000;
const ringGeometry = new THREE.BufferGeometry();
const ringPositions = new Float32Array(ringCount * 3);
const ringColors = new Float32Array(ringCount * 3);

for (let i = 0; i < ringCount; i++) {
  const i3 = i * 3;
  const radius = 2.0 + Math.random() * 1.5;
  const angle = Math.random() * Math.PI * 2;

  ringPositions[i3] = Math.cos(angle) * radius;
  ringPositions[i3 + 1] = (Math.random() - 0.5) * 0.2;
  ringPositions[i3 + 2] = Math.sin(angle) * radius;

  const ringColor = new THREE.Color();
  ringColor.setHSL(0.75 + Math.random() * 0.15, 0.8, 0.6);

  ringColors[i3] = ringColor.r;
  ringColors[i3 + 1] = ringColor.g;
  ringColors[i3 + 2] = ringColor.b;
}

ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
ringGeometry.setAttribute('color', new THREE.BufferAttribute(ringColors, 3));

const ringMaterial = new THREE.PointsMaterial({
  size: 0.008,
  sizeAttenuation: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
  transparent: true,
  opacity: 0.6
});

const starRing = new THREE.Points(ringGeometry, ringMaterial);
scene.add(starRing);

// -------------------------------------------------------------
// 4. LLUVIA DE ESTRELLAS FUGACES
// -------------------------------------------------------------
const shootingStarsCount = 25;
const shootingStarsGeo = new THREE.BufferGeometry();
const shootingStarsPos = new Float32Array(shootingStarsCount * 3);
const shootingStarsVel = [];

for (let i = 0; i < shootingStarsCount; i++) {
  const i3 = i * 3;
  shootingStarsPos[i3] = (Math.random() - 0.5) * 8;
  shootingStarsPos[i3 + 1] = 2 + Math.random() * 3;
  shootingStarsPos[i3 + 2] = (Math.random() - 0.5) * 8;

  shootingStarsVel.push({
    x: -0.03 - Math.random() * 0.04,
    y: -0.02 - Math.random() * 0.03,
    z: (Math.random() - 0.5) * 0.02
  });
}

shootingStarsGeo.setAttribute('position', new THREE.BufferAttribute(shootingStarsPos, 3));

const shootingStarsMat = new THREE.PointsMaterial({
  size: 0.03,
  sizeAttenuation: true,
  color: '#ffffff',
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending
});

const shootingStars = new THREE.Points(shootingStarsGeo, shootingStarsMat);
scene.add(shootingStars);

// -------------------------------------------------------------
// 5. CENTRO: CORAZÓN Y OSO (MORPHING)
// -------------------------------------------------------------
const centerParticleCount = 45000;
const heartTargetPositions = new Float32Array(centerParticleCount * 3);
const bearTargetPositions = new Float32Array(centerParticleCount * 3);
const centerPositions = new Float32Array(centerParticleCount * 3);
const centerColors = new Float32Array(centerParticleCount * 3);

for (let i = 0; i < centerParticleCount; i++) {
  const i3 = i * 3;
  const t = Math.PI * 2 * Math.random();
  const fill = Math.sqrt(Math.random());

  let x = 16 * Math.pow(Math.sin(t), 3);
  let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

  const scale = 0.045;
  x *= scale * fill;
  y *= scale * fill;

  const maxZ = Math.sqrt(Math.max(0, 1 - fill * fill)) * 0.35;
  const z = (Math.random() - 0.5) * 2 * maxZ;

  heartTargetPositions[i3] = x;
  heartTargetPositions[i3 + 1] = y;
  heartTargetPositions[i3 + 2] = z;

  centerPositions[i3] = x;
  centerPositions[i3 + 1] = y;
  centerPositions[i3 + 2] = z;

  const color = new THREE.Color();
  color.setHSL(0.92 + Math.random() * 0.04, 0.85, 0.65 + Math.random() * 0.25);

  centerColors[i3] = color.r;
  centerColors[i3 + 1] = color.g;
  centerColors[i3 + 2] = color.b;
}

function getDetailedBearPoint() {
  const part = Math.random();
  let x = 0, y = 0, z = 0;

  if (part < 0.25) {
    const r = 0.35 * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    x = r * Math.sin(phi) * Math.cos(theta);
    y = r * Math.sin(phi) * Math.sin(theta) + 0.3;
    z = r * Math.cos(phi) * 0.8;
  } else if (part < 0.33) {
    const r = 0.12 * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    x = r * Math.sin(phi) * Math.cos(theta) - 0.28;
    y = r * Math.sin(phi) * Math.sin(theta) + 0.58;
    z = r * Math.cos(phi) * 0.5;
  } else if (part < 0.41) {
    const r = 0.12 * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    x = r * Math.sin(phi) * Math.cos(theta) + 0.28;
    y = r * Math.sin(phi) * Math.sin(theta) + 0.58;
    z = r * Math.cos(phi) * 0.5;
  } else if (part < 0.63) {
    const r = 0.42 * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    x = r * Math.sin(phi) * Math.cos(theta);
    y = r * Math.sin(phi) * Math.sin(theta) - 0.35;
    z = r * Math.cos(phi) * 0.9;
  } else if (part < 0.75) {
    const r = 0.13 * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    x = r * Math.sin(phi) * Math.cos(theta) - 0.42;
    y = r * Math.sin(phi) * Math.sin(theta) - 0.15;
    z = r * Math.cos(phi) * 0.6 + 0.15;
  } else if (part < 0.87) {
    const r = 0.13 * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    x = r * Math.sin(phi) * Math.cos(theta) + 0.42;
    y = r * Math.sin(phi) * Math.sin(theta) - 0.15;
    z = r * Math.cos(phi) * 0.6 + 0.15;
  } else {
    const leg = Math.random() < 0.5 ? -1 : 1;
    const r = 0.15 * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    x = r * Math.sin(phi) * Math.cos(theta) + (leg * 0.26);
    y = r * Math.sin(phi) * Math.sin(theta) - 0.72;
    z = r * Math.cos(phi) * 0.7 + 0.1;
  }

  return { x, y, z };
}

for (let i = 0; i < centerParticleCount; i++) {
  const i3 = i * 3;
  const p = getDetailedBearPoint();

  bearTargetPositions[i3] = p.x;
  bearTargetPositions[i3 + 1] = p.y;
  bearTargetPositions[i3 + 2] = p.z;
}

const centerGeometry = new THREE.BufferGeometry();
centerGeometry.setAttribute('position', new THREE.BufferAttribute(centerPositions, 3));
centerGeometry.setAttribute('color', new THREE.BufferAttribute(centerColors, 3));

const centerMaterial = new THREE.PointsMaterial({
  size: 0.014,
  sizeAttenuation: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
  transparent: true,
  opacity: 0.95
});

const centerGroup = new THREE.Group();
const centerPoints = new THREE.Points(centerGeometry, centerMaterial);
centerGroup.add(centerPoints);
scene.add(centerGroup);

// -------------------------------------------------------------
// 6. TEXTOS FLOTANTES EN EL ESPIRAL
// -------------------------------------------------------------
function generateTextParticleSystem(message) {
  const canvas2d = document.createElement('canvas');
  const ctx = canvas2d.getContext('2d');
  canvas2d.width = 300;
  canvas2d.height = 100;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas2d.width, canvas2d.height);

  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(message, canvas2d.width / 2, canvas2d.height / 2);

  const imgData = ctx.getImageData(0, 0, canvas2d.width, canvas2d.height).data;
  const validPixels = [];

  for (let y = 0; y < canvas2d.height; y++) {
    for (let x = 0; x < canvas2d.width; x++) {
      const index = (y * canvas2d.width + x) * 4;

      if (imgData[index] > 128) {
        validPixels.push({
          x: (x - canvas2d.width / 2) * 0.003,
          y: -(y - canvas2d.height / 2) * 0.003,
          z: (Math.random() - 0.5) * 0.05
        });
      }
    }
  }

  const pCount = Math.max(validPixels.length, 1000);
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(pCount * 3);
  const col = new Float32Array(pCount * 3);

  for (let i = 0; i < pCount; i++) {
    const i3 = i * 3;
    const p = validPixels[i % validPixels.length];

    pos[i3] = p.x;
    pos[i3 + 1] = p.y;
    pos[i3 + 2] = p.z;

    const c = new THREE.Color();
    c.setHSL(Math.random(), 0.9, 0.7);

    col[i3] = c.r;
    col[i3 + 1] = c.g;
    col[i3 + 2] = c.b;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.012,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    opacity: 0.85
  });

  return new THREE.Points(geo, mat);
}

const textsGroup = new THREE.Group();
const phrases = [
  "TE QUIERO",
  "TE DESEO",
  "MI AMOR",
  "SIEMPRE JUNTOS",
  "TE AMO",
  "VIDA MIA"
];
const textObjects = [];

phrases.forEach((phrase, index) => {
  const txtMesh = generateTextParticleSystem(phrase);
  const angle = (index / phrases.length) * Math.PI * 2;
  const distance = 0.9 + Math.random() * 1.1;

  txtMesh.userData = {
    angle: angle,
    distance: distance,
    speed: 0.15 + Math.random() * 0.1,
    yOffset: (Math.random() - 0.5) * 1.0
  };

  textsGroup.add(txtMesh);
  textObjects.push(txtMesh);
});

scene.add(textsGroup);

// -------------------------------------------------------------
// 7. 10 CARTAS INTERACTIVAS CON IMÁGENES DE LA RAÍZ
// -------------------------------------------------------------
const cardsData = [
  { image: 'IMG-20261111-WA0025.jpg', frontColor: '#ff4d6d', message: 'Eres mi lugar favorito en el mundo' },
  { image: 'IMG-20261111-WA0027.jpg', frontColor: '#ff758f', message: 'Cada segundo a tu lado vale oro' },
  { image: 'IMG-20261111-WA0031.jpg', frontColor: '#c77dff', message: 'Me haces sonreír sin darme cuenta' },
  { image: 'IMG-20261111-WA0032.jpg', frontColor: '#e0aaff', message: 'Tu mirada ilumina todo mi universo' },
  { image: 'IMG-20261111-WA0037.jpg', frontColor: '#ffb3c1', message: 'Contigo todo es más bonito' },
  { image: 'IMG-20261111-WA0038.jpg', frontColor: '#ff85a1', message: 'Gracias por existir en mi vida' },
  { image: 'IMG-20261111-WA0040.jpg', frontColor: '#9d4edd', message: 'Mi corazón late más fuerte por ti' },
  { image: 'IMG-20261111-WA0043.jpg', frontColor: '#ff9ebb', message: 'Eres mi pensamiento favorito' },
  { image: 'IMG-20261111-WA0044.jpg', frontColor: '#f72585', message: 'Te elegiría mil veces más' },
  { image: 'IMG-20261111-WA0046.jpg', frontColor: '#7209b7', message: 'Juntos hacemos la mejor historia' }
];

const textureLoader = new THREE.TextureLoader();

function createCardFrontTexture(imageName) {
  const texture = textureLoader.load(imageName);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createCardBackTexture(text, color) {
  const canvasCard = document.createElement('canvas');
  const ctx = canvasCard.getContext('2d');
  canvasCard.width = 256;
  canvasCard.height = 360;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvasCard.width, canvasCard.height);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(12, 12, canvasCard.width - 24, canvasCard.height - 24);

  ctx.translate(canvasCard.width, 0);
  ctx.scale(-1, 1);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const words = text.split(' ');
  let line = '';
  let y = 140;

  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i] + ' ';
    let metrics = ctx.measureText(testLine);

    if (metrics.width > 190 && i > 0) {
      ctx.fillText(line, canvasCard.width / 2, y);
      line = words[i] + ' ';
      y += 34;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line, canvasCard.width / 2, y);

  return new THREE.CanvasTexture(canvasCard);
}

const cardsGroup = new THREE.Group();
const cardMeshes = [];

cardsData.forEach((data, index) => {
  const cardGeo = new THREE.PlaneGeometry(0.32, 0.45);

  const frontTex = createCardFrontTexture(data.image);
  const backTex = createCardBackTexture(data.message, data.frontColor);

  const matFront = new THREE.MeshBasicMaterial({ map: frontTex, side: THREE.FrontSide });
  const matBack = new THREE.MeshBasicMaterial({ map: backTex, side: THREE.BackSide });

  const singleCardGroup = new THREE.Group();

  const frontMesh = new THREE.Mesh(cardGeo, matFront);
  const backMesh = new THREE.Mesh(cardGeo, matBack);

  singleCardGroup.add(frontMesh);
  singleCardGroup.add(backMesh);

  const angle = (index / cardsData.length) * Math.PI * 2;
  const distance = 1.1 + (index % 3) * 0.35;
  const heightOffset = ((index % 5) - 2) * 0.35;

  singleCardGroup.userData = {
    angle: angle,
    distance: distance,
    speed: 0.12 + Math.random() * 0.05,
    yOffset: heightOffset,
    isFlipped: false,
    flipTarget: 0,
    currentFlip: 0
  };

  cardsGroup.add(singleCardGroup);
  cardMeshes.push(singleCardGroup);
});

scene.add(cardsGroup);

// -------------------------------------------------------------
// 8. INTERACCIÓN TOUCH / CLIC (RAYCASTER)
// -------------------------------------------------------------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onPointerDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const allCardPlanes = [];

  cardMeshes.forEach(group => {
    group.children.forEach(child => allCardPlanes.push(child));
  });

  const intersects = raycaster.intersectObjects(allCardPlanes);

  if (intersects.length > 0) {
    const hitObject = intersects[0].object;
    const cardGroup = hitObject.parent;

    if (cardGroup && cardGroup.userData) {
      cardGroup.userData.isFlipped = !cardGroup.userData.isFlipped;
      cardGroup.userData.flipTarget = cardGroup.userData.isFlipped ? Math.PI : 0;
    }
  }
}

window.addEventListener('pointerdown', onPointerDown);

// -------------------------------------------------------------
// 9. CÁMARA Y CONTROLES 360 LIBRES
// -------------------------------------------------------------
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 3;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI;

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  controls.update();

  galaxy.rotation.y = elapsedTime * 0.05;
  starRing.rotation.y = -elapsedTime * 0.08;

  const cycleTime = elapsedTime % 12.0;
  let visibleCount = 0;

  if (cycleTime < 3.0) {
    const p = cycleTime / 3.0;
    visibleCount = Math.floor(p * namePixels.length);
  } else if (cycleTime < 6.0) {
    const p = (cycleTime - 3.0) / 3.0;
    visibleCount = namePixels.length + Math.floor(p * heartPixels.length);
  } else if (cycleTime < 11.5) {
    visibleCount = totalTopCount;
  } else {
    visibleCount = 0;
  }

  topPoints.geometry.setDrawRange(0, visibleCount);
  topGroup.lookAt(camera.position);

  const ssPosAttr = shootingStarsGeo.attributes.position;
  const ssArr = ssPosAttr.array;

  for (let i = 0; i < shootingStarsCount; i++) {
    const i3 = i * 3;
    ssArr[i3] += shootingStarsVel[i].x;
    ssArr[i3 + 1] += shootingStarsVel[i].y;
    ssArr[i3 + 2] += shootingStarsVel[i].z;

    if (ssArr[i3 + 1] < -3) {
      ssArr[i3] = (Math.random() - 0.5) * 8;
      ssArr[i3 + 1] = 3 + Math.random() * 2;
      ssArr[i3 + 2] = (Math.random() - 0.5) * 8;
    }
  }

  ssPosAttr.needsUpdate = true;

  const morphProgress = (Math.sin(elapsedTime * 0.5) + 1) / 2;
  const posAttr = centerGeometry.attributes.position;
  const posArr = posAttr.array;

  for (let i = 0; i < centerParticleCount * 3; i++) {
    const h = heartTargetPositions[i];
    const b = bearTargetPositions[i];
    posArr[i] = h + (b - h) * morphProgress;
  }

  posAttr.needsUpdate = true;

  const beat = 1 + Math.sin(elapsedTime * 4) * 0.05;
  centerGroup.scale.set(beat, beat, beat);
  centerGroup.lookAt(camera.position);

  textObjects.forEach((txt) => {
    const currentAngle = txt.userData.angle + elapsedTime * txt.userData.speed * 0.2;

    txt.position.x = Math.cos(currentAngle) * txt.userData.distance;
    txt.position.z = Math.sin(currentAngle) * txt.userData.distance;
    txt.position.y = txt.userData.yOffset + Math.sin(elapsedTime + currentAngle) * 0.1;

    txt.lookAt(camera.position);
  });

  cardMeshes.forEach((cardGroup) => {
    const data = cardGroup.userData;
    const currentAngle = data.angle + elapsedTime * data.speed * 0.2;

    cardGroup.position.x = Math.cos(currentAngle) * data.distance;
    cardGroup.position.z = Math.sin(currentAngle) * data.distance;
    cardGroup.position.y = data.yOffset + Math.sin(elapsedTime * 1.5 + currentAngle) * 0.08;

    data.currentFlip += (data.flipTarget - data.currentFlip) * 0.1;

    cardGroup.lookAt(camera.position);
    cardGroup.rotateY(data.currentFlip);
  });

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
