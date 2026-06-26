import React, { useState, useRef } from 'react';
import { Pegawai, PembayaranTunjangan, ItemNominatif, ReferensiGolongan, ReferensiGradeTukin, PejabatPenandatangan, ReferensiKategori } from '../types';
import { formatRupiah, INDONESIAN_MONTHS, generateDaftarPembayaranBaru, hitungItemNominatif } from '../data';
import { 
  CreditCard, 
  Plus, 
  Printer, 
  Trash2, 
  Eye, 
  FileText, 
  ChevronLeft, 
  Percent, 
  Briefcase, 
  TrendingUp,
  Download,
  Award,
  X,
  Calendar,
  CheckSquare,
  Square,
  Pencil
 } from 'lucide-react';
 
 interface PembayaranSistemProps {
   pembayaranList: PembayaranTunjangan[];
   setPembayaranList: (list: PembayaranTunjangan[]) => void;
   pegawaiList: Pegawai[];
   golonganRefs: ReferensiGolongan[];
   gradeTukinRefs: ReferensiGradeTukin[];
   satkerName?: string;
   pejabatList?: PejabatPenandatangan[];
   kategoriRefs?: ReferensiKategori[];
 }
 
 export default function PembayaranSistem({
   pembayaranList,
   setPembayaranList,
   pegawaiList,
   golonganRefs,
   gradeTukinRefs,
   satkerName = 'KANTOR KEMENTERIAN AGAMA KOTA PALOPO',
   pejabatList = [],
   kategoriRefs = []
 }: PembayaranSistemProps) {
   // Navigation inside pembayaran: list view or detail view
   const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<PembayaranTunjangan | null>(null);
 
   // Active category tab for list view filtering
   const [activeTabState, setActiveTabState] = useState<'Pembayaran TPG' | 'Pembayaran Tukin' | 'Kekurangan TPG' | 'Kekurangan Tukin'>('Pembayaran TPG');
 
   // Selected category when creating a new payment
   const [createKategori, setCreateKategori] = useState<'Pembayaran TPG' | 'Pembayaran Tukin' | 'Kekurangan TPG' | 'Kekurangan Tukin' | ''>('Pembayaran TPG');
   
   // States for interactive filter bar
   const [filterPegawaiKategori, setFilterPegawaiKategori] = useState<string>('Semua');
   const [filterBulan, setFilterBulan] = useState<string>('Semua');
   const [filterTahun, setFilterTahun] = useState<string>(() => new Date().getFullYear().toString());
   const [tanggalCetak, setTanggalCetak] = useState<string>(() => {
     const today = new Date();
     const dd = String(today.getDate()).padStart(2, '0');
     const mm = String(today.getMonth() + 1).padStart(2, '0');
     const yyyy = today.getFullYear();
     return `${dd}/${mm}/${yyyy}`;
   });
   const datePickerRef = useRef<HTMLInputElement>(null);
   
   // Delete Confirmation States
   const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
   const [deleteConfirmJudul, setDeleteConfirmJudul] = useState<string>('');
   
   // Create New Distribution Modal / Form
   const [showCreateForm, setShowCreateForm] = useState(false);
   const [judul, setJudul] = useState('');
   const [nomorSurat, setNomorSurat] = useState('');
   const [bulan, setBulan] = useState<number>(new Date().getMonth() + 1); // 1-12
   const [tahun, setTahun] = useState<number>(new Date().getFullYear());
   const [bayarTPG, setBayarTPG] = useState(true);
   const [bayarTukin, setBayarTukin] = useState(false);
    const [createTempatCetak, setCreateTempatCetak] = useState('Palopo');
    const [createTanggalCetak, setCreateTanggalCetak] = useState<string>(() => {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    });
    const [createPilihKategoriPegawai, setCreatePilihKategoriPegawai] = useState<string>('Semua');
    const [showPrintHelper, setShowPrintHelper] = useState(false);
    const [createMulaiBulan, setCreateMulaiBulan] = useState<number>(1);
    const [createSampaiBulan, setCreateSampaiBulan] = useState<number>(3);
    const [showTriwulanDialog, setShowTriwulanDialog] = useState<boolean>(false);
    const [manualGapokBaru, setManualGapokBaru] = useState<Record<string, string>>({});
    const [manualGapokLama, setManualGapokLama] = useState<Record<string, string>>({});
    const [manualShortage, setManualShortage] = useState<Record<string, string>>({});
    const [manualShortageMonths, setManualShortageMonths] = useState<Record<string, string>>({});
    const [manualShortagePph, setManualShortagePph] = useState<Record<string, string>>({});
    const [manualShortageTukin, setManualShortageTukin] = useState<Record<string, string>>({});
    const [manualShortageTukinMonths, setManualShortageTukinMonths] = useState<Record<string, string>>({});
    const [selectedPegawaiIds, setSelectedPegawaiIds] = useState<string[]>([]);

    // Automatically sync checklist of employee IDs based on selected employee category (excluding retired/pensiun employees)
    React.useEffect(() => {
      if (showCreateForm) {
        const list = (createPilihKategoriPegawai === 'Semua'
          ? pegawaiList
          : pegawaiList.filter(p => p.kategori === createPilihKategoriPegawai)
        ).filter(p => p.adaNpwp !== false);
        setSelectedPegawaiIds(list.map(p => p.id));
      } else {
        setSelectedPegawaiIds([]);
      }
    }, [createPilihKategoriPegawai, showCreateForm, pegawaiList]);

    // Auto-update judul based on category and employee category updates
    React.useEffect(() => {
      if (showCreateForm) {
        const agendaStr = createKategori || 'Pembayaran Tunjangan';
        const katPegawaiStr = createPilihKategoriPegawai === 'Semua' ? '' : ` ${createPilihKategoriPegawai}`;
        const generatedTitle = `${agendaStr}${katPegawaiStr}`;
        setJudul(generatedTitle);
      }
    }, [createKategori, createPilihKategoriPegawai, showCreateForm]);
 
   // Signing authority state (loaded by default, customisable for PDF signatures)
   const [kpaNama, setKpaNama] = useState('Drs. H. Mulyadi, M.Si');
   const [kpaNip, setKpaNip] = useState('197205121998031002');
   const [bendaharaNama, setBendaharaNama] = useState('Suprihatin, S.E.');
   const [bendaharaNip, setBendaharaNip] = useState('198409152011012015');
   const [jabatanInstansi, setJabatanInstansi] = useState('Kepala Dinas Pendidikan / KPA');
 
   // Active payment calculations
   const activePayment = pembayaranList.find(p => p.id === activePaymentId);
    const formatDateToIndonesian = (dateStr: string): string => {
      if (!dateStr) return '';
      const parts = dateStr.split(/[\/\-]/);
      if (parts.length === 3) {
        let day = parts[0];
        let monthIndex = parseInt(parts[1], 10) - 1;
        let year = parts[2];
        if (parts[0].length === 4) {
          day = parts[2];
          monthIndex = parseInt(parts[1], 10) - 1;
          year = parts[0];
        }
        if (monthIndex >= 0 && monthIndex < 12) {
          const monthName = INDONESIAN_MONTHS[monthIndex];
          const cleanedDay = parseInt(day, 10).toString();
          return `${cleanedDay} ${monthName} ${year}`;
        }
      }
      return dateStr;
    };
    
    const curTanggalCetak = activePayment?.tanggalCetak || tanggalCetak;
    const curTempatCetak = activePayment?.tempatCetak || 'Palopo';
    const formattedTanggalCetak = formatDateToIndonesian(curTanggalCetak || '');
 
   const getPaymentCategory = (p: PembayaranTunjangan): 'Pembayaran TPG' | 'Pembayaran Tukin' | 'Kekurangan TPG' | 'Kekurangan Tukin' => {
    if (p.kategori) return p.kategori;
    
    const titleLower = p.judul.toLowerCase();
    
    if (titleLower.includes('kekurangan tpg') || titleLower.includes('kekurangan sertifikasi')) {
      return 'Kekurangan TPG';
    }
    if (titleLower.includes('kekurangan tukin') || titleLower.includes('kekurangan kinerja')) {
      return 'Kekurangan Tukin';
    }
    
    // Fallback based on item parameters
    const hasTPG = p.itemNominatif.some(item => item.brutoTPG > 0 || item.bayarTPG);
    const hasTukin = p.itemNominatif.some(item => item.brutoTukin > 0 || item.bayarTukin);
    
    if (hasTPG && !hasTukin) {
      return 'Pembayaran TPG';
    }
    if (!hasTPG && hasTukin || titleLower.includes('tukin')) {
      return 'Pembayaran Tukin';
    }
    
    return 'Pembayaran TPG'; // Default
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (pegawaiList.length === 0) {
      alert('Database pegawai masih kosong! Harap daftarkan pegawai terlebih dahulu.');
      return;
    }

    let filteredPegawaiList = (createPilihKategoriPegawai === 'Semua'
      ? pegawaiList
      : pegawaiList.filter(p => p.kategori === createPilihKategoriPegawai)
    ).filter(p => p.adaNpwp !== false);

    if (filteredPegawaiList.length === 0) {
      alert(`Tidak ada pegawai dengan Kategori "${createPilihKategoriPegawai}"!`);
      return;
    }

    // Filter to only checked employees for Kekurangan Tukin or Kekurangan TPG
    if (createKategori === 'Kekurangan Tukin' || createKategori === 'Kekurangan TPG') {
      filteredPegawaiList = filteredPegawaiList.filter(p => selectedPegawaiIds.includes(p.id));
      if (filteredPegawaiList.length === 0) {
        alert('Harap centang setidaknya satu pegawai untuk melanjutkan!');
        return;
      }
    }

    const payload = generateDaftarPembayaranBaru(
      nomorSurat,
      bulan,
      tahun,
      judul,
      filteredPegawaiList,
      bayarTPG,
      bayarTukin,
      golonganRefs,
      gradeTukinRefs,
      createKategori || undefined
    );

    payload.tempatCetak = createTempatCetak;
    payload.tanggalCetak = createTanggalCetak;
    payload.pilihKategoriPegawai = createPilihKategoriPegawai;
    if (bulan === 15) {
      payload.mulaiBulan = createMulaiBulan;
      payload.sampaiBulan = createSampaiBulan;
    }

    setPembayaranList([payload, ...pembayaranList]);
    setShowCreateForm(false);
    setActivePaymentId(payload.id); // open detail immediately
    setActiveTabState(createKategori); // keep tab in sync!
    
    // reset form fields
    setJudul('');
    setNomorSurat('');
  };

  const handleUpdateAttendance = (pegawaiId: string, value: string) => {
    if (!activePaymentId) return;
    
    let percent = Number(value);
    if (isNaN(percent)) percent = 100;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    setPembayaranList(pembayaranList.map(p => {
      if (p.id === activePaymentId) {
        let multiplier = 1;
        if (p.bulan === 15) {
          multiplier = (p.sampaiBulan || 3) - (p.mulaiBulan || 1) + 1;
        } else if (p.judul.toLowerCase().includes('triwulan') || p.judul.toLowerCase().includes('3 bulan')) {
          multiplier = 3;
        } else if (p.judul.toLowerCase().includes('semester')) {
          multiplier = 6;
        }

        const updatedItems = p.itemNominatif.map(item => {
          if (item.pegawaiId === pegawaiId) {
            const peg = pegawaiList.find(x => x.id === pegawaiId);
            if (!peg) return item;
            
            // Recalculate individual item
            const newItem = hitungItemNominatif(peg, p.itemNominatif[0].bayarTPG, p.itemNominatif[0].bayarTukin, percent, golonganRefs, gradeTukinRefs);
            
            // Preserve manual potongan
            newItem.potonganTukinManual = item.potonganTukinManual;

            // Compute with preserved manual potongan
            const presenceFactor = percent / 100;
            const selisihBase = Math.max(0, newItem.tarifTukinDasar - newItem.gajiPokok);
            const jmlhSelisih = Math.round(selisihBase * multiplier * presenceFactor);
            const jmlhPotongan = newItem.potonganTukinManual ?? 0;
            const jmlhBersih = jmlhSelisih - jmlhPotongan;
            const pph = Math.round(jmlhBersih * newItem.tarifPPhTukin);
            
            newItem.totalBruto = jmlhBersih + pph;
            newItem.totalPPh = pph;
            newItem.totalNetto = jmlhBersih;

            return newItem;
          }
          return item;
        });
        return {
          ...p,
          itemNominatif: updatedItems
        };
      }
      return p;
    }));
  };

  const handleUpdatePotongan = (pegawaiId: string, value: number) => {
    if (!activePaymentId) return;

    setPembayaranList(pembayaranList.map(p => {
      if (p.id === activePaymentId) {
        let multiplier = 1;
        if (p.bulan === 15) {
          multiplier = (p.sampaiBulan || 3) - (p.mulaiBulan || 1) + 1;
        } else if (p.judul.toLowerCase().includes('triwulan') || p.judul.toLowerCase().includes('3 bulan')) {
          multiplier = 3;
        } else if (p.judul.toLowerCase().includes('semester')) {
          multiplier = 6;
        }

        const updatedItems = p.itemNominatif.map(item => {
          if (item.pegawaiId === pegawaiId) {
            const presenceFactor = (item.persenKehadiran ?? 100) / 100;
            const selisihBase = Math.max(0, item.tarifTukinDasar - item.gajiPokok);
            const jmlhSelisih = Math.round(selisihBase * multiplier * presenceFactor);
            
            const jmlhPotongan = value;
            const jmlhBersih = jmlhSelisih - jmlhPotongan;
            const pph = Math.round(jmlhBersih * item.tarifPPhTukin);
            const jmlhBruto = jmlhBersih + pph;
            const jmlhDiterima = jmlhBersih;

            return {
              ...item,
              potonganTukinManual: value,
              totalBruto: jmlhBruto,
              totalPPh: pph,
              totalNetto: jmlhDiterima
            };
          }
          return item;
        });
        return {
          ...p,
          itemNominatif: updatedItems
        };
      }
      return p;
    }));
  };

  const handleDeletePembayaran = (id: string, name: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmJudul(name);
  };

  const confirmDeletePembayaran = () => {
    if (deleteConfirmId) {
      setPembayaranList(pembayaranList.filter(p => p.id !== deleteConfirmId));
      if (activePaymentId === deleteConfirmId) setActivePaymentId(null);
      setDeleteConfirmId(null);
      setDeleteConfirmJudul('');
    }
  };

  const handleSaveEditPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    const isTPG = editingPayment.kategori?.includes('TPG') ?? false;
    const isTukin = editingPayment.kategori?.includes('Tukin') ?? false;

    const updatedList = pembayaranList.map(p => {
      if (p.id === editingPayment.id) {
        const updatedItems = p.itemNominatif.map(item => {
          const peg = pegawaiList.find(x => x.id === item.pegawaiId || x.nip === item.nip);
          if (peg) {
            return hitungItemNominatif(
              peg,
              isTPG,
              isTukin,
              item.persenKehadiran ?? 100,
              golonganRefs,
              gradeTukinRefs
            );
          }
          return {
            ...item,
            bayarTPG: isTPG,
            bayarTukin: isTukin,
          };
        });

        return {
          ...p,
          judul: editingPayment.judul,
          nomorSurat: editingPayment.nomorSurat,
          bulan: editingPayment.bulan,
          tahun: editingPayment.tahun,
          kategori: editingPayment.kategori,
          tempatCetak: editingPayment.tempatCetak,
          tanggalCetak: editingPayment.tanggalCetak,
          mulaiBulan: editingPayment.bulan === 15 ? editingPayment.mulaiBulan : undefined,
          sampaiBulan: editingPayment.bulan === 15 ? editingPayment.sampaiBulan : undefined,
          itemNominatif: updatedItems,
        };
      }
      return p;
    });

    setPembayaranList(updatedList);
    setEditingPayment(null);
  };

  // Helper to resolve an employee's category and filter nominative items
  const getPegawaiCategory = (item: ItemNominatif) => {
    const peg = pegawaiList.find(p => p.id === item.pegawaiId || p.nip === item.nip);
    return peg?.kategori || '';
  };

  const getFilteredNominatif = (items: ItemNominatif[]) => {
    let filtered = items;
    if (filterPegawaiKategori !== 'Semua') {
      filtered = filtered.filter(item => getPegawaiCategory(item) === filterPegawaiKategori);
    }
    // Filter out Tukin if Nilai Grade is not greater than Gaji Pokok
    filtered = filtered.filter(item => {
      if (item.bayarTukin && item.tarifTukinDasar <= item.gajiPokok) {
        return false;
      }
      return true;
    });
    return filtered;
  };

  // Sum aggregates for current list
  const getAggregates = (payment: PembayaranTunjangan) => {
    let brutoTPG = 0;
    let brutoTukin = 0;
    let pphTPG = 0;
    let pphTukin = 0;
    let netTPG = 0;
    let netTukin = 0;
    let totalBruto = 0;
    let totalPPh = 0;
    let totalNetto = 0;
    let totalGajiPokok = 0;

    const items = getFilteredNominatif(payment.itemNominatif);
    const isTukin = payment.kategori?.includes('Tukin') || payment.judul.toLowerCase().includes('tukin');
    
    let multiplier = 1;
    if (payment.bulan === 15) {
      multiplier = (payment.sampaiBulan || 3) - (payment.mulaiBulan || 1) + 1;
    } else if (payment.judul.toLowerCase().includes('triwulan') || payment.judul.toLowerCase().includes('3 bulan')) {
      multiplier = 3;
    } else if (payment.judul.toLowerCase().includes('semester')) {
      multiplier = 6;
    }

    items.forEach(item => {
      totalGajiPokok += item.gajiPokok;
      if (isTukin) {
        const presenceFactor = (item.persenKehadiran ?? 100) / 100;
        const selisihBase = Math.max(0, item.tarifTukinDasar - item.gajiPokok);
        const selisih = Math.round(selisihBase * multiplier * presenceFactor);
        const potongan = item.potonganTukinManual ?? 0;
        const bersih = selisih - potongan;
        const tax = Math.round(bersih * item.tarifPPhTukin);
        const bruto = bersih + tax;
        const diterima = bersih;

        brutoTukin += bruto;
        pphTukin += tax;
        netTukin += diterima;
        totalBruto += bruto;
        totalPPh += tax;
        totalNetto += diterima;
      } else {
        brutoTPG += item.brutoTPG;
        pphTPG += item.potonganPPhTPG;
        netTPG += item.nettoTPG;
        totalBruto += item.totalBruto;
        totalPPh += item.totalPPh;
        totalNetto += item.totalNetto;
      }
    });

    return { brutoTPG, brutoTukin, pphTPG, pphTukin, netTPG, netTukin, totalBruto, totalPPh, totalNetto, totalGajiPokok, count: items.length };
  };

  const handlePrint = () => {
    const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (isIframe) {
      setShowPrintHelper(true);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6 w-full max-w-[297mm] mx-auto">
      {/* Dynamic print-only style tag to bypass standard layout blocks and render high-fidelity Landscape PDF */}
      <style>{`
        /* Remove vertical borders for print-table on screen as well */
        .print-table {
          border-collapse: collapse !important;
          border-top: 1.5px solid black !important;
          border-bottom: 1.5px solid black !important;
          border-left: none !important;
          border-right: none !important;
        }
        .print-table th, .print-table td {
          border-top: 1px solid black !important;
          border-bottom: 1px solid black !important;
          border-left: none !important;
          border-right: none !important;
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 1.5cm 1cm 1.5cm 1cm;
          }
          
          /* Enforce white background and black text on html, body, and all structural wrappers */
          html, body, #root, #root > div, main {
            background-color: white !important;
            background-image: none !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Hide everything in the page by default using visibility to avoid physical space of elements */
          body * {
            visibility: hidden;
            background-color: transparent !important;
            border-color: transparent !important;
            box-shadow: none !important;
          }

          /* Show ONLY the print area and its descendants */
          .print-area, .print-area * {
            visibility: visible;
          }

          /* Reinstate correct layout display for print elements */
          .print-area {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }

          /* Enforce real table layouts for print-table */
          .print-table {
            display: table !important;
            border-collapse: collapse !important;
            border-top: 1.5px solid black !important;
            border-bottom: 1.5px solid black !important;
            border-left: none !important;
            border-right: none !important;
            width: 100% !important;
            margin-top: 15px !important;
          }

          .print-table thead {
            display: table-header-group !important;
          }

          .print-table tr {
            display: table-row !important;
            page-break-inside: avoid !important;
          }

          .print-table th, .print-table td {
            display: table-cell !important;
            border-top: 1px solid black !important;
            border-bottom: 1px solid black !important;
            border-left: none !important;
            border-right: none !important;
            padding: 6px 8px !important;
            color: black !important;
            background-color: transparent !important;
            vertical-align: middle;
          }

          .print-table th {
            font-weight: bold !important;
            text-align: center !important;
            background-color: #f1f5f9 !important; /* light gray for header */
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Spacings inside cells */
          .print-table td {
            font-size: 10px !important;
          }

          /* Hide preview helper headers & non-print footers */
          .no-print, .no-print * {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .signature-section {
            display: grid !important;
            page-break-inside: avoid !important;
            margin-top: 30px !important;
          }
        }
      `}</style>

      {/* Main List View (Active when no activePaymentId chosen) */}
      {!activePaymentId ? (
        <div className="space-y-6 animate-fade-in">
          {/* Tabs Menu */}
          <div className="flex border border-white/10 bg-white/5 p-1 rounded-xl gap-2 no-print overflow-x-auto scrollbar-none mb-1">
            {(['Pembayaran TPG', 'Pembayaran Tukin', 'Kekurangan TPG', 'Kekurangan Tukin'] as const).map((tab) => {
              const isActive = activeTabState === tab;
              const count = pembayaranList.filter(p => getPaymentCategory(p) === tab).length;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTabState(tab)}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer text-center whitespace-nowrap flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 bg-transparent'
                  }`}
                >
                  <span>{tab}</span>
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none ${
                    isActive ? 'bg-[#0f172a] text-amber-500' : 'bg-white/10 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Configuration & Filter Controls Bar */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg no-print w-full">
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-4">
              <div className="flex flex-col sm:flex-row gap-4 items-end flex-grow max-w-2xl">
                <div className="w-full sm:flex-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5 font-sans">Bulan</label>
                  <select
                    value={filterBulan}
                    onChange={(e) => setFilterBulan(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 text-white p-2.5 rounded-xl text-sm outline-none font-medium hover:border-white/20 transition-all cursor-pointer focus:ring-1 focus:ring-amber-500 font-sans"
                  >
                    <option value="Semua" className="bg-[#1e293b]">Semua Bulan</option>
                    {INDONESIAN_MONTHS.map((m, idx) => (
                      <option key={idx} value={String(idx + 1)} className="bg-[#1e293b]">{m}</option>
                    ))}
                    <option value="THR" className="bg-[#1e293b]">THR</option>
                    <option value="KE-13" className="bg-[#1e293b]">KE-13</option>
                    <option value="15" className="bg-[#1e293b]">Triwulan</option>
                  </select>
                </div>

                <div className="w-full sm:flex-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5 font-sans">Kategori Jabatan/Guru</label>
                  <select
                    value={filterPegawaiKategori}
                    onChange={(e) => setFilterPegawaiKategori(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 text-white p-2.5 rounded-xl text-sm outline-none font-medium hover:border-white/20 transition-all cursor-pointer focus:ring-1 focus:ring-amber-500 font-sans"
                  >
                    <option value="Semua" className="bg-[#1e293b]">Semua Kategori</option>
                    {Array.from(new Set([
                      ...kategoriRefs.map(k => k.nama),
                      ...pegawaiList.map(peg => peg.kategori).filter(Boolean) as string[]
                    ])).map((cat) => (
                      <option key={cat} value={cat} className="bg-[#1e293b]">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setCreateKategori(activeTabState);
                    setBayarTPG(activeTabState.includes('TPG'));
                    setBayarTukin(activeTabState.includes('Tukin'));
                    setShowCreateForm(true);
                  }}
                  className="w-full md:w-auto h-[42px] flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-450 text-white font-semibold px-6 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer text-sm font-sans"
                >
                  <Plus size={16} />
                  <span>Buat Pembayaran</span>
                </button>
              </div>
            </div>
          </div>

          {/* New Distribution Form Box */}
          {showCreateForm && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl animate-fade-in text-slate-100">
              <div className="flex items-center justify-between mb-4 border-b pb-2 border-white/10">
                <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <Plus size={18} className="text-emerald-400" />
                  Inisiasi Pembayaran Tunjangan Baru
                </h3>
                <button 
                  onClick={() => setShowCreateForm(false)} 
                  className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
              </div>

               <form onSubmit={handleCreatePayment} className="space-y-4">
                {/* Baris 1 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1">Judul / Nama Agenda Pembayaran</label>
                    <input
                      type="text"
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      placeholder="Contoh: Pembayaran TPG & Tukin Guru Semester I - Juni 2026"
                      className="w-full bg-[#0f172a] p-2 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Nomor Surat Keputusan</label>
                    <input
                      type="text"
                      value={nomorSurat}
                      onChange={(e) => setNomorSurat(e.target.value)}
                      placeholder="Contoh: SK.129/Depdik-Keu/2026"
                      className="w-full bg-[#0f172a] p-2 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Kategori Agenda Pembayaran</label>
                    <select
                      value={createKategori}
                      onChange={(e) => {
                        const val = e.target.value as 'Pembayaran TPG' | 'Pembayaran Tukin' | 'Kekurangan TPG' | 'Kekurangan Tukin' | '';
                        setCreateKategori(val);
                        if (val) {
                          setBayarTPG(val.includes('TPG'));
                          setBayarTukin(val.includes('Tukin'));
                        }
                      }}
                      className="w-full bg-[#0f172a] border border-white/10 text-white p-2 rounded-xl text-sm outline-none font-medium"
                    >
                      <option value="" className="bg-[#1e293b]">-- Tanpa Kategori --</option>
                      <option value="Pembayaran TPG" className="bg-[#1e293b]">Pembayaran TPG</option>
                      <option value="Pembayaran Tukin" className="bg-[#1e293b]">Pembayaran Tukin</option>
                      <option value="Kekurangan TPG" className="bg-[#1e293b]">Kekurangan TPG</option>
                      <option value="Kekurangan Tukin" className="bg-[#1e293b]">Kekurangan Tukin</option>
                    </select>
                  </div>
                </div>

                {/* Baris 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Kategori Pegawai</label>
                    <select
                      value={createPilihKategoriPegawai}
                      onChange={(e) => setCreatePilihKategoriPegawai(e.target.value)}
                      className="w-full bg-[#0f172a] border border-white/10 text-white p-2 rounded-xl text-sm outline-none font-medium text-slate-100 hover:border-white/20 transition-all cursor-pointer focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Semua" className="bg-[#1e293b]">Semua Kategori</option>
                      {kategoriRefs.map((kat) => (
                        <option key={kat.id} value={kat.nama} className="bg-[#1e293b]">{kat.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Bulan</label>
                    <select
                      value={bulan}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setBulan(val);
                        if (val === 15) {
                          setShowTriwulanDialog(true);
                        }
                      }}
                      className="w-full bg-[#0f172a] border border-white/10 text-white p-2 rounded-xl text-sm outline-none font-medium text-slate-100"
                    >
                      {INDONESIAN_MONTHS.map((m, idx) => (
                        <option key={m} value={idx + 1} className="bg-[#1e293b]">{m}</option>
                      ))}
                      <option value={13} className="bg-[#1e293b]">THR (Tunjangan Hari Raya)</option>
                      <option value={14} className="bg-[#1e293b]">KE-13 (Gaji/Tunjangan Ke-13)</option>
                      <option value={15} className="bg-[#1e293b]">Triwulan</option>
                    </select>
                    {bulan === 15 && (
                      <button
                        type="button"
                        onClick={() => setShowTriwulanDialog(true)}
                        className="text-[11px] text-emerald-400 mt-1 hover:underline flex items-center gap-1 cursor-pointer select-none"
                      >
                        <span>✏️ Range: {INDONESIAN_MONTHS[createMulaiBulan - 1]} - {INDONESIAN_MONTHS[createSampaiBulan - 1]}</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Tahun</label>
                    <select
                      value={tahun}
                      onChange={(e) => setTahun(Number(e.target.value))}
                      className="w-full bg-[#0f172a] border border-white/10 text-white p-2 rounded-xl text-sm outline-none"
                    >
                      <option value={2026} className="bg-[#1e293b]">2026</option>
                      <option value={2025} className="bg-[#1e293b]">2025</option>
                      <option value={2024} className="bg-[#1e293b]">2024</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Tempat Cetak</label>
                    <input
                      type="text"
                      required
                      value={createTempatCetak}
                      onChange={(e) => setCreateTempatCetak(e.target.value)}
                      placeholder="Contoh: Palopo"
                      className="w-full bg-[#0f172a] p-2 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm hover:border-white/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Tanggal Cetak</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={createTanggalCetak}
                        onChange={(e) => setCreateTanggalCetak(e.target.value)}
                        placeholder="dd/mm/yyyy"
                        className="w-full bg-[#0f172a] pl-3 pr-10 py-2 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm font-mono hover:border-white/20 transition-all overlay-none"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none p-1 flex items-center justify-center">
                        <Calendar size={16} />
                      </div>
                      <input 
                        type="date"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 opacity-0 cursor-pointer text-slate-100"
                        onChange={(e) => {
                          if (e.target.value) {
                            const [yyyy, mm, dd] = e.target.value.split('-');
                            setCreateTanggalCetak(`${dd}/${mm}/${yyyy}`);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Checklist Pegawai (Specifically for Kekurangan Tukin and Kekurangan TPG) */}
                {(createKategori === 'Kekurangan Tukin' || createKategori === 'Kekurangan TPG') && (
                  <div className="bg-[#0f172a]/60 border border-white/10 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">
                        Pilih Pegawai Unit: <span className="text-amber-400 font-extrabold">{createPilihKategoriPegawai}</span> ({selectedPegawaiIds.length} terpilih)
                      </span>
                      <div className="flex gap-2 font-sans select-none">
                        <button
                          type="button"
                          onClick={() => {
                            const list = (createPilihKategoriPegawai === 'Semua'
                              ? pegawaiList
                              : pegawaiList.filter(p => p.kategori === createPilihKategoriPegawai)
                            ).filter(p => p.adaNpwp !== false);
                            setSelectedPegawaiIds(list.map(p => p.id));
                          }}
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                        >
                          Pilih Semua
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPegawaiIds([]);
                          }}
                          className="text-[11px] font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          Kosongkan All
                        </button>
                      </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/15 pr-1 space-y-1.5">
                      {(() => {
                        const list = (createPilihKategoriPegawai === 'Semua'
                          ? pegawaiList
                          : pegawaiList.filter(p => p.kategori === createPilihKategoriPegawai)
                        ).filter(p => p.adaNpwp !== false);
                        
                        if (list.length === 0) {
                          return (
                            <div className="text-center py-4 text-xs text-slate-400">
                              Tidak ada pegawai untuk kategori "{createPilihKategoriPegawai}".
                            </div>
                          );
                        }

                        return list.map((peg) => {
                          const isChecked = selectedPegawaiIds.includes(peg.id);
                          return (
                            <div 
                              key={peg.id}
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedPegawaiIds(selectedPegawaiIds.filter(id => id !== peg.id));
                                } else {
                                  setSelectedPegawaiIds([...selectedPegawaiIds, peg.id]);
                                }
                              }}
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border select-none ${
                                isChecked 
                                  ? 'bg-[#1e293b]/80 border-emerald-500/40 text-white' 
                                  : 'bg-[#1e293b]/20 border-white/5 text-slate-400 hover:bg-[#1e293b]/40'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="text-emerald-400 flex items-center justify-center">
                                  {isChecked ? (
                                    <CheckSquare size={16} className="text-emerald-400" />
                                  ) : (
                                    <Square size={16} className="text-slate-500" />
                                  )}
                                </div>
                                <div className="leading-tight text-left">
                                  <div className="text-xs font-bold font-sans">{peg.nama}</div>
                                  <div className="text-[10px] font-mono opacity-85">{peg.nip ? `NIP. ${peg.nip}` : 'NIP. -'}</div>
                                </div>
                              </div>
                              <div className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#0f172a]/60 text-slate-300">
                                {peg.golongan}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* Tombol Generasi */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-450 text-white font-bold h-[38px] px-8 rounded-xl cursor-pointer text-sm shadow-md transition-colors font-sans"
                  >
                    Generate Nominatif
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table list of distributions */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-[10px] text-slate-350 uppercase tracking-widest font-bold font-sans">
                    <th className="py-2.5 px-5">Agenda Pembayaran</th>
                    <th className="py-2.5 px-5">Periode Tunjangan</th>
                    <th className="py-2.5 px-5">Cakupan Tunjangan</th>
                    <th className="py-2.5 px-5">Jumlah Guru</th>
                    <th className="py-2.5 px-5 text-right">
                      {activeTabState === 'Pembayaran TPG' ? 'TOTAL GAJI POKOK' : 'Total Netto Dibayarkan'}
                    </th>
                    <th className="py-2.5 px-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {(() => {
                    const filteredPayments = pembayaranList.filter(p => {
                      // Filter by category
                      if (getPaymentCategory(p) !== activeTabState) return false;
                      
                      // Filter by Bulan
                      if (filterBulan !== 'Semua') {
                        if (filterBulan === 'THR' && p.bulan !== 13) return false;
                        if (filterBulan === 'KE-13' && p.bulan !== 14) return false;
                        if (filterBulan !== 'THR' && filterBulan !== 'KE-13' && p.bulan !== Number(filterBulan)) return false;
                      }
                      
                      // Filter by Tahun
                      if (filterTahun.trim() !== '') {
                        if (p.tahun.toString() !== filterTahun.trim()) return false;
                      }

                      // Filter by Employee Category
                      if (filterPegawaiKategori !== 'Semua') {
                        const items = getFilteredNominatif(p.itemNominatif);
                        if (items.length === 0) return false;
                      }
                      
                      return true;
                    });
                    if (filteredPayments.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="text-center py-16 text-slate-400">
                            <Award size={48} className="mx-auto text-slate-400 mb-2 opacity-50" />
                            <span className="block font-semibold text-white">Belum Ada Agenda Pembayaran Registrasi</span>
                            <span className="text-xs text-slate-400">Belum ada agenda terdaftar di bawah kategori atau filter pencarian Anda.</span>
                          </td>
                        </tr>
                      );
                    }
                    return filteredPayments.map((p) => {
                      const { totalNetto, totalGajiPokok, count } = getAggregates(p);
                      const isTPGIncluded = p.itemNominatif.some(item => item.bayarTPG);
                      const isTukinIncluded = p.itemNominatif.some(item => item.bayarTukin);
                      return (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                          <td className="py-2.5 px-5">
                            <div className="font-bold text-white leading-snug">
                              {(() => {
                                let cleaned = p.judul
                                  .replace(/Pembayaran TPG\s*(&|dan|dan\/atau|\+)?\s*/gi, '')
                                  .trim();
                                if (cleaned.startsWith('&') || cleaned.startsWith('dan')) {
                                  cleaned = cleaned.replace(/^(&|dan|\+)\s*/gi, '').trim();
                                }
                                if (!cleaned) {
                                  cleaned = 'Tunjangan Profesi';
                                }
                                if (cleaned.match(/^[a-z]/)) {
                                  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
                                }
                                return cleaned;
                              })()}
                            </div>
                          </td>
                          <td className="py-2.5 px-5">
                            <span className="font-semibold text-slate-200">
                              {p.bulan === 13 ? 'THR' : p.bulan === 14 ? 'KE-13' : p.bulan === 15 ? `Triwulan ${INDONESIAN_MONTHS[(p.mulaiBulan || 1) - 1]} - ${INDONESIAN_MONTHS[(p.sampaiBulan || 3) - 1]}` : INDONESIAN_MONTHS[p.bulan - 1]} {p.tahun}
                            </span>
                          </td>
                          <td className="py-2.5 px-5">
                            <div className="flex flex-wrap gap-1">
                              {isTPGIncluded && (
                                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 border border-emerald-500/20 rounded font-bold uppercase">
                                  TPG (Profesi)
                                </span>
                              )}
                              {isTukinIncluded && (
                                <span className="bg-purple-500/10 text-purple-400 text-[9px] px-1.5 py-0.5 border border-purple-500/20 rounded font-bold uppercase">
                                  Tukin (Kinerja)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-5 font-semibold text-slate-300">
                            {count} Guru
                          </td>
                          <td className="py-2.5 px-5 text-right font-bold text-emerald-300 font-mono">
                            {activeTabState === 'Pembayaran TPG' ? formatRupiah(totalGajiPokok) : formatRupiah(totalNetto)}
                          </td>
                          <td className="py-2.5 px-5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setActivePaymentId(p.id)}
                                className="p-1.5 bg-white/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded transition cursor-pointer flex items-center justify-center"
                                title="Buka Detail & Cetak"
                              >
                                <Printer size={13} />
                              </button>
                              <button
                                onClick={() => setEditingPayment({ ...p })}
                                className="p-1.5 bg-white/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 rounded transition cursor-pointer flex items-center justify-center"
                                title="Edit Agenda Pembayaran"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => handleDeletePembayaran(p.id, p.judul)}
                                className="p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 rounded transition cursor-pointer flex items-center justify-center"
                                title="Hapus Agenda"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Nominative View for Selected Payment Rounds */
        <div className="space-y-6 animate-fade-in text-slate-100">
          {/* Quick Header Data Info */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5 no-print">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white">{activePayment.judul}</h2>
              <p className="text-slate-300 text-xs font-mono">Mandat SK: {activePayment.nomorSurat} • Periode: {activePayment.bulan === 13 ? 'THR' : activePayment.bulan === 14 ? 'KE-13' : activePayment.bulan === 15 ? `Bulan ${INDONESIAN_MONTHS[(activePayment.mulaiBulan || 1) - 1]} - ${INDONESIAN_MONTHS[(activePayment.sampaiBulan || 3) - 1]}` : INDONESIAN_MONTHS[activePayment.bulan - 1]} {activePayment.tahun}</p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActivePaymentId(null)}
                className="flex items-center gap-1 bg-slate-900 border border-white/10 hover:bg-slate-800 text-white text-xs p-2 py-1.5 rounded-lg font-bold transition shadow-md cursor-pointer no-print"
              >
                <ChevronLeft size={12} />
                Kembali
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 bg-slate-900 border border-white/10 hover:bg-slate-800 text-white text-xs p-2 py-1.5 rounded-lg font-bold transition shadow-md cursor-pointer"
              >
                <Printer size={12} />
                Unduh PDF / Cetak
              </button>
            </div>
          </div>





          {/* HIGH-FIDELITY GOVERNMENT-STYLE PRINT AREA BELOW (Visible on print, or nicely embedded) */}
          <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-2xl print-area text-slate-900 leading-normal space-y-6 w-full max-w-[297mm] min-h-[210mm] mx-auto overflow-x-auto shadow-black/25" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <h4 className="text-xs text-center border-b border-emerald-500/30 pb-2 text-emerald-600 block font-bold no-print">
              PRATINJAU DOKUMEN CETAK / SAVE AS PDF (FORMAL INDONESIA)
            </h4>

            {/* Document Title */}
            <div className="text-center space-y-0 pt-4" style={{ fontFamily: 'Cambria, Georgia, serif' }}>
              <h3 className="text-[18px] md:text-[22px] font-extrabold uppercase tracking-wide leading-tight">
                {activePayment.kategori === 'Kekurangan TPG'
                  ? 'DAFTAR NOMINATIF KEKURANGAN TUNJANGAN PROFESI GURU'
                  : activePayment.kategori === 'Kekurangan Tukin'
                    ? 'DAFTAR NOMINATIF KEKURANGAN TUNJANGAN KINERJA GURU'
                    : activePayment.kategori?.includes('TPG')
                      ? 'DAFTAR NOMINATIF PEMBAYARAN TUNJANGAN PROFESI GURU' 
                      : 'DAFTAR NOMINATIF PEMBAYARAN TUNJANGAN KINERJA GURU'}
              </h3>
              <p className="text-[17px] md:text-[20px] tracking-wide font-bold uppercase leading-none mt-0.5">
                {satkerName}
              </p>
              <p className="text-[13px] tracking-wide leading-none mt-0.5 font-bold uppercase">
                {activePayment.pilihKategoriPegawai && activePayment.pilihKategoriPegawai !== 'Semua' 
                  ? activePayment.pilihKategoriPegawai 
                  : 'SEMUA KATEGORI'}{' - '}
                {activePayment.bulan === 13 
                  ? `THR TAHUN ${activePayment.tahun}` 
                  : activePayment.bulan === 14 
                    ? `GAJI KE-13 TAHUN ${activePayment.tahun}` 
                    : activePayment.bulan === 15
                      ? `BULAN ${INDONESIAN_MONTHS[(activePayment.mulaiBulan || 1) - 1]?.toUpperCase()} - ${INDONESIAN_MONTHS[(activePayment.sampaiBulan || 3) - 1]?.toUpperCase()} TAHUN ${activePayment.tahun}`
                      : `BULAN ${INDONESIAN_MONTHS[activePayment.bulan - 1]?.toUpperCase()} TAHUN ${activePayment.tahun}`}
              </p>
            </div>            {/* Print Table */}
            <table className="w-full text-[11px] border-collapse print-table">
              <thead>
                {activePayment.kategori === 'Kekurangan Tukin' ? (
                  <tr className="bg-slate-50 text-[11px] font-bold">
                    <th className="border border-black py-1 px-1 text-center font-bold">NO</th>
                    <th className="border border-black py-1 px-2 text-left font-bold">NAMA / NIP</th>
                    <th className="border border-black py-1 px-1 text-center font-bold">GOL</th>
                    <th className="border border-black py-1 px-2 text-right font-bold">
                      <div className="leading-tight">JMLH KEKURANGAN</div>
                      <div className="leading-tight font-bold text-[11px] text-slate-900">JMLH BULAN</div>
                    </th>
                    <th className="border border-black py-1 px-2 text-right font-bold">
                      <div className="leading-tight font-sans">JMLH TOTAL</div>
                      <div className="leading-tight font-bold text-[11px] text-slate-900">PPH</div>
                    </th>
                    <th className="border border-black py-1 px-2 text-right font-bold">
                      <div className="leading-tight font-sans">JMLH BRUTO</div>
                      <div className="leading-tight font-bold text-[11px] text-slate-900">JMLH DITERIMA</div>
                    </th>
                    <th className="border border-black py-1 px-2 text-left font-bold font-sans">NO. REKENING</th>
                    <th className="border border-black py-1 px-2 text-center font-bold" style={{ width: '90px' }}>
                      <div className="leading-tight">TANDA</div>
                      <div className="leading-tight">TANGAN</div>
                    </th>
                  </tr>
                ) : activePayment.kategori === 'Pembayaran Tukin' ? (
                  <tr className="bg-slate-50 text-[11px] font-bold">
                    <th className="border border-black py-1 px-1 text-center font-bold">NO</th>
                    <th className="border border-black py-1 px-2 text-left font-bold">NAMA / NIP</th>
                    <th className="border border-black py-1 px-1 text-center font-bold">GOL</th>
                    <th className="border border-black py-1 px-2 text-right font-bold">
                      <div className="leading-tight">NILAI GRADE</div>
                      <div className="leading-tight font-bold text-[11px] text-slate-900">GAJI POKOK</div>
                    </th>
                    <th className="border border-black py-1 px-2 text-right font-bold">
                      <div className="leading-tight">JMLH SELISIH</div>
                      <div className="leading-tight font-bold text-[11px] text-slate-900">JMLH POTONGAN</div>
                    </th>
                    <th className="border border-black py-1 px-2 text-right font-bold">
                      <div className="leading-tight font-sans">JMLH BERSIH</div>
                      <div className="leading-tight font-bold text-[11px] text-slate-900">PPH</div>
                    </th>
                    <th className="border border-black py-1 px-2 text-right font-bold">
                      <div className="leading-tight font-sans">JMLH BRUTO</div>
                      <div className="leading-tight font-bold text-[11px] text-slate-900">JMLH DITERIMA</div>
                    </th>
                    <th className="border border-black py-1 px-2 text-left font-bold font-sans">NO. REKENING</th>
                    <th className="border border-black py-1 px-2 text-center font-bold" style={{ width: '90px' }}>
                      <div className="leading-tight">TANDA</div>
                      <div className="leading-tight">TANGAN</div>
                    </th>
                  </tr>
                ) : activePayment.kategori?.includes('Tukin') ? (
                  <tr className="bg-slate-50 text-[11px] font-bold">
                    <th className="border border-black py-1 px-1 text-center font-bold">NO</th>
                    <th className="border border-black py-1 px-2 text-left font-bold">NAMA / NIP</th>
                    <th className="border border-black py-1 px-1 text-center font-bold">GOL</th>
                    <th className="border border-black py-1 px-2 text-right font-bold">
                      <div className="leading-tight">NILAI GRADE</div>
                      <div className="leading-tight font-bold text-[11px] text-slate-900">GAJI POKOK</div>
                    </th>
                    <th className="border border-black py-1 px-2 text-right font-bold">
                      <div className="leading-tight">JMLH SELISIH</div>
                      <div className="leading-tight font-bold text-[11px] text-slate-900">JMLH POTONGAN</div>
                    </th>
                    <th className="border border-black py-1 px-2 text-right font-bold">
                      <div className="leading-tight font-sans">JMLH BERSIH</div>
                      <div className="leading-tight font-bold text-[11px] text-slate-900">PPH</div>
                    </th>
                    <th className="border border-black py-1 px-2 text-right font-bold">
                      <div className="leading-tight font-sans">JMLH BRUTO</div>
                      <div className="leading-tight font-bold text-[11px] text-slate-900">JMLH DITERIMA</div>
                    </th>
                    <th className="border border-black py-1 px-2 text-left font-bold font-sans">NO. REKENING</th>
                    <th className="border border-black py-1 px-2 text-center font-bold" style={{ width: '90px' }}>
                      <div className="leading-tight">TANDA</div>
                      <div className="leading-tight">TANGAN</div>
                    </th>
                  </tr>
                ) : activePayment?.kategori === 'Kekurangan TPG' ? (
                  <tr className="bg-slate-50 text-[11px] font-bold text-center">
                    <th className="border border-black py-1.5 px-1.5 text-center font-bold font-sans">NO</th>
                    <th className="border border-black py-1.5 px-2 text-center font-bold font-sans">NAMA / NIP</th>
                    <th className="border border-black py-1.5 px-1.5 text-center font-bold font-sans">GOL</th>
                    <th className="border border-black py-1.5 px-2 text-center font-bold font-sans">
                      <div className="leading-tight">JMLH</div>
                      <div className="leading-tight">KEKURANGAN</div>
                    </th>
                    <th className="border border-black py-1.5 px-2 text-center font-bold font-sans">
                      <div className="leading-tight">JMLH</div>
                      <div className="leading-tight">BULAN</div>
                    </th>
                    <th className="border border-black py-1.5 px-2 text-center font-bold font-sans">
                      <div className="leading-tight">JMLH</div>
                      <div className="leading-tight">TOTAL</div>
                    </th>
                    <th className="border border-black py-1.5 px-2 text-center font-bold font-sans">PPH</th>
                    <th className="border border-black py-1.5 px-2 text-center font-bold font-sans">NILAI BERSIH</th>
                    <th className="border border-black py-1.5 px-2 text-center font-bold font-sans">NO. REKENING</th>
                    <th className="border border-black py-1.5 px-2 text-center font-bold font-sans" style={{ width: '120px' }}>TANDA TANGAN</th>
                  </tr>
                ) : (
                  <tr className="bg-slate-50 text-[11px] font-bold">
                    <th className="border border-black py-1 px-1.5 text-center font-bold">No</th>
                    <th className="border border-black py-1 px-2 text-left font-bold">NAMA GURU / NIP</th>
                    <th className="border border-black py-1 px-1.5 text-center font-bold">GOL</th>
                    <th className="border border-black py-1 px-2 text-right font-bold font-sans">GAJI POKOK</th>
                    <th className="border border-black py-1 px-2 text-right font-bold font-sans">PPH</th>
                    <th className="border border-black py-1 px-2 text-right font-bold font-sans">JUMLAH BERSIH</th>
                    <th className="border border-black py-1 px-2 text-left font-bold font-sans">NOMOR REKENING</th>
                    <th className="border border-black py-1 px-2 text-center font-bold" style={{ width: '90px' }}>
                      <div className="leading-tight">TANDA</div>
                      <div className="leading-tight">TANGAN</div>
                    </th>
                  </tr>
                )}
              </thead>
              <tbody>
                {activePayment.kategori === 'Kekurangan Tukin' ? (
                  <>
                    {getFilteredNominatif(activePayment.itemNominatif).map((item, idx) => {
                      const peg = pegawaiList.find(x => x.id === item.pegawaiId || x.nip === item.nip);
                      const key = item.pegawaiId || idx;
                      
                      const rawShortage = manualShortageTukin[key] ?? '0';
                      const kekuranganStr = rawShortage ? parseInt(rawShortage.replace(/[^0-9]/g, ''), 10).toLocaleString('id-ID') : '0';
                      const bulanStr = manualShortageTukinMonths[key] ?? '0';
                      
                      const kekuranganNum = parseFloat(kekuranganStr.replace(/[^0-9]/g, '')) || 0;
                      const bulanNum = parseFloat(bulanStr.replace(/[^0-9]/g, '')) || 0;
                      
                      const jmlhSelisih = kekuranganNum * bulanNum;
                      const jmlhBersih = jmlhSelisih;
                      const pph = Math.round(jmlhBersih * item.tarifPPhTukin);
                      const jmlhBruto = jmlhBersih + pph;
                      const jmlhDiterima = jmlhBersih;

                      return (
                        <tr key={item.pegawaiId || idx} className="hover:bg-slate-50 text-[11px]">
                          <td className="border border-black py-1 px-1 text-center align-middle">{idx + 1}</td>
                          <td className="border border-black py-1 px-2 align-middle font-bold leading-tight">
                            {item.nama}
                            <span className="block text-[11px] font-normal text-slate-600 mt-0.5">{item.nip}</span>
                          </td>
                          <td className="border border-black py-1 px-1 text-center align-middle">{item.golongan}</td>
                          
                          {/* JMLH KEKURANGAN & JMLH BULAN (MANUAL FILL) */}
                          <td className="border border-black py-1 px-2 text-right align-middle space-y-1">
                            <div className="flex items-center justify-end gap-1">
                              {/* On print, hide input and show normal formatted text */}
                              <span className="hidden print:inline font-bold text-slate-900 text-[11px] leading-none">
                                {kekuranganNum.toLocaleString('id-ID')}
                              </span>
                              {/* On screen, show input */}
                              <input
                                type="text"
                                placeholder="0"
                                value={kekuranganStr}
                                onChange={(e) => {
                                  const rawVal = e.target.value.replace(/[^0-9]/g, '');
                                  const formattedVal = rawVal ? parseInt(rawVal, 10).toLocaleString('id-ID') : '';
                                  setManualShortageTukin(prev => ({
                                    ...prev,
                                    [key]: formattedVal
                                  }));
                                }}
                                className="no-print w-18 text-right text-[11px] py-px px-1 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono transition-all leading-none focus:bg-white"
                              />
                            </div>
                            <div className="flex items-center justify-end gap-1">
                              {/* On print, hide input and show normal formatted text */}
                              <span className="hidden print:inline text-slate-600 text-[11px] leading-none">
                                {bulanNum}
                              </span>
                              {/* On screen, show input */}
                              <input
                                type="text"
                                placeholder="0"
                                value={bulanStr}
                                onChange={(e) => {
                                  const rawVal = e.target.value.replace(/[^0-9]/g, '');
                                  setManualShortageTukinMonths(prev => ({
                                    ...prev,
                                    [key]: rawVal
                                  }));
                                }}
                                className="no-print w-18 text-right text-[11px] py-px px-1 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono transition-all leading-none focus:bg-white"
                              />
                            </div>
                          </td>

                          {/* JMLH BERSIH & PPH */}
                          <td className="border border-black py-1 px-2 text-right align-middle font-sans space-y-0">
                            <div className="font-bold text-slate-900 leading-none">{jmlhBersih.toLocaleString('id-ID')}</div>
                            <div className="text-slate-600 text-[11px] leading-none mt-1">{pph.toLocaleString('id-ID')}</div>
                          </td>

                          {/* JMLH BRUTO & JMLH DITERIMA */}
                          <td className="border border-black py-1 px-2 text-right align-middle font-sans space-y-0">
                            <div className="font-bold text-slate-900 leading-none">{jmlhBruto.toLocaleString('id-ID')}</div>
                            <div className="text-slate-600 text-[11px] leading-none mt-1">{jmlhDiterima.toLocaleString('id-ID')}</div>
                          </td>

                          <td className="border border-black py-1 px-2 text-left align-middle font-sans">
                            {peg ? peg.bankRekening : '-'}
                          </td>

                          {/* Signature Column */}
                          <td className="border border-black py-1 px-2 text-left align-middle" style={{ width: '90px' }}>
                            <div className="text-left font-sans text-[11px]">
                              <span>{idx + 1}. ....................</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Kekurangan Tukin Aggregate Summary Row */}
                    {(() => {
                      const filteredItems = getFilteredNominatif(activePayment.itemNominatif);
                      
                      let totalKekurangan = 0;
                      let totalBulan = 0;
                      let totalJmlhBersih = 0;
                      let totalPph = 0;
                      let totalJmlhBruto = 0;
                      let totalJmlhDiterima = 0;

                      filteredItems.forEach((item, idx) => {
                        const key = item.pegawaiId || idx;
                        const rawShortage = manualShortageTukin[key] ?? '0';
                        const kVal = parseFloat(rawShortage.replace(/[^0-9]/g, '')) || 0;
                        const bVal = parseFloat(manualShortageTukinMonths[key] ?? '0') || 0;

                        const selisih = kVal * bVal;
                        const bersih = selisih;
                        const tax = Math.round(bersih * item.tarifPPhTukin);
                        const bruto = bersih + tax;
                        const diterima = bersih;

                        totalKekurangan += kVal;
                        totalBulan += bVal;
                        totalJmlhBersih += bersih;
                        totalPph += tax;
                        totalJmlhBruto += bruto;
                        totalJmlhDiterima += diterima;
                      });

                      return (
                        <tr className="font-bold bg-slate-100 text-slate-900 text-[11px]">
                          <td className="border border-black py-1.5 px-2 text-center" colSpan={3}>JUMLAH TOTAL</td>
                          {/* JMLH KEKURANGAN & JMLH BULAN TOTALS */}
                          <td className="border border-black py-1.5 px-2 text-right">
                            <div className="font-extrabold leading-none">{totalKekurangan.toLocaleString('id-ID')}</div>
                            <div className="font-bold text-slate-700 text-[11px] leading-none mt-1">{totalBulan.toLocaleString('id-ID')}</div>
                          </td>
                          {/* JMLH BERSIH & PPH TOTALS */}
                          <td className="border border-black py-1.5 px-2 text-right font-sans">
                            <div className="font-extrabold text-black leading-none">{totalJmlhBersih.toLocaleString('id-ID')}</div>
                            <div className="font-bold text-slate-700 text-[11px] leading-none mt-1">{totalPph.toLocaleString('id-ID')}</div>
                          </td>
                          {/* JMLH BRUTO & JMLH DITERIMA TOTALS */}
                          <td className="border border-black py-1.5 px-2 text-right font-sans">
                            <div className="font-extrabold text-black leading-none">{totalJmlhBruto.toLocaleString('id-ID')}</div>
                            <div className="font-bold text-slate-700 text-[11px] leading-none mt-1">{totalJmlhDiterima.toLocaleString('id-ID')}</div>
                          </td>
                          <td className="border border-black py-1.5 px-2 bg-slate-50"></td>
                          <td className="border border-black py-1.5 px-2 bg-slate-50"></td>
                        </tr>
                      );
                    })()}
                  </>
                ) : activePayment.kategori?.includes('Tukin') ? (
                  <>
                    {getFilteredNominatif(activePayment.itemNominatif).map((item, idx) => {
                      const peg = pegawaiList.find(x => x.id === item.pegawaiId || x.nip === item.nip);
                      
                      let multiplier = 1;
                      if (activePayment.bulan === 15) {
                        multiplier = (activePayment.sampaiBulan || 3) - (activePayment.mulaiBulan || 1) + 1;
                      } else if (activePayment.judul.toLowerCase().includes('triwulan') || activePayment.judul.toLowerCase().includes('3 bulan')) {
                        multiplier = 3;
                      } else if (activePayment.judul.toLowerCase().includes('semester')) {
                        multiplier = 6;
                      }

                      const nilaiGrade = item.tarifTukinDasar;
                      const gajiPokok = item.gajiPokok;
                      const selisihBase = Math.max(0, nilaiGrade - gajiPokok);
                      
                      const presenceFactor = (item.persenKehadiran ?? 100) / 100;
                      const jmlhSelisih = Math.round(selisihBase * multiplier * presenceFactor);
                      
                      const jmlhPotongan = item.potonganTukinManual ?? 0;
                      const jmlhBersih = jmlhSelisih - jmlhPotongan;
                      const pph = Math.round(jmlhBersih * item.tarifPPhTukin);
                      const jmlhBruto = jmlhBersih + pph;
                      const jmlhDiterima = jmlhBersih;                       return (
                        <tr key={item.pegawaiId || idx} className="hover:bg-slate-50 text-[11px]">
                          <td className="border border-black py-1 px-1 text-center align-middle">{idx + 1}</td>
                          <td className="border border-black py-1 px-2 align-middle font-bold leading-tight">
                            {item.nama}
                            <span className="block text-[11px] font-normal text-slate-600 mt-0.5">{item.nip}</span>
                          </td>
                          <td className="border border-black py-1 px-1 text-center align-middle">{item.golongan}</td>
                          {/* NILAI GRADE & GAJI POKOK */}
                          <td className="border border-black py-1 px-2 text-right align-middle space-y-0">
                            <div className="font-semibold text-slate-800 leading-none">{nilaiGrade.toLocaleString('id-ID')}</div>
                            <div className="text-slate-600 text-[11px] leading-none mt-1">{gajiPokok.toLocaleString('id-ID')}</div>
                          </td>
                          {/* JMLH SELISIH & JMLH POTONGAN */}
                          <td className="border border-black py-1 px-2 text-right align-middle space-y-1">
                            <div className="font-semibold text-slate-800 leading-none">{jmlhSelisih.toLocaleString('id-ID')}</div>
                            <div className="flex items-center justify-end gap-1">
                              {/* On print, hide input and show normal formatted text */}
                              <span className="hidden print:inline text-slate-600 text-[11px] leading-none">
                                {jmlhPotongan.toLocaleString('id-ID')}
                              </span>
                              {/* On screen, show input */}
                              <input
                                type="text"
                                value={item.potonganTukinManual !== undefined && item.potonganTukinManual !== 0 ? item.potonganTukinManual.toString() : ""}
                                placeholder="0"
                                onChange={(e) => {
                                  const raw = e.target.value.replace(/[^0-9]/g, '');
                                  const val = raw ? parseInt(raw, 10) : 0;
                                  handleUpdatePotongan(item.pegawaiId, val);
                                }}
                                className="no-print w-18 text-right text-[11px] py-px px-1 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono transition-all leading-none focus:bg-white"
                              />
                            </div>
                          </td>
                          {/* JMLH BERSIH & PPH */}
                          <td className="border border-black py-1 px-2 text-right align-middle font-sans space-y-0">
                            <div className="font-bold text-slate-900 leading-none">{jmlhBersih.toLocaleString('id-ID')}</div>
                            <div className="text-slate-600 text-[11px] leading-none mt-1">{pph.toLocaleString('id-ID')}</div>
                          </td>
                          {/* JMLH BRUTO & JMLH DITERIMA */}
                          <td className="border border-black py-1 px-2 text-right align-middle font-sans space-y-0">
                            <div className="font-bold text-slate-900 leading-none">{jmlhBruto.toLocaleString('id-ID')}</div>
                            <div className="text-slate-600 text-[11px] leading-none mt-1">{jmlhDiterima.toLocaleString('id-ID')}</div>
                          </td>
                          <td className="border border-black py-1 px-2 text-left align-middle font-sans">
                            {peg ? peg.bankRekening : '-'}
                          </td>
                          {/* Signature Column */}
                          <td className="border border-black py-1 px-2 text-left align-middle" style={{ width: '90px' }}>
                            <div className="text-left font-sans text-[11px]">
                              <span>{idx + 1}. ....................</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Tukin Aggregate Summary Row */}
                    {(() => {
                      const filteredItems = getFilteredNominatif(activePayment.itemNominatif);
                      
                      let multiplier = 1;
                      if (activePayment.bulan === 15) {
                        multiplier = (activePayment.sampaiBulan || 3) - (activePayment.mulaiBulan || 1) + 1;
                      } else if (activePayment.judul.toLowerCase().includes('triwulan') || activePayment.judul.toLowerCase().includes('3 bulan')) {
                        multiplier = 3;
                      } else if (activePayment.judul.toLowerCase().includes('semester')) {
                        multiplier = 6;
                      }

                      let totalNilaiGrade = 0;
                      let totalGajiPokok = 0;
                      let totalJmlhSelisih = 0;
                      let totalJmlhPotongan = 0;
                      let totalJmlhBersih = 0;
                      let totalPph = 0;
                      let totalJmlhBruto = 0;
                      let totalJmlhDiterima = 0;

                       filteredItems.forEach(item => {
                        const presenceFactor = (item.persenKehadiran ?? 100) / 100;
                        const selisihBase = Math.max(0, item.tarifTukinDasar - item.gajiPokok);
                        const selisih = Math.round(selisihBase * multiplier * presenceFactor);
                        const potongan = item.potonganTukinManual ?? 0;
                        const bersih = selisih - potongan;
                        const tax = Math.round(bersih * item.tarifPPhTukin);
                        const bruto = bersih + tax;
                        const diterima = bersih;

                        totalNilaiGrade += item.tarifTukinDasar;
                        totalGajiPokok += item.gajiPokok;
                        totalJmlhSelisih += selisih;
                        totalJmlhPotongan += potongan;
                        totalJmlhBersih += bersih;
                        totalPph += tax;
                        totalJmlhBruto += bruto;
                        totalJmlhDiterima += diterima;
                      });

                      return (
                        <tr className="font-bold bg-slate-100 text-slate-900 text-[11px]">
                          <td className="border border-black py-1.5 px-2 text-center" colSpan={3}>JUMLAH TOTAL</td>
                          {/* NILAI GRADE & GAJI POKOK TOTALS */}
                          <td className="border border-black py-1.5 px-2 text-right">
                            <div className="font-extrabold leading-none">{totalNilaiGrade.toLocaleString('id-ID')}</div>
                            <div className="font-bold text-slate-700 text-[11px] leading-none mt-1">{totalGajiPokok.toLocaleString('id-ID')}</div>
                          </td>
                          {/* JMLH SELISIH & JMLH POTONGAN TOTALS */}
                          <td className="border border-black py-1.5 px-2 text-right">
                            <div className="font-extrabold leading-none">{totalJmlhSelisih.toLocaleString('id-ID')}</div>
                            <div className="font-bold text-slate-700 text-[11px] leading-none mt-1">{totalJmlhPotongan.toLocaleString('id-ID')}</div>
                          </td>
                          {/* JMLH BERSIH & PPH TOTALS */}
                          <td className="border border-black py-1.5 px-2 text-right font-sans">
                            <div className="font-extrabold text-black leading-none">{totalJmlhBersih.toLocaleString('id-ID')}</div>
                            <div className="font-bold text-slate-700 text-[11px] leading-none mt-1">{totalPph.toLocaleString('id-ID')}</div>
                          </td>
                          {/* JMLH BRUTO & JMLH DITERIMA TOTALS */}
                          <td className="border border-black py-1.5 px-2 text-right font-sans">
                            <div className="font-extrabold text-black leading-none">{totalJmlhBruto.toLocaleString('id-ID')}</div>
                            <div className="font-bold text-slate-700 text-[11px] leading-none mt-1">{totalJmlhDiterima.toLocaleString('id-ID')}</div>
                          </td>
                          <td className="border border-black py-1.5 px-2 bg-slate-50"></td>
                          <td className="border border-black py-1.5 px-2 bg-slate-50"></td>
                        </tr>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    {activePayment?.kategori === 'Kekurangan TPG' ? (
                       <>
                        {getFilteredNominatif(activePayment.itemNominatif).map((item, idx) => {
                          const peg = pegawaiList.find(x => x.id === item.pegawaiId || x.nip === item.nip);
                          const key = item.pegawaiId || idx;
                          
                          // state values
                          const rawShortage = manualShortage[key] ?? '0';
                          const kekuranganStr = rawShortage ? parseInt(rawShortage.replace(/[^0-9]/g, ''), 10).toLocaleString('id-ID') : '0';
                          const bulanStr = manualShortageMonths[key] ?? '0';
                          
                          // Convert to numbers for sum/rendering
                          const kekuranganNum = parseFloat(kekuranganStr.replace(/[^0-9]/g, '')) || 0;
                          const bulanNum = parseFloat(bulanStr.replace(/[^0-9]/g, '')) || 0;
                          const totalNum = kekuranganNum * bulanNum;

                          // Auto calculate PPh based on Golongan and totalNum
                          const golRef = golonganRefs.find(g => g.golongan === item.golongan);
                          const tarifPph = golRef ? golRef.tarifPPhTPG : 0;
                          const pphNum = Math.round(totalNum * tarifPph);

                          const bersihNum = totalNum - pphNum;

                          // Left aligned signature for all: rata kiri
                          const sigText = `${idx + 1}. ....................`;

                          return (
                            <tr key={key} className="text-[11px] hover:bg-slate-50">
                              <td className="border border-black py-2 px-1 text-center align-middle">{idx + 1}</td>
                              <td className="border border-black py-2 px-2 font-bold leading-tight align-middle text-left">
                                {item.nama}
                                <span className="block text-[11px] font-normal text-slate-600 mt-0.5">{item.nip}</span>
                              </td>
                              <td className="border border-black py-2 px-1 text-center align-middle">{item.golongan}</td>
                              
                              {/* JMLH KEKURANGAN */}
                              <td className="border border-black py-2 px-2 text-right align-middle min-w-[120px]">
                                <input
                                  type="text"
                                  value={kekuranganStr}
                                  onChange={(e) => {
                                    const rawVal = e.target.value.replace(/[^0-9]/g, '');
                                    const formattedVal = rawVal ? parseInt(rawVal, 10).toLocaleString('id-ID') : '';
                                    setManualShortage(prev => ({
                                      ...prev,
                                      [key]: formattedVal
                                    }));
                                  }}
                                  className="w-full bg-transparent border-0 border-b border-dashed border-slate-400 focus:border-emerald-500 focus:ring-0 p-0 text-right font-sans font-bold text-[11px] outline-none text-slate-900 leading-tight placeholder:text-slate-400 placeholder:text-right"
                                />
                              </td>

                              {/* JMLH BULAN */}
                              <td className="border border-black py-2 px-2 text-center align-middle min-w-[60px]">
                                <input
                                  type="text"
                                  value={bulanStr}
                                  onChange={(e) => {
                                    const rawVal = e.target.value.replace(/[^0-9]/g, '');
                                    setManualShortageMonths(prev => ({
                                      ...prev,
                                      [key]: rawVal
                                    }));
                                  }}
                                  className="w-[45px] text-center bg-transparent border-0 border-b border-dashed border-slate-400 focus:border-emerald-500 focus:ring-0 p-0 font-sans font-bold text-[11px] outline-none text-slate-900 leading-tight"
                                />
                              </td>

                              {/* JMLH TOTAL */}
                              <td className="border border-black py-2 px-2 text-right align-middle font-bold text-slate-900 text-[11px]">
                                {totalNum.toLocaleString('id-ID')}
                              </td>

                              {/* PPH - AUTOMATIC */}
                              <td className="border border-black py-2 px-2 text-right align-middle font-bold text-slate-900 text-[11px]">
                                {pphNum.toLocaleString('id-ID')}
                              </td>

                              {/* NILAI BERSIH */}
                              <td className="border border-black py-2 px-2 text-right align-middle font-bold text-slate-950 text-[11px]">
                                {bersihNum.toLocaleString('id-ID')}
                              </td>

                              {/* NO. REKENING */}
                              <td className="border border-black py-2 px-2 text-left align-middle font-sans text-left">
                                {peg ? peg.bankRekening : '-'}
                              </td>

                              {/* TANDA TANGAN */}
                              <td className="border border-black py-2 px-2 text-left align-middle" style={{ width: '120px' }}>
                                <div className="text-left font-sans text-[11px] whitespace-pre">
                                  {sigText}
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {/* Aggregate Summary Row for Kekurangan TPG */}
                        {(() => {
                          const filteredItems = getFilteredNominatif(activePayment.itemNominatif);
                          
                          let sumTotal = 0;
                          let sumPph = 0;
                          let sumBersih = 0;

                          filteredItems.forEach((item, idx) => {
                            const key = item.pegawaiId || idx;
                            const kVal = parseFloat((manualShortage[key] ?? '0').replace(/[^0-9]/g, '')) || 0;
                            const bVal = parseFloat((manualShortageMonths[key] ?? '0').replace(/[^0-9]/g, '')) || 0;
                            
                            const tVal = kVal * bVal;
                            const golRef = golonganRefs.find(g => g.golongan === item.golongan);
                            const tarifPph = golRef ? golRef.tarifPPhTPG : 0;
                            const pVal = Math.round(tVal * tarifPph);

                            sumTotal += tVal;
                            sumPph += pVal;
                            sumBersih += (tVal - pVal);
                          });

                          return (
                            <tr className="font-bold bg-slate-100 text-[11px]">
                              <td className="border border-black py-2 px-2 text-center" colSpan={3}>JUMLAH TOTAL</td>
                              <td className="border border-black py-2 px-2 bg-slate-50"></td>
                              <td className="border border-black py-2 px-2 bg-slate-50"></td>
                              <td className="border border-black py-2 px-2 text-right">
                                {sumTotal.toLocaleString('id-ID')}
                              </td>
                              <td className="border border-black py-2 px-2 text-right">
                                {sumPph.toLocaleString('id-ID')}
                              </td>
                              <td className="border border-black py-2 px-2 text-right text-slate-950 font-black">
                                {sumBersih.toLocaleString('id-ID')}
                              </td>
                              <td className="border border-black py-2 px-2 bg-slate-50"></td>
                              <td className="border border-black py-2 px-2 bg-slate-50"></td>
                            </tr>
                          );
                        })()}
                      </>
                    ) : (
                      <>
                        {getFilteredNominatif(activePayment.itemNominatif).map((item, idx) => {
                          const peg = pegawaiList.find(x => x.id === item.pegawaiId || x.nip === item.nip);
                          return (
                            <tr key={item.pegawaiId} className="text-[11px]">
                              <td className="border border-black py-1 px-1 text-center align-middle">{idx + 1}</td>
                              <td className="border border-black py-1 px-2 font-bold leading-tight align-middle">
                                {item.nama}
                                <span className="block text-[11px] font-normal text-slate-600 mt-0.5">{item.nip}</span>
                              </td>
                              <td className="border border-black py-1 px-1 text-center align-middle">{item.golongan}</td>
                              <td className="border border-black py-1 px-2 text-right align-middle">
                                {item.gajiPokok.toLocaleString('id-ID')}
                              </td>
                              <td className="border border-black py-1 px-2 text-right align-middle">{item.totalPPh.toLocaleString('id-ID')}</td>
                              <td className="border border-black py-1 px-2 text-right font-bold align-middle">{item.totalNetto.toLocaleString('id-ID')}</td>
                              <td className="border border-black py-1 px-2 text-left align-middle font-sans">
                                {peg ? peg.bankRekening : '-'}
                              </td>
                              <td className="border border-black py-1 px-2 text-left align-middle" style={{ width: '90px' }}>
                                <div className="text-left font-sans text-[11px]">
                                  <span>{idx + 1}. ....................</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {(() => {
                          const filteredItems = getFilteredNominatif(activePayment.itemNominatif);
                          const { totalPPh, totalNetto } = getAggregates(activePayment);
                          const totalGajiPokok = filteredItems.reduce((acc, curr) => acc + curr.gajiPokok, 0);
                          return (
                            <tr className="font-bold bg-slate-100 text-[11px]">
                              <td className="border border-black py-1.5 px-2 text-center" colSpan={3}>TOTAL BULANAN</td>
                              <td className="border border-black py-1.5 px-2 text-right">
                                {totalGajiPokok.toLocaleString('id-ID')}
                              </td>
                              <td className="border border-black py-1.5 px-2 text-right">{totalPPh.toLocaleString('id-ID')}</td>
                              <td className="border border-black py-1.5 px-2 text-right text-slate-950 font-black">{totalNetto.toLocaleString('id-ID')}</td>
                              <td className="border border-black py-1.5 px-2 bg-slate-50"></td>
                              <td className="border border-black py-1.5 px-2 bg-slate-50"></td>
                            </tr>
                          );
                        })()}
                      </>
                    )}
                  </>
                )}
              </tbody>
            </table>

            {/* Bottom Signing Authorities blocks */}
            <div className={`grid ${pejabatList && pejabatList.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : pejabatList && pejabatList.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} pt-8 gap-8 signature-section text-xs`}>
              {pejabatList && pejabatList.length > 0 ? (
                pejabatList.map((pj, idx) => {
                  const showDate = idx === pejabatList.length - 1;
                  return (
                    <div key={pj.id || idx} className="text-center space-y-12">
                      <div className="space-y-1">
                        <p>
                          {showDate 
                            ? `${curTempatCetak}, ${formattedTanggalCetak}` 
                            : 'Mengetahui/Menyetujui,'}
                        </p>
                        <p className="font-bold text-[11px]">{pj.jabatan}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold underline text-[11px]">{pj.nama}</p>
                        <p className="text-[9px]">NIP. {pj.nip}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="text-center space-y-12">
                    <div className="space-y-1">
                      <p>Mengetahui/Menyetujui,</p>
                      <p className="font-bold">{jabatanInstansi}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold underline">{kpaNama}</p>
                      <p className="text-[10px]">NIP. {kpaNip}</p>
                    </div>
                  </div>

                  <div className="text-center space-y-12">
                    <div className="space-y-1">
                      <p>{curTempatCetak}, {formattedTanggalCetak}</p>
                      <p className="font-bold">Bendahara Pengeluaran</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold underline">{bendaharaNama}</p>
                      <p className="text-[10px]">NIP. {bendaharaNip}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-[#000000]/75 backdrop-blur-md flex justify-center items-center z-50 p-4 transition-all animate-fade-in" id="delete-payment-confirm-modal">
          <div className="bg-[#1e293b] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-rose-500/10 text-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-rose-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <Trash2 size={20} />
                <h3 className="text-base font-bold text-white">Konfirmasi Hapus Agenda</h3>
              </div>
              <button
                onClick={() => { setDeleteConfirmId(null); setDeleteConfirmJudul(''); }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3">
              <p className="text-sm text-slate-300">
                Apakah Anda yakin ingin menghapus agenda pembayaran <strong className="text-white">"{deleteConfirmJudul}"</strong>?
              </p>
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2.5">
                <div className="text-rose-400 mt-0.5 text-sm font-bold">⚠️</div>
                <div className="text-xs text-rose-300 leading-snug">
                  Tindakan ini permanen. Seluruh lembar nominatif, perhitungan persentase kehadiran, rincian potongan PPh 21, dan total bersih porsi TPG & Tukin terkait agenda ini akan dihapus sepenuhnya.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setDeleteConfirmId(null); setDeleteConfirmJudul(''); }}
                className="px-4 py-2 text-sm font-medium border border-white/10 text-slate-300 hover:bg-white/10 bg-transparent rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDeletePembayaran}
                className="px-5 py-2 text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20 cursor-pointer"
              >
                Ya, Hapus Agenda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print PDF Sandbox Limitation Helper Modal */}
      {showPrintHelper && (
        <div className="fixed inset-0 bg-[#000000]/75 backdrop-blur-md flex justify-center items-center z-50 p-4 transition-all animate-fade-in" id="print-helper-modal">
          <div className="bg-[#1e293b] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col border border-indigo-500/10 text-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-indigo-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <Printer size={20} />
                <h3 className="text-base font-bold text-white">Informasi Unduh PDF / Cetak</h3>
              </div>
              <button
                onClick={() => setShowPrintHelper(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                Browser membatasi pencetakan langsung dari dalam jendela pratinjau (iFrame) AI Studio karena aturan keamanan browser (sandbox).
              </p>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Langkah Mudah untuk Mencetak / Menyimpan PDF:</h4>
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 leading-relaxed">
                  <li>Klik tombol <strong className="text-white">"Buka di Tab Baru"</strong> di bawah ini (atau klik ikon 'Buka di Tab Baru' di pojok kanan atas menu pratinjau AI Studio).</li>
                  <li>Di halaman tab baru tersebut, silakan klik kembali agenda yang bersangkutan kemudian klik tombol <strong className="text-indigo-400">"Unduh PDF / Cetak"</strong>.</li>
                  <li>Pada kotak dialog cetak browser Anda, ubah tujuan menjadi <strong className="text-emerald-400">"Save as PDF"</strong> (Simpan sebagai PDF).</li>
                  <li>Pastikan Layout tersetting ke <strong className="text-emerald-400">"Landscape"</strong> (Lansekap).</li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPrintHelper(false)}
                className="px-4 py-2 text-sm font-medium border border-white/10 text-slate-300 hover:bg-white/10 bg-transparent rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowPrintHelper(false)}
                className="px-5 py-2 text-sm font-bold bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer text-center inline-flex items-center gap-1.5"
              >
                <Download size={14} />
                Buka di Tab Baru
              </a>
            </div>
          </div>
        </div>
      )}
      {/* Triwulan Month Range Selection Dialog */}
      {showTriwulanDialog && (
        <div className="fixed inset-0 bg-[#000000]/75 backdrop-blur-md flex justify-center items-center z-[100] p-4 transition-all animate-fade-in animate-once" id="triwulan-dialog">
          <div className="bg-[#1e293b] rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col border border-white/10 text-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-emerald-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span className="text-lg">🗓️</span>
                <h3 className="text-base font-bold text-white">Pilih Periode Triwulan</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowTriwulanDialog(false);
                }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Mulai Bulan</label>
                  <select
                    value={createMulaiBulan}
                    onChange={(e) => {
                      const start = Number(e.target.value);
                      setCreateMulaiBulan(start);
                      if (createSampaiBulan < start) {
                        setCreateSampaiBulan(start);
                      }
                    }}
                    className="w-full bg-[#0f172a] border border-white/10 text-white p-2.5 rounded-xl text-sm outline-none font-medium cursor-pointer"
                  >
                    {INDONESIAN_MONTHS.map((m, idx) => (
                      <option key={m} value={idx + 1} className="bg-[#1e293b]">{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Sampai Bulan</label>
                  <select
                    value={createSampaiBulan}
                    onChange={(e) => {
                      setCreateSampaiBulan(Number(e.target.value));
                    }}
                    className="w-full bg-[#0f172a] border border-white/10 text-white p-2.5 rounded-xl text-sm outline-none font-medium cursor-pointer"
                  >
                    {INDONESIAN_MONTHS.map((m, idx) => (
                      <option key={m} value={idx + 1} disabled={idx + 1 < createMulaiBulan} className="bg-[#1e293b]">{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowTriwulanDialog(false);
                }}
                className="px-5 py-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer transition select-none"
              >
                Simpan Periode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Agenda Pembayaran Dialog */}
      {editingPayment && (
        <div className="fixed inset-0 bg-[#000000]/75 backdrop-blur-md flex justify-center items-center z-[100] p-4 transition-all animate-fade-in animate-once" id="edit-payment-dialog">
          <div className="bg-[#1e293b] rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col border border-white/10 text-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-amber-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Pencil size={18} />
                <h3 className="text-base font-bold text-white">Edit Agenda Pembayaran</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPayment(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditPayment} className="flex flex-col overflow-hidden">
              {/* Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/15 pr-1">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Judul / Nama Agenda Pembayaran</label>
                    <input
                      type="text"
                      required
                      value={editingPayment.judul}
                      onChange={(e) => setEditingPayment(prev => prev ? { ...prev, judul: e.target.value } : null)}
                      className="w-full bg-[#0f172a] p-2.5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-xl text-sm"
                      placeholder="Contoh: Pembayaran TPG & Tukin Guru Semester I"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Nomor Surat Keputusan</label>
                      <input
                        type="text"
                        required
                        value={editingPayment.nomorSurat}
                        onChange={(e) => setEditingPayment(prev => prev ? { ...prev, nomorSurat: e.target.value } : null)}
                        className="w-full bg-[#0f172a] p-2.5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-xl text-sm"
                        placeholder="Contoh: SK.129/Depdik-Keu/2026"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Kategori Agenda Pembayaran</label>
                      <select
                        value={editingPayment.kategori || ''}
                        onChange={(e) => {
                          const val = e.target.value as 'Pembayaran TPG' | 'Pembayaran Tukin' | 'Kekurangan TPG' | 'Kekurangan Tukin';
                          setEditingPayment(prev => prev ? { ...prev, kategori: val } : null);
                        }}
                        className="w-full bg-[#0f172a] border border-white/10 text-white p-2.5 rounded-xl text-sm outline-none font-medium cursor-pointer"
                      >
                        <option value="Pembayaran TPG" className="bg-[#1e293b]">Pembayaran TPG</option>
                        <option value="Pembayaran Tukin" className="bg-[#1e293b]">Pembayaran Tukin</option>
                        <option value="Kekurangan TPG" className="bg-[#1e293b]">Kekurangan TPG</option>
                        <option value="Kekurangan Tukin" className="bg-[#1e293b]">Kekurangan Tukin</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Bulan</label>
                      <select
                        value={editingPayment.bulan}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditingPayment(prev => {
                            if (!prev) return null;
                            const updated = { ...prev, bulan: val };
                            if (val === 15 && (!updated.mulaiBulan || !updated.sampaiBulan)) {
                              updated.mulaiBulan = 1;
                              updated.sampaiBulan = 3;
                            }
                            return updated;
                          });
                        }}
                        className="w-full bg-[#0f172a] border border-white/10 text-white p-2.5 rounded-xl text-sm outline-none font-medium cursor-pointer"
                      >
                        {INDONESIAN_MONTHS.map((m, idx) => (
                          <option key={m} value={idx + 1} className="bg-[#1e293b]">{m}</option>
                        ))}
                        <option value={13} className="bg-[#1e293b]">THR (Tunjangan Hari Raya)</option>
                        <option value={14} className="bg-[#1e293b]">KE-13 (Gaji/Tunjangan Ke-13)</option>
                        <option value={15} className="bg-[#1e293b]">Triwulan</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Tahun</label>
                      <select
                        value={editingPayment.tahun}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditingPayment(prev => prev ? { ...prev, tahun: val } : null);
                        }}
                        className="w-full bg-[#0f172a] border border-white/10 text-white p-2.5 rounded-xl text-sm outline-none font-medium cursor-pointer"
                      >
                        <option value={2026} className="bg-[#1e293b]">2026</option>
                        <option value={2025} className="bg-[#1e293b]">2025</option>
                        <option value={2024} className="bg-[#1e293b]">2024</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Tempat Cetak</label>
                      <input
                        type="text"
                        required
                        value={editingPayment.tempatCetak || ''}
                        onChange={(e) => setEditingPayment(prev => prev ? { ...prev, tempatCetak: e.target.value } : null)}
                        className="w-full bg-[#0f172a] p-2.5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-xl text-sm"
                        placeholder="Contoh: Palopo"
                      />
                    </div>
                  </div>

                  {editingPayment.bulan === 15 && (
                    <div className="grid grid-cols-2 gap-4 bg-[#0f172a]/60 p-4 border border-white/10 rounded-xl">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Mulai Bulan</label>
                        <select
                          value={editingPayment.mulaiBulan || 1}
                          onChange={(e) => {
                            const start = Number(e.target.value);
                            setEditingPayment(prev => {
                              if (!prev) return null;
                              const updated = { ...prev, mulaiBulan: start };
                              if ((updated.sampaiBulan || 3) < start) {
                                updated.sampaiBulan = start;
                              }
                              return updated;
                            });
                          }}
                          className="w-full bg-[#0f172a] border border-white/10 text-white p-2.5 rounded-xl text-sm outline-none font-medium cursor-pointer"
                        >
                          {INDONESIAN_MONTHS.map((m, idx) => (
                            <option key={m} value={idx + 1} className="bg-[#1e293b]">{m}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Sampai Bulan</label>
                        <select
                          value={editingPayment.sampaiBulan || 3}
                          onChange={(e) => {
                            const end = Number(e.target.value);
                            setEditingPayment(prev => prev ? { ...prev, sampaiBulan: end } : null);
                          }}
                          className="w-full bg-[#0f172a] border border-white/10 text-white p-2.5 rounded-xl text-sm outline-none font-medium cursor-pointer"
                        >
                          {INDONESIAN_MONTHS.map((m, idx) => (
                            <option key={m} value={idx + 1} disabled={idx + 1 < (editingPayment.mulaiBulan || 1)} className="bg-[#1e293b]">{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Tanggal Cetak</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={editingPayment.tanggalCetak || ''}
                        onChange={(e) => setEditingPayment(prev => prev ? { ...prev, tanggalCetak: e.target.value } : null)}
                        placeholder="dd/mm/yyyy"
                        className="w-full bg-[#0f172a] pl-3 pr-10 py-2.5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-xl text-sm font-mono hover:border-white/20 transition-all"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none p-1 flex items-center justify-center">
                        <Calendar size={16} />
                      </div>
                      <input 
                        type="date"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 opacity-0 cursor-pointer text-slate-100"
                        onChange={(e) => {
                          if (e.target.value) {
                            const [yyyy, mm, dd] = e.target.value.split('-');
                            setEditingPayment(prev => prev ? { ...prev, tanggalCetak: `${dd}/${mm}/${yyyy}` } : null);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer transition select-none"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
