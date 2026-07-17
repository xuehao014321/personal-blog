export default {
  name: 'aboutItem',
  title: 'About Item',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'section',
      title: 'Section',
      type: 'string',
      options: {
        list: [
          { title: 'Bio', value: 'bio' },
          { title: 'Education & Achievements', value: 'edu' },
          { title: 'Skills & Tech Stack', value: 'skills' }
        ],
        layout: 'radio'
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'tag',
      title: 'Tag (Top Left Badge)',
      type: 'string',
      description: 'e.g. "Background", "Final Year", "Hardware & Embedded"',
      validation: Rule => Rule.required(),
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Grey text under the title (optional)',
    },
    {
      name: 'description',
      title: 'Description (Paragraphs)',
      type: 'array',
      of: [{ type: 'text', rows: 4 }],
      description: 'Add multiple items for multiple paragraphs. Some basic HTML (like <strong>) is allowed.',
    },
    {
      name: 'stats',
      title: 'Stats (Education blocks)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', type: 'string', title: 'Value (e.g. 2026)' },
            { name: 'label', type: 'string', title: 'Label (e.g. Expected Grad.)' }
          ]
        }
      ],
      description: 'Used for the little stat boxes in the Education section.',
    },
    {
      name: 'links',
      title: 'Links (Buttons)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string', title: 'Button Text (e.g. GitHub)' },
            { name: 'url', type: 'string', title: 'URL' },
            { name: 'isPrimary', type: 'boolean', title: 'Is Primary Button?' }
          ]
        }
      ],
    },
    {
      name: 'orderNumber',
      title: 'Order Number',
      type: 'number',
      description: 'Used to sort items within their section (lower numbers appear first).',
      validation: Rule => Rule.required(),
    }
  ],
  orderings: [
    {
      title: 'Order Number (Ascending)',
      name: 'orderNumberAsc',
      by: [
        { field: 'orderNumber', direction: 'asc' }
      ],
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'section',
    },
  },
}
