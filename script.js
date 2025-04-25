'use strict';

// =============== تنظیمات کلی ===============
const CONFIG = {
  debug: false,
  animationSpeed: 300,
  loadTimeout: 8000,
  cdnLinks: {
    fontAwesome: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    aos: 'https://unpkg.com/aos@2.3.1/dist/aos.css',
    aosScript: 'https://unpkg.com/aos@2.3.1/dist/aos.js',
    swiper: 'https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.css',
    swiperScript: 'https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.js'
  }
};

// =============== سیستم لاگینگ ===============
const logger = {
  log: function(message) {
    if (CONFIG.debug) console.log('%c🔵 INFO: ' + message, 'color: #3498db');
  },
  warn: function(message) {
    if (CONFIG.debug) console.warn('%c🟠 WARNING: ' + message, 'color: #f39c12');
  },
  error: function(message) {
    if (CONFIG.debug) console.error('%c🔴 ERROR: ' + message, 'color: #e74c3c');
  },
  info: function(message) {
    if (CONFIG.debug) console.info('%c🟢 SUCCESS: ' + message, 'color: #2ecc71');
  }
};

// =============== مدیریت پیش‌بارگذاری ===============
const preloaderManager = {
  init: function() {
    logger.info('راه‌اندازی پیش‌بارگذار...');
    this.preloader = document.getElementById('preloader');
    this.progressBar = document.querySelector('.progress-fill');
    this.progressText = document.querySelector('.progress-text');
    
    if (!this.preloader) {
      logger.warn('پیش‌بارگذار در DOM یافت نشد. ساخت پیش‌بارگذار...');
      this.createPreloader();
    }
    
    // شروع پیش‌بارگذاری منابع
    this.startPreloading();
    
    // تنظیم تایمر برای نمایش حداقل چند ثانیه
    setTimeout(() => {
      if (this.progress >= 100) {
        this.finishLoading();
      }
    }, 1500);
    
    // تایمر محافظ برای اطمینان از نمایش سایت حتی در صورت خطا
    setTimeout(() => {
      this.finishLoading();
    }, CONFIG.loadTimeout);
  },
  
  createPreloader: function() {
    const preloaderHTML = `
      <div id="preloader">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
        <div class="loading-text">
          <span style="--i:1">ب</span>
          <span style="--i:2">ا</span>
          <span style="--i:3">ر</span>
          <span style="--i:4">گ</span>
          <span style="--i:5">ذ</span>
          <span style="--i:6">ا</span>
          <span style="--i:7">ر</span>
          <span style="--i:8">ی</span>
          <span style="--i:9">.</span>
          <span style="--i:10">.</span>
          <span style="--i:11">.</span>
        </div>
        <div class="loading-progress">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="progress-text">0%</div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', preloaderHTML);
    this.preloader = document.getElementById('preloader');
    this.progressBar = document.querySelector('.progress-fill');
    this.progressText = document.querySelector('.progress-text');
    
    // اضافه کردن استایل‌ها
    const style = document.createElement('style');
    style.textContent = `
      #preloader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 0.5s, visibility 0.5s;
      }
      
      #preloader.fade-out {
        opacity: 0;
        visibility: hidden;
      }
      
      .spinner {
        width: 80px;
        height: 80px;
        animation: rotate 2s linear infinite;
      }
      
      .path {
        stroke: #4361ee;
        stroke-linecap: round;
        animation: dash 1.5s ease-in-out infinite;
      }
      
      @keyframes rotate {
        100% { transform: rotate(360deg); }
      }
      
      @keyframes dash {
        0% {
          stroke-dasharray: 1, 150;
          stroke-dashoffset: 0;
        }
        50% {
          stroke-dasharray: 90, 150;
          stroke-dashoffset: -35;
        }
        100% {
          stroke-dasharray: 90, 150;
          stroke-dashoffset: -124;
        }
      }
      
      .loading-text {
        margin-top: 20px;
        font-size: 24px;
        display: flex;
      }
      
      .loading-text span {
        animation: bounce 1.5s ease infinite;
        animation-delay: calc(0.1s * var(--i));
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      .loading-progress {
        width: 200px;
        margin-top: 20px;
      }
      
      .progress-bar {
        height: 4px;
        background-color: #eee;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .progress-fill {
        height: 100%;
        width: 0;
        background-color: #4361ee;
        transition: width 0.3s;
      }
      
      .progress-text {
        margin-top: 8px;
        font-size: 14px;
        text-align: center;
      }
    `;
    document.head.appendChild(style);
  },
  
  progress: 0,
  totalResources: 0,
  loadedResources: 0,
  
  updateProgress: function(value) {
    this.progress = Math.min(Math.max(value, this.progress), 100);
    if (this.progressBar) {
      this.progressBar.style.width = this.progress + '%';
    }
    if (this.progressText) {
      this.progressText.textContent = Math.round(this.progress) + '%';
    }
    
    if (this.progress >= 100) {
      setTimeout(() => this.finishLoading(), 500);
    }
  },
  
  incrementProgress: function() {
    this.loadedResources++;
    const percentage = (this.loadedResources / this.totalResources) * 100;
    this.updateProgress(percentage);
  },
  
  startPreloading: function() {
    // شناسایی منابع برای پیش‌بارگذاری
    const images = Array.from(document.images);
    const backgroundElements = Array.from(document.querySelectorAll('[style*="background-image"]'));
    const cssFiles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    
    this.totalResources = images.length + backgroundElements.length + cssFiles.length + scripts.length + 3; // +3 برای فونت آیکون، swiper و AOS
    
    if (this.totalResources === 0) {
      this.totalResources = 1;
      this.updateProgress(50);
      
      // تست بارگذاری با تاخیر مصنوعی
      setTimeout(() => {
        this.updateProgress(100);
      }, 1000);
      
      return;
    }
    
    // پیش‌بارگذاری تصاویر
    images.forEach(img => {
      if (img.complete) {
        this.incrementProgress();
      } else {
        img.addEventListener('load', () => this.incrementProgress());
        img.addEventListener('error', () => this.incrementProgress());
      }
    });
    
    // پیش‌بارگذاری تصاویر پس‌زمینه
    backgroundElements.forEach(el => {
      const style = getComputedStyle(el);
      const bgImage = style.backgroundImage;
      if (bgImage && bgImage !== 'none') {
        const img = new Image();
        img.onload = () => this.incrementProgress();
        img.onerror = () => this.incrementProgress();
        const url = bgImage.match(/url\((['"])?(.*?)\1\)/);
        if (url) img.src = url[2];
      } else {
        this.incrementProgress();
      }
    });
    
    // پیش‌بارگذاری فایل‌های CSS
    cssFiles.forEach(link => {
      if (link.sheet) {
        this.incrementProgress();
      } else {
        link.addEventListener('load', () => this.incrementProgress());
        link.addEventListener('error', () => this.incrementProgress());
      }
    });
    
    // پیش‌بارگذاری اسکریپت‌ها
    scripts.forEach(script => {
      if (script.loaded) {
        this.incrementProgress();
      } else {
        script.addEventListener('load', () => this.incrementProgress());
        script.addEventListener('error', () => this.incrementProgress());
      }
    });
    
    // بررسی بارگذاری کتابخانه‌های خارجی
    this.checkLibraryLoading('FontAwesome', '.fa, .fas, .far, .fab');
    this.checkLibraryLoading('Swiper', '.swiper-container, .swiper');
    this.checkLibraryLoading('AOS', '[data-aos]');
    
    // پیشرفت پایه
    this.updateProgress(10);
  },
  
  checkLibraryLoading: function(name, selector) {
    const checkInterval = setInterval(() => {
      if (document.querySelector(selector)) {
        clearInterval(checkInterval);
        this.incrementProgress();
        logger.log(`کتابخانه ${name} با موفقیت بارگذاری شد`);
      }
    }, 200);
    
    // حداکثر 5 ثانیه منتظر بمان
    setTimeout(() => {
      clearInterval(checkInterval);
      this.incrementProgress();
      logger.warn(`زمان انتظار برای کتابخانه ${name} به پایان رسید`);
    }, 5000);
  },
  
  finishLoading: function() {
    if (!this.preloader) return;
    
    if (this.preloader.classList.contains('fade-out')) return;
    
    this.updateProgress(100);
    this.preloader.classList.add('fade-out');
    
    setTimeout(() => {
      if (this.preloader.parentNode) {
        this.preloader.parentNode.removeChild(this.preloader);
      }
      
      // راه‌اندازی ویژگی‌های اصلی سایت
      initOtherFeatures();
      
      // لیزی لود تصاویر
      enableLazyLoading();
      
      logger.info('پیش‌بارگذار با موفقیت حذف شد. سایت آماده استفاده است.');
    }, 500);
  }
};

// =============== مدیریت شمارنده‌ها ===============
const counterManager = {
  initializeCounters: function() {
    logger.log('راه‌اندازی شمارنده‌ها...');
    
    const counters = document.querySelectorAll('.counter');
    
    if (counters.length === 0) {
      logger.warn('هیچ شمارنده‌ای در صفحه یافت نشد');
      return;
    }
    
    this.setupIntersectionObserver(counters);
    
    // بازبینی بعد از چند ثانیه برای اطمینان از آغاز شمارش
    setTimeout(() => this.recheckCounters(), 3000);
    
    logger.log(`${counters.length} شمارنده راه‌اندازی شد`);
  },
  
  setupIntersectionObserver: function(counters) {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.startCounting(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, options);
    
    counters.forEach(counter => {
      // اگر قبلاً شمارش شده باشد، دوباره راه‌اندازی نشود
      if (!counter.classList.contains('counted')) {
        observer.observe(counter);
      }
    });
  },
  
  startCounting: function(counter) {
    if (counter.classList.contains('counted')) return;
    
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 3000; // مدت انیمیشن (میلی‌ثانیه)
    const startTime = performance.now();
    let currentCount = 0;
    
    const easeOutQuad = t => t * (2 - t);
    
    const updateCounter = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuad(progress);
      
      currentCount = Math.floor(easedProgress * target);
      counter.textContent = this.formatNumber(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = this.formatNumber(target);
        counter.classList.add('counted');
      }
    };
    
    requestAnimationFrame(updateCounter);
  },
  
  formatNumber: function(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
  
  recheckCounters: function() {
    const counters = document.querySelectorAll('.counter:not(.counted)');
    
    if (counters.length > 0) {
      logger.warn(`${counters.length} شمارنده هنوز آغاز نشده‌اند. تلاش مجدد...`);
      
      counters.forEach(counter => {
        const rect = counter.getBoundingClientRect();
        const isVisible = (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        
        if (isVisible) {
          this.startCounting(counter);
        }
      });
      
      // راه حل نهایی: اگر همچنان شمارنده‌ها شمارش نشده باشند، آنها را به مقدار نهایی تنظیم کن
      setTimeout(() => this.applyFinalFix(), 3000);
    }
  },
  
  applyFinalFix: function() {
    const counters = document.querySelectorAll('.counter:not(.counted)');
    
    if (counters.length > 0) {
      logger.error(`اعمال راه حل نهایی برای ${counters.length} شمارنده مشکل‌دار`);
      
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        counter.textContent = this.formatNumber(target);
        counter.classList.add('counted');
      });
    }
  }
};

// =============== مدیریت منو ===============
const menuManager = {
  init: function() {
    logger.log('راه‌اندازی منوی اصلی...');
    
    this.header = document.querySelector('header');
    this.hamburger = document.querySelector('.hamburger');
    this.navLinks = document.querySelector('.nav-links');
    
    if (!this.header) {
      logger.error('عنصر header یافت نشد!');
      return;
    }
    
    // ایجاد دکمه همبرگر اگر وجود نداشته باشد
    if (!this.hamburger) {
      logger.warn('دکمه همبرگر یافت نشد. در حال ساخت...');
      this.createHamburgerMenu();
    } else {
      // اضافه کردن رویداد کلیک به دکمه همبرگر
      this.setupHamburgerMenu();
    }
    
    // رویدادهای اسکرول
    this.setupScrollEvents();
    
    // اضافه کردن کلاس فعال به لینک‌های ناوبری بر اساس بخش فعلی
    this.setupActiveNavLinks();
    
    logger.log('منوی اصلی راه‌اندازی شد');
  },
  
  createHamburgerMenu: function() {
    if (!this.navLinks) {
      // پیدا کردن ناوبری
      const nav = document.querySelector('header nav');
      if (!nav) return;
      
      this.navLinks = document.createElement('ul');
      this.navLinks.className = 'nav-links';
      
      // ایجاد لینک‌های پیش‌فرض
      const defaultLinks = [
        { href: '#home', text: 'صفحه اصلی', isActive: true },
        { href: '#about', text: 'درباره ما' },
        { href: '#fields', text: 'رشته‌های تحصیلی' },
        { href: '#gallery', text: 'گالری' },
        { href: '#contact', text: 'تماس با ما' }
      ];
      
      defaultLinks.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.text;
        if (link.isActive) a.classList.add('active');
        li.appendChild(a);
        this.navLinks.appendChild(li);
      });
      
      nav.appendChild(this.navLinks);
    }
    
    // ایجاد دکمه همبرگر
    this.hamburger = document.createElement('div');
    this.hamburger.className = 'hamburger';
    this.hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    
    const nav = document.querySelector('header nav');
    if (nav) nav.appendChild(this.hamburger);
    
    // اضافه کردن رویداد کلیک
    this.setupHamburgerMenu();
    
    // اضافه کردن استایل‌های ضروری
    this.addMenuStyles();
  },
  
  setupHamburgerMenu: function() {
    if (!this.hamburger || !this.navLinks) return;
    
    this.hamburger.addEventListener('click', () => {
      this.navLinks.classList.toggle('nav-active');
      this.hamburger.classList.toggle('active');
      
      if (this.hamburger.classList.contains('active')) {
        this.hamburger.innerHTML = '<i class="fas fa-times"></i>';
      } else {
        this.hamburger.innerHTML = '<i class="fas fa-bars"></i>';
      }
    });
  },
  
  setupScrollEvents: function() {
    if (!this.header) return;
    
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY;
      
      // تغییر ظاهر هدر هنگام اسکرول
      if (scrollPos > 50) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
      
      // بروزرسانی لینک فعال بر اساس موقعیت اسکرول
      this.updateActiveLink(scrollPos);
    });
  },
  
  setupActiveNavLinks: function() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // بستن منوی موبایل اگر باز است
        const navLinks = document.querySelector('.nav-links');
        const hamburger = document.querySelector('.hamburger');
        if (navLinks.classList.contains('nav-active')) {
          navLinks.classList.remove('nav-active');
          hamburger.classList.remove('active');
          hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        }
        
        // اسکرول نرم به بخش مورد نظر
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
          const targetPosition = targetSection.offsetTop - 100;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  },
  
  updateActiveLink: function(scrollPos) {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let activeSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        activeSection = '#' + section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === activeSection) {
        link.classList.add('active');
      }
    });
  },
  
  addMenuStyles: function() {
    if (document.getElementById('menu-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'menu-styles';
    style.textContent = `
      header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 1000;
        background-color: rgba(255, 255, 255, 0.9);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }
      
      header.scrolled {
        background-color: rgba(255, 255, 255, 0.95);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
      
      .nav-links {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      
      .nav-links li {
        margin-right: 20px;
      }
      
      .nav-links a {
        color: #333;
        text-decoration: none;
        font-weight: 500;
        padding: 5px 0;
        position: relative;
        transition: color 0.3s;
      }
      
      .nav-links a:hover, .nav-links a.active {
        color: #4361ee;
      }
      
      .nav-links a::after {
        content: '';
        position: absolute;
        width: 0;
        height: 2px;
        bottom: 0;
        left: 0;
        background-color: #4361ee;
        transition: width 0.3s;
      }
      
      .nav-links a:hover::after, .nav-links a.active::after {
        width: 100%;
      }
      
      .hamburger {
        display: none;
        cursor: pointer;
        font-size: 24px;
        color: #333;
      }
      
      @media screen and (max-width: 768px) {
        .hamburger {
          display: block;
        }
        
        .nav-links {
          position: fixed;
          top: 80px;
          right: -100%;
          width: 70%;
          height: calc(100vh - 80px);
          flex-direction: column;
          background-color: white;
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
          padding: 20px;
          transition: right 0.3s ease;
        }
        
        .nav-links.nav-active {
          right: 0;
        }
        
        .nav-links li {
          margin: 15px 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// =============== مدیریت اسلایدر ===============
const sliderManager = {
  init: function() {
    logger.log('راه‌اندازی اسلایدرها...');
    
    this.initHeroSlider();
    this.initTestimonialsSlider();
    
    logger.log('اسلایدرها راه‌اندازی شدند');
  },
  
  initHeroSlider: function() {
    const heroSlider = document.querySelector('.hero-slider');
    
    if (!heroSlider) {
      logger.warn('اسلایدر hero یافت نشد');
      return;
    }
    
    if (typeof Swiper === 'undefined') {
      this.loadSwiperLibrary(() => this.initHeroSlider());
      return;
    }
    
    try {
      const swiper = new Swiper('.hero-slider', {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        effect: 'fade',
        fadeEffect: {
          crossFade: true
        }
      });
      
      logger.log('اسلایدر hero با موفقیت راه‌اندازی شد');
    } catch (error) {
      logger.error('خطا در راه‌اندازی اسلایدر hero: ' + error.message);
    }
  },
  
  initTestimonialsSlider: function() {
    const testimonialSlider = document.querySelector('.testimonial-slider');
    
    if (!testimonialSlider) {
      logger.warn('اسلایدر نظرات یافت نشد');
      return;
    }
    
    if (typeof Swiper === 'undefined') {
      this.loadSwiperLibrary(() => this.initTestimonialsSlider());
      return;
    }
    
    try {
      const swiper = new Swiper('.testimonial-slider', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
          delay: 4000,
          disableOnInteraction: false
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        },
        breakpoints: {
          768: {
            slidesPerView: 2,
            spaceBetween: 30
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 40
          }
        }
      });
      
      logger.log('اسلایدر نظرات با موفقیت راه‌اندازی شد');
    } catch (error) {
      logger.error('خطا در راه‌اندازی اسلایدر نظرات: ' + error.message);
    }
  },
  
  loadSwiperLibrary: function(callback) {
    logger.warn('کتابخانه Swiper یافت نشد. در حال بارگذاری...');
    
    const swiperCss = document.createElement('link');
    swiperCss.rel = 'stylesheet';
    swiperCss.href = CONFIG.cdnLinks.swiper;
    document.head.appendChild(swiperCss);
    
    const swiperScript = document.createElement('script');
    swiperScript.src = CONFIG.cdnLinks.swiperScript;
    document.body.appendChild(swiperScript);
    
    swiperScript.onload = function() {
      logger.log('کتابخانه Swiper با موفقیت بارگذاری شد');
      if (callback) callback();
    };
    
    swiperScript.onerror = function() {
        logger.error('خطا در بارگذاری کتابخانه Swiper');
      };
    }
  };
  
  // =============== مدیریت تصاویر گالری ===============
  const galleryManager = {
    init: function() {
      logger.log('راه‌اندازی گالری تصاویر...');
      
      const galleryItems = document.querySelectorAll('.gallery-item');
      
      if (galleryItems.length === 0) {
        logger.warn('آیتم‌های گالری یافت نشدند');
        return;
      }
      
      this.setupGalleryItems(galleryItems);
      this.setupLightbox();
      
      logger.log(`${galleryItems.length} آیتم گالری راه‌اندازی شد`);
    },
    
    setupGalleryItems: function(items) {
      items.forEach(item => {
        // افزودن قابلیت بزرگنمایی تصویر
        item.addEventListener('click', () => {
          const img = item.querySelector('img');
          const title = item.querySelector('.overlay span').textContent;
          
          if (img) {
            this.openLightbox(img.src, title);
          }
        });
        
        // بهبود قابلیت دسترسی‌پذیری
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `مشاهده تصویر ${item.querySelector('.overlay span') ? item.querySelector('.overlay span').textContent : ''}`);
        item.setAttribute('tabindex', '0');
        
        // امکان استفاده از کیبورد
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
          }
        });
      });
    },
    
    setupLightbox: function() {
      // بررسی وجود لایت‌باکس
      if (document.getElementById('gallery-lightbox')) return;
      
      // ایجاد ساختار لایت‌باکس
      const lightbox = document.createElement('div');
      lightbox.id = 'gallery-lightbox';
      lightbox.className = 'lightbox';
      lightbox.innerHTML = `
        <div class="lightbox-content">
          <span class="close-lightbox">&times;</span>
          <img id="lightbox-img" src="" alt="تصویر بزرگ">
          <div class="lightbox-caption"></div>
          <div class="lightbox-controls">
            <button class="lightbox-prev"><i class="fas fa-chevron-right"></i></button>
            <button class="lightbox-next"><i class="fas fa-chevron-left"></i></button>
          </div>
        </div>
      `;
      
      document.body.appendChild(lightbox);
      
      // اضافه کردن استایل‌ها
      const style = document.createElement('style');
      style.id = 'lightbox-styles';
      style.textContent = `
        .lightbox {
          display: none;
          position: fixed;
          z-index: 9999;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.9);
          transition: opacity 0.3s ease;
          opacity: 0;
        }
        
        .lightbox.show {
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
        }
        
        .lightbox-content {
          position: relative;
          max-width: 80%;
          max-height: 80%;
        }
        
        #lightbox-img {
          display: block;
          max-width: 100%;
          max-height: 80vh;
          border: 5px solid white;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        }
        
        .close-lightbox {
          position: absolute;
          top: -30px;
          right: -30px;
          color: white;
          font-size: 30px;
          cursor: pointer;
          z-index: 1001;
        }
        
        .lightbox-caption {
          color: white;
          text-align: center;
          padding: 10px;
          background-color: rgba(0, 0, 0, 0.7);
          margin-top: 10px;
        }
        
        .lightbox-controls {
          position: absolute;
          top: 50%;
          width: 100%;
          display: flex;
          justify-content: space-between;
          transform: translateY(-50%);
        }
        
        .lightbox-prev, .lightbox-next {
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          padding: 15px;
          cursor: pointer;
          font-size: 20px;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s;
        }
        
        .lightbox-prev {
          margin-right: -70px;
        }
        
        .lightbox-next {
          margin-left: -70px;
        }
        
        .lightbox-prev:hover, .lightbox-next:hover {
          background-color: rgba(0, 0, 0, 0.8);
        }
      `;
      document.head.appendChild(style);
      
      // رویدادهای لایت‌باکس
      const closeLightbox = document.querySelector('.close-lightbox');
      const lightboxElement = document.getElementById('gallery-lightbox');
      const prevBtn = document.querySelector('.lightbox-prev');
      const nextBtn = document.querySelector('.lightbox-next');
      
      closeLightbox.addEventListener('click', () => this.closeLightbox());
      
      lightboxElement.addEventListener('click', (e) => {
        if (e.target === lightboxElement) {
          this.closeLightbox();
        }
      });
      
      prevBtn.addEventListener('click', () => this.navigateLightbox('prev'));
      nextBtn.addEventListener('click', () => this.navigateLightbox('next'));
      
      // رویداد کلید ESC برای بستن
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxElement.classList.contains('show')) {
          this.closeLightbox();
        } else if (e.key === 'ArrowRight' && lightboxElement.classList.contains('show')) {
          this.navigateLightbox('prev');
        } else if (e.key === 'ArrowLeft' && lightboxElement.classList.contains('show')) {
          this.navigateLightbox('next');
        }
      });
    },
    
    currentGalleryIndex: 0,
    galleryImages: [],
    
    openLightbox: function(imgSrc, caption) {
      const lightbox = document.getElementById('gallery-lightbox');
      const lightboxImg = document.getElementById('lightbox-img');
      const lightboxCaption = document.querySelector('.lightbox-caption');
      
      // جمع‌آوری تمام تصاویر گالری
      this.galleryImages = [];
      document.querySelectorAll('.gallery-item').forEach(item => {
        const img = item.querySelector('img');
        const title = item.querySelector('.overlay span').textContent;
        
        if (img) {
          this.galleryImages.push({ src: img.src, caption: title });
        }
      });
      
      // یافتن ایندکس تصویر فعلی
      this.currentGalleryIndex = this.galleryImages.findIndex(img => img.src === imgSrc);
      
      lightboxImg.src = imgSrc;
      lightboxImg.alt = caption || 'تصویر گالری';
      lightboxCaption.textContent = caption || '';
      
      lightbox.classList.add('show');
    },
    
    closeLightbox: function() {
      const lightbox = document.getElementById('gallery-lightbox');
      lightbox.classList.remove('show');
    },
    
    navigateLightbox: function(direction) {
      if (this.galleryImages.length <= 1) return;
      
      if (direction === 'prev') {
        this.currentGalleryIndex = (this.currentGalleryIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
      } else {
        this.currentGalleryIndex = (this.currentGalleryIndex + 1) % this.galleryImages.length;
      }
      
      const currentImage = this.galleryImages[this.currentGalleryIndex];
      const lightboxImg = document.getElementById('lightbox-img');
      const lightboxCaption = document.querySelector('.lightbox-caption');
      
      lightboxImg.src = currentImage.src;
      lightboxCaption.textContent = currentImage.caption || '';
    }
  };
  
  // =============== مدیریت بخش اساتید ===============
  const teachersManager = {
    init: function() {
      logger.log('راه‌اندازی بخش اساتید...');
      
      const teacherCards = document.querySelectorAll('.teacher-card');
      
      if (teacherCards.length === 0) {
        logger.warn('کارت‌های اساتید یافت نشدند');
        return;
      }
      
      this.setupTeacherCards(teacherCards);
      
      logger.log(`${teacherCards.length} کارت استاد راه‌اندازی شد`);
    },
    
    setupTeacherCards: function(cards) {
      cards.forEach(card => {
        // اضافه کردن افکت هاور برای کارت‌ها
        const socialLinks = card.querySelector('.teacher-social');
        const teacherImage = card.querySelector('.teacher-image');
        
        if (socialLinks && teacherImage) {
          teacherImage.addEventListener('mouseenter', () => {
            socialLinks.style.opacity = '1';
            socialLinks.style.transform = 'translateY(0)';
          });
          
          teacherImage.addEventListener('mouseleave', () => {
            socialLinks.style.opacity = '0';
            socialLinks.style.transform = 'translateY(10px)';
          });
        }
        
        // اضافه کردن قابلیت کلیک برای نمایش اطلاعات بیشتر
        card.addEventListener('click', (e) => {
          // اگر کلیک روی لینک‌های شبکه‌های اجتماعی باشد، عمل پیش‌فرض را انجام بده
          if (e.target.closest('.teacher-social a')) return;
          
          // نمایش مودال یا اطلاعات تکمیلی استاد
          this.showTeacherDetails(card);
        });
      });
    },
    
    showTeacherDetails: function(card) {
      const teacherName = card.querySelector('h3').textContent;
      const teacherPosition = card.querySelector('.teacher-position').textContent;
      const teacherDescription = card.querySelector('p').textContent;
      const teacherImage = card.querySelector('img').src;
      
      const expertiseTags = Array.from(card.querySelectorAll('.expertise-tag')).map(tag => tag.textContent);
      
      // ایجاد مودال اطلاعات استاد
      this.createTeacherModal(teacherName, teacherPosition, teacherDescription, teacherImage, expertiseTags);
    },
    
    createTeacherModal: function(name, position, description, image, expertiseTags) {
      // بررسی وجود مودال
      let modal = document.getElementById('teacher-modal');
      
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'teacher-modal';
        modal.className = 'modal';
        
        document.body.appendChild(modal);
        
        // اضافه کردن استایل مودال
        if (!document.getElementById('modal-styles')) {
          const style = document.createElement('style');
          style.id = 'modal-styles';
          style.textContent = `
            .modal {
              display: none;
              position: fixed;
              z-index: 9999;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.7);
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: opacity 0.3s;
            }
            
            .modal.show {
              display: flex;
              opacity: 1;
            }
            
            .modal-content {
              background-color: white;
              border-radius: 8px;
              max-width: 800px;
              width: 90%;
              max-height: 90vh;
              overflow-y: auto;
              display: flex;
              flex-direction: column;
              padding: 0;
              position: relative;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            }
            
            .modal-header {
              position: relative;
              min-height: 200px;
              background-size: cover;
              background-position: center;
              border-radius: 8px 8px 0 0;
              display: flex;
              align-items: flex-end;
              padding: 20px;
              background-image: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
            }
            
            .modal-header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-image: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
              border-radius: 8px 8px 0 0;
            }
            
            .modal-header-content {
              position: relative;
              z-index: 1;
              color: white;
            }
            
            .modal-title {
              margin: 0;
              font-size: 24px;
            }
            
            .modal-position {
              margin: 5px 0 0;
              opacity: 0.9;
            }
            
            .modal-body {
              padding: 20px;
            }
            
            .modal-expertise {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              margin-top: 20px;
            }
            
            .expertise-tag {
              background-color: #f0f0f0;
              color: #333;
              padding: 5px 10px;
              border-radius: 20px;
              font-size: 14px;
            }
            
            .modal-close {
              position: absolute;
              top: 15px;
              right: 15px;
              color: white;
              background-color: rgba(0, 0, 0, 0.5);
              border: none;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              z-index: 1;
              font-size: 16px;
            }
            
            .modal-close:hover {
              background-color: rgba(0, 0, 0, 0.8);
            }
          `;
          document.head.appendChild(style);
        }
      }
      
      // ساخت محتوای مودال
      modal.innerHTML = `
        <div class="modal-content">
          <button class="modal-close">&times;</button>
          <div class="modal-header" style="background-image: url('${image}')">
            <div class="modal-header-content">
              <h3 class="modal-title">${name}</h3>
              <p class="modal-position">${position}</p>
            </div>
          </div>
          <div class="modal-body">
            <p>${description}</p>
            <div class="modal-expertise">
              ${expertiseTags.map(tag => `<span class="expertise-tag">${tag}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
      
      // نمایش مودال
      modal.classList.add('show');
      
      // رویداد بستن مودال
      const closeBtn = modal.querySelector('.modal-close');
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
      });
      
      // بستن با کلیک بیرون از محتوا
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
      
      // بستن با کلید ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
          modal.classList.remove('show');
        }
      });
    }
  };
  
  // =============== مدیریت اخبار و رویدادها ===============
  const newsManager = {
    init: function() {
      logger.log('راه‌اندازی بخش اخبار و رویدادها...');
      
      const blogCards = document.querySelectorAll('.blog-card');
      
      if (blogCards.length === 0) {
        logger.warn('کارت‌های خبر یافت نشدند');
        return;
      }
      
      this.setupBlogCards(blogCards);
      
      logger.log(`${blogCards.length} کارت خبر راه‌اندازی شد`);
    },
    
    setupBlogCards: function(cards) {
      cards.forEach(card => {
        // اضافه کردن افکت هاور برای کارت‌ها
        card.addEventListener('mouseenter', () => {
          card.classList.add('hover');
        });
        
        card.addEventListener('mouseleave', () => {
          card.classList.remove('hover');
        });
        
        // لینک "ادامه مطلب"
        const readMoreLink = card.querySelector('.read-more');
        if (readMoreLink) {
          readMoreLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            const blogTitle = card.querySelector('.blog-title').textContent;
            const blogImage = card.querySelector('.blog-image img').src;
            const blogExcerpt = card.querySelector('.blog-excerpt').textContent;
            const blogDate = card.querySelector('.blog-date').textContent.trim();
            const blogCategory = card.querySelector('.blog-category').textContent;
            const authorName = card.querySelector('.author-name').textContent;
            const authorRole = card.querySelector('.author-role').textContent;
            const authorImage = card.querySelector('.author-image img').src;
            
            this.showNewsDetails(blogTitle, blogImage, blogExcerpt, blogDate, blogCategory, authorName, authorRole, authorImage);
          });
        }
      });
    },
    
    showNewsDetails: function(title, image, excerpt, date, category, authorName, authorRole, authorImage) {
      // ایجاد مودال خبر
      this.createNewsModal(title, image, excerpt, date, category, authorName, authorRole, authorImage);
    },
    
    createNewsModal: function(title, image, excerpt, date, category, authorName, authorRole, authorImage) {
      // بررسی وجود مودال
      let modal = document.getElementById('news-modal');
      
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'news-modal';
        modal.className = 'modal news-modal';
        
        document.body.appendChild(modal);
        
        // اضافه کردن استایل مودال
        if (!document.getElementById('news-modal-styles')) {
          const style = document.createElement('style');
          style.id = 'news-modal-styles';
          style.textContent = `
            .news-modal .modal-content {
              max-width: 800px;
            }
            
            .news-modal .modal-header {
              min-height: 300px;
            }
            
            .news-modal .modal-meta {
              display: flex;
              align-items: center;
              margin-bottom: 20px;
              font-size: 14px;
              color: #777;
            }
            
            .news-modal .modal-date,
            .news-modal .modal-category {
              margin-left: 20px;
              display: flex;
              align-items: center;
            }
            
            .news-modal .modal-date i,
            .news-modal .modal-category i {
              margin-left: 5px;
            }
            
            .news-modal .modal-content-text {
              line-height: 1.8;
              color: #333;
            }
            
            .news-modal .modal-author {
              display: flex;
              align-items: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
            
            .news-modal .author-image {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              overflow: hidden;
              margin-left: 15px;
            }
            
            .news-modal .author-image img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            
            .news-modal .author-info h4 {
              margin: 0;
              font-size: 16px;
            }
            
            .news-modal .author-role {
              font-size: 14px;
              color: #777;
            }
          `;
          document.head.appendChild(style);
        }
      }
      
      // ساخت محتوای مودال
      modal.innerHTML = `
        <div class="modal-content">
          <button class="modal-close">&times;</button>
          <div class="modal-header" style="background-image: url('${image}')">
            <div class="modal-header-content">
              <h3 class="modal-title">${title}</h3>
            </div>
          </div>
          <div class="modal-body">
            <div class="modal-meta">
              <div class="modal-date">
                <i class="far fa-calendar-alt"></i>
                ${date}
              </div>
              <div class="modal-category">
                <i class="fas fa-tag"></i>
                ${category}
              </div>
            </div>
            <div class="modal-content-text">
              <p>${excerpt}</p>
              <p>متن کامل خبر در اینجا قرار می‌گیرد. این خبر به صورت کامل در سایت اصلی قابل مشاهده است.</p>
            </div>
            <div class="modal-author">
              <div class="author-image">
                <img src="${authorImage}" alt="${authorName}">
              </div>
              <div class="author-info">
                <h4>${authorName}</h4>
                <div class="author-role">${authorRole}</div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // نمایش مودال
      modal.classList.add('show');
      
      // رویداد بستن مودال
      const closeBtn = modal.querySelector('.modal-close');
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
      });
      
      // بستن با کلیک بیرون از محتوا
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
      
      // بستن با کلید ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
          modal.classList.remove('show');
        }
      });
    }
  };
  
  // =============== مدیریت تقویم آموزشی ===============
  const calendarManager = {
    init: function() {
      logger.log('راه‌اندازی تقویم آموزشی...');
      
      const calendarContainer = document.querySelector('.calendar-container');
      
      if (!calendarContainer) {
        logger.warn('کانتینر تقویم یافت نشد');
        return;
      }
      
      this.setupCalendar();
      this.setupCalendarNavigation();
      
      logger.log('تقویم آموزشی راه‌اندازی شد');
    },
    
    currentDate: new Date(),
    persianMonths: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
    events: [
      { day: 15, month: 3, year: 1403, title: 'شروع ثبت نام سال تحصیلی جدید', time: '۸:۰۰ الی ۱۴:۰۰', location: 'ساختمان اداری هنرستان' },
      { day: 20, month: 3, year: 1403, title: 'جلسه معارفه اولیاء با مدیریت هنرستان', time: '۱۶:۰۰ الی ۱۸:۰۰', location: 'سالن اجتماعات هنرستان' },
      { day: 30, month: 3, year: 1403, title: 'کارگاه آشنایی با رشته‌های تحصیلی', time: '۱۰:۰۰ الی ۱۳:۰۰', location: 'کارگاه‌های تخصصی هنرستان' },
      { day: 10, month: 4, year: 1403, title: 'پایان مهلت ثبت نام', time: '۱۶:۰۰', location: 'ساختمان اداری هنرستان' },
      { day: 20, month: 4, year: 1403, title: 'برگزاری مصاحبه', time: '۹:۰۰ الی ۱۶:۰۰', location: 'ساختمان اداری هنرستان' },
      { day: 1, month: 5, year: 1403, title: 'اعلام نتایج', time: '۱۴:۰۰', location: 'وب‌سایت هنرستان' },
      { day: 15, month: 6, year: 1403, title: 'شروع سال تحصیلی', time: '۸:۰۰', location: 'هنرستان' }
    ],
    
    setupCalendar: function() {
      this.renderCalendar(this.currentDate);
      this.renderEvents();
    },
    
    setupCalendarNavigation: function() {
      const prevBtn = document.querySelector('.calendar-prev');
      const nextBtn = document.querySelector('.calendar-next');
      
      if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
          this.navigateMonth('prev');
        });
        
        nextBtn.addEventListener('click', () => {
          this.navigateMonth('next');
        });
      }
    },
    
    navigateMonth: function(direction) {
      let month = this.currentDate.getMonth();
      let year = this.currentDate.getFullYear();
      
      if (direction === 'prev') {
        month--;
        if (month < 0) {
          month = 11;
          year--;
        }
      } else {
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
      }
      
      this.currentDate = new Date(year, month, 1);
      this.renderCalendar(this.currentDate);
      this.renderEvents();
    },
    
    renderCalendar: function(date) {
      const calendarMonth = document.querySelector('.calendar-month');
      const calendarDays = document.querySelector('.calendar-days');
      
      if (!calendarMonth || !calendarDays) return;
      
      // نمایش نام ماه و سال
      const gregorianYear = date.getFullYear();
      const gregorianMonth = date.getMonth();
      
      // تبدیل به تاریخ شمسی (ساده‌سازی شده)
      let persianYear = gregorianYear - 621;
      let persianMonth = (gregorianMonth + 2) % 12;
      
      if (persianMonth < 1) {
        persianMonth += 12;
        persianYear--;
      }
      
      calendarMonth.textContent = `${this.persianMonths[persianMonth - 1]} ${persianYear}`;
      
      // پاک‌سازی روزهای قبلی
      calendarDays.innerHTML = '';
      
      // ساخت روزهای ماه
      for (let i = 1; i <= 31; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.textContent = this.toPersianNumber(i);
              // بررسی آیا روز فعلی، امروز است؟
      const today = new Date();
      if (persianYear === (today.getFullYear() - 621) && 
          persianMonth === (today.getMonth() + 2) % 12 + 1 && 
          i === 15) { // فرض می‌کنیم امروز روز 15 ماه است (ساده‌سازی)
        dayElement.classList.add('today');
      }
      
      // بررسی اگر این روز رویداد دارد
      const hasEvent = this.events.some(event => 
        event.day === i && 
        event.month === persianMonth && 
        event.year === persianYear
      );
      
      if (hasEvent) {
        dayElement.classList.add('has-event');
        dayElement.addEventListener('click', () => {
          this.showEventsForDay(i, persianMonth, persianYear);
        });
      }
      
      calendarDays.appendChild(dayElement);
    }
  },
  
  renderEvents: function() {
    const eventsContainer = document.querySelector('.events-list');
    const eventsTitle = document.querySelector('.events-title');
    
    if (!eventsContainer || !eventsTitle) return;
    
    // تنظیم عنوان بخش رویدادها
    const persianMonth = (this.currentDate.getMonth() + 2) % 12 + 1;
    const persianYear = this.currentDate.getFullYear() - 621;
    eventsTitle.textContent = `رویدادهای ${this.persianMonths[persianMonth - 1]} ${persianYear}`;
    
    // پاک‌سازی رویدادهای قبلی
    eventsContainer.innerHTML = '';
    
    // فیلتر کردن رویدادهای ماه جاری
    const monthEvents = this.events.filter(event => 
      event.month === persianMonth && 
      event.year === persianYear
    ).sort((a, b) => a.day - b.day);
    
    if (monthEvents.length === 0) {
      const noEvent = document.createElement('p');
      noEvent.className = 'no-events';
      noEvent.textContent = 'در این ماه رویدادی ثبت نشده است';
      eventsContainer.appendChild(noEvent);
      return;
    }
    
    // نمایش رویدادها
    monthEvents.forEach(event => {
      const eventItem = document.createElement('div');
      eventItem.className = 'event-item';
      eventItem.innerHTML = `
        <div class="event-date">
          <div class="event-day">${this.toPersianNumber(event.day)}</div>
          <div class="event-month">${this.persianMonths[event.month - 1]}</div>
        </div>
        <div class="event-content">
          <h3>${event.title}</h3>
          <div class="event-time">
            <i class="far fa-clock"></i>
            <span>${event.time}</span>
          </div>
          <div class="event-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${event.location}</span>
          </div>
        </div>
      `;
      
      eventsContainer.appendChild(eventItem);
    });
  },
  
  showEventsForDay: function(day, month, year) {
    const eventsContainer = document.querySelector('.events-list');
    const eventsTitle = document.querySelector('.events-title');
    
    if (!eventsContainer || !eventsTitle) return;
    
    // تنظیم عنوان بخش رویدادها
    eventsTitle.textContent = `رویدادهای ${this.toPersianNumber(day)} ${this.persianMonths[month - 1]} ${year}`;
    
    // پاک‌سازی رویدادهای قبلی
    eventsContainer.innerHTML = '';
    
    // فیلتر کردن رویدادهای روز انتخاب شده
    const dayEvents = this.events.filter(event => 
      event.day === day && 
      event.month === month && 
      event.year === year
    );
    
    if (dayEvents.length === 0) {
      const noEvent = document.createElement('p');
      noEvent.className = 'no-events';
      noEvent.textContent = 'در این روز رویدادی ثبت نشده است';
      eventsContainer.appendChild(noEvent);
      return;
    }
    
    // نمایش رویدادها
    dayEvents.forEach(event => {
      const eventItem = document.createElement('div');
      eventItem.className = 'event-item';
      eventItem.innerHTML = `
        <div class="event-date">
          <div class="event-day">${this.toPersianNumber(event.day)}</div>
          <div class="event-month">${this.persianMonths[event.month - 1]}</div>
        </div>
        <div class="event-content">
          <h3>${event.title}</h3>
          <div class="event-time">
            <i class="far fa-clock"></i>
            <span>${event.time}</span>
          </div>
          <div class="event-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${event.location}</span>
          </div>
        </div>
      `;
      
      eventsContainer.appendChild(eventItem);
    });
    
    // نمایان کردن بخش رویدادها در موبایل
    if (window.innerWidth < 768) {
      eventsContainer.scrollIntoView({ behavior: 'smooth' });
    }
  },
  
  toPersianNumber: function(number) {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return number.toString().replace(/\d/g, x => persianDigits[x]);
  }
};

// =============== مدیریت فرم ثبت نام ===============
const registrationManager = {
  init: function() {
    logger.log('راه‌اندازی فرم ثبت نام...');
    
    const registrationForm = document.getElementById('registrationForm');
    
    if (!registrationForm) {
      logger.warn('فرم ثبت نام یافت نشد');
      return;
    }
    
    this.setupFormTabs();
    this.setupFormNavigation();
    this.setupFormValidation();
    this.setupFileUpload();
    
    // ارسال فرم
    registrationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmission();
    });
    
    logger.log('فرم ثبت نام راه‌اندازی شد');
  },
  
  setupFormTabs: function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const formPages = document.querySelectorAll('.form-page');
    
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        
        // فعال کردن دکمه
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // نمایش صفحه مربوطه
        formPages.forEach(page => {
          page.classList.remove('active');
          if (page.id === target) {
            page.classList.add('active');
            this.updateProgressBar(page);
          }
        });
      });
    });
  },
  
  setupFormNavigation: function() {
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    
    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentPage = btn.closest('.form-page');
        const nextPageId = btn.getAttribute('data-next');
        
        // بررسی اعتبار فیلدهای جاری
        if (this.validateStep(currentPage)) {
          this.goToStep(nextPageId);
        }
      });
    });
    
    prevBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const prevPageId = btn.getAttribute('data-prev');
        this.goToStep(prevPageId);
      });
    });
  },
  
  goToStep: function(stepId) {
    // فعال کردن تب مربوطه
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-target') === stepId) {
        btn.classList.add('active');
      }
    });
    
    // نمایش صفحه مربوطه
    const formPages = document.querySelectorAll('.form-page');
    formPages.forEach(page => {
      page.classList.remove('active');
      if (page.id === stepId) {
        page.classList.add('active');
        this.updateProgressBar(page);
      }
    });
  },
  
  updateProgressBar: function(activePage) {
    const progressFill = document.querySelector('.progress-fill');
    const progressSteps = document.querySelectorAll('.progress-steps .step');
    
    if (!progressFill || progressSteps.length === 0) return;
    
    // تعیین مرحله فعلی
    let currentStep = 0;
    const formPages = document.querySelectorAll('.form-page');
    formPages.forEach((page, index) => {
      if (page === activePage) {
        currentStep = index;
      }
    });
    
    // بروزرسانی نوار پیشرفت
    const progress = ((currentStep + 1) / formPages.length) * 100;
    progressFill.style.width = `${progress}%`;
    
    // بروزرسانی مراحل
    progressSteps.forEach((step, index) => {
      step.classList.remove('active');
      if (index <= currentStep) {
        step.classList.add('active');
      }
    });
  },
  
  setupFormValidation: function() {
    const inputs = document.querySelectorAll('#registrationForm input, #registrationForm select, #registrationForm textarea');
    
    inputs.forEach(input => {
      // بررسی اعتبار هنگام خروج از فیلد
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      // حذف پیام خطا هنگام تایپ
      input.addEventListener('input', () => {
        input.classList.remove('error');
        const errorMessage = input.nextElementSibling;
        if (errorMessage && errorMessage.classList.contains('error-message')) {
          errorMessage.remove();
        }
      });
      
      // بررسی اعتبار کد ملی
      if (input.id === 'nationalId') {
        input.addEventListener('input', () => {
          const validation = input.nextElementSibling;
          if (validation && validation.classList.contains('input-validation')) {
            const value = input.value.trim();
            
            if (value.length === 10 && this.validateNationalId(value)) {
              validation.innerHTML = '<i class="fas fa-check-circle" style="color: green;"></i>';
            } else if (value.length > 0) {
              validation.innerHTML = '<i class="fas fa-times-circle" style="color: red;"></i>';
            } else {
              validation.innerHTML = '';
            }
          }
        });
      }
    });
  },
  
  validateStep: function(step) {
    let isValid = true;
    const requiredInputs = step.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredInputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    // بررسی‌های خاص برای هر مرحله
    const stepId = step.id;
    
    if (stepId === 'student-info') {
      // بررسی اعتبار کد ملی در مرحله اول
      const nationalId = document.getElementById('nationalId');
      if (nationalId && nationalId.value.trim() !== '' && !this.validateNationalId(nationalId.value.trim())) {
        this.showError(nationalId, 'کد ملی وارد شده معتبر نیست');
        isValid = false;
      }
    }
    
    if (stepId === 'field-select') {
      // بررسی انتخاب حداقل یک رشته
      const priority1Selected = step.querySelector('input[name="priority1"]:checked');
      if (!priority1Selected) {
        const fieldOptions = step.querySelector('.field-options');
        this.showStepError(fieldOptions, 'لطفاً حداقل یک رشته را به عنوان اولویت اول انتخاب کنید');
        isValid = false;
      }
      
      // بررسی پذیرش قوانین
      const termsCheckbox = document.getElementById('terms');
      if (termsCheckbox && !termsCheckbox.checked) {
        this.showError(termsCheckbox, 'پذیرش قوانین و مقررات الزامی است');
        isValid = false;
      }
    }
    
    return isValid;
  },
  
  validateField: function(field) {
    // حذف وضعیت خطای قبلی
    field.classList.remove('error');
    const errorMessage = field.nextElementSibling;
    if (errorMessage && errorMessage.classList.contains('error-message')) {
      errorMessage.remove();
    }
    
    // بررسی اعتبار
    let isValid = true;
    let errorText = '';
    
    // فیلد الزامی
    if (field.hasAttribute('required') && !field.value.trim()) {
      isValid = false;
      errorText = 'این فیلد الزامی است';
    }
    // کد ملی
    else if (field.id === 'nationalId' && field.value.trim() && !this.validateNationalId(field.value.trim())) {
      isValid = false;
      errorText = 'کد ملی وارد شده معتبر نیست';
    }
    // شماره موبایل
    else if ((field.id === 'studentMobile' || field.id === 'fatherMobile' || field.id === 'motherMobile') && 
             field.value.trim() && !this.validateMobile(field.value.trim())) {
      isValid = false;
      errorText = 'شماره موبایل معتبر نیست';
    }
    // ایمیل
    else if (field.id === 'studentEmail' && field.value.trim() && !this.validateEmail(field.value.trim())) {
      isValid = false;
      errorText = 'ایمیل وارد شده معتبر نیست';
    }
    // معدل
    else if (field.id === 'gpa' && field.value.trim()) {
      const gpa = parseFloat(field.value);
      if (isNaN(gpa) || gpa < 0 || gpa > 20) {
        isValid = false;
        errorText = 'معدل باید بین 0 تا 20 باشد';
      }
    }
    
    // نمایش خطا
    if (!isValid) {
      this.showError(field, errorText);
    }
    
    return isValid;
  },
  
  showError: function(field, message) {
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
    
    // اضافه کردن افکت لرزش
    field.classList.add('shake');
    setTimeout(() => {
      field.classList.remove('shake');
    }, 500);
  },
  
  showStepError: function(element, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    element.parentNode.insertBefore(errorDiv, element.nextSibling);
  },
  
  validateNationalId: function(nationalId) {
    // بررسی طول کد ملی
    if (nationalId.length !== 10) return false;
    
    // بررسی اعداد
    if (!/^\d{10}$/.test(nationalId)) return false;
    
    // بررسی الگوریتم کد ملی (ساده‌سازی شده)
    const check = parseInt(nationalId.charAt(9));
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      sum += parseInt(nationalId.charAt(i)) * (10 - i);
    }
    
    const remainder = sum % 11;
    return (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder);
  },
  
  validateMobile: function(mobile) {
    // پذیرش شماره‌های موبایل ایرانی
    return /^09\d{9}$/.test(mobile) || /^989\d{9}$/.test(mobile) || /^\+989\d{9}$/.test(mobile);
  },
  
  validateEmail: function(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  },
  
  setupFileUpload: function() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
      const preview = document.getElementById(input.id + 'Preview');
      
      if (!preview) return;
      
      input.addEventListener('change', () => {
        const file = input.files[0];
        
        if (file) {
          const reader = new FileReader();
          
          reader.onload = function(e) {
            let previewHTML = '';
            
            if (file.type.startsWith('image/')) {
              previewHTML = `
                <img src="${e.target.result}" alt="پیش‌نمایش" style="max-width: 100%; max-height: 100px;">
                <span>${file.name}</span>
              `;
            } else {
              previewHTML = `
                <i class="fas fa-file-pdf"></i>
                <span>${file.name}</span>
              `;
            }
            
            preview.innerHTML = previewHTML;
          };
          
          reader.readAsDataURL(file);
        } else {
          preview.innerHTML = `
            <i class="fas fa-upload"></i>
            <span>فایلی انتخاب نشده</span>
          `;
        }
      });
    });
  },
  
  handleFormSubmission: function() {
    // بررسی نهایی اعتبار فرم
    const form = document.getElementById('registrationForm');
    if (!form) return;
    
    const lastStep = document.getElementById('field-select');
    if (!this.validateStep(lastStep)) {
      return;
    }
    
    // نمایش وضعیت در حال ارسال
    const submitBtn = lastStep.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'در حال ارسال...';
    
    // شبیه‌سازی ارسال به سرور
    setTimeout(() => {
      // مخفی کردن فرم
      form.style.display = 'none';
      
      // نمایش پیام موفقیت
      const successMessage = document.querySelector('.success-message');
      if (successMessage) {
        successMessage.style.display = 'block';
        
        // تولید کد پیگیری تصادفی
        const trackingCode = this.generateTrackingCode();
        const trackingElement = document.getElementById('trackingCode');
        if (trackingElement) {
          trackingElement.textContent = trackingCode;
        }
      }
      
      // ذخیره در localStorage برای نمایش در پنل کاربری
      this.saveRegistrationData();
      
      // بازگرداندن دکمه به حالت اول
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 2000);
  },
  
  generateTrackingCode: function() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return code;
  },
  
  saveRegistrationData: function() {
    const formData = new FormData(document.getElementById('registrationForm'));
    const registrationData = {};
    
    formData.forEach((value, key) => {
      registrationData[key] = value;
    });
    
    // اضافه کردن زمان ثبت‌نام و کد پیگیری
    registrationData.registrationDate = new Date().toISOString();
    registrationData.trackingCode = document.getElementById('trackingCode').textContent;
    
    // ذخیره در localStorage
    try {
      localStorage.setItem('registrationData', JSON.stringify(registrationData));
    } catch (error) {
      console.error('خطا در ذخیره‌سازی اطلاعات ثبت‌نام:', error);
    }
  }
};

// =============== مدیریت پرسش و پاسخ‌های متداول ===============
const faqManager = {
  init: function() {
    logger.log('راه‌اندازی بخش سوالات متداول...');
    
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    if (accordionItems.length === 0) {
      logger.warn('آیتم‌های آکاردئون یافت نشدند');
      return;
    }
    
    this.setupAccordionItems(accordionItems);
    
    logger.log(`${accordionItems.length} آیتم آکاردئون راه‌اندازی شد`);
  },
  
  setupAccordionItems: function(items) {
    items.forEach(item => {
      const header = item.querySelector('.accordion-header');
      const content = item.querySelector('.accordion-content');
      
      if (!header || !content) return;
      
      // اضافه کردن رویداد کلیک
      header.addEventListener('click', () => {
        // برای اکاردئون تک باز، همه را ببندید
        const allItems = document.querySelectorAll('.accordion-item');
        allItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherContent = otherItem.querySelector('.accordion-content');
            if (otherContent) {
              otherContent.style.maxHeight = '0';
            }
            
            // تغییر آیکون
            const otherIcon = otherItem.querySelector('.accordion-icon');
            if (otherIcon) {
              const i = otherIcon.querySelector('i');
              if (i) {
                i.className = 'fas fa-plus';
              }
            }
          }
        });
        
        // باز یا بسته کردن آیتم فعلی
        item.classList.toggle('active');
        
        // تنظیم ارتفاع محتوا
        if (item.classList.contains('active')) {
          content.style.maxHeight = content.scrollHeight + 'px';
          
          // تغییر آیکون به منفی
          const icon = item.querySelector('.accordion-icon');
          if (icon) {
            const i = icon.querySelector('i');
            if (i) {
              i.className = 'fas fa-minus';
            }
          }
        } else {
          content.style.maxHeight = '0';
          
          // تغییر آیکون به علاوه
          const icon = item.querySelector('.accordion-icon');
          if (icon) {
            const i = icon.querySelector('i');
            if (i) {
              i.className = 'fas fa-plus';
            }
          }
        }
      });
      
      // تنظیم وضعیت اولیه
      content.style.maxHeight = '0';
    });
  }
};

// =============== مدیریت فرم تماس با ما ===============
const contactFormManager = {
  init: function() {
    logger.log('راه‌اندازی فرم تماس با ما...');
    
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) {
      logger.warn('فرم تماس یافت نشد');
      return;
    }
    
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmission(contactForm);
    });
    
    logger.log('فرم تماس راه‌اندازی شد');
  },
  
  handleFormSubmission: function(form) {
    // بررسی اعتبار فرم
    if (!this.validateForm(form)) {
      return;
    }
    
    // نمایش وضعیت در حال ارسال
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'در حال ارسال...';
    
    // شبیه‌سازی ارسال به سرور
    setTimeout(() => {
      // پاک کردن فرم
      form.reset();
      
      // نمایش پیام موفقیت
      this.showNotification('پیام شما با موفقیت ارسال شد. بزودی با شما تماس خواهیم گرفت.', 'success');
      
      // بازگرداندن دکمه به حالت اول
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 1500);
  },
  
  validateForm: function(form) {
    let isValid = true;
    
    // بررسی فیلدهای الزامی
    const requiredInputs = form.querySelectorAll('[required]');
    
    requiredInputs.forEach(input => {
      if (!input.value.trim()) {
        this.showInputError(input, 'این فیلد الزامی است');
        isValid = false;
      } else if (input.id === 'email' && !this.validateEmail(input.value.trim())) {
        this.showInputError(input, 'ایمیل وارد شده معتبر نیست');
        isValid = false;
      } else if (input.id === 'phone' && !this.validatePhone(input.value.trim())) {
        this.showInputError(input, 'شماره تماس وارد شده معتبر نیست');
        isValid = false;
      }
    });
    
    return isValid;
  },
  
  showInputError: function(input, message) {
    input.classList.add('error');
    
    // حذف پیام خطای قبلی
    const prevError = input.parentNode.querySelector('.error-message');
    if (prevError) {
      prevError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    input.parentNode.appendChild(errorDiv);
    
    // افکت لرزش
    input.classList.add('shake');
    setTimeout(() => {
      input.classList.remove('shake');
    }, 500);
    
    // حذف کلاس خطا هنگام تایپ
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const error = input.parentNode.querySelector('.error-message');
      if (error) {
        error.remove();
      }
    }, { once: true });
  },
  
  validateEmail: function(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  },
  
  validatePhone: function(phone) {
    // پذیرش شماره‌های موبایل ایرانی
    return /^09\d{9}$/.test(phone) || /^989\d{9}$/.test(phone) || /^\+989\d{9}$/.test(phone);
  },
  
  showNotification: function(message, type = 'info') {
    // بررسی وجود کانتینر نوتیفیکیشن
    let container = document.querySelector('.notification-container');
    
    if (!container) {
      container = document.createElement('div');
      container.className = 'notification-container';
      document.body.appendChild(container);
      
      // اضافه کردن استایل
      if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
          .notification-container {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 9999;
            direction: rtl;
          }
          
          .notification {
            background-color: white;
            color: #333;
            padding: 1rem 1.5rem;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            transform: translateX(-100%);
            opacity: 0;
            transition: all 0.3s ease;
          }
          
          .notification.show {
            transform: translateX(0);
            opacity: 1;
          }
          
          .notification i {
            font-size: 1.5rem;
            margin-left: 1rem;
          }
          
          .notification.info i {
            color: #3498db;
          }
          
          .notification.success i {
            color: #2ecc71;
          }
          
          .notification.error i {
            color: #e74c3c;
          }
          
          .notification span {
            flex-grow: 1;
          }
          
          .close-notification {
            background: none;
            border: none;
            cursor: pointer;
            color: #999;
            transition: color 0.3s ease;
          }
          
          .close-notification:hover {
            color: #333;
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    // ایجاد نوتیفیکیشن
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // آیکون مناسب
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    notification.innerHTML = `
      <i class="fas fa-${icon}"></i>
      <span>${message}</span>
      <button class="close-notification">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    container.appendChild(notification);
    
    // نمایش با انیمیشن
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // دکمه بستن
    notification.querySelector('.close-notification').addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
    
    // حذف خودکار بعد از چند ثانیه
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, 5000);
  }
};

// =============== مدیریت خبرنامه ===============
const newsletterManager = {
  init: function() {
    logger.log('راه‌اندازی خبرنامه...');
    
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (!newsletterForm) {
      logger.warn('فرم خبرنامه یافت نشد');
      return;
    }
    
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubscription(newsletterForm);
    });
    
    logger.log('خبرنامه راه‌اندازی شد');
  },
  
  handleSubscription: function(form) {
    const emailInput = form.querySelector('input[type="email"]');
    
    if (!emailInput || !emailInput.value.trim()) {
      this.showError(emailInput, 'لطفاً ایمیل خود را وارد کنید');
      return;
    }
    
    if (!this.validateEmail(emailInput.value.trim())) {
      this.showError(emailInput, 'ایمیل وارد شده معتبر نیست');
      return;
    }
    
    // نمایش وضعیت در حال ارسال
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'در حال ثبت...';
    
    // شبیه‌سازی ارسال به سرور
    setTimeout(() => {
      // پاک کردن فرم
      form.reset();
      
      // نمایش پیام موفقیت
      this.showNotification('ایمیل شما با موفقیت در خبرنامه ثبت شد.', 'success');
      
      // بازگرداندن دکمه به حالت اول
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 1500);
  },
  
  showError: function(input, message) {
    input.classList.add('error');
    
    // حذف پیام خطای قبلی
    const prevError = input.parentNode.querySelector('.error-message');
    if (prevError) {
      prevError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    input.parentNode.appendChild(errorDiv);
    
    // افکت لرزش
    input.classList.add('shake');
    setTimeout(() => {
      input.classList.remove('shake');
    }, 500);
    
    // حذف کلاس خطا هنگام تایپ
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const error = input.parentNode.querySelector('.error-message');
      if (error) {
        error.remove();
      }
    }, { once: true });
  },
  
  validateEmail: function(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  },
  
  showNotification: function(message, type) {
    // استفاده از تابع نوتیفیکیشن از contactFormManager
    if (typeof contactFormManager !== 'undefined' && contactFormManager.showNotification) {
      contactFormManager.showNotification(message, type);
    } else {
      alert(message);
    }
  }
};

// =============== مدیریت لیزی لودینگ تصاویر ===============
function enableLazyLoading() {
  logger.log('فعال‌سازی لیزی لودینگ تصاویر...');
  
  // لیزی لود برای عناصر img
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  if (lazyImages.length > 0) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        }
      });
    }, { rootMargin: '50px' });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
    
    logger.log(`${lazyImages.length} تصویر برای لیزی لودینگ آماده شدند`);
  }
  
  // لیزی لود برای تصاویر پس‌زمینه
  const lazyBackgrounds = document.querySelectorAll('[data-background]');
  
  if (lazyBackgrounds.length > 0) {
    const backgroundObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const bg = element.getAttribute('data-background');
          
          if (bg) {
            element.style.backgroundImage = `url('${bg}')`;
            element.removeAttribute('data-background');
            element.classList.add('bg-loaded');
            observer.unobserve(element);
          }
        }
      });
    }, { rootMargin: '50px' });
    
    lazyBackgrounds.forEach(bg => {
      backgroundObserver.observe(bg);
    });
    
    logger.log(`${lazyBackgrounds.length} تصویر پس‌زمینه برای لیزی لودینگ آماده شدند`);
  }
}

// =============== مدیریت اسکرول اتوماتیک ===============
function setupSmoothScroll() {
  logger.log('راه‌اندازی اسکرول نرم...');
  
  const scrollLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  
  scrollLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // اگر منوی موبایل باز است، آن را ببند
        const mobileMenu = document.querySelector('.nav-links');
        const hamburger = document.querySelector('.hamburger');
        
        if (mobileMenu && mobileMenu.classList.contains('nav-active')) {
          mobileMenu.classList.remove('nav-active');
          hamburger.classList.remove('active');
          hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        }
      }
    });
  });
  
  logger.log(`${scrollLinks.length} لینک اسکرول نرم راه‌اندازی شد`);
}

// =============== نشانگر پیشرفت اسکرول ===============
function setupScrollIndicator() {
  logger.log('راه‌اندازی نشانگر پیشرفت اسکرول...');
  
  // بررسی وجود نشانگر پیشرفت
  let indicator = document.querySelector('.scroll-progress');
  
  if (!indicator) {
    // ایجاد نشانگر پیشرفت
    indicator = document.createElement('div');
    indicator.className = 'scroll-progress';
    document.body.appendChild(indicator);
    
    // اضافه کردن استایل
    const style = document.createElement('style');
    style.textContent = `
      .scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        height: 3px;
        background-color: #4361ee;
        z-index: 1001;
        transition: width 0.1s;
      }
    `;
    document.head.appendChild(style);
  }
  
  // بروزرسانی نشانگر پیشرفت هنگام اسکرول
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    
    indicator.style.width = scrollPercent + '%';
  });
  
  logger.log('نشانگر پیشرفت اسکرول راه‌اندازی شد');
}

// =============== بررسی وضعیت آنلاین/آفلاین ===============
function setupOnlineStatus() {
  logger.log('راه‌اندازی بررسی وضعیت آنلاین...');
  
  // بررسی وضعیت آنلاین
  window.addEventListener('online', () => {
    // استفاده از تابع نوتیفیکیشن
    if (typeof contactFormManager !== 'undefined' && contactFormManager.showNotification) {
      contactFormManager.showNotification('اتصال شما به اینترنت برقرار شد.', 'success');
    }
  });
  
  window.addEventListener('offline', () => {
    // استفاده از تابع نوتیفیکیشن
    if (typeof contactFormManager !== 'undefined' && contactFormManager.showNotification) {
      contactFormManager.showNotification('اتصال شما به اینترنت قطع شد!', 'error');
    }
  });
  
  logger.log('بررسی وضعیت آنلاین راه‌اندازی شد');
}

// =============== مدیریت AOS (Animate On Scroll) ===============
function setupAOS() {
  logger.log('راه‌اندازی انیمیشن‌های AOS...');
  
  if (typeof AOS === 'undefined') {
    logger.warn('کتابخانه AOS یافت نشد. در حال بارگذاری...');
    
    // اضافه کردن لینک CSS
    const aosCSS = document.createElement('link');
    aosCSS.rel = 'stylesheet';
    aosCSS.href = CONFIG.cdnLinks.aos;
    document.head.appendChild(aosCSS);
    
    // اضافه کردن اسکریپت
    const aosScript = document.createElement('script');
    aosScript.src = CONFIG.cdnLinks.aosScript;
    document.body.appendChild(aosScript);
    
    aosScript.onload = function() {
      logger.log('کتابخانه AOS با موفقیت بارگذاری شد');
      initAOS();
    };
    
    aosScript.onerror = function() {
      logger.error('خطا در بارگذاری کتابخانه AOS');
    };
  } else {
    initAOS();
  }
  
  function initAOS() {
    try {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false,
        offset: 100
      });
      
      // بازنشانی AOS هنگام تغییر اندازه پنجره
      window.addEventListener('resize', () => {
        AOS.refresh();
      });
      
      logger.log('انیمیشن‌های AOS راه‌اندازی شدند');
    } catch (error) {
      logger.error('خطا در راه‌اندازی AOS: ' + error.message);
    }
  }
}

// =============== بررسی لاگین و احراز هویت ===============
const authManager = {
  init: function() {
    logger.log('راه‌اندازی سیستم احراز هویت...');
    
    // بررسی وضعیت لاگین
    const isLoggedIn = this.checkLoginStatus();
    
    // به‌روزرسانی UI بر اساس وضعیت لاگین
    this.updateUIBasedOnAuth(isLoggedIn);
    
    logger.log('سیستم احراز هویت راه‌اندازی شد');
  },
  
  checkLoginStatus: function() {
    // بررسی وجود توکن یا سشن در localStorage
    const authToken = localStorage.getItem('authToken');
    return !!authToken;
  },
  
  updateUIBasedOnAuth: function(isLoggedIn) {
    // بررسی وجود لینک‌های ورود و ثبت‌نام در منو
    const navLinks = document.querySelector('.nav-links');
    
    if (!navLinks) return;
    
    // حذف لینک‌های قبلی ورود/خروج
    const authLinks = navLinks.querySelectorAll('.auth-link');
    authLinks.forEach(link => link.remove());
    
    // اضافه کردن لینک مناسب بر اساس وضعیت لاگین
    const li = document.createElement('li');
    li.className = 'auth-link';
    
    if (isLoggedIn) {
      li.innerHTML = '<a href="#profile"><i class="fas fa-user-circle"></i> پروفایل کاربری</a>';
      
      // اضافه کردن رویداد برای خروج
      li.addEventListener('click', (e) => {
        if (e.target.closest('a').getAttribute('href') === '#profile') {
          e.preventDefault();
          this.showProfileModal();
        }
      });
    } else {
      li.innerHTML = '<a href="#login"><i class="fas fa-sign-in-alt"></i> ورود / ثبت‌نام</a>';
      
      // اضافه کردن رویداد برای نمایش مودال ورود
      li.addEventListener('click', (e) => {
        if (e.target.closest('a').getAttribute('href') === '#login') {
          e.preventDefault();
          this.showLoginModal();
        }
      });
    }
    
    navLinks.appendChild(li);
  },
  
  showLoginModal: function() {
    // ایجاد مودال ورود
    let modal = document.getElementById('login-modal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'login-modal';
      modal.className = 'modal';
      
      modal.innerHTML = `
        <div class="modal-content login-content">
          <button class="modal-close">&times;</button>
          <div class="login-tabs">
            <button class="tab-btn active" data-tab="login">ورود</button>
            <button class="tab-btn" data-tab="register">ثبت‌نام</button>
          </div>
          <div class="login-form-container">
            <form id="loginForm" class="tab-content active">
              <h3>ورود به حساب کاربری</h3>
              <div class="form-group">
                <label for="loginUsername">نام کاربری یا ایمیل</label>
                <input type="text" id="loginUsername" required>
              </div>
              <div class="form-group">
                <label for="loginPassword">رمز عبور</label>
                <input type="password" id="loginPassword" required>
              </div>
              <div class="form-group checkbox-group">
                <input type="checkbox" id="rememberMe">
                <label for="rememberMe">مرا به خاطر بسپار</label>
              </div>
              <button type="submit" class="btn btn-primary">ورود</button>
              <div class="form-footer">
                <a href="#" class="forgot-password">فراموشی رمز عبور</a>
              </div>
            </form>
            
            <form id="registerForm" class="tab-content">
              <h3>ایجاد حساب کاربری</h3>
              <div class="form-group">
                <label for="registerName">نام و نام خانوادگی</label>
                <input type="text" id="registerName" required>
              </div>
              <div class="form-group">
                <label for="registerEmail">ایمیل</label>
                <input type="email" id="registerEmail" required>
              </div>
              <div class="form-group">
                <label for="registerUsername">نام کاربری</label>
                <input type="text" id="registerUsername" required>
              </div>
              <div class="form-group">
                <label for="registerPassword">رمز عبور</label>
                <input type="password" id="registerPassword" required>
              </div>
              <div class="form-group">
                <label for="registerPasswordConfirm">تکرار رمز عبور</label>
                <input type="password" id="registerPasswordConfirm" required>
              </div>
              <div class="form-group checkbox-group">
                <input type="checkbox" id="termsAccept" required>
                <label for="termsAccept">قوانین و مقررات را می‌پذیرم</label>
              </div>
              <button type="submit" class="btn btn-primary">ثبت‌نام</button>
            </form>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // اضافه کردن استایل مودال لاگین
      if (!document.getElementById('login-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'login-modal-styles';
        style.textContent = `
          .login-content {
            max-width: 450px;
            padding: 0;
          }
          
          .login-tabs {
            display: flex;
            border-bottom: 1px solid #eee;
          }
          
          .login-tabs .tab-btn {
            flex: 1;
            background: none;
            border: none;
            padding: 15px;
            font-size: 16px;
            cursor: pointer;
            opacity: 0.7;
            transition: all 0.3s;
          }
          
          .login-tabs .tab-btn.active {
            opacity: 1;
            font-weight: bold;
            border-bottom: 2px solid #4361ee;
          }
          
          .login-form-container {
            padding: 20px;
          }
          
          .tab-content {
            display: none;
          }
          
          .tab-content.active {
            display: block;
          }
          
          .login-form-container h3 {
            margin-top: 0;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .form-footer {
            margin-top: 15px;
            text-align: center;
          }
          
          .forgot-password {
            color: #666;
            font-size: 14px;
            text-decoration: none;
          }
          
          .forgot-password:hover {
            text-decoration: underline;
          }
          
          .checkbox-group {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
          }
          
          .checkbox-group input[type="checkbox"] {
            margin-left: 10px;
            width: auto;
          }
        `;
        document.head.appendChild(style);
      }
      
      // رویدادهای تب‌ها
      const tabBtns = modal.querySelectorAll('.tab-btn');
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const tabName = btn.getAttribute('data-tab');
          
          // فعال کردن دکمه
          tabBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          // نمایش فرم مربوطه
          const forms = modal.querySelectorAll('.tab-content');
          forms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${tabName}Form`) {
              form.classList.add('active');
            }
          });
        });
      });
      
      // رویداد ارسال فرم ورود
      const loginForm = modal.querySelector('#loginForm');
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
      
      // رویداد ارسال فرم ثبت‌نام
      const registerForm = modal.querySelector('#registerForm');
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegistration();
      });
      
      // رویداد فراموشی رمز عبور
      const forgotPasswordLink = modal.querySelector('.forgot-password');
      forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showForgotPasswordModal();
      });
      
      // رویداد بستن مودال
      const closeBtn = modal.querySelector('.modal-close');
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
      });
      
      // بستن با کلیک بیرون از محتوا
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
      
      // بستن با کلید ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
          modal.classList.remove('show');
        }
      });
    }
    
    // نمایش مودال
    modal.classList.add('show');
  },
  
  handleLogin: function() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!username || !password) {
      this.showFormError('loginUsername', 'لطفاً تمام فیلدها را پر کنید');
      return;
    }
    
    // شبیه‌سازی ارسال به سرور
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'در حال ورود...';
    
    setTimeout(() => {
      // شبیه‌سازی لاگین موفق
      localStorage.setItem('authToken', 'dummy-token-' + Date.now());
      localStorage.setItem('username', username);
      
      // بستن مودال
      const modal = document.getElementById('login-modal');
      modal.classList.remove('show');
      
      // به‌روزرسانی UI
      this.updateUIBasedOnAuth(true);
      
      // نمایش پیام
      contactFormManager.showNotification('شما با موفقیت وارد شدید.', 'success');
      
      // بازگرداندن دکمه به حالت اول
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 1500);
  },
  
  handleRegistration: function() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const termsAccept = document.getElementById('termsAccept').checked;
    
    // بررسی تکمیل فیلدها
    if (!name || !email || !username || !password || !passwordConfirm) {
      this.showFormError('registerName', 'لطفاً تمام فیلدها را پر کنید');
      return;
    }
    
    // بررسی ایمیل
    if (!this.validateEmail(email)) {
      this.showFormError('registerEmail', 'لطفاً یک ایمیل معتبر وارد کنید');
      return;
    }
    
    // بررسی مطابقت رمز عبور
    if (password !== passwordConfirm) {
      this.showFormError('registerPasswordConfirm', 'رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }
    
    // بررسی قبول قوانین
    if (!termsAccept) {
      this.showFormError('termsAccept', 'برای ثبت‌نام باید قوانین را بپذیرید');
      return;
    }
    
    // شبیه‌سازی ارسال به سرور
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'در حال ثبت‌نام...';
    
    setTimeout(() => {
      // بستن مودال
      const modal = document.getElementById('login-modal');
      modal.classList.remove('show');
      
      // نمایش پیام
      contactFormManager.showNotification('ثبت‌نام شما با موفقیت انجام شد. لطفاً ایمیل خود را بررسی کنید.', 'success');
      
      // بازگرداندن دکمه به حالت اول
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 1500);
  },
  
  showForgotPasswordModal: function() {
    let modal = document.getElementById('forgot-password-modal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'forgot-password-modal';
      modal.className = 'modal';
      
      modal.innerHTML = `
        <div class="modal-content login-content">
          <button class="modal-close">&times;</button>
          <div class="login-form-container">
            <form id="forgotPasswordForm">
              <h3>بازیابی رمز عبور</h3>
              <p>لطفاً ایمیل خود را وارد کنید. لینک بازیابی رمز عبور برای شما ارسال خواهد شد.</p>
              <div class="form-group">
                <label for="forgotEmail">ایمیل</label>
                <input type="email" id="forgotEmail" required>
              </div>
              <button type="submit" class="btn btn-primary">ارسال لینک بازیابی</button>
            </form>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // رویداد ارسال فرم
      const forgotForm = modal.querySelector('#forgotPasswordForm');
      forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleForgotPassword();
      });
      
      // رویداد بستن مودال
      const closeBtn = modal.querySelector('.modal-close');
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
      });
      
      // بستن با کلیک بیرون از محتوا
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    }
    
    // نمایش مودال
    modal.classList.add('show');
    
    // بستن مودال قبلی
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
      loginModal.classList.remove('show');
    }
  },
  
  handleForgotPassword: function() {
    const email = document.getElementById('forgotEmail').value;
    
    if (!email || !this.validateEmail(email)) {
      this.showFormError('forgotEmail', 'لطفاً یک ایمیل معتبر وارد کنید');
      return;
    }
    
    // شبیه‌سازی ارسال به سرور
    const submitBtn = document.querySelector('#forgotPasswordForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'در حال ارسال...';
    
    setTimeout(() => {
      // بستن مودال
      const modal = document.getElementById('forgot-password-modal');
      modal.classList.remove('show');
      
      // نمایش پیام
      contactFormManager.showNotification('لینک بازیابی رمز عبور به ایمیل شما ارسال شد.', 'success');
      
      // بازگرداندن دکمه به حالت اول
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 1500);
  },
  
  showProfileModal: function() {
    let modal = document.getElementById('profile-modal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'profile-modal';
      modal.className = 'modal';
      
      const username = localStorage.getItem('username') || 'کاربر';
      
      modal.innerHTML = `
        <div class="modal-content profile-content">
          <button class="modal-close">&times;</button>
          <div class="profile-header">
            <div class="profile-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <h3>پروفایل ${username}</h3>
          </div>
          <div class="profile-body">
            <div class="profile-section">
              <h4>اطلاعات کاربری</h4>
              <div class="profile-info">
                <div class="info-item">
                  <span class="info-label">نام کاربری:</span>
                  <span class="info-value">${username}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">آخرین ورود:</span>
                  <span class="info-value">${new Date().toLocaleDateString('fa-IR')}</span>
                </div>
              </div>
            </div>
            <div class="profile-section">
              <h4>گزینه‌ها</h4>
              <div class="profile-actions">
                <button class="btn btn-outline" id="editProfileBtn">
                  <i class="fas fa-edit"></i> ویرایش پروفایل
                </button>
                <button class="btn btn-outline" id="changePasswordBtn">
                  <i class="fas fa-key"></i> تغییر رمز عبور
                </button>
                <button class="btn btn-danger" id="logoutBtn">
                  <i class="fas fa-sign-out-alt"></i> خروج از حساب کاربری
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // اضافه کردن استایل مودال پروفایل
      if (!document.getElementById('profile-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'profile-modal-styles';
        style.textContent = `
          .profile-content {
            max-width: 500px;
          }
          
          .profile-header {
            background: linear-gradient(to right, #4361ee, #3a56d4);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          
          .profile-avatar {
            font-size: 60px;
            margin-bottom: 10px;
          }
          
          .profile-header h3 {
            margin: 0;
          }
          
          .profile-body {
            padding: 20px;
          }
          
          .profile-section {
            margin-bottom: 20px;
          }
          
          .profile-section h4 {
            margin-top: 0;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          
          .profile-info {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          
          .info-item {
            display: flex;
          }
          
          .info-label {
            font-weight: bold;
            width: 100px;
          }
          
          .profile-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          
          .btn-danger {
            background-color: #e74c3c;
            color: white;
            border: none;
          }
          
          .btn-danger:hover {
            background-color: #c0392b;
          }
          
          @media (max-width: 768px) {
            .profile-actions {
              flex-direction: column;
            }
            
            .profile-actions button {
              width: 100%;
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      // رویداد خروج
      const logoutBtn = modal.querySelector('#logoutBtn');
      logoutBtn.addEventListener('click', () => {
        this.handleLogout();
        modal.classList.remove('show');
      });
      
      // رویداد ویرایش پروفایل
      const editProfileBtn = modal.querySelector('#editProfileBtn');
      editProfileBtn.addEventListener('click', () => {
        // در اینجا می‌توانید به فرم ویرایش پروفایل هدایت کنید
        contactFormManager.showNotification('این قابلیت هنوز در دسترس نیست.', 'info');
      });
      
      // رویداد تغییر رمز عبور
      const changePasswordBtn = modal.querySelector('#changePasswordBtn');
      changePasswordBtn.addEventListener('click', () => {
        // در اینجا می‌توانید به فرم تغییر رمز عبور هدایت کنید
        contactFormManager.showNotification('این قابلیت هنوز در دسترس نیست.', 'info');
      });
      
      // رویداد بستن مودال
      const closeBtn = modal.querySelector('.modal-close');
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
      });
      
      // بستن با کلیک بیرون از محتوا
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    }
    
    // نمایش مودال
    modal.classList.add('show');
  },
  
  handleLogout: function() {
    // حذف توکن از localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    
    // به‌روزرسانی UI
    this.updateUIBasedOnAuth(false);
    
    // نمایش پیام
    contactFormManager.showNotification('شما با موفقیت خارج شدید.', 'info');
  },
  
  showFormError: function(inputId, message) {
    const input = document.getElementById(inputId);
    
    if (!input) return;
    
    input.classList.add('error');
    
    // حذف پیام خطای قبلی
    const prevError = input.parentNode.querySelector('.error-message');
    if (prevError) {
      prevError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    input.parentNode.appendChild(errorDiv);
    
    // افکت لرزش
    input.classList.add('shake');
    setTimeout(() => {
      input.classList.remove('shake');
    }, 500);
    
    // حذف کلاس خطا هنگام تایپ
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const error = input.parentNode.querySelector('.error-message');
      if (error) {
        error.remove();
      }
    }, { once: true });
  },
  
  validateEmail: function(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  }
};

// =============== کنترل‌های دسترسی‌پذیری ===============
function setupAccessibility() {
  logger.log('راه‌اندازی قابلیت‌های دسترسی‌پذیری...');
  
  // اضافه کردن متن جایگزین برای تصاویر
  const images = document.querySelectorAll('img:not([alt])');
  images.forEach(img => {
    let altText = '';
    
    // تلاش برای تشخیص متن جایگزین از روی محتوای اطراف
    const parent = img.parentNode;
    const siblings = parent.childNodes;
    
    for (let i = 0; i < siblings.length; i++) {
      if (siblings[i].nodeType === Node.ELEMENT_NODE && siblings[i] !== img) {
        const sibling = siblings[i];
        if (sibling.textContent.trim()) {
          altText = sibling.textContent.trim();
          break;
        }
      }
    }
    
    // اگر متنی پیدا نشد، از مسیر تصویر استفاده کن
    if (!altText) {
      const src = img.getAttribute('src');
      if (src) {
        const parts = src.split('/');
        const filename = parts[parts.length - 1].split('.')[0];
        altText = filename.replace(/-|_/g, ' ');
      }
    }
    
    img.setAttribute('alt', altText || 'تصویر');
  });
  
  // بهبود دسترسی‌پذیری با کیبورد
  const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
  interactiveElements.forEach(el => {
    if (!el.getAttribute('tabindex')) {
      el.setAttribute('tabindex', '0');
    }
  });
  
  logger.log('قابلیت‌های دسترسی‌پذیری راه‌اندازی شدند');
}

// =============== مدیریت کوکی‌ها ===============
const cookieManager = {
  init: function() {
    logger.log('راه‌اندازی مدیریت کوکی‌ها...');
    
    // بررسی پذیرش کوکی‌ها
    const consent = this.getCookie('cookie_consent');
    
    if (!consent) {
      this.showCookieConsent();
    }
    
    logger.log('مدیریت کوکی‌ها راه‌اندازی شد');
  },
  
  showCookieConsent: function() {
    // بررسی وجود نوار پذیرش کوکی
    let cookieBar = document.getElementById('cookie-consent-bar');
    
    if (!cookieBar) {
      cookieBar = document.createElement('div');
      cookieBar.id = 'cookie-consent-bar';
      
      cookieBar.innerHTML = `
        <div class="cookie-text">
          <i class="fas fa-cookie-bite"></i>
          <p>این وب‌سایت از کوکی‌ها برای بهبود تجربه شما استفاده می‌کند. با ادامه استفاده از وب‌سایت، با استفاده از کوکی‌ها موافقت می‌کنید.</p>
        </div>
        <div class="cookie-buttons">
          <button id="cookie-accept" class="btn btn-sm btn-primary">قبول کوکی‌ها</button>
          <button id="cookie-settings" class="btn btn-sm btn-outline">تنظیمات کوکی‌ها</button>
        </div>
      `;
      
      document.body.appendChild(cookieBar);
      
      // اضافه کردن استایل
      if (!document.getElementById('cookie-styles')) {
        const style = document.createElement('style');
        style.id = 'cookie-styles';
        style.textContent = `
          #cookie-consent-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: rgba(255, 255, 255, 0.95);
            box-shadow: 0 -5px 10px rgba(0, 0, 0, 0.1);
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 9998;
            backdrop-filter: blur(5px);
            transform: translateY(100%);
            animation: slide-up 0.5s forwards;
          }
          
          @keyframes slide-up {
            to { transform: translateY(0); }
          }
          
          .cookie-text {
            display: flex;
            align-items: center;
            gap: 15px;
            max-width: 80%;
          }
          
          .cookie-text i {
            font-size: 24px;
            color: #4361ee;
          }
          
          .cookie-text p {
            margin: 0;
            font-size: 14px;
          }
          
          .cookie-buttons {
            display: flex;
            gap: 10px;
          }
          
          .btn-sm {
            padding: 5px 10px;
            font-size: 14px;
          }
          
          @media (max-width: 768px) {
            #cookie-consent-bar {
              flex-direction: column;
              gap: 15px;
            }
            
            .cookie-text {
              max-width: 100%;
            }
            
            .cookie-buttons {
              width: 100%;
              display: flex;
              justify-content: center;
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      // رویداد دکمه قبول
      const acceptBtn = document.getElementById('cookie-accept');
      acceptBtn.addEventListener('click', () => {
        this.setCookieConsent(true);
        cookieBar.style.animation = 'slide-down 0.5s forwards';
        setTimeout(() => {
          cookieBar.remove();
        }, 500);
      });
      
      // رویداد دکمه تنظیمات
      const settingsBtn = document.getElementById('cookie-settings');
      settingsBtn.addEventListener('click', () => {
        this.showCookieSettings();
      });
      
      // اضافه کردن انیمیشن slide-down
      if (!document.getElementById('cookie-slide-down-style')) {
        const slideDownStyle = document.createElement('style');
        slideDownStyle.id = 'cookie-slide-down-style';
        slideDownStyle.textContent = `
          @keyframes slide-down {
            to { transform: translateY(100%); }
          }
        `;
        document.head.appendChild(slideDownStyle);
      }
    }
  },
  
  showCookieSettings: function() {
    let modal = document.getElementById('cookie-settings-modal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cookie-settings-modal';
      modal.className = 'modal';
      
      modal.innerHTML = `
        <div class="modal-content cookie-settings-content">
          <button class="modal-close">&times;</button>
          <h3>تنظیمات کوکی‌ها</h3>
          <p>لطفاً نوع کوکی‌هایی که می‌خواهید فعال باشند را انتخاب کنید:</p>
          
          <div class="cookie-options">
            <div class="cookie-option">
              <div class="option-header">
                <label>
                  <input type="checkbox" id="essential-cookies" checked disabled>
                  <span>کوکی‌های ضروری</span>
                </label>
              </div>
              <p class="option-description">این کوکی‌ها برای عملکرد صحیح وب‌سایت ضروری هستند و نمی‌توانند غیرفعال شوند.</p>
            </div>
            
            <div class="cookie-option">
              <div class="option-header">
                <label>
                  <input type="checkbox" id="functional-cookies" checked>
                  <span>کوکی‌های عملکردی</span>
                </label>
              </div>
              <p class="option-description">این کوکی‌ها به ما کمک می‌کنند تا تنظیمات شما را ذخیره کنیم و تجربه بهتری را فراهم کنیم.</p>
            </div>
            
            <div class="cookie-option">
              <div class="option-header">
                <label>
                  <input type="checkbox" id="analytics-cookies" checked>
                  <span>کوکی‌های تحلیلی</span>
                </label>
              </div>
              <p class="option-description">این کوکی‌ها به ما کمک می‌کنند تا نحوه استفاده کاربران از وب‌سایت را بررسی کنیم و آن را بهبود دهیم.</p>
            </div>
            
            <div class="cookie-option">
              <div class="option-header">
                <label>
                  <input type="checkbox" id="marketing-cookies">
                  <span>کوکی‌های بازاریابی</span>
                </label>
              </div>
              <p class="option-description">این کوکی‌ها برای نمایش تبلیغات مرتبط با علایق شما استفاده می‌شوند.</p>
            </div>
          </div>
          
          <div class="cookie-settings-buttons">
            <button id="save-cookies" class="btn btn-primary">ذخیره تنظیمات</button>
            <button id="reject-all-cookies" class="btn btn-outline">رد همه کوکی‌ها</button>
            <button id="accept-all-cookies" class="btn btn-outline">قبول همه کوکی‌ها</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // اضافه کردن استایل
      if (!document.getElementById('cookie-settings-styles')) {
        const style = document.createElement('style');
        style.id = 'cookie-settings-styles';
        style.textContent = `
          .cookie-settings-content {
            max-width: 600px;
          }
          
          .cookie-settings-content h3 {
            margin-top: 0;
          }
          
          .cookie-options {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin: 20px 0;
          }
          
          .cookie-option {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 15px;
          }
          
          .option-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
          }
          
          .option-header label {
            display: flex;
            align-items: center;
            font-weight: bold;
            cursor: pointer;
          }
          
          .option-header input[type="checkbox"] {
            margin-left: 10px;
            width: 18px;
            height: 18px;
          }
          
          .option-description {
            margin: 0;
            font-size: 14px;
            color: #666;
          }
          
          .cookie-settings-buttons {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            flex-wrap: wrap;
          }
          
          @media (max-width: 768px) {
            .cookie-settings-buttons {
              flex-direction: column;
            }
            
            .cookie-settings-buttons button {
              width: 100%;
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      // رویداد دکمه ذخیره
      const saveBtn = document.getElementById('save-cookies');
      saveBtn.addEventListener('click', () => {
        const functionalCookies = document.getElementById('functional-cookies').checked;
        const analyticsCookies = document.getElementById('analytics-cookies').checked;
        const marketingCookies = document.getElementById('marketing-cookies').checked;
        
        const preferences = {
          essential: true,
          functional: functionalCookies,
          analytics: analyticsCookies,
          marketing: marketingCookies
        };
        
        this.setCookieConsent(true, preferences);
        modal.classList.remove('show');
        
        // بستن نوار کوکی
        const cookieBar = document.getElementById('cookie-consent-bar');
        if (cookieBar) {
          cookieBar.style.animation = 'slide-down 0.5s forwards';
          setTimeout(() => {
            cookieBar.remove();
          }, 500);
        }
        
        contactFormManager.showNotification('تنظیمات کوکی‌ها با موفقیت ذخیره شد.', 'success');
      });
      
      // رویداد دکمه رد همه
      const rejectBtn = document.getElementById('reject-all-cookies');
      rejectBtn.addEventListener('click', () => {
        const preferences = {
          essential: true,
          functional: false,
          analytics: false,
          marketing: false
        };
        
        this.setCookieConsent(false, preferences);
        modal.classList.remove('show');
        
        // بستن نوار کوکی
        const cookieBar = document.getElementById('cookie-consent-bar');
        if (cookieBar) {
          cookieBar.style.animation = 'slide-down 0.5s forwards';
          setTimeout(() => {
            cookieBar.remove();
          }, 500);
        }
        
        contactFormManager.showNotification('همه کوکی‌ها به جز کوکی‌های ضروری رد شدند.', 'info');
      });
      
      // رویداد دکمه قبول همه
      const acceptAllBtn = document.getElementById('accept-all-cookies');
      acceptAllBtn.addEventListener('click', () => {
        const preferences = {
          essential: true,
          functional: true,
          analytics: true,
          marketing: true
        };
        
        this.setCookieConsent(true, preferences);
        modal.classList.remove('show');
        
        // بستن نوار کوکی
        const cookieBar = document.getElementById('cookie-consent-bar');
        if (cookieBar) {
          cookieBar.style.animation = 'slide-down 0.5s forwards';
          setTimeout(() => {
            cookieBar.remove();
          }, 500);
        }
        
        contactFormManager.showNotification('همه کوکی‌ها پذیرفته شدند.', 'success');
      });
      
      // رویداد بستن مودال
      const closeBtn = modal.querySelector('.modal-close');
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
      });
      
      // بستن با کلیک بیرون از محتوا
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    }
    
    // نمایش مودال
    modal.classList.add('show');
  },
  
  setCookieConsent: function(accepted, preferences = null) {
    // ذخیره وضعیت پذیرش کوکی
    const value = JSON.stringify({
      accepted: accepted,
      preferences: preferences || { essential: true },
      timestamp: new Date().toISOString()
    });
    
    // ذخیره در کوکی
    this.setCookie('cookie_consent', value, 365);
  },
  
  setCookie: function(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  },
  
  getCookie: function(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    
    return null;
  }
};

// =============== راه‌اندازی عمومی ===============
function initOtherFeatures() {
  // راه‌اندازی قابلیت‌های اصلی سایت
  menuManager.init();
  counterManager.initializeCounters();
  sliderManager.init();
  galleryManager.init();
  teachersManager.init();
  newsManager.init();
  calendarManager.init();
  registrationManager.init();
  faqManager.init();
  contactFormManager.init();
  newsletterManager.init();
  
  // راه‌اندازی قابلیت‌های تکمیلی
  setupSmoothScroll();
  setupScrollIndicator();
  setupOnlineStatus();
  setupAOS();
  setupAccessibility();
  cookieManager.init();
  authManager.init();
  
  logger.info('تمام قابلیت‌های سایت با موفقیت راه‌اندازی شدند');
}

// =============== اجرای اولیه ===============
document.addEventListener('DOMContentLoaded', function() {
    // فعال کردن دیباگ در محیط توسعه
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      CONFIG.debug = true;
    }
    
    // راه‌اندازی پیش‌بارگذاری
    preloaderManager.init();
    
    // تایمر محافظ برای اطمینان از راه‌اندازی همه قابلیت‌ها
    setTimeout(() => {
      const preloader = document.getElementById('preloader');
      if (preloader && !preloader.classList.contains('fade-out')) {
        preloaderManager.finishLoading();
      }
    }, CONFIG.loadTimeout);
  });
  
  // راه‌اندازی ثانویه در زمان لود کامل صفحه
  window.addEventListener('load', function() {
    // پنهان کردن پیش‌بارگذار اگر هنوز فعال است
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('fade-out')) {
      preloaderManager.finishLoading();
    }
  });
  
  // تابع بازیابی و راه‌اندازی مجدد
  window.reInitialize = function() {
    logger.log('راه‌اندازی مجدد همه قابلیت‌ها...');
    
    // راه‌اندازی همه قابلیت‌ها
    initOtherFeatures();
    
    // بروزرسانی AOS
    if (typeof AOS !== 'undefined') {
      AOS.refresh();
    }
    
    logger.info('راه‌اندازی مجدد با موفقیت انجام شد');
  };
  
  // تابع بررسی و رفع خطاها
  window.fixWebsite = function() {
    logger.log('بررسی و رفع خطاهای سایت...');
    
    // بررسی و بازیابی منابع ضروری خارجی
    const externalResources = [
      { type: 'css', src: CONFIG.cdnLinks.fontAwesome, id: 'font-awesome' },
      { type: 'css', src: CONFIG.cdnLinks.aos, id: 'aos-css' },
      { type: 'css', src: CONFIG.cdnLinks.swiper, id: 'swiper-css' },
      { type: 'script', src: CONFIG.cdnLinks.aosScript, id: 'aos-script' },
      { type: 'script', src: CONFIG.cdnLinks.swiperScript, id: 'swiper-script' }
    ];
    
    externalResources.forEach(resource => {
      const selector = resource.type === 'css' ? 
        `link[href*="${resource.src.split('/').pop()}"]` : 
        `script[src*="${resource.src.split('/').pop()}"]`;
      
      if (!document.querySelector(selector)) {
        logger.warn(`منبع گمشده: ${resource.src}`);
        
        if (resource.type === 'css') {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = resource.src;
          link.id = resource.id;
          document.head.appendChild(link);
        } else {
          const script = document.createElement('script');
          script.src = resource.src;
          script.id = resource.id;
          document.body.appendChild(script);
        }
      }
    });
    
    // بررسی و بازیابی بخش‌های اصلی
    const criticalSections = ['home', 'about', 'fields', 'teachers', 'gallery', 'registration', 'contact'];
    
    criticalSections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      
      if (!section) {
        logger.error(`بخش ${sectionId} یافت نشد!`);
        
        // ایجاد یک بخش پیش‌فرض
        const newSection = document.createElement('section');
        newSection.id = sectionId;
        newSection.className = sectionId;
        
        // اضافه کردن محتوای پیش‌فرض
        newSection.innerHTML = `
          <div class="container">
            <h2 class="section-title">${sectionId === 'home' ? 'صفحه اصلی' : 
              sectionId === 'about' ? 'درباره ما' : 
              sectionId === 'fields' ? 'رشته‌های تحصیلی' : 
              sectionId === 'teachers' ? 'اساتید برجسته' : 
              sectionId === 'gallery' ? 'گالری تصاویر' : 
              sectionId === 'registration' ? 'ثبت نام' : 
              sectionId === 'contact' ? 'تماس با ما' : sectionId}</h2>
            <p class="error-message">محتوای این بخش در حال بازیابی است...</p>
          </div>
        `;
        
        // پیدا کردن موقعیت مناسب برای درج
        const main = document.querySelector('main') || document.body;
        
        if (sectionId === 'home') {
          main.insertBefore(newSection, main.firstChild);
        } else {
          // پیدا کردن بخش قبلی
          const prevSectionIndex = criticalSections.indexOf(sectionId) - 1;
          
          if (prevSectionIndex >= 0) {
            const prevSection = document.getElementById(criticalSections[prevSectionIndex]);
            
            if (prevSection && prevSection.nextSibling) {
              main.insertBefore(newSection, prevSection.nextSibling);
            } else {
              main.appendChild(newSection);
            }
          } else {
            main.appendChild(newSection);
          }
        }
      }
    });
    
    // بازنشانی ویژگی‌های انیمیشن
    document.querySelectorAll('[data-aos]').forEach(el => {
      el.classList.add('aos-animate');
    });
    
    // راه‌اندازی مجدد همه قابلیت‌ها
    window.reInitialize();
    
    logger.info('بررسی و رفع خطاها با موفقیت انجام شد');
  };
  
  // استفاده از Performance API برای گزارش‌دهی عملکرد
  if ('performance' in window && 'getEntriesByType' in performance) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const totalTime = perfData.loadEventEnd - perfData.startTime;
        
        logger.log(`گزارش عملکرد صفحه:
          زمان کل بارگذاری: ${Math.round(totalTime)}ms
          زمان DNS: ${Math.round(perfData.domainLookupEnd - perfData.domainLookupStart)}ms
          زمان اتصال: ${Math.round(perfData.connectEnd - perfData.connectStart)}ms
          زمان DOM: ${Math.round(perfData.domComplete - perfData.domInteractive)}ms`);
      }, 0);
    });
  }
  
  // بررسی خطاهای احتمالی در صفحه
  window.addEventListener('error', function(e) {
    logger.error(`خطای جاوااسکریپت: ${e.message} در ${e.filename}:${e.lineno}`);
    
    // اطلاع به کاربر در صورت خطاهای مکرر
    const now = Date.now();
    
    if (!window.lastErrorTime) {
      window.lastErrorTime = now;
      window.errorCount = 1;
    } else if (now - window.lastErrorTime < 5000) {
      window.errorCount++;
      
      if (window.errorCount > 5) {
        contactFormManager.showNotification('با عرض پوزش، سایت با مشکل مواجه شده. در حال تلاش برای رفع خطا...', 'error');
        
        // تلاش برای رفع خودکار
        window.fixWebsite();
        
        // بازنشانی شمارنده خطا
        window.errorCount = 0;
      }
    } else {
      window.lastErrorTime = now;
      window.errorCount = 1;
    }
  });
  // =============== راه‌اندازی دکمه‌های انتخاب فایل اصلی ===============
function initFileUploads() {
    console.log("راه‌اندازی دکمه‌های انتخاب فایل...");
    
    // پیدا کردن همه فیلدهای آپلود در فرم ثبت‌نام
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    if (fileInputs.length === 0) {
      console.warn("هیچ فیلد آپلود فایلی در صفحه یافت نشد!");
      
      // بررسی آیا بخش آپلود مدارک وجود دارد
      const uploadSection = document.querySelector('.upload-section');
      if (uploadSection) {
        console.log("بخش آپلود یافت شد. بازسازی فیلدهای آپلود...");
        rebuildUploadSection(uploadSection);
      } else {
        console.warn("بخش آپلود مدارک یافت نشد!");
      }
      
      return;
    }
    
    console.log(`${fileInputs.length} فیلد آپلود فایل یافت شد.`);
    
    fileInputs.forEach((input, index) => {
      // بررسی آیا فیلد آپلود قبلاً راه‌اندازی شده است
      if (input.dataset.initialized === "true") {
        return;
      }
      
      // یافتن کانتینر پیش‌نمایش مرتبط
      const inputId = input.id || `file-input-${index}`;
      if (!input.id) input.id = inputId;
      
      let previewContainer = document.getElementById(`${inputId}Preview`);
      
      // اگر کانتینر پیش‌نمایش وجود ندارد، ایجاد کنید
      if (!previewContainer) {
        previewContainer = document.createElement('div');
        previewContainer.id = `${inputId}Preview`;
        previewContainer.className = 'upload-preview';
        previewContainer.innerHTML = `
          <i class="fas fa-upload"></i>
          <span>فایلی انتخاب نشده</span>
        `;
        
        // قرار دادن بعد از input
        input.parentNode.insertBefore(previewContainer, input.nextSibling);
      }
      
      // اضافه کردن استایل‌های ضروری
      if (!document.getElementById('file-upload-styles')) {
        const style = document.createElement('style');
        style.id = 'file-upload-styles';
        style.textContent = `
          .upload-group {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .upload-item {
            flex: 1 1 300px;
          }
          
          .upload-preview {
            border: 2px dashed #ddd;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin-top: 10px;
            background-color: #f9f9f9;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 120px;
          }
          
          .upload-preview:hover {
            border-color: #4361ee;
            background-color: #f0f4ff;
          }
          
          .upload-preview i {
            font-size: 32px;
            color: #aaa;
            margin-bottom: 10px;
          }
          
          .upload-preview img {
            max-width: 100%;
            max-height: 150px;
            border-radius: 4px;
            margin-bottom: 10px;
          }
          
          .upload-preview .file-name {
            font-size: 14px;
            color: #666;
            word-break: break-all;
          }
          
          .upload-preview .file-size {
            font-size: 12px;
            color: #999;
            margin-top: 5px;
          }
          
          .upload-preview .file-actions {
            margin-top: 10px;
          }
          
          .upload-preview .remove-file {
            background-color: #ff3860;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 5px 10px;
            font-size: 12px;
            cursor: pointer;
          }
          
          .upload-preview.has-file i {
            color: #4361ee;
          }
          
          input[type="file"] {
            position: absolute;
            width: 0;
            height: 0;
            overflow: hidden;
            opacity: 0;
          }
          
          .custom-file-input {
            display: inline-block;
            background-color: #4361ee;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
          }
          
          .custom-file-input:hover {
            background-color: #3a56d4;
          }
          
          .upload-section {
            margin-top: 20px;
          }
          
          .file-type-icon {
            font-size: 40px !important;
            margin-bottom: 10px;
          }
          
          .pdf-icon { color: #e74c3c !important; }
          .image-icon { color: #3498db !important; }
          .doc-icon { color: #2980b9 !important; }
          .excel-icon { color: #27ae60 !important; }
          .zip-icon { color: #f39c12 !important; }
          .default-icon { color: #95a5a6 !important; }
        `;
        document.head.appendChild(style);
      }
      
      // پنهان کردن input اصلی
      input.style.display = 'none';
      
      // ایجاد دکمه انتخاب فایل سفارشی
      const uploadLabel = document.createElement('label');
      uploadLabel.htmlFor = inputId;
      uploadLabel.className = 'custom-file-input';
      uploadLabel.innerHTML = '<i class="fas fa-upload"></i> انتخاب فایل';
      
      // قرار دادن دکمه قبل از کانتینر پیش‌نمایش
      input.parentNode.insertBefore(uploadLabel, input);
      
      // محدودیت‌های فایل
      let acceptedTypes = input.accept ? input.accept.split(',').map(type => type.trim()) : [];
      let maxFileSize = 5; // مگابایت
      
      // رویداد تغییر برای وقتی فایل انتخاب می‌شود
      input.addEventListener('change', function() {
        const file = this.files[0];
        
        if (file) {
          // بررسی نوع فایل
          if (acceptedTypes.length > 0) {
            const fileType = file.type;
            let isValidType = false;
            
            for (const type of acceptedTypes) {
              if (type === fileType || (type.includes('*') && fileType.startsWith(type.replace('*', '')))) {
                isValidType = true;
                break;
              }
            }
            
            if (!isValidType) {
              showNotification(`فرمت فایل ${file.name} مجاز نیست. لطفاً فایلی با فرمت مناسب انتخاب کنید.`, 'error');
              this.value = '';
              resetPreview(previewContainer);
              return;
            }
          }
          
          // بررسی حجم فایل
          if (file.size > maxFileSize * 1024 * 1024) {
            showNotification(`حجم فایل بیشتر از ${maxFileSize} مگابایت است!`, 'error');
            this.value = '';
            resetPreview(previewContainer);
            return;
          }
          
          // آپدیت پیش‌نمایش
          updatePreview(file, previewContainer);
        } else {
          resetPreview(previewContainer);
        }
      });
      
      // افزودن قابلیت کشیدن و رها کردن (drag & drop)
      previewContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
      });
      
      previewContainer.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
      });
      
      previewContainer.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file) {
          input.files = e.dataTransfer.files;
          const changeEvent = new Event('change', { bubbles: true });
          input.dispatchEvent(changeEvent);
        }
      });
      
      // اضافه کردن قابلیت کلیک روی پیش‌نمایش برای انتخاب فایل
      previewContainer.addEventListener('click', function() {
        if (!this.classList.contains('has-file')) {
          input.click();
        }
      });
      
      // نشانه‌گذاری input به عنوان راه‌اندازی شده
      input.dataset.initialized = "true";
      
      console.log(`فیلد آپلود ${inputId} با موفقیت راه‌اندازی شد.`);
    });
  
    function updatePreview(file, container) {
      container.classList.add('has-file');
      let iconClass = 'fas fa-file default-icon';
      let previewImage = '';
      
      // تعیین آیکون مناسب بر اساس نوع فایل
      if (file.type.startsWith('image/')) {
        iconClass = 'fas fa-file-image image-icon';
        
        // اگر تصویر است، پیش‌نمایش نشان بده
        const reader = new FileReader();
        reader.onload = function(e) {
          container.innerHTML = `
            <img src="${e.target.result}" alt="پیش‌نمایش">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
            <div class="file-actions">
              <button type="button" class="remove-file">حذف</button>
            </div>
          `;
          
          // رویداد حذف فایل
          container.querySelector('.remove-file').addEventListener('click', function(e) {
            e.stopPropagation();
            resetFileInput(container);
          });
        };
        reader.readAsDataURL(file);
        return;
      } else if (file.type === 'application/pdf') {
        iconClass = 'fas fa-file-pdf pdf-icon';
      } else if (file.type.includes('word') || file.type === 'application/rtf') {
        iconClass = 'fas fa-file-word doc-icon';
      } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
        iconClass = 'fas fa-file-excel excel-icon';
      } else if (file.type.includes('zip') || file.type.includes('compressed')) {
        iconClass = 'fas fa-file-archive zip-icon';
      }
      
      container.innerHTML = `
        <i class="${iconClass} file-type-icon"></i>
        <div class="file-name">${file.name}</div>
        <div class="file-size">${formatFileSize(file.size)}</div>
        <div class="file-actions">
          <button type="button" class="remove-file">حذف</button>
        </div>
      `;
      
      // رویداد حذف فایل
      container.querySelector('.remove-file').addEventListener('click', function(e) {
        e.stopPropagation();
        resetFileInput(container);
      });
    }
  
    function resetPreview(container) {
      container.classList.remove('has-file');
      container.innerHTML = `
        <i class="fas fa-upload"></i>
        <span>فایلی انتخاب نشده</span>
      `;
    }
  
    function resetFileInput(container) {
      // یافتن input مرتبط
      const inputId = container.id.replace('Preview', '');
      const input = document.getElementById(inputId);
      
      if (input) {
        input.value = '';
      }
      
      resetPreview(container);
    }
  
    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  
    function rebuildUploadSection(uploadSection) {
      // بازسازی بخش آپلود با ساختار صحیح
      uploadSection.innerHTML = `
        <label>آپلود مدارک</label>
        <div class="upload-group">
          <div class="upload-item">
            <label for="idCardUpload">تصویر شناسنامه</label>
            <input type="file" id="idCardUpload" name="idCardUpload" accept="image/*,.pdf">
            <div class="upload-preview" id="idCardUploadPreview">
              <i class="fas fa-upload"></i>
              <span>فایلی انتخاب نشده</span>
            </div>
          </div>
          
          <div class="upload-item">
            <label for="gradeReportUpload">کارنامه سال قبل</label>
            <input type="file" id="gradeReportUpload" name="gradeReportUpload" accept="image/*,.pdf">
            <div class="upload-preview" id="gradeReportUploadPreview">
              <i class="fas fa-upload"></i>
              <span>فایلی انتخاب نشده</span>
            </div>
          </div>
        </div>
      `;
      
      // راه‌اندازی مجدد
      setTimeout(() => initFileUploads(), 100);
    }
  
    function showNotification(message, type = 'info') {
      // استفاده از سیستم نوتیفیکیشن موجود
      if (typeof contactFormManager !== 'undefined' && typeof contactFormManager.showNotification === 'function') {
        contactFormManager.showNotification(message, type);
      } else {
        // پیاده‌سازی ساده
        alert(message);
      }
    }
  }
  
  // اجرا در لود صفحه
  document.addEventListener('DOMContentLoaded', initFileUploads);
  
  // اجرای مجدد در زمان‌های مشخص برای اطمینان از راه‌اندازی
  setTimeout(initFileUploads, 1000);
  setTimeout(initFileUploads, 3000);
  
  // ارائه به عنوان تابع جهانی
  window.initFileUploads = initFileUploads;
  document.addEventListener('DOMContentLoaded', function() {
    // منوی همبرگر
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // بستن منو با کلیک روی لینک‌ها در حالت موبایل
    const navItems = document.querySelectorAll('.nav-links li a');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
});
// مدیریت تقویم آموزشی
document.addEventListener('DOMContentLoaded', function() {
  // ماه‌های فارسی
  const persianMonths = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  
  // متغیرهای سراسری
  let currentDate = new Date();
  let selectedDate = null;
  let events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
  
  // المان‌های DOM
  const calendarDays = document.getElementById('calendarDays');
  const currentMonthEl = document.getElementById('currentMonth');
  const eventsList = document.getElementById('eventsList');
  const noEvents = document.getElementById('noEvents');
  const eventsTitle = document.getElementById('eventsTitle');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  const addEventBtn = document.getElementById('addEventBtn');
  const eventModal = document.getElementById('eventModal');
  const closeModal = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const eventForm = document.getElementById('eventForm');
  const eventDateInput = document.getElementById('eventDateInput');
  
  // تبدیل تاریخ میلادی به شمسی (تقریبی - برای پروژه واقعی از کتابخانه استفاده کنید)
  function toJalali(gDate) {
      const gYear = gDate.getFullYear();
      const gMonth = gDate.getMonth();
      const gDay = gDate.getDate();
      
      // تبدیل تقریبی - این تبدیل دقیق نیست!
      let jYear = gYear - 621;
      let jMonth = (gMonth + 3) % 12;
      if (jMonth < 3) jYear -= 1;
      
      return {
          year: jYear,
          month: jMonth,
          day: gDay
      };
  }
  
  // نمایش تقویم
  function renderCalendar() {
      // پاک کردن محتوای قبلی
      calendarDays.innerHTML = '';
      
      // تنظیم ماه و سال نمایشی
      const jalaliDate = toJalali(currentDate);
      currentMonthEl.textContent = `${persianMonths[jalaliDate.month]} ${jalaliDate.year}`;
      
      // تعیین روز اول ماه
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      // تعیین تعداد روزهای ماه
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const daysInMonth = lastDay.getDate();
      
      // تعیین روز هفته برای اولین روز ماه (در جاوااسکریپت 0=یکشنبه، 6=شنبه)
      // در تقویم فارسی شنبه اولین روز هفته است
      let firstDayOfWeek = firstDay.getDay();
      // تبدیل شاخص به تقویم فارسی (شنبه=0، یکشنبه=1، ...)
      firstDayOfWeek = (firstDayOfWeek + 1) % 7;
      
      // اضافه کردن روزهای خالی قبل از شروع ماه
      for (let i = 0; i < firstDayOfWeek; i++) {
          const emptyDay = document.createElement('div');
          emptyDay.className = 'day empty';
          calendarDays.appendChild(emptyDay);
      }
      
      // اضافه کردن روزهای ماه
      for (let i = 1; i <= daysInMonth; i++) {
          const dayElement = document.createElement('div');
          dayElement.className = 'day';
          dayElement.textContent = i;
          
          // بررسی اگر این روز رویدادی دارد
          const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
          const hasEvent = events.some(event => {
              const eventDate = new Date(event.date);
              return eventDate.getDate() === i && 
                     eventDate.getMonth() === currentDate.getMonth() && 
                     eventDate.getFullYear() === currentDate.getFullYear();
          });
          
          if (hasEvent) {
              dayElement.classList.add('has-event');
          }
          
          // بررسی اگر این روز، امروز است
          const today = new Date();
          if (i === today.getDate() && 
              currentDate.getMonth() === today.getMonth() && 
              currentDate.getFullYear() === today.getFullYear()) {
              dayElement.classList.add('today');
          }
          
          // اگر این روز، روز انتخاب شده است
          if (selectedDate && 
              i === selectedDate.getDate() && 
              currentDate.getMonth() === selectedDate.getMonth() && 
              currentDate.getFullYear() === selectedDate.getFullYear()) {
              dayElement.classList.add('selected');
          }
          
          // اضافه کردن رویداد کلیک
          dayElement.addEventListener('click', () => {
              // حذف کلاس selected از همه روزها
              document.querySelectorAll('.day').forEach(day => {
                  day.classList.remove('selected');
              });
              
              // اضافه کردن کلاس selected به روز انتخاب شده
              dayElement.classList.add('selected');
              
              // تنظیم تاریخ انتخاب شده
              selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
              
              // تغییر عنوان بخش رویدادها
              const jalali = toJalali(selectedDate);
              eventsTitle.textContent = `رویدادهای ${i} ${persianMonths[jalali.month]}`;
              
              // نمایش رویدادهای روز انتخاب شده
              renderEvents();
          });
          
          calendarDays.appendChild(dayElement);
      }
  }
  
  // نمایش رویدادها
  function renderEvents() {
      // پاک کردن محتوای قبلی
      eventsList.innerHTML = '';
      
      // فیلتر کردن رویدادها بر اساس تاریخ انتخاب شده
      let filteredEvents;
      
      if (selectedDate) {
          // نمایش رویدادهای روز انتخاب شده
          filteredEvents = events.filter(event => {
              const eventDate = new Date(event.date);
              return eventDate.getDate() === selectedDate.getDate() &&
                     eventDate.getMonth() === selectedDate.getMonth() &&
                     eventDate.getFullYear() === selectedDate.getFullYear();
          });
      } else {
          // نمایش رویدادهای ماه جاری
          filteredEvents = events.filter(event => {
              const eventDate = new Date(event.date);
              return eventDate.getMonth() === currentDate.getMonth() &&
                     eventDate.getFullYear() === currentDate.getFullYear();
          });
          
          // مرتب کردن بر اساس تاریخ
          filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      
      // نمایش پیام "بدون رویداد" اگر رویدادی وجود ندارد
      if (filteredEvents.length === 0) {
          noEvents.style.display = 'block';
          return;
      }
      
      // مخفی کردن پیام "بدون رویداد"
      noEvents.style.display = 'none';
      
      // ساخت المان‌های رویدادها
      filteredEvents.forEach(event => {
          const eventDate = new Date(event.date);
          const jalaliDate = toJalali(eventDate);
          
          const eventItem = document.createElement('div');
          eventItem.className = 'event-item';
          
          eventItem.innerHTML = `
              <div class="event-date" style="background-color: ${event.color}">
                  <div class="event-day">${eventDate.getDate()}</div>
                  <div class="event-month">${persianMonths[jalaliDate.month].substring(0, 3)}</div>
              </div>
              <div class="event-content">
                  <h4>${event.title}</h4>
                  <div class="event-time">
                      <i class="far fa-clock"></i>
                      <span>${event.time}</span>
                  </div>
                  <div class="event-location">
                      <i class="fas fa-map-marker-alt"></i>
                      <span>${event.location}</span>
                  </div>
              </div>
          `;
          
          eventsList.appendChild(eventItem);
      });
  }
  
  // تغییر ماه به قبل
  prevMonthBtn.addEventListener('click', function() {
      currentDate.setMonth(currentDate.getMonth() - 1);
      selectedDate = null;
      eventsTitle.textContent = 'رویدادهای ماه جاری';
      renderCalendar();
      renderEvents();
  });
  
  // تغییر ماه به بعد
  nextMonthBtn.addEventListener('click', function() {
      currentDate.setMonth(currentDate.getMonth() + 1);
      selectedDate = null;
      eventsTitle.textContent = 'رویدادهای ماه جاری';
      renderCalendar();
      renderEvents();
  });
  
  // نمایش مودال افزودن رویداد
  addEventBtn.addEventListener('click', function() {
      // تنظیم تاریخ در فرم
      let dateToSet = selectedDate ? selectedDate : new Date();
      
      // تنظیم تاریخ به فرمت مناسب برای نمایش
      const year = dateToSet.getFullYear();
      const month = String(dateToSet.getMonth() + 1).padStart(2, '0');
      const day = String(dateToSet.getDate()).padStart(2, '0');
      
      // تبدیل به فرمت شمسی برای نمایش (تقریبی)
      const jalaliDate = toJalali(dateToSet);
      eventDateInput.value = `${jalaliDate.year}/${jalaliDate.month + 1}/${jalaliDate.day}`;
      
      // ذخیره تاریخ میلادی به صورت مخفی برای استفاده هنگام ثبت
      eventDateInput.setAttribute('data-date', `${year}-${month}-${day}`);
      
      // نمایش مودال
      eventModal.style.display = 'flex';
  });
  
  // بستن مودال
  closeModal.addEventListener('click', function() {
      eventModal.style.display = 'none';
  });
  
  cancelBtn.addEventListener('click', function() {
      eventModal.style.display = 'none';
  });
  
  // بستن مودال با کلیک خارج از آن
  window.addEventListener('click', function(event) {
      if (event.target === eventModal) {
          eventModal.style.display = 'none';
      }
  });
  
  // ارسال فرم افزودن رویداد
  eventForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // دریافت مقادیر فرم
      const title = document.getElementById('eventTitle').value;
      const date = eventDateInput.getAttribute('data-date'); // تاریخ میلادی ذخیره شده
      const time = document.getElementById('eventTime').value;
      const location = document.getElementById('eventLocation').value;
      const description = document.getElementById('eventDescription').value;
      const color = document.querySelector('input[name="eventColor"]:checked').value;
      
      // ایجاد رویداد جدید
      const newEvent = {
          id: Date.now(), // ایجاد شناسه یکتا
          title,
          date,
          time,
          location,
          description,
          color
      };
      
      // افزودن به آرایه رویدادها
      events.push(newEvent);
      
      // ذخیره در localStorage
      localStorage.setItem('calendarEvents', JSON.stringify(events));
      
      // بستن مودال
      eventModal.style.display = 'none';
      
      // به‌روزرسانی نمایش
      renderCalendar();
      renderEvents();
      
      // نمایش پیام موفقیت
      alert('رویداد با موفقیت ثبت شد');
  });
  
  // شروع با نمایش تقویم و رویدادهای ماه جاری
  renderCalendar();
  renderEvents();
});