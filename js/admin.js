(function () {
  const SESSION_KEY = 'hadirSpmbSession';
  const DATA_CACHE_KEY = 'hadirSpmbAdminDataCache';
  const DATA_CACHE_MAX_AGE = 2 * 60 * 1000;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const loginView = $('#loginView');
  const dashboardView = $('#dashboardView');
  const loginForm = $('#loginForm');
  const loginNotice = $('#loginNotice');
  const loginButton = $('#loginButton');
  const logoutButton = $('#logoutButton');
  const refreshButton = $('#refreshButton');
  const adminName = $('#adminName');
  const adminRole = $('#adminRole');
  const tabButtons = $$('.tab-button');
  const tabPanels = $$('.tab-panel');
  const summaryGrid = $('#summaryGrid');
  const priorityList = $('#priorityList');
  const overviewMajorList = $('#overviewMajorList');
  const majorStatsMode = $('#majorStatsMode');
  const topMajorCard = $('#topMajorCard');
  const majorStatsGrid = $('#majorStatsGrid');
  const tableBody = $('#tableBody');
  const mobileList = $('#mobileList');
  const dataContent = $('#dataContent');
  const loadingState = $('#loadingState');
  const emptyState = $('#emptyState');
  const resultCount = $('#resultCount');
  const selectAllVisible = $('#selectAllVisible');
  const bulkActionBar = $('#bulkActionBar');
  const batchStatus = $('#batchStatus');
  const batchNote = $('#batchNote');
  const applyBatchButton = $('#applyBatchButton');
  const clearSelectionButton = $('#clearSelectionButton');
  const selectionInfo = $('#selectionInfo');
  const searchInput = $('#searchInput');
  const dateFilter = $('#dateFilter');
  const statusFilter = $('#statusFilter');
  const majorFilter = $('#majorFilter');
  const detailModal = $('#detailModal');
  const closeModalButton = $('#closeModalButton');
  const modalTitle = $('#modalTitle');
  const modalSubtitle = $('#modalSubtitle');
  const detailList = $('#detailList');
  const statusForm = $('#statusForm');
  const saveStatusButton = $('#saveStatusButton');
  const processModal = $('#processModal');
  const processModalTitle = $('#processModalTitle');
  const processModalMessage = $('#processModalMessage');

  let currentSession = null;
  let rows = [];
  let filteredRows = [];
  let selectedIds = new Set();
  let activeTab = 'overview';
  let isLoadingData = false;
  let filterTimer = null;

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));
  }

  function parseMaybeDate(value) {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

    const text = String(value).trim();
    if (!text) return null;

    const iso = new Date(text);
    if (!Number.isNaN(iso.getTime())) return iso;

    const slash = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) {
      const date = new Date(Number(slash[3]), Number(slash[2]) - 1, Number(slash[1]));
      return Number.isNaN(date.getTime()) ? null : date;
    }
    return null;
  }

  function formatDateDisplay(value) {
    const date = parseMaybeDate(value);
    if (!date) return value || '-';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: window.APP_CONFIG.TIMEZONE
    });
  }

  function formatTimeDisplay(value) {
    if (!value) return '-';
    const text = String(value).trim();
    const shortTime = text.match(/^(\d{1,2})[.:](\d{2})/);
    if (shortTime && !text.includes('T')) {
      return `${shortTime[1].padStart(2, '0')}:${shortTime[2]}`;
    }

    const date = parseMaybeDate(value);
    if (!date) return text;
    if (date.getUTCFullYear() < 1910) {
      return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
    }
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: window.APP_CONFIG.TIMEZONE
    });
  }

  function formatDateTime(row) {
    return `${formatDateDisplay(row.tanggalHadir)} ${formatTimeDisplay(row.jamHadir)}`;
  }

  function normalizeDate(value) {
    const date = parseMaybeDate(value);
    if (!date) return value || '';
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: window.APP_CONFIG.TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date).reduce((accumulator, part) => {
      accumulator[part.type] = part.value;
      return accumulator;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  function getStoredSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    } catch (error) {
      return null;
    }
  }

  function readCachedRows() {
    try {
      const cache = JSON.parse(sessionStorage.getItem(DATA_CACHE_KEY) || 'null');
      if (!cache || !Array.isArray(cache.rows)) return [];
      if (Date.now() - Number(cache.savedAt || 0) > DATA_CACHE_MAX_AGE) return [];
      return cache.rows;
    } catch (error) {
      return [];
    }
  }

  function writeCachedRows(nextRows) {
    try {
      sessionStorage.setItem(DATA_CACHE_KEY, JSON.stringify({
        savedAt: Date.now(),
        rows: nextRows
      }));
    } catch (error) {
      // Cache is optional; ignore quota/private-mode failures.
    }
  }

  function saveSession(result) {
    currentSession = {
      token: result.token,
      nama: result.admin.nama,
      username: result.admin.username,
      role: result.admin.role
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
  }

  function clearSession() {
    currentSession = null;
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(DATA_CACHE_KEY);
  }

  function showLoginNotice(message) {
    loginNotice.className = 'rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900';
    loginNotice.textContent = message;
    loginNotice.classList.remove('hidden');
  }

  function showProcessModal(title, message) {
    processModalTitle.textContent = title;
    processModalMessage.textContent = message;
    processModal.classList.remove('hidden');
    processModal.classList.add('flex');
    document.body.classList.add('overflow-hidden');
  }

  function hideProcessModal() {
    processModal.classList.add('hidden');
    processModal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
  }

  function showDashboard() {
    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    logoutButton.classList.remove('hidden');
    adminName.textContent = currentSession.nama;
    adminRole.textContent = `${currentSession.username} - ${currentSession.role}`;
  }

  function showLogin() {
    loginView.classList.remove('hidden');
    dashboardView.classList.add('hidden');
    logoutButton.classList.add('hidden');
  }

  function setActiveTab(tabName) {
    activeTab = tabName;
    tabButtons.forEach((button) => {
      const isActive = button.dataset.tab === tabName;
      button.className = `tab-button flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold transition sm:min-h-10 sm:flex-row sm:px-4 sm:text-sm ${isActive ? 'bg-brand-green text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`;
      button.setAttribute('aria-selected', String(isActive));
    });
    tabPanels.forEach((panel) => {
      panel.classList.toggle('hidden', panel.dataset.tabPanel !== tabName);
    });
    renderActivePanel();
  }

  function setLoadingData(isLoading) {
    isLoadingData = isLoading;
    selectAllVisible.disabled = isLoading;
    refreshButton.disabled = isLoading;
    refreshButton.textContent = isLoading ? 'Memuat...' : 'Muat Ulang';
    refreshButton.classList.toggle('opacity-60', isLoading);

    if (isLoading && rows.length) {
      loadingState.classList.add('hidden');
      dataContent.classList.remove('hidden');
      resultCount.textContent = 'Memperbarui data terbaru...';
      return;
    }

    loadingState.classList.toggle('hidden', !isLoading);
    dataContent.classList.toggle('hidden', isLoading);
    if (!isLoading) return;

    const summaryLabels = ['Total Data', 'Hadir Hari Ini', 'Menunggu Verifikasi', 'Berkas Lengkap'];
    summaryGrid.innerHTML = summaryLabels.map((label) => `
      <article class="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
        <div class="mb-3 h-1 w-10 rounded-full bg-slate-200"></div>
        <p class="text-xs font-semibold uppercase text-slate-400">${label}</p>
        <div class="mt-3 h-8 w-20 animate-pulse rounded bg-slate-100"></div>
        <p class="mt-2 text-xs text-slate-400">Memuat...</p>
      </article>
    `).join('');
    overviewMajorList.innerHTML = Array.from({ length: 3 }).map(() => `
      <article class="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div class="h-3 w-10 animate-pulse rounded bg-slate-200"></div>
        <div class="mt-3 h-4 w-4/5 animate-pulse rounded bg-slate-200"></div>
      </article>
    `).join('');
    priorityList.innerHTML = Array.from({ length: 3 }).map(() => `
      <article class="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div class="flex items-center justify-between gap-3">
          <div class="h-4 w-36 animate-pulse rounded bg-slate-200"></div>
          <div class="h-6 w-10 animate-pulse rounded bg-slate-200"></div>
        </div>
        <div class="mt-3 h-3 w-4/5 animate-pulse rounded bg-slate-200"></div>
      </article>
    `).join('');
    topMajorCard.innerHTML = `
      <div class="h-3 w-28 animate-pulse rounded bg-emerald-500"></div>
      <div class="mt-4 h-9 w-16 animate-pulse rounded bg-emerald-500"></div>
      <div class="mt-4 h-4 w-40 animate-pulse rounded bg-emerald-500"></div>
    `;
    majorStatsGrid.innerHTML = Array.from({ length: 6 }).map(() => '<div class="h-24 animate-pulse rounded-xl bg-slate-100"></div>').join('');
    tableBody.innerHTML = '';
    mobileList.innerHTML = '';
    emptyState.classList.add('hidden');
    resultCount.textContent = 'Memuat data...';
  }

  function populateFilters() {
    statusFilter.innerHTML = '<option value="">Semua status</option>';
    batchStatus.innerHTML = '';
    statusForm.elements.statusVerifikasi.innerHTML = '';

    window.HadirApi.statuses.forEach((status) => {
      statusFilter.insertAdjacentHTML('beforeend', `<option>${escapeHtml(status)}</option>`);
      batchStatus.insertAdjacentHTML('beforeend', `<option>${escapeHtml(status)}</option>`);
      statusForm.elements.statusVerifikasi.insertAdjacentHTML('beforeend', `<option>${escapeHtml(status)}</option>`);
    });
    batchStatus.value = 'Berkas Lengkap';

    majorFilter.innerHTML = '<option value="">Semua jurusan</option>';
    window.HadirApi.defaultJurusan.forEach((major) => {
      majorFilter.insertAdjacentHTML('beforeend', `<option>${escapeHtml(major)}</option>`);
    });
  }

  function statusClass(status) {
    if (status === 'Berkas Lengkap' || status === 'Selesai Diverifikasi') return 'bg-emerald-100 text-emerald-800';
    if (status === 'Berkas Kurang' || status === 'Perlu Perbaikan') return 'bg-amber-100 text-amber-800';
    if (status === 'Batal / Tidak Dilanjutkan') return 'bg-red-100 text-red-800';
    return 'bg-slate-100 text-slate-700';
  }

  function majorCounts(sourceRows) {
    const mode = majorStatsMode.value;
    const counts = new Map();
    sourceRows.forEach((row) => {
      const choices = mode === 'all' ? [row.pilihan1, row.pilihan2, row.pilihan3] : [row[mode]];
      choices.filter(Boolean).forEach((major) => counts.set(major, (counts.get(major) || 0) + 1));
    });
    return Array.from(counts.entries())
      .map(([major, count]) => ({ major, count }))
      .sort((a, b) => b.count - a.count || a.major.localeCompare(b.major));
  }

  function renderSummary() {
    const today = new Date().toLocaleDateString('id-ID', { timeZone: window.APP_CONFIG.TIMEZONE });
    const cards = [
      ['Total Data', rows.length],
      ['Hadir Hari Ini', rows.filter((row) => {
        const parsed = parseMaybeDate(row.tanggalHadir);
        return parsed && parsed.toLocaleDateString('id-ID', { timeZone: window.APP_CONFIG.TIMEZONE }) === today;
      }).length],
      ['Menunggu Verifikasi', rows.filter((row) => row.statusVerifikasi === 'Menunggu Verifikasi').length],
      ['Berkas Lengkap', rows.filter((row) => row.statusVerifikasi === 'Berkas Lengkap').length]
    ];

    summaryGrid.innerHTML = cards.map(([label, value], index) => `
      <article class="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
        <div class="mb-3 h-1 w-10 rounded-full ${index < 2 ? 'bg-brand-green' : 'bg-slate-300'}"></div>
        <p class="text-xs font-semibold uppercase text-slate-500">${escapeHtml(label)}</p>
        <p class="mt-2 text-2xl font-semibold text-slate-950">${value}</p>
      </article>
    `).join('');
  }

  function renderOverview() {
    if (isLoadingData) return;

    const waiting = rows.filter((row) => row.statusVerifikasi === 'Menunggu Verifikasi').length;
    const incomplete = rows.filter((row) => ['Berkas Kurang', 'Perlu Perbaikan'].includes(row.statusVerifikasi)).length;
    const priorities = [
      ['Menunggu verifikasi', waiting, 'Data yang belum disentuh panitia.'],
      ['Perlu tindak lanjut', incomplete, 'Berkas kurang atau perlu perbaikan.'],
      ['Dipilih untuk batch', selectedIds.size, 'Data yang siap diupdate massal.']
    ];

    priorityList.innerHTML = priorities.map(([label, value, description]) => `
      <article class="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div class="flex items-center justify-between gap-3">
          <p class="font-medium text-slate-900">${escapeHtml(label)}</p>
          <p class="text-xl font-semibold text-slate-950">${value}</p>
        </div>
        <p class="mt-1 text-sm text-slate-500">${escapeHtml(description)}</p>
      </article>
    `).join('');

    const topThree = majorCounts(rows).slice(0, 3);
    overviewMajorList.innerHTML = topThree.length ? topThree.map((item, index) => `
      <article class="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div class="min-w-0">
          <p class="text-xs font-semibold text-slate-500">#${index + 1}</p>
          <p class="mt-1 text-sm font-medium leading-5 text-slate-900">${escapeHtml(item.major)}</p>
        </div>
        <p class="text-xl font-semibold text-slate-950">${item.count}</p>
      </article>
    `).join('') : '<p class="text-sm text-slate-500">Data pendaftar belum tersedia.</p>';
  }

  function renderMajorStats() {
    if (isLoadingData) return;

    const stats = majorCounts(rows);
    const total = stats.reduce((sum, item) => sum + item.count, 0);
    const top = stats[0];

    topMajorCard.innerHTML = top ? `
      <p class="text-xs font-semibold uppercase text-emerald-100">Peminat terbanyak</p>
      <p class="mt-2 text-3xl font-semibold">${top.count}</p>
      <p class="mt-2 text-sm leading-6 text-emerald-50">${escapeHtml(top.major)}</p>
      <p class="mt-3 text-xs text-emerald-100">${total ? Math.round((top.count / total) * 100) : 0}% dari total pilihan yang dihitung</p>
    ` : `
      <p class="text-xs font-semibold uppercase text-emerald-100">Peminat jurusan</p>
      <p class="mt-2 text-2xl font-semibold">Data belum tersedia</p>
      <p class="mt-2 text-sm text-emerald-50">Rekap muncul setelah data pendaftar tersedia.</p>
    `;

    const items = stats.length ? stats : window.HadirApi.defaultJurusan.map((major) => ({ major, count: 0 }));
    majorStatsGrid.innerHTML = items.map((item) => {
      const percent = total ? Math.round((item.count / total) * 100) : 0;
      return `
        <article class="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div class="flex items-start justify-between gap-3">
            <p class="text-sm font-medium leading-5 text-slate-900">${escapeHtml(item.major)}</p>
            <p class="shrink-0 text-lg font-semibold text-slate-950">${item.count}</p>
          </div>
          <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div class="h-full rounded-full bg-brand-green" style="width: ${percent}%"></div>
          </div>
          <p class="mt-2 text-xs text-slate-500">${percent}%</p>
        </article>
      `;
    }).join('');
  }

  function renderTable() {
    if (isLoadingData) return;
    resultCount.textContent = `${filteredRows.length} data ditampilkan`;

    const visibleIds = filteredRows.map((row) => row.id);
    const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
    selectAllVisible.checked = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
    selectAllVisible.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleIds.length;

    tableBody.innerHTML = filteredRows.map((row) => `
      <tr class="align-top transition hover:bg-emerald-50/40 ${selectedIds.has(row.id) ? 'bg-emerald-50/60' : ''}">
        <td class="px-5 py-4">
          <input type="checkbox" data-select-id="${escapeHtml(row.id)}" class="row-select h-4 w-4 rounded border-slate-300 text-brand-green focus:ring-brand-green" aria-label="Pilih ${escapeHtml(row.namaLengkap)}" ${selectedIds.has(row.id) ? 'checked' : ''}>
        </td>
        <td class="px-5 py-4">
          <span class="inline-flex min-w-12 justify-center rounded-lg bg-slate-100 px-3 py-2 text-base font-semibold leading-none text-slate-950">${escapeHtml(row.nomorAntrian)}</span>
          <p class="mt-2 text-xs leading-5 text-slate-500">${escapeHtml(formatDateTime(row))}</p>
        </td>
        <td class="px-5 py-4">
          <p class="truncate font-semibold text-slate-950">${escapeHtml(row.namaLengkap)}</p>
          <p class="mt-1 truncate text-xs leading-5 text-slate-500">${escapeHtml(row.nisn)} - ${escapeHtml(row.asalSekolah)}</p>
        </td>
        <td class="px-5 py-4">
          <p class="line-clamp-2 leading-6 text-slate-900">${escapeHtml(row.pilihan1)}</p>
        </td>
        <td class="px-5 py-4">
          <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-5 ${statusClass(row.statusVerifikasi)}">${escapeHtml(row.statusVerifikasi)}</span>
        </td>
        <td class="px-5 py-4 text-right">
          <button type="button" data-id="${escapeHtml(row.id)}" class="detail-button inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-brand-green hover:text-brand-green">Detail</button>
        </td>
      </tr>
    `).join('');

    mobileList.innerHTML = filteredRows.map((row) => `
      <article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${selectedIds.has(row.id) ? 'ring-2 ring-emerald-100' : ''}">
        <div class="flex items-start justify-between gap-3">
          <label class="flex min-w-0 flex-1 items-start gap-3">
            <input type="checkbox" data-select-id="${escapeHtml(row.id)}" class="row-select mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-green focus:ring-brand-green" aria-label="Pilih ${escapeHtml(row.namaLengkap)}" ${selectedIds.has(row.id) ? 'checked' : ''}>
            <span class="min-w-0">
              <span class="block truncate text-base font-semibold text-slate-950">${escapeHtml(row.namaLengkap)}</span>
              <span class="mt-1 block text-sm text-slate-500">${escapeHtml(row.nisn)} - Antrian ${escapeHtml(row.nomorAntrian)}</span>
            </span>
          </label>
          <button type="button" data-id="${escapeHtml(row.id)}" class="detail-button min-h-9 shrink-0 rounded-lg border border-slate-300 px-3 text-xs font-semibold hover:border-brand-green hover:text-brand-green">Detail</button>
        </div>
        <div class="mt-3 grid gap-2 text-sm">
          <div class="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
            <span class="text-slate-500">Hadir</span>
            <span class="text-right font-medium text-slate-900">${escapeHtml(formatDateTime(row))}</span>
          </div>
          <div class="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
            <span class="text-slate-500">Asal</span>
            <span class="truncate text-right font-medium text-slate-900">${escapeHtml(row.asalSekolah)}</span>
          </div>
          <div class="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
            <span class="text-slate-500">Pilihan 1</span>
            <span class="text-right font-medium leading-5 text-slate-900">${escapeHtml(row.pilihan1)}</span>
          </div>
        </div>
        <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold leading-5 ${statusClass(row.statusVerifikasi)}">${escapeHtml(row.statusVerifikasi)}</span>
          <span class="text-xs font-medium text-slate-500">${escapeHtml(row.petugasVerifikasi || 'Belum ada petugas')}</span>
        </div>
      </article>
    `).join('');

    emptyState.classList.toggle('hidden', filteredRows.length > 0);
  }

  function renderSelectionState() {
    const count = selectedIds.size;
    selectionInfo.textContent = count ? `${count} data dipilih untuk batch update.` : 'Belum ada data dipilih.';
    bulkActionBar.classList.toggle('hidden', count === 0);
    applyBatchButton.disabled = count === 0;
    clearSelectionButton.disabled = count === 0;
    clearSelectionButton.classList.toggle('opacity-50', count === 0);
  }

  function renderActivePanel() {
    if (isLoadingData) return;
    if (activeTab === 'overview') {
      renderSummary();
      renderOverview();
      return;
    }
    if (activeTab === 'majors') {
      renderMajorStats();
      return;
    }
    if (activeTab === 'data') {
      renderTable();
    }
  }

  function applyFilters() {
    const keyword = searchInput.value.trim().toLowerCase();
    const selectedDate = dateFilter.value;
    const selectedStatus = statusFilter.value;
    const selectedMajor = majorFilter.value;

    filteredRows = rows.filter((row) => {
      const haystack = [row.nomorAntrian, row.namaLengkap, row.nisn, row.asalSekolah].join(' ').toLowerCase();
      return (!keyword || haystack.includes(keyword))
        && (!selectedDate || normalizeDate(row.tanggalHadir) === selectedDate)
        && (!selectedStatus || row.statusVerifikasi === selectedStatus)
        && (!selectedMajor || row.pilihan1 === selectedMajor);
    });

    renderSelectionState();
    renderActivePanel();
  }

  function scheduleApplyFilters() {
    window.clearTimeout(filterTimer);
    filterTimer = window.setTimeout(applyFilters, 120);
  }

  function setSelected(id, isSelected) {
    if (isSelected) selectedIds.add(id);
    else selectedIds.delete(id);
    renderSelectionState();
    renderActivePanel();
  }

  function toggleVisibleSelection(isSelected) {
    filteredRows.forEach((row) => {
      if (isSelected) selectedIds.add(row.id);
      else selectedIds.delete(row.id);
    });
    renderSelectionState();
    renderActivePanel();
  }

  function detailItem(label, value) {
    return `
      <div class="min-w-0 rounded-lg border border-slate-200 bg-white p-3">
        <dt class="text-xs font-semibold uppercase text-slate-500">${escapeHtml(label)}</dt>
        <dd class="mt-1 break-words text-sm font-medium leading-6 text-slate-900">${escapeHtml(value || '-')}</dd>
      </div>
    `;
  }

  function detailGroup(title, items) {
    return `
      <section class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <h3 class="mb-3 text-sm font-semibold text-slate-950">${escapeHtml(title)}</h3>
        <dl class="grid gap-3 sm:grid-cols-2">${items.map(([label, value]) => detailItem(label, value)).join('')}</dl>
      </section>
    `;
  }

  function openDetail(id) {
    const row = rows.find((item) => item.id === id);
    if (!row) return;

    modalTitle.textContent = row.namaLengkap;
    modalSubtitle.textContent = `${row.id} - Antrian ${row.nomorAntrian}`;
    detailList.innerHTML = [
      detailGroup('Kehadiran', [
        ['ID', row.id],
        ['Nomor Antrian', row.nomorAntrian],
        ['Tanggal Hadir', formatDateDisplay(row.tanggalHadir)],
        ['Jam Hadir', formatTimeDisplay(row.jamHadir)]
      ]),
      detailGroup('Biodata', [
        ['Nama Lengkap', row.namaLengkap],
        ['NISN', row.nisn],
        ['Jenis Kelamin', row.jenisKelamin],
        ['Tempat Lahir', row.tempatLahir],
        ['Tanggal Lahir', formatDateDisplay(row.tanggalLahir)],
        ['Nomor HP', row.nomorHp]
      ]),
      detailGroup('Sekolah dan Jurusan', [
        ['Asal Sekolah', row.asalSekolah],
        ['Alamat', row.alamat],
        ['Pilihan Jurusan 1', row.pilihan1],
        ['Pilihan Jurusan 2', row.pilihan2],
        ['Pilihan Jurusan 3', row.pilihan3]
      ]),
      detailGroup('Verifikasi', [
        ['Status Verifikasi', row.statusVerifikasi],
        ['Catatan Panitia', row.catatanPanitia],
        ['Petugas Verifikasi', row.petugasVerifikasi],
        ['Waktu Update Status', row.waktuUpdateStatus ? `${formatDateDisplay(row.waktuUpdateStatus)} ${formatTimeDisplay(row.waktuUpdateStatus)}` : '-']
      ])
    ].join('');

    statusForm.elements.id.value = row.id;
    statusForm.elements.statusVerifikasi.value = row.statusVerifikasi;
    statusForm.elements.catatanPanitia.value = row.catatanPanitia || '';
    detailModal.classList.remove('hidden');
  }

  async function loadData() {
    const cachedRows = rows.length ? [] : readCachedRows();
    if (cachedRows.length) {
      rows = cachedRows;
      filteredRows = cachedRows;
      applyFilters();
    }

    setLoadingData(true);
    const result = await window.HadirApi.request({ action: 'getData', token: currentSession.token });

    if (result.status !== 'success') {
      setLoadingData(false);
      clearSession();
      showLogin();
      showLoginNotice(result.message || 'Sesi sudah habis. Silakan login ulang.');
      return;
    }

    rows = Array.isArray(result.data) ? result.data : [];
    writeCachedRows(rows);
    const validIds = new Set(rows.map((row) => row.id));
    selectedIds = new Set(Array.from(selectedIds).filter((id) => validIds.has(id)));
    setLoadingData(false);
    applyFilters();
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loginButton.disabled = true;
    loginButton.textContent = 'Memeriksa...';

    const payload = Object.fromEntries(new FormData(loginForm).entries());
    const result = await window.HadirApi.request({ action: 'login', ...payload });

    loginButton.disabled = false;
    loginButton.textContent = 'Login';

    if (result.status !== 'success') {
      showLoginNotice(result.message || 'Login gagal.');
      return;
    }

    saveSession(result);
    loginNotice.classList.add('hidden');
    loginForm.reset();
    showDashboard();
    loadData();
  });

  logoutButton.addEventListener('click', async () => {
    if (currentSession) await window.HadirApi.request({ action: 'logout', token: currentSession.token });
    clearSession();
    showLogin();
  });

  refreshButton.addEventListener('click', loadData);
  majorStatsMode.addEventListener('change', renderMajorStats);
  tabButtons.forEach((button) => button.addEventListener('click', () => setActiveTab(button.dataset.tab)));

  [searchInput, dateFilter, statusFilter, majorFilter].forEach((input) => {
    input.addEventListener('input', scheduleApplyFilters);
    input.addEventListener('change', applyFilters);
  });

  selectAllVisible.addEventListener('change', () => toggleVisibleSelection(selectAllVisible.checked));
  clearSelectionButton.addEventListener('click', () => {
    selectedIds.clear();
    renderSelectionState();
    renderActivePanel();
  });

  applyBatchButton.addEventListener('click', async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    applyBatchButton.disabled = true;
    applyBatchButton.textContent = 'Menyimpan...';
    showProcessModal('Menyimpan Batch Verifikasi', `${ids.length} data sedang diperbarui. Mohon tunggu.`);
    let failedMessage = '';
    try {
      for (const id of ids) {
        const result = await window.HadirApi.request({
          action: 'updateStatus',
          token: currentSession.token,
          id,
          statusVerifikasi: batchStatus.value,
          catatanPanitia: batchNote.value
        });
        if (result.status !== 'success') {
          failedMessage = result.message || 'Sebagian data gagal diperbarui.';
          break;
        }
      }
    } catch (error) {
      failedMessage = 'Batch verifikasi gagal dikirim. Periksa koneksi internet, lalu coba lagi.';
    } finally {
      hideProcessModal();
      applyBatchButton.textContent = 'Update';
      applyBatchButton.disabled = false;
    }

    if (failedMessage) {
      alert(failedMessage);
      await loadData();
      return;
    }
    selectedIds.clear();
    batchNote.value = '';
    await loadData();
  });

  tableBody.addEventListener('click', (event) => {
    const checkbox = event.target.closest('.row-select');
    if (checkbox) return setSelected(checkbox.dataset.selectId, checkbox.checked);
    const button = event.target.closest('.detail-button');
    if (button) openDetail(button.dataset.id);
  });

  mobileList.addEventListener('click', (event) => {
    const checkbox = event.target.closest('.row-select');
    if (checkbox) return setSelected(checkbox.dataset.selectId, checkbox.checked);
    const button = event.target.closest('.detail-button');
    if (button) openDetail(button.dataset.id);
  });

  closeModalButton.addEventListener('click', () => detailModal.classList.add('hidden'));
  detailModal.addEventListener('click', (event) => {
    if (event.target === detailModal) detailModal.classList.add('hidden');
  });

  statusForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(statusForm).entries());
    saveStatusButton.disabled = true;
    saveStatusButton.textContent = 'Menyimpan...';
    showProcessModal('Menyimpan Status', 'Status verifikasi sedang dikirim ke Spreadsheet.');
    let result;
    try {
      result = await window.HadirApi.request({ action: 'updateStatus', token: currentSession.token, ...payload });
    } catch (error) {
      result = { status: 'error', message: 'Status gagal dikirim. Periksa koneksi internet, lalu coba lagi.' };
    } finally {
      hideProcessModal();
      saveStatusButton.disabled = false;
      saveStatusButton.textContent = 'Simpan Status';
    }

    if (result.status === 'success') {
      detailModal.classList.add('hidden');
      await loadData();
    } else {
      alert(result.message || 'Status gagal diperbarui.');
    }
  });

  async function init() {
    populateFilters();
    setActiveTab(activeTab);
    renderSelectionState();
    currentSession = getStoredSession();
    if (!currentSession) return showLogin();

    const result = await window.HadirApi.request({ action: 'checkSession', token: currentSession.token });
    if (result.status !== 'success') {
      clearSession();
      return showLogin();
    }
    currentSession = { ...currentSession, ...result.admin };
    showDashboard();
    loadData();
  }

  init();
})();
