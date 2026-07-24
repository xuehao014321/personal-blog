import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

gsap.registerPlugin(ScrollTrigger)

// --- Helper: Split text into word + char spans so words never break awkwardly ---
function splitTextIntoSpans(selector) {
  const elements = document.querySelectorAll(selector)
  elements.forEach(el => {
    const text = el.innerText.trim()
    el.innerHTML = ''
    text.split(/\s+/).forEach((word, wIdx, arr) => {
      const wordSpan = document.createElement('span')
      wordSpan.className = 'word'
      wordSpan.style.display = 'inline-block'
      wordSpan.style.whiteSpace = 'nowrap'
      if (wIdx < arr.length - 1) wordSpan.style.marginRight = '0.3em'
      
      word.split('').forEach(char => {
        const span = document.createElement('span')
        span.className = 'char'
        span.innerText = char
        wordSpan.appendChild(span)
      })
      el.appendChild(wordSpan)
    })
  })
}

// Prepare character spans
splitTextIntoSpans('.gsap-split')

// --- 1. Scene & Renderer Setup ---
const canvas = document.querySelector('#webgl-canvas')
const scene = new THREE.Scene()

// Camera closer so the model is HUGE and dominant
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 0, 4.2) // Close camera distance for massive presence
cameraGroup.add(camera)

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.3

// --- 2. Dynamic Lighting ---
const keyLight = new THREE.DirectionalLight(0xffffff, 2.8)
keyLight.position.set(5, 5, 5)
scene.add(keyLight)

const pinkLight = new THREE.DirectionalLight(0xff4081, 2.2)
pinkLight.position.set(-5, -2, 4)
scene.add(pinkLight)

const cyanLight = new THREE.DirectionalLight(0x00ffcc, 1.8)
cyanLight.position.set(5, -5, -2)
scene.add(cyanLight)

scene.add(new THREE.AmbientLight(0xffffff, 0.5))

// --- 3. Model Loading & Scaling ---
let model = null
const loader = new GLTFLoader()

loader.load(
  '/models/kitty.glb', // User model
  (gltf) => {
    model = gltf.scene
    model.updateMatrixWorld(true) // Force Matrix World update for accurate Box3
    
    const box = new THREE.Box3().setFromObject(model)
    const center = new THREE.Vector3()
    box.getCenter(center)
    const size = new THREE.Vector3()
    box.getSize(size)
    
    // Shift model center to 0,0,0
    if (isFinite(center.x) && isFinite(center.y) && isFinite(center.z)) {
      model.position.sub(center)
    }
    
    const modelGroup = new THREE.Group()
    modelGroup.add(model)
    
    // Safe auto-scale based on bounding box max dimension
    const maxDim = Math.max(size.x, size.y, size.z)
    const targetScale = (isFinite(maxDim) && maxDim > 0) ? (2.6 / maxDim) : 1
    modelGroup.scale.set(targetScale, targetScale, targetScale)
    modelGroup.position.set(0, 0, 0)
    scene.add(modelGroup)
    
    hideLoader()
    setupScrollSequence(modelGroup)
  },
  (xhr) => {
    const percent = Math.round((xhr.loaded / xhr.total) * 100)
    const loadingEl = document.getElementById('loading')
    if (loadingEl) loadingEl.innerText = `Loading 3D Engine... ${percent}%`
  },
  (error) => {
    console.warn('Could not load kitty.glb. Using fallback procedural model.')
    
    // Huge Procedural Model Fallback
    const geometry = new THREE.TorusKnotGeometry(1.3, 0.4, 220, 32)
    const material = new THREE.MeshStandardMaterial({
      color: 0x333333, roughness: 0.1, metalness: 0.95
    })
    model = new THREE.Mesh(geometry, material)
    
    const wireGeo = new THREE.TorusKnotGeometry(1.33, 0.4, 110, 16)
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xff4081, wireframe: true, transparent: true, opacity: 0.7 })
    model.add(new THREE.Mesh(wireGeo, wireMat))

    const modelGroup = new THREE.Group()
    modelGroup.add(model)
    modelGroup.scale.set(1.2, 1.2, 1.2)
    modelGroup.position.set(0, 0, 0)
    scene.add(modelGroup)
    
    hideLoader()
    setupScrollSequence(modelGroup)
  }
)

function hideLoader() {
  const loadingEl = document.getElementById('loading')
  if (loadingEl) {
    loadingEl.style.opacity = '0'
    setTimeout(() => loadingEl.style.display = 'none', 800)
  }
}

// --- 3.5. Create 3D Orbiting Text Ring (Surrounding Model) ---
function create3DTextRing() {
  const textCanvas = document.createElement('canvas')
  textCanvas.width = 2048
  textCanvas.height = 256
  const ctx = textCanvas.getContext('2d')

  ctx.clearRect(0, 0, 2048, 256)
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = '#ff4081'
  ctx.shadowBlur = 24
  ctx.font = '900 70px Inter, sans-serif'
  ctx.textBaseline = 'middle'

  const repeatText = '✦ HELLO KITTY ✦ XUE HAO SHOWCASE ✦ BUILD DEBUG SCALE ✦ THREE.JS & GSAP '
  ctx.fillText(repeatText, 40, 128)

  const texture = new THREE.CanvasTexture(textCanvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.repeat.set(2, 1)

  const ringGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.9, 64, 1, true)
  const ringMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0, // Hidden initially, fades in at Stage 4
    side: THREE.DoubleSide,
    depthWrite: false
  })

  const textRing = new THREE.Mesh(ringGeo, ringMat)
  textRing.rotation.x = 0.25 // Slightly tilted ring for 3D perspective
  scene.add(textRing)

  return { textRing, ringMat }
}

const { textRing, ringMat } = create3DTextRing()

// --- 4. Master Cinematic Scroll Sequence ---
let isStage4Active = false
let isDragging = false
let previousPointerPosition = { x: 0, y: 0 }
let dragVelocity = { x: 0, y: 0 }
let dragRotation = { x: 0, y: 0 }
let targetScaleOffset = 1
let currentScaleOffset = 1

function setupScrollSequence(modelGroup) {
  
  const mainTL = gsap.timeline({
    scrollTrigger: {
      trigger: ".scroll-container",
      start: "top top",
      end: "bottom bottom",
      scrub: 1, // Smooth scrub
      onUpdate: (self) => {
        // Activate interactive controls when user reaches Stage 4 (progress > 0.8)
        const dragHint = document.getElementById('drag-hint')
        if (self.progress > 0.8) {
          isStage4Active = true
          if (dragHint) dragHint.style.opacity = '1'
        } else {
          isStage4Active = false
          if (dragHint) dragHint.style.opacity = '0'
          
          // Reset interactions when leaving Stage 4
          targetScaleOffset = 1
          dragRotation.x = 0
          dragRotation.y = 0
          dragVelocity.x = 0
          dragVelocity.y = 0
        }
      }
    }
  })

  // Stage 1 -> Stage 2 (Zoom in to Front Face - Keep Centered & Slightly Left)
  mainTL.to(modelGroup.position, { x: -0.6, y: 0.1, z: 1.2, duration: 1, ease: "power1.inOut" }, 0)
  mainTL.to(modelGroup.rotation, { x: 0.1, y: -0.15, z: 0, duration: 1, ease: "power1.inOut" }, 0)

  // Stage 2 -> Stage 3 (Graceful Turn to Side Profile - Shift Slightly Right)
  mainTL.to(modelGroup.position, { x: 0.6, y: 0, z: 0.6, duration: 1, ease: "power1.inOut" }, 1)
  mainTL.to(modelGroup.rotation, { x: 0, y: Math.PI / 2, z: 0, duration: 1, ease: "power1.inOut" }, 1)

  // Stage 3 -> Stage 4 (High-Angle Diagonal Isometric Full-Body View + 3D Orbital Text Ring)
  mainTL.to(modelGroup.position, { x: 0, y: 0, z: 0, duration: 1, ease: "power1.inOut" }, 2)
  mainTL.to(modelGroup.rotation, { x: 0.5, y: 0.3, z: 0, duration: 1, ease: "power1.inOut" }, 2)
  mainTL.to(camera.position, { x: 0, y: 0, z: 5.5, duration: 1, ease: "power1.inOut" }, 2)
  
  // Fade in the 3D Orbiting Text Ring at Stage 4!
  mainTL.to(ringMat, { opacity: 1, duration: 1, ease: "power2.inOut" }, 2)

  // --- GSAP Skill 1: Character Stagger Animation for Titles ---
  const sections = ['#stage-1', '#stage-2', '#stage-3']
  
  sections.forEach((secId) => {
    const card = document.querySelector(`${secId} .text-card`)
    const chars = document.querySelectorAll(`${secId} .char`)
    const desc = document.querySelector(`${secId} .gsap-desc`)

    if (card) {
      gsap.fromTo(card,
        { opacity: 0, y: 80, filter: 'blur(12px)' },
        {
          scrollTrigger: {
            trigger: secId,
            start: "top 75%",
            end: "top 25%",
            scrub: 1,
          },
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          ease: "power2.out"
        }
      )
    }

    if (chars.length) {
      gsap.fromTo(chars,
        { opacity: 0, y: 40, rotationX: -90 },
        {
          scrollTrigger: {
            trigger: secId,
            start: "top 70%",
            end: "top 30%",
            scrub: 1,
          },
          opacity: 1,
          y: 0,
          rotationX: 0,
          stagger: 0.04,
          ease: "back.out(1.7)"
        }
      )
    }

    if (desc) {
      gsap.fromTo(desc,
        { opacity: 0, y: 20 },
        {
          scrollTrigger: {
            trigger: secId,
            start: "top 65%",
            end: "top 35%",
            scrub: 1,
          },
          opacity: 1,
          y: 0,
          ease: "power1.out"
        }
      )
    }
  })
}

// --- 5. Interactive Drag & Zoom (Stage 4) ---
const cursor = { x: 0, y: 0 }

window.addEventListener('pointerdown', (event) => {
  if (!isStage4Active) return
  isDragging = true
  previousPointerPosition = { x: event.clientX, y: event.clientY }
})

window.addEventListener('pointermove', (event) => {
  // Update mouse parallax cursor
  cursor.x = (event.clientX / window.innerWidth) - 0.5
  cursor.y = (event.clientY / window.innerHeight) - 0.5

  if (!isDragging || !isStage4Active) return

  const deltaX = event.clientX - previousPointerPosition.x
  const deltaY = event.clientY - previousPointerPosition.y

  // Inverse rotation for natural drag feel
  dragVelocity.x = deltaY * 0.005
  dragVelocity.y = deltaX * 0.005

  dragRotation.x += dragVelocity.x
  dragRotation.y += dragVelocity.y

  previousPointerPosition = { x: event.clientX, y: event.clientY }
})

window.addEventListener('pointerup', () => { isDragging = false })
window.addEventListener('pointercancel', () => { isDragging = false })

window.addEventListener('wheel', (event) => {
  if (isStage4Active && (event.ctrlKey || event.metaKey || event.altKey)) {
    event.preventDefault()
    // Zoom sensitivity
    targetScaleOffset -= event.deltaY * 0.002
    // Clamp zoom between 0.5x and 2.5x
    targetScaleOffset = Math.max(0.5, Math.min(targetScaleOffset, 2.5))
  }
}, { passive: false })

const clock = new THREE.Clock()

let baseRingRotationY = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Smooth mouse parallax on cameraGroup (prevents conflict with GSAP animating camera)
  cameraGroup.position.x += (cursor.x * 1.2 - cameraGroup.position.x) * 0.05
  cameraGroup.position.y += (-cursor.y * 1.2 - cameraGroup.position.y) * 0.05

  // Stage 4 Interaction Physics
  if (isStage4Active && model) {
    if (!isDragging) {
      // Inertia decay for rotation
      dragVelocity.x *= 0.92
      dragVelocity.y *= 0.92
      dragRotation.x += dragVelocity.x
      dragRotation.y += dragVelocity.y
    }
    
    // Apply drag rotation directly to the child model
    model.rotation.x = dragRotation.x
    model.rotation.y = dragRotation.y

    // Smooth lerp for zoom scale
    currentScaleOffset += (targetScaleOffset - currentScaleOffset) * 0.1
    model.scale.set(currentScaleOffset, currentScaleOffset, currentScaleOffset)

    if (textRing) {
      baseRingRotationY += 0.008 // Constant orbit speed
      textRing.rotation.x = 0.25 + dragRotation.x
      textRing.rotation.y = baseRingRotationY + dragRotation.y
      textRing.scale.set(currentScaleOffset, currentScaleOffset, currentScaleOffset)
    }
  } else {
    // Reset scale gracefully if leaving stage 4
    currentScaleOffset += (1 - currentScaleOffset) * 0.1
    if (model) {
      model.scale.set(currentScaleOffset, currentScaleOffset, currentScaleOffset)
      model.rotation.x += (0 - model.rotation.x) * 0.1
      model.rotation.y += (0 - model.rotation.y) * 0.1
    }
    
    if (textRing) {
      baseRingRotationY += 0.008
      textRing.rotation.x += (0.25 - textRing.rotation.x) * 0.1
      textRing.rotation.y = baseRingRotationY + (model ? model.rotation.y : 0)
      textRing.scale.set(currentScaleOffset, currentScaleOffset, currentScaleOffset)
    }
  }

  // Gentle floating oscillation
  if (scene) {
    scene.position.y = Math.sin(elapsedTime * 1.2) * 0.12
  }

  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

tick()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// --- 6. Background Music Controller ---
const bgm = document.getElementById('bgm')
const bgmBtn = document.getElementById('bgm-toggle')

if (bgm && bgmBtn) {
  bgm.volume = 0.5 // Default volume
  let userInteracted = false

  const setUIPlaying = () => {
    bgmBtn.classList.add('playing')
    bgmBtn.innerHTML = '<span class="icon">🎵</span> Music: On'
  }

  const setUIPaused = () => {
    bgmBtn.classList.remove('playing')
    bgmBtn.innerHTML = '<span class="icon">🔇</span> Music: Off'
  }

  const tryPlayMusic = () => {
    if (bgm.paused) {
      bgm.play().then(() => {
        setUIPlaying()
      }).catch(err => {
        // Browser blocked autoplay, will wait for interaction
        console.warn('Autoplay blocked. Waiting for user interaction.')
      })
    }
  }

  // Attempt autoplay immediately (might work if browser allows it)
  tryPlayMusic()

  // Fallback: Start music on the very first user interaction (click, scroll, touch)
  const onFirstInteraction = () => {
    if (!userInteracted) {
      userInteracted = true
      tryPlayMusic()
      // Remove these listeners after first trigger so they don't fire repeatedly
      window.removeEventListener('click', onFirstInteraction)
      window.removeEventListener('scroll', onFirstInteraction)
      window.removeEventListener('wheel', onFirstInteraction)
      window.removeEventListener('pointerdown', onFirstInteraction)
    }
  }

  window.addEventListener('click', onFirstInteraction)
  window.addEventListener('scroll', onFirstInteraction)
  window.addEventListener('wheel', onFirstInteraction)
  window.addEventListener('pointerdown', onFirstInteraction)
  
  // Manual toggle button
  bgmBtn.addEventListener('click', (e) => {
    e.stopPropagation() // Prevent triggering the firstInteraction listener immediately
    userInteracted = true // If they clicked the button, consider it an interaction
    if (bgm.paused) {
      bgm.play()
      setUIPlaying()
    } else {
      bgm.pause()
      setUIPaused()
    }
  })
}
