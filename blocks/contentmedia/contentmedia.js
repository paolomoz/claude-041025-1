import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`contentmedia-${cols.length}-cols`);

  // setup columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col, idx) => {
      const pic = col.querySelector('picture');
      const video = col.querySelector('video, a[href*="youtube"], a[href*="vimeo"]');

      if (pic || video) {
        col.classList.add('contentmedia-media-col');
      } else {
        col.classList.add('contentmedia-text-col');
      }
    });
  });

  // Optimize images
  block.querySelectorAll('picture > img').forEach((img) => {
    const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(picture);
  });
}
