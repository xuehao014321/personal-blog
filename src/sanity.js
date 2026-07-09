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
