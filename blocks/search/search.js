import { createOptimizedPicture } from '../../scripts/aem.js';

const searchParams = new URLSearchParams(window.location.search);

function highlightText(text, terms) {
  let result = text;
  terms.forEach((term) => {
    const regex = new RegExp(`(${term})`, 'gi');
    result = result.replace(regex, '<mark>$1</mark>');
  });
  return result;
}

async function search(indexUrl, terms) {
  const response = await fetch(indexUrl);
  const data = await response.json();

  const results = data.data.filter((item) => {
    const searchableText = `${item.title} ${item.description} ${item.path}`.toLowerCase();
    return terms.every((term) => searchableText.includes(term.toLowerCase()));
  });

  return results;
}

function renderResults(results, terms, block) {
  const resultsContainer = document.createElement('ul');
  resultsContainer.classList.add('search-results');

  if (results.length === 0) {
    resultsContainer.innerHTML = '<li>No results found</li>';
  } else {
    results.forEach((result) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="${result.path}">
          ${result.image ? `<picture><img src="${result.image}" alt="${result.title}"></picture>` : ''}
          <h3 class="search-result-title">${highlightText(result.title, terms)}</h3>
          <p>${highlightText(result.description, terms)}</p>
        </a>
      `;
      resultsContainer.append(li);
    });
  }

  // Optimize images
  resultsContainer.querySelectorAll('picture > img').forEach((img) => {
    const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '300' }]);
    img.closest('picture').replaceWith(picture);
  });

  const existingResults = block.querySelector('.search-results');
  if (existingResults) {
    existingResults.replaceWith(resultsContainer);
  } else {
    block.append(resultsContainer);
  }
}

export default async function decorate(block) {
  const indexUrl = block.querySelector('a')?.href;

  const searchBox = document.createElement('div');
  searchBox.classList.add('search-box');
  searchBox.innerHTML = `
    <label for="search-input">🔍</label>
    <input type="text" id="search-input" placeholder="Search..." value="${searchParams.get('q') || ''}">
  `;

  block.textContent = '';
  block.append(searchBox);

  const input = searchBox.querySelector('input');

  async function performSearch() {
    const query = input.value.trim();
    if (!query || !indexUrl) return;

    const terms = query.split(' ').filter((term) => term.length > 0);
    const results = await search(indexUrl, terms);
    renderResults(results, terms, block);
  }

  input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  // Perform initial search if query parameter exists
  if (searchParams.get('q')) {
    performSearch();
  }
}
