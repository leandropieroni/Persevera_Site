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
    if (activeVideoCard) {
      const titleKey = activeVideoCard.getAttribute('data-title-key');
      const descKey = activeVideoCard.getAttribute('data-desc-key');
      if (titleKey && translations[lang] && translations[lang][titleKey] && videoCurrentTitle) {
        videoCurrentTitle.textContent = translations[lang][titleKey];
      }
      if (descKey && translations[lang] && translations[lang][descKey] && videoCurrentDesc) {
        videoCurrentDesc.textContent = translations[lang][descKey];
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

  // Apply initial language immediately
  setLanguage(currentLang);

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
  const videoCards = document.querySelectorAll('.video-card');
  const videoTabBtns = document.querySelectorAll('.video-tab-btn');

  // Video Carousel Navigation Arrows & Drag/Scroll Engine
  const vViewport = document.getElementById('vcarousel-viewport');
  const vPrevBtn = document.getElementById('vcarousel-prev');
  const vNextBtn = document.getElementById('vcarousel-next');

  function updateVideoArrows() {
    if (!vViewport || !vPrevBtn || !vNextBtn) return;
    const maxScroll = vViewport.scrollWidth - vViewport.clientWidth - 2;
    vPrevBtn.disabled = vViewport.scrollLeft <= 5;
    vNextBtn.disabled = vViewport.scrollLeft >= maxScroll;
  }

  if (vViewport && vPrevBtn && vNextBtn) {
    vPrevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const scrollAmt = Math.max(220, vViewport.clientWidth * 0.75);
      vViewport.scrollBy({ left: -scrollAmt, behavior: 'smooth' });
    });

    vNextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const scrollAmt = Math.max(220, vViewport.clientWidth * 0.75);
      vViewport.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    });

    vViewport.addEventListener('scroll', updateVideoArrows, { passive: true });
    window.addEventListener('resize', updateVideoArrows);
    setTimeout(updateVideoArrows, 200);

    // Mouse drag-to-scroll support for desktop
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    vViewport.addEventListener('mousedown', (e) => {
      isDown = true;
      vViewport.classList.add('is-dragging');
      startX = e.pageX - vViewport.offsetLeft;
      scrollStart = vViewport.scrollLeft;
    });

    vViewport.addEventListener('mouseleave', () => {
      isDown = false;
      vViewport.classList.remove('is-dragging');
    });

    vViewport.addEventListener('mouseup', () => {
      isDown = false;
      setTimeout(() => vViewport.classList.remove('is-dragging'), 50);
    });

    vViewport.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - vViewport.offsetLeft;
      const walk = (x - startX) * 1.5;
      vViewport.scrollLeft = scrollStart - walk;
    });
  }

  // Category Filter Tabs
  videoTabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      videoTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      document.querySelectorAll('.video-card').forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        const cats = cat.split(/\s+/);
        if (filter === 'all' || cats.includes(filter)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });

      // Reset carousel scroll position to beginning and update arrows
      if (vViewport) {
        vViewport.scrollTo({ left: 0, behavior: 'smooth' });
        setTimeout(updateVideoArrows, 250);
      }
    });
  });

  // Video card click listener
  videoCards.forEach((card) => {
    card.addEventListener('click', () => {
      const videoId = card.getAttribute('data-videoid');
      const title = card.getAttribute('data-title') || card.querySelector('h4')?.textContent;
      const descKey = card.getAttribute('data-desc-key');
      const titleKey = card.getAttribute('data-title-key');
      const desc = card.getAttribute('data-desc');

      // Update iframe source
      if (mainVideoIframe && videoId) {
        mainVideoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
      }

      // Update text
      if (videoCurrentTitle) {
        if (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][titleKey]) {
          videoCurrentTitle.textContent = translations[currentLang][titleKey];
        } else {
          videoCurrentTitle.textContent = title;
        }
      }

      if (videoCurrentDesc) {
        if (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][descKey]) {
          videoCurrentDesc.textContent = translations[currentLang][descKey];
        } else {
          videoCurrentDesc.textContent = desc || '';
        }
      }

      // Update active class
      document.querySelectorAll('.video-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      // Ensure clicked card is comfortably visible in the single row
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

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



  // Video Theater quick buttons from carousel
  document.querySelectorAll('.btn-watch-theater').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const videoId = btn.getAttribute('data-videoid');
      const title = btn.getAttribute('data-title');
      const mainIframe = document.getElementById('main-video-iframe');
      const videoTitle = document.getElementById('video-current-title');
      const videoSection = document.getElementById('videos');
      
      if (mainIframe && videoId) {
        mainIframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&enablejsapi=1';
      }
      if (videoTitle && title) {
        videoTitle.textContent = title + ' (Official Music Video)';
      }

      // Reset filter tabs so the matching video is visible
      const allFilterBtn = document.querySelector('.video-tab-btn[data-filter="all"]');
      if (allFilterBtn) {
        document.querySelectorAll('.video-tab-btn').forEach(b => b.classList.remove('active'));
        allFilterBtn.classList.add('active');
        document.querySelectorAll('.video-card').forEach(c => c.classList.remove('hidden'));
      }

      // Activate matching card in theater and update description
      document.querySelectorAll('.video-card').forEach(card => {
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
});
