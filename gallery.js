// Gallery App - Dynamically loads and renders images
(function() {
  'use strict';

  let allImages = [];
  let filteredImages = [];
  let activeFilter = 'all'; // Track active category filter (all, light, or dark)
  let selectedAttributes = []; // Track selected form factors and features

  // DOM elements
  const galleryContainer = document.getElementById('gallery');
  const noResultsContainer = document.getElementById('noResults');
  const searchInput = document.querySelector('.search-input');
  const searchClearBtn = document.getElementById('searchClear');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  const scrollToTopBtn = document.getElementById('scrollToTop');
  const dropdownBtn = document.getElementById('dropdownBtn');
  const dropdown = document.getElementById('attributesDropdown');
  const dropdownLabel = document.getElementById('dropdownLabel');
  const formFactorOptions = document.getElementById('formFactorOptions');
  const featureOptions = document.getElementById('featureOptions');
  const clearAttributesBtn = document.getElementById('clearAttributesBtn');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');
  const searchHint = document.getElementById('searchHint');

  // Initialize the gallery
  async function init() {
    try {
      await loadImages();
      populateAttributeDropdown();
      renderGallery(allImages);
      setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize gallery:', error);
      showError();
    }
  }

  // Load images from data.json
  async function loadImages() {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error(`Failed to load data.json: ${response.status}`);
    }
    const data = await response.json();
    allImages = data.images || [];
    filteredImages = allImages;
  }

  // Render gallery items
  function renderGallery(images) {
    if (images.length === 0) {
      galleryContainer.style.display = 'none';
      noResultsContainer.style.display = 'flex';
      return;
    }

    galleryContainer.style.display = '';
    noResultsContainer.style.display = 'none';
    galleryContainer.innerHTML = images.map(image => createGalleryItem(image)).join('');
  }

  // Clear all filters
  function clearFilters() {
    searchInput.value = '';
    setFilter('all');
    clearAttributes();
  }

  // Create HTML for a single gallery item
  function createGalleryItem(image) {
    const title = image.title || image.filename;
    const altText = image.description || title;
    const featuredClass = image.featured ? ' featured' : '';
    const featuredBadge = image.featured ? `<a href="https://amplitude.com/guides-and-surveys?r=nudges.today" target="_blank" rel="noopener noreferrer" class="featured-badge">
      <svg width="648" height="648" viewBox="0 0 648 648" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M304.269 172.92C314.949 205.3 326.499 245.2 338.749 291.76C292.369 291.06 245.289 290.54 199.779 290.01L176.679 289.84C202.759 187.98 234.439 110.79 257.719 92.5896C259.649 91.3696 261.749 90.6696 264.019 90.4896C267.169 90.4896 269.799 92.2396 272.249 95.3896C278.189 104.66 288.699 125.84 304.269 172.92ZM627.539 302.61H627.369L627.019 302.44H626.669C625.449 302.27 624.389 302.09 623.169 302.09L620.019 301.74C547.039 296.49 471.779 294.39 401.419 292.99L401.239 292.47C366.939 163.83 324.059 32.3896 266.299 32.3896C212.389 32.5596 163.909 119.03 122.079 289.15C92.3292 288.8 65.3692 288.28 39.9892 287.93H36.1392C32.9892 287.76 29.8392 287.93 26.6892 288.28C14.0892 290.56 4.28922 300.71 2.35922 313.48C-0.090782 329.93 11.2892 345.33 27.7392 347.78L28.0892 348.13H108.599C101.249 382.08 94.5992 415.86 89.1692 448.24L86.7192 462.59V463.29C86.7192 470.12 90.2192 476.42 95.9992 480.09C105.279 486.04 117.699 483.24 123.649 473.96L124.169 474.48L163.549 348.29H353.269C367.799 403.25 382.849 459.78 402.799 512.99C413.479 541.52 438.329 608.03 479.979 608.38H480.509C544.919 608.38 570.119 504.24 586.749 435.28C590.429 420.4 593.399 407.63 596.379 398.18L597.599 394.33C597.769 393.46 597.949 392.58 597.949 391.53C597.949 387.5 595.319 383.83 591.649 382.43C586.569 380.33 580.799 382.95 578.699 388.03L577.299 391.88C571.869 407.11 566.799 421.46 562.249 434.06L561.899 434.93C533.899 513.87 521.119 549.92 496.269 549.92H495.569H495.219H494.519C462.489 549.92 432.559 420.05 421.189 371.22C419.259 362.82 417.339 354.94 415.759 348.12H622.289C626.139 348.12 629.819 347.24 633.139 345.49L634.009 344.97L635.059 344.27L635.589 343.92C636.109 343.57 636.639 343.22 637.159 342.87C641.359 339.37 644.339 334.64 645.559 329.74C648.189 317.32 639.969 305.06 627.539 302.61Z" fill="currentColor"/>
      </svg>
      <span>Built with Amplitude ↗</span>
    </a>` : '';

    return `
      <div class="gallery-item${featuredClass}" data-id="${image.id}">
        ${featuredBadge}
        <img src="${image.path}" alt="${altText}" loading="lazy" data-lightbox-src="${image.path}">
      </div>
    `;
  }

  // Filter images based on search query and category filter
  function filterImages(query = '') {
    const searchTerm = query.toLowerCase().trim();

    filteredImages = allImages.filter(image => {
      // Check category filter
      let categoryMatch = true;
      if (activeFilter !== 'all') {
        categoryMatch = image.category === activeFilter;
      }

      // Check attribute filter (formFactors and features)
      let attributeMatch = true;
      if (selectedAttributes.length > 0) {
        const imageAttributes = [
          ...(image.formFactors || []),
          ...(image.features || [])
        ];
        attributeMatch = selectedAttributes.every(attr => imageAttributes.includes(attr));
      }

      // Check search query
      let searchMatch = true;
      if (searchTerm) {
        const searchableText = [
          image.title,
          image.description,
          image.filename,
          ...(image.tags || []),
          image.category,
          image.product,
          ...(image.formFactors || []),
          ...(image.features || [])
        ].join(' ').toLowerCase();
        searchMatch = searchableText.includes(searchTerm);
      }

      return categoryMatch && attributeMatch && searchMatch;
    });

    renderGallery(filteredImages);
  }

  // Set active filter button
  function setFilter(filterValue) {
    activeFilter = filterValue;

    // Update button active states
    filterButtons.forEach(btn => {
      if (btn.dataset.filter === filterValue) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Re-filter images
    filterImages(searchInput.value);
  }

  // Populate attribute dropdown with form factors and features
  function populateAttributeDropdown() {
    const formFactors = new Set();
    const features = new Set();

    allImages.forEach(image => {
      (image.formFactors || []).forEach(ff => formFactors.add(ff));
      (image.features || []).forEach(f => features.add(f));
    });

    // Populate form factors
    formFactorOptions.innerHTML = Array.from(formFactors).sort().map(ff => `
      <div class="dropdown-option">
        <input type="checkbox" id="ff-${ff}" value="${ff}" data-type="formFactor">
        <label for="ff-${ff}">${ff}</label>
      </div>
    `).join('');

    // Populate features
    featureOptions.innerHTML = Array.from(features).sort().map(f => `
      <div class="dropdown-option">
        <input type="checkbox" id="feat-${f}" value="${f}" data-type="feature">
        <label for="feat-${f}">${f}</label>
      </div>
    `).join('');
  }

  // Handle attribute selection
  function handleAttributeChange() {
    const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
    selectedAttributes = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    updateDropdownLabel();
    filterImages(searchInput.value);
  }

  // Update dropdown label with count
  function updateDropdownLabel() {
    dropdownLabel.textContent = 'Tags';

    // Show/hide indicator dot
    if (selectedAttributes.length > 0) {
      dropdownBtn.classList.add('has-selections');
    } else {
      dropdownBtn.classList.remove('has-selections');
    }
  }

  // Clear all attribute selections
  function clearAttributes() {
    const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    selectedAttributes = [];
    updateDropdownLabel();
    filterImages(searchInput.value);
  }

  // Toggle search clear button and hint visibility
  function toggleSearchClear() {
    if (searchInput.value.trim()) {
      searchClearBtn.style.display = 'flex';
      searchHint.style.display = 'none';
    } else {
      searchClearBtn.style.display = 'none';
      searchHint.style.display = 'flex';
    }
  }

  // Clear search input
  function clearSearch() {
    searchInput.value = '';
    toggleSearchClear();
    filterImages('');
  }

  // Set up event listeners
  function setupEventListeners() {
    // Search/filter input
    searchInput.addEventListener('input', (e) => {
      toggleSearchClear();
      filterImages(e.target.value);
    });

    // Clear search button
    searchClearBtn.addEventListener('click', clearSearch);

    // Optional: Clear search on Escape key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        clearSearch();
      }
    });

    // Filter buttons
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
      });
    });

    // Clear filters button
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Dropdown toggle
    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });

    // Prevent dropdown from closing when clicking inside
    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Attribute checkboxes change
    dropdown.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        handleAttributeChange();
      }
    });

    // Clear attributes button
    clearAttributesBtn.addEventListener('click', clearAttributes);

    // Scroll to top button
    if (scrollToTopBtn) {
      // Show/hide button on scroll
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          scrollToTopBtn.classList.add('visible');
        } else {
          scrollToTopBtn.classList.remove('visible');
        }
      });

      // Scroll to top on click
      scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }

    // Lightbox functionality
    galleryContainer.addEventListener('click', (e) => {
      if (e.target.tagName === 'IMG' && e.target.dataset.lightboxSrc) {
        openLightbox(e.target.dataset.lightboxSrc);
      }
    });

    lightboxClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });

    lightbox.addEventListener('click', closeLightbox);

    lightboxImage.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Close lightbox on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });

    // Focus search input on "/" key
    document.addEventListener('keydown', (e) => {
      // Only activate if not already typing in an input/textarea
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  // Open lightbox
  function openLightbox(imageSrc) {
    lightboxImage.src = imageSrc;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxImage.src = '';
    document.body.style.overflow = '';
  }

  // Show error message
  function showError() {
    galleryContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <p style="color: #e53e3e; margin-bottom: 0.5rem;">Failed to load gallery</p>
        <p style="color: #999; font-size: 14px;">Please try refreshing the page</p>
      </div>
    `;
  }

  // Start the app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
