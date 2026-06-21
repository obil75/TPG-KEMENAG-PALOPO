import React, { useState } from 'react';
import { 
  ReferensiGolongan, 
  ReferensiGradeTukin, 
  PejabatPenandatangan, 
  ReferensiKategori 
} from '../types';
import { formatRupiah } from '../data';
import { 
  Sliders, 
  RotateCcw, 
  Save, 
  Edit, 
  Plus, 
  Info, 
  Building, 
  Check, 
  X,
  User,
  Activity,
  FileText,
  Trash2
} from 'lucide-react';

interface ReferensiSistemProps {
  golonganRefs: ReferensiGolongan[];
  setGolonganRefs: (refs: ReferensiGolongan[]) => void;
  gradeTukinRefs: ReferensiGradeTukin[];
  setGradeTukinRefs: (refs: ReferensiGradeTukin[]) => void;
  resetToDefault: () => void;
  satkerName: string;
  setSatkerName: (name: string) => void;
  pejabatList: PejabatPenandatangan[];
  setPejabatList: (list: PejabatPenandatangan[]) => void;
  kategoriRefs: ReferensiKategori[];
  setKategoriRefs: (refs: ReferensiKategori[]) => void;
}

type TabType = 'golongan' | 'grade_tukin' | 'pejabat' | 'kategori';

export default function ReferensiSistem({
  golonganRefs,
  setGolonganRefs,
  gradeTukinRefs,
  setGradeTukinRefs,
  resetToDefault,
  satkerName,
  setSatkerName,
  pejabatList,
  setPejabatList,
  kategoriRefs = [],
  setKategoriRefs,
}: ReferensiSistemProps) {
  const [activeSubTab, setActiveSubTab] = useState<TabType>('golongan');

  // Edit states
  const [editingGolIndex, setEditingGolIndex] = useState<number | null>(null);
  const [editGolData, setEditGolData] = useState<Partial<ReferensiGolongan>>({});

  const [editingGrade, setEditingGrade] = useState<number | null>(null);
  const [editGradeValue, setEditGradeValue] = useState<number>(0);

  const [editingPejabatId, setEditingPejabatId] = useState<string | null>(null);
  const [editPejabatData, setEditPejabatData] = useState<Partial<PejabatPenandatangan>>({});

  const [editingKategoriId, setEditingKategoriId] = useState<string | null>(null);
  const [editKategoriName, setEditKategoriName] = useState<string>('');
  const [newKategoriName, setNewKategoriName] = useState<string>('');

  // 1. Golongan edit functions
  const startEditGolongan = (index: number) => {
    setEditingGolIndex(index);
    setEditGolData({ ...golonganRefs[index] });
  };

  const cancelEditGolongan = () => {
    setEditingGolIndex(null);
    setEditGolData({});
  };

  const saveGolongan = (index: number) => {
    if (!editGolData.golongan) return;
    const updated = [...golonganRefs];
    updated[index] = {
      golongan: editGolData.golongan,
      gajiPokokAcuan: Number(editGolData.gajiPokokAcuan || 0),
      tarifPPhTPG: Number(editGolData.tarifPPhTPG || 0),
      grade: editGolData.grade !== undefined ? Number(editGolData.grade) : undefined,
      nilaiGrade: editGolData.nilaiGrade !== undefined ? Number(editGolData.nilaiGrade) : undefined,
    };
    setGolonganRefs(updated);
    setEditingGolIndex(null);
  };

  // 2. Grade Tukin edit functions
  const startEditGrade = (gradeVal: number, currentVal: number) => {
    setEditingGrade(gradeVal);
    setEditGradeValue(currentVal);
  };

  const saveGradeValue = (gradeVal: number) => {
    const updated = gradeTukinRefs.map(g => {
      if (g.grade === gradeVal) {
        return { ...g, nilaiTunjangan: editGradeValue };
      }
      return g;
    });
    setGradeTukinRefs(updated);
    setEditingGrade(null);
  };

  // 3. Pejabat & Satker functions
  const handleUpdateSatker = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Satuan Kerja diperbarui');
  };

  const startEditPejabat = (p: PejabatPenandatangan) => {
    setEditingPejabatId(p.id);
    setEditPejabatData({ ...p });
  };

  const savePejabat = (id: string) => {
    const updated = pejabatList.map(p => {
      if (p.id === id) {
        return {
          id,
          jabatan: editPejabatData.jabatan || p.jabatan,
          nama: editPejabatData.nama || p.nama,
          nip: editPejabatData.nip || p.nip,
        };
      }
      return p;
    });
    setPejabatList(updated);
    setEditingPejabatId(null);
  };

  // 4. Kategori functions
  const handleAddKategori = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKategoriName.trim()) return;
    const newKategori: ReferensiKategori = {
      id: Math.random().toString(36).substring(2, 9),
      nama: newKategoriName.trim()
    };
    setKategoriRefs([...kategoriRefs, newKategori]);
    setNewKategoriName('');
  };

  const handleDeleteKategori = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori guru ini?')) {
      setKategoriRefs(kategoriRefs.filter(k => k.id !== id));
    }
  };

  const startEditKategori = (k: ReferensiKategori) => {
    setEditingKategoriId(k.id);
    setEditKategoriName(k.nama);
  };

  const saveKategori = (id: string) => {
    if (!editKategoriName.trim()) return;
    const updated = kategoriRefs.map(k => {
      if (k.id === id) {
        return { ...k, nama: editKategoriName.trim() };
      }
      return k;
    });
    setKategoriRefs(updated);
    setEditingKategoriId(null);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveSubTab('golongan')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wide transition-all cursor-pointer ${
              activeSubTab === 'golongan' 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            1. Golongan & Tarif PPh/TPG
          </button>
          <button
            onClick={() => setActiveSubTab('kategori')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wide transition-all cursor-pointer ${
              activeSubTab === 'kategori' 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            2. Kategori Guru
          </button>
          <button
            onClick={() => setActiveSubTab('pejabat')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wide transition-all cursor-pointer ${
              activeSubTab === 'pejabat' 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            3. Satker & Pejabat Penandatangan
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="bg-slate-900/40 p-1 md:p-6 rounded-2xl border border-white/5 backdrop-blur-md">
        
        {/* TAB 1: GOLONGAN */}
        {activeSubTab === 'golongan' && (
          <div className="space-y-4">

            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-white/5 font-mono text-[11px] text-slate-400 uppercase border-b border-white/10">
                  <tr>
                    <th scope="col" className="py-3 px-4">Golongan</th>
                    <th scope="col" className="py-3 px-4">Gaji Pokok Acuan (Rupiah)</th>
                    <th scope="col" className="py-3 px-4">Persentase PPh TPG</th>
                    <th scope="col" className="py-3 px-4">Pemetaan Grade Tukin</th>
                    <th scope="col" className="py-3 px-4">Nominal Tukin Terpeta</th>
                    <th scope="col" className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {golonganRefs.map((g, idx) => {
                    const isEditing = editingGolIndex === idx;
                    return (
                      <tr 
                        key={g.golongan} 
                        className={`hover:bg-white/5 transition-all ${
                          isEditing ? 'bg-emerald-500/5' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-extrabold text-white">{g.golongan}</td>
                        
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editGolData.gajiPokokAcuan || 0}
                              onChange={(e) => setEditGolData({ ...editGolData, gajiPokokAcuan: Number(e.target.value) })}
                              className="bg-slate-950 border border-white/20 rounded px-2 py-1 text-white w-32 focus:outline-emerald-500 font-mono text-xs"
                            />
                          ) : (
                            <span className="font-mono text-slate-300">{formatRupiah(g.gajiPokokAcuan)}</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                step="0.01"
                                value={editGolData.tarifPPhTPG || 0}
                                onChange={(e) => setEditGolData({ ...editGolData, tarifPPhTPG: Number(e.target.value) })}
                                className="bg-slate-950 border border-white/20 rounded px-2 py-1 text-white w-20 focus:outline-emerald-500 font-mono text-xs"
                              />
                              <span className="text-[10px] text-slate-400 font-mono">({((editGolData.tarifPPhTPG || 0) * 100).toFixed(0)}%)</span>
                            </div>
                          ) : (
                            <span className="font-mono bg-white/5 px-2 py-0.5 rounded-md text-slate-300">
                              {(g.tarifPPhTPG * 100).toFixed(0)}%
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editGolData.grade || 0}
                              onChange={(e) => setEditGolData({ ...editGolData, grade: Number(e.target.value) })}
                              className="bg-slate-950 border border-white/20 rounded px-2 py-1 text-white w-20 focus:outline-emerald-500 font-mono text-xs text-center"
                            />
                          ) : (
                            <span className="font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded text-xs">
                              Grade {g.grade || 'Tidak Set'}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editGolData.nilaiGrade || 0}
                              onChange={(e) => setEditGolData({ ...editGolData, nilaiGrade: Number(e.target.value) })}
                              className="bg-slate-950 border border-white/20 rounded px-2 py-1 text-white w-32 focus:outline-emerald-500 font-mono text-xs"
                            />
                          ) : (
                            <span className="font-mono text-slate-300">
                              {g.nilaiGrade ? formatRupiah(g.nilaiGrade) : 'Sesuai Grade Tabel Tukin'}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => saveGolongan(idx)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded p-1 cursor-pointer focus:outline-none"
                                title="Simpan data"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={cancelEditGolongan}
                                className="bg-slate-700 hover:bg-slate-600 text-slate-300 rounded p-1 cursor-pointer focus:outline-none"
                                title="Batal edit"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditGolongan(idx)}
                              className="text-slate-400 hover:text-emerald-400 p-1 rounded hover:bg-white/5 transition-all inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer focus:outline-none"
                            >
                              <Edit size={12} />
                              <span>Ubah</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: KATEGORI JABATAN */}
        {activeSubTab === 'kategori' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* New Category form */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-3">
              <h3 className="text-white text-sm font-bold flex items-center gap-1.5 leading-none">
                <Plus size={14} className="text-emerald-400" />
                <span>Tambah Kategori Baru</span>
              </h3>
              <form onSubmit={handleAddKategori} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: Guru Pembina, Tata Kerja Baru..."
                  value={newKategoriName}
                  onChange={(e) => setNewKategoriName(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-white flex-1 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah</span>
                </button>
              </form>
            </div>

            {/* Categories Table */}
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-white/5 font-mono text-[11px] text-slate-400 uppercase border-b border-white/10">
                  <tr>
                    <th scope="col" className="py-3 px-2 w-12 text-center">No.</th>
                    <th scope="col" className="py-3 px-4">Nama Kategori Guru</th>
                    <th scope="col" className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {kategoriRefs.map((k, index) => {
                    const isEditing = editingKategoriId === k.id;
                    return (
                      <tr key={k.id} className="hover:bg-white/5">
                        <td className="py-3 px-2 text-center font-mono text-slate-500 text-[11px]">{index + 1}</td>
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editKategoriName}
                              onChange={(e) => setEditKategoriName(e.target.value)}
                              className="bg-slate-950 border border-white/20 rounded px-2.5 py-1 text-white w-full max-w-sm focus:outline-emerald-500"
                            />
                          ) : (
                            <span className="font-bold text-white">{k.nama}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveKategori(k.id)}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded p-1 cursor-pointer"
                                  title="Simpan"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingKategoriId(null)}
                                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 rounded p-1 cursor-pointer"
                                  title="Batal"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditKategori(k)}
                                  className="text-slate-400 hover:text-emerald-400 p-1 rounded hover:bg-white/5 cursor-pointer"
                                  title="Ubah"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteKategori(k.id)}
                                  className="text-slate-400 hover:text-red-400 p-1 rounded hover:bg-white/5 cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SATKER & PEJABAT */}
        {activeSubTab === 'pejabat' && (
          <div className="space-y-6">
            {/* Satuan Kerja Card */}
            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-4">
              <h3 className="text-white text-base font-black flex items-center gap-2">
                <Building className="text-emerald-400" size={18} />
                <span>Konfigurasi Satuan Kerja</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="space-y-1 md:col-span-1">
                  <label className="text-slate-400 font-bold text-xs">NAMA SATKER (BUKU KEUANGAN/NOMINATIF):</label>
                  <p className="text-[10px] text-slate-500 font-mono">Dicetak pada kop surat & file Excel</p>
                </div>
                <div className="md:col-span-3 flex gap-2 w-full">
                  <input
                    type="text"
                    value={satkerName}
                    onChange={(e) => setSatkerName(e.target.value)}
                    className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white flex-1 font-bold text-xs md:text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 border border-emerald-500/20 rounded-xl flex items-center font-mono">
                    Tersimpan Otomatis
                  </span>
                </div>
              </div>
            </div>

            {/* Signatory Pejabat List */}
            <div className="space-y-3">
              <div className="flex flex-col">
                <h3 className="text-white text-base font-black flex items-center gap-2">
                  <FileText className="text-indigo-400" size={18} />
                  <span>Daftar Pejabat Penandatangan</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  Daftar di bawah ini muncul pada bagian bawah berkas lampiran Cetak Nominatif (print pdf/excel) untuk tanda tangan pengesahan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pejabatList.map((p) => {
                  const isEditing = editingPejabatId === p.id;
                  return (
                    <div 
                      key={p.id} 
                      className={`p-5 rounded-2xl border transition-all ${
                        isEditing 
                          ? 'bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/10' 
                          : 'bg-white/5 border-white/5 hover:border-white/10'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-slate-400 font-mono text-[10px] uppercase block">Jabatan Pengesah:</label>
                            <input
                              type="text"
                              value={editPejabatData.jabatan || ''}
                              onChange={(e) => setEditPejabatData({ ...editPejabatData, jabatan: e.target.value })}
                              className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-white w-full font-bold text-xs focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-400 font-mono text-[10px] uppercase block">Nama Lengkap & Gelar:</label>
                            <input
                              type="text"
                              value={editPejabatData.nama || ''}
                              onChange={(e) => setEditPejabatData({ ...editPejabatData, nama: e.target.value })}
                              className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-white w-full text-xs focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-400 font-mono text-[10px] uppercase block">Nomor Induk Pegawai (NIP):</label>
                            <input
                              type="text"
                              value={editPejabatData.nip || ''}
                              onChange={(e) => setEditPejabatData({ ...editPejabatData, nip: e.target.value })}
                              className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-white w-full text-xs font-mono focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              onClick={() => savePejabat(p.id)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <Check size={12} />
                              <span>Simpan</span>
                            </button>
                            <button
                              onClick={() => setEditingPejabatId(null)}
                              className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="inline-block bg-indigo-500/10 text-indigo-300 border border-indigo-500/10 px-2.5 py-0.5 rounded-lg text-[10px] font-mono tracking-wide">
                              {p.jabatan}
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-white text-sm font-black">{p.nama}</h4>
                              <p className="text-slate-400 text-xs font-mono select-all">NIP: {p.nip}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => startEditPejabat(p)}
                            className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white p-2 rounded-xl transition-all cursor-pointer focus:outline-none"
                            title="Edit Data Pejabat"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
