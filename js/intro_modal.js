function createIntroModal() {
    const modal = document.createElement('div');
    modal.className = 'intro-modal';
  
    modal.innerHTML = `
      <div class="intro-content">
        <h2>Welcome to the Global Airport Connectivity Map</h2>
        <p>
          This interactive map visualizes global airport traffic as of 2024.
          Each bubble represents an airport, with its size and color reflecting the number of outgoing routes.
        </p>
        <ul>
          <li>📍 <strong>Zoom and pan</strong> to explore specific regions.</li>
          <li>🖱️ <strong>Hover</strong> over bubbles to see airport details.</li>
          <li>🎨 <strong>Use the legend</strong> or the <strong>filter</strong> to view data by traffic volume.</li>
          <li>♿ <strong>Fully accessible</strong> with keyboard and screen reader support.</li>
        </ul>
        <button id="intro-close-btn">Start Exploring</button>
      </div>
    `;
  
    document.body.appendChild(modal);
  
    document.getElementById('intro-close-btn').addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
  