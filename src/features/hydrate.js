import siteData from '../content/site.json';

export function hydrateContent() {
  // 1. Hydrate Writing Columns
  const columnsContainer = document.getElementById('writing-columns-container');
  if (columnsContainer) {
    columnsContainer.innerHTML = siteData.writing.columns.map((col, index) => `
      <div class="${index === 0 ? 'py-4' : 'pt-4'}">
        <div class="flex justify-between font-mono text-[11px] text-ink-subtle mb-1">
          <span>${col.date}</span>
          <span class="text-terracotta">${col.topic}</span>
        </div>
        <h5 class="font-serif text-base text-ink font-normal mb-2">
          ${col.title}
        </h5>
        ${col.url ? `<a href="${col.url}" target="_blank" class="font-mono text-xs text-ink-muted hover:text-terracotta transition-colors">[ READ ↗ ]</a>` : ''}
      </div>
    `).join('');
  }

  // Hydrate Featured & IMRAD links
  const featuredLinkContainer = document.getElementById('featured-read-link');
  if (featuredLinkContainer) {
    featuredLinkContainer.innerHTML = siteData.writing.featured.url 
      ? `<a href="${siteData.writing.featured.url}" target="_blank" class="text-terracotta font-semibold hover:underline">[ READ ↗ ]</a>` 
      : '';
  }

  const imradLinkContainer = document.getElementById('imrad-read-link');
  if (imradLinkContainer) {
    imradLinkContainer.innerHTML = siteData.writing.imrad.url 
      ? `<a href="${siteData.writing.imrad.url}" target="_blank" class="text-terracotta font-medium hover:underline">[ READ PAPER ↗ ]</a>` 
      : '';
  }
}
