import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import DataPegawai from './components/DataPegawai';
import PembayaranSistem from './components/PembayaranSistem';
import ReferensiSistem from './components/ReferensiSistem';

import { Pegawai, PembayaranTunjangan, ReferensiGolongan, ReferensiGradeTukin, PejabatPenandatangan, ReferensiKategori } from './types';
import { 
  MOCK_PEGAWAI, 
  DEFAULT_GOLONGAN_REF, 
  DEFAULT_GRADE_TUKIN_REF, 
  DEFAULT_KATEGORI_REF,
  generateDaftarPembayaranBaru 
} from './data';
import { 
  Bell, 
  Calendar, 
  ShieldCheck, 
  User, 
  Check, 
  Database,
  Search,
  Menu,
  X
} from 'lucide-react';

// Firebase integrations
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';

export default function App() {
  // Authentication states
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('pegawai');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core States
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [pembayaranList, setPembayaranList] = useState<PembayaranTunjangan[]>([]);
  const [golonganRefs, setGolonganRefs] = useState<ReferensiGolongan[]>([]);
  const [gradeTukinRefs, setGradeTukinRefs] = useState<ReferensiGradeTukin[]>([]);
  const [satkerName, setSatkerName] = useState<string>('KANTOR KEMENTERIAN AGAMA KOTA PALOPO');
  const [pejabatList, setPejabatList] = useState<PejabatPenandatangan[]>([]);
  const [kategoriRefs, setKategoriRefs] = useState<ReferensiKategori[]>([]);

  // Toast / notification indicator banner
  const [showSyncBadge, setShowSyncBadge] = useState(true);

  // Auth Subscription
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firebase Firestore synchronization effects
  useEffect(() => {
    if (!user) return;

    // 1. Listen to Pegawai
    const unsubPegawai = onSnapshot(collection(db, 'pegawai'), (snapshot) => {
      if (snapshot.empty) {
        // Seed database
        const local = localStorage.getItem('guru_tunjangan_pegawai');
        const initial = local ? JSON.parse(local) : MOCK_PEGAWAI;
        initial.forEach((p: Pegawai) => {
          setDoc(doc(db, 'pegawai', p.id), p).catch(err => handleFirestoreError(err, OperationType.WRITE, `pegawai/${p.id}`));
        });
      } else {
        const list: Pegawai[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as Pegawai));
        setPegawaiList(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pegawai');
    });

    // 2. Listen to Golongan Refs
    const unsubGolongan = onSnapshot(collection(db, 'golonganRefs'), (snapshot) => {
      if (snapshot.empty) {
        const local = localStorage.getItem('guru_tunjangan_golongan');
        const initial = local ? JSON.parse(local) : DEFAULT_GOLONGAN_REF;
        initial.forEach((g: ReferensiGolongan, index: number) => {
          const id = `gol_${index}`;
          setDoc(doc(db, 'golonganRefs', id), g).catch(err => handleFirestoreError(err, OperationType.WRITE, `golonganRefs/${id}`));
        });
      } else {
        const list: ReferensiGolongan[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as ReferensiGolongan));
        setGolonganRefs(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'golonganRefs');
    });

    // 3. Listen to Grade Tukin Refs
    const unsubGradeTukin = onSnapshot(collection(db, 'gradeTukinRefs'), (snapshot) => {
      if (snapshot.empty) {
        const local = localStorage.getItem('guru_tunjangan_tukin');
        const initial = local ? JSON.parse(local) : DEFAULT_GRADE_TUKIN_REF;
        initial.forEach((r: ReferensiGradeTukin) => {
          const id = `grade_${r.grade}`;
          setDoc(doc(db, 'gradeTukinRefs', id), r).catch(err => handleFirestoreError(err, OperationType.WRITE, `gradeTukinRefs/${id}`));
        });
      } else {
        const list: ReferensiGradeTukin[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as ReferensiGradeTukin));
        list.sort((a, b) => b.grade - a.grade);
        setGradeTukinRefs(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'gradeTukinRefs');
    });

    // 4. Listen to Kategori Refs
    const unsubKategori = onSnapshot(collection(db, 'kategoriRefs'), (snapshot) => {
      if (snapshot.empty) {
        const local = localStorage.getItem('guru_tunjangan_kategori');
        const initial = local ? JSON.parse(local) : DEFAULT_KATEGORI_REF;
        initial.forEach((r: ReferensiKategori) => {
          setDoc(doc(db, 'kategoriRefs', r.id), r).catch(err => handleFirestoreError(err, OperationType.WRITE, `kategoriRefs/${r.id}`));
        });
      } else {
        const list: ReferensiKategori[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as ReferensiKategori));
        setKategoriRefs(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'kategoriRefs');
    });

    // 5. Listen to Pejabat List
    const unsubPejabat = onSnapshot(collection(db, 'pejabatList'), (snapshot) => {
      if (snapshot.empty) {
        const local = localStorage.getItem('guru_tunjangan_pejabat');
        const initial = local ? JSON.parse(local) : [
          { id: '1', jabatan: 'Kepala Dinas Pendidikan / KPA', nama: 'Drs. H. Mulyadi, M.Si', nip: '197205121998031002' },
          { id: '2', jabatan: 'Bendahara Pengeluaran', nama: 'Suprihatin, S.E.', nip: '198409152011012015' }
        ];
        initial.forEach((r: PejabatPenandatangan) => {
          setDoc(doc(db, 'pejabatList', r.id), r).catch(err => handleFirestoreError(err, OperationType.WRITE, `pejabatList/${r.id}`));
        });
      } else {
        const list: PejabatPenandatangan[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as PejabatPenandatangan));
        setPejabatList(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pejabatList');
    });

    // 6. Listen to Config
    const unsubConfig = onSnapshot(doc(db, 'config', 'general'), (snapshot) => {
      if (!snapshot.exists()) {
        const local = localStorage.getItem('guru_tunjangan_satker');
        const initial = local || 'KANTOR KEMENTERIAN AGAMA KOTA PALOPO';
        setDoc(doc(db, 'config', 'general'), { satkerName: initial }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'config/general'));
      } else {
        setSatkerName(snapshot.data()?.satkerName || '');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/general');
    });

    // 7. Listen to Pembayaran
    const unsubPembayaran = onSnapshot(collection(db, 'pembayaran'), (snapshot) => {
      if (snapshot.empty) {
        const local = localStorage.getItem('guru_tunjangan_pembayaran');
        if (local) {
          const initial = JSON.parse(local);
          initial.forEach((p: PembayaranTunjangan) => {
            setDoc(doc(db, 'pembayaran', p.id), p).catch(err => handleFirestoreError(err, OperationType.WRITE, `pembayaran/${p.id}`));
          });
        }
      } else {
        const list: PembayaranTunjangan[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as PembayaranTunjangan));
        setPembayaranList(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pembayaran');
    });

    return () => {
      unsubPegawai();
      unsubGolongan();
      unsubGradeTukin();
      unsubKategori();
      unsubPejabat();
      unsubConfig();
      unsubPembayaran();
    };
  }, [user]);

  // Load state from localStorage on init if offline (no Firebase session)
  useEffect(() => {
    if (user) return;

    // 5. Satker name
    const storedSatker = localStorage.getItem('guru_tunjangan_satker');
    if (storedSatker) {
      setSatkerName(storedSatker);
    } else {
      localStorage.setItem('guru_tunjangan_satker', 'KANTOR KEMENTERIAN AGAMA KOTA PALOPO');
    }

    // 6. Pejabat list
    const storedPejabat = localStorage.getItem('guru_tunjangan_pejabat');
    if (storedPejabat) {
      setPejabatList(JSON.parse(storedPejabat));
    } else {
      const defaultPejabat: PejabatPenandatangan[] = [
        {
          id: '1',
          jabatan: 'Kepala Dinas Pendidikan / KPA',
          nama: 'Drs. H. Mulyadi, M.Si',
          nip: '197205121998031002'
        },
        {
          id: '2',
          jabatan: 'Bendahara Pengeluaran',
          nama: 'Suprihatin, S.E.',
          nip: '198409152011012015'
        }
      ];
      setPejabatList(defaultPejabat);
      localStorage.setItem('guru_tunjangan_pejabat', JSON.stringify(defaultPejabat));
    }

    // 1. Teachers
    const storedPegawai = localStorage.getItem('guru_tunjangan_pegawai');
    let finalPegawai: Pegawai[] = [];
    if (storedPegawai) {
      finalPegawai = JSON.parse(storedPegawai);
      setPegawaiList(finalPegawai);
    } else {
      finalPegawai = MOCK_PEGAWAI;
      setPegawaiList(MOCK_PEGAWAI);
      localStorage.setItem('guru_tunjangan_pegawai', JSON.stringify(MOCK_PEGAWAI));
    }

    // 2. Golongan list
    const storedGol = localStorage.getItem('guru_tunjangan_golongan');
    let finalGol: ReferensiGolongan[] = [];
    if (storedGol) {
      finalGol = JSON.parse(storedGol);
      setGolonganRefs(finalGol);
    } else {
      finalGol = DEFAULT_GOLONGAN_REF;
      setGolonganRefs(DEFAULT_GOLONGAN_REF);
      localStorage.setItem('guru_tunjangan_golongan', JSON.stringify(DEFAULT_GOLONGAN_REF));
    }

    // 3. Tukin levels
    const storedTukin = localStorage.getItem('guru_tunjangan_tukin');
    let finalTukin: ReferensiGradeTukin[] = [];
    if (storedTukin) {
      finalTukin = JSON.parse(storedTukin);
      setGradeTukinRefs(finalTukin);
    } else {
      finalTukin = DEFAULT_GRADE_TUKIN_REF;
      setGradeTukinRefs(DEFAULT_GRADE_TUKIN_REF);
      localStorage.setItem('guru_tunjangan_tukin', JSON.stringify(DEFAULT_GRADE_TUKIN_REF));
    }

    // 3b. Categories
    const storedKategori = localStorage.getItem('guru_tunjangan_kategori');
    if (storedKategori) {
      setKategoriRefs(JSON.parse(storedKategori));
    } else {
      setKategoriRefs(DEFAULT_KATEGORI_REF);
      localStorage.setItem('guru_tunjangan_kategori', JSON.stringify(DEFAULT_KATEGORI_REF));
    }

    // 4. Payments histories
    const storedPayments = localStorage.getItem('guru_tunjangan_pembayaran');
    if (storedPayments) {
      setPembayaranList(JSON.parse(storedPayments));
    } else {
      // Pre-generate 2 historical periods for immediate demo & inspection
      const aprilRound = generateDaftarPembayaranBaru(
        'SKEP.432/KEU/DEP-GURU/2026',
        4, // April
        2026,
        'Pembayaran Tunjangan Profesi & Kinerja - April 2026',
        finalPegawai,
        true, // TPG
        true, // Tukin
        finalGol,
        finalTukin,
        'Pembayaran TPG'
      );
      aprilRound.status = 'DIBAYARKAN'; // mark already disbursed
      aprilRound.itemNominatif[2].persenKehadiran = 90; // mock presence deduction
      aprilRound.itemNominatif[2].brutoTukin = Math.round(aprilRound.itemNominatif[2].tarifTukinDasar * 0.9);
      aprilRound.itemNominatif[2].potonganPPhTukin = Math.round(aprilRound.itemNominatif[2].brutoTukin * aprilRound.itemNominatif[2].tarifPPhTukin);
      aprilRound.itemNominatif[2].nettoTukin = aprilRound.itemNominatif[2].brutoTukin - aprilRound.itemNominatif[2].potonganPPhTukin;
      // recalculate item 2 totals
      aprilRound.itemNominatif[2].totalBruto = aprilRound.itemNominatif[2].brutoTPG + aprilRound.itemNominatif[2].brutoTukin;
      aprilRound.itemNominatif[2].totalPPh = aprilRound.itemNominatif[2].potonganPPhTPG + aprilRound.itemNominatif[2].potonganPPhTukin;
      aprilRound.itemNominatif[2].totalNetto = aprilRound.itemNominatif[2].totalBruto - aprilRound.itemNominatif[2].totalPPh;

      const meiRound = generateDaftarPembayaranBaru(
        'SKEP.490/KEU/DEP-GURU/2026',
        5, // Mei
        2026,
        'Pembayaran TPG & Tukin Guru Pendidik - Mei 2026',
        finalPegawai,
        true,
        true,
        finalGol,
        finalTukin,
        'Pembayaran Tukin'
      );
      meiRound.status = 'DISETUJUI'; // approved wait disbursement

      const initialPayments = [meiRound, aprilRound];
      setPembayaranList(initialPayments);
      localStorage.setItem('guru_tunjangan_pembayaran', JSON.stringify(initialPayments));
    }

    // fade sync bubble off
    const timer = setTimeout(() => {
      setShowSyncBadge(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  // Save changes wrapper
  const updatePegawaiAndSave = async (newList: Pegawai[]) => {
    setPegawaiList(newList);
    localStorage.setItem('guru_tunjangan_pegawai', JSON.stringify(newList));
    triggerQuickSyncIndicator();
    if (user) {
      try {
        const qSnap = await getDocs(collection(db, 'pegawai')).catch(err => handleFirestoreError(err, OperationType.LIST, 'pegawai'));
        if (qSnap) {
          const cloudIds = qSnap.docs.map(d => d.id);
          const currentIds = newList.map(p => p.id);
          const toDelete = cloudIds.filter(id => !currentIds.includes(id));
          for (const id of toDelete) {
            await deleteDoc(doc(db, 'pegawai', id)).catch(err => handleFirestoreError(err, OperationType.DELETE, `pegawai/${id}`));
          }
        }
        for (const p of newList) {
          await setDoc(doc(db, 'pegawai', p.id), p).catch(err => handleFirestoreError(err, OperationType.WRITE, `pegawai/${p.id}`));
        }
      } catch (err) {
        console.error("Firestore sync error pegawai:", err);
      }
    }
  };

  const updatePaymentsAndSave = async (newList: PembayaranTunjangan[]) => {
    setPembayaranList(newList);
    localStorage.setItem('guru_tunjangan_pembayaran', JSON.stringify(newList));
    triggerQuickSyncIndicator();
    if (user) {
      try {
        const qSnap = await getDocs(collection(db, 'pembayaran')).catch(err => handleFirestoreError(err, OperationType.LIST, 'pembayaran'));
        if (qSnap) {
          const cloudIds = qSnap.docs.map(d => d.id);
          const currentIds = newList.map(p => p.id);
          const toDelete = cloudIds.filter(id => !currentIds.includes(id));
          for (const id of toDelete) {
            await deleteDoc(doc(db, 'pembayaran', id)).catch(err => handleFirestoreError(err, OperationType.DELETE, `pembayaran/${id}`));
          }
        }
        for (const p of newList) {
          await setDoc(doc(db, 'pembayaran', p.id), p).catch(err => handleFirestoreError(err, OperationType.WRITE, `pembayaran/${p.id}`));
        }
      } catch (err) {
        console.error("Firestore sync error pembayaran:", err);
      }
    }
  };

  const updateGolonganAndSave = async (newList: ReferensiGolongan[]) => {
    setGolonganRefs(newList);
    localStorage.setItem('guru_tunjangan_golongan', JSON.stringify(newList));
    triggerQuickSyncIndicator();
    if (user) {
      try {
        const qSnap = await getDocs(collection(db, 'golonganRefs')).catch(err => handleFirestoreError(err, OperationType.LIST, 'golonganRefs'));
        if (qSnap) {
          const cloudIds = qSnap.docs.map(d => d.id);
          const currentIds = newList.map((_, i) => `gol_${i}`);
          const toDelete = cloudIds.filter(id => !currentIds.includes(id));
          for (const id of toDelete) {
            await deleteDoc(doc(db, 'golonganRefs', id)).catch(err => handleFirestoreError(err, OperationType.DELETE, `golonganRefs/${id}`));
          }
        }
        newList.forEach(async (g, i) => {
          await setDoc(doc(db, 'golonganRefs', `gol_${i}`), g).catch(err => handleFirestoreError(err, OperationType.WRITE, `golonganRefs/gol_${i}`));
        });
      } catch (err) {
        console.error("Firestore sync error golongan:", err);
      }
    }
  };

  const updateGradeTukinAndSave = async (newList: ReferensiGradeTukin[]) => {
    setGradeTukinRefs(newList);
    localStorage.setItem('guru_tunjangan_tukin', JSON.stringify(newList));
    triggerQuickSyncIndicator();
    if (user) {
      try {
        const qSnap = await getDocs(collection(db, 'gradeTukinRefs')).catch(err => handleFirestoreError(err, OperationType.LIST, 'gradeTukinRefs'));
        if (qSnap) {
          const cloudIds = qSnap.docs.map(d => d.id);
          const currentIds = newList.map(r => `grade_${r.grade}`);
          const toDelete = cloudIds.filter(id => !currentIds.includes(id));
          for (const id of toDelete) {
            await deleteDoc(doc(db, 'gradeTukinRefs', id)).catch(err => handleFirestoreError(err, OperationType.DELETE, `gradeTukinRefs/${id}`));
          }
        }
        for (const r of newList) {
          await setDoc(doc(db, 'gradeTukinRefs', `grade_${r.grade}`), r).catch(err => handleFirestoreError(err, OperationType.WRITE, `gradeTukinRefs/grade_${r.grade}`));
        }
      } catch (err) {
        console.error("Firestore sync error grade tukin:", err);
      }
    }
  };

  const updateSatkerAndSave = async (newName: string) => {
    setSatkerName(newName);
    localStorage.setItem('guru_tunjangan_satker', newName);
    triggerQuickSyncIndicator();
    if (user) {
      await setDoc(doc(db, 'config', 'general'), { satkerName: newName }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'config/general'));
    }
  };

  const updatePejabatAndSave = async (newList: PejabatPenandatangan[]) => {
    setPejabatList(newList);
    localStorage.setItem('guru_tunjangan_pejabat', JSON.stringify(newList));
    triggerQuickSyncIndicator();
    if (user) {
      try {
        const qSnap = await getDocs(collection(db, 'pejabatList')).catch(err => handleFirestoreError(err, OperationType.LIST, 'pejabatList'));
        if (qSnap) {
          const cloudIds = qSnap.docs.map(d => d.id);
          const currentIds = newList.map(p => p.id);
          const toDelete = cloudIds.filter(id => !currentIds.includes(id));
          for (const id of toDelete) {
            await deleteDoc(doc(db, 'pejabatList', id)).catch(err => handleFirestoreError(err, OperationType.DELETE, `pejabatList/${id}`));
          }
        }
        for (const r of newList) {
          await setDoc(doc(db, 'pejabatList', r.id), r).catch(err => handleFirestoreError(err, OperationType.WRITE, `pejabatList/${r.id}`));
        }
      } catch (err) {
        console.error("Firestore sync error pejabat:", err);
      }
    }
  };

  const updateKategoriAndSave = async (newList: ReferensiKategori[]) => {
    setKategoriRefs(newList);
    localStorage.setItem('guru_tunjangan_kategori', JSON.stringify(newList));
    triggerQuickSyncIndicator();
    if (user) {
      try {
        const qSnap = await getDocs(collection(db, 'kategoriRefs')).catch(err => handleFirestoreError(err, OperationType.LIST, 'kategoriRefs'));
        if (qSnap) {
          const cloudIds = qSnap.docs.map(d => d.id);
          const currentIds = newList.map(k => k.id);
          const toDelete = cloudIds.filter(id => !currentIds.includes(id));
          for (const id of toDelete) {
            await deleteDoc(doc(db, 'kategoriRefs', id)).catch(err => handleFirestoreError(err, OperationType.DELETE, `kategoriRefs/${id}`));
          }
        }
        for (const k of newList) {
          await setDoc(doc(db, 'kategoriRefs', k.id), k).catch(err => handleFirestoreError(err, OperationType.WRITE, `kategoriRefs/${k.id}`));
        }
      } catch (err) {
        console.error("Firestore sync error kategori:", err);
      }
    }
  };

  const triggerQuickSyncIndicator = () => {
    setShowSyncBadge(true);
    const t = setTimeout(() => setShowSyncBadge(false), 2000);
  };

  const resetAllToDefault = () => {
    localStorage.removeItem('guru_tunjangan_pegawai');
    localStorage.removeItem('guru_tunjangan_golongan');
    localStorage.removeItem('guru_tunjangan_tukin');
    localStorage.removeItem('guru_tunjangan_pembayaran');
    localStorage.removeItem('guru_tunjangan_satker');
    localStorage.removeItem('guru_tunjangan_pejabat');
    localStorage.removeItem('guru_tunjangan_kategori');
    
    // reload page to re-trigger states
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-200 font-sans tracking-normal antialiased relative overflow-x-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-0 pointer-events-none"></div>

      {/* Sidebar - Desktop */}
      <div className="hidden md:block z-10">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }} 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
        />
      </div>

      {/* Main Container Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        
        {/* Top Navbar Header */}
        <header className="bg-white/5 backdrop-blur-md border-b border-white/5 p-4 sticky top-0 z-20 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            {/* Mobile menu burger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-white/10 rounded-lg text-slate-300 block md:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm md:text-base leading-tight">Dashboard Kepegawaian</span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">Halaman Administrator Keuangan</span>
            </div>
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-4">
            {/* Realtime synchronization toaster bubble */}
            {showSyncBadge && (
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] md:text-xs font-semibold px-3 py-1 border border-emerald-500/20 rounded-full flex items-center gap-1.5 animate-pulse font-mono shadow-md">
                <Database size={12} className="text-emerald-400 animate-spin" />
                <span>{user ? 'Sync Cloud Aktif' : 'Sync Lokal Aktif'}</span>
              </span>
            )}

            {/* Current Calendar display */}
            <div className="hidden md:flex items-center gap-2 text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-slate-300 select-none font-mono font-medium backdrop-blur-md">
              <Calendar size={14} className="text-slate-400" />
              <span>Sabtu, 13 Jun 2026</span>
            </div>

            {/* Operator Identification badge - Customized to user's registered e-mail */}
            {user ? (
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-1.5 pr-3 backdrop-blur-md animate-fade-in">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-emerald-500/20">
                    {user.email ? user.email.slice(0, 1).toUpperCase() : 'O'}
                  </div>
                )}
                <div className="flex flex-col text-left select-none">
                  <span className="text-[11px] font-black text-white truncate leading-none max-w-[124px] block">{user.email || 'obil75@gmail.com'}</span>
                  <button 
                    onClick={() => signOut(auth)}
                    className="text-[9px] text-red-400 hover:text-red-500 font-bold tracking-wider mt-0.5 font-mono uppercase cursor-pointer text-left focus:outline-none"
                  >
                    Sign Out / Keluar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={async () => {
                  try {
                    await signInWithPopup(auth, googleProvider);
                  } catch (e) {
                    console.error("Sign in error:", e);
                  }
                }}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20 focus:outline-none"
              >
                <User size={14} />
                <span>Masuk Google</span>
              </button>
            )}
          </div>
        </header>

        {/* Mobile menu block */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0f172a]/95 backdrop-blur-xl animate-fade-in text-white border-t border-white/10 p-4 absolute top-16 left-0 right-0 z-30 space-y-2 shadow-2xl">
            <button
              onClick={() => { setActiveTab('pegawai'); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2.5 rounded-lg text-sm font-semibold block ${activeTab === 'pegawai' ? 'bg-emerald-500 text-white' : 'hover:bg-white/5 text-slate-300'}`}
            >
              Data Pegawai
            </button>
            <button
              onClick={() => { setActiveTab('pembayaran'); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2.5 rounded-lg text-sm font-semibold block ${activeTab === 'pembayaran' ? 'bg-emerald-500 text-white' : 'hover:bg-white/5 text-slate-300'}`}
            >
              Pembayaran & Cetak Nominatif
            </button>
            <button
              onClick={() => { setActiveTab('referensi'); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2.5 rounded-lg text-sm font-semibold block ${activeTab === 'referensi' ? 'bg-emerald-500 text-white' : 'hover:bg-white/5 text-slate-300'}`}
            >
              Referensi & Parameter Golongan
            </button>
          </div>
        )}

        {/* Content Section */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardOverview 
              pegawaiList={pegawaiList} 
              pembayaranList={pembayaranList} 
              setActiveTab={setActiveTab}
              onQuickPayClick={() => setActiveTab('pembayaran')}
            />
          )}

          {activeTab === 'pegawai' && (
            <DataPegawai 
              pegawaiList={pegawaiList} 
              setPegawaiList={updatePegawaiAndSave} 
              golonganRefs={golonganRefs}
              gradeTukinRefs={gradeTukinRefs}
              kategoriRefs={kategoriRefs}
            />
          )}

          {activeTab === 'pembayaran' && (
            <PembayaranSistem 
              pembayaranList={pembayaranList} 
              setPembayaranList={updatePaymentsAndSave} 
              pegawaiList={pegawaiList}
              golonganRefs={golonganRefs}
              gradeTukinRefs={gradeTukinRefs}
              satkerName={satkerName}
              pejabatList={pejabatList}
              kategoriRefs={kategoriRefs}
            />
          )}

          {activeTab === 'referensi' && (
            <ReferensiSistem 
              golonganRefs={golonganRefs} 
              setGolonganRefs={updateGolonganAndSave} 
              gradeTukinRefs={gradeTukinRefs} 
              setGradeTukinRefs={updateGradeTukinAndSave}
              resetToDefault={resetAllToDefault}
              satkerName={satkerName}
              setSatkerName={updateSatkerAndSave}
              pejabatList={pejabatList}
              setPejabatList={updatePejabatAndSave}
              kategoriRefs={kategoriRefs}
              setKategoriRefs={updateKategoriAndSave}
            />
          )}
        </main>
      </div>
    </div>
  );
}
