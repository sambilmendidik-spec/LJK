import React, { useState } from 'react';
import { Exam, OptionChoice, ActiveTab } from '../types';
import { 
  Plus, 
  Search, 
  KeyRound, 
  Printer, 
  ScanLine, 
  Trash2, 
  Calendar, 
  GraduationCap, 
  Clock, 
  FileText,
  X,
  Layers,
  BookOpen
} from 'lucide-react';

interface ExamManagerViewProps {
  exams: Exam[];
  onAddExam: (newExam: Exam) => void;
  onUpdateExam: (updatedExam: Exam) => void;
  onDeleteExam: (examId: string) => void;
  onOpenAnswerKey: (exam: Exam) => void;
  onSelectExamForScan: (examId: string) => void;
  onSelectExamForPrint: (examId: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const ExamManagerView: React.FC<ExamManagerViewProps> = ({
  exams,
  onAddExam,
  onDeleteExam,
  onOpenAnswerKey,
  onSelectExamForScan,
  onSelectExamForPrint,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Form State for creating a new exam
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    gradeClass: '',
    teacherName: '',
    schoolName: 'SMP NEGERI 1 TELADAN NUSANTARA',
    academicYear: '2024/2025',
    semester: 'Ganjil' as 'Ganjil' | 'Genap',
    examDate: new Date().toISOString().split('T')[0],
    durationMinutes: 90,
    description: 'Hitamkan atau silang bulatan pilihan jawaban yang benar menggunakan pensil atau pulpen hitam.',
    pgCount: 40,
    optionCount: 4 as 4 | 5,
    pgWeight: 70,
    essayCount: 5,
    essayWeight: 30,
    passingScore: 75,
  });

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.gradeClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.subject || !formData.gradeClass) {
      alert('Harap isi Nama Ujian, Mata Pelajaran, dan Kelas terlebih dahulu.');
      return;
    }

    // Auto generate default answer keys
    const answerKeys: Record<number, OptionChoice> = {};
    const opts: OptionChoice[] = formData.optionCount === 5 ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];
    for (let i = 1; i <= formData.pgCount; i++) {
      answerKeys[i] = opts[(i * 3) % opts.length];
    }

    // Auto generate default max score per essay
    const essayMaxScores: Record<number, number> = {};
    const defaultScore = Math.max(1, Math.round(100 / Math.max(1, formData.essayCount)));
    for (let i = 1; i <= formData.essayCount; i++) {
      essayMaxScores[i] = defaultScore;
    }

    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      ...formData,
      answerKeys,
      essayMaxScores,
      createdAt: new Date().toISOString(),
    };

    onAddExam(newExam);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Manajemen Ujian & Pengaturan Soal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Atur spesifikasi ujian, konfigurasi jumlah soal pilihan ganda & uraian, serta kunci jawaban penilaian.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Ujian Baru</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama ujian, mata pelajaran, kelas, atau nama guru..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredExams.map(exam => (
          <div
            key={exam.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group"
          >
            <div className="p-5 sm:p-6 space-y-4">
              {/* Header tags */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
                    {exam.subject}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                    {exam.title}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                  Kelas {exam.gradeClass}
                </span>
              </div>

              {/* Specs & Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">Guru: {exam.teacherName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Durasi: {exam.durationMinutes} Menit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{exam.examDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>KKM: {exam.passingScore} Poin</span>
                </div>
              </div>

              {/* Structure badges (PG + Uraian) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>PG: {exam.pgCount} Soal ({exam.optionCount === 5 ? 'A-E' : 'A-D'})</span>
                  <span className="text-[10px] text-blue-600 font-semibold">({exam.pgWeight}%)</span>
                </div>

                {exam.essayCount > 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>Uraian: {exam.essayCount} Soal</span>
                    <span className="text-[10px] text-amber-600 font-semibold">({exam.essayWeight}%)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAnswerKey(exam)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  Kunci Jawaban
                </button>
                <button
                  onClick={() => onSelectExamForPrint(exam.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  Cetak LJK
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSelectExamForScan(exam.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  Scan
                </button>
                {exams.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Hapus ujian "${exam.title}"? Rekap nilai terkait juga akan dihapus.`)) {
                        onDeleteExam(exam.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Hapus Ujian"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Buat Ujian Baru (Prompt Section 4) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Buat Ujian Baru</h3>
                  <p className="text-xs text-slate-500">Lengkapi informasi ujian untuk mengenerate struktur LJK</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExamSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Field Identitas Ujian */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Identitas Ujian</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nama Ujian <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Penilaian Akhir Semester (PAS) Ganjil"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mata Pelajaran <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ilmu Pengetahuan Alam (IPA)"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Kelas <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: IX-A atau VII-1"
                      value={formData.gradeClass}
                      onChange={e => setFormData({ ...formData, gradeClass: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nama Guru Pengampu</label>
                    <input
                      type="text"
                      placeholder="Nama lengkap & gelar guru"
                      value={formData.teacherName}
                      onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nama Sekolah</label>
                    <input
                      type="text"
                      value={formData.schoolName}
                      onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Tahun Pelajaran</label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Semester</label>
                    <select
                      value={formData.semester}
                      onChange={e => setFormData({ ...formData, semester: e.target.value as 'Ganjil' | 'Genap' })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="Ganjil">Semester Ganjil</option>
                      <option value="Genap">Semester Genap</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Ujian</label>
                    <input
                      type="date"
                      value={formData.examDate}
                      onChange={e => setFormData({ ...formData, examDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Durasi Ujian (Menit)</label>
                    <input
                      type="number"
                      min="15"
                      max="360"
                      value={formData.durationMinutes}
                      onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value, 10) || 90 })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Konfigurasi Soal Pilihan Ganda & Uraian */}
              <div className="space-y-4 border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Struktur Soal LJK</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pilihan Ganda */}
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
                    <span className="text-xs font-bold text-indigo-900 block">Pilihan Ganda</span>
                    
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Jumlah Soal PG</label>
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={formData.pgCount}
                        onChange={e => setFormData({ ...formData, pgCount: parseInt(e.target.value, 10) || 40 })}
                        className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Jumlah Pilihan Opsi</label>
                      <select
                        value={formData.optionCount}
                        onChange={e => setFormData({ ...formData, optionCount: parseInt(e.target.value, 10) as 4 | 5 })}
                        className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      >
                        <option value={4}>4 Pilihan (A, B, C, D) - Standar SMP/MTs</option>
                        <option value={5}>5 Pilihan (A, B, C, D, E) - Standar SMA/SMK</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Bobot Nilai PG (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.pgWeight}
                        onChange={e => {
                          const pg = parseInt(e.target.value, 10) || 70;
                          setFormData({ ...formData, pgWeight: pg, essayWeight: 100 - pg });
                        }}
                        className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Uraian & KKM */}
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-3">
                    <span className="text-xs font-bold text-amber-900 block">Soal Uraian (Essay) & KKM</span>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Jumlah Soal Uraian</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.essayCount}
                        onChange={e => setFormData({ ...formData, essayCount: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Bobot Nilai Uraian (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.essayWeight}
                        onChange={e => {
                          const es = parseInt(e.target.value, 10) || 30;
                          setFormData({ ...formData, essayWeight: es, pgWeight: 100 - es });
                        }}
                        className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Standar KKM / Batas Lulus</label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={formData.passingScore}
                        onChange={e => setFormData({ ...formData, passingScore: parseInt(e.target.value, 10) || 75 })}
                        className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Petunjuk Pengerjaan / Keterangan</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm active:scale-95 transition-all"
                >
                  Simpan & Buat Lembar Jawaban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
