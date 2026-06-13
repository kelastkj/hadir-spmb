(function () {
  const form = document.getElementById('attendanceForm');
  const notice = document.getElementById('notice');
  const introPanel = document.getElementById('introPanel');
  const formPanelHeader = document.getElementById('formPanelHeader');
  const submitButton = document.getElementById('submitButton');
  const jurusanSelects = Array.from(document.querySelectorAll('[data-jurusan-select]'));

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));
  }

  function showNotice(type, message) {
    const styles = {
      success: 'border-emerald-200 bg-white text-slate-900 shadow-soft',
      error: 'border-red-200 bg-red-50 text-red-900',
      info: 'border-sky-200 bg-sky-50 text-sky-900'
    };
    notice.className = `scroll-mt-24 rounded-lg border p-4 text-sm ${styles[type] || styles.info}`;
    notice.innerHTML = message;
    notice.classList.remove('hidden');
    notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? 'Mengirim...' : 'Kirim Daftar Hadir';
    submitButton.classList.toggle('opacity-70', isLoading);
  }

  function populateJurusan(items) {
    jurusanSelects.forEach((select) => {
      select.innerHTML = '<option value="">Pilih jurusan</option>';
      items.forEach((item) => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
      });
    });
  }

  function setFormFieldsVisible(isVisible) {
    document.body.classList.toggle('proof-mode', !isVisible);
    introPanel.classList.toggle('hidden', !isVisible);
    formPanelHeader.classList.toggle('hidden', !isVisible);
    Array.from(form.children).forEach((child) => {
      if (child !== notice) {
        child.classList.toggle('hidden', !isVisible);
      }
    });
  }

  function getPayload() {
    const payload = Object.fromEntries(new FormData(form).entries());
    Object.keys(payload).forEach((key) => {
      payload[key] = String(payload[key] || '').trim();
    });
    return payload;
  }

  function validate(payload) {
    if (!/^\d+$/.test(payload.nisn)) {
      return 'NISN hanya boleh angka.';
    }

    if (payload.nisn.length !== 10) {
      return 'NISN sebaiknya 10 digit.';
    }

    const phoneDigits = payload.nomorHp.replace(/[^\d]/g, '');
    if (!/^(08|\+62)/.test(payload.nomorHp) || phoneDigits.length < 10) {
      return 'Nomor HP minimal 10 digit dan diawali 08 atau +62.';
    }

    const choices = [payload.pilihan1, payload.pilihan2, payload.pilihan3];
    if (new Set(choices).size !== choices.length) {
      return 'Pilihan jurusan 1, 2, dan 3 tidak boleh sama.';
    }

    return '';
  }

  function proofFileName() {
    const queueNumber = document.querySelector('[data-proof-queue]')?.textContent || 'antrian';
    return `bukti-hadir-spmb-${queueNumber.trim().replace(/[^\w-]+/g, '-')}.png`.toLowerCase();
  }

  async function downloadProofCard(button) {
    const card = document.getElementById('proofCard');
    if (!card || !window.html2canvas) {
      showNotice('error', 'Bukti belum bisa disimpan sebagai gambar. Silakan gunakan screenshot perangkat.');
      return;
    }

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Menyiapkan gambar...';

    try {
      const canvas = await window.html2canvas(card, {
        backgroundColor: '#ffffff',
        scale: Math.min(window.devicePixelRatio || 1, 2),
        useCORS: true
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          button.disabled = false;
          button.textContent = originalText;
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = proofFileName();
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        button.disabled = false;
        button.textContent = originalText;
      }, 'image/png');
    } catch (error) {
      button.disabled = false;
      button.textContent = originalText;
      showNotice('error', 'Bukti belum bisa disimpan sebagai gambar. Silakan gunakan screenshot perangkat.');
    }
  }

  async function init() {
    populateJurusan(window.HadirApi.defaultJurusan);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const payload = getPayload();
    const validationMessage = validate(payload);
    if (validationMessage) {
      showNotice('error', validationMessage);
      return;
    }

    setLoading(true);
    const result = await window.HadirApi.request({ action: 'submit', ...payload });
    setLoading(false);

    if (result.status !== 'success') {
      showNotice('error', result.message || 'Data belum berhasil dikirim. Periksa koneksi internet, lalu coba lagi.');
      return;
    }

    form.reset();
    const data = result.data || payload;
    const submittedAt = new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: window.APP_CONFIG.TIMEZONE
    });
    showNotice('success', `
      <div id="proofCard" class="proof-card mx-auto w-full max-w-md overflow-hidden rounded-xl bg-white">
        <div class="border-b border-emerald-100 bg-emerald-50 px-5 py-4">
          <div class="flex items-center gap-3">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <img src="assets/logo.png" alt="Logo SMKN 2 Marabahan" class="h-11 w-11 object-contain">
            </div>
            <div class="min-w-0">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">SMKN 2 Marabahan</p>
              <h2 class="mt-0.5 text-base font-semibold leading-snug text-slate-950">Bukti Daftar Hadir SPMB</h2>
            </div>
          </div>
        </div>
        <div class="p-5">
          <div class="rounded-lg bg-emerald-700 px-4 py-4 text-center text-white">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-emerald-50">Nomor Antrian</p>
            <p data-proof-queue class="mt-1 text-5xl font-bold leading-none">${escapeHtml(data.nomorAntrian)}</p>
          </div>
          <dl class="mt-4 overflow-hidden rounded-lg border border-slate-100 text-sm">
            <div class="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-b border-slate-100 px-3 py-2.5">
              <dt class="text-slate-500">Nama</dt>
              <dd class="break-words text-right font-semibold text-slate-950">${escapeHtml(data.namaLengkap)}</dd>
            </div>
            <div class="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-b border-slate-100 px-3 py-2.5">
              <dt class="text-slate-500">ID</dt>
              <dd class="break-words text-right font-semibold text-slate-950">${escapeHtml(data.id || '-')}</dd>
            </div>
            <div class="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-b border-slate-100 px-3 py-2.5">
              <dt class="text-slate-500">Status</dt>
              <dd class="break-words text-right font-semibold text-emerald-700">${escapeHtml(data.statusVerifikasi || 'Menunggu Verifikasi')}</dd>
            </div>
            <div class="grid grid-cols-[88px_minmax(0,1fr)] gap-3 px-3 py-2.5">
              <dt class="text-slate-500">Waktu</dt>
              <dd class="break-words text-right font-semibold text-slate-950">${escapeHtml(submittedAt)}</dd>
            </div>
          </dl>
          <p class="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-center text-xs leading-5 text-slate-600">
            Simpan dan tunjukkan bukti ini kepada panitia.
          </p>
        </div>
      </div>
      <div class="mx-auto mt-4 grid max-w-lg gap-3 sm:grid-cols-2">
        <button type="button" data-download-proof class="min-h-11 rounded-lg bg-brand-green px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark">
          Simpan Bukti
        </button>
        <button type="button" data-reset-form class="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-brand-green hover:text-brand-green">
          Isi Data Lain
        </button>
      </div>
    `);
    setFormFieldsVisible(false);
    notice.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  notice.addEventListener('click', (event) => {
    const downloadButton = event.target.closest('[data-download-proof]');
    if (downloadButton) {
      downloadProofCard(downloadButton);
      return;
    }

    if (!event.target.closest('[data-reset-form]')) return;
    setFormFieldsVisible(true);
    notice.classList.add('hidden');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  init();
})();
