// Carga el escenario existente y conecta cada tarjeta 3D con su recuerdo ampliado.
// Se conserva el escenario original para que los cambios visuales no afecten la galaxia.
const sourceResponse = await fetch(new URL('./script.js', import.meta.url));
if (!sourceResponse.ok) {
  throw new Error(`No se pudo cargar script.js (${sourceResponse.status})`);
}
const originalScene = await sourceResponse.text();

const cards = [
  { image: 'IMG-20261111-WA0025.jpg', frontColor: '#ff4d6d', message: 'Eres mi lugar favorito en el mundo' },
  { image: 'IMG-20261111-WA0027.jpg', frontColor: '#ff758f', message: 'Cada segundo a tu lado vale oro' },
  { image: 'IMG-20261111-WA0031.jpg', frontColor: '#c77dff', message: 'Me haces sonreír sin darme cuenta' },
  { image: 'IMG-20261111-WA0032.jpg', frontColor: '#e0aaff', message: 'Tu mirada ilumina todo mi universo' },
  { image: 'IMG-20261111-WA0037.jpg', frontColor: '#ffb3c1', message: 'Contigo todo es más bonito' },
  { image: 'IMG-20261111-WA0038.jpg', frontColor: '#ff85a1', message: 'Gracias por existir en mi vida' },
  { image: 'IMG-20261111-WA0040.jpg', frontColor: '#9d4edd', message: 'Mi corazón late más fuerte por ti' },
  { image: 'IMG-20261111-WA0042.jpg', frontColor: '#ff9ebb', message: 'Cada recuerdo contigo es un tesoro' },
  { image: 'IMG-20261111-WA0043.jpg', frontColor: '#f72585', message: 'Eres mi pensamiento favorito' },
  { image: 'IMG-20261111-WA0044.jpg', frontColor: '#7209b7', message: 'Te elegiría mil veces más' },
  { image: 'IMG-20261111-WA0046.jpg', frontColor: '#a855f7', message: 'Juntos hacemos la mejor historia' },
  { image: 'IMG-20261111-WA0047.jpg', frontColor: '#f472b6', message: 'Siempre vuelves a mi corazón' },
  { image: 'IMG-20261111-WA0048.jpg', frontColor: '#f43f5e', message: 'En ti encuentro mi paz' },
  { image: 'IMG-20261111-WA0049.jpg', frontColor: '#fb7185', message: 'Un día contigo puede ser inolvidable' },
  { image: 'IMG-20261111-WA0050.jpg', frontColor: '#ec4899', message: 'Nunca dudes de cuánto te amo' }
];

const cardsSource = `const cardsData = [\n${cards.map((item) => `  ${JSON.stringify(item)}`).join(',\n')}\n];`;
let interactiveScene = originalScene.replace(
  /const cardsData = \[[\s\S]*?\n\];(?=\n\nconst textureLoader)/,
  cardsSource
);

interactiveScene = interactiveScene.replace(
  '    isFlipped: false,\n    flipTarget: 0,',
  '    memoryIndex: index,\n    isFlipped: false,\n    flipTarget: 0,'
);

interactiveScene = interactiveScene.replace(
  `    if (cardGroup && cardGroup.userData) {\n      cardGroup.userData.isFlipped = !cardGroup.userData.isFlipped;\n      cardGroup.userData.flipTarget = cardGroup.userData.isFlipped ? Math.PI : 0;\n    }`,
  `    if (cardGroup && Number.isInteger(cardGroup.userData.memoryIndex)) {\n      window.dispatchEvent(new CustomEvent('open-spiral-memory', {\n        detail: { index: cardGroup.userData.memoryIndex }\n      }));\n    }`
);

if (interactiveScene === originalScene || !interactiveScene.includes('open-spiral-memory')) {
  throw new Error('No se pudo conectar el toque de la tarjeta 3D con la carta ampliada.');
}

const sceneUrl = URL.createObjectURL(new Blob([interactiveScene], { type: 'text/javascript' }));
try {
  await import(sceneUrl);
} finally {
  URL.revokeObjectURL(sceneUrl);
}
