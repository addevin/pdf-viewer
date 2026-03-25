const tabs = [
  { name: 'Mozilla PDF.js', value: 'mozilla-git-pdf-js' },
  { name: 'PDF.js Viewer', value: 'pdf-js' },
  { name: 'Google Drive PDF', value: 'google-drive-pdf' },
  { name: 'Browser PDF Viewer', value: 'browser-pdf' }
];

const LOCAL_STORAGE_KEY = 'pdf-render-open-in';

let fileURL = null;
let activeTab = null;

const header = document.getElementById('header');
const tabsContainer = document.getElementById('tabs');
const viewerContainer = document.getElementById('viewerContainer');
const loader = document.getElementById('loader');
const githubLinkContainer = document.getElementById('githubLinkContainer');

function getQueryParam(params, fullName, shortName) {
  return params.get(fullName) ?? params.get(shortName);
}

function getPreferredQueryParamName(params, fullName, shortName) {
  return params.has(fullName) || !params.has(shortName) ? fullName : shortName;
}

function isTruthyParam(value) {
  if (!value) {
    return false;
  }

  const normalizedValue = value.toLowerCase();
  return normalizedValue === 'true' || normalizedValue === '1';
}

function showLoader() {
  loader.classList.remove('!hidden');
}
function hideLoader() {
  loader.classList.add('!hidden');
}

// init
function init() {
  const params = new URLSearchParams(window.location.search);
  const urlParam = getQueryParam(params, 'file', 'f');
  const shouldHideHeader = isTruthyParam(getQueryParam(params, 'hide-header', 'hh'));
  const shouldHideTabs = isTruthyParam(getQueryParam(params, 'hide-tabs', 'ht'));
  const shouldHideGitUrl = isTruthyParam(getQueryParam(params, 'hide-git-url', 'hgu'));
  const shouldRemoveTimestamp = isTruthyParam(getQueryParam(params, 'remove-timestamp', 'rt'));

  if (shouldHideHeader) {
    header.classList.add('hidden');
  } else if (shouldHideTabs) {
    tabsContainer.classList.add('hidden');
  }

  if (shouldHideGitUrl) {
    githubLinkContainer.classList.add('hidden');
  }

  if (!urlParam) {
    viewerContainer.innerHTML = `<p class="p-2 text-red-400">Missing file url!</p>`;
    header.innerHTML = `
      <p class="text-slate-100">PDF Viewer Error</p>
    `;
    hideLoader();
    return;
  }

  const url = new URL(urlParam);
  if (!shouldRemoveTimestamp) {
    url.searchParams.set('t', Date.now());
  }
  fileURL = url.toString();

  const openIn = getQueryParam(params, 'open-in', 'oi');
  const last = localStorage.getItem(LOCAL_STORAGE_KEY);

  activeTab = openIn || last || tabs[0].value;

  renderTabs();
  selectTab(activeTab);
}

// tabs render
function renderTabs() {
  tabsContainer.innerHTML = '';

  tabs.forEach(tab => {
    const btn = document.createElement('button');

    btn.textContent = tab.name;
    btn.className = `px-2 py-1 text-xs rounded ${
      activeTab === tab.value
        ? 'bg-[#3B82F6] text-white'
        : 'bg-[#212124] text-[#C9C9C9]'
    }`;

    btn.onclick = () => selectTab(tab.value);

    tabsContainer.appendChild(btn);
  });
}

// select tab
function selectTab(value) {
  activeTab = tabs.find(t => t.value === value)?.value || tabs[0].value;

  localStorage.setItem(LOCAL_STORAGE_KEY, activeTab);

  const params = new URLSearchParams(window.location.search);
  const openInParamName = getPreferredQueryParamName(params, 'open-in', 'oi');

  params.delete('open-in');
  params.delete('oi');
  params.set(openInParamName, activeTab);
  history.replaceState({}, '', '?' + params.toString());

  renderTabs();
  loadViewer();
}

// load viewer
function loadViewer() {
  viewerContainer.innerHTML = '';
  showLoader();

  if (activeTab === 'mozilla-git-pdf-js') {
    const iframe = createIframe(
      `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileURL)}`
    );
    viewerContainer.appendChild(iframe);
  }

  else if (activeTab === 'google-drive-pdf') {
      // 'https://docs.google.com/viewer?url='+this.fileURL+'&embedded=true';
      // 'https://docs.google.com/viewerng/viewer?url='+this.fileURL+'&embedded=true';
      // 'https://docs.google.com/gview?url='+this.fileURL+'&embedded=true';
    const iframe = createIframe(
      `https://docs.google.com/gview?url=${encodeURIComponent(fileURL)}&embedded=true`
    );
    viewerContainer.appendChild(iframe);
  }

  else if (activeTab === 'browser-pdf') {
    fetch(fileURL)
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);

        const obj = document.createElement('object');
        obj.data = url;
        obj.type = 'application/pdf';
        obj.className = 'w-full h-full';

        viewerContainer.appendChild(obj);
        hideLoader();
      })
      .catch(() => {
        const iframe = createIframe(fileURL);
        viewerContainer.appendChild(iframe);
      });
  }

  else if (activeTab === 'pdf-js') {
    renderPDFWithCanvas();
  }
}

// iframe helper
function createIframe(src) {
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.className = 'w-full h-full';
  iframe.onload = hideLoader;
  return iframe;
}

// PDF.js render
function renderPDFWithCanvas() {
  viewerContainer.innerHTML = `<div class="max-w-[900px] mx-auto" id="pdfCanvasContainer"></div>`;
  const container = document.getElementById('pdfCanvasContainer');

  if (!window.pdfjsLib) {
    showError();
    return;
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

  const loadingTask = pdfjsLib.getDocument(fileURL);

  loadingTask.promise.then(pdf => {
    hideLoader();

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      pdf.getPage(pageNum).then(page => {
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        container.appendChild(canvas);

        page.render({
          canvasContext: context,
          viewport: viewport
        });
      });
    }
  }).catch(showError);
}

// error UI
function showError() {
  hideLoader();

  viewerContainer.innerHTML = `
    <div class="p-4 text-sm">
      <p class="text-red-400 mb-2">
        Failed to load PDF viewer.
      </p>
      <button onclick="loadViewer()" class="underline text-blue-400 text-xs">
        Retry
      </button>
      <br/>
      <a href="${fileURL}" target="_blank" class="underline text-blue-400 text-xs">
        Open in new tab
      </a>
    </div>
  `;
}

// reload button
document.getElementById('reloadBtn').onclick = () => loadViewer();

init();
