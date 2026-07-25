import { getCliClient } from 'sanity/cli'

const client = getCliClient()

async function createProjects() {
  const hwProjects = [
    {
      _type: 'project',
      title: 'EcoSortNet — Multi-Modal Sensor Fusion Waste Sorting System',
      projectNumber: '01 · Featured Project',
      category: 'HW',
      tags: ['Raspberry Pi', 'Python', 'AS7343', 'VL53L0X', 'LJC18A3', 'Servo'],
      description: [
        'My MSc capstone project (supervised by Mr. Goh Hock Guan). A hierarchical waste classification prototype that fuses spectral data, laser ranging and inductive proximity sensing to autonomously sort waste into four categories on a conveyor belt.',
        'I designed the full hardware circuit topology independently — MG996R and SG90 servo control, camera pipeline, AI classification integration, conveyor mechanics, anti-jam deflector and funnel system — and wrote all Python control logic from scratch.'
      ],
      highlights: ['AS7343 Spectral', 'VL53L0X Ranging', 'LJC18A3 Proximity', '4-bin Sorting', 'Live AI Classification'],
      githubLink: 'https://github.com/xuehao014321',
      reportLink: '#'
    },
    {
      _type: 'project',
      title: 'Raspberry Pi Sensor Debug Toolkit',
      projectNumber: '02',
      category: 'HW',
      tags: ['Raspberry Pi', 'I2C', 'OpenCV', 'Python'],
      description: [
        "A personal collection of tested Python drivers, I2C diagnostic scripts and wiring reference sheets for the sensors I've worked with: AS7343 (spectral), VL53L0X (ToF ranging), LJC18A3 (inductive proximity) and common servo controllers. Saves hours every time I start a new hardware project."
      ],
      highlights: ['Open Source', 'Driver Library', 'I2C Diagnostic'],
      githubLink: 'https://github.com/xuehao014321'
    }
  ]

  for (const proj of hwProjects) {
    try {
      const res = await client.create(proj)
      console.log('Successfully created new HW project with ID:', res._id)
    } catch (err) {
      console.error('Error creating project:', err.message)
    }
  }
}

createProjects()
