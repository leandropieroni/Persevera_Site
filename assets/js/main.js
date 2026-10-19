/**
 * PERSEVERA HEAVY METAL BAND - MAIN JAVASCRIPT
 * Handles custom audio player, video switcher, photo lightbox, responsive navbar, and floating player.
 */

document.addEventListener('DOMContentLoaded', () => {

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
  const equalizer = document.getElementById('equalizer');
  const currentTrackTitle = document.getElementById('current-track-title');
  const playlistItems = document.querySelectorAll('.playlist-item');

  // Mini Player elements
  const miniPlayer = document.getElementById('mini-player');
  const miniTitle = document.getElementById('mini-title');
  const miniPlay = document.getElementById('mini-play');
  const miniPlayIcon = document.getElementById('mini-play-icon');
  const miniPrev = document.getElementById('mini-prev');
  const miniNext = document.getElementById('mini-next');
  const miniProgressFill = document.getElementById('mini-progress-fill');

  let currentTrackIndex = 0;
  let isPlaying = false;

  const tracks = [
    {
      title: 'Iced Hell',
      album: 'Genesis (2023)',
      src: 'assets/audio/iced-hell.mp3'
    },
    {
      title: 'Oh Lord!',
      album: 'Genesis (2023)',
      src: 'assets/audio/oh-lord.mp3'
    },
    {
      title: 'Selling My Soul',
      album: 'Black Sabbath Tribute',
      src: 'assets/audio/selling-my-soul.mp3'
    }
  ];

  function loadTrack(index) {
    if (index < 0) index = tracks.length - 1;
    if (index >= tracks.length) index = 0;
    currentTrackIndex = index;

    const track = tracks[currentTrackIndex];
    audio.src = track.src;
    currentTrackTitle.textContent = track.title;
    if (miniTitle) miniTitle.textContent = track.title;

    // Update Playlist UI
    playlistItems.forEach((item, idx) => {
      item.classList.remove('active');
      const statusIcon = item.querySelector('.track-status i');
      if (idx === currentTrackIndex) {
        item.classList.add('active');
        if (statusIcon) statusIcon.className = isPlaying ? 'fa-solid fa-wave-square' : 'fa-solid fa-play';
      } else {
        if (statusIcon) statusIcon.className = 'fa-solid fa-play';
      }
    });
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

      // Update active track icon in playlist
      const activeItem = document.querySelector('.playlist-item.active .track-status i');
      if (activeItem) activeItem.className = 'fa-solid fa-wave-square';
    }).catch(err => {
      console.warn('Playback prevented:', err);
    });
  }

  function pauseTrack() {
    audio.pause();
    isPlaying = false;
    updatePlayIcons(false);
    if (vinylWrapper) vinylWrapper.classList.remove('spinning');
    if (equalizer) equalizer.classList.remove('active');

    const activeItem = document.querySelector('.playlist-item.active .track-status i');
    if (activeItem) activeItem.className = 'fa-solid fa-pause';
  }

  function updatePlayIcons(playing) {
    if (playIcon) {
      playIcon.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }
    if (miniPlayIcon) {
      miniPlayIcon.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Audio Events
  if (audio) {
    audio.addEventListener('timeupdate', () => {
      const current = audio.currentTime;
      const total = audio.duration;
      if (!isNaN(total) && total > 0) {
        const percent = (current / total) * 100;
        if (progressBarFill) progressBarFill.style.width = `${percent}%`;
        if (miniProgressFill) miniProgressFill.style.width = `${percent}%`;
        if (timeCurrent) timeCurrent.textContent = formatTime(current);
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      if (timeTotal) timeTotal.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('ended', () => {
      // Auto play next track
      loadTrack(currentTrackIndex + 1);
      playTrack();
    });
  }

  // Click on progress bar to seek
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

  // Play/Pause button clicks
  if (btnPlayPause) btnPlayPause.addEventListener('click', togglePlay);
  if (miniPlay) miniPlay.addEventListener('click', togglePlay);

  // Prev / Next button clicks
  if (btnPrev) btnPrev.addEventListener('click', () => {
    loadTrack(currentTrackIndex - 1);
    playTrack();
  });
  if (miniPrev) miniPrev.addEventListener('click', () => {
    loadTrack(currentTrackIndex - 1);
    playTrack();
  });

  if (btnNext) btnNext.addEventListener('click', () => {
    loadTrack(currentTrackIndex + 1);
    playTrack();
  });
  if (miniNext) miniNext.addEventListener('click', () => {
    loadTrack(currentTrackIndex + 1);
    playTrack();
  });

  // Playlist items click
  playlistItems.forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-index'), 10);
      loadTrack(idx);
      playTrack();
    });
  });

  // Volume Slider
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      audio.volume = val;
      if (val === 0) {
        volumeIcon.className = 'fa-solid fa-volume-xmark';
      } else if (val < 0.5) {
        volumeIcon.className = 'fa-solid fa-volume-low';
      } else {
        volumeIcon.className = 'fa-solid fa-volume-high';
      }
    });
  }

  // Initialize first track without autoplay
  loadTrack(0);

  // Check mini player visibility when scrolling
  const musicSection = document.getElementById('musicas');
  function checkMiniPlayerVisibility() {
    if (!musicSection || !miniPlayer) return;
    const musicBottom = musicSection.offsetTop + musicSection.offsetHeight;
    if (window.scrollY > musicBottom || isPlaying) {
      miniPlayer.classList.add('visible');
    } else {
      miniPlayer.classList.remove('visible');
    }
  }

  // ==========================================
  // 3. VIDEO THEATER (YOUTUBE SWITCHER)
  // ==========================================
  const videoCards = document.querySelectorAll('.video-card');
  const mainVideoIframe = document.getElementById('main-video-iframe');
  const videoCurrentTitle = document.getElementById('video-current-title');
  const videoCurrentDesc = document.getElementById('video-current-desc');

  videoCards.forEach(card => {
    card.addEventListener('click', () => {
      const videoId = card.getAttribute('data-videoid');
      const title = card.getAttribute('data-title');
      const desc = card.getAttribute('data-desc');

      // Update iframe source
      if (mainVideoIframe) {
        mainVideoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
      }

      // Update text
      if (videoCurrentTitle) videoCurrentTitle.textContent = title;
      if (videoCurrentDesc) videoCurrentDesc.textContent = desc;

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

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src');
      const caption = item.getAttribute('data-caption');

      if (lightboxImg) lightboxImg.src = src;
      if (lightboxCaption) lightboxCaption.textContent = caption || '';
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

  console.log('Persevera Band Website initialized successfully. 🤘');
});
