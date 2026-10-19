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

  const videoCards = document.querySelectorAll('.video-card');
  const videoCurrentTitle = document.getElementById('video-current-title');
  const videoCurrentDesc = document.getElementById('video-current-desc');

  function setLanguage(lang) {
    if (typeof translations === 'undefined' || !translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('persevera_lang', lang);

    document.documentElement.lang = (lang === 'pt' ? 'pt-BR' : (lang === 'es' ? 'es' : 'en'));

    // Update text elements with data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });

    // Update placeholders
    const placeholderEls = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderEls.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[lang] && translations[lang][key]) {
        el.placeholder = translations[lang][key];
      }
    });

    // Update titles
    const titleEls = document.querySelectorAll('[data-i18n-title]');
    titleEls.forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (translations[lang] && translations[lang][key]) {
        el.title = translations[lang][key];
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
    if (activeVideoCard && videoCards.length > 0) {
      const activeIdx = Array.from(videoCards).indexOf(activeVideoCard);
      const descKey = `v${activeIdx + 1}_desc`;
      const titleKey = `v${activeIdx + 1}_title`;
      if (translations[lang][descKey] && videoCurrentDesc) {
        videoCurrentDesc.textContent = translations[lang][descKey];
      }
      if (translations[lang][titleKey] && videoCurrentTitle) {
        videoCurrentTitle.textContent = translations[lang][titleKey];
      }
    }
  }

  // Language button click events
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang) {
        setLanguage(targetLang);
      }
    });
  });

  // Contact form submission listener with localized message
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang].form_alert_success)
        ? translations[currentLang].form_alert_success
        : 'Message sent successfully! Persevera production will be in touch soon. 🤘';
      alert(msg);
      contactForm.reset();
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
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
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
    { title: 'Iced Hell', album: 'Genesis (2023)', src: 'assets/audio/iced-hell.mp3', cover: 'assets/images/logo-psvrn-square.jpg' },
    { title: 'Oh Lord!', album: 'Genesis (2023)', src: 'assets/audio/oh-lord.mp3', cover: 'assets/images/logo-centered.jpg' },
    { title: 'Sad But True', album: 'Tributo Oficial', src: 'assets/audio/sad-but-true.mp3', cover: 'assets/images/logo-grunge.jpg' },
    { title: 'Selling My Soul', album: 'Tributo Oficial', src: 'assets/audio/selling-my-soul.mp3', cover: 'assets/images/logo-centered.jpg' }
  ];

  function loadTrack(index) {
    if (!tracks.length) return;
    if (index < 0) index = tracks.length - 1;
    if (index >= tracks.length) index = 0;
    currentTrackIndex = index;

    const track = tracks[currentTrackIndex];
    if (track && track.src) {
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
    audio.pause();
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
    document.querySelectorAll('.btn-play-track').forEach(btn => {
      const btnTitle = btn.getAttribute('data-title');
      const icon = btn.querySelector('i');
      const label = btn.querySelector('span');
      if (activeTrack && btnTitle && btnTitle.toLowerCase() === activeTrack.title.toLowerCase()) {
        if (icon) icon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
        if (label) label.textContent = isPlaying ? 'Pausar' : 'Ouvir Faixa';
        btn.closest('.geomind-card')?.classList.toggle('playing', isPlaying);
      } else {
        if (icon) icon.className = 'fa-solid fa-play';
        if (label) label.textContent = 'Ouvir Faixa';
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
      audio.volume = val;
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

  // Initialize both carousels
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

  // ==========================================
  // CATEGORY TABS: SWITCH BETWEEN GENESIS & SINGLES
  // ==========================================
  const tabBtnGenesis = document.getElementById('tab-btn-genesis');
  const tabBtnSingles = document.getElementById('tab-btn-singles');
  const wrapperGenesis = document.getElementById('carousel-genesis-wrapper');
  const wrapperSingles = document.getElementById('carousel-singles-wrapper');

  if (tabBtnGenesis && tabBtnSingles && wrapperGenesis && wrapperSingles) {
    tabBtnGenesis.addEventListener('click', () => {
      tabBtnGenesis.classList.add('active');
      tabBtnSingles.classList.remove('active');
      wrapperGenesis.classList.add('active');
      wrapperSingles.classList.remove('active');
      setTimeout(() => {
        if (carouselGenesis) carouselGenesis.update();
      }, 50);
    });

    tabBtnSingles.addEventListener('click', () => {
      tabBtnSingles.classList.add('active');
      tabBtnGenesis.classList.remove('active');
      wrapperSingles.classList.add('active');
      wrapperGenesis.classList.remove('active');
      setTimeout(() => {
        if (carouselSingles) carouselSingles.update();
      }, 50);
    });
  }

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

      const foundIdx = tracks.findIndex(t => t.src === src || t.title.toLowerCase() === (title || '').toLowerCase());
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
  // 3. VIDEOS & CINEMATICS THEATER
  // ==========================================
  const mainVideoIframe = document.getElementById('main-video-iframe');

  videoCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      const videoId = card.getAttribute('data-videoid');
      const titleEl = card.querySelector('h4');
      const descKey = `v${idx + 1}_desc`;

      // Update iframe source
      if (mainVideoIframe) {
        mainVideoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
      }

      // Update text
      if (videoCurrentTitle && titleEl) {
        videoCurrentTitle.textContent = titleEl.textContent;
      }
      if (videoCurrentDesc) {
        if (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][descKey]) {
          videoCurrentDesc.textContent = translations[currentLang][descKey];
        } else {
          videoCurrentDesc.textContent = card.getAttribute('data-desc') || '';
        }
      }

      // Update active class
      videoCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      // Scroll smoothly to video theater if on small screens
      if (window.innerWidth < 768) {
        const theater = document.querySelector('.video-theater-container');
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

  // Execute initial language setup (English by default, or saved choice)
  setLanguage(currentLang);

  console.log('Persevera Band Website initialized successfully with i18n support. 🤘');
});
