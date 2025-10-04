import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // First child should be the background image
  const backgroundDiv = block.querySelector(':scope > div:first-child');
  const contentDiv = block.querySelector(':scope > div:last-child');

  if (backgroundDiv && contentDiv) {
    backgroundDiv.classList.add('herooverlay-background');
    contentDiv.classList.add('herooverlay-content');
  }

  // Optimize images
  block.querySelectorAll('picture > img').forEach((img) => {
    const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '2000' }]);
    img.closest('picture').replaceWith(picture);
  });
}
