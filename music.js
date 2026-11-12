/*
 * Música de la página: "If Forever Has A Name, It's You" de Ed Sheeran
 * (https://youtu.be/1Qa4UZQBzBY) reproducida con el reproductor oficial de YouTube.
 *
 * Los navegadores no dejan sonar audio hasta que la persona toca la pantalla,
 * así que intentamos arrancar al entrar y, si lo bloquean, arranca con el
 * primer toque/clic/tecla en cualquier lugar.
 */
(() => {
  const VIDEO_ID = '1Qa4UZQBzBY';
  const VOLUME = 55;

  const toggle = document.getElementById('music-toggle');
  const hint = document.getElementById('music-hint');

  let player = null;
  let ready = false;
  let started = false;
  let muted = true;
  let apiRequested = false;

  function setUi() {
    if (!toggle) return;
    toggle.textContent = muted ? '🔇' : '🔊';
    toggle.setAttribute('aria-label', muted ? 'Activar la música' : 'Silenciar la música');
  }

  function hideHint() {
    if (hint) hint.classList.add('hidden');
  }

  function startFromGesture() {
    if (!ready || !player) return;
    started = true;
    muted = false;
    player.unMute();
    player.setVolume(VOLUME);
    player.playVideo();
    setUi();
    hideHint();
  }

  function createPlayer() {
    if (player || !window.YT || !window.YT.Player) return;
    player = new window.YT.Player('music-player', {
      videoId: VIDEO_ID,
      playerVars: {
        autoplay: 1,
        loop: 1,
        playlist: VIDEO_ID,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        iv_load_policy: 3,
        origin: window.location.origin
      },
      events: {
        onReady: (event) => {
          ready = true;
          event.target.setVolume(VOLUME);
          // Intento de reproducción automática. Si el navegador lo bloquea,
          // el primer toque en cualquier lugar la activa con sonido.
          event.target.playVideo();
        },
        onStateChange: (event) => {
          if (!window.YT || !window.YT.PlayerState) return;
          if (event.data === window.YT.PlayerState.PLAYING) {
            if (!started) {
              started = true;
              muted = false;
              setUi();
            }
            hideHint();
          }
          if (event.data === window.YT.PlayerState.ENDED) {
            event.target.playVideo();
          }
        },
        onError: () => {
          if (hint) {
            hint.textContent = '🎵 No se pudo cargar la música';
            hint.classList.remove('hidden');
          }
        }
      }
    });
  }

  function loadYouTubeApi() {
    if (apiRequested) return;
    apiRequested = true;

    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === 'function') previous();
      createPlayer();
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    document.head.appendChild(tag);

    // Si en 10 s la API no cargó (bloqueador de anuncios, red...), avisamos.
    setTimeout(() => {
      if (!player && hint) {
        hint.textContent = '🎵 Toca el botón 🔊 para intentar la música';
      }
    }, 10000);
  }

  function toggleMusic() {
    if (!started) {
      startFromGesture();
      return;
    }
    if (muted) {
      startFromGesture();
    } else {
      muted = true;
      player.mute();
      setUi();
    }
  }

  if (toggle) {
    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleMusic();
    });
    toggle.addEventListener('pointerdown', (event) => event.stopPropagation());
  }

  // Primer toque/clic/tecla en cualquier parte: activa la música con sonido.
  const gestureEvents = ['pointerdown', 'touchstart', 'click', 'keydown'];
  const onFirstGesture = () => {
    if (!started) startFromGesture();
    gestureEvents.forEach((name) => window.removeEventListener(name, onFirstGesture));
  };
  gestureEvents.forEach((name) => window.addEventListener(name, onFirstGesture, { passive: true }));

  setUi();
  loadYouTubeApi();
})();
