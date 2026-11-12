const memories = [
  {
    image: 'IMG-20261111-WA0025.jpg',
    title: 'Mi lugar favorito',
    message: 'Eres mi lugar favorito en el mundo. A tu lado, cualquier sitio se siente como hogar.'
  },
  {
    image: 'IMG-20261111-WA0027.jpg',
    title: 'Cada instante',
    message: 'Cada segundo contigo vale oro. Gracias por llenar mis días de momentos que quiero guardar para siempre.'
  },
  {
    image: 'IMG-20261111-WA0031.jpg',
    title: 'Tu sonrisa',
    message: 'Me haces sonreír incluso sin darte cuenta. Tu alegría es una de mis cosas favoritas.'
  },
  {
    image: 'IMG-20261111-WA0032.jpg',
    title: 'Mi universo',
    message: 'Tu mirada ilumina todo mi universo. Cuando me miras, todo lo demás deja de importar.'
  },
  {
    image: 'IMG-20261111-WA0037.jpg',
    title: 'Todo es más bonito',
    message: 'Contigo, hasta los días sencillos se vuelven especiales. Gracias por hacer mi mundo más bonito.'
  },
  {
    image: 'IMG-20261111-WA0038.jpg',
    title: 'Qué suerte',
    message: 'Qué suerte la mía de coincidir contigo. Gracias por existir y por compartir tu vida conmigo.'
  },
  {
    image: 'IMG-20261111-WA0040.jpg',
    title: 'Mi corazón',
    message: 'Mi corazón siempre encuentra el camino de vuelta a ti. Te quiero con todo lo que soy.'
  },
  {
    image: 'IMG-20261111-WA0043.jpg',
    title: 'Pienso en ti',
    message: 'Eres ese pensamiento bonito que aparece en cualquier momento y me alegra el día.'
  },
  {
    image: 'IMG-20261111-WA0044.jpg',
    title: 'Te elegiría',
    message: 'Si pudiera volver a empezar, te elegiría otra vez, y otra, y todas las veces.'
  },
  {
    image: 'IMG-20261111-WA0046.jpg',
    title: 'Nuestra historia',
    message: 'Lo nuestro es mi historia favorita. Ojalá sigamos escribiendo juntos muchos capítulos más.'
  },
  {
    image: 'IMG-20261111-WA0047.jpg',
    title: 'Siempre tú',
    message: 'Entre tantas personas y tantos caminos, mi corazón siempre termina escogiendo el tuyo.'
  },
  {
    image: 'IMG-20261111-WA0048.jpg',
    title: 'Mi calma',
    message: 'En tus abrazos encuentro calma, alegría y ese lugarcito donde siempre quiero estar.'
  },
  {
    image: 'IMG-20261111-WA0049.jpg',
    title: 'Un día contigo',
    message: 'Un día cualquiera contigo puede convertirse en uno de mis recuerdos más queridos.'
  },
  {
    image: 'IMG-20261111-WA0050.jpg',
    title: 'Mucho amor',
    message: 'No siempre encuentro las palabras perfectas, pero quiero que nunca dudes de cuánto te amo.'
  }
];

const modal = document.querySelector('#letter-modal');
const card = document.querySelector('#letter-card');
const closeButton = document.querySelector('#letter-close');
const photo = document.querySelector('#letter-image');
const title = document.querySelector('#letter-title');
const number = document.querySelector('#letter-number');
const message = document.querySelector('#letter-message');
let previouslyFocused = null;

window.addEventListener('open-spiral-memory', (event) => {
  const index = Number(event.detail?.index);
  if (Number.isInteger(index) && memories[index]) openMemory(memories[index], index);
});

function openMemory(memory, index) {
  previouslyFocused = document.activeElement;
  photo.src = memory.image;
  photo.alt = memory.title;
  title.textContent = memory.title;
  number.textContent = `Recuerdo ${String(index + 1).padStart(2, '0')}`;
  message.textContent = memory.message;
  card.classList.remove('is-flipped');
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('letter-open');
  closeButton.focus();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => card.classList.add('is-flipped'));
  });
}

function closeMemory() {
  if (modal.hidden) return;
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('letter-open');
  card.classList.remove('is-flipped');
  window.dispatchEvent(new Event('close-spiral-memory'));
  if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
}

function flipMemory() {
  card.classList.toggle('is-flipped');
}

card.addEventListener('click', flipMemory);
card.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    flipMemory();
  }
});

closeButton.addEventListener('click', closeMemory);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeMemory();
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMemory();
});
