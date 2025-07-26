export class GalleryCarousel {
  constructor() {
    this.currentIndex = 0;
    this.totalSlides = document.querySelectorAll('.carousel-slide').length;
    this.track = document.getElementById('carouselTrack');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.indicators = document.querySelectorAll('.indicator');
    this.autoPlayInterval = null;
    this.isGalleryVisible = false;
    this.observer = null;
    this.isInitialized = false;
    
    this.init();
  }
  
  init() {
    if (!this.track || this.totalSlides === 0) return;
    this.setupGalleryObserver();
    
    this.prevBtn?.addEventListener('click', () => this.prevSlide(), { passive: true });
    this.nextBtn?.addEventListener('click', () => this.nextSlide(), { passive: true });
    
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index), { passive: true });
    });
    
    const carousel = document.querySelector('.carousel-container');
    carousel?.addEventListener('mouseenter', () => this.pauseAutoPlay(), { passive: true });
    carousel?.addEventListener('mouseleave', () => this.startAutoPlay(), { passive: true });
    
    this.addTouchSupport();
  }
  
  goToSlide(index) {
    this.currentIndex = index;
    this.updateCarousel();
    this.preloadImages();
  }
  
  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
    this.updateCarousel();
    this.preloadImages();
  }
  
  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
    this.updateCarousel();
    this.preloadImages();
  }
  
  updateCarousel() {
    if (!this.track) return;
    
    const translateX = -this.currentIndex * 100;
    this.track.style.transform = `translateX(${translateX}%)`;
    
    // Update indicators efficiently
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentIndex);
    });
  }
  
  startAutoPlay() {
    if (this.isGalleryVisible && !this.autoPlayInterval) {
      this.autoPlayInterval = setInterval(() => {
        this.nextSlide();
      }, 5000);
    }
  }
  
  pauseAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
  
  setupGalleryObserver() {
    if (!('IntersectionObserver' in window)) {
      this.initializeGallery();
      return;
    }
    
    const galleryElement = document.querySelector('.gallery-carousel');
    if (!galleryElement) return;
    
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.isInitialized) {
            this.isGalleryVisible = true;
            this.initializeGallery();
            this.isInitialized = true;
          } else if (entry.isIntersecting) {
            this.isGalleryVisible = true;
            this.startAutoPlay();
          } else {
            this.isGalleryVisible = false;
            this.pauseAutoPlay();
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '100px 0px'
      }
    );
    
    this.observer.observe(galleryElement);
  }
  
  initializeGallery() {
    this.preloadImages();
    if (this.isGalleryVisible) {
      this.startAutoPlay();
    }
  }
  
  destroy() {
    this.pauseAutoPlay();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  preloadImages() {
    this.loadImage(this.currentIndex);
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const nextIndex = (this.currentIndex + 1) % this.totalSlides;
        const prevIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.loadImage(nextIndex);
        this.loadImage(prevIndex);
      });
    } else {
      setTimeout(() => {
        const nextIndex = (this.currentIndex + 1) % this.totalSlides;
        const prevIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.loadImage(nextIndex);
        this.loadImage(prevIndex);
      }, 100);
    }
  }
  
  loadImage(index) {
    const slide = document.querySelector(`.carousel-slide[data-index="${index}"]`);
    const img = slide?.querySelector('img');
    
    if (img && img.classList.contains('lazy-load')) {
      const dataSrc = img.getAttribute('data-src');
      if (dataSrc) {
        img.src = dataSrc;
        img.classList.remove('lazy-load');
        img.classList.add('loaded');
        
        img.addEventListener('load', () => {
          img.style.opacity = '1';
        }, { once: true, passive: true });
      }
    }
  }
  
  addTouchSupport() {
    let startX = 0;
    let isDragging = false;
    
    this.track?.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      this.pauseAutoPlay();
    }, { passive: true });
    
    this.track?.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
    });
    
    this.track?.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
      
      this.startAutoPlay();
    }, { passive: true });
  }
}
