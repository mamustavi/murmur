// Murmur website: the Raw / Formatted / Summary switcher, and download links that
// always point at the newest release.

// MARK: - View switcher

const tabs = [...document.querySelectorAll('.segmented [role="tab"]')];
const panel = document.getElementById('view-panel');

function select(view, animate = true) {
  if (animate) {
    panel.classList.remove('switched');
    void panel.offsetWidth;   // restart the fade
    panel.classList.add('switched');
  }
  for (const tab of tabs) {
    const selected = tab.dataset.view === view;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  for (const element of panel.querySelectorAll('[data-for]')) {
    element.hidden = element.dataset.for !== view;
  }
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => select(tab.dataset.view));
  // Arrow keys move between segments, like a native segmented control.
  tab.addEventListener('keydown', (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    const next = tabs[(index + step + tabs.length) % tabs.length];
    next.focus();
    select(next.dataset.view);
  });
});
select('formatted', false);

// MARK: - Download links

// Links start at the releases page; once GitHub says which disk image is newest,
// they download it directly. If the request fails, the releases page still works.
fetch('https://api.github.com/repos/mamustavi/murmur/releases/latest', {
  headers: { Accept: 'application/vnd.github+json' },
})
  .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
  .then((release) => {
    const dmg = release.assets.find((asset) => asset.name.endsWith('.dmg'));
    if (!dmg) return;
    for (const link of document.querySelectorAll('.download-link')) {
      link.href = dmg.browser_download_url;
    }
    const version = release.tag_name.replace(/^v/, '');
    for (const label of document.querySelectorAll('.download-version')) {
      label.textContent = `Version ${version}`;
    }
  })
  .catch(() => {});
