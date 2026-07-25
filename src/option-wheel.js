export class OptionWheel {
  constructor(container, options = {}) {
    this.container = container;
    this.items = options.items || [];
    this.defaultSelected = options.defaultSelected || 0;
    this.onChange = options.onChange || null;
    this.side = options.side || 'left';
    this.curve = options.curve || 1;
    this.tilt = options.tilt || 6;
    this.fade = options.fade || 0.25;
    this.minOpacity = options.minOpacity || 0.05;
    this.smoothing = options.smoothing || 200;
    this.inset = options.inset || 10; 
    this.loop = options.loop || false;
    this.draggable = options.draggable !== false;
    this.rowH = options.rowH || 150; 

    this.pos = this.defaultSelected;
    this.target = this.defaultSelected;
    this.selectedIndex = this.defaultSelected;
    this.lastTime = 0;
    this.rafId = null;
    this.itemRefs = [];
    
    this.wheelTimer = null;
    this.isDragging = false;
    this.dragStart = 0;
    this.dragY = 0;
    this.dragId = null;
    this.dragMoved = false;

    this.init();
  }

  init() {
    this.container.classList.add('option-wheel');
    if (this.side === 'right') this.container.classList.add('option-wheel--right');
    this.container.style.setProperty('--ow-inset', `${this.inset}px`);
    
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    this.container.style.height = '350px'; 
    this.container.style.width = '100%';
    this.container.style.cursor = this.draggable ? 'grab' : 'auto';

    // Prevent Lenis from stealing our wheel scroll
    this.container.setAttribute('data-lenis-prevent', 'true');

    this.container.innerHTML = '';
    this.itemRefs = [];
    
    this.items.forEach((itemHtml, index) => {
      const el = document.createElement('div');
      el.className = `option-wheel__item ${this.selectedIndex === index ? 'option-wheel__item--selected' : ''}`;
      el.innerHTML = itemHtml;
      
      el.addEventListener('click', () => this.handleItemClick(index));
      
      this.itemRefs.push(el);
      this.container.appendChild(el);
    });

    this.bindEvents();
    this.applyTarget(this.target, false);
  }

  runFrame(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    
    const tau = Math.max(this.smoothing, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);

    let next = this.pos + (this.target - this.pos) * k;
    const settled = Math.abs(this.target - next) < 0.001;
    if (settled) next = this.target;
    this.pos = next;

    const n = this.items.length;
    const mirror = this.side === 'right' ? -1 : 1;
    const tiltRad = (this.tilt * Math.PI) / 180;
    const R = tiltRad > 0.0005 ? this.rowH / tiltRad : 0;

    for (let i = 0; i < n; i++) {
      const el = this.itemRefs[i];
      if (!el) continue;
      
      let d = i - next;
      if (this.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }
      
      const dist = Math.abs(d);
      let x = 0;
      let y = d * this.rowH;
      let rot = 0;
      
      if (R > 0) {
        const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
        y = R * Math.sin(ang);
        x = -mirror * R * (1 - Math.cos(ang)) * this.curve;
        rot = (mirror * ang * 180) / Math.PI;
      }
      
      el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
      el.style.opacity = String(Math.max(this.minOpacity, 1 - dist * this.fade));
      
      // Update pointer events so only the visible/selected item is clickable/interactive
      if (dist < 1.0) {
        el.style.pointerEvents = 'auto';
      } else {
        el.style.pointerEvents = 'none';
      }
    }

    if (settled) {
      this.rafId = null;
    } else {
      this.rafId = requestAnimationFrame((now) => this.runFrame(now));
    }
  }

  startLoop() {
    if (this.rafId !== null) return;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame((now) => this.runFrame(now));
  }

  applyTarget(value, snap) {
    let v = value;
    if (!this.loop) v = Math.min(Math.max(v, 0), Math.max(this.items.length - 1, 0));
    if (snap) v = Math.round(v);
    this.target = v;
    
    const idx = ((Math.round(v) % this.items.length) + this.items.length) % this.items.length;
    if (idx !== this.selectedIndex) {
      if (this.itemRefs[this.selectedIndex]) {
        this.itemRefs[this.selectedIndex].classList.remove('option-wheel__item--selected');
      }
      this.selectedIndex = idx;
      if (this.itemRefs[this.selectedIndex]) {
        this.itemRefs[this.selectedIndex].classList.add('option-wheel__item--selected');
      }
      if (this.onChange) this.onChange(idx);
    }
    this.startLoop();
  }

  bindEvents() {
    const el = this.container;
    
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
      const step = Math.max(-1, Math.min(1, delta / this.rowH));
      this.applyTarget(this.target + step, false);
      
      if (this.wheelTimer) clearTimeout(this.wheelTimer);
      this.wheelTimer = setTimeout(() => this.applyTarget(this.target, true), 140);
    }, { passive: false });

    if (this.draggable) {
      el.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        this.dragY = e.clientY;
        this.dragStart = this.target;
        this.dragId = e.pointerId;
        this.dragMoved = false;
        this.isDragging = true;
        el.classList.add('option-wheel--dragging');
        el.setPointerCapture(this.dragId);
      });

      el.addEventListener('pointermove', (e) => {
        if (!this.isDragging) return;
        const dy = e.clientY - this.dragY;
        if (!this.dragMoved && Math.abs(dy) > 4) {
          this.dragMoved = true;
        }
        if (this.dragMoved) {
          e.stopPropagation();
          this.applyTarget(this.dragStart - dy / this.rowH, false);
        }
      });

      const endDrag = (e) => {
        if (!this.isDragging) return;
        this.isDragging = false;
        el.classList.remove('option-wheel--dragging');
        if (this.dragMoved) {
          e.stopPropagation();
          this.applyTarget(this.target, true);
        }
      };

      el.addEventListener('pointerup', endDrag);
      el.addEventListener('pointercancel', endDrag);
    }
  }

  handleItemClick(index) {
    if (this.dragMoved) return;
    let d = index - (((this.target % this.items.length) + this.items.length) % this.items.length);
    if (this.loop && this.items.length > 1) {
      if (d > this.items.length / 2) d -= this.items.length;
      else if (d < -this.items.length / 2) d += this.items.length;
    }
    this.applyTarget(this.target + d, true);
  }
}
