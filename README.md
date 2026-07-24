# Photo Booth App

Web app photo booth sederhana pakai React + Vite. Ambil 3-4 foto otomatis
dengan countdown, pilih filter dan warna border, hasilnya digabung jadi
1 strip foto siap download atau dibagikan.

## Cara jalanin di laptop

Butuh [Node.js](https://nodejs.org) versi 18 ke atas (cek dulu: `node -v`).

1. Buka terminal di folder ini, lalu install dependency:
   ```bash
   npm install
   ```
2. Jalanin server development:
   ```bash
   npm run dev
   ```
3. Buka link yang muncul di terminal (biasanya `http://localhost:5173`)
4. Browser bakal minta izin akses kamera — klik **Allow/Izinkan**

## Struktur folder

```
photo-booth-app/
├── index.html          # entry point HTML
├── package.json        # daftar dependency
├── vite.config.js       # config Vite
└── src/
    ├── main.jsx         # mount React ke DOM
    └── App.jsx          # semua logic & tampilan photo booth
```

## Build buat production (opsional)

Kalau nanti mau di-deploy (misal ke Vercel/Netlify):
```bash
npm run build
```
Hasilnya ada di folder `dist/`, tinggal upload ke hosting statis mana aja.

## Catatan

- Akses kamera butuh HTTPS atau `localhost` — jangan buka lewat `file://`.
- Semua logic ada di satu file `src/App.jsx` biar gampang dibaca dulu;
  kalau makin berkembang, komponen kayak `ThemePicker`, `FilterPicker`,
  dll bisa dipecah ke file terpisah di `src/components/`.
