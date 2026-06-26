import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Pegawai, GolonganPNS, StatusPegawai, ReferensiGolongan, ReferensiGradeTukin, ReferensiKategori } from '../types';
import { formatRupiah } from '../data';
import { 
  Users, 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  Check, 
  X,
  CreditCard,
  AtSign,
  Upload,
  Download,
  FileSpreadsheet,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface DataPegawaiProps {
  pegawaiList: Pegawai[];
  setPegawaiList: (list: Pegawai[]) => void;
  golonganRefs: ReferensiGolongan[];
  gradeTukinRefs: ReferensiGradeTukin[];
  kategoriRefs?: ReferensiKategori[];
}

export default function DataPegawai({
  pegawaiList,
  setPegawaiList,
  golonganRefs,
  gradeTukinRefs,
  kategoriRefs = []
}: DataPegawaiProps) {
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('SEMUA');

  // Excel Functions: Import mass data, download template, backup existing data
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (jsonData.length === 0) {
          alert('File excel kosong.');
          return;
        }

        const importedPegawai: Pegawai[] = jsonData.map((row: any, index: number) => {
          let golStr = String(row['Golongan'] || row['golongan'] || 'III/a').trim();
          if (golStr) {
            const parts = golStr.split('/');
            if (parts.length === 2) {
              golStr = parts[0].toUpperCase() + '/' + parts[1].toLowerCase();
            }
          }

          let gaji = Number(row['Gaji Pokok'] || row['gajiPokok'] || 0);
          if (!gaji) {
            const ref = golonganRefs.find(g => g.golongan === golStr);
            gaji = ref ? ref.gajiPokokAcuan : 2785700;
          }

          let grade = Number(row['Grade Tukin'] || row['gradeTukin'] || 0);
          if (!grade) {
            const ref = golonganRefs.find(g => g.golongan === golStr);
            grade = ref && ref.grade !== undefined ? ref.grade : 7;
          }

          return {
            id: Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString().slice(-4) + '_' + index,
            nip: String(row['NIP'] || row['nip'] || '').trim(),
            nama: String(row['Nama'] || row['nama'] || '').trim(),
            golongan: golStr,
            gajiPokok: gaji,
            sertifikasi: true,
            gradeTukin: grade,
            tukinAktif: true,
            statusPegawai: 'PNS' as StatusPegawai,
            bankNama: String(row['Nama Bank'] || row['namaBank'] || row['bankNama'] || 'Bank BPD').trim(),
            bankRekening: String(row['No Rekening'] || row['noRekening'] || row['bankRekening'] || '').trim(),
            adaNpwp: true,
            kategori: String(row['Kategori'] || row['kategori'] || '').trim() || undefined,
            order: pegawaiList.length + index,
          };
        }).filter(p => p.nama && p.nip);

        if (importedPegawai.length > 0) {
          setPegawaiList([...pegawaiList, ...importedPegawai]);
          alert(`Berhasil mengimpor ${importedPegawai.length} data pegawai secara otomatis.`);
        } else {
          alert('Kolom NIP dan Nama wajib diisi. Pastikan format file Excel sesuai template.');
        }
      } catch (err) {
        console.error('Error importing excel:', err);
        alert('Gagal mengimpor file Excel. Silakan periksa kembali format file Anda.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'NIP': '197508122002121003',
        'Nama': 'Drs. H. Ahmad Sudrajat, M.Pd',
        'Kategori': 'Kepala Sekolah',
        'Golongan': 'IV/b',
        'Gaji Pokok': 5120000,
        'Grade Tukin': 12,
        'Nama Bank': 'Bank BPD Sultra',
        'No Rekening': '0012-09877-665'
      },
      {
        'NIP': '198203152009032008',
        'Nama': 'Siti Aminah, S.Pd',
        'Kategori': 'Guru Mapel',
        'Golongan': 'III/c',
        'Gaji Pokok': 4230000,
        'Grade Tukin': 9,
        'Nama Bank': 'BSI',
        'No Rekening': '7125-9988-10'
      },
      {
        'NIP': 'HONOR-002341-2022',
        'Nama': 'Nurul Hidayah, S.Pd',
        'Kategori': 'Guru Honor',
        'Golongan': 'II/a',
        'Gaji Pokok': 2184000,
        'Grade Tukin': 5,
        'Nama Bank': 'Bank BNI',
        'No Rekening': '0434-2198-33'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Pegawai');

    const wscols = [
      { wch: 22 }, // NIP
      { wch: 30 }, // Nama
      { wch: 20 }, // Kategori
      { wch: 10 }, // Golongan
      { wch: 12 }, // Gaji Pokok
      { wch: 12 }, // Grade Tukin
      { wch: 25 }, // Nama Bank
      { wch: 20 }, // No Rekening
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, 'template_daftar_pegawai.xlsx');
  };

  const handleBackupData = () => {
    if (pegawaiList.length === 0) {
      alert('Tidak ada data pegawai yang dapat diexport.');
      return;
    }

    const exportData = pegawaiList.map((p) => ({
      'NIP': p.nip,
      'Nama': p.nama,
      'Kategori': p.kategori || '',
      'Golongan': p.golongan,
      'Gaji Pokok': p.gajiPokok,
      'Grade Tukin': p.gradeTukin,
      'Nama Bank': p.bankNama,
      'No Rekening': p.bankRekening,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pegawai');

    const wscols = [
      { wch: 22 }, // NIP
      { wch: 30 }, // Nama
      { wch: 20 }, // Kategori
      { wch: 10 }, // Golongan
      { wch: 12 }, // Gaji Pokok
      { wch: 12 }, // Grade Tukin
      { wch: 25 }, // Nama Bank
      { wch: 20 }, // No Rekening
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, 'backup_semua_data_pegawai.xlsx');
  };

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Delete Confirmation States
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmNama, setDeleteConfirmNama] = useState<string>('');

  // Form Fields
  const [nip, setNip] = useState('');
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('');
  const [golongan, setGolongan] = useState<GolonganPNS>('III/a');
  const [gajiPokok, setGajiPokok] = useState<number>(2785700);
  const [sertifikasi, setSertifikasi] = useState(true);
  const [gradeTukin, setGradeTukin] = useState<number>(7);
  const [tukinAktif, setTukinAktif] = useState(true);
  const [statusPegawai, setStatusPegawai] = useState<StatusPegawai>('PNS');
  const [bankNama, setBankNama] = useState('Bank BPD');
  const [bankRekening, setBankRekening] = useState('');
  const [adaNpwp, setAdaNpwp] = useState(true);
  const [notifikasiEmail, setNotifikasiEmail] = useState('');

  // Auto-fill salary based on chosen Golongan, and pre-fill tukin grade from references
  const handleGolonganChange = (selectedGol: GolonganPNS) => {
    setGolongan(selectedGol);
    const ref = golonganRefs.find(g => g.golongan === selectedGol);
    if (ref) {
      setGajiPokok(ref.gajiPokokAcuan);
      if (ref.grade !== undefined) {
        setGradeTukin(ref.grade);
      }
    }
  };

  // Auto-toggle defaults when changing StatusPegawai
  const handleStatusChange = (status: StatusPegawai) => {
    setStatusPegawai(status);
    if (status === 'Honor Daerah') {
      setTukinAktif(false); // honor typically on local budget, no state Tukin
    } else {
      setTukinAktif(true);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setNip('');
    setNama('');
    setKategori('');
    setGolongan('III/a');
    const ref = golonganRefs.find(g => g.golongan === 'III/a');
    setGajiPokok(ref ? ref.gajiPokokAcuan : 2785700);
    setSertifikasi(true);
    setGradeTukin(ref && ref.grade !== undefined ? ref.grade : 7);
    setTukinAktif(true);
    setStatusPegawai('PNS');
    setBankNama('Bank BPD');
    setBankRekening('');
    setAdaNpwp(true);
    setNotifikasiEmail('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Pegawai) => {
    setIsEditing(true);
    setCurrentId(p.id);
    setNip(p.nip);
    setNama(p.nama);
    setKategori(p.kategori || '');
    setGolongan(p.golongan);
    setGajiPokok(p.gajiPokok);
    setSertifikasi(p.sertifikasi);
    const ref = golonganRefs.find(g => g.golongan === p.golongan);
    setGradeTukin(ref && ref.grade !== undefined ? ref.grade : p.gradeTukin);
    setTukinAktif(p.tukinAktif);
    setStatusPegawai(p.statusPegawai);
    setBankNama(p.bankNama);
    setBankRekening(p.bankRekening);
    setAdaNpwp(p.adaNpwp);
    setNotifikasiEmail(p.notifikasiEmail || '');
    setIsModalOpen(true);
  };

  const handleDeletePegawai = (id: string, nama: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmNama(nama);
  };

  const confirmDeletePegawai = () => {
    if (deleteConfirmId) {
      setPegawaiList(pegawaiList.filter(p => p.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      setDeleteConfirmNama('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip || !nama || !bankRekening) {
      alert('Harap isi semua kolom wajib (Nama, NIP, Rekening)!');
      return;
    }

    const ref = golonganRefs.find(g => g.golongan === golongan);
    const finalGradeTukin = ref && ref.grade !== undefined ? ref.grade : gradeTukin;

    if (isEditing && currentId) {
      // update
      setPegawaiList(pegawaiList.map(p => {
        if (p.id === currentId) {
          return {
            ...p,
            nip,
            nama,
            kategori,
            golongan,
            gajiPokok,
            sertifikasi,
            gradeTukin: finalGradeTukin,
            tukinAktif,
            statusPegawai: p.statusPegawai || 'PNS',
            bankNama,
            bankRekening,
            adaNpwp,
            notifikasiEmail: p.notifikasiEmail
          };
        }
        return p;
      }));
    } else {
      // create
      const barisBaru: Pegawai = {
        id: Math.random().toString(36).substring(2, 9),
        nip,
        nama,
        kategori,
        golongan,
        gajiPokok,
        sertifikasi,
        gradeTukin: finalGradeTukin,
        tukinAktif,
        statusPegawai: 'PNS',
        bankNama,
        bankRekening,
        adaNpwp,
        notifikasiEmail: undefined,
        order: Math.max(...pegawaiList.map(p => p.order ?? 0), 0) + 1
      };
      setPegawaiList([...pegawaiList, barisBaru]);
    }
    setIsModalOpen(false);
  };

  const handleInlineKategoriChange = (id: string, selectKategori: string) => {
    setPegawaiList(
      pegawaiList.map(p => {
        if (p.id === id) {
          return {
            ...p,
            kategori: selectKategori
          };
        }
        return p;
      })
    );
  };

  const handleMovePegawai = (id: string, direction: 'UP' | 'DOWN') => {
    const currentIndex = filteredPegawai.findIndex(p => p.id === id);
    if (currentIndex === -1) return;

    let targetIndex = -1;
    if (direction === 'UP' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'DOWN' && currentIndex < filteredPegawai.length - 1) {
      targetIndex = currentIndex + 1;
    }

    if (targetIndex === -1) return;

    const selfPegawai = filteredPegawai[currentIndex];
    const peerPegawai = filteredPegawai[targetIndex];

    let updatedList = [...pegawaiList];
    const needInit = updatedList.some(p => p.order === undefined);

    if (needInit) {
      // Initialize consecutive order values based on visual categories sorting logic
      const baseSorted = [...updatedList].sort((a, b) => {
        if (filterKategori !== 'SEMUA') {
          const katA = a.kategori || "";
          const katB = b.kategori || "";
          const comp = katA.localeCompare(katB);
          if (comp !== 0) return comp;
        }
        return a.nama.localeCompare(b.nama);
      });

      updatedList = updatedList.map(p => {
        const sIdx = baseSorted.findIndex(bs => bs.id === p.id);
        return {
          ...p,
          order: sIdx !== -1 ? sIdx : 0
        };
      });
    }

    const selfInList = updatedList.find(p => p.id === selfPegawai.id);
    const peerInList = updatedList.find(p => p.id === peerPegawai.id);

    if (selfInList && peerInList) {
      const selfOrder = selfInList.order !== undefined ? selfInList.order : 0;
      const peerOrder = peerInList.order !== undefined ? peerInList.order : 0;

      selfInList.order = peerOrder;
      peerInList.order = selfOrder;

      setPegawaiList(updatedList);
    }
  };

  // Filter and Sort list
  const filteredPegawai = pegawaiList
    .filter(p => {
      const matchesSearch = p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.nip.includes(searchQuery);
      const matchesKategori = filterKategori === 'SEMUA' || p.kategori === filterKategori;

      return matchesSearch && matchesKategori;
    })
    .sort((a, b) => {
      if (filterKategori !== 'SEMUA') {
        const katA = a.kategori || "";
        const katB = b.kategori || "";
        const compareKategori = katA.localeCompare(katB);
        if (compareKategori !== 0) return compareKategori;
      }

      const orderA = a.order !== undefined ? a.order : 999999;
      const orderB = b.order !== undefined ? b.order : 999999;
      if (orderA !== orderB) return orderA - orderB;

      return a.nama.localeCompare(b.nama);
    });

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header with Search/Category inputs integrated */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/5 py-3.5 px-4 rounded-xl border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Pencarian</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Nama / NIP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-9 bg-[#0f172a]/60 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="w-full sm:w-48">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Kategori</label>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full h-9 bg-[#0f172a]/80 border border-white/10 outline-none px-3 rounded-lg text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="SEMUA" className="bg-[#1e293b] text-white">Semua Kategori</option>
              {kategoriRefs.map(kat => (
                <option key={kat.id} value={kat.nama} className="bg-[#1e293b] text-white">{kat.nama}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Empty spacing element for Desktop layout to clearly separate columns */}
        <div className="hidden lg:block flex-1"></div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Hidden input for importing excel */}
          <input
            type="file"
            id="excel-import-file"
            accept=".xlsx, .xls, .ods"
            className="hidden"
            onChange={handleImportExcel}
          />

          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            {/* Kolom 1: Template Excel di atas & Tambah Pegawai di bawah */}
            <div className="flex flex-col gap-1.5 min-w-[135px]">
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold px-3 h-8 rounded-lg transition-all cursor-pointer text-xs shadow-md justify-start"
                title="Sediakan & Download Template Excel"
              >
                <FileSpreadsheet size={14} className="text-blue-400 shrink-0" />
                <span className="whitespace-nowrap">Template Excel</span>
              </button>

              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-white/10 font-semibold px-3 h-8 rounded-lg transition-all cursor-pointer text-xs shadow-md justify-start"
                title="Tambah Pegawai Baru Secara Manual"
              >
                <UserPlus size={14} className="text-purple-400 shrink-0" />
                <span className="whitespace-nowrap">Tambah Pegawai</span>
              </button>
            </div>

            {/* Kolom 2: Import Excel di atas & Backup Excel di bawah */}
            <div className="flex flex-col gap-1.5 min-w-[145px]">
              <button
                onClick={() => document.getElementById('excel-import-file')?.click()}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold px-3 h-8 rounded-lg transition-all cursor-pointer text-xs shadow-md justify-start"
                title="Import File Excel ke Database"
              >
                <Upload size={14} className="text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">Import Excel</span>
              </button>

              <button
                onClick={handleBackupData}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold px-3 h-8 rounded-lg transition-all cursor-pointer text-xs shadow-md justify-start"
                title="Backup database pegawai ke format Excel"
              >
                <Download size={14} className="text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap">Backup Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
        <div className="overflow-auto max-h-[650px] relative scrollbar-thin scrollbar-thumb-white/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] text-amber-400 uppercase tracking-widest font-semibold font-sans">
                <th className="bg-[#162035] py-2.5 px-4 text-center w-12 border-b border-white/10">NO</th>
                <th className="bg-[#162035] py-2.5 px-4 border-b border-white/10">Nama / NIP</th>
                <th className="bg-[#162035] py-2.5 px-4 border-b border-white/10">Golongan</th>
                <th className="bg-[#162035] py-2.5 px-4 text-right border-b border-white/10">Gaji Pokok</th>
                <th className="bg-[#162035] py-2.5 px-4 text-center border-b border-white/10">Tunjangan Kinerja (Tukin)</th>
                <th className="bg-[#162035] py-2.5 px-4 border-b border-white/10">NO. REKENING</th>
                <th className="bg-[#162035] py-2.5 px-4 text-center border-b border-white/10">Kategori</th>
                <th className="bg-[#162035] py-2.5 px-4 text-center border-b border-white/10">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredPegawai.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <BookOpen size={40} className="mx-auto text-slate-400 mb-2" />
                    <span>Tidak ada data pegawai yang memenuhi filter pencarian.</span>
                  </td>
                </tr>
              ) : (
                filteredPegawai.map((pegawai, index) => {
                  const golRef = golonganRefs.find(g => g.golongan === pegawai.golongan);
                  const effectiveGrade = golRef && golRef.grade !== undefined ? golRef.grade : pegawai.gradeTukin;
                  const effectiveNilaiTukin = golRef && golRef.nilaiGrade !== undefined 
                    ? golRef.nilaiGrade 
                    : (gradeTukinRefs.find(gt => gt.grade === effectiveGrade)?.nilaiTunjangan ?? 0);
                   return (
                     <tr 
                       key={pegawai.id} 
                       className={`transition-colors group ${
                         !pegawai.adaNpwp 
                           ? 'bg-slate-900/10 hover:bg-slate-900/20 opacity-40 filter blur-[0.4px] select-none text-slate-500' 
                           : 'hover:bg-white/5 text-white'
                       }`}
                     >
                       <td className="py-2.5 px-4 text-center text-xs font-semibold text-slate-400 w-12 font-mono">
                         {index + 1}
                       </td>
                       <td className="py-2.5 px-4">
                         <div className="flex items-center gap-1.5 flex-wrap">
                           <div className={`font-semibold leading-snug ${!pegawai.adaNpwp ? 'text-slate-500 line-through' : 'text-white'}`}>
                             {pegawai.nama}
                           </div>
                           {!pegawai.adaNpwp && (
                             <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded uppercase font-sans border border-amber-500/20">
                               Pensiun
                             </span>
                           )}
                         </div>

                         <div className={`text-xs font-mono mt-0.5 ${!pegawai.adaNpwp ? 'text-slate-600' : 'text-slate-450 text-slate-400'}`}>{pegawai.nip}</div>
                         
                       </td>
                       <td className="py-2.5 px-4">
                         
                         <div className={`${!pegawai.adaNpwp ? 'text-slate-500' : 'text-slate-200'} font-semibold text-xs pl-1`}>
                           Ruang {pegawai.golongan}
                         </div>
                       </td>
                       <td className={`py-2.5 px-4 text-right font-semibold font-mono ${!pegawai.adaNpwp ? 'text-slate-500 line-through' : 'text-emerald-400'}`}>
                         {formatRupiah(pegawai.gajiPokok)}
                       </td>
                       <td className="py-2.5 px-4 text-center">
                         <div className="flex flex-col items-center justify-center">
                           {pegawai.tukinAktif ? (
                             <div className="flex flex-col items-center">
                               <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                                 !pegawai.adaNpwp 
                                   ? 'text-slate-500 bg-slate-950/20 border-slate-500/10' 
                                   : 'text-purple-300 bg-purple-500/15 border-purple-500/20'
                               }`}>
                                 Grade {effectiveGrade}
                               </span>
                               <span className={`text-[10px] font-mono mt-0.5 ${!pegawai.adaNpwp ? 'text-slate-600' : 'text-slate-350'}`}>
                                 {formatRupiah(effectiveNilaiTukin)}
                               </span>
                             </div>
                           ) : (
                             <div className="text-xs text-slate-400 font-mono bg-white/5 px-2 px-0.5 rounded border border-white/10">
                               Non-Tukin
                             </div>
                           )}
                         </div>
                       </td>
                       <td className="py-2.5 px-4 text-xs text-slate-300 font-mono">
                          <div className={`flex items-center gap-1.5 font-semibold ${!pegawai.adaNpwp ? 'text-slate-500' : 'text-slate-200'}`}>
                            <CreditCard size={12} className="text-slate-400" />
                            <span className={!pegawai.adaNpwp ? 'line-through' : ''}>{pegawai.bankRekening}</span>
                          </div>
                        </td>
                       <td className="py-2.5 px-4 text-center">
                         <div className="flex justify-center">
                           <select
                             value={pegawai.kategori || ''}
                             onChange={(e) => handleInlineKategoriChange(pegawai.id, e.target.value)}
                             className="bg-[#0f172a] border border-white/10 text-slate-200 text-xs rounded-xl px-2 py-1 focus:ring-1 focus:ring-emerald-500 max-w-[170px] truncate cursor-pointer font-semibold outline-none w-full transition-all hover:bg-white/5"
                           >
                             <option value="" className="bg-[#1e293b] text-slate-400">Pilih Kategori...</option>
                             {kategoriRefs.map((kat) => (
                               <option key={kat.id} value={kat.nama} className="bg-[#1e293b] text-white">
                                 {kat.nama}
                                </option>
                             ))}
                           </select>
                         </div>
                       </td>
                       <td className="py-2.5 px-4 text-center">
                         <div className="flex items-center justify-center gap-2">
                           <button
                             onClick={() => openEditModal(pegawai)}
                             className="p-1.5 rounded-lg hover:bg-white/15 text-slate-400 hover:text-white transition-all cursor-pointer"
                             title="Edit Data"
                           >
                             <Edit size={16} />
                           </button>

                           <div className="flex flex-col gap-0.5 border border-white/5 bg-black/20 p-0.5 rounded-lg">
                             <button
                               onClick={() => handleMovePegawai(pegawai.id, 'UP')}
                               disabled={index === 0}
                               className={`p-0.5 rounded hover:bg-white/10 transition-all cursor-pointer ${
                                 index === 0 ? 'text-slate-600 cursor-not-allowed opacity-30' : 'text-slate-400 hover:text-emerald-400'
                                }`}
                               title="Pindahkan Ke Atas"
                             >
                               <ChevronUp size={13} />
                             </button>
                             <button
                               onClick={() => handleMovePegawai(pegawai.id, 'DOWN')}
                               disabled={index === filteredPegawai.length - 1}
                               className={`p-0.5 rounded hover:bg-white/10 transition-all cursor-pointer ${
                                 index === filteredPegawai.length - 1 ? 'text-slate-600 cursor-not-allowed opacity-30' : 'text-slate-400 hover:text-emerald-400'
                                }`}
                               title="Pindahkan Ke Bawah"
                             >
                               <ChevronDown size={13} />
                             </button>
                           </div>

                           <button
                             onClick={() => handleDeletePegawai(pegawai.id, pegawai.nama)}
                             className="p-1.5 rounded-lg hover:bg-rose-500/25 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                             title="Hapus"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                       </td>
                     </tr>
                   );
                 })
               )}
             </tbody>
           </table>
         </div>
         <div className="p-4 bg-white/5 border-t border-white/11 border-white/10 flex justify-between items-center text-xs text-slate-405 text-slate-400">
           <span>Menampilkan {filteredPegawai.length} dari {pegawaiList.length} total guru</span>
           <span className="font-semibold text-emerald-400">Database Pegawai Terpadu</span>
         </div>
       </div>

      {/* Slide-over Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#000000]/65 backdrop-blur-md flex justify-center items-center z-50 p-4 transition-all animate-fade-in">
          <div className="bg-[#1e293b] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/10 text-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {isEditing ? 'Ubah Profil Pegawai' : 'Registrasi Pegawai Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full cursor-pointer transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Kategori Field */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Kategori</label>
                <input
                  type="text"
                  list="kategori-list-options"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  placeholder="Contoh: Kepala Sekolah, Guru Mapel, Guru Kelas, dsb."
                  className="w-full p-2.5 bg-[#0f172a] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm font-semibold"
                />
                <datalist id="kategori-list-options">
                  {kategoriRefs.map((ref) => (
                    <option key={ref.id} value={ref.nama} />
                  ))}
                </datalist>
              </div>

              {/* Identity Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Siti Syarifah, S.Pd"
                    className="w-full p-2.5 bg-[#0f172a] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">NIP (Nomor Induk Pegawai) *</label>
                  <input
                    type="text"
                    required
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Contoh: 198512102010112001"
                    className="w-full p-2.5 bg-[#0f172a] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              {/* Status and Golongan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Golongan / Pangkat</label>
                  <select
                    value={golongan}
                    onChange={(e) => handleGolonganChange(e.target.value as GolonganPNS)}
                    className="w-full bg-[#0f172a] border border-white/10 text-emerald-450 text-emerald-400 p-2.5 rounded-xl text-sm outline-none font-semibold"
                  >
                    {golonganRefs.map(g => (
                      <option key={g.golongan} value={g.golongan} className="bg-[#1e293b] text-white">{g.golongan}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1 flex justify-between items-center">
                    <span>Gaji Pokok (Rupiah) *</span>
                    <span className="text-[9px] text-emerald-400 font-bold lowercase tracking-normal">Otomatis</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={gajiPokok}
                    onChange={(e) => setGajiPokok(Number(e.target.value))}
                    placeholder="3000000"
                    className="w-full p-2.5 bg-[#0f172a] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm font-semibold font-mono"
                  />
                </div>
              </div>



              {/* Bank accounts and Tax */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Nama Bank *</label>
                  <input
                    type="text"
                    required
                    value={bankNama}
                    onChange={(e) => setBankNama(e.target.value)}
                    placeholder="Contoh: Bank BPD Sultra"
                    className="w-full p-2.5 bg-[#0f172a] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Nomor Rekening *</label>
                  <input
                    type="text"
                    required
                    value={bankRekening}
                    onChange={(e) => setBankRekening(e.target.value)}
                    placeholder="1234-5678-90"
                    className="w-full p-2.5 bg-[#0f172a] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm font-mono"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Status Keaktifan *</label>
                  <div className="grid grid-cols-2 gap-2 h-[44px]">
                    <div 
                      onClick={() => setAdaNpwp(true)}
                      className={`flex items-center justify-center gap-2 rounded-xl border select-none cursor-pointer transition-all ${
                        adaNpwp 
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' 
                          : 'bg-[#0f172a]/40 border-white/10 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={adaNpwp}
                        onChange={() => setAdaNpwp(true)}
                        className="h-4 w-4 accent-emerald-500 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-xs font-bold font-sans">Aktif</span>
                    </div>

                    <div 
                      onClick={() => setAdaNpwp(false)}
                      className={`flex items-center justify-center gap-2 rounded-xl border select-none cursor-pointer transition-all ${
                        !adaNpwp 
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' 
                          : 'bg-[#0f172a]/40 border-white/10 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!adaNpwp}
                        onChange={() => setAdaNpwp(false)}
                        className="h-4 w-4 accent-amber-500 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-xs font-bold font-sans">Pensiun</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium border border-white/10 text-slate-300 hover:bg-white/10 bg-transparent rounded-xl cursor-pointer"
              >
                Kembali
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-450 text-white rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {isEditing ? 'Simpan Perubahan' : 'Daftarkan Pegawai'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-[#000000]/75 backdrop-blur-md flex justify-center items-center z-50 p-4 transition-all animate-fade-in" id="delete-confirm-modal">
          <div className="bg-[#1e293b] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-rose-500/10 text-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-rose-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <Trash2 size={20} />
                <h3 className="text-base font-bold text-white">Konfirmasi Hapus</h3>
              </div>
              <button
                onClick={() => { setDeleteConfirmId(null); setDeleteConfirmNama(''); }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3">
              <p className="text-sm text-slate-300">
                Apakah Anda yakin ingin menghapus data pegawai <strong className="text-white">"{deleteConfirmNama}"</strong>?
              </p>
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2.5">
                <div className="text-rose-400 mt-0.5 text-sm font-bold">⚠️</div>
                <div className="text-xs text-rose-300 leading-snug">
                  Tindakan ini tidak dapat dibatalkan dan semua data pembayaran atau tunjangan terkait pegawai ini akan disinkronkan kembali.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setDeleteConfirmId(null); setDeleteConfirmNama(''); }}
                className="px-4 py-2 text-sm font-medium border border-white/10 text-slate-300 hover:bg-white/10 bg-transparent rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDeletePegawai}
                className="px-5 py-2 text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20 cursor-pointer"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
