export type GolonganPNS =
  | 'I/a' | 'I/b' | 'I/c' | 'I/d'
  | 'II/a' | 'II/b' | 'II/c' | 'II/d'
  | 'III/a' | 'III/b' | 'III/c' | 'III/d'
  | 'IV/a' | 'IV/b' | 'IV/c' | 'IV/d' | 'IV/e'
  | string;

export type StatusPegawai = 'PNS' | 'PPPK' | 'Honor Daerah';

export interface Pegawai {
  id: string;
  nip: string;
  nama: string;
  golongan: GolonganPNS;
  gajiPokok: number; // in IDR
  sertifikasi: boolean; // if true, receives TPG (Tunjangan Profesi Guru)
  gradeTukin: number; // Grade 1 - 17 for Tunjangan Kinerja
  tukinAktif: boolean; // if true, receives Tukin
  statusPegawai: StatusPegawai;
  bankNama: string;
  bankRekening: string;
  adaNpwp: boolean;
  notifikasiEmail?: string;
  kategori?: string;
  order?: number;
}

export interface ReferensiGolongan {
  golongan: GolonganPNS;
  gajiPokokAcuan: number;
  tarifPPhTPG: number; // e.g. 0.05 for III/a (standard final PPh PP 80/2010 is I/II = 0%, III = 5%, IV = 15%)
  grade?: number;
  nilaiGrade?: number;
}

export interface ReferensiGradeTukin {
  grade: number;
  nilaiTunjangan: number; // flat rupiah allowance for this grade
}

export interface ItemNominatif {
  pegawaiId: string;
  nip: string;
  nama: string;
  golongan: GolonganPNS;
  gajiPokok: number;
  // Tunjangan Profesi Guru calculation
  bayarTPG: boolean;
  brutoTPG: number;
  tarifPPhTPG: number;
  potonganPPhTPG: number;
  nettoTPG: number;
  
  // Tunjangan Kinerja calculation
  bayarTukin: boolean;
  gradeTukin: number;
  tarifTukinDasar: number;
  persenKehadiran: number; // e.g. 100 means full, less means docked allowance
  brutoTukin: number;
  tarifPPhTukin: number;
  potonganPPhTukin: number;
  nettoTukin: number;
  potonganTukinManual?: number;

  // Totals
  totalBruto: number;
  totalPPh: number;
  totalNetto: number;
}

export interface PembayaranTunjangan {
  id: string;
  nomorSurat: string; // SKU or Payment Reference Number
  bulan: number; // 1-12
  tahun: number; // e.g. 2026
  judul: string; // e.g. "Pembayaran TPG & Tukin Guru Madani Juni 2026"
  tanggalHadir: string; // Date of list creation
  tglDibuat: string;
  itemNominatif: ItemNominatif[];
  status: 'DRAF' | 'DISETUJUI' | 'DIBAYARKAN';
  kategori?: 'Pembayaran TPG' | 'Pembayaran Tukin' | 'Kekurangan TPG' | 'Kekurangan Tukin';
  tempatCetak?: string;
  tanggalCetak?: string;
  pilihKategoriPegawai?: string;
  mulaiBulan?: number;
  sampaiBulan?: number;
}

export interface PejabatPenandatangan {
  id: string;
  jabatan: string;
  nama: string;
  nip: string;
}

export interface ReferensiKategori {
  id: string;
  nama: string;
}

