function createIntroModal() {
    const modal = document.createElement('div');
    modal.className = 'intro-modal';
  
    modal.innerHTML = `
      <div class="intro-content">
        <h2>🌍 Explore Global Air Travel Like Never Before</h2>
        <p>
        Dive into the world of air travel. This map brings to life how airports connect the globe. 
        Every bubble shows an airport — the bigger and darker, the busier it is.
        </p>
        <ul>
          <ul>
          <li>🔍 <strong>Zoom and pan</strong> to travel across continents</li>
          <li>🛫 <strong>Hover</strong> to reveal airport names and stats</li>
          <li>🎯 <strong>Filter by traffic</strong> to find major hubs</li>
          <li>♿ <strong>Keyboard & screen reader friendly</strong></li>
        </ul>
        </ul>
        <button id="intro-close-btn" class="intro-button">Start Exploring ✈️</button>
      </div>
    `;
  
    document.body.appendChild(modal);
  
    document.getElementById('intro-close-btn').addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
  