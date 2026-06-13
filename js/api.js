(function () {
  const STORAGE_KEY = 'hadirSpmbDemoPendaftar';
  const SESSION_KEY = 'hadirSpmbDemoSession';

  const defaultJurusan = [
    'Teknik Kendaraan Ringan',
    'Teknik Sepeda Motor',
    'Teknik Alat Berat',
    'Teknik Instalasi Tenaga Listrik',
    'Teknik Komputer dan Jaringan',
    'Desain Komunikasi Visual',
    'Bisnis Retail'
  ];

  const statuses = [
    'Menunggu Verifikasi',
    'Sedang Diverifikasi',
    'Berkas Lengkap',
    'Berkas Kurang',
    'Perlu Perbaikan',
    'Selesai Diverifikasi',
    'Batal / Tidak Dilanjutkan'
  ];

  function nowParts() {
    const now = new Date();
    return {
      timestamp: now.toISOString(),
      tanggalHadir: now.toLocaleDateString('id-ID', { timeZone: window.APP_CONFIG.TIMEZONE }),
      jamHadir: now.toLocaleTimeString('id-ID', {
        timeZone: window.APP_CONFIG.TIMEZONE,
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }

  function readDemoRows() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (error) {
      return [];
    }
  }

  function writeDemoRows(rows) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }

  function createId(nextNumber) {
    return `SPMB-${window.APP_CONFIG.SPMB_YEAR}-${String(nextNumber).padStart(4, '0')}`;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function demoResponse(payload) {
    const rows = readDemoRows();
    const parts = nowParts();

    if (payload.action === 'getJurusan') {
      return { status: 'success', data: defaultJurusan };
    }

    if (payload.action === 'submit') {
      const duplicate = rows.some((row) => row.nisn === payload.nisn);
      if (duplicate) {
        return {
          status: 'error',
          message: 'NISN ini sudah pernah mengisi daftar hadir. Silakan hubungi panitia jika ada kesalahan data.'
        };
      }

      const row = {
        id: createId(rows.length + 1),
        timestamp: parts.timestamp,
        tanggalHadir: parts.tanggalHadir,
        jamHadir: parts.jamHadir,
        nomorAntrian: payload.nomorAntrian,
        namaLengkap: payload.namaLengkap,
        nisn: payload.nisn,
        jenisKelamin: payload.jenisKelamin,
        tempatLahir: payload.tempatLahir || '',
        tanggalLahir: payload.tanggalLahir || '',
        asalSekolah: payload.asalSekolah,
        alamat: payload.alamat,
        nomorHp: payload.nomorHp,
        pilihan1: payload.pilihan1,
        pilihan2: payload.pilihan2,
        pilihan3: payload.pilihan3,
        statusVerifikasi: 'Menunggu Verifikasi',
        catatanPanitia: '',
        petugasVerifikasi: '',
        waktuUpdateStatus: ''
      };
      rows.push(row);
      writeDemoRows(rows);
      return {
        status: 'success',
        message: 'Data berhasil disimpan',
        data: row
      };
    }

    if (payload.action === 'login') {
      if (!payload.username || !payload.password) {
        return { status: 'error', message: 'Username dan password wajib diisi.' };
      }
      const session = {
        token: `demo-${crypto.randomUUID()}`,
        nama: payload.username === 'admin' ? 'Admin Demo' : payload.username,
        username: payload.username,
        role: payload.username === 'admin' ? 'Super Admin' : 'Panitia'
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return {
        status: 'success',
        message: 'Login demo berhasil',
        token: session.token,
        admin: {
          nama: session.nama,
          username: session.username,
          role: session.role
        }
      };
    }

    if (payload.action === 'checkSession') {
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (!session || session.token !== payload.token) {
        return { status: 'error', message: 'Sesi sudah habis. Silakan login ulang.' };
      }
      return { status: 'success', message: 'Session valid', admin: session };
    }

    if (payload.action === 'getData') {
      return { status: 'success', data: rows };
    }

    if (payload.action === 'updateStatus') {
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      const row = rows.find((item) => item.id === payload.id);
      if (!row) return { status: 'error', message: 'Data tidak ditemukan.' };
      row.statusVerifikasi = payload.statusVerifikasi;
      row.catatanPanitia = payload.catatanPanitia || '';
      row.petugasVerifikasi = session ? session.nama : 'Demo';
      row.waktuUpdateStatus = new Date().toISOString();
      writeDemoRows(rows);
      return { status: 'success', message: 'Status berhasil diperbarui.' };
    }

    if (payload.action === 'logout') {
      sessionStorage.removeItem(SESSION_KEY);
      return { status: 'success', message: 'Logout berhasil.' };
    }

    return { status: 'error', message: 'Action tidak dikenali.' };
  }

  async function request(payload) {
    const url = window.APP_CONFIG.APPS_SCRIPT_URL;
    if (!url && window.APP_CONFIG.DEMO_MODE) {
      await delay(250);
      return demoResponse(payload);
    }

    if (!url) {
      return {
        status: 'error',
        message: 'URL Google Apps Script belum dikonfigurasi di js/config.js.'
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const text = await response.text();

      try {
        return JSON.parse(text);
      } catch (error) {
        return {
          status: 'error',
          message: `Respons server tidak valid. Detail: ${text.slice(0, 160) || response.statusText || 'Respons kosong'}`
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Data belum berhasil dikirim. Detail: ${error.message || 'Periksa koneksi internet, lalu coba lagi.'}`
      };
    }
  }

  window.HadirApi = {
    request,
    defaultJurusan,
    statuses
  };
})();
