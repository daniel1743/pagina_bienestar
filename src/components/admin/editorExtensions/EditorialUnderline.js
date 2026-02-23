import { Mark } from '@tiptap/core';

const EditorialUnderline = Mark.create({
  name: 'editorialUnderline',

  parseHTML() {
    return [
      { tag: 'u' },
      {
        style: 'text-decoration',
        getAttrs: (value) => (String(value).includes('underline') ? {} : false),
      },
    ];
  },

  renderHTML() {
    return ['u', 0];
  },

  addCommands() {
    return {
      setEditorialUnderline:
        () =>
        ({ commands }) =>
          commands.setMark(this.name),
      toggleEditorialUnderline:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
      unsetEditorialUnderline:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

export default EditorialUnderline;
