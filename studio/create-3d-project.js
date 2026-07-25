import { getCliClient } from 'sanity/cli'

const client = getCliClient()

async function createProject() {
  const newProject = {
    _type: 'project',
    title: 'Interactive 3D Showcase',
    projectNumber: '04 · 3D WebGL',
    category: 'FS',
    tags: ['Three.js', 'GSAP', 'Vite', 'Frontend'],
    description: [
      'An immersive 3D web experience built with Three.js and GSAP ScrollTrigger, featuring a dominant 3D model that interacts with the user scroll.',
      'The showcase includes cinematic camera tracking, glassmorphism UI text cards, interactive 3D text rings, and dynamic lighting. The scroll sequence smoothly transitions through multiple distinct stages, culminating in a fully interactive drag-and-zoom view.'
    ],
    highlights: ['Interactive 3D', 'ScrollTrigger', 'Real-time Rendering'],
    demoLink: '/3d-demo.html',
    githubLink: ''
  }

  try {
    const res = await client.create(newProject)
    console.log('Successfully created new project with ID:', res._id)
  } catch (err) {
    console.error('Error creating project:', err.message)
  }
}

createProject()
