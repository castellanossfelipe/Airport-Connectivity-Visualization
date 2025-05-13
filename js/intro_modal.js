function createIntroModal() {
  let modal = document.querySelector('.intro-modal');

  if (modal) {
    modal.style.display = 'flex';
    focusFirstElement(modal);
    return;
  }

  modal = document.createElement('div');
  modal.className = 'intro-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'intro-title');
  modal.setAttribute('tabindex', '-1');

  modal.innerHTML = `
    <div class="intro-content">
      <h2 id="intro-title">🌍 Explore Global Air Travel Like Never Before</h2>
      <p>
        Dive into the world of air travel. This map brings to life how airports connect the globe. 
        Every bubble shows an airport — the bigger and darker, the more direct outgoing destinations.
      </p>
      <ul>
        <li><strong>Zoom and pan</strong> to travel across continents</li>
        <li><strong>Hover</strong> to reveal airport names and stats</li>
        <li><strong>Filter by traffic</strong> to find major hubs</li>
        <li>Use the <strong>tab</strong> and <strong>space</strong> keys for accesible use</li>
      </ul>
      <button id="intro-close-btn" class="intro-button">Start Exploring ✈️</button>
    </div>
  `;

  document.body.appendChild(modal);

  // Store the previously focused element
  const previouslyFocused = document.activeElement;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeModal();
    if (modal.style.display === 'flex') trapTab(e);
  };
  
  document.addEventListener('keydown', handleKeyDown, true);
  
  const closeModal = () => {
    modal.style.display = 'none';
    if (previouslyFocused && previouslyFocused !== document.body) {
      previouslyFocused.focus();
    }
    document.removeEventListener('keydown', handleKeyDown, true);
  };  

  // Add tab trapping
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const trapTab = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  const focusFirstElement = (modalElement) => {
    const focusable = modalElement.querySelector('#intro-close-btn');
    if (focusable) {
      focusable.focus();
    }
  };

  // Event listeners
  document.getElementById('intro-close-btn').addEventListener('click', closeModal);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (modal.style.display === 'flex') {
      trapTab(e);
    }
  });

  // Focus the first element when modal opens
  focusFirstElement(modal);
}