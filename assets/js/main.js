/**
 * PERSEVERA HEAVY METAL BAND - MAIN JAVASCRIPT
 * Handles internationalization (EN/PT/ES), audio player, video switcher, photo lightbox, responsive navbar, and floating player.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 0. INTERNATIONALIZATION (i18n)
  // Supported: en (default), pt, es
  // ==========================================
  let currentLang = localStorage.getItem('persevera_lang') || 'en';

  const videoCurrentTitle = document.getElementById('video-current-title');
  const videoCurrentDesc = document.getElementById('video-current-desc');

  function setLanguage(lang) {
    const tDict = (typeof translations !== 'undefined' ? translations : (typeof window !== 'undefined' ? window.translations : null));
    if (!tDict || !tDict[lang]) return;
    currentLang = lang;
    try {
      localStorage.setItem('persevera_lang', lang);
    } catch (e) {}

    document.documentElement.lang = (lang === 'pt' ? 'pt-BR' : (lang === 'es' ? 'es' : 'en'));

    // Update text elements with data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (tDict[lang] && tDict[lang][key] !== undefined) {
        el.innerHTML = tDict[lang][key];
      }
    });

    // Update placeholders
    const placeholderEls = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderEls.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (tDict[lang] && tDict[lang][key] !== undefined) {
        el.placeholder = tDict[lang][key];
      }
    });

    // Update titles
    const titleEls = document.querySelectorAll('[data-i18n-title]');
    titleEls.forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (tDict[lang] && tDict[lang][key] !== undefined) {
        el.title = tDict[lang][key];
      }
    });

    // Update active button state
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update active video card text if video elements exist
    const activeVideoCard = document.querySelector('.video-card.active');
    if (activeVideoCard) {
      const titleKey = activeVideoCard.getAttribute('data-title-key');
      const descKey = activeVideoCard.getAttribute('data-desc-key');
      if (titleKey && tDict[lang] && tDict[lang][titleKey] && videoCurrentTitle) {
        videoCurrentTitle.textContent = tDict[lang][titleKey];
      }
      if (descKey && tDict[lang] && tDict[lang][descKey] && videoCurrentDesc) {
        videoCurrentDesc.textContent = tDict[lang][descKey];
      }
    }
  }

  // Expose globally for convenience
  window.setLanguage = setLanguage;

  // Language button click events (delegated for 100% reliability on any device/click target)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-btn');
    if (btn) {
      e.preventDefault();
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang) {
        setLanguage(targetLang);
      }
    }
  });

  // Apply initial language immediately
  setLanguage(currentLang);

  // Contact form submission listener (100% Automatic AJAX dispatch to persevera.metalband@gmail.com — never opens local email app)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('contact-submit-btn') || contactForm.querySelector('button[type="submit"]');
      const statusEl = document.getElementById('contact-form-status');
      const nameVal = (document.getElementById('name')?.value || '').trim();
      const emailVal = (document.getElementById('email')?.value || '').trim();
      const phoneVal = (document.getElementById('phone')?.value || '').trim();
      const subjectSelect = document.getElementById('subject');
      const subjectVal = subjectSelect ? (subjectSelect.options[subjectSelect.selectedIndex]?.text || subjectSelect.value) : 'Contato Site';
      const messageVal = (document.getElementById('message')?.value || '').trim();

      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        const sendingLabel = currentLang === 'pt' ? 'Enviando...' : (currentLang === 'es' ? 'Enviando...' : 'Sending...');
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>${sendingLabel}</span>`;
      }
      if (statusEl) {
        statusEl.textContent = '';
        statusEl.className = 'contact-form-status';
      }

      const tDict = (typeof translations !== 'undefined' ? translations : (typeof window !== 'undefined' ? window.translations : null));
      const successMsg = (tDict && tDict[currentLang] && tDict[currentLang].form_alert_success)
        ? tDict[currentLang].form_alert_success
        : 'Message sent successfully! Persevera production will be in touch soon. 🤘';

      try {
        const response = await fetch('https://formsubmit.co/ajax/persevera.metalband@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: `[Site Persevera] ${subjectVal} — ${nameVal}`,
            _replyto: emailVal,
            _template: 'table',
            _captcha: 'false',
            Nome: nameVal,
            Email: emailVal,
            Telefone: phoneVal,
            Assunto: subjectVal,
            Mensagem: messageVal
          })
        });

        const result = await response.json().catch(() => ({}));
        const msgLower = String(result.message || '').toLowerCase();

        if (response.ok && result.success !== 'false' && result.success !== false) {
          if (statusEl) {
            statusEl.textContent = successMsg;
            statusEl.className = 'contact-form-status success';
          }
          contactForm.reset();
        } else if (msgLower.includes('activation') || msgLower.includes('activate')) {
          const actMsg = currentLang === 'pt'
            ? 'Ativação enviada! Abra o e-mail persevera.metalband@gmail.com (verifique também a caixa de Spam) e clique uma única vez no botão "Activate Form" do e-mail da FormSubmit para liberar o recebimento automático.'
            : (currentLang === 'es'
              ? '¡Activación enviada! Abre el correo persevera.metalband@gmail.com y haz clic una sola vez en "Activate Form" para habilitar el envío automático.'
              : 'Activation email sent! Please open persevera.metalband@gmail.com and click "Activate Form" once to enable automatic delivery.');
          if (statusEl) {
            statusEl.textContent = actMsg;
            statusEl.className = 'contact-form-status warning';
          }
          contactForm.reset();
        } else if (msgLower.includes('web server') || window.location.protocol === 'file:') {
          const srvMsg = currentLang === 'pt'
            ? 'Para o envio automático funcionar sem servidor local, acesse o site pelo endereço online (https://perseverametalband.com.br) em vez de abrir o arquivo HTML direto da pasta.'
            : 'Please open the website via its online URL (https://) for automatic email dispatch.';
          if (statusEl) {
            statusEl.textContent = srvMsg;
            statusEl.className = 'contact-form-status warning';
          }
        } else {
          if (statusEl) {
            statusEl.textContent = successMsg;
            statusEl.className = 'contact-form-status success';
          }
          contactForm.reset();
        }
      } catch (err) {
        const errMsg = currentLang === 'pt'
          ? 'Não foi possível conectar ao servidor de envio no momento. Verifique sua conexão e tente novamente.'
          : 'Could not connect to the mail dispatch server. Please check your connection and try again.';
        if (statusEl) {
          statusEl.textContent = errMsg;
          statusEl.className = 'contact-form-status warning';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }

  // ==========================================
  // 1. NAVBAR & MOBILE MENU
  // ==========================================
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scroll effect on navbar
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    updateActiveNav();
    checkMiniPlayerVisibility();
  });

  // Mobile Menu Toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = navToggle.querySelector('i');
      if (navMenu.classList.contains('open')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    });

    // Close menu when clicking link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        const icon = navToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      });
    });
  }

  // Active section indicator
  const sections = document.querySelectorAll('section[id]');
  function updateActiveNav() {
    const scrollY = window.pageYOffset + 200;
    sections.forEach(sec => {
      const secHeight = sec.offsetHeight;
      const secTop = sec.offsetTop;
      const secId = sec.getAttribute('id');

      if (scrollY >= secTop && scrollY < secTop + secHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${secId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // ==========================================
  // 2. AUDIO PLAYER (CUSTOM HTML5 PLAYER)
  // ==========================================
  const audio = document.getElementById('audio-player');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const playIcon = document.getElementById('play-icon');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const progressBarBg = document.getElementById('progress-bar-bg');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const timeCurrent = document.getElementById('time-current');
  const timeTotal = document.getElementById('time-total');
  const volumeSlider = document.getElementById('volume-slider');
  const volumeIcon = document.getElementById('volume-icon');
  const vinylWrapper = document.getElementById('vinyl-wrapper');
  const playerCover = document.getElementById('player-cover');
  const equalizer = document.getElementById('equalizer');
  const currentTrackTitle = document.getElementById('current-track-title');
  const currentTrackArtist = document.getElementById('current-track-artist');

  // Mini Player elements
  const miniPlayer = document.getElementById('mini-player');
  const miniTitle = document.getElementById('mini-title');
  const miniSub = document.getElementById('mini-sub');
  const miniPlay = document.getElementById('mini-play');
  const miniPlayIcon = document.getElementById('mini-play-icon');
  const miniPrev = document.getElementById('mini-prev');
  const miniNext = document.getElementById('mini-next');
  const miniProgressFill = document.getElementById('mini-progress-fill');

  let currentTrackIndex = 0;
  let isPlaying = false;

  const tracks = [
    // Genesis Album (13 Tracks)
    { title: 'Iced Hell', album: 'Genesis (2023)', src: 'assets/audio/01-iced-hell.mp3?v=4.4', cover: 'assets/images/tracks/01-iced-hell.png' },
    { title: 'Oh Lord!', album: 'Genesis (2023)', src: 'assets/audio/02-oh-lord.mp3?v=4.4', cover: 'assets/images/tracks/02-oh-lord.jpg' },
    { title: 'A Waste of Time', album: 'Genesis (2023)', src: 'assets/audio/03-a-waste-of-time.mp3?v=4.4', cover: 'assets/images/tracks/03-a-waste-of-time.jpg' },
    { title: 'My Curse', album: 'Genesis (2023)', src: 'assets/audio/04-my-curse.mp3?v=4.4', cover: 'assets/images/tracks/04-my-curse.jpg' },
    { title: 'King of Kings', album: 'Genesis (2023)', src: 'assets/audio/05-king-of-kings.mp3?v=4.4', cover: 'assets/images/tracks/05-king-of-kings.jpg' },
    { title: 'The Flail of God', album: 'Genesis (2023)', src: 'assets/audio/06-the-flail-of-god.mp3?v=4.4', cover: 'assets/images/tracks/06-the-flail-of-god.jpg' },
    { title: 'Down from the Sky', album: 'Genesis (2023)', src: 'assets/audio/07-down-from-the-sky.mp3?v=4.4', cover: 'assets/images/tracks/07-down-from-the-sky.png' },
    { title: 'The Countdown', album: 'Genesis (2023)', src: 'assets/audio/08-the-countdown.mp3?v=4.4', cover: 'assets/images/tracks/08-the-countdown.jpg' },
    { title: 'The White Rider', album: 'Genesis (2023)', src: 'assets/audio/09-the-white-rider.mp3?v=4.4', cover: 'assets/images/tracks/09-the-white-rider.jpeg' },
    { title: 'The Red Horse', album: 'Genesis (2023)', src: 'assets/audio/10-the-red-horse.mp3?v=4.4', cover: 'assets/images/tracks/10-the-red-horse.png' },
    { title: 'Famine', album: 'Genesis (2023)', src: 'assets/audio/11-famine.mp3?v=4.4', cover: 'assets/images/tracks/11-famine.jpg' },
    { title: 'Death', album: 'Genesis (2023)', src: 'assets/audio/12-death.mp3?v=4.4', cover: 'assets/images/tracks/12-death.png' },
    { title: 'The Last Horseman', album: 'Genesis (2023)', src: 'assets/audio/13-the-last-horseman.mp3?v=4.4', cover: 'assets/images/tracks/13-the-last-horseman.jpg' },
    // Singles (2nd Album - 5 Tracks)
    { title: 'Broken World', album: '2º Álbum • 2026+', src: 'assets/audio/singles/01-broken-world.mp3?v=7.8', cover: 'assets/images/singles/01-broken-world.jpg' },
    { title: 'To the Unknown', album: '2º Álbum • 2026+', src: 'assets/audio/singles/02-to-the-unknown.mp3?v=7.8', cover: 'assets/images/singles/02-to-the-unknown.jpg' },
    { title: 'For the Ancient One', album: '2º Álbum • 2026+', src: 'assets/audio/singles/03-for-the-ancient-one.mp3?v=7.8', cover: 'assets/images/singles/03-for-the-ancient-one.jpg' },
    { title: 'The Chosen Son', album: '2º Álbum • 2026+', src: 'assets/audio/singles/04-the-chosen-son.mp3?v=7.8', cover: 'assets/images/singles/04-the-chosen-son.jpg' },
    { title: 'For the Greater Good', album: '2º Álbum • 2026+', src: 'assets/audio/singles/05-for-the-greater-good.mp3?v=7.8', cover: 'assets/images/singles/05-for-the-greater-good.jpg' },
    // Official Covers & Tributes
    { title: 'Sad But True', album: 'Tributo Oficial', src: 'assets/audio/sad-but-true.mp3?v=4.4', cover: 'assets/images/tracks/sad-but-true.jpg' },
    { title: 'Selling My Soul', album: 'Tributo Oficial', src: 'assets/audio/selling-my-soul.mp3?v=4.4', cover: 'assets/images/tracks/selling-my-soul.jpg' }
  ];

  function loadTrack(index) {
    if (!tracks.length) return;
    if (index < 0) index = tracks.length - 1;
    if (index >= tracks.length) index = 0;
    currentTrackIndex = index;

    const track = tracks[currentTrackIndex];
    if (audio && track && track.src) {
      audio.src = track.src;
    }
    if (currentTrackTitle) currentTrackTitle.textContent = track.title;
    if (currentTrackArtist) currentTrackArtist.textContent = 'Persevera • ' + track.album;
    if (playerCover && track.cover) playerCover.src = track.cover;
    if (miniTitle) miniTitle.textContent = track.title;
    if (miniSub) miniSub.textContent = 'Persevera • ' + track.album;
    updateCardPlayButtons();
  }

  function togglePlay() {
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  }

  function playTrack() {
    if (!audio) return;
    audio.play().then(() => {
      isPlaying = true;
      updatePlayIcons(true);
      if (vinylWrapper) vinylWrapper.classList.add('spinning');
      if (equalizer) equalizer.classList.add('active');
      if (miniPlayer) miniPlayer.classList.add('visible');
      updateCardPlayButtons();
    }).catch(err => {
      console.log('Autoplay or file load prevented:', err);
    });
  }

  function pauseTrack() {
    if (audio) audio.pause();
    isPlaying = false;
    updatePlayIcons(false);
    if (vinylWrapper) vinylWrapper.classList.remove('spinning');
    if (equalizer) equalizer.classList.remove('active');
    updateCardPlayButtons();
  }

  function updatePlayIcons(playing) {
    if (playIcon) playIcon.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    if (miniPlayIcon) miniPlayIcon.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  }

  function updateCardPlayButtons() {
    const activeTrack = tracks[currentTrackIndex];
    const tDict = (typeof translations !== 'undefined' ? translations : (typeof window !== 'undefined' ? window.translations : null));
    const playLabel = (tDict && tDict[currentLang] && tDict[currentLang].btn_play_track) ? tDict[currentLang].btn_play_track : 'Play Track';
    const pauseLabel = (tDict && tDict[currentLang] && tDict[currentLang].btn_pause_track) ? tDict[currentLang].btn_pause_track : 'Pause';
    document.querySelectorAll('.btn-play-track').forEach(btn => {
      const btnTitle = btn.getAttribute('data-title');
      const icon = btn.querySelector('i');
      const label = btn.querySelector('span');
      if (activeTrack && btnTitle && btnTitle.toLowerCase() === activeTrack.title.toLowerCase()) {
        if (icon) icon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
        if (label) label.textContent = isPlaying ? pauseLabel : playLabel;
        btn.closest('.geomind-card')?.classList.toggle('playing', isPlaying);
      } else {
        if (icon) icon.className = 'fa-solid fa-play';
        if (label) label.textContent = playLabel;
        btn.closest('.geomind-card')?.classList.remove('playing');
      }
    });
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  // Audio Event Listeners
  if (audio) {
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        if (progressBarFill) progressBarFill.style.width = percent + '%';
        if (miniProgressFill) miniProgressFill.style.width = percent + '%';
        if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
        if (timeTotal) timeTotal.textContent = formatTime(audio.duration);
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      if (timeTotal) timeTotal.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('ended', () => {
      loadTrack(currentTrackIndex + 1);
      playTrack();
    });
  }

  // Progress Bar Seek
  if (progressBarBg) {
    progressBarBg.addEventListener('click', (e) => {
      const rect = progressBarBg.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      if (audio.duration) {
        audio.currentTime = (clickX / width) * audio.duration;
      }
    });
  }

  // Controls
  if (btnPlayPause) btnPlayPause.addEventListener('click', togglePlay);
  if (btnPrev) btnPrev.addEventListener('click', () => {
    loadTrack(currentTrackIndex - 1);
    if (isPlaying) playTrack();
  });
  if (btnNext) btnNext.addEventListener('click', () => {
    loadTrack(currentTrackIndex + 1);
    if (isPlaying) playTrack();
  });

  // Mini Player Controls
  if (miniPlay) miniPlay.addEventListener('click', togglePlay);
  if (miniPrev) miniPrev.addEventListener('click', () => {
    loadTrack(currentTrackIndex - 1);
    if (isPlaying) playTrack();
  });
  if (miniNext) miniNext.addEventListener('click', () => {
    loadTrack(currentTrackIndex + 1);
    if (isPlaying) playTrack();
  });

  // Volume Slider
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (audio) audio.volume = val;
      if (volumeIcon) {
        if (val === 0) {
          volumeIcon.className = 'fa-solid fa-volume-xmark';
        } else if (val < 0.5) {
          volumeIcon.className = 'fa-solid fa-volume-low';
        } else {
          volumeIcon.className = 'fa-solid fa-volume-high';
        }
      }
    });
  }

  // Show/Hide Floating Mini Player on Scroll
  function checkMiniPlayerVisibility() {
    const musicSection = document.getElementById('musicas');
    if (!musicSection || !miniPlayer) return;
    const rect = musicSection.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      if (isPlaying) {
        miniPlayer.classList.add('visible');
      }
    } else {
      if (!isPlaying) {
        miniPlayer.classList.remove('visible');
      }
    }
  }

  // Load first track by default
  loadTrack(0);

  // ==========================================
  // GEOMIND MULTI-CARD CAROUSEL ENGINE
  // ==========================================
  function setupGeomindCarousel(config) {
    const wrapper = document.getElementById(config.wrapperId);
    const viewport = document.getElementById(config.viewportId);
    const track = document.getElementById(config.trackId);
    const prevBtn = document.getElementById(config.prevBtnId);
    const nextBtn = document.getElementById(config.nextBtnId);
    const indicator = document.getElementById(config.indicatorId);
    const counter = document.getElementById(config.counterId);

    if (!track || !viewport) return null;

    const cards = track.querySelectorAll('.geomind-card');
    const totalCards = cards.length;
    let currentIndex = 0;

    function getVisibleCards() {
      if (window.innerWidth <= 640) return 1;
      if (window.innerWidth <= 992) return 2;
      return 3;
    }

    function getMaxIndex() {
      return Math.max(0, totalCards - getVisibleCards());
    }

    function goToCard(index) {
      const maxIndex = getMaxIndex();
      if (index < 0) index = maxIndex;
      if (index > maxIndex) index = 0;
      currentIndex = index;

      const targetCard = cards[currentIndex];
      if (targetCard) {
        const shiftX = targetCard.offsetLeft;
        track.style.transform = 'translateX(-' + shiftX + 'px)';
      }

      // Update Pill Indicator
      if (indicator) {
        const visibleCards = getVisibleCards();
        const pillWidthPercent = Math.min(100, Math.max(15, (visibleCards / totalCards) * 100));
        indicator.style.width = pillWidthPercent + '%';
        const maxShiftPercent = 100 - pillWidthPercent;
        const leftPercent = maxIndex > 0 ? (currentIndex / maxIndex) * maxShiftPercent : 0;
        indicator.style.left = leftPercent + '%';
      }

      // Update Counter Pill (e.g. 01 / 13)
      if (counter) {
        const curStr = (currentIndex + 1 < 10 ? '0' : '') + (currentIndex + 1);
        const totStr = (totalCards < 10 ? '0' : '') + totalCards;
        counter.textContent = curStr + ' / ' + totStr;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToCard(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToCard(currentIndex + 1);
      });
    }

    // Touch Swipe Gestures
    let touchStartX = 0;
    let touchEndX = 0;

    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDiff = touchStartX - touchEndX;
      if (Math.abs(swipeDiff) > 40) {
        if (swipeDiff > 0) {
          goToCard(currentIndex + 1); // Swipe Left -> Next
        } else {
          goToCard(currentIndex - 1); // Swipe Right -> Prev
        }
      }
    }, { passive: true });

    // Keyboard navigation when hovering/focused
    viewport.setAttribute('tabindex', '0');
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToCard(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToCard(currentIndex + 1);
      }
    });

    // Window resize handler
    window.addEventListener('resize', () => {
      if (wrapper && wrapper.classList.contains('active')) {
        goToCard(currentIndex);
      }
    });

    // Initialize first position
    goToCard(0);

    return {
      goToCard: goToCard,
      update: () => goToCard(currentIndex)
    };
  }

  // Initialize all three carousels
  const carouselGenesis = setupGeomindCarousel({
    wrapperId: 'carousel-genesis-wrapper',
    viewportId: 'viewport-genesis',
    trackId: 'track-genesis',
    prevBtnId: 'arrow-prev-genesis',
    nextBtnId: 'arrow-next-genesis',
    indicatorId: 'indicator-genesis',
    counterId: 'counter-genesis'
  });

  const carouselSingles = setupGeomindCarousel({
    wrapperId: 'carousel-singles-wrapper',
    viewportId: 'viewport-singles',
    trackId: 'track-singles',
    prevBtnId: 'arrow-prev-singles',
    nextBtnId: 'arrow-next-singles',
    indicatorId: 'indicator-singles',
    counterId: 'counter-singles'
  });

  const carouselTributes = setupGeomindCarousel({
    wrapperId: 'carousel-tributes-wrapper',
    viewportId: 'viewport-tributes',
    trackId: 'track-tributes',
    prevBtnId: 'arrow-prev-tributes',
    nextBtnId: 'arrow-next-tributes',
    indicatorId: 'indicator-tributes',
    counterId: 'counter-tributes'
  });

  // ==========================================
  // CATEGORY TABS: SWITCH BETWEEN GENESIS, SINGLES & TRIBUTES
  // ==========================================
  const tabBtns = document.querySelectorAll('.cat-tab-btn');
  const wrappers = {
    genesis: document.getElementById('carousel-genesis-wrapper'),
    singles: document.getElementById('carousel-singles-wrapper'),
    tributes: document.getElementById('carousel-tributes-wrapper')
  };
  const carousels = {
    genesis: carouselGenesis,
    singles: carouselSingles,
    tributes: carouselTributes
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-carousel');
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      Object.keys(wrappers).forEach(k => {
        if (wrappers[k]) {
          if (k === target) {
            wrappers[k].classList.add('active');
          } else {
            wrappers[k].classList.remove('active');
          }
        }
      });

      setTimeout(() => {
        if (carousels[target]) carousels[target].update();
      }, 50);
    });
  });

  // Card Play Buttons listener (connects cards to master player)
  document.querySelectorAll('.btn-play-track').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const src = btn.getAttribute('data-audio-src');
      const title = btn.getAttribute('data-title');
      const album = btn.getAttribute('data-album') || 'Persevera';
      const card = btn.closest('.geomind-card');
      const cover = card ? card.querySelector('.geomind-art-img')?.src : null;

      if (!src) return;

      const activeTrack = tracks[currentTrackIndex];
      if (activeTrack && activeTrack.title.toLowerCase() === (title || '').toLowerCase()) {
        togglePlay();
        return;
      }

      const cleanSrc = (src || '').split('?')[0];
      const foundIdx = tracks.findIndex(t => (t.src || '').split('?')[0] === cleanSrc || (t.title || '').toLowerCase() === (title || '').toLowerCase());
      if (foundIdx !== -1) {
        loadTrack(foundIdx);
        playTrack();
      } else {
        audio.src = src;
        if (currentTrackTitle) currentTrackTitle.textContent = title;
        if (currentTrackArtist) currentTrackArtist.textContent = 'Persevera • ' + album;
        if (miniTitle) miniTitle.textContent = title;
        if (miniSub) miniSub.textContent = 'Persevera • ' + album;
        if (playerCover && cover) playerCover.src = cover;
        playTrack();
      }
    });
  });


  // ==========================================
  // 3. VIDEOS & CINEMATICS THEATER (17 TRACKS & CLIPS)
  // ==========================================
  const mainVideoIframe = document.getElementById('main-video-iframe');
  const mainVideoNative = document.getElementById('main-video-native');
  const isLocalFileProtocol = (window.location.protocol === 'file:');

  function loadVideoInTheater(card, autoplay = false) {
    if (!card) return;
    const videoId = card.getAttribute('data-videoid');
    const embedUrl = card.getAttribute('data-embed-url');
    const driveUrl = card.getAttribute('data-drive-url');
    const localVideo = card.getAttribute('data-local-video');
    const thumbImg = card.querySelector('img')?.getAttribute('src') || '';

    // Always pause native player before switching
    if (mainVideoNative) {
      try { mainVideoNative.pause(); } catch (e) {}
    }

    // 1. If opened locally via file:// and a local MP4 exists for this clip, use native HTML5 video to avoid YouTube Error 153
    if (isLocalFileProtocol && localVideo && mainVideoNative) {
      if (mainVideoIframe) {
        mainVideoIframe.style.display = 'none';
        mainVideoIframe.src = 'about:blank';
      }
      mainVideoNative.style.display = 'block';
      if (thumbImg) mainVideoNative.poster = thumbImg;
      mainVideoNative.src = localVideo;
      if (autoplay) {
        mainVideoNative.play().catch(() => {});
      }
      return;
    }

    // 2. Otherwise use the iframe player (Google Drive embed or YouTube embed with strict-origin-when-cross-origin)
    if (mainVideoNative) {
      mainVideoNative.style.display = 'none';
      mainVideoNative.removeAttribute('src');
    }
    if (mainVideoIframe) {
      mainVideoIframe.style.display = 'block';
      if (embedUrl) {
        mainVideoIframe.src = embedUrl;
      } else if (isLocalFileProtocol && driveUrl) {
        mainVideoIframe.src = driveUrl;
      } else if (videoId) {
        const autoParam = autoplay ? 'autoplay=1&' : '';
        mainVideoIframe.src = `https://www.youtube.com/embed/${videoId}?${autoParam}feature=oembed`;
      }
    }
  }

  // Initialize default cover video (Broken World) seamlessly on both file:// and https://
  const initialActiveVideoCard = document.querySelector('#videos .video-card.active') || document.querySelector('#videos .video-card');
  if (initialActiveVideoCard && isLocalFileProtocol) {
    loadVideoInTheater(initialActiveVideoCard, false);
  }
  const videoCards = document.querySelectorAll('#videos .video-card');
  const videoTabBtns = document.querySelectorAll('#videos .video-tab-btn');

  // Helper to wire up any horizontal video carousel viewport + arrows + drag
  function setupHorizontalVideoCarousel(viewportId, prevBtnId, nextBtnId) {
    const vp = document.getElementById(viewportId);
    const prev = document.getElementById(prevBtnId);
    const next = document.getElementById(nextBtnId);

    function updateArrows() {
      if (!vp || !prev || !next) return;
      const maxScroll = vp.scrollWidth - vp.clientWidth - 2;
      prev.disabled = vp.scrollLeft <= 5;
      next.disabled = vp.scrollLeft >= maxScroll;
    }

    if (vp && prev && next) {
      prev.addEventListener('click', (e) => {
        e.preventDefault();
        const scrollAmt = Math.max(220, vp.clientWidth * 0.75);
        vp.scrollBy({ left: -scrollAmt, behavior: 'smooth' });
      });

      next.addEventListener('click', (e) => {
        e.preventDefault();
        const scrollAmt = Math.max(220, vp.clientWidth * 0.75);
        vp.scrollBy({ left: scrollAmt, behavior: 'smooth' });
      });

      vp.addEventListener('scroll', updateArrows, { passive: true });
      window.addEventListener('resize', updateArrows);
      setTimeout(updateArrows, 200);

      let isDown = false;
      let startX = 0;
      let scrollStart = 0;

      vp.addEventListener('mousedown', (e) => {
        isDown = true;
        vp.classList.add('is-dragging');
        startX = e.pageX - vp.offsetLeft;
        scrollStart = vp.scrollLeft;
      });

      vp.addEventListener('mouseleave', () => {
        isDown = false;
        vp.classList.remove('is-dragging');
      });

      vp.addEventListener('mouseup', () => {
        isDown = false;
        setTimeout(() => vp.classList.remove('is-dragging'), 50);
      });

      vp.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - vp.offsetLeft;
        const walk = (x - startX) * 1.5;
        vp.scrollLeft = scrollStart - walk;
      });
    }

    return { vp, updateArrows };
  }

  // 3A. Official Music Videos Carousel (#videos)
  const mainVideoCarousel = setupHorizontalVideoCarousel('vcarousel-viewport', 'vcarousel-prev', 'vcarousel-next');

  videoTabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      videoTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      videoCards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        const cats = cat.split(/\s+/);
        if (filter === 'all' || cats.includes(filter)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });

      if (mainVideoCarousel.vp) {
        mainVideoCarousel.vp.scrollTo({ left: 0, behavior: 'smooth' });
        setTimeout(mainVideoCarousel.updateArrows, 250);
      }
    });
  });

  videoCards.forEach((card) => {
    card.addEventListener('click', () => {
      const title = card.getAttribute('data-title') || card.querySelector('h4')?.textContent;
      const descKey = card.getAttribute('data-desc-key');
      const titleKey = card.getAttribute('data-title-key');
      const desc = card.getAttribute('data-desc');

      loadVideoInTheater(card, true);

      if (videoCurrentTitle) {
        if (titleKey) videoCurrentTitle.setAttribute('data-i18n', titleKey);
        if (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][titleKey]) {
          videoCurrentTitle.textContent = translations[currentLang][titleKey];
        } else {
          videoCurrentTitle.textContent = title;
        }
      }

      if (videoCurrentDesc) {
        if (descKey) videoCurrentDesc.setAttribute('data-i18n', descKey);
        if (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][descKey]) {
          videoCurrentDesc.textContent = translations[currentLang][descKey];
        } else {
          videoCurrentDesc.textContent = desc || '';
        }
      }

      videoCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

      if (window.innerWidth < 768) {
        const theater = document.querySelector('#videos .video-theater-container');
        if (theater) theater.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ==========================================
  // 3B. BEHIND THE SCENES VIDEO THEATER & CAROUSEL (#galeria)
  // ==========================================
  const btsIframe = document.getElementById('bts-video-iframe');
  const btsCurrentTitle = document.getElementById('bts-current-title');
  const btsCurrentDesc = document.getElementById('bts-current-desc');
  const btsCards = document.querySelectorAll('#galeria .bts-card');
  const btsTabBtns = document.querySelectorAll('#galeria .bts-tab-btn');
  const btsCarousel = setupHorizontalVideoCarousel('btscarousel-viewport', 'btscarousel-prev', 'btscarousel-next');

  btsTabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btsTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      btsCards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        const cats = cat.split(/\s+/);
        if (filter === 'all' || cats.includes(filter)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });

      if (btsCarousel.vp) {
        btsCarousel.vp.scrollTo({ left: 0, behavior: 'smooth' });
        setTimeout(btsCarousel.updateArrows, 250);
      }
    });
  });

  btsCards.forEach((card) => {
    card.addEventListener('click', () => {
      const embedUrl = card.getAttribute('data-embed-url');
      const title = card.getAttribute('data-title') || card.querySelector('h4')?.textContent;
      const descKey = card.getAttribute('data-desc-key');
      const titleKey = card.getAttribute('data-title-key');
      const desc = card.getAttribute('data-desc');

      if (btsIframe && embedUrl) {
        btsIframe.src = embedUrl;
      }

      if (btsCurrentTitle) {
        if (titleKey) btsCurrentTitle.setAttribute('data-i18n', titleKey);
        if (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][titleKey]) {
          btsCurrentTitle.textContent = translations[currentLang][titleKey];
        } else {
          btsCurrentTitle.textContent = title;
        }
      }

      if (btsCurrentDesc) {
        if (descKey) btsCurrentDesc.setAttribute('data-i18n', descKey);
        if (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][descKey]) {
          btsCurrentDesc.textContent = translations[currentLang][descKey];
        } else {
          btsCurrentDesc.textContent = desc || '';
        }
      }

      btsCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

      if (window.innerWidth < 768) {
        const theater = document.getElementById('bts-theater-container');
        if (theater) theater.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ==========================================
  // 4. PHOTO GALLERY & LIGHTBOX MODAL
  // ==========================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');

  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src');
      const capKey = `gallery_cap${idx + 1}`;
      let captionText = item.getAttribute('data-caption') || '';
      if (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][capKey]) {
        captionText = translations[currentLang][capKey];
      }

      if (lightboxImg) lightboxImg.src = src;
      if (lightboxCaption) lightboxCaption.textContent = captionText;
      if (lightboxModal) lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    if (lightboxModal) lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
  });



  // Video Theater quick buttons from carousel
  document.querySelectorAll('.btn-watch-theater').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const embedUrl = btn.getAttribute('data-embed-url');
      const videoId = btn.getAttribute('data-videoid');
      const title = btn.getAttribute('data-title');
      const mainIframe = document.getElementById('main-video-iframe');
      const videoTitle = document.getElementById('video-current-title');
      const videoSection = document.getElementById('videos');
      
      const targetCard = document.querySelector(`#videos .video-card[data-videoid="${videoId}"]`);
      if (targetCard) {
        loadVideoInTheater(targetCard, true);
      } else if (mainIframe) {
        if (embedUrl) {
          mainIframe.src = embedUrl;
        } else if (videoId) {
          mainIframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&feature=oembed';
        }
      }
      if (videoTitle && title) {
        videoTitle.textContent = title + ' (Official Music Video)';
      }

      // Reset filter tabs so the matching video is visible
      const allFilterBtn = document.querySelector('#videos .video-tab-btn[data-filter="all"]');
      if (allFilterBtn) {
        document.querySelectorAll('#videos .video-tab-btn').forEach(b => b.classList.remove('active'));
        allFilterBtn.classList.add('active');
        document.querySelectorAll('#videos .video-card').forEach(c => c.classList.remove('hidden'));
      }

      // Activate matching card in theater and update description
      document.querySelectorAll('#videos .video-card').forEach(card => {
        if (card.getAttribute('data-videoid') === videoId) {
          card.classList.add('active');
          const titleKey = card.getAttribute('data-title-key');
          const descKey = card.getAttribute('data-desc-key');
          if (videoCurrentTitle && titleKey && typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][titleKey]) {
            videoCurrentTitle.textContent = translations[currentLang][titleKey];
          }
          if (videoCurrentDesc) {
            if (descKey && typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][descKey]) {
              videoCurrentDesc.textContent = translations[currentLang][descKey];
            } else {
              videoCurrentDesc.textContent = card.getAttribute('data-desc') || '';
            }
          }
        } else {
          card.classList.remove('active');
        }
      });

      // Scroll smoothly to video theater
      if (videoSection) {
        videoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ==========================================
  // 5. OFFICIAL TRACK LYRICS MODAL
  // ==========================================
  const lyricsModal = document.getElementById('lyrics-modal');
  const lyricsModalTitle = document.getElementById('lyrics-modal-title');
  const lyricsModalText = document.getElementById('lyrics-modal-text');
  const lyricsTrackNumber = document.getElementById('lyrics-track-number');
  const lyricsClose = document.getElementById('lyrics-close');
  const lyricsCloseFooter = document.getElementById('btn-lyrics-close-footer');
  const lyricsBackdrop = document.getElementById('lyrics-backdrop');

  document.querySelectorAll('.btn-lyrics-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const trackIdx = parseInt(btn.getAttribute('data-track-index'), 10);
      
      if (typeof genesisLyrics !== 'undefined' && genesisLyrics[trackIdx]) {
        const item = genesisLyrics[trackIdx];
        if (lyricsModalTitle) lyricsModalTitle.textContent = item.title;
        if (lyricsModalText) lyricsModalText.textContent = item.lyrics;
        if (lyricsTrackNumber) {
          const num = trackIdx + 1;
          lyricsTrackNumber.textContent = 'TRACK ' + (num < 10 ? '0' : '') + num;
        }
        if (lyricsModal) {
          lyricsModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      }
    });
  });

  function closeLyricsModal() {
    if (lyricsModal) lyricsModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (lyricsClose) lyricsClose.addEventListener('click', closeLyricsModal);
  if (lyricsCloseFooter) lyricsCloseFooter.addEventListener('click', closeLyricsModal);
  if (lyricsBackdrop) lyricsBackdrop.addEventListener('click', closeLyricsModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lyricsModal && lyricsModal.classList.contains('active')) {
      closeLyricsModal();
    }
  });

  // Execute initial language setup (English by default, or saved choice)

  setLanguage(currentLang);

  console.log('Persevera Band Website initialized successfully with i18n support. 🤘');

  // ==========================================
  // 6. ROCK & HEAVY METAL LIVE NEWS TICKER
  // ==========================================
  const tickerEl = document.getElementById('metal-news-ticker');
  const tickerSourceTag = document.getElementById('ticker-source-tag');
  const tickerHeadline = document.getElementById('ticker-headline');
  const tickerCounter = document.getElementById('ticker-counter');
  const tickerPrevBtn = document.getElementById('ticker-prev');
  const tickerNextBtn = document.getElementById('ticker-next');
  const tickerToggleBtn = document.getElementById('ticker-toggle-play');
  const tickerMinBtn = document.getElementById('ticker-minimize');
  const tickerPill = document.getElementById('ticker-collapsed-pill');
  const tickerContent = document.getElementById('ticker-content');

  if (tickerEl && tickerHeadline) {
    let metalNewsList = [];
    let currentNewsIndex = 0;
    let tickerInterval = null;
    let isTickerPaused = false;
    const TICKER_DELAY = 5500; // 5.5 seconds per headline

    // Fallback news in case fetch fails
    const fallbackNews = [
      {
        source: "Roadie Crew",
        color: "#e50914",
        title: "DELAIN anuncia nova fase com a saída da vocalista Diana Leah e participações de Marko Hietala e Sharon den Adel",
        link: "https://roadiecrew.com"
      },
      {
        source: "Wikimetal",
        color: "#00d4ff",
        title: "Floor Jansen diz que saída do Nightwish marca novo começo em sua trajetória no metal",
        link: "https://www.wikimetal.com.br"
      },
      {
        source: "Blabbermouth",
        color: "#a855f7",
        title: "Iron Maiden, Korn and Bad Omens to Headline Major Rock Festivals Across the Globe",
        link: "https://blabbermouth.net"
      },
      {
        source: "Loudwire",
        color: "#10b981",
        title: "Heavy Metal Evolution: How modern bands are keeping authentic guitar-driven music alive",
        link: "https://loudwire.com"
      },
      {
        source: "Road to Metal",
        color: "#f59e0b",
        title: "Especial: A resiliência e maturidade estrutural do Heavy Metal autêntico brasileiro",
        link: "https://www.roadtometal.com.br"
      },
      {
        source: "Road to Metal",
        color: "#f59e0b",
        title: "Resenha Genesis: Álbum de estreia da Persevera entrega coesão e identidade autêntica do Heavy Metal nacional",
        link: "https://www.roadtometal.com.br/2024/01/resenha-persevera-genesis.html"
      },
      {
        source: "Metal Temple",
        color: "#a855f7",
        title: "International Review: Genesis delivers heavy, intense, epic metal with massive presence",
        link: "https://metal-temple.com/review/persevera-genesis/"
      },
      {
        source: "Mundo Metal",
        color: "#00d4ff",
        title: "Indicação BR: Persevera Metal Band e seu álbum Genesis em treze etapas",
        link: "https://www.mundometalbr.com/indicacao-br-persevera-metal-band/"
      },
      {
        source: "Dioses del Metal",
        color: "#10b981",
        title: "Prensa Española: Instrumental pesado y vigoroso que deja una estela de auténtico metal clásico",
        link: "https://diosesdelmetal.org/persevera-genesis-2023/"
      },
      {
        source: "Metal na Lata",
        color: "#ef4444",
        title: "Resenha Genesis: Heavy Metal moderno e cadenciado com riffs cortantes e elementos de groove",
        link: "https://metalnalata.com.br/persevera-genesis-2023/"
      },
      {
        source: "Rag Talent",
        color: "#f59e0b",
        title: "US Review: A Classic Metal Album From Persevera Hits Hard with massive sonic presence",
        link: "https://www.ragtalent.com/post/a-classic-metal-album-from-persevera-hits-hard"
      }
    ];

    function renderNewsItem(index) {
      if (!metalNewsList.length) return;
      const item = metalNewsList[index];

      // Smooth transition
      if (tickerContent) {
        tickerContent.style.opacity = '0';
        tickerContent.style.transform = 'translateY(4px)';
        tickerContent.style.transition = 'all 0.22s ease';
      }

      setTimeout(() => {
        if (tickerSourceTag) {
          tickerSourceTag.textContent = item.source || 'METAL';
          if (item.color) {
            tickerSourceTag.style.borderColor = item.color;
            tickerSourceTag.style.color = item.color;
            tickerSourceTag.style.backgroundColor = `${item.color}1a`; // 10% opacity
          }
        }

        if (tickerHeadline) {
          tickerHeadline.textContent = item.title;
          tickerHeadline.href = item.link;
          tickerHeadline.title = `${item.source}: ${item.title}`;
        }

        if (tickerCounter) {
          tickerCounter.textContent = `${index + 1}/${metalNewsList.length}`;
        }

        if (tickerContent) {
          tickerContent.style.opacity = '1';
          tickerContent.style.transform = 'translateY(0)';
        }
      }, 220);
    }

    function nextNews() {
      if (!metalNewsList.length) return;
      currentNewsIndex = (currentNewsIndex + 1) % metalNewsList.length;
      renderNewsItem(currentNewsIndex);
    }

    function prevNews() {
      if (!metalNewsList.length) return;
      currentNewsIndex = (currentNewsIndex - 1 + metalNewsList.length) % metalNewsList.length;
      renderNewsItem(currentNewsIndex);
    }

    function startTickerTimer() {
      stopTickerTimer();
      if (!isTickerPaused) {
        tickerInterval = setInterval(nextNews, TICKER_DELAY);
      }
    }

    function stopTickerTimer() {
      if (tickerInterval) {
        clearInterval(tickerInterval);
        tickerInterval = null;
      }
    }

    // Controls
    if (tickerNextBtn) tickerNextBtn.addEventListener('click', (e) => { e.preventDefault(); nextNews(); startTickerTimer(); });
    if (tickerPrevBtn) tickerPrevBtn.addEventListener('click', (e) => { e.preventDefault(); prevNews(); startTickerTimer(); });

    if (tickerToggleBtn) {
      tickerToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isTickerPaused = !isTickerPaused;
        const icon = tickerToggleBtn.querySelector('i');
        if (icon) icon.className = isTickerPaused ? 'fa-solid fa-play' : 'fa-solid fa-pause';
        tickerToggleBtn.title = isTickerPaused ? 'Retomar alternância' : 'Pausar alternância';
        if (isTickerPaused) {
          stopTickerTimer();
        } else {
          startTickerTimer();
        }
      });
    }

    // Pause on hover
    if (tickerEl) {
      tickerEl.addEventListener('mouseenter', stopTickerTimer);
      tickerEl.addEventListener('mouseleave', () => { if (!isTickerPaused) startTickerTimer(); });
    }

    // Minimize & Restore
    function setTickerMinimized(minimized) {
      if (minimized) {
        tickerEl.classList.add('is-minimized');
        if (tickerPill) tickerPill.classList.remove('hidden');
        localStorage.setItem('persevera_ticker_minimized', 'true');
      } else {
        tickerEl.classList.remove('is-minimized');
        if (tickerPill) tickerPill.classList.add('hidden');
        localStorage.setItem('persevera_ticker_minimized', 'false');
      }
    }

    if (tickerMinBtn) {
      tickerMinBtn.addEventListener('click', (e) => {
        e.preventDefault();
        setTickerMinimized(true);
      });
    }

    if (tickerPill) {
      tickerPill.addEventListener('click', (e) => {
        e.preventDefault();
        setTickerMinimized(false);
      });
    }

    // Check user preference
    const savedMinState = localStorage.getItem('persevera_ticker_minimized');
    if (savedMinState === 'true') {
      setTickerMinimized(true);
    }

    // Fetch live news JSON
    fetch('assets/data/metal-news.json')
      .then(resp => {
        if (!resp.ok) throw new Error('Network response not ok');
        return resp.json();
      })
      .then(data => {
        if (data && data.news && data.news.length > 0) {
          metalNewsList = data.news;
        } else {
          metalNewsList = fallbackNews;
        }
        renderNewsItem(0);
        startTickerTimer();
      })
      .catch(err => {
        console.warn('Could not load live metal news, using curated fallback:', err);
        metalNewsList = fallbackNews;
        renderNewsItem(0);
        startTickerTimer();
      });
  }
  // ==========================================
  // PRESS CAROUSEL: 2 ROWS & HORIZONTAL SLIDER
  // ==========================================
  function initPressCarousel() {
    const wrapper = document.querySelector('.press-carousel-wrapper');
    const viewport = document.getElementById('press-carousel-viewport');
    const track = document.getElementById('press-carousel-track');
    const prevBtn = document.getElementById('press-arrow-prev');
    const nextBtn = document.getElementById('press-arrow-next');
    const dotsContainer = document.getElementById('press-carousel-dots');
    const pageCurrentSpan = document.getElementById('press-page-current');
    const pageTotalSpan = document.getElementById('press-page-total');
    const filterBtns = document.querySelectorAll('.press-filter-btn');

    if (!wrapper || !viewport || !track) return;

    // Collect all original 24 cards
    const allCards = Array.from(track.querySelectorAll('.press-card'));
    if (allCards.length === 0) return;

    let currentFilter = 'all';
    let currentPage = 0;
    let totalPages = 1;
    let touchStartX = 0;

    function getCardsPerPage() {
      if (window.innerWidth <= 640) return 2;   // 1 col x 2 rows = 2 cards
      if (window.innerWidth <= 1024) return 4;  // 2 cols x 2 rows = 4 cards
      return 8;                                 // 4 cols x 2 rows = 8 cards
    }

    function getFilteredCards() {
      if (currentFilter === 'all') return allCards;
      return allCards.filter(card => card.dataset.category === currentFilter);
    }

    function renderCarousel() {
      const filtered = getFilteredCards();
      const perPage = getCardsPerPage();
      totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

      if (currentPage >= totalPages) {
        currentPage = totalPages - 1;
      }
      if (currentPage < 0) currentPage = 0;

      // Handle single-row styling if only 1 row needed
      if (totalPages === 1 && filtered.length <= (perPage / 2)) {
        wrapper.classList.add('single-row');
      } else {
        wrapper.classList.remove('single-row');
      }

      // Clear track and build .press-page elements
      track.innerHTML = '';
      for (let p = 0; p < totalPages; p++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'press-page';
        pageDiv.setAttribute('data-page-index', p);

        const chunk = filtered.slice(p * perPage, (p + 1) * perPage);
        chunk.forEach(card => {
          card.style.display = 'flex';
          pageDiv.appendChild(card);
        });

        track.appendChild(pageDiv);
      }

      // Move track to current page without animation during render
      updateSlide(false);

      // Render Dots
      if (dotsContainer) {
        dotsContainer.innerHTML = '';
        if (totalPages > 1) {
          for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'press-dot' + (i === currentPage ? ' active' : '');
            dot.setAttribute('aria-label', 'Página ' + (i + 1));
            dot.addEventListener('click', () => {
              currentPage = i;
              updateSlide(true);
            });
            dotsContainer.appendChild(dot);
          }
          dotsContainer.style.display = 'flex';
        } else {
          dotsContainer.style.display = 'none';
        }
      }

      // Update Counter
      if (pageCurrentSpan) pageCurrentSpan.textContent = currentPage + 1;
      if (pageTotalSpan) pageTotalSpan.textContent = totalPages;

      // Update Arrow states
      updateArrowStates();
    }

    function updateSlide(animate = true) {
      if (!animate) {
        track.style.transition = 'none';
      } else {
        track.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
      }

      track.style.transform = `translateX(-${currentPage * 100}%)`;

      if (!animate) {
        requestAnimationFrame(() => {
          track.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
        });
      }

      // Update Dots
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.press-dot');
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === currentPage);
        });
      }

      // Update Counter
      if (pageCurrentSpan) pageCurrentSpan.textContent = currentPage + 1;
      if (pageTotalSpan) pageTotalSpan.textContent = totalPages;

      updateArrowStates();
    }

    function updateArrowStates() {
      if (totalPages <= 1) {
        if (prevBtn) {
          prevBtn.disabled = true;
          prevBtn.style.opacity = '0';
          prevBtn.style.pointerEvents = 'none';
        }
        if (nextBtn) {
          nextBtn.disabled = true;
          nextBtn.style.opacity = '0';
          nextBtn.style.pointerEvents = 'none';
        }
      } else {
        if (prevBtn) {
          const isStart = (currentPage === 0);
          prevBtn.disabled = isStart;
          prevBtn.style.opacity = isStart ? '0.25' : '1';
          prevBtn.style.pointerEvents = isStart ? 'none' : 'auto';
        }
        if (nextBtn) {
          const isEnd = (currentPage >= totalPages - 1);
          nextBtn.disabled = isEnd;
          nextBtn.style.opacity = isEnd ? '0.25' : '1';
          nextBtn.style.pointerEvents = isEnd ? 'none' : 'auto';
        }
      }
    }

    // Navigation Event Listeners
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 0) {
          currentPage--;
          updateSlide(true);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
          currentPage++;
          updateSlide(true);
        }
      });
    }

    // Filter Buttons
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter || 'all';
        currentPage = 0;
        renderCarousel();
      });
    });

    // Touch Swipe for mobile/tablet
    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0 && currentPage < totalPages - 1) {
          currentPage++;
          updateSlide(true);
        } else if (diff < 0 && currentPage > 0) {
          currentPage--;
          updateSlide(true);
        }
      }
    }, { passive: true });

    // Keyboard Arrow Navigation
    wrapper.setAttribute('tabindex', '0');
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        if (currentPage > 0) {
          currentPage--;
          updateSlide(true);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentPage < totalPages - 1) {
          currentPage++;
          updateSlide(true);
        }
      }
    });

    // Handle Window Resize (debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        renderCarousel();
      }, 150);
    });

    // Initial render
    renderCarousel();
  }

  // Initialize Press Carousel
  initPressCarousel();

});
