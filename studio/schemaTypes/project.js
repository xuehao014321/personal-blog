export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'projectNumber',
      title: 'Project Number & Badge',
      type: 'string',
      description: 'e.g. "01 · Featured Project" or "02"',
      validation: Rule => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Hardware & Embedded', value: 'HW' },
          { title: 'Full-Stack & Frontend', value: 'FS' },
          { title: 'AI & Agents', value: 'AI' }
        ],
        layout: 'radio'
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. Raspberry Pi, Python',
    },
    {
      name: 'description',
      title: 'Description (Paragraphs)',
      type: 'array',
      of: [{ type: 'text', rows: 4 }],
      description: 'Add multiple items here for multiple paragraphs',
    },
    {
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Small highlight badges at the bottom of the card',
    },
    {
      name: 'githubLink',
      title: 'GitHub Link',
      type: 'url',
    },
    {
      name: 'demoLink',
      title: 'Live Demo Link',
      type: 'url',
    },
    {
      name: 'reportLink',
      title: 'Technical Report Link',
      type: 'url',
    }
  ],
  orderings: [
    {
      title: 'Project Number (Ascending)',
      name: 'projectNumberAsc',
      by: [
        { field: 'projectNumber', direction: 'asc' }
      ],
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
    },
  },
}
