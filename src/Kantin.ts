// Mengimpor modul readline bawaan Node.js
import * as readline from "readline";

// Interface mendefinisikan bentuk data sebuah rekap pesanan
interface Pesanan {
  namaPelanggan: string; // nama pembeli
  layanan: string;       // jenis layanan (Dine-in, Takeaway, Catering)
  jumlah: number;        // jumlah porsi
  totalBayar: number;    // total yang dibayarkan setelah pajak dan diskon
}

// Array untuk menyimpan riwayat semua transaksi pesanan
const riwayatPesanan: Pesanan[] = [];

// Uang kas / total pendapatan kantin hari ini
let totalPendapatan = 0;

// Membuat interface input/output di terminal
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// Fungsi untuk menampilkan rekap penjualan kantin
function tampilkanRekap() {
  console.log(`\n=== REKAP PENDAPATAN KANTIN ===`);
  console.log(`Total Uang Masuk: Rp ${totalPendapatan}`);

  // Jika belum ada pesanan, tampilkan pesan lalu keluar dari fungsi
  if (riwayatPesanan.length === 0) {
    console.log("Belum ada transaksi hari ini.\n");
    return;
  }

  let totalPorsiTerjual = 0; // penampung total porsi dari semua pesanan

  // Mengulang setiap pesanan; i adalah indeks (dimulai dari 0)
  riwayatPesanan.forEach((pesanan, i) => {
    // ! : logika NOT, memeriksa apakah nama tidak kosong
    const namaValid = !pesanan.namaPelanggan ? "Tanpa Nama" : pesanan.namaPelanggan; 
    
    // + : nomor urut mulai dari 1
    console.log(`${i + 1}. ${namaValid} | ${pesanan.layanan} | ${pesanan.jumlah} porsi | Rp ${pesanan.totalBayar}`);
    
    // += : tambahkan porsi ke total porsi terjual
    totalPorsiTerjual += pesanan.jumlah; 
  });

  let rataRataPendapatan = totalPendapatan;
  // /= : hitung rata-rata pendapatan per transaksi
  rataRataPendapatan /= riwayatPesanan.length; 
  
  console.log(`Total porsi terjual: ${totalPorsiTerjual} porsi`);
  console.log(`Rata-rata pendapatan per transaksi: Rp ${rataRataPendapatan.toFixed(2)}\n`);
}

// Fungsi untuk membuat pesanan baru
// Parameter "done" adalah callback yang dipanggil setelah pesanan selesai, supaya menu bisa ditampilkan lagi
function buatPesanan(done: () => void) {
  rl.question("Nama Pelanggan: ", (nama) => {
    rl.question("Apakah Anda Member? (y/n): ", (memberText) => {
      // === : bandingkan teks secara persis
      const isMember = memberText.toLowerCase() === "y"; 
      
      rl.question("Jumlah Beli (Porsi): ", (qtyText) => {
        const qty = Number(qtyText);

        // [IF KE-1] LEVEL 1: Validasi Input awal
        // (!, &&, > , <=) : pastikan input adalah angka valid, positif, dan tidak lebih dari 100
        if (!isNaN(qty) && qty > 0 && qty <= 100) {
          
          console.log("\nPilihan Layanan: 1. Makan di Tempat  2. Bawa Pulang  3. Catering");
          rl.question("Pilih Layanan (1-3): ", (layananText) => {
            const layanan = Number(layananText);
            let hargaSatuan = 0;
            let ongkir = 0;
            let namaLayanan = "";

            // [SWITCH KE-1] LEVEL 2: Percabangan jenis layanan (Berada di dalam IF 1)
            switch (layanan) {
              case 1:
                namaLayanan = "Makan di Tempat";
                console.log("\nMenu: 1. Nasi Goreng (15k)  2. Mie Ayam (12k)  3. Ayam Geprek (18k)");
                rl.question("Pilih Menu (1-3): ", (menuText) => {
                  const pilihanMenu = Number(menuText);
                  
                  // [SWITCH KE-2] LEVEL 3: Percabangan jenis menu (Berada di dalam Switch 1)
                  switch (pilihanMenu) {
                    case 1: hargaSatuan = 15000; break;
                    case 2: hargaSatuan = 12000; break;
                    case 3: hargaSatuan = 18000; break;
                    default: 
                      console.log("Menu tidak dikenali, set ke harga standar.");
                      hargaSatuan = 10000; 
                      break;
                  }
                  
                  // Lanjutkan ke tahap kalkulasi pembayaran
                  prosesPembayaran(nama, isMember, qty, hargaSatuan, ongkir, namaLayanan, done);
                });
                break; // Break Switch 1 Case 1

              case 2:
                namaLayanan = "Bawa Pulang";
                hargaSatuan = 16000; // Harga flat
                rl.question("Masukkan Jarak Kirim (km): ", (jarakText) => {
                  const jarak = Number(jarakText);
                  
                  // [IF KE-2] LEVEL 3: Kalkulasi ongkir (Berada di dalam Switch 1)
                  if (jarak <= 2) {           // <= : jarak dekat
                    ongkir = 2000;
                  } else if (jarak <= 5) {
                    ongkir = 5000;
                  } else {
                    ongkir = 10000;
                  }
                  
                  prosesPembayaran(nama, isMember, qty, hargaSatuan, ongkir, namaLayanan, done);
                });
                break; // Break Switch 1 Case 2

              case 3:
                namaLayanan = "Catering";
                hargaSatuan = 20000; // Harga porsi catering
                
                // [IF KE-3] LEVEL 3: Promo catering (Berada di dalam Switch 1)
                // % : modulus, jika pesanan berjumlah genap
                if (qty % 2 === 0) { 
                  console.log("Promo Catering Genap: Bebas Biaya Antar!");
                  ongkir = 0;
                } else {
                  ongkir = 50000;
                }
                prosesPembayaran(nama, isMember, qty, hargaSatuan, ongkir, namaLayanan, done);
                break; // Break Switch 1 Case 3

              default:
                // !== : memastikan layanan bukan opsi yang valid
                if (layanan !== 1 && layanan !== 2 && layanan !== 3) {
                    console.log("Layanan tidak valid!");
                }
                done(); // kembali ke menu
                break;
            }
          });

        } else {
          console.log("Error: Jumlah beli tidak valid (harus angka 1-100).");
          done(); // kembali ke menu
        }
      });
    });
  });
}

// Fungsi pembantu untuk menyelesaikan perhitungan (Mencegah callback hell terlalu dalam)
function prosesPembayaran(nama: string, isMember: boolean, qty: number, harga: number, ongkir: number, layanan: string, done: () => void) {
  // * : dasar = harga × jumlah
  let totalDasar = harga * qty; 
  let diskon = 0;
  
  // (||, >=) : Diskon jika pelanggan member ATAU belanja >= 50.000
  if (isMember === true || totalDasar >= 50000) {
    diskon = totalDasar * 0.10; // Diskon 10%
    console.log("Diskon 10% Diterapkan!");
  }

  let totalAkhir = totalDasar;
  totalAkhir -= diskon; // -= : kurangi total akhir sebesar diskon
  totalAkhir += ongkir; // += : tambahkan ongkir
  
  // Menambahkan pajak 10% menggunakan *=
  totalAkhir *= 1.10; // *= : naikkan total sebesar 10% (pajak)
  totalAkhir = Math.round(totalAkhir); // Bulatkan angka

  console.log(`\n=== STRUK PEMBAYARAN ===`);
  console.log(`Pesanan  : ${qty} Porsi (${layanan})`);
  console.log(`Subtotal : Rp ${totalDasar}`);
  console.log(`Ongkir   : Rp ${ongkir}`);
  console.log(`Diskon   : Rp -${diskon}`);
  console.log(`Pajak    : 10%`);
  console.log(`TOTAL    : Rp ${totalAkhir}`);
  console.log(`========================\n`);

  // Memasukkan data transaksi ke dalam array
  riwayatPesanan.push({
    namaPelanggan: nama,
    layanan: layanan,
    jumlah: qty,
    totalBayar: totalAkhir
  });

  totalPendapatan += totalAkhir; // += : tambahkan hasil penjualan ke kas kantin
  
  done(); // Kembali ke menu utama
}

// Fungsi menu utama: menampilkan pilihan berulang menggunakan rekursi.
function menu() {
  console.log("1. Pesanan Baru  2. Rekap Penjualan  3. Keluar");
  rl.question("Pilih menu: ", (choice) => {
    if (choice === "1") {
      buatPesanan(menu);       // kirim menu sebagai callback, dipanggil setelah pesan selesai
    } else if (choice === "2") {
      tampilkanRekap();
      menu();                  // panggil menu lagi secara langsung
    } else if (choice === "3") {
      console.log("Kantin ditutup. Sampai jumpa!");
      rl.close();              // tidak memanggil menu() lagi, program berhenti
    } else {
      console.log("Pilihan tidak valid\n");
      menu();
    }
  });
}

// Menjalankan program utama
console.log("=== SISTEM KASIR KANTIN MAKMUR ===");
menu();