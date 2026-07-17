import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: 'wyai1huf',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2026-07-09',
})

export const POSTS_QUERY = `
  *[_type == "blogPost"] | order(year desc, publishedAt desc) {
    title,
    tags,
    excerpt,
    readTime,
    year,
    link,
    "slug": slug.current
  }
`

export const PROJECTS_QUERY = `
  *[_type == "project"] | order(projectNumber asc) {
    title,
    projectNumber,
    category,
    tags,
    description,
    highlights,
    githubLink,
    demoLink,
    reportLink
  }
`

export const ABOUT_QUERY = `
  *[_type == "aboutItem"] | order(orderNumber asc) {
    title,
    section,
    tag,
    subtitle,
    description,
    stats,
    links
  }
`
