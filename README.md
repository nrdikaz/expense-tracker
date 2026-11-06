# Dompetku — Expense Tracker

Website pencatat pemasukan dan pengeluaran harian dengan tampilan responsif dan seluruh teks berbahasa Indonesia.

## Fitur

### 20 fitur tambahan

1. Kalkulator dengan operasi dasar dan tanda kurung.
2. Ikon SVG untuk tiap kategori transaksi.
3. Tema otomatis yang mengikuti pengaturan perangkat.
4. Pilihan warna aksen.
5. Tampilan tabel ringkas.
6. Sembunyikan nominal di layar.
7. Pilih jenis transaksi awal.
8. Pintasan keyboard: `N` untuk transaksi, `/` untuk pencarian, `?` untuk kalkulator.
9. Buat dan kelola kategori khusus.
10. Tambahkan catatan pada transaksi.
11. Atur batas pengeluaran bulanan.
12. Atur batas pengeluaran per kategori.
13. Pantau target tabungan bulanan.
14. Ulangi transaksi mingguan atau bulanan.
15. Salin transaksi yang sudah ada.
16. Urungkan penghapusan transaksi.
17. Unduh cadangan data ke JSON.
18. Pulihkan data dari cadangan JSON.
19. Cetak laporan.
20. Urutkan transaksi berdasarkan tanggal, jumlah, atau nama.

### Fitur lainnya

- Ringkasan saldo, pemasukan, pengeluaran, dan sisa uang berdasarkan bulan yang dipilih.
- Grafik arus keuangan enam bulan terakhir dan ringkasan pengeluaran per kategori.
- Tambah, edit, hapus, cari, dan filter transaksi.
- Ekspor transaksi yang sedang ditampilkan ke CSV.
- Penyimpanan otomatis di browser menggunakan `localStorage`.
- Aplikasi dimulai tanpa transaksi, sehingga saldo awal Rp0.

## Menjalankan

Tidak perlu memasang dependensi. Buka `index.html` di browser, atau jalankan server lokal sederhana dari folder project:

```bash
python -m http.server 8000
```

Kemudian buka <http://localhost:8000>.

Data transaksi dan pengaturan disimpan di browser pada perangkat yang digunakan dan tidak dikirim ke server. Gunakan cadangan JSON untuk memindahkan data ke perangkat lain. Transaksi contoh versi lama yang tersimpan akan diabaikan.

## Struktur

```text
index.html   Struktur halaman
style.css    Tampilan dan layout responsif
app.js       Logika transaksi, grafik, dan penyimpanan
```
