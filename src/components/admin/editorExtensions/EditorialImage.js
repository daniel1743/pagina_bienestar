import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';

const EditorialImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      display: {
        default: 'full',
        parseHTML: (element) => element.getAttribute('data-display') || 'full',
        renderHTML: (attributes) =>
          attributes.display ? { 'data-display': attributes.display } : {},
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const display = HTMLAttributes.display || 'full';
    const className =
      display === 'center'
        ? 'editorial-inline-image editorial-inline-image-center'
        : 'editorial-inline-image editorial-inline-image-full';
    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: className,
        loading: 'lazy',
        decoding: 'async',
      }),
    ];
  },
});

export default EditorialImage;
