# Hadir SPMB SMKN 2 Marabahan

Aplikasi daftar hadir dan verifikasi berkas SPMB untuk SMKN 2 Marabahan. Aplikasi ini dibuat sebagai frontend statis yang bisa dipasang di GitHub Pages, dengan Google Apps Script sebagai API dan Google Spreadsheet sebagai database.

## Fitur Utama

- Form daftar hadir calon siswa melalui `index.html`.
- Input nomor antrian, biodata, asal sekolah, nomor HP, dan 3 pilihan jurusan.
- Validasi frontend untuk NISN, nomor HP, dan pilihan jurusan agar tidak sama.
- Cek duplikasi NISN di backend Google Apps Script.
- Bukti pengisian daftar hadir yang bisa disimpan sebagai gambar.
- Dashboard panitia melalui `admin.html`.
- Login admin/panitia dengan token session dari Google Apps Script.
- Ringkasan jumlah pendaftar, hadir hari ini, status verifikasi, dan peminat jurusan.
- Pencarian dan filter data berdasarkan nama, NISN, nomor antrian, asal sekolah, tanggal, status, dan jurusan.
- Detail data calon siswa dan update status verifikasi.
- Batch update status untuk beberapa pendaftar.
- Audit log sederhana di Google Spreadsheet.

## Stack Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | HTML, JavaScript, Tailwind CSS CDN |
| Ikon admin | Font Awesome CDN |
| Bukti hadir | html2canvas CDN |
| Backend/API | Google Apps Script Web App |
| Database | Google Spreadsheet |
| Hosting frontend | GitHub Pages atau web server statis |

## Struktur Proyek

```text
.
|-- index.html                  # Halaman form daftar hadir calon siswa
|-- admin.html                  # Dashboard admin/panitia
|-- js/
|   |-- config.js               # Konfigurasi URL Apps Script dan metadata aplikasi
|   |-- api.js                  # Client API dan fallback demo lokal
|   |-- script.js               # Logika form publik
|   `-- admin.js                # Logika dashboard admin
|-- assets/
|   `-- logo.png                # Logo sekolah
|-- apps-script/
|   `-- Code.gs                 # Backend Google Apps Script
`-- PRD_Hadir_SPMB_SMKN2_Marabahan.md
```

## Cara Menjalankan di Lokal

Jika folder ini berada di Laragon dengan nama `hadir-spmb`, buka:

```text
http://localhost/hadir-spmb/
```

Halaman yang tersedia:

- `http://localhost/hadir-spmb/` untuk form calon siswa.
- `http://localhost/hadir-spmb/admin.html` untuk dashboard panitia.

Jika `APPS_SCRIPT_URL` di `js/config.js` kosong dan `DEMO_MODE` bernilai `true`, aplikasi memakai mode demo lokal. Data demo tersimpan di browser melalui `localStorage` dan `sessionStorage`, bukan di Google Spreadsheet.

## Konfigurasi Frontend

Edit file `js/config.js`:

```javascript
window.APP_CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/DEPLOYMENT_ID/exec',
  SCHOOL_NAME: 'SMKN 2 Marabahan',
  APP_NAME: 'Hadir SPMB',
  SPMB_YEAR: '2026',
  TIMEZONE: 'Asia/Makassar',
  DEMO_MODE: true
};
```

Catatan:

- Jika `APPS_SCRIPT_URL` diisi, aplikasi mengirim data ke Google Apps Script.
- Jika `APPS_SCRIPT_URL` kosong dan `DEMO_MODE: true`, aplikasi berjalan dalam mode demo lokal.
- `DEMO_MODE` tidak memaksa mode demo selama `APPS_SCRIPT_URL` sudah diisi.

## Setup Google Spreadsheet dan Apps Script

1. Buat Google Spreadsheet baru.
2. Buka menu `Extensions` > `Apps Script`.
3. Salin isi `apps-script/Code.gs` ke editor Apps Script.
4. Simpan project.
5. Jalankan fungsi `setupDatabase()` satu kali dari editor Apps Script.
6. Berikan izin akses saat diminta oleh Google.
7. Pastikan sheet berikut dibuat:
   - `Pendaftar`
   - `Jurusan`
   - `Admin`
   - `Session`
   - `Log`
   - `Konfigurasi`
8. Ganti password admin awal di sheet `Admin`.

Akun admin awal:

```text
Username: admin
Password: GantiPasswordIni123
```

## Deploy Google Apps Script

1. Klik `Deploy` > `New deployment`.
2. Pilih type `Web app`.
3. Isi pengaturan:
   - `Execute as`: akun pemilik spreadsheet.
   - `Who has access`: `Anyone`.
4. Klik `Deploy`.
5. Salin URL Web App.
6. Tempel URL tersebut ke `APPS_SCRIPT_URL` di `js/config.js`.
7. Buka ulang `index.html` dan coba kirim satu data uji.

## Deploy ke GitHub Pages

1. Push repository ini ke GitHub.
2. Buka `Settings` > `Pages`.
3. Pada `Build and deployment`, pilih `Deploy from a branch`.
4. Pilih branch utama, misalnya `main`, dan folder `/root`.
5. Simpan pengaturan.
6. Gunakan URL GitHub Pages sebagai tujuan QR Code SPMB.

## Alur Penggunaan

### Calon Siswa

1. Calon siswa mengambil nomor antrian fisik.
2. Calon siswa scan QR Code yang mengarah ke halaman form.
3. Calon siswa mengisi data dan 3 pilihan jurusan.
4. Sistem memvalidasi data dan mengirimnya ke Spreadsheet.
5. Calon siswa menyimpan bukti pengisian daftar hadir.
6. Calon siswa menunjukkan bukti saat dipanggil panitia.

### Panitia

1. Panitia membuka `admin.html`.
2. Panitia login menggunakan akun di sheet `Admin`.
3. Panitia mencari data calon siswa.
4. Panitia membuka detail pendaftar.
5. Panitia memperbarui status verifikasi dan catatan.
6. Perubahan tersimpan di sheet `Pendaftar` dan tercatat di sheet `Log`.

## Status Verifikasi

Status bawaan aplikasi:

- `Menunggu Verifikasi`
- `Sedang Diverifikasi`
- `Berkas Lengkap`
- `Berkas Kurang`
- `Perlu Perbaikan`
- `Selesai Diverifikasi`
- `Batal / Tidak Dilanjutkan`

## Keamanan dan Catatan Operasional

- Frontend di GitHub Pages bersifat publik, jadi jangan menyimpan password rahasia, token permanen, atau data sensitif di file HTML/JavaScript.
- Validasi akses admin dilakukan di Google Apps Script menggunakan token session.
- Password admin awal wajib diganti setelah setup.
- Batasi akses Google Spreadsheet hanya untuk pengelola yang berwenang.
- Backup Spreadsheet secara berkala selama masa SPMB.
- Nomor antrian bukan ID unik. Identitas pendaftar dicegah duplikatnya menggunakan NISN.

## Lisensi

Proyek ini dibuat untuk kebutuhan operasional SPMB SMKN 2 Marabahan.
