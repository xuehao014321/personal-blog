export function initScrambledText(selector, options = {}) {
  const {
    radius = 120,
    speed = 0.6,
    scrambleChars = '01.:/\\|'
  } = options;

  const containers = document.querySelectorAll(selector);
  if (!containers || containers.length === 0) return;

  const charArray = Array.from(scrambleChars);
  const rgbPalette = [
    '#00f3ff', // Electric Cyan
    '#ff007f', // Neon Pink
    '#ffee00', // Cyber Yellow
    '#00ffaa', // Neon Mint
    '#9d00ff', // Deep Purple
    '#ff5500', // Bright Orange
    '#0077ff', // Vivid Blue
    '#ff0055'  // Crimson Red
  ];
  
  let mouseX = -1000;
  let mouseY = -1000;
  
  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('pointerleave', () => {
    mouseX = -1000;
    mouseY = -1000;
  });
  
  containers.forEach(container => {
    const text = container.textContent.trim();
    if (!text) return;

    container.innerHTML = '';
    
    const chars = [];
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.className = 'scramble-char';
      span.textContent = text[i];
      span.dataset.content = text[i];
      span.style.setProperty('--i', i);
      span.style.setProperty('--total', text.length);

      if (text[i] === ' ') {
        span.innerHTML = '&nbsp;';
      }
      container.appendChild(span);
      chars.push(span);
    }
    
    const interval = 40 + (1 - speed) * 120;

    const update = (now) => {
      // Pass 1: measure bounding rects to avoid layout thrashing
      const distances = chars.map(c => {
        const rect = c.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return Infinity;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        return Math.hypot(mouseX - cx, mouseY - cy);
      });

      // Pass 2: apply mutations
      chars.forEach((c, i) => {
        const dist = distances[i];
        
        if (dist < radius) {
          // Hovering state
          if (!c.isHovered) {
            c.isHovered = true;
            c.lastUpdate = now;
            c.style.setProperty('animation', 'none', 'important'); // Pause grey breathing light
          }
          
          if (now - (c.lastUpdate || 0) > interval) {
            c.textContent = charArray[Math.floor(Math.random() * charArray.length)];
            // Burst into a different vivid RGB color
            c.style.setProperty('color', rgbPalette[Math.floor(Math.random() * rgbPalette.length)], 'important');
            c.lastUpdate = now;
          }
        } else {
          // Not hovering state
          if (c.isHovered) {
            c.isHovered = false;
            c.textContent = c.dataset.content;
            c.style.removeProperty('color'); // Restores light silver grey breathing light
            c.style.removeProperty('animation'); // Re-enables breathing animation
            if (c.dataset.content === ' ') c.innerHTML = '&nbsp;';
          }
        }
      });
      requestAnimationFrame(update);
    };
    
    requestAnimationFrame(update);
  });
}
