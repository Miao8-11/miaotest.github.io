// ==========================================
// THEME SWITCHER - 2个主题切换
// ==========================================
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// 主题列表：Vibrant (默认) 和 Pastel
const themes = ['vibrant', 'pastel'];
let currentThemeIndex = 0;

// 从 localStorage 加载主题
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'pastel') {
    body.classList.add('theme-pastel');
    currentThemeIndex = 1;
}

// 切换主题 - 2个主题循环
themeToggle.addEventListener('click', (e) => {
    e.preventDefault();
    
    // 切换到下一个主题
    currentThemeIndex = (currentThemeIndex + 1) % 2;
    
    if (currentThemeIndex === 1) {
        // 切换到 Pastel
        body.classList.add('theme-pastel');
        localStorage.setItem('theme', 'pastel');
    } else {
        // 切换回 Vibrant (默认)
        body.classList.remove('theme-pastel');
        localStorage.setItem('theme', 'vibrant');
    }
    
    // 更新粒子颜色
    updateParticleColors();
});

// ==========================================
// PARTICLE BACKGROUND
// ==========================================
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 80;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    
    draw() {
        // 根据主题切换粒子颜色
        const isPastel = body.classList.contains('theme-pastel');
        ctx.fillStyle = isPastel 
            ? 'rgba(158, 197, 226, 0.5)'  // Pastel 天蓝色
            : 'rgba(242, 183, 5, 0.5)';   // Vibrant 金黄色
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function updateParticleColors() {
    // 粒子颜色会在下一帧自动更新
}

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ==========================================
// FULLPAGE SCROLL SYSTEM
// ==========================================
class FullPageScroll {
    constructor() {
        this.sections = document.querySelectorAll('.section');
        this.dots = document.querySelectorAll('.dot');
        this.navLinks = document.querySelectorAll('.nav-menu a');
        this.bottomNav = document.getElementById('bottomNav');
        this.bottomNavBtn = document.getElementById('bottomNavBtn');
        this.current = 0;
        this.isScrolling = false;
        
        this.init();
    }
    
    init() {
        // Bottom nav button click
        if (this.bottomNavBtn) {
            this.bottomNavBtn.addEventListener('click', () => this.next());
        }
        
        // Monitor scroll to show/hide bottom button
        this.sections.forEach(section => {
            section.addEventListener('scroll', () => this.checkBottomNav());
        });
        
        // Wheel event
        window.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        
        // Keyboard
        window.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Dots navigation
        this.dots.forEach((dot, i) => {
            dot.addEventListener('click', () => this.goTo(i));
        });
        
        // Nav links
        this.navLinks.forEach((link, i) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.goTo(i);
            });
        });
        
        // Touch events - 改进移动端滚动检测
        let touchStart = 0;
        let touchStartTime = 0;
        
        window.addEventListener('touchstart', (e) => {
            touchStart = e.touches[0].clientY;
            touchStartTime = Date.now();
        });
        
        window.addEventListener('touchmove', (e) => {
            // 允许section内部滚动
            const activeSection = this.sections[this.current];
            const touchCurrent = e.touches[0].clientY;
            const diff = touchStart - touchCurrent;
            
            const atTop = activeSection.scrollTop === 0;
            const atBottom = activeSection.scrollHeight - activeSection.scrollTop <= activeSection.clientHeight + 10;
            
            // 只在边界时阻止默认行为
            if ((diff > 0 && atBottom) || (diff < 0 && atTop)) {
                // 不阻止，让touchend处理
            }
        });
        
        window.addEventListener('touchend', (e) => {
            if (this.isScrolling) return;
            
            const touchEnd = e.changedTouches[0].clientY;
            const diff = touchStart - touchEnd;
            const touchDuration = Date.now() - touchStartTime;
            
            const activeSection = this.sections[this.current];
            const atTop = activeSection.scrollTop === 0;
            const atBottom = activeSection.scrollHeight - activeSection.scrollTop <= activeSection.clientHeight + 10;
            
            // 滑动阈值和时间检测
            if (Math.abs(diff) > 80 && touchDuration < 400) {
                if (diff < 0 && atTop && this.current > 0) {
                    // 向下拉（切换到上一个section）
                    e.preventDefault();
                    this.prev();
                }
                // 向上拉不自动切换，需要点击底部按钮
            }
        });
    }
    
    checkBottomNav() {
        const activeSection = this.sections[this.current];
        const atBottom = activeSection.scrollHeight - activeSection.scrollTop <= activeSection.clientHeight + 10;
        const hasNext = this.current < this.sections.length - 1;
        
        if (this.bottomNav) {
            if (atBottom && hasNext) {
                this.bottomNav.classList.add('show');
            } else {
                this.bottomNav.classList.remove('show');
            }
        }
    }
    
    handleWheel(e) {
        if (this.isScrolling) return;
        
        const activeSection = this.sections[this.current];
        const atTop = activeSection.scrollTop === 0;
        
        // 只在向上滚动到顶部时自动切换到上一个section
        if (e.deltaY < 0 && atTop) {
            e.preventDefault();
            this.prev();
        }
        
        // 向下滚动不自动切换，需要点击底部按钮
    }
    
    handleKeyboard(e) {
        if (this.isScrolling) return;
        
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            this.next();
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            this.prev();
        }
    }
    
    next() {
        if (this.current < this.sections.length - 1) {
            this.goTo(this.current + 1);
        }
    }
    
    prev() {
        if (this.current > 0) {
            this.goTo(this.current - 1);
        }
    }
    
    goTo(index) {
        if (index === this.current || this.isScrolling) return;
        if (index < 0 || index >= this.sections.length) return;
        
        this.isScrolling = true;
        
        // Hide bottom nav during transition
        if (this.bottomNav) {
            this.bottomNav.classList.remove('show');
        }
        
        // Update sections
        this.sections[this.current].classList.remove('active');
        this.sections[index].classList.add('active');
        this.sections[index].scrollTop = 0;
        
        // Update dots
        this.dots[this.current].classList.remove('active');
        this.dots[index].classList.add('active');
        
        this.current = index;
        
        // Trigger animations
        this.animate(index);
        
        setTimeout(() => {
            this.isScrolling = false;
            // Check if bottom nav should show after transition
            this.checkBottomNav();
        }, 800);
    }
    
    animate(index) {
        const section = this.sections[index];
        const elements = section.querySelectorAll('.music-card, .photo-card, .funsies-card');
        
        elements.forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.6s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, i * 100);
        });
    }
}

// Initialize
new FullPageScroll();

// ==========================================
// TODAY'S MOOD SYSTEM
// ==========================================
const moods = {
    songss: {
        color: '#E64833',
        description: 'Songs that make me think of you :]'
    },
    chill: {
        color: '#90AEAD',
        description: 'How silence feels next to you'
    },
    others: {
        color: '#874F41',
        description: 'We have too many songs frfr smh'
    },
    huhh: {
        color: '#244855',
        description: 'you found a secret!!'
    }
};

// Mood visibility toggle
const moodToggle = document.getElementById('moodToggle');
const moodSection = document.getElementById('moodSection'); // Ensure you have a section for moods

// Get secret mood element and create it if it doesn't exist
const secretMood = document.getElementById('secretMood') || (() => {
    const element = document.createElement('div');
    element.id = 'secretMood';
    element.innerHTML = `
        <div class="mood-item" style="background-color: ${moods.huhh.color}">
            <h3>SECRET MOOD: ${moods.huhh.description}</h3>
        </div>
    `;
    moodSection.appendChild(element);
    return element;
})();

moodToggle.addEventListener('change', () => {
    moodSection.style.display = moodToggle.checked ? 'block' : 'none';
    secretMood.style.display = moodToggle.checked ? 'block' : 'none'; // Show secret mood when toggled
});

// Initial state
moodSection.style.display = moodToggle.checked ? 'block' : 'none';
secretMood.style.display = 'none'; // Hide secret mood initially

function setTodaysMood() {
    const genres = Object.keys(moods);
    const day = new Date().getDay();
    const genre = genres[day % genres.length];
    
    document.getElementById('moodGenre').textContent = genre.toUpperCase();
    document.getElementById('moodDesc').textContent = moods[genre].description;
}

setTodaysMood();

// ==========================================
// MUSIC DATA
// ==========================================
const musicTracks = [
    { 
        title: 'Neon Dreams', 
        genre: 'electronic',
        artist: 'Synthwave Collective',
        file: 'music/track1.mp3',
        cover: 'images/cover1.jpg'
    },
    { 
        title: 'Midnight Coffee', 
        genre: 'chill',
        artist: 'Lo-Fi Beats',
        file: 'music/track2.mp3',
        cover: 'images/cover2.jpg'
    },
    { 
        title: 'Thunder Road', 
        genre: 'rock',
        artist: 'Electric Wolves',
        file: 'music/track3.mp3',
        cover: 'images/cover3.jpg'
    },
    { 
        title: 'Celestial Drift', 
        genre: 'ambient',
        artist: 'Space Echoes',
        file: 'music/track4.mp3',
        cover: 'images/cover4.jpg'
    },
    { 
        title: 'Pixel Paradise', 
        genre: 'electronic',
        artist: 'Retro Wave',
        file: 'music/track5.mp3',
        cover: 'images/cover5.jpg'
    },
    { 
        title: 'Rainy Day Vibes', 
        genre: 'chill',
        artist: 'Chill Hop Nation',
        file: 'music/track6.mp3',
        cover: 'images/cover6.jpg'
    }
];

// Current playing audio
let currentAudio = null;
let currentPlayingCard = null;

function loadMusic() {
    const grid = document.getElementById('musicGrid');
    grid.innerHTML = '';
    
    musicTracks.forEach((track, index) => {
        const card = document.createElement('div');
        card.className = 'music-card';
        card.dataset.genre = track.genre;
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="music-cover" style="background-image: url('${track.cover}')">
                <div class="play-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            </div>
            <div class="music-info-box">
                <h4 class="track-title">${track.title}</h4>
                <p class="track-artist">${track.artist}</p>
                <p class="track-genre">${track.genre.toUpperCase()}</p>
            </div>
            <div class="audio-player">
                <audio src="${track.file}" preload="metadata"></audio>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="controls">
                    <button class="control-btn play-pause">
                        <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        <svg class="pause-icon" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                    </button>
                    <span class="time-display">0:00 / 0:00</span>
                    <button class="control-btn volume-btn">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
        initAudioPlayer(card, track);
    });
}

function initAudioPlayer(card, track) {
    const audio = card.querySelector('audio');
    const playPauseBtn = card.querySelector('.play-pause');
    const playIcon = card.querySelector('.play-icon');
    const pauseIcon = card.querySelector('.pause-icon');
    const progressBar = card.querySelector('.progress-bar');
    const progressFill = card.querySelector('.progress-fill');
    const timeDisplay = card.querySelector('.time-display');
    const playBtn = card.querySelector('.play-btn');
    const volumeBtn = card.querySelector('.volume-btn');
    
    // Format time
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Update time display
    audio.addEventListener('loadedmetadata', () => {
        timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
    });
    
    // Update progress
    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${progress}%`;
        timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    });
    
    // Play/Pause toggle
    function togglePlay() {
        if (currentAudio && currentAudio !== audio) {
            currentAudio.pause();
            currentPlayingCard.querySelector('.play-icon').style.display = 'block';
            currentPlayingCard.querySelector('.pause-icon').style.display = 'none';
            currentPlayingCard.classList.remove('playing');
        }
        
        if (audio.paused) {
            audio.play();
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            card.classList.add('playing');
            currentAudio = audio;
            currentPlayingCard = card;
        } else {
            audio.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            card.classList.remove('playing');
        }
    }
    
    playPauseBtn.addEventListener('click', togglePlay);
    playBtn.addEventListener('click', togglePlay);
    
    // Progress bar click
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    });
    
    // Volume toggle
    volumeBtn.addEventListener('click', () => {
        audio.muted = !audio.muted;
        volumeBtn.style.opacity = audio.muted ? '0.5' : '1';
    });
    
    // Auto pause when ended
    audio.addEventListener('ended', () => {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        card.classList.remove('playing');
        progressFill.style.width = '0%';
        audio.currentTime = 0;
    });
}

// Music filters
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        const cards = document.querySelectorAll('.music-card');
        
        cards.forEach(card => {
            if (filter === 'all' || card.dataset.genre === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

loadMusic();

// ==========================================
// PHOTOS DATA
// ==========================================
const photos = [
    { image: 'images/photo1.svg', caption: 'Tokyo Nights 🌃' },
    { image: 'images/photo2.svg', caption: 'Coffee & Code ☕' },
    { image: 'images/photo3.svg', caption: 'Pixel Perfect 🎮' },
    { image: 'images/photo4.svg', caption: 'Neon Aesthetic 💜' },
    { image: 'images/photo5.svg', caption: 'Retro Vibes 📼' },
    { image: 'images/photo6.svg', caption: 'Digital Dreams ✨' },
    { image: 'images/photo7.svg', caption: 'Synthwave Sunset 🌅' },
    { image: 'images/photo8.svg', caption: 'Glitch Art 🎨' },
    { image: 'images/photo9.svg', caption: 'Cyberpunk City 🏙️' }
];

function loadPhotos() {
    const grid = document.getElementById('photosGrid');
    grid.innerHTML = '';
    
    photos.forEach((photo, index) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.dataset.photoIndex = index;
        
        card.innerHTML = `
            <img src="${photo.image}" alt="${photo.caption}" class="photo-img">
            <div class="photo-overlay">
                <p class="photo-caption">${photo.caption}</p>
            </div>
        `;
        
        // 点击照片打开灯箱
        card.addEventListener('click', () => openLightbox(index));
        
        grid.appendChild(card);
    });
}

// 灯箱功能
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(index) {
    const photo = photos[index];
    lightboxImg.src = photo.image;
    lightboxImg.alt = photo.caption;
    lightboxCaption.textContent = ''; // 不显示图片名字
    
    // 显示灯箱
    lightbox.style.display = 'flex';
    setTimeout(() => {
        lightbox.classList.add('active');
    }, 10);
    
    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    setTimeout(() => {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

// 关闭按钮
lightboxClose.addEventListener('click', closeLightbox);

// 点击背景关闭
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// ESC 键关闭
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
    }
});

loadPhotos();

// ==========================================
// FUNSIES DATA
// ==========================================
const funsies = [
    {
        title: 'Awesome Stats',
        description: 'a year of so many achievements :]',
        image: 'images/game1.svg',
        tags: ['RPG', 'Horror', 'Indie']
    },
    {
        title: 'Games!!',
        description: 'what does our gaming history look like?',
        image: 'images/game2.svg',
        tags: ['Metroidvania', 'Action', 'Indie']
    },
    {
        title: 'Celeste',
        description: 'Help Madeline survive her journey to the top of Celeste Mountain in this tight platformer.',
        image: 'images/game3.svg',
        tags: ['Platformer', 'Indie', 'Story']
    },
    {
        title: 'Stardew Valley',
        description: 'Build the farm of your dreams, raise animals, grow crops, and become part of the community.',
        image: 'images/game4.svg',
        tags: ['Simulation', 'Farming', 'Relaxing']
    },
    {
        title: 'Hades',
        description: 'Defy the god of the dead as you hack and slash your way out of the Underworld.',
        image: 'images/game5.svg',
        tags: ['Roguelike', 'Action', 'Mythology']
    },
    {
        title: 'Undertale',
        description: 'A quirky RPG where nobody has to die. Your choices matter in this emotional journey.',
        image: 'images/game6.svg',
        tags: ['RPG', 'Indie', 'Bullet Hell']
    }
];

function loadFunsies() {
    const grid = document.getElementById('funsiesGrid');
    grid.innerHTML = '';
    
    funsies.forEach(funsies => {
        const card = document.createElement('div');
        card.className = 'funsies-card';
        
        const tags = funsies.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        card.innerHTML = `
            <img src="${funsies.image}" alt="${funsies.title}" class="funsies-img">
            <div class="funsies-overlay">
                <h3 class="funsies-title">${funsies.title}</h3>
                <p class="funsies-desc">${funsies.description}</p>
                <div class="funsies-tags">${tags}</div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

loadFunsies();

// ==========================================
// SLEEPING CAT INTERACTION
// ==========================================
const sleepingCat = document.getElementById('sleepingCat');
const sleepingCatContainer = document.querySelector('.sleeping-cat-container');
const petHand = document.getElementById('petHand');
const purringAudio = document.getElementById('purringAudio');
let isPetting = false;
let isMobile = window.innerWidth <= 768;
let fadeInterval = null;

// 检测设备类型
window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 768;
});

function updatePetHandPosition(x, y) {
    if (!petHand) return;
    // 使用 pageX/pageY 考虑滚动位置
    // fixed 定位使用的是视口坐标，所以直接用 clientX/clientY
    petHand.style.left = x + 'px';
    petHand.style.top = y + 'px';
    petHand.style.transform = 'translate(-50%, -50%)';
    console.log('Pet hand position - x:', x, 'y:', y);
    console.log('Window scroll - x:', window.scrollX, 'y:', window.scrollY);
}

// 音频淡入淡出函数
function fadeInAudio() {
    if (!purringAudio) return;
    
    // 清除之前的淡出
    if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
    }
    
    // 从随机位置开始播放
    if (purringAudio.duration) {
        purringAudio.currentTime = Math.random() * purringAudio.duration;
    }
    
    // 从 0 开始
    purringAudio.volume = 0;
    purringAudio.play().catch(e => console.log('Audio play failed:', e));
    
    // 淡入到 1.0，持续 500ms
    const fadeInDuration = 500;
    const steps = 20;
    const stepTime = fadeInDuration / steps;
    const volumeStep = 1.0 / steps;
    let currentStep = 0;
    
    fadeInterval = setInterval(() => {
        currentStep++;
        purringAudio.volume = Math.min(currentStep * volumeStep, 1.0);
        
        if (currentStep >= steps) {
            clearInterval(fadeInterval);
            fadeInterval = null;
        }
    }, stepTime);
    
    console.log('Purring audio fade in started');
}

function fadeOutAudio() {
    if (!purringAudio) return;
    
    // 清除之前的淡入
    if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
    }
    
    // 淡出到 0，持续 500ms
    const fadeOutDuration = 500;
    const steps = 20;
    const stepTime = fadeOutDuration / steps;
    const startVolume = purringAudio.volume;
    const volumeStep = startVolume / steps;
    let currentStep = 0;
    
    fadeInterval = setInterval(() => {
        currentStep++;
        purringAudio.volume = Math.max(startVolume - (currentStep * volumeStep), 0);
        
        if (currentStep >= steps) {
            clearInterval(fadeInterval);
            fadeInterval = null;
            purringAudio.pause();
            console.log('Purring audio fade out completed');
        }
    }, stepTime);
    
    console.log('Purring audio fade out started');
}

if (sleepingCat && sleepingCatContainer && petHand) {
    console.log('=== Initialization ===');
    console.log('Sleeping cat and pet hand found!');
    console.log('Is mobile:', isMobile);
    console.log('Window width:', window.innerWidth);
    console.log('Pet hand element:', petHand);
    
    // 初始化 pet hand 位置
    petHand.style.left = '-200px';
    petHand.style.top = '-200px';
    petHand.style.display = 'none';
    
    console.log('Initial pet hand img src:', petHand.querySelector('img').src);
    
    // 桌面端：按住左键跟随光标（整个容器区域）
    sleepingCatContainer.addEventListener('mousedown', (e) => {
        if (isMobile) return;
        console.log('=== Mouse down on cat (desktop) ===');
        e.preventDefault();
        e.stopPropagation();
        isPetting = true;
        
        // 显示手
        petHand.classList.add('active');
        petHand.style.display = 'block';
        
        // 开始播放呼噜声并淡入
        fadeInAudio();
        
        updatePetHandPosition(e.clientX, e.clientY);
        
        // 延迟检查，确保 DOM 更新
        setTimeout(() => {
            console.log('Pet hand after show:', {
                display: window.getComputedStyle(petHand).display,
                left: petHand.style.left,
                top: petHand.style.top,
                zIndex: window.getComputedStyle(petHand).zIndex,
                classList: petHand.classList.toString(),
                imgSrc: petHand.querySelector('img').src
            });
        }, 50);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isPetting && !isMobile) {
            updatePetHandPosition(e.clientX, e.clientY);
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (!isMobile && isPetting) {
            console.log('Mouse up (desktop)');
            isPetting = false;
            petHand.classList.remove('active');
            petHand.style.display = 'none';
            
            // 淡出呼噜声
            fadeOutAudio();
        }
    });
    
    // 移动端：按住跟随（和桌面端一样，整个容器区域）
    let isTouching = false;
    
    sleepingCatContainer.addEventListener('touchstart', (e) => {
        console.log('=== Touch start on cat container ===');
        console.log('Is mobile check:', isMobile);
        console.log('Event type:', e.type);
        e.preventDefault();
        e.stopPropagation();
        
        isTouching = true;
        
        const touch = e.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        
        console.log('Touch position - x:', x, 'y:', y);
        console.log('Touch pageX/pageY:', touch.pageX, touch.pageY);
        
        // 显示手
        petHand.classList.add('active');
        petHand.style.display = 'block';
        
        // 开始播放呼噜声并淡入
        fadeInAudio();
        
        updatePetHandPosition(x, y);
        
        console.log('Pet hand should be visible now');
        console.log('Pet hand display:', petHand.style.display);
        console.log('Pet hand classList:', petHand.classList.toString());
    });
    
    // 移动端：跟随手指移动
    document.addEventListener('touchmove', (e) => {
        if (isTouching) {
            console.log('Touch move');
            e.preventDefault();
            
            const touch = e.touches[0];
            const x = touch.clientX;
            const y = touch.clientY;
            
            updatePetHandPosition(x, y);
        }
    }, { passive: false });
    
    // 移动端：松开隐藏
    document.addEventListener('touchend', (e) => {
        if (isTouching) {
            console.log('Touch end');
            isTouching = false;
            petHand.classList.remove('active');
            petHand.style.display = 'none';
            
            // 淡出呼噜声
            fadeOutAudio();
        }
    });
    
    document.addEventListener('touchcancel', (e) => {
        if (isTouching) {
            console.log('Touch cancel');
            isTouching = false;
            petHand.classList.remove('active');
            petHand.style.display = 'none';
            
            // 淡出呼噜声
            fadeOutAudio();
        }
    });
} else {
    console.error('Sleeping cat or pet hand not found!', {
        sleepingCat: sleepingCat,
        petHand: petHand
    });
}

console.log('%c✨ Personal Blog Loaded', 'color: #FBE9D0; font-size: 16px; font-weight: bold;');
