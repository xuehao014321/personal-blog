import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export function init3DScene() {
  const canvas = document.querySelector('#webgl-canvas')
  if (!canvas) return

  // Scene & Camera
  const scene = new THREE.Scene()
  const cameraGroup = new THREE.Group()
  scene.add(cameraGroup)

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 4.2)
  cameraGroup.add(camera)

  // WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  const isMobile = window.innerWidth < 768
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.3

  // Lighting
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

  // Model Loading
  let modelGroup = new THREE.Group()
  scene.add(modelGroup)

  let model = null
  const loader = new GLTFLoader()

  loader.load(
    '/models/model.glb',
    (gltf) => {
      model = gltf.scene
      model.updateMatrixWorld(true)

      const box = new THREE.Box3().setFromObject(model)
      const center = new THREE.Vector3()
      box.getCenter(center)
      const size = new THREE.Vector3()
      box.getSize(size)

      if (isFinite(center.x) && isFinite(center.y) && isFinite(center.z)) {
        model.position.sub(center)
      }

      const maxDim = Math.max(size.x, size.y, size.z)
      const targetScale = (isFinite(maxDim) && maxDim > 0) ? (2.6 / maxDim) : 1
      modelGroup.add(model)

      setupScrollAnimation(modelGroup, targetScale)
    },
    undefined,
    (err) => {
      console.warn('Could not load /models/model.glb, fallback to knot geometry.', err)
      const geometry = new THREE.TorusKnotGeometry(1.2, 0.38, 200, 32)
      const material = new THREE.MeshStandardMaterial({
        color: 0x222222, roughness: 0.15, metalness: 0.9
      })
      model = new THREE.Mesh(geometry, material)
      modelGroup.add(model)
      setupScrollAnimation(modelGroup, 1.2)
    }
  )

  function setupScrollAnimation(group, targetScale) {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return

    gsap.registerPlugin(ScrollTrigger)

    // 1. Initial State: Model is full size, positioned directly at Stage 1, fully transparent
    gsap.set(group.scale, { x: targetScale, y: targetScale, z: targetScale })
    gsap.set(group.position, { x: -0.6, y: -0.1, z: 0.8 }) // Static at Stage 1
    gsap.set(group.rotation, { x: 0, y: -0.2, z: 0 })

    group.traverse((child) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach(mat => {
          mat.transparent = true
          mat.opacity = 0
          mat.needsUpdate = true
        })
      }
    })

    // 2. Entrance Animation: ONLY Fade In Opacity (Triggers safely below the black line)
    const fader = { opacity: 0 }
    gsap.to(fader, {
      opacity: 1,
      duration: 0.8,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: "#timeline-view",
        start: "top 65%", // Trigger fade-in later, when the head is about 1/3 past the dividing line
        toggleActions: "play none none reverse"
      },
      onUpdate: () => {
        group.traverse((child) => {
          if (child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material]
            mats.forEach(mat => {
              mat.opacity = fader.opacity
            })
          }
        })
      }
    })

    // 3. Cinematic 5-Stage Camera Sequence
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#timeline-view",
        start: "top 30%", // Start sequence after fade-in
        end: "bottom bottom",
        scrub: 1.5 // Added higher smoothing to prevent backwards scroll stutter (一卡一卡)
      }
    })

    // Stage 1: 2023 - Full Body Shot (Left)
    tl.to(group.position, { x: -0.6, y: -0.1, z: 0.8, duration: 1, ease: "power1.inOut" }, 0)
    tl.to(group.rotation, { x: 0, y: -0.2, z: 0, duration: 1, ease: "power1.inOut" }, 0)

    // Stage 2: 2024 - Front Face Close-Up (Right)
    tl.to(group.position, { x: 0.6, y: -0.2, z: 2.2, duration: 1, ease: "power1.inOut" }, 1)
    tl.to(group.rotation, { x: 0.1, y: 0.1, z: 0, duration: 1, ease: "power1.inOut" }, 1)

    // Stage 3: 2025 - Profile Side View (Left, 90-degree turn)
    tl.to(group.position, { x: -0.5, y: 0, z: 1.2, duration: 1, ease: "power1.inOut" }, 2)
    tl.to(group.rotation, { x: 0, y: Math.PI / 2, z: 0, duration: 1, ease: "power1.inOut" }, 2)

    // Stage 4: 2026 - 540 Degree Spin to Other Profile (Right)
    tl.to(group.position, { x: 0.6, y: -0.1, z: 1.6, duration: 1, ease: "power1.inOut" }, 3)
    tl.to(group.rotation, { x: 0.05, y: Math.PI * 3.5, z: 0, duration: 1, ease: "power1.inOut" }, 3)

    // Stage 5: Future - Back View (Center, resolves to 3 * PI which is absolute 180 degrees)
    tl.to(group.position, { x: 0, y: 0, z: 0.8, duration: 1, ease: "power1.inOut" }, 4)
    tl.to(group.rotation, { x: 0.1, y: Math.PI * 3, z: 0, duration: 1, ease: "power1.inOut" }, 4)
  }

  // Mouse Parallax Interaction
  const cursor = { x: 0, y: 0 }
  window.addEventListener('pointermove', (e) => {
    cursor.x = (e.clientX / window.innerWidth) - 0.5
    cursor.y = (e.clientY / window.innerHeight) - 0.5
  })

  const clock = new THREE.Clock()

  const renderLoop = () => {
    const elapsedTime = clock.getElapsedTime()

    // Smooth camera mouse follow
    cameraGroup.position.x += (cursor.x * 0.8 - cameraGroup.position.x) * 0.05
    cameraGroup.position.y += (-cursor.y * 0.8 - cameraGroup.position.y) * 0.05

    // Slow organic ambient float
    scene.position.y = Math.sin(elapsedTime * 1.2) * 0.08

    renderer.render(scene, camera)
    requestAnimationFrame(renderLoop)
  }

  renderLoop()

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.25 : 2))
  })
}
