# 🚀 PokeExplorer App - React Native API Consumption

Aplikasi penjelajah data Pokémon berbasis Android/iOS yang dibangun menggunakan **React Native (Expo)** dan mengonsumsi data dari **PokeAPI**. Aplikasi ini dirancang dengan performa optimal, penanganan status UI yang kuat, serta fitur-fitur eksplorasi tingkat lanjut untuk kebutuhan portofolio profesional.

---

## 🛠️ Tech Stack & API

*   **Framework:** React Native (Expo SDK)
*   **State Management:** React Hooks (`useState`, `useEffect`, `useRef`)
*   **Penyimpanan Lokal:** `@react-native-async-storage/async-storage`
*   **API Source:** [PokeAPI v2 (REST API)](https://pokeapi.co/)

---

## 🌟 Daftar Fitur (Capaian Project)

### 🟢 Level 1 — Fitur Wajib (Core)
*   [x] **Asynchronous Fetching:** Mengambil data dari REST API menggunakan `async/await` dan Native `fetch`.
*   [x] **Efisiensi Mount:** `useEffect` dengan dependency array `[]` memastikan pengambilan data hanya satu kali saat aplikasi dimuat.
*   [x] **3-State UI:** Indikator Loading (`ActivityIndicator`), Layar Error, dan Tampilan Sukses yang dinamis.
*   [x] **Robust Error Handling:** Menggunakan blok `try/catch/finally` untuk memastikan loading dimatikan dalam kondisi apa pun.
*   [x] **Optimasi List:** Menggunakan `FlatList` lengkap dengan `renderItem` dan `keyExtractor`.
*   [x] **Informasi Kartu Kaya Data:** Menampilkan minimal 3 field (Gambar Official Artwork, Nama, ID, dan Tipe).
*   [x] **Tombol Retry Teruji:** Tombol "Coba Lagi" yang berfungsi memicu fungsi fetching ulang saat koneksi terputus.

### 🟡 Level 2 — Pengembangan (Pilihan)
*   [x] **🔄 Pull-to-Refresh:** Menarik layar ke bawah untuk memuat ulang data dari urutan awal.
*   [x] **🔎 Search / Filter:** Komponen `TextInput` untuk melakukan pencarian lokal (client-side) berdasarkan nama atau tipe Pokémon.
*   [x] **📄 Layar Detail:** Mengetuk kartu Pokémon akan memunculkan *Modal Screen* yang menampilkan detail statistik fisik (tinggi, berat) dan kemampuan (*abilities*).
*   [x] **🎨 Empty State:** Tampilan ramah pengguna dengan ilustrasi emoji dan petunjuk teks ketika hasil pencarian tidak ditemukan.

### 🔴 Level 3 — Tantangan Bonus
*   [x] **Pagination / Infinite Scroll:** Memuat data 20 Pokémon berikutnya secara otomatis saat pengguna melakukan scroll hingga batas bawah (`onEndReached`).
*   [x] **Favorit Lokal (AsyncStorage):** Menandai Pokémon favorit (ikon hati ❤️) yang datanya tetap tersimpan persisten meskipun aplikasi ditutup.
*   [x] **Sorting:** Fitur mengurutkan daftar nama Pokémon secara alfabetis (Ascending A-Z / Descending Z-A).
*   [x] **Animasi:** Transisi efek memudar (`Animated.timing` fade-in) saat daftar kartu berhasil dimuat pertama kali.

---

## 📸 Dokumentasi & Screenshot (Expo Go)
WhatsApp Image 2026-06-29 at 18.15.16 (1).jpeg
WhatsApp Image 2026-06-29 at 18.15.16 (2).jpeg
WhatsApp Image 2026-06-29 at 18.15.16.jpeg

## 🚀 Cara Menjalankan Project (Setup Instructions)

Ikuti langkah-langkah berikut untuk menjalankan project ini di lingkungan lokal kamu:

### 1. Kloning Repository
```bash
git clone [https://github.com/USERNAME_KAMU/NAMA_REPO_KAMU.git](https://github.com/USERNAME_KAMU/NAMA_REPO_KAMU.git)
cd NAMA_REPO_KAMU
