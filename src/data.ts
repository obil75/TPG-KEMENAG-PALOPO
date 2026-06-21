import { Pegawai, ReferensiGolongan, ReferensiGradeTukin, GolonganPNS, PembayaranTunjangan, ItemNominatif, ReferensiKategori } from './types';

// Standard 2024/2026 Indonesian civil servant (PNS) basic salary averages for education department
export const DEFAULT_GOLONGAN_REF: ReferensiGolongan[] = [
  { golongan: 'I/a', gajiPokokAcuan: 1685700, tarifPPhTPG: 0.0, grade: 1, nilaiGrade: 1960000 },
  { golongan: 'I/b', gajiPokokAcuan: 1840800, tarifPPhTPG: 0.0, grade: 2, nilaiGrade: 2200000 },
  { golongan: 'I/c', gajiPokokAcuan: 1918200, tarifPPhTPG: 0.0, grade: 3, nilaiGrade: 2500000 },
  { golongan: 'I/d', gajiPokokAcuan: 1999900, tarifPPhTPG: 0.0, grade: 4, nilaiGrade: 2800000 },
  { golongan: 'II/a', gajiPokokAcuan: 2184000, tarifPPhTPG: 0.0, grade: 5, nilaiGrade: 3100000 },
  { golongan: 'II/b', gajiPokokAcuan: 2385000, tarifPPhTPG: 0.0, grade: 5, nilaiGrade: 3100000 },
  { golongan: 'II/c', gajiPokokAcuan: 2485900, tarifPPhTPG: 0.0, grade: 6, nilaiGrade: 3500000 },
  { golongan: 'II/d', gajiPokokAcuan: 2591100, tarifPPhTPG: 0.0, grade: 6, nilaiGrade: 3500000 },
  { golongan: 'III/a', gajiPokokAcuan: 2785700, tarifPPhTPG: 0.05, grade: 7, nilaiGrade: 3915000 },
  { golongan: 'III/b', gajiPokokAcuan: 2903600, tarifPPhTPG: 0.05, grade: 8, nilaiGrade: 4500000 },
  { golongan: 'III/c', gajiPokokAcuan: 3026400, tarifPPhTPG: 0.05, grade: 9, nilaiGrade: 5015000 },
  { golongan: 'III/d', gajiPokokAcuan: 3154400, tarifPPhTPG: 0.05, grade: 10, nilaiGrade: 5900000 },
  { golongan: 'IV/a', gajiPokokAcuan: 3287800, tarifPPhTPG: 0.15, grade: 11, nilaiGrade: 8700000 },
  { golongan: 'IV/b', gajiPokokAcuan: 3426900, tarifPPhTPG: 0.15, grade: 12, nilaiGrade: 9800000 },
  { golongan: 'IV/c', gajiPokokAcuan: 3571900, tarifPPhTPG: 0.15, grade: 13, nilaiGrade: 10900000 },
  { golongan: 'IV/d', gajiPokokAcuan: 3722900, tarifPPhTPG: 0.15, grade: 14, nilaiGrade: 11600000 },
  { golongan: 'IV/e', gajiPokokAcuan: 3880000, tarifPPhTPG: 0.15, grade: 15, nilaiGrade: 14700000 },
];

// Indonesian civil service performance allowance grade multipliers (Rupiah values)
export const DEFAULT_GRADE_TUKIN_REF: ReferensiGradeTukin[] = [
  { grade: 17, nilaiTunjangan: 29000000 },
  { grade: 16, nilaiTunjangan: 20600000 },
  { grade: 15, nilaiTunjangan: 14700000 },
  { grade: 14, nilaiTunjangan: 11600000 },
  { grade: 13, nilaiTunjangan: 10900000 },
  { grade: 12, nilaiTunjangan: 9800000 },
  { grade: 11, nilaiTunjangan: 8700000 },
  { grade: 10, nilaiTunjangan: 5900000 },
  { grade: 9, nilaiTunjangan: 5015000 },
  { grade: 8, nilaiTunjangan: 4500000 },
  { grade: 7, nilaiTunjangan: 3915000 },
  { grade: 6, nilaiTunjangan: 3500000 },
  { grade: 5, nilaiTunjangan: 3100000 },
  { grade: 4, nilaiTunjangan: 2800000 },
  { grade: 3, nilaiTunjangan: 2500000 },
  { grade: 2, nilaiTunjangan: 2200000 },
  { grade: 1, nilaiTunjangan: 1960000 },
];

export const DEFAULT_KATEGORI_REF: ReferensiKategori[] = [
  { id: '1', nama: 'Kepala Sekolah' },
  { id: '2', nama: 'Guru Mapel' },
  { id: '3', nama: 'Guru Kelas' },
  { id: '4', nama: 'Tenaga Kependidikan' },
  { id: '5', nama: 'Guru Honor' },
];

export const MOCK_PEGAWAI: Pegawai[] = [
  {
    id: '1',
    nip: '197508122002121003',
    nama: 'Drs. H. Ahmad Sudrajat, M.Pd',
    golongan: 'IV/b',
    gajiPokok: 5120000, // actual with increments
    sertifikasi: true,
    gradeTukin: 12,
    tukinAktif: true,
    statusPegawai: 'PNS',
    bankNama: 'Bank BPD Sultra',
    bankRekening: '0012-09877-665',
    adaNpwp: true,
    notifikasiEmail: 'ahmad.sudrajat@guru.id',
    kategori: 'Kepala Sekolah',
  },
  {
    id: '2',
    nip: '198203152009032008',
    nama: 'Siti Aminah, S.Pd',
    golongan: 'III/c',
    gajiPokok: 4230000,
    sertifikasi: true,
    gradeTukin: 9,
    tukinAktif: true,
    statusPegawai: 'PNS',
    bankNama: 'Bank Syariah Indonesia (BSI)',
    bankRekening: '7125-9988-10',
    adaNpwp: true,
    notifikasiEmail: 'siti.aminah@sekolah.belajar.id',
    kategori: 'Guru Mapel',
  },
  {
    id: '3',
    nip: '199110242020121009',
    nama: 'Rian Hidayat, S.Pd',
    golongan: 'III/a',
    gajiPokok: 3200000,
    sertifikasi: true,
    gradeTukin: 7,
    tukinAktif: true,
    statusPegawai: 'PNS',
    bankNama: 'Bank DKI',
    bankRekening: '516-12-09432',
    adaNpwp: true,
    notifikasiEmail: 'rian.hidayat@sekolah.belajar.id',
    kategori: 'Guru Kelas',
  },
  {
    id: '4',
    nip: '198805172015032005',
    nama: 'Dina Mariana, S.Pd.I',
    golongan: 'III/b',
    gajiPokok: 3450000,
    sertifikasi: false,
    gradeTukin: 8,
    tukinAktif: true,
    statusPegawai: 'PPPK',
    bankNama: 'Bank Mandiri',
    bankRekening: '1370019283733',
    adaNpwp: true,
    notifikasiEmail: 'dina.mariana@guru.id',
    kategori: 'Guru Mapel',
  },
  {
    id: '5',
    nip: '199511112023011002',
    nama: 'Yusuf Mansur, S.Kom',
    golongan: 'III/a',
    gajiPokok: 2980000,
    sertifikasi: false,
    gradeTukin: 7,
    tukinAktif: true,
    statusPegawai: 'PNS',
    bankNama: 'Bank BRI',
    bankRekening: '0129-01-087123-50-4',
    adaNpwp: false, // will have tax penalty
    notifikasiEmail: 'yusuf.mansur@sekolah.belajar.id',
    kategori: 'Tenaga Kependidikan',
  },
  {
    id: '6',
    nip: 'HONOR-002341-2022',
    nama: 'Nurul Hidayah, S.Pd',
    golongan: 'II/a',
    gajiPokok: 2184000,
    sertifikasi: true, // Non-PNS sertifikasi (Impasing / Penyetaraan)
    gradeTukin: 5,
    tukinAktif: false, // Honor only gets TPG
    statusPegawai: 'Honor Daerah',
    bankNama: 'Bank BNI',
    bankRekening: '0434-2198-33',
    adaNpwp: true,
    notifikasiEmail: 'nurul.h@gmail.com',
    kategori: 'Guru Honor',
  },
];

export const IDRFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
});

export const formatRupiah = (value: number): string => {
  return IDRFormatter.format(value);
};

export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Calculates payment info for a single employee based on current rule references
 */
export function hitungItemNominatif(
  pegawai: Pegawai,
  bayarTPG: boolean,
  bayarTukin: boolean,
  persenKehadiran: number, // optional override per teacher
  golonganRefs: ReferensiGolongan[],
  gradeTukinRefs: ReferensiGradeTukin[]
): ItemNominatif {
  // get basic salary
  const gajiPokok = pegawai.gajiPokok;

  // 1. TPG (Sertifikasi)
  // Teacher Professional Allowance is generally 1x basic salary if certification is active
  const tpgAktif = pegawai.sertifikasi && bayarTPG;
  const brutoTPG = tpgAktif ? gajiPokok : 0;
  
  // Tax determination for TPG (based on PP 80/2010 rules for Civil Servants / PNS)
  // Gol I & II = 0%, III = 5%, IV = 15%
  const golRef = golonganRefs.find(g => g.golongan === pegawai.golongan);
  let tarifPPhTPG = golRef ? golRef.tarifPPhTPG : 0.05; // default 5%
  
  // Non-PNS (Honor Daerah/PPPK) sometimes has different tax, but we map according to Golongan reference.
  // If No NPWP, standard surcharge applies: 20% higher tax rate (e.g. 5% * 1.2 = 6%, 15% * 1.2 = 18%)
  if (!pegawai.adaNpwp && tarifPPhTPG > 0) {
    tarifPPhTPG = tarifPPhTPG * 1.2;
  }
  
  const potonganPPhTPG = Math.round(brutoTPG * tarifPPhTPG);
  const nettoTPG = brutoTPG - potonganPPhTPG;

  // 2. Tukin (Tunjangan Kinerja)
  const tukinAktif = pegawai.tukinAktif && bayarTukin;
  
  // Find grade and allowance from Golongan reference as requested
  const gradeTukin = golRef && golRef.grade !== undefined ? golRef.grade : pegawai.gradeTukin;
  const tarifTukinDasar = golRef && golRef.nilaiGrade !== undefined 
    ? golRef.nilaiGrade 
    : (gradeTukinRefs.find(gt => gt.grade === gradeTukin)?.nilaiTunjangan ?? 0);
  
  // Performance-based allowance is impacted by attendance / presence
  const brutoTukinPresensi = Math.round(tarifTukinDasar * (persenKehadiran / 100));
  const brutoTukin = tukinAktif ? brutoTukinPresensi : 0;

  // For Tukin, we also calculate the PPh 21. Usually added to other income,
  // but for the sake of automated transparency, we apply the same PP 80/2010 or similar flat bracket
  let tarifPPhTukin = golRef ? golRef.tarifPPhTPG : 0.05;
  if (!pegawai.adaNpwp && tarifPPhTukin > 0) {
    tarifPPhTukin = tarifPPhTukin * 1.2;
  }
  const potonganPPhTukin = Math.round(brutoTukin * tarifPPhTukin);
  const nettoTukin = brutoTukin - potonganPPhTukin;

  // 3. Totals
  const totalBruto = brutoTPG + brutoTukin;
  const totalPPh = potonganPPhTPG + potonganPPhTukin;
  const totalNetto = totalBruto - totalPPh;

  return {
    pegawaiId: pegawai.id,
    nip: pegawai.nip,
    nama: pegawai.nama,
    golongan: pegawai.golongan,
    gajiPokok,
    bayarTPG: tpgAktif,
    brutoTPG,
    tarifPPhTPG,
    potonganPPhTPG,
    nettoTPG,
    bayarTukin: tukinAktif,
    gradeTukin: pegawai.gradeTukin,
    tarifTukinDasar,
    persenKehadiran,
    brutoTukin,
    tarifPPhTukin,
    potonganPPhTukin,
    nettoTukin,
    totalBruto,
    totalPPh,
    totalNetto,
  };
}

/**
 * Creates dynamic payments record
 */
export function generateDaftarPembayaranBaru(
  nomorSurat: string,
  bulan: number,
  tahun: number,
  judul: string,
  daftarPegawai: Pegawai[],
  bayarTPG: boolean,
  bayarTukin: boolean,
  golonganRefs: ReferensiGolongan[],
  gradeTukinRefs: ReferensiGradeTukin[],
  kategori?: 'Pembayaran TPG' | 'Pembayaran Tukin' | 'Kekurangan TPG' | 'Kekurangan Tukin'
): PembayaranTunjangan {
  const itemNominatif: ItemNominatif[] = daftarPegawai.map(p => {
    // defaults presence percentage to 100
    return hitungItemNominatif(p, bayarTPG, bayarTukin, 100, golonganRefs, gradeTukinRefs);
  });

  return {
    id: Math.random().toString(36).substring(2, 9),
    nomorSurat,
    bulan,
    tahun,
    judul,
    tanggalHadir: new Date().toISOString().substring(0, 10),
    tglDibuat: new Date().toISOString().substring(0, 10),
    itemNominatif,
    status: 'DRAF',
    kategori,
  };
}
