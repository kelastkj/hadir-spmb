# PRD Aplikasi Daftar Hadir dan Verifikasi Berkas SPMB
## SMKN 2 Marabahan

## 1. Ringkasan Produk

Aplikasi ini digunakan untuk membantu proses daftar hadir dan verifikasi berkas calon siswa baru pada kegiatan SPMB di SMKN 2 Marabahan.

Calon siswa yang datang ke sekolah mengambil nomor antrian terlebih dahulu. Setelah itu calon siswa diarahkan untuk scan QR Code yang membuka halaman form daftar hadir. Calon siswa mengisi nomor antrian, biodata dasar, asal sekolah, nomor HP, dan 3 pilihan jurusan.

Data yang dikirim dari form akan masuk ke Google Spreadsheet melalui Google Apps Script. Panitia dapat membuka halaman admin untuk melihat data, mencari nomor antrian, memverifikasi berkas, memberi catatan, dan melihat rekap sederhana.

Aplikasi dibuat sederhana, ringan, mudah dirawat, dan cocok untuk sekolah.

## 2. Nama Produk

Nama produk:

**Hadir Verifikasi SPMB SMKN 2 Marabahan**

Nama pendek:

**Hadir SPMB**

## 3. Tujuan Produk

Aplikasi ini bertujuan untuk:

1. Membuat daftar hadir verifikasi berkas menjadi digital.
2. Mengurangi daftar hadir manual berbasis kertas.
3. Memudahkan calon siswa mengisi data saat menunggu antrian.
4. Memudahkan panitia mencari data berdasarkan nomor antrian, nama, NISN, atau asal sekolah.
5. Mencatat 3 pilihan jurusan calon siswa.
6. Membantu panitia mengubah status verifikasi berkas.
7. Menyediakan catatan jika berkas kurang atau perlu diperbaiki.
8. Membuat data mudah direkap melalui Google Spreadsheet.
9. Menjaga data admin agar tidak bisa diakses oleh pengguna yang tidak login.

## 4. Stack Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | HTML, JavaScript, Tailwind CSS |
| Hosting Frontend | GitHub Pages |
| Backend/API | Google Apps Script Web App |
| Database | Google Spreadsheet |
| QR Code | Link menuju GitHub Pages |
| Autentikasi Admin | Username, password, dan token session dari Apps Script |

## 5. Prinsip Utama Sistem

Alur utama aplikasi:

```text
Calon siswa datang
→ Ambil nomor antrian
→ Scan QR Code
→ Isi daftar hadir
→ Data masuk Google Spreadsheet
→ Panitia buka halaman admin
→ Panitia cari berdasarkan nomor antrian
→ Panitia verifikasi berkas
→ Status diperbarui
```

Prinsip penting:

1. Nomor antrian bukan ID unik.
2. Nomor antrian boleh digunakan ulang jika habis atau digunakan kembali pada hari berikutnya.
3. NISN menjadi identitas utama untuk mencegah data ganda.
4. Setiap data memiliki ID otomatis.
5. NIK tidak digunakan.
6. Data admin tidak boleh bisa diakses tanpa login.
7. Keamanan data dilakukan di backend Google Apps Script, bukan hanya di HTML.

## 6. Pengguna Sistem

### 6.1 Calon Siswa / Orang Tua

Calon siswa atau orang tua mengisi form daftar hadir melalui QR Code.

Hak akses:

1. Membuka halaman form daftar hadir.
2. Mengisi data calon siswa.
3. Mengirim data.
4. Melihat pesan berhasil atau gagal.

Tidak memiliki akses:

1. Melihat data calon siswa lain.
2. Melihat dashboard admin.
3. Mengubah status verifikasi.
4. Mengakses spreadsheet.

### 6.2 Panitia Verifikasi

Panitia menggunakan halaman admin untuk membantu proses verifikasi berkas.

Hak akses:

1. Login ke halaman admin.
2. Melihat data pendaftar.
3. Mencari data berdasarkan nomor antrian, nama, NISN, atau asal sekolah.
4. Melihat detail calon siswa.
5. Mengubah status verifikasi.
6. Menulis catatan panitia.

### 6.3 Admin

Admin memiliki akses lebih luas dibanding panitia.

Hak akses:

1. Login ke halaman admin.
2. Melihat semua data.
3. Mencari dan memfilter data.
4. Mengubah status verifikasi.
5. Menulis catatan panitia.
6. Melihat rekap.
7. Membuka link spreadsheet jika diizinkan.

### 6.4 Super Admin

Super Admin adalah pengelola utama sistem.

Hak akses:

1. Semua akses admin.
2. Mengelola akun admin/panitia melalui sheet `Admin`.
3. Mengaktifkan atau menonaktifkan akun.
4. Mengubah daftar jurusan di sheet `Jurusan`.
5. Mengelola konfigurasi aplikasi.
6. Melakukan backup data.

## 7. Ruang Lingkup MVP

Fitur yang wajib ada pada versi awal:

1. Form daftar hadir calon siswa.
2. Input nomor antrian.
3. Input biodata calon siswa tanpa NIK.
4. Input 3 pilihan jurusan.
5. Validasi data wajib.
6. Validasi NISN.
7. Validasi pilihan jurusan tidak boleh sama.
8. Cek NISN duplikat.
9. Simpan data ke Google Spreadsheet.
10. Halaman admin.
11. Login admin dengan username dan password.
12. Akun admin dikelola dari Google Spreadsheet.
13. Token session untuk keamanan akses admin.
14. Tabel data admin.
15. Pencarian data.
16. Filter data.
17. Detail calon siswa.
18. Update status verifikasi.
19. Catatan panitia.
20. Rekap sederhana.
21. Audit log sederhana.

## 8. Fitur yang Tidak Masuk MVP

Fitur berikut tidak dibuat pada versi awal:

1. Upload berkas digital.
2. Login calon siswa.
3. Nomor antrian digital otomatis.
4. Pemanggil antrian otomatis.
5. Notifikasi WhatsApp.
6. Integrasi Dapodik.
7. Cetak kartu verifikasi.
8. Tanda tangan digital.
9. Multi-cabang lokasi verifikasi.
10. Role permission yang sangat kompleks.

Fitur tersebut dapat dikembangkan pada versi berikutnya.

## 9. Alur Calon Siswa

1. Calon siswa datang ke sekolah.
2. Calon siswa mengambil nomor antrian fisik.
3. Panitia mengarahkan untuk scan QR Code.
4. QR Code membuka halaman `index.html` di GitHub Pages.
5. Calon siswa mengisi form daftar hadir.
6. Calon siswa memilih 3 jurusan.
7. Calon siswa menekan tombol kirim.
8. Frontend melakukan validasi awal.
9. Data dikirim ke Google Apps Script.
10. Apps Script mengecek duplikasi NISN.
11. Jika valid, data disimpan ke sheet `Pendaftar`.
12. Sistem menampilkan pesan berhasil.
13. Calon siswa menunggu panggilan panitia.

## 10. Alur Admin/Panitia

1. Admin membuka halaman `admin.html`.
2. Jika belum login, sistem menampilkan form login.
3. Admin memasukkan username dan password.
4. Data login dikirim ke Apps Script.
5. Apps Script mengecek akun di sheet `Admin`.
6. Jika valid, Apps Script membuat token session.
7. Token disimpan di sheet `Session` dan dikirim ke frontend.
8. Frontend menyimpan token di `sessionStorage`.
9. Admin dapat melihat dashboard.
10. Admin mencari calon siswa berdasarkan nomor antrian.
11. Admin membuka detail calon siswa.
12. Admin memeriksa berkas fisik.
13. Admin mengubah status verifikasi.
14. Apps Script memvalidasi token sebelum update.
15. Status, catatan, nama petugas, dan waktu update tersimpan.
16. Aksi dicatat di sheet `Log`.

## 11. Aturan Nomor Antrian

Nomor antrian digunakan sebagai penanda layanan, bukan identitas unik.

Aturan:

1. Nomor antrian wajib diisi.
2. Nomor antrian boleh sama.
3. Nomor antrian boleh digunakan ulang jika habis.
4. Nomor antrian boleh digunakan ulang keesokan harinya.
5. Sistem tidak boleh menolak data hanya karena nomor antrian sama.
6. Data dibedakan menggunakan ID otomatis, timestamp, tanggal hadir, jam hadir, nama, dan NISN.

Format nomor antrian yang disarankan:

```text
A001
A002
A003
```

Alternatif sederhana:

```text
001
002
003
```

## 12. Aturan Identitas Unik

Identitas unik utama adalah:

```text
NISN
```

Aturan NISN:

1. NISN wajib diisi.
2. NISN hanya boleh angka.
3. NISN sebaiknya 10 digit.
4. Satu NISN hanya boleh mengisi satu kali.
5. Jika NISN sudah ada, pengisian ditolak.
6. Jika terjadi kesalahan, perbaikan dilakukan oleh admin.

## 13. Field Form Calon Siswa

| No | Field | Tipe | Wajib | Keterangan |
|---|---|---|---|---|
| 1 | Nomor Antrian | Text | Ya | Nomor dari panitia |
| 2 | Nama Lengkap | Text | Ya | Nama calon siswa |
| 3 | NISN | Text | Ya | Identitas utama |
| 4 | Jenis Kelamin | Dropdown | Ya | Laki-laki / Perempuan |
| 5 | Tempat Lahir | Text | Tidak | Opsional |
| 6 | Tanggal Lahir | Date | Tidak | Opsional |
| 7 | Asal Sekolah | Text | Ya | SMP/MTs asal |
| 8 | Alamat | Textarea | Ya | Alamat calon siswa |
| 9 | Nomor HP | Text | Ya | Nomor siswa/orang tua |
| 10 | Pilihan Jurusan 1 | Dropdown | Ya | Pilihan utama |
| 11 | Pilihan Jurusan 2 | Dropdown | Ya | Pilihan kedua |
| 12 | Pilihan Jurusan 3 | Dropdown | Ya | Pilihan ketiga |

Field yang tidak digunakan:

```text
NIK
```

Alasan NIK dihilangkan:

1. Mengurangi pengumpulan data sensitif.
2. Mempercepat pengisian form.
3. NISN sudah cukup sebagai identitas utama untuk aplikasi ini.

## 14. Validasi Form

### 14.1 Validasi Wajib Isi

Field berikut wajib diisi:

1. Nomor antrian.
2. Nama lengkap.
3. NISN.
4. Jenis kelamin.
5. Asal sekolah.
6. Alamat.
7. Nomor HP.
8. Pilihan jurusan 1.
9. Pilihan jurusan 2.
10. Pilihan jurusan 3.

### 14.2 Validasi Pilihan Jurusan

Aturan:

1. Pilihan jurusan 1, 2, dan 3 tidak boleh sama.
2. Jika ada yang sama, data tidak boleh dikirim.

Pesan error:

```text
Pilihan jurusan 1, 2, dan 3 tidak boleh sama.
```

### 14.3 Validasi NISN

Aturan:

1. NISN hanya boleh angka.
2. NISN disarankan 10 digit.
3. NISN tidak boleh duplikat.

Pesan error duplikat:

```text
NISN ini sudah pernah mengisi daftar hadir. Silakan hubungi panitia jika ada kesalahan data.
```

### 14.4 Validasi Nomor HP

Aturan:

1. Nomor HP wajib diisi.
2. Nomor HP minimal 10 digit.
3. Nomor HP boleh diawali `08` atau `+62`.

## 15. Daftar Jurusan

Daftar jurusan disimpan pada sheet `Jurusan` agar mudah diedit tanpa mengubah kode.

Contoh awal:

1. Teknik Jaringan Komputer dan Telekomunikasi.
2. Teknik Kendaraan Ringan Otomotif.
3. Teknik Sepeda Motor.
4. Teknik Instalasi Tenaga Listrik.
5. Desain Komunikasi Visual.
6. Akuntansi dan Keuangan Lembaga.
7. Manajemen Perkantoran dan Layanan Bisnis.
8. Bisnis Digital.

Catatan:

Daftar jurusan harus disesuaikan kembali dengan jurusan resmi SMKN 2 Marabahan sebelum aplikasi digunakan.

## 16. Struktur Frontend

Frontend menggunakan HTML, JavaScript, dan Tailwind CSS.

Tailwind CSS digunakan melalui CDN agar sederhana:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

Alasan menggunakan Tailwind CSS:

1. Cepat dibuat.
2. Tampilan modern.
3. Mudah responsif.
4. Cocok untuk GitHub Pages.
5. Tidak perlu proses build.

## 17. Struktur Folder Frontend

```text
hadir-spmb-smkn2marabahan/
│
├── index.html
├── admin.html
├── README.md
│
├── js/
│   ├── script.js
│   └── admin.js
│
└── assets/
    └── logo.png
```

## 18. Halaman Form Publik

File:

```text
index.html
```

Isi halaman:

1. Header sekolah.
2. Judul aplikasi.
3. Instruksi singkat.
4. Form daftar hadir.
5. Tombol kirim.
6. Loading state.
7. Pesan sukses.
8. Pesan error.

Judul:

```text
Daftar Hadir Verifikasi Berkas SPMB
SMKN 2 Marabahan
```

Teks instruksi:

```text
Silakan isi daftar hadir ini setelah mengambil nomor antrian. Pastikan nomor antrian, biodata, dan pilihan jurusan diisi dengan benar.
```

## 19. Halaman Admin

File:

```text
admin.html
```

Komponen:

1. Form login admin.
2. Dashboard ringkasan.
3. Pencarian data.
4. Filter tanggal.
5. Filter status verifikasi.
6. Filter pilihan jurusan 1.
7. Tabel data.
8. Modal detail calon siswa.
9. Form update status.
10. Tombol logout.

## 20. Dashboard Admin

Ringkasan yang ditampilkan:

1. Total semua data.
2. Total hadir hari ini.
3. Menunggu verifikasi.
4. Sedang diverifikasi.
5. Berkas lengkap.
6. Berkas kurang.
7. Perlu perbaikan.
8. Selesai diverifikasi.
9. Batal / tidak dilanjutkan.

## 21. Tabel Admin

Kolom tabel utama:

1. Tanggal.
2. Jam.
3. Nomor antrian.
4. Nama lengkap.
5. NISN.
6. Asal sekolah.
7. Pilihan jurusan 1.
8. Status verifikasi.
9. Petugas.
10. Aksi.

Aksi:

1. Detail.
2. Update status.

## 22. Detail Calon Siswa

Detail menampilkan:

1. ID.
2. Timestamp.
3. Tanggal hadir.
4. Jam hadir.
5. Nomor antrian.
6. Nama lengkap.
7. NISN.
8. Jenis kelamin.
9. Tempat lahir.
10. Tanggal lahir.
11. Asal sekolah.
12. Alamat.
13. Nomor HP.
14. Pilihan jurusan 1.
15. Pilihan jurusan 2.
16. Pilihan jurusan 3.
17. Status verifikasi.
18. Catatan panitia.
19. Petugas verifikasi.
20. Waktu update status.

## 23. Status Verifikasi

Daftar status:

1. Menunggu Verifikasi.
2. Sedang Diverifikasi.
3. Berkas Lengkap.
4. Berkas Kurang.
5. Perlu Perbaikan.
6. Selesai Diverifikasi.
7. Batal / Tidak Dilanjutkan.

Status awal setelah submit:

```text
Menunggu Verifikasi
```

## 24. Struktur Google Spreadsheet

Nama spreadsheet:

```text
Database Hadir Verifikasi SPMB SMKN 2 Marabahan
```

Sheet yang digunakan:

```text
Pendaftar
Jurusan
Admin
Session
Log
Konfigurasi
```

## 25. Sheet Pendaftar

Sheet `Pendaftar` menyimpan data calon siswa.

| Kolom | Field |
|---|---|
| A | ID |
| B | Timestamp |
| C | Tanggal Hadir |
| D | Jam Hadir |
| E | Nomor Antrian |
| F | Nama Lengkap |
| G | NISN |
| H | Jenis Kelamin |
| I | Tempat Lahir |
| J | Tanggal Lahir |
| K | Asal Sekolah |
| L | Alamat |
| M | Nomor HP |
| N | Pilihan Jurusan 1 |
| O | Pilihan Jurusan 2 |
| P | Pilihan Jurusan 3 |
| Q | Status Verifikasi |
| R | Catatan Panitia |
| S | Petugas Verifikasi |
| T | Waktu Update Status |

## 26. Sheet Jurusan

Sheet `Jurusan` menyimpan daftar jurusan.

| Kolom | Field |
|---|---|
| A | No |
| B | Nama Jurusan |
| C | Kode Jurusan |
| D | Status |

Contoh status:

```text
Aktif
Nonaktif
```

## 27. Sheet Admin

Sheet `Admin` digunakan untuk mengelola akun admin dan panitia.

| Kolom | Field |
|---|---|
| A | ID Admin |
| B | Nama |
| C | Username |
| D | Password |
| E | Role |
| F | Status |
| G | Terakhir Login |
| H | Catatan |

Role:

1. Super Admin.
2. Admin.
3. Panitia.

Status:

1. Aktif.
2. Nonaktif.

Catatan keamanan:

Untuk MVP, password boleh disimpan di spreadsheet agar mudah dikelola. Namun spreadsheet tidak boleh dibagikan publik. Untuk versi lebih aman, password dapat dibuat menggunakan hash.

## 28. Sheet Session

Sheet `Session` digunakan untuk menyimpan token login admin.

| Kolom | Field |
|---|---|
| A | Token |
| B | Username |
| C | Nama |
| D | Role |
| E | Login At |
| F | Expired At |
| G | Status |

Status session:

1. Aktif.
2. Expired.
3. Logout.

Token berlaku 8 sampai 12 jam atau sampai jam kegiatan selesai.

## 29. Sheet Log

Sheet `Log` digunakan untuk audit aktivitas admin.

| Kolom | Field |
|---|---|
| A | Timestamp |
| B | Action |
| C | ID Data |
| D | Username |
| E | Nama Admin |
| F | Role |
| G | Detail |

Contoh action:

1. LOGIN.
2. LOGOUT.
3. SUBMIT.
4. UPDATE_STATUS.
5. GET_DATA.
6. CHECK_SESSION.

## 30. Sheet Konfigurasi

Sheet `Konfigurasi` menyimpan pengaturan aplikasi.

| Kolom | Field |
|---|---|
| A | Key |
| B | Value |
| C | Keterangan |

Contoh data:

| Key | Value | Keterangan |
|---|---|---|
| nama_sekolah | SMKN 2 Marabahan | Nama sekolah |
| nama_aplikasi | Hadir SPMB | Nama aplikasi |
| tahun_spmb | 2026 | Tahun kegiatan |
| status_aplikasi | Aktif | Aktif / Nonaktif |
| token_expired_hours | 10 | Lama token berlaku |
| timezone | Asia/Makassar | Zona waktu |

## 31. ID Otomatis

Setiap data pendaftar memiliki ID otomatis.

Format:

```text
SPMB-2026-0001
SPMB-2026-0002
SPMB-2026-0003
```

Fungsi ID:

1. Menjadi identitas unik baris data.
2. Digunakan saat update status.
3. Menghindari konflik nomor antrian yang sama.
4. Menghindari konflik nama yang sama.

## 32. Keamanan Sistem

Karena frontend menggunakan GitHub Pages, file HTML dan JavaScript bersifat publik. Oleh karena itu, keamanan utama wajib berada di Google Apps Script.

Prinsip keamanan:

```text
Frontend boleh publik, tetapi data admin harus dilindungi oleh backend.
```

Aturan wajib:

1. `admin.html` boleh terbuka, tetapi data tidak boleh tampil tanpa login.
2. Password admin tidak boleh ditulis di file JavaScript.
3. Spreadsheet tidak boleh dibagikan publik.
4. Semua request admin wajib menggunakan token session.
5. Token divalidasi di Apps Script.
6. Role tidak boleh dipercaya dari frontend.
7. Role harus dibaca dari token/session di backend.
8. Data sheet `Admin` tidak boleh dikirim ke frontend.
9. Data sheet `Session` tidak boleh dikirim ke frontend.
10. Request tanpa token harus ditolak.
11. Request dengan token palsu harus ditolak.
12. Request dengan token expired harus ditolak.
13. Logout harus mengubah status token menjadi `Logout`.

## 33. Penyimpanan Token di Frontend

Setelah login berhasil, frontend menyimpan token di:

```text
sessionStorage
```

Bukan `localStorage`.

Alasan:

1. Token hilang saat tab/browser ditutup.
2. Lebih cocok untuk sesi admin sementara.
3. Lebih aman untuk perangkat panitia yang digunakan bersama.

Data yang boleh disimpan:

```json
{
  "token": "random_token_panjang",
  "nama": "Panitia 1",
  "username": "panitia1",
  "role": "Panitia"
}
```

Data yang tidak boleh disimpan di frontend:

1. Password admin.
2. Isi sheet Admin.
3. Isi sheet Session.
4. Credential spreadsheet.
5. Data pendaftar sebelum login valid.

## 34. Endpoint Google Apps Script

Google Apps Script menjadi satu-satunya API.

Contoh URL:

```text
https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

### 34.1 Submit Daftar Hadir

Request:

```json
{
  "action": "submit",
  "nomorAntrian": "A001",
  "namaLengkap": "Ahmad Rizki",
  "nisn": "1234567890",
  "jenisKelamin": "Laki-laki",
  "tempatLahir": "Marabahan",
  "tanggalLahir": "2010-05-12",
  "asalSekolah": "SMPN 1 Marabahan",
  "alamat": "Jl. Veteran Marabahan",
  "nomorHp": "081234567890",
  "pilihan1": "Teknik Jaringan Komputer dan Telekomunikasi",
  "pilihan2": "Desain Komunikasi Visual",
  "pilihan3": "Teknik Kendaraan Ringan Otomotif"
}
```

Response sukses:

```json
{
  "status": "success",
  "message": "Data berhasil disimpan",
  "data": {
    "id": "SPMB-2026-0001",
    "nomorAntrian": "A001",
    "namaLengkap": "Ahmad Rizki",
    "statusVerifikasi": "Menunggu Verifikasi"
  }
}
```

Response gagal:

```json
{
  "status": "error",
  "message": "NISN ini sudah pernah mengisi daftar hadir."
}
```

### 34.2 Login Admin

Request:

```json
{
  "action": "login",
  "username": "panitia1",
  "password": "pass12345"
}
```

Response sukses:

```json
{
  "status": "success",
  "message": "Login berhasil",
  "token": "random_token_panjang",
  "admin": {
    "nama": "Panitia 1",
    "username": "panitia1",
    "role": "Panitia"
  }
}
```

### 34.3 Check Session

Request:

```json
{
  "action": "checkSession",
  "token": "random_token_panjang"
}
```

Response sukses:

```json
{
  "status": "success",
  "message": "Session valid",
  "admin": {
    "nama": "Panitia 1",
    "username": "panitia1",
    "role": "Panitia"
  }
}
```

### 34.4 Get Data Admin

Request:

```json
{
  "action": "getData",
  "token": "random_token_panjang"
}
```

Response jika token valid:

```json
{
  "status": "success",
  "data": []
}
```

Response jika token tidak valid:

```json
{
  "status": "error",
  "message": "Sesi tidak valid. Silakan login ulang."
}
```

### 34.5 Update Status

Request:

```json
{
  "action": "updateStatus",
  "token": "random_token_panjang",
  "id": "SPMB-2026-0001",
  "statusVerifikasi": "Berkas Lengkap",
  "catatanPanitia": ""
}
```

Response sukses:

```json
{
  "status": "success",
  "message": "Status berhasil diperbarui."
}
```

### 34.6 Logout

Request:

```json
{
  "action": "logout",
  "token": "random_token_panjang"
}
```

Response sukses:

```json
{
  "status": "success",
  "message": "Logout berhasil."
}
```

## 35. QR Code

QR Code diarahkan ke URL GitHub Pages.

Contoh:

```text
https://username.github.io/hadir-spmb-smkn2marabahan/
```

QR Code ditempel di:

1. Meja pengambilan nomor antrian.
2. Area tunggu.
3. Papan informasi.
4. Dekat meja panitia.

Teks pendamping QR Code:

```text
Sudah mengambil nomor antrian?
Scan QR Code ini untuk mengisi daftar hadir verifikasi berkas SPMB SMKN 2 Marabahan.
```

## 36. Pesan Sistem

### 36.1 Pesan Berhasil

```text
Data berhasil dikirim.
Nomor Antrian: A001
Nama: Ahmad Rizki
Status: Menunggu Verifikasi
Silakan menunggu panggilan dari panitia.
```

### 36.2 Pesan NISN Duplikat

```text
NISN ini sudah pernah mengisi daftar hadir. Silakan hubungi panitia jika ada kesalahan data.
```

### 36.3 Pesan Jurusan Sama

```text
Pilihan jurusan 1, 2, dan 3 tidak boleh sama.
```

### 36.4 Pesan Gagal Koneksi

```text
Data belum berhasil dikirim. Periksa koneksi internet, lalu coba lagi.
```

### 36.5 Pesan Session Habis

```text
Sesi sudah habis. Silakan login ulang.
```

## 37. Kriteria Keberhasilan

Aplikasi dianggap berhasil jika:

1. QR Code membuka form daftar hadir.
2. Calon siswa dapat mengisi form melalui HP.
3. Data masuk ke Google Spreadsheet.
4. NISN duplikat ditolak.
5. Nomor antrian yang sama tetap bisa digunakan.
6. Admin bisa login menggunakan akun dari sheet `Admin`.
7. Akun Nonaktif tidak bisa login.
8. Admin tanpa token tidak bisa melihat data.
9. Token palsu ditolak.
10. Token expired ditolak.
11. Admin bisa mencari data.
12. Admin bisa update status.
13. Nama petugas otomatis tersimpan.
14. Log aktivitas tercatat.
15. Spreadsheet tidak dapat diakses publik.

## 38. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Siswa salah input nomor antrian | Panitia sulit mencari | Cari berdasarkan nama/NISN dan edit manual jika perlu |
| Nomor antrian digunakan ulang | Data terlihat mirip | Gunakan ID otomatis, timestamp, tanggal, dan NISN |
| Siswa mengisi dua kali | Data dobel | Cek duplikasi NISN |
| Internet lambat | Submit terganggu | Form ringan dan sediakan perangkat cadangan |
| Password admin bocor | Data bisa diakses | Ganti password dan nonaktifkan akun |
| Spreadsheet dibagikan publik | Data bocor | Batasi akses spreadsheet hanya ke admin utama |
| Token dicuri dari perangkat | Data bisa diakses sementara | Gunakan sessionStorage dan logout setelah selesai |
| Apps Script error | Sistem tidak berjalan | Siapkan daftar hadir manual sebagai backup |

## 39. Rencana Pengerjaan

### Tahap 1: Setup Spreadsheet

1. Buat project Google Apps Script.
2. Jalankan fungsi `setupDatabse()`.
3. Pastikan sheet berikut terbuat:
   - Pendaftar
   - Jurusan
   - Admin
   - Session
   - Log
   - Konfigurasi

### Tahap 2: Backend Apps Script

Buat fungsi:

1. `doPost(e)`
2. `submitData(payload)`
3. `loginAdmin(payload)`
4. `checkSession(payload)`
5. `getData(payload)`
6. `updateStatus(payload)`
7. `logout(payload)`
8. `validateSession(token)`
9. `generateToken()`
10. `generatePendaftarId()`
11. `writeLog()`

### Tahap 3: Frontend Form

Buat:

1. `index.html`
2. `js/script.js`
3. Form Tailwind CSS.
4. Validasi frontend.
5. Submit ke Apps Script.

### Tahap 4: Frontend Admin

Buat:

1. `admin.html`
2. `js/admin.js`
3. Login admin.
4. Check session.
5. Dashboard admin.
6. Tabel data.
7. Modal detail.
8. Update status.
9. Logout.

### Tahap 5: Deploy

1. Deploy Apps Script sebagai Web App.
2. Set Web App agar bisa diakses oleh frontend.
3. Upload frontend ke GitHub.
4. Aktifkan GitHub Pages.
5. Pasang URL Apps Script di JavaScript.
6. Buat QR Code.
7. Uji coba.

## 40. Script Setup Database Google Apps Script

Script berikut digunakan untuk membuat sheet dan field secara otomatis di Google Spreadsheet.

> Catatan: nama fungsi sengaja dibuat `setupDatabse()` sesuai permintaan. Disediakan juga alias `setupDatabase()` agar jika nanti ingin menggunakan ejaan yang benar tetap bisa dipanggil.

```javascript
/**
 * Setup database untuk aplikasi Hadir Verifikasi SPMB SMKN 2 Marabahan.
 * Jalankan fungsi setupDatabse() satu kali dari Google Apps Script.
 *
 * Catatan:
 * - Fungsi ini akan membuat sheet jika belum ada.
 * - Fungsi ini akan mengisi header.
 * - Fungsi ini akan membuat contoh jurusan, admin awal, dan konfigurasi.
 * - Fungsi ini tidak menghapus data lama pada sheet yang sudah ada.
 */
function setupDatabse() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const timezone = 'Asia/Makassar';

  const sheets = {
    pendaftar: 'Pendaftar',
    jurusan: 'Jurusan',
    admin: 'Admin',
    session: 'Session',
    log: 'Log',
    konfigurasi: 'Konfigurasi'
  };

  const headers = {
    Pendaftar: [
      'ID',
      'Timestamp',
      'Tanggal Hadir',
      'Jam Hadir',
      'Nomor Antrian',
      'Nama Lengkap',
      'NISN',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Asal Sekolah',
      'Alamat',
      'Nomor HP',
      'Pilihan Jurusan 1',
      'Pilihan Jurusan 2',
      'Pilihan Jurusan 3',
      'Status Verifikasi',
      'Catatan Panitia',
      'Petugas Verifikasi',
      'Waktu Update Status'
    ],
    Jurusan: [
      'No',
      'Nama Jurusan',
      'Kode Jurusan',
      'Status'
    ],
    Admin: [
      'ID Admin',
      'Nama',
      'Username',
      'Password',
      'Role',
      'Status',
      'Terakhir Login',
      'Catatan'
    ],
    Session: [
      'Token',
      'Username',
      'Nama',
      'Role',
      'Login At',
      'Expired At',
      'Status'
    ],
    Log: [
      'Timestamp',
      'Action',
      'ID Data',
      'Username',
      'Nama Admin',
      'Role',
      'Detail'
    ],
    Konfigurasi: [
      'Key',
      'Value',
      'Keterangan'
    ]
  };

  Object.keys(sheets).forEach(function (key) {
    const sheetName = sheets[key];
    const sheet = getOrCreateSheet_(ss, sheetName);
    setupHeader_(sheet, headers[sheetName]);
    styleSheet_(sheet, headers[sheetName].length);
  });

  seedJurusan_(ss.getSheetByName(sheets.jurusan));
  seedAdmin_(ss.getSheetByName(sheets.admin));
  seedKonfigurasi_(ss.getSheetByName(sheets.konfigurasi), timezone);

  SpreadsheetApp.flush();

  Logger.log('Setup database selesai. Sheet berhasil disiapkan.');
}

/**
 * Alias dengan ejaan yang benar.
 * Boleh dipakai jika nanti ingin memanggil setupDatabase().
 */
function setupDatabase() {
  setupDatabse();
}

function getOrCreateSheet_(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function setupHeader_(sheet, headerValues) {
  const headerRange = sheet.getRange(1, 1, 1, headerValues.length);
  const existingHeader = headerRange.getValues()[0];
  const hasHeader = existingHeader.some(function (value) {
    return value !== '';
  });

  if (!hasHeader) {
    headerRange.setValues([headerValues]);
  } else {
    // Tetap pastikan header sesuai struktur terbaru.
    headerRange.setValues([headerValues]);
  }

  sheet.setFrozenRows(1);
}

function styleSheet_(sheet, columnCount) {
  const headerRange = sheet.getRange(1, 1, 1, columnCount);
  headerRange
    .setFontWeight('bold')
    .setBackground('#1e3a8a')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sheet.autoResizeColumns(1, columnCount);

  const lastRow = Math.max(sheet.getMaxRows(), 100);
  const fullRange = sheet.getRange(1, 1, lastRow, columnCount);
  fullRange.setBorder(true, true, true, true, true, true, '#d1d5db', SpreadsheetApp.BorderStyle.SOLID);
}

function seedJurusan_(sheet) {
  if (sheet.getLastRow() > 1) return;

  const jurusan = [
    [1, 'Teknik Jaringan Komputer dan Telekomunikasi', 'TJKT', 'Aktif'],
    [2, 'Teknik Kendaraan Ringan Otomotif', 'TKRO', 'Aktif'],
    [3, 'Teknik Sepeda Motor', 'TSM', 'Aktif'],
    [4, 'Teknik Instalasi Tenaga Listrik', 'TITL', 'Aktif'],
    [5, 'Desain Komunikasi Visual', 'DKV', 'Aktif'],
    [6, 'Akuntansi dan Keuangan Lembaga', 'AKL', 'Aktif'],
    [7, 'Manajemen Perkantoran dan Layanan Bisnis', 'MPLB', 'Aktif'],
    [8, 'Bisnis Digital', 'BD', 'Aktif']
  ];

  sheet.getRange(2, 1, jurusan.length, jurusan[0].length).setValues(jurusan);
}

function seedAdmin_(sheet) {
  if (sheet.getLastRow() > 1) return;

  const admin = [
    [
      'ADM001',
      'Wibowo Laksono',
      'admin',
      'GantiPasswordIni123',
      'Super Admin',
      'Aktif',
      '',
      'Admin awal. Segera ganti password setelah setup.'
    ]
  ];

  sheet.getRange(2, 1, admin.length, admin[0].length).setValues(admin);
}

function seedKonfigurasi_(sheet, timezone) {
  if (sheet.getLastRow() > 1) return;

  const konfigurasi = [
    ['nama_sekolah', 'SMKN 2 Marabahan', 'Nama sekolah'],
    ['nama_aplikasi', 'Hadir SPMB', 'Nama pendek aplikasi'],
    ['judul_aplikasi', 'Daftar Hadir Verifikasi Berkas SPMB', 'Judul utama aplikasi'],
    ['tahun_spmb', '2026', 'Tahun pelaksanaan SPMB'],
    ['status_aplikasi', 'Aktif', 'Aktif / Nonaktif'],
    ['token_expired_hours', '10', 'Lama token admin berlaku dalam jam'],
    ['timezone', timezone, 'Zona waktu aplikasi'],
    ['default_status_verifikasi', 'Menunggu Verifikasi', 'Status awal setelah calon siswa submit'],
    ['url_github_pages', '', 'URL frontend GitHub Pages'],
    ['url_spreadsheet', SpreadsheetApp.getActiveSpreadsheet().getUrl(), 'URL spreadsheet database']
  ];

  sheet.getRange(2, 1, konfigurasi.length, konfigurasi[0].length).setValues(konfigurasi);
}
```

## 41. Catatan Penggunaan Script Setup

Langkah penggunaan:

1. Buat Google Spreadsheet baru.
2. Buka menu `Extensions`.
3. Pilih `Apps Script`.
4. Tempel script setup di atas.
5. Simpan project.
6. Jalankan fungsi:

```text
setupDatabse
```

7. Berikan izin akses jika diminta Google.
8. Kembali ke Spreadsheet.
9. Pastikan sheet berikut sudah muncul:

```text
Pendaftar
Jurusan
Admin
Session
Log
Konfigurasi
```

10. Ganti password admin awal pada sheet `Admin`.

Admin awal:

```text
Username: admin
Password: GantiPasswordIni123
```

Password tersebut wajib diganti sebelum aplikasi digunakan.

## 42. Catatan Akhir

Aplikasi ini sengaja dibuat sederhana tetapi tetap memperhatikan keamanan dasar.

Halaman HTML di GitHub Pages tidak boleh dianggap aman untuk menyimpan data penting. Semua data penting, validasi admin, token session, dan update status harus dikendalikan oleh Google Apps Script.

Dengan rancangan ini, aplikasi tetap ringan, mudah dibuat, mudah dipelihara, dan cukup aman untuk kebutuhan daftar hadir serta verifikasi berkas SPMB di lingkungan sekolah.
