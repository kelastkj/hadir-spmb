const SHEETS = {
  PENDAFTAR: 'Pendaftar',
  JURUSAN: 'Jurusan',
  ADMIN: 'Admin',
  SESSION: 'Session',
  LOG: 'Log',
  KONFIGURASI: 'Konfigurasi'
};

const STATUS = {
  ACTIVE: 'Aktif',
  LOGOUT: 'Logout',
  EXPIRED: 'Expired'
};

const VERIFICATION_STATUSES = [
  'Menunggu Verifikasi',
  'Sedang Diverifikasi',
  'Berkas Lengkap',
  'Berkas Kurang',
  'Perlu Perbaikan',
  'Selesai Diverifikasi',
  'Batal / Tidak Dilanjutkan'
];

function setupDatabse() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const headers = {
    Pendaftar: [
      'ID', 'Timestamp', 'Tanggal Hadir', 'Jam Hadir', 'Nomor Antrian',
      'Nama Lengkap', 'NISN', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir',
      'Asal Sekolah', 'Alamat', 'Nomor HP', 'Pilihan Jurusan 1',
      'Pilihan Jurusan 2', 'Pilihan Jurusan 3', 'Status Verifikasi',
      'Catatan Panitia', 'Petugas Verifikasi', 'Waktu Update Status'
    ],
    Jurusan: ['No', 'Nama Jurusan', 'Kode Jurusan', 'Status'],
    Admin: ['ID Admin', 'Nama', 'Username', 'Password', 'Role', 'Status', 'Terakhir Login', 'Catatan'],
    Session: ['Token', 'Username', 'Nama', 'Role', 'Login At', 'Expired At', 'Status'],
    Log: ['Timestamp', 'Action', 'ID Data', 'Username', 'Nama Admin', 'Role', 'Detail'],
    Konfigurasi: ['Key', 'Value', 'Keterangan']
  };

  Object.keys(headers).forEach(function (sheetName) {
    const sheet = getOrCreateSheet_(ss, sheetName);
    sheet.getRange(1, 1, 1, headers[sheetName].length).setValues([headers[sheetName]]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers[sheetName].length)
      .setFontWeight('bold')
      .setBackground('#0f7a3b')
      .setFontColor('#ffffff');

    if (sheetName === SHEETS.PENDAFTAR) {
      sheet.getRange('G:G').setNumberFormat('@');
      sheet.getRange('M:M').setNumberFormat('@');
    }

    sheet.autoResizeColumns(1, headers[sheetName].length);
  });

  seedJurusan_(ss.getSheetByName(SHEETS.JURUSAN));
  seedAdmin_(ss.getSheetByName(SHEETS.ADMIN));
  seedKonfigurasi_(ss.getSheetByName(SHEETS.KONFIGURASI));
}

function setupDatabase() {
  setupDatabse();
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const action = payload.action;
    let result;

    if (action === 'submit') result = submitData(payload);
    else if (action === 'login') result = loginAdmin(payload);
    else if (action === 'checkSession') result = checkSession(payload);
    else if (action === 'getData') result = getData(payload);
    else if (action === 'updateStatus') result = updateStatus(payload);
    else if (action === 'logout') result = logout(payload);
    else if (action === 'getJurusan') result = getJurusan();
    else result = error_('Action tidak dikenali.');

    return json_(result);
  } catch (err) {
    return json_(error_('Request tidak valid: ' + getErrorMessage_(err)));
  }
}

function doGet() {
  return json_({ status: 'success', message: 'Hadir SPMB API aktif.' });
}

function submitData(payload) {
  const required = [
    'nomorAntrian', 'namaLengkap', 'nisn', 'jenisKelamin',
    'tempatLahir', 'tanggalLahir', 'asalSekolah', 'alamat',
    'nomorHp', 'pilihan1', 'pilihan2', 'pilihan3'
  ];
  for (let i = 0; i < required.length; i += 1) {
    if (!String(payload[required[i]] || '').trim()) {
      return error_('Field wajib belum lengkap.');
    }
  }

  if (!/^\d+$/.test(payload.nisn)) return error_('NISN hanya boleh angka.');
  if (!isPhoneValid_(payload.nomorHp)) return error_('Nomor HP minimal 10 digit dan diawali 08 atau +62.');

  const choices = [payload.pilihan1, payload.pilihan2, payload.pilihan3];
  if (new Set(choices).size !== choices.length) {
    return error_('Pilihan jurusan 1, 2, dan 3 tidak boleh sama.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.PENDAFTAR);
  const rows = getDataRows_(sheet);
  const duplicate = rows.some(function (row) {
    return String(row[6]) === String(payload.nisn);
  });
  if (duplicate) {
    return error_('NISN ini sudah pernah mengisi daftar hadir. Silakan hubungi panitia jika ada kesalahan data.');
  }

  const config = getConfig_();
  if (config.status_aplikasi && config.status_aplikasi !== 'Aktif') {
    return error_('Aplikasi sedang tidak aktif.');
  }

  const timezone = config.timezone || 'Asia/Makassar';
  const now = new Date();
  const id = generatePendaftarId_(sheet, config.tahun_spmb || '2026');
  const status = config.default_status_verifikasi || 'Menunggu Verifikasi';
  const row = [
    id,
    now,
    Utilities.formatDate(now, timezone, 'dd/MM/yyyy'),
    Utilities.formatDate(now, timezone, 'HH:mm'),
    clean_(payload.nomorAntrian),
    clean_(payload.namaLengkap),
    clean_(payload.nisn),
    clean_(payload.jenisKelamin),
    clean_(payload.tempatLahir),
    clean_(payload.tanggalLahir),
    clean_(payload.asalSekolah),
    clean_(payload.alamat),
    clean_(payload.nomorHp),
    clean_(payload.pilihan1),
    clean_(payload.pilihan2),
    clean_(payload.pilihan3),
    status,
    '',
    '',
    ''
  ];

  const nextRow = sheet.getLastRow() + 1;
  sheet.getRange(nextRow, 7).setNumberFormat('@');
  sheet.getRange(nextRow, 13).setNumberFormat('@');
  sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

  writeLog_('SUBMIT', id, '', '', '', 'Submit daftar hadir ' + payload.namaLengkap);
  return {
    status: 'success',
    message: 'Data berhasil disimpan',
    data: {
      id: id,
      nomorAntrian: row[4],
      namaLengkap: row[5],
      statusVerifikasi: status
    }
  };
}

function loginAdmin(payload) {
  const username = clean_(payload.username);
  const password = String(payload.password || '');
  if (!username || !password) return error_('Username dan password wajib diisi.');

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.ADMIN);
  const rows = getDataRows_(sheet);
  const index = rows.findIndex(function (row) {
    return String(row[2]) === username && String(row[3]) === password;
  });

  if (index === -1) return error_('Username atau password salah.');

  const admin = rows[index];
  if (String(admin[5]) !== STATUS.ACTIVE) return error_('Akun admin tidak aktif.');

  const config = getConfig_();
  const hours = Number(config.token_expired_hours || 10);
  const loginAt = new Date();
  const expiredAt = new Date(loginAt.getTime() + hours * 60 * 60 * 1000);
  const token = generateToken_();

  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.SESSION).appendRow([
    token, admin[2], admin[1], admin[4], loginAt, expiredAt, STATUS.ACTIVE
  ]);

  sheet.getRange(index + 2, 7).setValue(loginAt);
  writeLog_('LOGIN', '', admin[2], admin[1], admin[4], 'Login admin');

  return {
    status: 'success',
    message: 'Login berhasil',
    token: token,
    admin: {
      nama: admin[1],
      username: admin[2],
      role: admin[4]
    }
  };
}

function checkSession(payload) {
  const session = validateSession_(payload.token);
  if (!session.valid) return error_(session.message);
  return {
    status: 'success',
    message: 'Session valid',
    admin: {
      nama: session.nama,
      username: session.username,
      role: session.role
    }
  };
}

function getData(payload) {
  const session = validateSession_(payload.token);
  if (!session.valid) return error_(session.message);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.PENDAFTAR);
  const rows = getDataRows_(sheet);
  const timezone = getConfig_().timezone || 'Asia/Makassar';
  const data = rows.map(function (row) {
    return {
      id: row[0],
      timestamp: formatValue_(row[1], timezone),
      tanggalHadir: formatDateOnly_(row[2], timezone),
      jamHadir: formatTimeOnly_(row[3], timezone),
      nomorAntrian: row[4],
      namaLengkap: row[5],
      nisn: row[6],
      jenisKelamin: row[7],
      tempatLahir: row[8],
      tanggalLahir: formatDateOnly_(row[9], timezone),
      asalSekolah: row[10],
      alamat: row[11],
      nomorHp: row[12],
      pilihan1: row[13],
      pilihan2: row[14],
      pilihan3: row[15],
      statusVerifikasi: row[16],
      catatanPanitia: row[17],
      petugasVerifikasi: row[18],
      waktuUpdateStatus: formatValue_(row[19], timezone)
    };
  }).reverse();

  return { status: 'success', data: data };
}

function updateStatus(payload) {
  const session = validateSession_(payload.token);
  if (!session.valid) return error_(session.message);

  const status = clean_(payload.statusVerifikasi);
  if (VERIFICATION_STATUSES.indexOf(status) === -1) return error_('Status verifikasi tidak valid.');

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.PENDAFTAR);
  const rows = getDataRows_(sheet);
  const index = rows.findIndex(function (row) {
    return String(row[0]) === String(payload.id);
  });

  if (index === -1) return error_('Data tidak ditemukan.');

  const rowNumber = index + 2;
  sheet.getRange(rowNumber, 17).setValue(status);
  sheet.getRange(rowNumber, 18).setValue(clean_(payload.catatanPanitia));
  sheet.getRange(rowNumber, 19).setValue(session.nama);
  sheet.getRange(rowNumber, 20).setValue(new Date());

  writeLog_('UPDATE_STATUS', payload.id, session.username, session.nama, session.role, 'Status: ' + status);
  return { status: 'success', message: 'Status berhasil diperbarui.' };
}

function logout(payload) {
  const token = clean_(payload.token);
  if (!token) return error_('Token wajib diisi.');

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.SESSION);
  const rows = getDataRows_(sheet);
  const index = rows.findIndex(function (row) {
    return String(row[0]) === token;
  });

  if (index !== -1) {
    sheet.getRange(index + 2, 7).setValue(STATUS.LOGOUT);
    writeLog_('LOGOUT', '', rows[index][1], rows[index][2], rows[index][3], 'Logout admin');
  }

  return { status: 'success', message: 'Logout berhasil.' };
}

function getJurusan() {
  const rows = getDataRows_(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.JURUSAN));
  const data = rows
    .filter(function (row) { return String(row[3]) === STATUS.ACTIVE; })
    .map(function (row) { return row[1]; });
  return { status: 'success', data: data };
}

function validateSession_(token) {
  token = clean_(token);
  if (!token) return { valid: false, message: 'Sesi tidak valid. Silakan login ulang.' };

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.SESSION);
  const rows = getDataRows_(sheet);
  const index = rows.findIndex(function (row) {
    return String(row[0]) === token;
  });

  if (index === -1) return { valid: false, message: 'Sesi tidak valid. Silakan login ulang.' };

  const row = rows[index];
  if (String(row[6]) !== STATUS.ACTIVE) return { valid: false, message: 'Sesi sudah habis. Silakan login ulang.' };

  const expiredAt = new Date(row[5]);
  if (expiredAt.getTime() < Date.now()) {
    sheet.getRange(index + 2, 7).setValue(STATUS.EXPIRED);
    return { valid: false, message: 'Sesi sudah habis. Silakan login ulang.' };
  }

  return {
    valid: true,
    username: row[1],
    nama: row[2],
    role: row[3]
  };
}

function getOrCreateSheet_(ss, sheetName) {
  return ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
}

function getDataRows_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
}

function getDisplayDataRows_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
}

function seedJurusan_(sheet) {
  if (sheet.getLastRow() > 1) return;
  sheet.getRange(2, 1, 7, 4).setValues([
    [1, 'Teknik Kendaraan Ringan', 'TKR', 'Aktif'],
    [2, 'Teknik Sepeda Motor', 'TSM', 'Aktif'],
    [3, 'Teknik Alat Berat', 'TAB', 'Aktif'],
    [4, 'Teknik Instalasi Tenaga Listrik', 'TITL', 'Aktif'],
    [5, 'Teknik Komputer dan Jaringan', 'TKJ', 'Aktif'],
    [6, 'Desain Komunikasi Visual', 'DKV', 'Aktif'],
    [7, 'Bisnis Retail', 'BR', 'Aktif']
  ]);
}

function seedAdmin_(sheet) {
  if (sheet.getLastRow() > 1) return;
  sheet.getRange(2, 1, 1, 8).setValues([[
    'ADM001', 'Admin Utama', 'admin', 'GantiPasswordIni123',
    'Super Admin', 'Aktif', '', 'Admin awal. Segera ganti password.'
  ]]);
}

function seedKonfigurasi_(sheet) {
  if (sheet.getLastRow() > 1) return;
  sheet.getRange(2, 1, 10, 3).setValues([
    ['nama_sekolah', 'SMKN 2 Marabahan', 'Nama sekolah'],
    ['nama_aplikasi', 'Hadir SPMB', 'Nama pendek aplikasi'],
    ['judul_aplikasi', 'Daftar Hadir Verifikasi Berkas SPMB', 'Judul utama aplikasi'],
    ['tahun_spmb', '2026', 'Tahun pelaksanaan SPMB'],
    ['status_aplikasi', 'Aktif', 'Aktif / Nonaktif'],
    ['token_expired_hours', '10', 'Lama token admin berlaku dalam jam'],
    ['timezone', 'Asia/Makassar', 'Zona waktu aplikasi'],
    ['default_status_verifikasi', 'Menunggu Verifikasi', 'Status awal submit'],
    ['url_github_pages', '', 'URL frontend GitHub Pages'],
    ['url_spreadsheet', SpreadsheetApp.getActiveSpreadsheet().getUrl(), 'URL spreadsheet database']
  ]);
}

function getConfig_() {
  const rows = getDataRows_(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.KONFIGURASI));
  return rows.reduce(function (config, row) {
    config[row[0]] = row[1];
    return config;
  }, {});
}

function generatePendaftarId_(sheet, year) {
  const nextNumber = Math.max(sheet.getLastRow(), 1);
  return 'SPMB-' + year + '-' + String(nextNumber).padStart(4, '0');
}

function generateToken_() {
  return Utilities.getUuid() + '-' + Utilities.getUuid();
}

function writeLog_(action, dataId, username, nama, role, detail) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.LOG).appendRow([
    new Date(), action, dataId || '', username || '', nama || '', role || '', detail || ''
  ]);
}

function clean_(value) {
  return String(value || '').trim();
}

function isPhoneValid_(value) {
  const text = clean_(value);
  const digits = text.replace(/\D/g, '');
  return /^(08|\+62)/.test(text) && digits.length >= 10;
}

function formatValue_(value, timezone) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
    return Utilities.formatDate(value, timezone || 'Asia/Makassar', 'yyyy-MM-dd HH:mm:ss');
  }
  return value || '';
}

function formatDateOnly_(value, timezone) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
    return Utilities.formatDate(value, timezone || 'Asia/Makassar', 'yyyy-MM-dd');
  }
  return value || '';
}

function formatTimeOnly_(value, timezone) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
    return Utilities.formatDate(value, timezone || 'Asia/Makassar', 'HH:mm');
  }
  return value || '';
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function error_(message) {
  return { status: 'error', message: message };
}

function getErrorMessage_(err) {
  if (!err) return 'Unknown error';
  return err.message || String(err);
}
