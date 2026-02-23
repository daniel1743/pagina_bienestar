import { Node, mergeAttributes } from '@tiptap/core';

const EditorialCallout = Node.create({
  name: 'editorialCallout',
  group: 'block',
  content: 'paragraph+',
  defining: true,

  addAttributes() {
    return {
      tone: {
        default: 'summary',
        parseHTML: (element) => element.getAttribute('data-editorial-callout') || 'summary',
        renderHTML: (attributes) => ({
          'data-editorial-callout': attributes.tone || 'summary',
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'section[data-editorial-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const tone = HTMLAttributes.tone || 'summary';
    const classes =
      tone === 'warning'
        ? 'editorial-callout editorial-callout-warning'
        : 'editorial-callout editorial-callout-summary';
    const { tone: _tone, ...rest } = HTMLAttributes;
    return ['section', mergeAttributes(rest, { class: classes }), 0];
  },

  addCommands() {
    return {
      insertEditorialSummary:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { tone: 'summary' },
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Resumen: escribe aquí los puntos clave en lenguaje claro.',
                  },
                ],
              },
            ],
          }),
      insertEditorialWarning:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { tone: 'warning' },
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Advertencia: este contenido no reemplaza evaluación médica profesional.',
                  },
                ],
              },
            ],
          }),
    };
  },
});

export default EditorialCallout;
