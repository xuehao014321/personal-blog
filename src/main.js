import './style.css'

// 1. Initialize Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate Lenis with GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);


// 2. Custom Cursor Logic
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
  const posX = e.clientX;
  const posY = e.clientY;

  cursorDot.style.left = `${posX}px`;
  cursorDot.style.top = `${posY}px`;

  gsap.to(cursorOutline, {
    x: posX,
    y: posY,
    duration: 0.15,
    ease: "power2.out"
  });
});

const magneticElements = document.querySelectorAll('.magnetic, .magnetic-link, .nav-item');
magneticElements.forEach(el => {
  el.addEventListener('mouseenter', () => {
    if(el.dataset.cursor === "-inverse") {
      document.body.setAttribute('data-hover-inverse', 'true');
    }
    document.body.setAttribute('data-hover', 'true');
  });
  
  el.addEventListener('mouseleave', () => {
    document.body.setAttribute('data-hover', 'false');
    document.body.setAttribute('data-hover-inverse', 'false');
    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  });

  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const h = rect.width / 2;
    const w = rect.height / 2;
    const x = e.clientX - rect.left - h;
    const y = e.clientY - rect.top - w;
    
    gsap.to(el, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.4,
      ease: "power2.out"
    });
  });
});


// 3. Spotlight Hover effect for Bento Items
document.querySelectorAll('.bento-item').forEach(item => {
  item.addEventListener('mousemove', e => {
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    item.style.setProperty('--mouse-x', `${x}px`);
    item.style.setProperty('--mouse-y', `${y}px`);
  });
});


// 4. GSAP Entrance Animations (Hero)
const tl = gsap.timeline();
tl.to(".line-inner", {
  y: "0%", duration: 1.2, stagger: 0.1, ease: "power4.out", delay: 0.2
})
.to(".hero-subtitle", {
  opacity: 1, y: 0, duration: 1, ease: "power3.out"
}, "-=0.8")
.to(".cta-button", {
  opacity: 1, y: 0, duration: 1, ease: "power3.out"
}, "-=0.8")
.from(".hero-image", {
  opacity: 0, y: 100, duration: 1.8, ease: "power2.out"
}, "-=1.2");


// 5. GSAP ScrollTrigger Animations (Content Blocks)
gsap.utils.toArray('.gs_reveal').forEach(elem => {
  gsap.to(elem, {
    scrollTrigger: {
      trigger: elem,
      start: "top 85%",
      toggleActions: "play none none reverse"
    },
    y: 0,
    opacity: 1,
    duration: 1,
    ease: "power3.out"
  });
});


// 6. ScrollSpy Logic (Left Sidebar syncs with Right Content)
const sections = document.querySelectorAll('.content-section');
const navItems = document.querySelectorAll('.nav-item');

sections.forEach((section, index) => {
  ScrollTrigger.create({
    trigger: section,
    start: "top center", // Trigger when the top of section hits center of viewport
    end: "bottom center",
    onEnter: () => setActiveNav(index),
    onEnterBack: () => setActiveNav(index),
  });
});

function setActiveNav(activeIndex) {
  navItems.forEach((item, index) => {
    if (index === activeIndex) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Click navigation dots to scroll to section
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const targetId = item.getAttribute('data-target');
    const targetSection = document.getElementById(targetId);
    if(targetSection) {
      lenis.scrollTo(targetSection, { offset: -100 });
    }
  });
});

// 7. Interactive Wave Path (Day/Night Divider)
const wavePath = document.querySelector('.wave-path');
const waveHoverArea = document.querySelector('.wave-hover-area');

if (wavePath && waveHoverArea) {
  let progress = 0;
  let x = 0.5;
  let time = Math.PI / 2;
  let reqId = null;

  const lerp = (a, b, n) => (1 - n) * a + n * b;

  const setPath = (prog) => {
    const width = window.innerWidth * 0.7; // Matches 70vw CSS width
    // Draw bezier curve from (0, 150) to (width, 150), control point dynamically pulled by mouse
    wavePath.setAttributeNS(null, 'd', `M0 150 Q${width * x} ${150 + prog}, ${width} 150`);
  };

  // Initial draw
  setPath(0);
  window.addEventListener('resize', () => setPath(0));

  const animateOut = () => {
    const newProgress = progress * Math.sin(time);
    progress = lerp(progress, 0, 0.025); // Spring elasticity
    time += 0.2; // Speed of oscillation
    
    setPath(newProgress);
    
    // Keep animating until progress is small enough
    if (Math.abs(progress) > 0.5) {
      reqId = requestAnimationFrame(animateOut);
    } else {
      resetAnimation();
    }
  };

  const resetAnimation = () => {
    time = Math.PI / 2;
    progress = 0;
    setPath(0);
  };

  waveHoverArea.addEventListener('mouseenter', () => {
    if (reqId) {
      cancelAnimationFrame(reqId);
      resetAnimation();
    }
  });

  waveHoverArea.addEventListener('mousemove', (e) => {
    const movementY = e.movementY;
    const clientX = e.clientX;
    const pathBound = waveHoverArea.getBoundingClientRect();
    
    // Normalize mouse X relative to the SVG container (0 to 1)
    x = (clientX - pathBound.left) / pathBound.width;
    
    // Add vertical mouse velocity to the string tension
    progress += movementY;
    setPath(progress);
  });

  waveHoverArea.addEventListener('mouseleave', () => {
    animateOut();
  });
}

// 8. Timeline sidebar scroll-spy (for index.html blog section)
const timelineEntries = document.querySelectorAll('.timeline-entry');
if (timelineEntries.length > 0) {
  const timelineTargets = Array.from(timelineEntries).map(e => document.getElementById(e.dataset.target));

  timelineTargets.forEach((section, index) => {
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => setActiveTimeline(index),
      onEnterBack: () => setActiveTimeline(index),
    });
  });

  function setActiveTimeline(activeIndex) {
    timelineEntries.forEach((entry, i) => {
      entry.classList.toggle('active', i === activeIndex);
    });
  }

  // Click to scroll
  timelineEntries.forEach(entry => {
    entry.addEventListener('click', () => {
      const target = document.getElementById(entry.dataset.target);
      if (target) lenis.scrollTo(target, { offset: -120 });
    });
  });
}

// 9. Skill bar entrance animation (for about.html)
const skillBars = document.querySelectorAll('.skill-bar-fill');
if (skillBars.length > 0) {
  // Store target widths then reset to 0 for animation
  skillBars.forEach(bar => {
    const targetWidth = bar.style.width;
    bar.dataset.targetWidth = targetWidth;
    bar.style.width = '0%';

    ScrollTrigger.create({
      trigger: bar,
      start: 'top 85%',
      onEnter: () => {
        bar.style.width = bar.dataset.targetWidth;
      }
    });
  });
}

