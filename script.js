// Data Models
const MOCK_DB = [
  {
    id: 'g1',
    name: 'Full-hands sweatshirt',
    category: 'UPPER BODY',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=400&q=80',
    washTemp: 40,
    dryCleanOnly: false,
    icons: ['ph-washing-machine', 'ph-thermometer']
  },
  {
    id: 'g2',
    name: 'Training jacket',
    category: 'OUTERWEAR',
    image: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&w=400&q=80',
    washTemp: 30,
    dryCleanOnly: false,
    icons: ['ph-drop', 'ph-coat-hanger']
  },
  {
    id: 'g3',
    name: 'Training sleeveless top',
    category: 'UPPER BODY',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=400&q=80',
    washTemp: 40,
    dryCleanOnly: false,
    icons: ['ph-wind', 'ph-timer']
  },
  {
    id: 'g4',
    name: 'Compression tight',
    category: 'LOWER BODY',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=400&q=80',
    washTemp: 30,
    dryCleanOnly: false,
    icons: ['ph-lightning', 'ph-drop']
  },
  {
    id: 'g5',
    name: 'Athletic shorts',
    category: 'LOWER BODY',
    image: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?auto=format&fit=crop&w=400&q=80',
    washTemp: 40,
    dryCleanOnly: false,
    icons: ['ph-washing-machine']
  },
  {
    id: 'g6',
    name: 'White t-shirt',
    category: 'UPPER BODY',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80',
    washTemp: 60,
    dryCleanOnly: false,
    icons: ['ph-washing-machine']
  },
  {
    id: 'g7',
    name: 'Silk Evening Blouse',
    category: 'DELICATES',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
    washTemp: null,
    dryCleanOnly: true,
    icons: ['ph-prohibit']
  }
];

const scannedItem = {
  id: 'new_1',
  name: 'Athleisure Training Sweatshirt',
  category: 'UPPER BODY',
  image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
  washTemp: 30,
  dryCleanOnly: false,
  icons: ['ph-washing-machine', 'ph-wind']
};

// Application State
const state = {
  currentView: 'scan', // 'scan', 'sorter', 'wash'
  wardrobe: [...MOCK_DB],
  selectedIds: new Set(['g1', 'g2', 'g3', 'g4']), // default selected from mockup
  hasScannedItem: false,
  conflictItem: null
};

// DOM Elements
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const sorterGrid = document.getElementById('sorter-grid-container');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  renderSorterGrid();
  setupEventListeners();
  updateNavState();
});

function setupEventListeners() {
  // Navigation
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      // Remove share mode if active
      document.body.classList.remove('share-mode');
      
      const target = item.getAttribute('data-target');
      if (target === 'profile') {
          // just a stub for prototype
          alert("Profile view not implemented in this prototype.");
          return;
      }
      switchView(target);
    });
  });

  // Add to Wardrobe
  document.getElementById('btn-add-wardrobe').addEventListener('click', () => {
    if (!state.hasScannedItem) {
      state.wardrobe.unshift(scannedItem);
      state.selectedIds.add(scannedItem.id);
      state.hasScannedItem = true;
      document.getElementById('add-feedback-text').innerText = "Successfully added! Navigating to Sorter...";
      document.getElementById('btn-add-wardrobe').style.opacity = '0.5';
      
      setTimeout(() => {
        renderSorterGrid();
        switchView('sorter');
        document.getElementById('add-feedback-text').innerText = "Added to 'Activewear' category.";
        document.getElementById('btn-add-wardrobe').style.opacity = '1';
      }, 1000);
    } else {
      switchView('sorter');
    }
  });

  // Check Compatibility
  document.getElementById('btn-check-compat').addEventListener('click', () => {
    runCompatibilityEngine();
  });

  // Conflict Modal Actions
  document.getElementById('btn-remove-conflict').addEventListener('click', () => {
    if (state.conflictItem) {
      state.selectedIds.delete(state.conflictItem.id);
      state.conflictItem = null;
      renderSorterGrid();
      document.getElementById('modal-conflict').classList.add('hidden');
      
      // Auto-run compatibility again without the conflict
      runCompatibilityEngine();
    }
  });

  document.getElementById('btn-dismiss-batch').addEventListener('click', () => {
    state.conflictItem = null;
    document.getElementById('modal-conflict').classList.add('hidden');
  });
  
  // Close modal with 'X'
  document.querySelector('.conflict-item-card .btn-icon.danger').addEventListener('click', () => {
      document.getElementById('modal-conflict').classList.add('hidden');
  });

  // Share Guide
  document.getElementById('btn-share-guide').addEventListener('click', () => {
    document.body.classList.add('share-mode');
    alert("Share mode activated! Take a screenshot now. Click any navigation button below (invisible) to exit share mode.");
    
    // Add a temporary way to exit share mode
    const exitShareMode = () => {
      document.body.classList.remove('share-mode');
      document.removeEventListener('click', exitShareMode);
    };
    
    // slight delay so we don't trigger it immediately
    setTimeout(() => {
      document.addEventListener('click', exitShareMode);
    }, 100);
  });
}

function switchView(viewId) {
  state.currentView = viewId;
  
  // Update views
  views.forEach(v => {
    if (v.id === `view-${viewId}`) {
      v.classList.add('active');
      v.classList.remove('hidden');
    } else {
      v.classList.remove('active');
      v.classList.add('hidden');
    }
  });
  
  updateNavState();
}

function updateNavState() {
  navItems.forEach(item => {
    if (item.getAttribute('data-target') === state.currentView) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function renderSorterGrid() {
  if (!sorterGrid) return;
  sorterGrid.innerHTML = '';
  
  state.wardrobe.forEach(item => {
    const isSelected = state.selectedIds.has(item.id);
    
    const card = document.createElement('div');
    card.className = `garment-card ${isSelected ? 'selected' : ''}`;
    card.onclick = () => toggleSelection(item.id, card);
    
    const iconsHtml = item.icons.map(icon => `<i class="ph ${icon}"></i>`).join('');
    
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="garment-img">
      <div class="garment-checkbox"></div>
      <div class="garment-info">
        <span class="garment-cat">${item.category}</span>
        <h3 class="garment-name">${item.name}</h3>
        <div class="garment-icons">
          ${iconsHtml}
        </div>
      </div>
    `;
    
    sorterGrid.appendChild(card);
  });
}

function toggleSelection(id, cardElement) {
  if (state.selectedIds.has(id)) {
    state.selectedIds.delete(id);
    cardElement.classList.remove('selected');
  } else {
    state.selectedIds.add(id);
    cardElement.classList.add('selected');
  }
}

function runCompatibilityEngine() {
  const selectedItems = state.wardrobe.filter(item => state.selectedIds.has(item.id));
  
  if (selectedItems.length === 0) {
    alert("Please select at least one garment.");
    return;
  }

  // 1. Hard Stop Conflict Detection (Dry Clean + Machine Wash)
  const dryCleanItems = selectedItems.filter(i => i.dryCleanOnly);
  const machineWashItems = selectedItems.filter(i => !i.dryCleanOnly);
  
  if (dryCleanItems.length > 0 && machineWashItems.length > 0) {
    // Conflict!
    state.conflictItem = dryCleanItems[0]; // just grab the first one for the modal
    
    // Populate modal
    const conflictCard = document.querySelector('.conflict-item-card');
    conflictCard.querySelector('p').innerText = state.conflictItem.name;
    conflictCard.querySelector('img').src = state.conflictItem.image;
    
    document.getElementById('modal-conflict').classList.remove('hidden');
    return;
  }
  
  // 2. Temperature Logic
  if (machineWashItems.length > 0) {
    const temps = machineWashItems.map(i => i.washTemp).filter(t => t !== null);
    const minTemp = temps.length > 0 ? Math.min(...temps) : 30;
    
    document.getElementById('wash-temp-val').innerText = `${minTemp}°C`;
    
    // Simple logic for Wash Guide details
    if (minTemp <= 30) {
      document.querySelector('.instruction-value .small-value').innerText = "Cold / Eco Wash";
    } else {
      document.querySelector('.instruction-value .small-value').innerText = "Warm Wash";
    }
    
    document.getElementById('wash-batch-title').innerText = `Current Batch: ${selectedItems.length} Items`;
    
    // Switch to wash view
    switchView('wash');
  } else {
    // Only dry clean items selected
    document.getElementById('wash-temp-val').innerText = "N/A";
    document.querySelector('.instruction-value .small-value').innerText = "Dry Clean Only";
    document.getElementById('wash-cycle-val').innerText = "Professional Care";
    document.getElementById('wash-dry-val').innerText = "Do Not Wash";
    document.getElementById('wash-batch-title').innerText = `Current Batch: ${selectedItems.length} Items`;
    
    switchView('wash');
  }
}
