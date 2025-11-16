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

    return `
      <div class="gallery-item" data-id="${image.id}">
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

  // Toggle search clear button visibility
  function toggleSearchClear() {
    if (searchInput.value.trim()) {
      searchClearBtn.style.display = 'flex';
    } else {
      searchClearBtn.style.display = 'none';
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
