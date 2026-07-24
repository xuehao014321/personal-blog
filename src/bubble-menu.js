// gsap is available globally via CDN in index.html

const DEFAULT_ITEMS = [
  { label: 'home', href: '/', ariaLabel: 'Home', rotation: -8, hoverStyles: { bgColor: '#000000', textColor: '#ffffff', borderColor: '#000000' } },
  { label: 'projects', href: '/projects.html', ariaLabel: 'Projects', rotation: 8, hoverStyles: { bgColor: '#333333', textColor: '#ffffff', borderColor: '#333333' } },
  { label: 'blog', href: '/#timeline-view', ariaLabel: 'Blog', rotation: 8, hoverStyles: { bgColor: '#777777', textColor: '#ffffff', borderColor: '#777777' } },
  { label: 'about', href: '/about.html', ariaLabel: 'About', rotation: -8, hoverStyles: { bgColor: '#f0f0f0', textColor: '#111111', borderColor: '#a3a3a3' } }
];

export function initBubbleMenu(containerSelector, options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const {
    logo = 'HX',
    menuAriaLabel = 'Toggle menu',
    menuBg = '#fff',
    menuContentColor = '#111',
    useFixedPosition = true,
    items = DEFAULT_ITEMS,
    animationEase = 'back.out(1.5)',
    animationDuration = 0.5,
    staggerDelay = 0.12
  } = options;

  let isMenuOpen = false;
  let showOverlay = false;

  // Build DOM
  container.innerHTML = `
    <nav class="bubble-menu ${useFixedPosition ? 'fixed' : 'absolute'}" aria-label="Main navigation">
      <a href="/" class="bubble logo-bubble" aria-label="Logo" style="background: ${menuBg}; text-decoration: none;">
        <span class="logo-content" style="font-weight: 700; color: ${menuContentColor};">
          ${logo}
        </span>
      </a>

      <button type="button" class="bubble toggle-bubble menu-btn" aria-label="${menuAriaLabel}" style="background: ${menuBg}">
        <span class="menu-line" style="background: ${menuContentColor}"></span>
        <span class="menu-line short" style="background: ${menuContentColor}"></span>
      </button>
    </nav>
    <div class="bubble-menu-items ${useFixedPosition ? 'fixed' : 'absolute'}" aria-hidden="true" style="display: none;">
      <ul class="pill-list" role="menu" aria-label="Menu links">
        ${items.map((item, idx) => `
          <li role="none" class="pill-col">
            <a role="menuitem" href="${item.href}" aria-label="${item.ariaLabel || item.label}" class="pill-link"
               style="--item-rot: ${item.rotation ?? 0}deg; --pill-bg: ${menuBg}; --pill-color: ${menuContentColor}; --hover-bg: ${item.hoverStyles?.bgColor || '#000000'}; --hover-color: ${item.hoverStyles?.textColor || '#ffffff'}; --hover-border: ${item.hoverStyles?.borderColor || 'rgba(0,0,0,0.2)'};">
              <span class="pill-label">${item.label}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    </div>
  `;

  const nav = container.querySelector('nav');
  const toggleBtn = container.querySelector('.menu-btn');
  const overlay = container.querySelector('.bubble-menu-items');
  const bubbles = Array.from(overlay.querySelectorAll('.pill-link'));
  const labels = Array.from(overlay.querySelectorAll('.pill-label'));

  function handleResize() {
    if (isMenuOpen) {
      const isDesktop = window.innerWidth >= 900;
      bubbles.forEach((bubble, i) => {
        const item = items[i];
        if (bubble && item) {
          const rotation = isDesktop ? (item.rotation ?? 0) : 0;
          gsap.set(bubble, { rotation });
        }
      });
    }
  }

  function handleToggle() {
    isMenuOpen = !isMenuOpen;
    
    if (isMenuOpen) {
      showOverlay = true;
      document.body.style.overflow = 'hidden'; // Disable scrolling when menu is open
      toggleBtn.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      gsap.set(overlay, { display: 'flex' });
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(labels, { y: 24, autoAlpha: 0 });

      handleResize(); // Set initial rotation

      bubbles.forEach((bubble, i) => {
        const delay = i * staggerDelay + gsap.utils.random(-0.05, 0.05);
        const tl = gsap.timeline({ delay });

        tl.to(bubble, {
          scale: 1,
          duration: animationDuration,
          ease: animationEase
        });
        if (labels[i]) {
          tl.to(labels[i], {
            y: 0,
            autoAlpha: 1,
            duration: animationDuration,
            ease: 'power3.out'
          }, `-=${animationDuration * 0.9}`);
        }
      });
    } else {
      document.body.style.overflow = ''; // Re-enable scrolling when menu is closed
      toggleBtn.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      gsap.killTweensOf([...bubbles, ...labels]);
      
      gsap.to(labels, {
        y: 24,
        autoAlpha: 0,
        duration: 0.2,
        ease: 'power3.in'
      });
      
      gsap.to(bubbles, {
        scale: 0,
        duration: 0.2,
        ease: 'power3.in',
        onComplete: () => {
          gsap.set(overlay, { display: 'none' });
          showOverlay = false;
        }
      });
    }
  }

  toggleBtn.addEventListener('click', handleToggle);
  window.addEventListener('resize', handleResize);

  return {
    destroy: () => {
      toggleBtn.removeEventListener('click', handleToggle);
      window.removeEventListener('resize', handleResize);
      container.innerHTML = '';
      document.body.style.overflow = '';
    }
  };
}
