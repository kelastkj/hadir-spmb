(function () {
  const loadingState = document.getElementById('loadingState');
  const dashboardContent = document.getElementById('dashboardContent');
  const updatedAt = document.getElementById('updatedAt');
  const dataMode = document.getElementById('dataMode');
  const refreshButton = document.getElementById('refreshButton');
  const refreshIcon = document.getElementById('refreshIcon');
  const kpiGrid = document.getElementById('kpiGrid');
  const dataNote = document.getElementById('dataNote');
  const strategyList = document.getElementById('strategyList');
  const focusMap = document.getElementById('focusMap');
  const rankingBars = document.getElementById('rankingBars');
  const opportunityList = document.getElementById('opportunityList');
  const choiceStack = document.getElementById('choiceStack');
  const genderBars = document.getElementById('genderBars');
  const dailyTrend = document.getElementById('dailyTrend');
  const insightList = document.getElementById('insightList');

  const colors = ['#0f7a3b', '#f2b705', '#2563eb', '#ce3a20', '#7c3aed', '#0f766e', '#ea580c'];

  const dummyStats = {
    totalHadir: 186,
    updatedAt: 'Data contoh untuk uji tampilan',
    majors: [
      { major: 'Teknik Komputer dan Jaringan', pilihan1: 42, pilihan2: 31, pilihan3: 22, semuaPilihan: 95 },
      { major: 'Teknik Kendaraan Ringan', pilihan1: 34, pilihan2: 29, pilihan3: 26, semuaPilihan: 89 },
      { major: 'Desain Komunikasi Visual', pilihan1: 31, pilihan2: 35, pilihan3: 27, semuaPilihan: 93 },
      { major: 'Teknik Sepeda Motor', pilihan1: 25, pilihan2: 30, pilihan3: 34, semuaPilihan: 89 },
      { major: 'Teknik Instalasi Tenaga Listrik', pilihan1: 22, pilihan2: 24, pilihan3: 33, semuaPilihan: 79 },
      { major: 'Bisnis Retail', pilihan1: 18, pilihan2: 20, pilihan3: 28, semuaPilihan: 66 },
      { major: 'Teknik Alat Berat', pilihan1: 14, pilihan2: 17, pilihan3: 16, semuaPilihan: 47 }
    ],
    genderCounts: [
      { label: 'Laki-laki', value: 118 },
      { label: 'Perempuan', value: 68 }
    ],
    dailyCounts: [
      { label: '2026-06-10', value: 22 },
      { label: '2026-06-11', value: 37 },
      { label: '2026-06-12', value: 49 },
      { label: '2026-06-13', value: 46 },
      { label: '2026-06-14', value: 32 }
    ]
  };

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));
  }

  function percent(value, total) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }

  function sortedMajors(stats) {
    return [...(stats.majors || [])].sort((a, b) => b.pilihan1 - a.pilihan1 || a.major.localeCompare(b.major));
  }

  function normalizeStats(stats) {
    const source = stats && typeof stats === 'object' ? stats : {};
    const majors = Array.isArray(source.majors) && source.majors.length ? source.majors : dummyStats.majors;
    return {
      totalHadir: Number(source.totalHadir || source.totalPendaftar || 0),
      updatedAt: source.updatedAt || '-',
      majors: majors.map((item) => ({
        major: item.major || '-',
        pilihan1: Number(item.pilihan1 || 0),
        pilihan2: Number(item.pilihan2 || 0),
        pilihan3: Number(item.pilihan3 || 0),
        semuaPilihan: Number(item.semuaPilihan || item.pilihan1 || 0)
      })),
      genderCounts: Array.isArray(source.genderCounts) ? source.genderCounts : [],
      dailyCounts: Array.isArray(source.dailyCounts) ? source.dailyCounts : []
    };
  }

  function totalSeries(series) {
    return (series || []).reduce((sum, item) => sum + Number(item.value || 0), 0);
  }

  function renderKpis(stats) {
    const majors = sortedMajors(stats);
    const top = majors[0] || { major: '-', pilihan1: 0 };
    const low = [...majors].reverse()[0] || { major: '-', pilihan1: 0 };
    const totalChoices = majors.reduce((sum, item) => sum + Number(item.semuaPilihan || 0), 0);
    const cards = [
      ['Total Hadir', stats.totalHadir || 0, 'Calon siswa yang mengisi daftar hadir'],
      ['Paling Banyak', top.major, `${top.pilihan1} siswa memilih sebagai pilihan 1`],
      ['Paling Sedikit', low.major, `${low.pilihan1} siswa memilih sebagai pilihan 1`],
      ['Total Pilihan', totalChoices, 'Setiap siswa mengisi 3 pilihan jurusan']
    ];

    kpiGrid.innerHTML = cards.map(([label, value, detail], index) => `
      <article class="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-soft sm:p-4">
        <div class="mb-3 h-1 w-10 rounded-full ${index === 1 ? 'bg-brand-gold' : 'bg-brand-green'}"></div>
        <p class="text-xs font-semibold uppercase text-slate-500">${escapeHtml(label)}</p>
        <p class="mt-2 break-words text-xl font-semibold leading-tight text-slate-950 sm:text-2xl">${escapeHtml(value)}</p>
        <p class="mt-2 text-sm leading-5 text-slate-500">${escapeHtml(detail)}</p>
      </article>
    `).join('');
  }

  function renderRanking(stats) {
    const majors = sortedMajors(stats);
    const max = Math.max(...majors.map((item) => item.pilihan1), 1);
    rankingBars.innerHTML = majors.map((item, index) => {
      const width = Math.max(8, percent(item.pilihan1, max));
      return `
        <article class="grid min-w-0 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold text-slate-500">#${index + 1}</p>
              <p class="mt-1 break-words text-sm font-semibold leading-5 text-slate-950">${escapeHtml(item.major)}</p>
            </div>
            <p class="shrink-0 text-xl font-semibold text-slate-950">${item.pilihan1}</p>
          </div>
          <div class="h-3 overflow-hidden rounded-full bg-slate-200">
            <div class="h-full rounded-full bg-brand-green" style="width:${width}%"></div>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderOpportunities(stats) {
    const majors = sortedMajors(stats).reverse();
    const total = Math.max(Number(stats.totalHadir || 0), 1);
    opportunityList.innerHTML = majors.slice(0, 4).map((item) => {
      const share = percent(item.pilihan1, total);
      return `
        <article class="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="flex items-start justify-between gap-3">
            <p class="min-w-0 break-words text-sm font-semibold leading-5 text-slate-950">${escapeHtml(item.major)}</p>
            <p class="shrink-0 text-lg font-semibold text-slate-950">${item.pilihan1}</p>
          </div>
          <div class="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
            <div class="h-full rounded-full bg-brand-green" style="width:${Math.max(3, share)}%"></div>
          </div>
          <p class="mt-2 text-xs leading-5 text-slate-500">${share}% dari total hadir memilih jurusan ini sebagai pilihan 1</p>
        </article>
      `;
    }).join('');
  }

  function renderDataNote(stats) {
    const total = Number(stats.totalHadir || 0);
    const tone = total < 50
      ? 'border-amber-100 bg-amber-50 text-amber-900'
      : 'border-emerald-100 bg-emerald-50 text-emerald-900';
    const title = total < 50 ? 'Data masih sedikit' : 'Data sudah cukup terlihat';
    const text = total < 50
      ? 'Jumlah siswa yang mengisi daftar hadir masih sedikit. Gunakan grafik ini sebagai gambaran awal saja.'
      : 'Jumlah siswa yang mengisi daftar hadir sudah cukup untuk melihat jurusan yang banyak dan sedikit diminati.';

    dataNote.innerHTML = `
      <article class="min-w-0 rounded-lg border ${tone} p-4">
        <p class="text-base font-semibold">${escapeHtml(title)}</p>
        <p class="mt-2 text-sm leading-6">${escapeHtml(text)}</p>
        <p class="mt-4 text-3xl font-semibold leading-none">${total}</p>
        <p class="mt-1 text-xs font-semibold uppercase">Siswa sudah mengisi daftar hadir</p>
      </article>
    `;
  }

  function renderStrategies(stats) {
    const majors = sortedMajors(stats);
    const top = majors[0] || { major: '-', pilihan1: 0 };
    const second = majors[1] || top;
    const low = [...majors].reverse()[0] || { major: '-', pilihan1: 0 };
    const total = Number(stats.totalHadir || 0);
    const topShare = percent(top.pilihan1, Math.max(total, 1));
    const lowShare = percent(low.pilihan1, Math.max(total, 1));
    const strategies = [
      {
        label: 'Informasi utama',
        title: top.major,
        text: `${top.pilihan1} siswa memilih sebagai pilihan 1. Buat info online yang lengkap untuk jurusan ini: profil singkat, kompetensi, dan gambaran peluang setelah lulus.`,
        meta: `${topShare}% dari total hadir`
      },
      {
        label: 'Informasi pembanding',
        title: second.major,
        text: `${second.pilihan1} siswa memilih sebagai pilihan 1. Siapkan ringkasan yang mudah dibandingkan dengan jurusan paling banyak diminati.`,
        meta: 'Bantu siswa membandingkan'
      },
      {
        label: 'Perlu dikenalkan',
        title: low.major,
        text: `${low.pilihan1} siswa memilih sebagai pilihan 1. Tampilkan keunggulan jurusan ini lebih jelas di halaman informasi atau poster digital.`,
        meta: `${lowShare}% dari total hadir`
      }
    ];

    strategyList.innerHTML = strategies.map((item, index) => `
      <article class="min-w-0 rounded-lg border ${index === 0 ? 'border-emerald-100 bg-emerald-50' : 'border-slate-200 bg-slate-50'} p-3">
        <p class="text-xs font-semibold uppercase text-brand-green">${escapeHtml(item.label)}</p>
        <p class="mt-2 break-words text-base font-semibold leading-6 text-slate-950">${escapeHtml(item.title)}</p>
        <p class="mt-2 text-sm leading-6 text-slate-600">${escapeHtml(item.text)}</p>
        <p class="mt-3 w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">${escapeHtml(item.meta)}</p>
      </article>
    `).join('');
  }

  function renderFocusMap(stats) {
    const majors = sortedMajors(stats);
    const max = Math.max(...majors.map((item) => Number(item.pilihan1 || 0)), 1);
    focusMap.innerHTML = majors.map((item) => {
      const value = Number(item.pilihan1 || 0);
      const width = Math.max(5, percent(value, max));
      let label = 'Cukup diminati';
      let note = 'Siapkan ringkasan informasi jurusan.';
      let tone = 'bg-sky-50 text-sky-700';
      if (width >= 75) {
        label = 'Ramai ditanyakan';
        note = 'Siapkan informasi lengkap dan alur bertanya.';
        tone = 'bg-emerald-50 text-emerald-700';
      } else if (width < 45) {
        label = 'Perlu dikenalkan';
        note = 'Tampilkan keunggulan jurusan dengan bahasa sederhana.';
        tone = 'bg-amber-50 text-amber-700';
      }

      return `
        <article class="grid min-w-0 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <p class="break-words text-sm font-semibold leading-5 text-slate-950">${escapeHtml(item.major)}</p>
              <p class="mt-1 text-xs leading-5 text-slate-500">${value} siswa memilih sebagai pilihan 1. ${escapeHtml(note)}</p>
            </div>
            <span class="w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${tone}">${escapeHtml(label)}</span>
          </div>
          <div class="h-3 overflow-hidden rounded-full bg-slate-200">
            <div class="h-full rounded-full bg-brand-green" style="width:${width}%"></div>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderChoiceStack(stats) {
    const majors = sortedMajors(stats);
    const max = Math.max(...majors.map((item) => item.semuaPilihan), 1);
    choiceStack.innerHTML = majors.map((item) => {
      const p1 = percent(item.pilihan1, item.semuaPilihan);
      const p2 = percent(item.pilihan2, item.semuaPilihan);
      const p3 = Math.max(0, 100 - p1 - p2);
      return `
        <article class="grid min-w-0 gap-2">
          <div class="flex items-start justify-between gap-3">
            <p class="min-w-0 break-words text-sm font-semibold leading-5 text-slate-950">${escapeHtml(item.major)}</p>
            <p class="shrink-0 text-sm font-semibold text-slate-600">${item.semuaPilihan}</p>
          </div>
          <div class="flex h-5 overflow-hidden rounded-full bg-slate-100">
            <div class="bg-brand-green" style="width:${Math.max(2, p1)}%"></div>
            <div class="bg-brand-gold" style="width:${Math.max(2, p2)}%"></div>
            <div class="bg-sky-500" style="width:${Math.max(2, p3)}%"></div>
          </div>
          <p class="text-xs text-slate-500">Pilihan 1: ${item.pilihan1} - Pilihan 2: ${item.pilihan2} - Pilihan 3: ${item.pilihan3}</p>
        </article>
      `;
    }).join('');
  }

  function renderGender(series) {
    const total = Math.max(totalSeries(series), 1);
    genderBars.innerHTML = (series || []).map((item, index) => `
      <article class="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div class="flex items-center justify-between gap-3">
          <p class="min-w-0 break-words text-sm font-semibold text-slate-950">${escapeHtml(item.label)}</p>
          <p class="shrink-0 text-lg font-semibold text-slate-950">${item.value}</p>
        </div>
        <div class="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
          <div class="h-full rounded-full" style="width:${percent(item.value, total)}%; background:${colors[index % colors.length]}"></div>
        </div>
        <p class="mt-2 text-xs text-slate-500">${percent(item.value, total)}%</p>
      </article>
    `).join('');
  }

  function renderTrend(series) {
    const max = Math.max(...(series || []).map((item) => item.value), 1);
    dailyTrend.innerHTML = (series || []).map((item) => {
      const height = Math.max(22, Math.round((item.value / max) * 230));
      return `
        <div class="flex min-w-16 flex-col items-center justify-end gap-2 sm:min-w-24">
          <span class="text-sm font-semibold text-slate-950">${item.value}</span>
          <div class="w-10 rounded-t-xl bg-brand-green sm:w-14" style="height:${height}px"></div>
          <span class="text-center text-xs leading-4 text-slate-500">${escapeHtml(item.label)}</span>
        </div>
      `;
    }).join('');
  }

  function renderInsights(stats) {
    const majors = sortedMajors(stats);
    const top = majors[0];
    const low = [...majors].reverse()[0];
    const total = stats.totalHadir || 0;
    const topShare = top ? percent(top.pilihan1, total) : 0;
    const insights = [
      [`Jurusan paling banyak dipilih`, `${top?.major || '-'} menjadi pilihan 1 terbanyak dengan ${top?.pilihan1 || 0} siswa (${topShare}% dari total hadir).`],
      [`Jurusan paling sedikit dipilih`, `${low?.major || '-'} menjadi pilihan 1 paling sedikit dibanding jurusan lain.`],
      ['Pilihan kedua dan ketiga', 'Grafik pilihan 1, 2, dan 3 menunjukkan jurusan yang tetap diminati walaupun bukan pilihan utama.'],
      ['Waktu pengisian', 'Grafik per tanggal menunjukkan hari saat siswa paling banyak mengisi daftar hadir.']
    ];

    insightList.innerHTML = insights.map(([title, text]) => `
      <article class="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p class="text-sm font-semibold text-slate-950">${escapeHtml(title)}</p>
        <p class="mt-1 text-sm leading-6 text-slate-600">${escapeHtml(text)}</p>
      </article>
    `).join('');
  }

  function renderDashboard(stats, isFallback) {
    stats = normalizeStats(stats);
    loadingState.classList.add('hidden');
    dashboardContent.classList.remove('hidden');
    updatedAt.textContent = stats.updatedAt || '-';
    dataMode.textContent = isFallback ? 'Menampilkan data contoh karena data agregat belum tersedia.' : 'Menampilkan data agregat terbaru dari sistem.';
    renderKpis(stats);
    renderDataNote(stats);
    renderStrategies(stats);
    renderFocusMap(stats);
    renderRanking(stats);
    renderOpportunities(stats);
    renderChoiceStack(stats);
    renderGender(stats.genderCounts);
    renderTrend(stats.dailyCounts);
    renderInsights(stats);
  }

  async function loadStats() {
    refreshButton.disabled = true;
    refreshIcon.classList.add('animate-spin');
    loadingState.classList.remove('hidden');
    try {
      if (new URLSearchParams(window.location.search).get('demo') === '1') {
        renderDashboard(dummyStats, true);
        return;
      }

      const result = await window.HadirApi.request({ action: 'getPublicStats' });
      if (result.status === 'success' && result.data) {
        renderDashboard(result.data, false);
        return;
      }
      renderDashboard(dummyStats, true);
    } catch (error) {
      renderDashboard(dummyStats, true);
    } finally {
      refreshButton.disabled = false;
      refreshIcon.classList.remove('animate-spin');
    }
  }

  refreshButton.addEventListener('click', loadStats);
  loadStats();
})();
