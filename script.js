// State
let allPhotos = [];
let displayedPhotos = [];
let currentFilter = 'all';
let currentSearch = '';
let page = 1;
const photosPerPage = 20;
let currentLightboxIndex = 0;

// DOM Elements
const galleryGrid = document.getElementById('galleryGrid');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const loader = document.getElementById('loader');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const mobileMenuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

// Categories for placeholder generation
const categories = ['nature', 'wildlife', 'travel', 'portrait', 'architecture', 'street'];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initCounters();
  initNavbar();
  
  if (galleryGrid) {
    generatePlaceholderData();
    renderGallery();
    initInfiniteScroll();
  }
});

// Navbar scroll effect
function initNavbar() {
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
}

// Generate 100+ placeholder photos
function generatePlaceholderData() {
  for (let i = 1; i <= 105; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    // Using picsum photos with seed for consistency
    const width = 800;
    const height = 600 + Math.floor(Math.random() * 400) - 200; // Randomize height for masonry effect
    allPhotos.push({
      id: i,
      url: `https://picsum.photos/seed/${i + 100}/${width}/${height}`,
      category: category,
      title: `Stunning ${category} photo ${i}`,
      likes: Math.floor(Math.random() * 500) + 50,
      author: `Photographer ${i % 10 + 1}`
    });
  }
  displayedPhotos = [...allPhotos];
}

// Render Gallery Masonry Items
function renderGallery(append = false) {
  if (!galleryGrid) return;
  
  if (!append) {
    galleryGrid.innerHTML = '';
    page = 1;
  }

  const start = (page - 1) * photosPerPage;
  const end = start + photosPerPage;
  const photosToShow = displayedPhotos.slice(start, end);

  if (photosToShow.length === 0 && !append) {
    galleryGrid.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1;">No photos found matching your criteria.</p>';
    if(loader) loader.classList.add('hidden');
    return;
  }

  photosToShow.forEach((photo, index) => {
    const globalIndex = start + index;
    const item = document.createElement('div');
    item.className = 'masonry-item fade-up';
    
    // Slight delay for stagger effect
    setTimeout(() => item.classList.add('visible'), 50 * index);

    item.innerHTML = `
      <div class="photo-card" onclick="openLightbox(${globalIndex})">
        <img src="${photo.url}" alt="${photo.title}" loading="lazy">
        <div class="photo-actions" onclick="event.stopPropagation()">
          <button class="icon-btn" onclick="toggleLike(this, ${photo.id})" title="Like">
            <i class="fa-regular fa-heart"></i>
          </button>
          <a href="${photo.url}" download="photo-${photo.id}.jpg" target="_blank" class="icon-btn" title="Download">
            <i class="fa-solid fa-download"></i>
          </a>
        </div>
        <div class="photo-overlay">
          <h4>${photo.title}</h4>
          <p>By ${photo.author}</p>
        </div>
      </div>
    `;
    galleryGrid.appendChild(item);
  });

  if (end >= displayedPhotos.length && loader) {
    loader.classList.add('hidden');
  } else if (loader) {
    loader.classList.remove('hidden');
  }
}

// Like functionality
function toggleLike(btn, id) {
  btn.classList.toggle('liked');
  const icon = btn.querySelector('i');
  if (btn.classList.contains('liked')) {
    icon.classList.remove('fa-regular');
    icon.classList.add('fa-solid');
  } else {
    icon.classList.remove('fa-solid');
    icon.classList.add('fa-regular');
  }
}

// Filtering
if (filterBtns) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active class from all
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add to clicked
      e.target.classList.add('active');
      
      currentFilter = e.target.dataset.filter;
      applyFilters();
    });
  });
}

// Searching
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    applyFilters();
  });
}

function applyFilters() {
  displayedPhotos = allPhotos.filter(photo => {
    const matchesFilter = currentFilter === 'all' || photo.category === currentFilter;
    const matchesSearch = photo.title.toLowerCase().includes(currentSearch) || 
                          photo.author.toLowerCase().includes(currentSearch) ||
                          photo.category.toLowerCase().includes(currentSearch);
    return matchesFilter && matchesSearch;
  });
  renderGallery(false);
}

// Infinite Scroll
function initInfiniteScroll() {
  window.addEventListener('scroll', () => {
    if (!galleryGrid) return;
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    // If near bottom
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      if (page * photosPerPage < displayedPhotos.length) {
        page++;
        renderGallery(true);
      }
    }
  });
}

// Lightbox
function openLightbox(index) {
  if(!lightbox) return;
  currentLightboxIndex = index;
  updateLightboxImage();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if(!lightbox) return;
  lightbox.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function prevImage(e) {
  e.stopPropagation();
  if (currentLightboxIndex > 0) {
    currentLightboxIndex--;
    updateLightboxImage();
  }
}

function nextImage(e) {
  e.stopPropagation();
  if (currentLightboxIndex < displayedPhotos.length - 1) {
    currentLightboxIndex++;
    updateLightboxImage();
  }
}

function updateLightboxImage() {
  if(!lightboxImg) return;
  const photo = displayedPhotos[currentLightboxIndex];
  lightboxImg.src = photo.url;
  lightboxImg.alt = photo.title;
}

// Close lightbox on click outside
if(lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
}

// Scroll Animations (AOS alternative)
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-up');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => {
    observer.observe(el);
  });
}

// Animated Counters
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  const speed = 200; // The lower the slower

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = +counter.getAttribute('data-target');
        
        const updateCount = () => {
          const current = +counter.innerText;
          const inc = target / speed;

          if (current < target) {
            counter.innerText = Math.ceil(current + inc);
            setTimeout(updateCount, 10);
          } else {
            counter.innerText = target + (target > 1000 ? '+' : '');
          }
        };

        updateCount();
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => {
    observer.observe(counter);
  });
}
