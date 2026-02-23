import { Mark, mergeAttributes } from '@tiptap/core';

const EditorialColor = Mark.create({
  name: 'editorialColor',

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute('data-editorial-color') || element.style.color || null,
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return {
            'data-editorial-color': attributes.color,
            style: `color: ${attributes.color}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'span[data-editorial-color]' },
      {
        style: 'color',
        getAttrs: (value) => (value ? { color: value } : false),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setEditorialColor:
        (color) =>
        ({ commands }) =>
          commands.setMark(this.name, { color }),
      unsetEditorialColor:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

export default EditorialColor;
