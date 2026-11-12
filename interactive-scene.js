// Carga el escenario 3D original y conecta el toque de cada carta con su recuerdo.
// La modificación evita mantener dos copias completas del gran archivo del escenario.
const source = await fetch(new URL('./script.js', import.meta.url)).then((response) => {
  if (!response.ok) throw new Error(`No se pudo cargar script.js (${response.status})`);
  return response.text();
});

const indexedCards = source.replace(
  '    isFlipped: false,\n    flipTarget: 0,',
  '    memoryIndex: index,\n    isFlipped: false,\n    flipTarget: 0,'
);

const interactiveCards = indexedCards.replace(
  `    if (cardGroup && cardGroup.userData) {\n      cardGroup.userData.isFlipped = !cardGroup.userData.isFlipped;\n      cardGroup.userData.flipTarget = cardGroup.userData.isFlipped ? Math.PI : 0;\n    }`,
  `    if (cardGroup && Number.isInteger(cardGroup.userData.memoryIndex)) {\n      window.dispatchEvent(new CustomEvent('open-spiral-memory', {\n        detail: { index: cardGroup.userData.memoryIndex }\n      }));\n    }`
);

if (interactiveCards === source || !interactiveCards.includes('open-spiral-memory')) {
  throw new Error('No se pudo conectar el toque de las cartas 3D con la carta de recuerdo.');
}

const patchedUrl = URL.createObjectURL(new Blob([interactiveCards], { type: 'text/javascript' }));
try {
  await import(patchedUrl);
} finally {
  URL.revokeObjectURL(patchedUrl);
}
