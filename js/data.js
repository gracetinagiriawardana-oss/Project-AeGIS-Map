// Data jenis bencana dan isi panduannya
const TYPES={
 kebakaran:{l:'F',n:'Kebakaran',c:'#f43f5e',e:'🔥',r:300,call:[['113','Damkar'],['112','Darurat']],
  info:'Kebakaran umumnya dipicu korsleting listrik, kebocoran gas/kompor, puntung rokok, dan pembakaran sampah. Api dapat membesar dalam hitungan menit, dan asap lebih mematikan daripada api.',
  sebelum:['Periksa instalasi listrik dan jangan menumpuk colokan.','Sediakan APAR dan pelajari cara memakainya.','Tentukan jalur evakuasi dan titik kumpul keluarga.','Simpan nomor 113 dan 112 di ponsel.','Matikan kompor dan cabut alat listrik sebelum pergi.'],
  saat:['Teriak "api" dan peringatkan orang sekitar.','Matikan listrik dan gas bila aman.','Merunduk di bawah asap dan tutup mulut dengan kain basah.','Jangan gunakan lift. Keluar lewat tangga.','Jika baju terbakar: berhenti, jatuhkan diri, berguling.','Telepon 113/112 dari tempat aman.'],
  sesudah:['Jangan masuk kembali sebelum petugas menyatakan aman.','Periksa luka bakar dan akibat asap, segera ke rumah sakit bila perlu.','Jauhi bangunan yang strukturnya rapuh.','Dokumentasikan kerusakan untuk laporan.']},
 banjir:{l:'B',n:'Banjir',c:'#3b82f6',e:'🌊',r:500,call:[['112','Darurat'],['115','Basarnas']],
  info:'Banjir terjadi saat air meluap akibat hujan deras, saluran tersumbat, atau sungai meluap. Air banjir bisa membawa kuman, arus kuat, dan menyembunyikan lubang atau kabel listrik.',
  sebelum:['Pantau peringatan cuaca BMKG.','Bersihkan selokan dan saluran air.','Siapkan tas siaga: dokumen dalam plastik, obat, senter, makanan, air.','Ketahui jalur dan lokasi pengungsian terdekat.','Pindahkan barang penting ke tempat tinggi.'],
  saat:['Matikan listrik dari meteran utama sebelum air masuk.','Segera menuju tempat tinggi, jangan menunggu air naik.','Jangan menerobos arus, air bergerak setinggi betis sudah dapat menjatuhkan orang.','Jangan berkendara melewati genangan yang dalamnya tidak jelas.','Dahulukan anak, lansia, dan penyandang disabilitas.'],
  sesudah:['Hindari kontak dengan air banjir, mungkin tercemar.','Jangan menyalakan listrik sebelum diperiksa.','Bersihkan rumah memakai sarung tangan dan sepatu bot.','Cuci tangan dengan sabun, waspada diare dan leptospirosis.']},
 longsor:{l:'L',n:'Tanah longsor',c:'#f59e0b',e:'⛰',r:400,call:[['112','Darurat'],['115','Basarnas']],
  info:'Longsor terjadi saat tanah atau batuan di lereng bergerak turun, sering dipicu hujan lebat berkepanjangan, lereng gundul, atau tanah yang jenuh air.',
  sebelum:['Kenali tanda: retakan tanah, pohon atau tiang miring, mata air keruh.','Hindari membangun di bawah atau di tepi lereng curam.','Tanam vegetasi berakar kuat di lereng.','Buat saluran air agar lereng tidak jenuh.','Siapkan jalur evakuasi menjauhi lereng.'],
  saat:['Segera menjauh dari lereng, bergerak ke samping arah longsoran, bukan searah luncuran.','Jika terjebak di dalam rumah, berlindung di bawah meja kokoh.','Jangan menyeberangi aliran tanah atau lumpur.','Hubungi 112 atau BPBD.'],
  sesudah:['Jauhi area longsor, longsor susulan masih mungkin.','Laporkan orang yang tertimbun kepada petugas, jangan menggali sendiri tanpa alat.','Periksa pipa gas, air, dan kabel listrik yang rusak.','Waspadai banjir di hilir.']},
 angin:{l:'A',n:'Angin kencang',c:'#64748b',e:'💨',r:600,call:[['112','Darurat'],['115','Basarnas']],
  info:'Angin kencang atau puting beliung biasanya datang tiba-tiba bersama awan Cumulonimbus, dan dapat merobohkan pohon, baliho, dan atap rumah.',
  sebelum:['Pangkas dahan pohon yang rapuh di dekat rumah.','Perkuat atap dan benda di luar rumah.','Pantau peringatan dini cuaca BMKG.','Hindari parkir di bawah pohon atau baliho besar.'],
  saat:['Berlindung di bangunan kokoh, jauhi jendela kaca.','Jangan berteduh di bawah pohon, baliho, atau tiang listrik.','Jika berkendara, berhenti di tempat aman.','Merunduk dan lindungi kepala bila di ruang terbuka.'],
  sesudah:['Jauhi kabel listrik yang putus, anggap bertegangan.','Periksa kerusakan atap dan struktur sebelum masuk.','Laporkan pohon tumbang atau jalan tertutup.','Bantu tetangga yang terdampak.']}
};
const FT={rs:{n:'Rumah sakit',e:'🏥',c:'#e11d6a'},pmk:{n:'Pemadam',e:'🚒',c:'#f97316'},posko:{n:'Posko',e:'⛺',c:'#0d9488'}};
// Data fasilitas dari direktori publik. Koordinat masih perkiraan, cek ulang sebelum dipublikasikan.
const FAC=[
 {t:'rs',n:'RSUD Dr. Saiful Anwar',a:'Jl. Jaksa Agung Suprapto No. 2, Klojen',p:'(0341) 362101',tel:'0341362101',lat:-7.9697,lng:112.6272},
 {t:'rs',n:'RSIA Mardi Waloeja Rampal',a:'Jl. W.R. Supratman No. 1, Rampal Celaket',p:'(0341) 364756',tel:'0341364756',lat:-7.9628,lng:112.6405},
 {t:'rs',n:'RS Hermina Tangkuban Perahu',a:'Jl. Tangkuban Perahu No. 31-33, Kauman',p:'(0341) 322525',tel:'0341322525',lat:-7.9712,lng:112.6212},
 {t:'rs',n:'RSIA Melati Husada',a:'Jl. Kawi No. 32, Gading Kasri',p:'(0341) 325249',tel:'0341325249',lat:-7.9775,lng:112.6238},
 {t:'rs',n:'RSI Aisyiyah Malang',a:'Jl. Sulawesi No. 16, Kasin',p:'(0341) 326773',tel:'0341326773',lat:-7.9790,lng:112.6195},
 {t:'rs',n:'Persada Hospital',a:'Araya Business Center, Jl. R. Panji Suroso, Blimbing',p:'(0341) 2996333',tel:'03412996333',lat:-7.9327,lng:112.6495},
 {t:'pmk',n:'Pemadam Kebakaran Kota Malang',a:'Jl. Bingkil No. 37, Ciptomulyo, Sukun',p:'113 (nasional) / 112',tel:'113',lat:-7.9975,lng:112.6240},
 {t:'posko',n:'BPBD Kota Malang (Pusdalops)',a:'Jl. Danau Ranau Raya No. 1-A, Sawojajar, Kedungkandang',p:'(0341) 3021657',tel:'03413021657',lat:-7.9740,lng:112.6735}
];