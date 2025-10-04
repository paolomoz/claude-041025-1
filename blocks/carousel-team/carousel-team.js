import { createOptimizedPicture } from '../../scripts/aem.js';

function createNavigationButtons() {
  const nav = document.createElement('div');
  nav.classList.add('team-navigation');
  nav.innerHTML = `
    <button type="button" class="team-prev" aria-label="Previous">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    <button type="button" class="team-next" aria-label="Next">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  `;
  return nav;
}

function updateNavigation(block, currentIndex, totalCards, cardsPerView) {
  const prevBtn = block.querySelector('.team-prev');
  const nextBtn = block.querySelector('.team-next');

  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex >= totalCards - cardsPerView;
}

function scrollToIndex(block, index) {
  const track = block.querySelector('.team-track');
  const cards = block.querySelectorAll('.team-card');
  if (!cards.length) return;

  const cardWidth = cards[0].offsetWidth;
  const gap = 24;
  const scrollPosition = index * (cardWidth + gap);

  track.scrollTo({
    left: scrollPosition,
    behavior: 'smooth'
  });
}

export default function decorate(block) {
  const rows = [...block.children];

  // Create container structure
  const container = document.createElement('div');
  container.classList.add('team-container');

  const track = document.createElement('div');
  track.classList.add('team-track');

  // Transform each row into a team member card
  rows.forEach((row, idx) => {
    const card = document.createElement('div');
    card.classList.add('team-card');

    const cols = [...row.children];
    console.log(`Row ${idx}: ${cols.length} columns`);

    if (cols.length >= 2) {
      const imageCol = cols[0];
      const contentCol = cols[1];

      console.log(`Row ${idx} imageCol HTML:`, imageCol.innerHTML);
      console.log(`Row ${idx} contentCol HTML:`, contentCol.innerHTML);

      // Get image (with picture wrapper from EDS)
      const picture = imageCol.querySelector('picture');
      const link = contentCol.querySelector('a');
      const heading = contentCol.querySelector('h3');

      console.log(`Row ${idx} - Picture:`, picture, 'Link:', link, 'Heading:', heading);

      if (picture) {
        // Create clickable image wrapper
        const imageLink = document.createElement('a');
        if (link) {
          imageLink.href = link.href;
        }
        imageLink.classList.add('team-image-link');

        const imageDiv = document.createElement('div');
        imageDiv.classList.add('team-image');
        imageDiv.appendChild(picture);
        imageLink.appendChild(imageDiv);

        card.appendChild(imageLink);

        // Add name below
        const nameDiv = document.createElement('div');
        nameDiv.classList.add('team-name');
        if (heading) {
          nameDiv.textContent = heading.textContent.trim();
        }
        card.appendChild(nameDiv);

        // Only add card if it has content
        track.appendChild(card);
      }
    }
  });

  container.appendChild(track);
  block.textContent = '';
  block.appendChild(container);

  // Add navigation
  const navigation = createNavigationButtons();
  block.appendChild(navigation);

  // Setup navigation logic
  let currentIndex = 0;
  const cards = block.querySelectorAll('.team-card');
  const totalCards = cards.length;

  function getCardsPerView() {
    const width = window.innerWidth;
    if (width < 600) return 1;
    if (width < 900) return 3;
    return 5;
  }

  let cardsPerView = getCardsPerView();
  updateNavigation(block, currentIndex, totalCards, cardsPerView);

  // Previous button
  block.querySelector('.team-prev').addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      scrollToIndex(block, currentIndex);
      updateNavigation(block, currentIndex, totalCards, cardsPerView);
    }
  });

  // Next button
  block.querySelector('.team-next').addEventListener('click', () => {
    if (currentIndex < totalCards - cardsPerView) {
      currentIndex += 1;
      scrollToIndex(block, currentIndex);
      updateNavigation(block, currentIndex, totalCards, cardsPerView);
    }
  });

  // Handle resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      cardsPerView = getCardsPerView();
      currentIndex = Math.min(currentIndex, totalCards - cardsPerView);
      scrollToIndex(block, currentIndex);
      updateNavigation(block, currentIndex, totalCards, cardsPerView);
    }, 250);
  });

  // Observe scroll position for manual scrolling
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        currentIndex = idx;
        updateNavigation(block, currentIndex, totalCards, cardsPerView);
      }
    });
  }, {
    root: track,
    threshold: 0.5
  });

  cards.forEach((card) => scrollObserver.observe(card));
}
