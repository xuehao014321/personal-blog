export default {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. AI Agents, Ollama, Local LLM',
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
      description: 'Short description shown on the blog card',
    },
    {
      name: 'readTime',
      title: 'Read Time (minutes)',
      type: 'number',
    },
    {
      name: 'year',
      title: 'Year',
      type: 'number',
      description: 'e.g. 2026 — controls which section the post appears in',
      validation: Rule => Rule.required(),
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    },
    {
      name: 'link',
      title: 'Article Link',
      type: 'url',
      description: 'Optional: link to full article page',
    },
  ],
  orderings: [
    {
      title: 'Year (Newest First)',
      name: 'yearDesc',
      by: [
        { field: 'year', direction: 'desc' },
        { field: 'publishedAt', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'year',
    },
  },
}
