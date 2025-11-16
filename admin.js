(function() {
  'use strict';

  let allImages = [];
  let metadata = {};
  let currentEditingImage = null;
  let currentEditingIndex = -1;

  // DOM elements
  const imageGrid = document.getElementById('imageGrid');
  const editModal = document.getElementById('editModal');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const metadataForm = document.getElementById('metadataForm');
  const copyBtn = document.getElementById('copyBtn');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const editedCount = document.getElementById('editedCount');
  const totalCount = document.getElementById('totalCount');

  // Initialize
  async function init() {
    try {
      await loadData();
      renderGrid();
      setupEventListeners();
      updateStats();
    } catch (error) {
      console.error('Failed to initialize:', error);
      showToast('Failed to load data', 'error');
    }
  }

  // Load data.json and metadata.json
  async function loadData() {
    // Load images data
    const dataResponse = await fetch('data.json');
    const data = await dataResponse.json();
    allImages = data.images || [];

    // Load existing metadata
    try {
      const metadataResponse = await fetch('metadata.json');
      metadata = await metadataResponse.json();
    } catch (error) {
      console.warn('No existing metadata.json found, starting fresh');
      metadata = {};
    }
  }

  // Render image grid
  function renderGrid() {
    imageGrid.innerHTML = allImages.map(image => createGridItem(image)).join('');

    // Add click listeners
    document.querySelectorAll('.grid-item').forEach(item => {
      item.addEventListener('click', () => {
        const filename = item.dataset.filename;
        openEditModal(filename);
      });
    });
  }

  // Create grid item HTML
  function createGridItem(image) {
    const meta = metadata[image.filename] || {};
    const category = meta.category || image.category || '';
    const hasMetadata = meta.product || (meta.formFactors && meta.formFactors.length > 0) || (meta.features && meta.features.length > 0);

    return `
      <div class="grid-item category-${category} ${hasMetadata ? 'edited' : ''}" data-filename="${image.filename}">
        <img src="${image.path}" alt="${image.filename}">
        <div class="grid-item-info">
          <div class="grid-item-filename">${image.filename}</div>
          <div class="grid-item-meta">
            ${category ? `<span class="badge">${category}</span>` : ''}
            ${meta.product ? `<span class="badge">${meta.product}</span>` : ''}
            ${hasMetadata ? '<span class="badge complete">✓</span>' : ''}
          </div>
        </div>
      </div>
    `;
  }

  // Open edit modal
  function openEditModal(filename) {
    currentEditingImage = filename;
    currentEditingIndex = allImages.findIndex(img => img.filename === filename);
    const image = allImages.find(img => img.filename === filename);
    const meta = metadata[filename] || {};

    // Set preview
    document.getElementById('previewImage').src = image.path;
    document.getElementById('previewFilename').textContent = filename;

    // Set category
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === (meta.category || image.category));
    });

    // Set product
    document.getElementById('productInput').value = meta.product || '';

    // Set form factors
    document.querySelectorAll('#formFactorsGrid input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = (meta.formFactors || []).includes(checkbox.value);
    });

    // Set features
    document.querySelectorAll('#featuresGrid input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = (meta.features || []).includes(checkbox.value);
    });

    // Populate product suggestions
    populateProductSuggestions();

    editModal.classList.add('active');
  }

  // Close edit modal
  function closeEditModal() {
    editModal.classList.remove('active');
    currentEditingImage = null;
    currentEditingIndex = -1;
  }

  // Populate product name suggestions
  function populateProductSuggestions() {
    const products = new Set();
    Object.values(metadata).forEach(meta => {
      if (meta.product) products.add(meta.product);
    });

    const datalist = document.getElementById('productSuggestions');
    datalist.innerHTML = Array.from(products)
      .sort()
      .map(product => `<option value="${product}">`)
      .join('');
  }

  // Save metadata
  function saveMetadata(event) {
    event.preventDefault();

    if (!currentEditingImage) return;

    // Get category
    const categoryBtn = document.querySelector('.toggle-btn.active');
    const category = categoryBtn ? categoryBtn.dataset.value : '';

    // Get product
    const product = document.getElementById('productInput').value.trim();

    // Get form factors
    const formFactors = Array.from(document.querySelectorAll('#formFactorsGrid input[type="checkbox"]:checked'))
      .map(cb => cb.value);

    // Get features
    const features = Array.from(document.querySelectorAll('#featuresGrid input[type="checkbox"]:checked'))
      .map(cb => cb.value);

    // Update metadata object
    metadata[currentEditingImage] = {
      category: category,
      ...(product && { product: product }),
      ...(formFactors.length > 0 && { formFactors: formFactors }),
      ...(features.length > 0 && { features: features })
    };

    // Re-render grid
    renderGrid();
    updateStats();

    // Auto-advance to next image
    const nextIndex = currentEditingIndex + 1;
    if (nextIndex < allImages.length) {
      const nextImage = allImages[nextIndex];
      openEditModal(nextImage.filename);
      showToast('Saved! Editing next image...');
    } else {
      closeEditModal();
      showToast('All done! Remember to copy to clipboard.');
    }
  }

  // Copy metadata to clipboard
  async function copyToClipboard() {
    try {
      const jsonString = JSON.stringify(metadata, null, 2);
      await navigator.clipboard.writeText(jsonString);
      showToast('Metadata copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast('Failed to copy to clipboard', 'error');
    }
  }

  // Update stats
  function updateStats() {
    const edited = Object.keys(metadata).filter(key => {
      const meta = metadata[key];
      return meta.product || (meta.formFactors && meta.formFactors.length > 0) || (meta.features && meta.features.length > 0);
    }).length;

    editedCount.textContent = edited;
    totalCount.textContent = allImages.length;
  }

  // Show toast notification
  function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Setup event listeners
  function setupEventListeners() {
    // Category toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Modal controls
    closeModalBtn.addEventListener('click', closeEditModal);
    cancelBtn.addEventListener('click', closeEditModal);
    metadataForm.addEventListener('submit', saveMetadata);

    // Close modal on backdrop click
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) closeEditModal();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (!editModal.classList.contains('active')) return;

      // Close modal on Escape
      if (e.key === 'Escape') {
        closeEditModal();
      }

      // Navigate with arrow keys
      if (e.key === 'ArrowRight' && currentEditingIndex < allImages.length - 1) {
        e.preventDefault();
        const nextImage = allImages[currentEditingIndex + 1];
        openEditModal(nextImage.filename);
      }

      if (e.key === 'ArrowLeft' && currentEditingIndex > 0) {
        e.preventDefault();
        const prevImage = allImages[currentEditingIndex - 1];
        openEditModal(prevImage.filename);
      }
    });

    // Copy button
    copyBtn.addEventListener('click', copyToClipboard);
  }

  // Start the app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
