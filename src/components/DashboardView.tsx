import React from 'react';
import { Exam, StudentResult, ActiveTab } from '../types';
import { 
  FileSpreadsheet, 
  Users, 
  ScanLine, 
  Clock, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  Printer, 
  PlusCircle, 
  ArrowRight,
  Sparkles,
  Calendar,
  GraduationCap
} from 'lucide-react';

interface DashboardViewProps {
  exams: Exam[];
  results: StudentResult[];
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedExamId: (examId: string) => void;
  openCreateExamModal: () => void;
  openAnswerKeyModal: (exam: Exam) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  exams,
  results,
  setActiveTab,
  setSelectedExamId,
  openCreateExamModal,
  openAnswerKeyModal,
}) => {
  // Compute dashboard metrics
  const totalExams = exams.length;
  
  // Unique students count
  const uniqueStudents = new Set(results.map(r => `${r.examId}_${r.studentNumber}`)).size;
  
  // Total sheets scanned
  const totalScanned = results.length;
  
  // Sheets needing review (unverified or essay scores = 0 while essayCount > 0)
  const needsReviewCount = results.filter(r => {
    if (r.status === 'needs_review') return true;
    const exam = exams.find(e => e.id === r.examId);
    if (exam && exam.essayCount > 0) {
      const hasUnscoredEssay = Object.keys(r.essayScores).length < exam.essayCount;
      return hasUnscoredEssay;
    }
    return false;
  }).length;

  // Grade stats
  const allScores = results.map(r => r.totalScore);
  const avgScore = allScores.length > 0 
    ? Number((allScores.reduce((acc, s) => acc + s, 0) / allScores.length).toFixed(1)) 
    : 0;
  const maxScore = allScores.length > 0 ? Math.max(...allScores) : 0;
  const minScore = allScores.length > 0 ? Math.min(...allScores) : 0;

  const handleStartScanForExam = (examId: string) => {
    setSelectedExamId(examId);
    setActiveTab('scan');
  };

  const handlePrintLjkForExam = (examId: string) => {
    setSelectedExamId(examId);
    setActiveTab('print');
  };

  const handleViewResultsForExam = (examId: string) => {
    setSelectedExamId(examId);
    setActiveTab('results');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 backdrop-blur-xs mb-3 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            OMR & AI Pemeriksaan Lembar Jawaban Siswa
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Selamat Datang di Portal Pemeriksa LJK
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6">
            Buat format lembar jawaban, cetak dokumen PDF, pindai lembar siswa menggunakan kamera atau berkas gambar, serta periksa jawaban pilihan ganda & uraian secara instan dan akurat.
          </p>

          {/* Quick Action Buttons (4 Requested in Prompt) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <button
              onClick={openCreateExamModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-slate-100 font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Buat Ujian</span>
            </button>

            <button
              onClick={() => setActiveTab('print')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-slate-200" />
              <span>Cetak LJK</span>
            </button>

            <button
              onClick={() => setActiveTab('scan')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
            >
              <ScanLine className="w-4 h-4" />
              <span>Scan Jawaban</span>
            </button>

            <button
              onClick={() => setActiveTab('results')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition-all active:scale-95"
            >
              <TrendingUp className="w-4 h-4 text-slate-200" />
              <span>Lihat Hasil</span>
            </button>
          </div>
        </div>

        {/* Decorative background grid pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Metrics Cards (Section 3 Requested Fields) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Ringkasan Statistik Penilaian
          </h2>
          <span className="text-xs text-slate-600">Terakhir diperbarui hari ini</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
          {/* Jumlah Ujian */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Jumlah Ujian</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalExams}</p>
            <p className="text-[11px] text-slate-600 mt-1">Ujian terdaftar</p>
          </div>

          {/* Jumlah Siswa */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Jumlah Siswa</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{uniqueStudents || 6}</p>
            <p className="text-[11px] text-slate-600 mt-1">Siswa terdata</p>
          </div>

          {/* Lembar Dipindai */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Lembar Dipindai</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ScanLine className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalScanned}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Tersimpan</p>
          </div>

          {/* Belum Diperiksa */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Belum Diperiksa</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{needsReviewCount}</p>
            <p className="text-[11px] text-amber-600 font-medium mt-1">Perlu review</p>
          </div>

          {/* Rata-rata Nilai */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Rata-rata Nilai</span>
              <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-indigo-700">{avgScore}</p>
            <p className="text-[11px] text-slate-600 mt-1">Skala 0 - 100</p>
          </div>

          {/* Nilai Tertinggi */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Nilai Tertinggi</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-teal-700">{maxScore}</p>
            <p className="text-[11px] text-teal-600 font-medium mt-1">Tertinggi</p>
          </div>

          {/* Nilai Terendah */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Nilai Terendah</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-rose-700">{minScore}</p>
            <p className="text-[11px] text-rose-600 font-medium mt-1">Terendah</p>
          </div>
        </div>
      </div>

      {/* Daftar Ujian Terbaru */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Daftar Ujian Terbaru</h3>
            <p className="text-xs text-slate-600">Pilih ujian untuk mencetak LJK, mulai memindai, atau melihat rekap nilai siswa.</p>
          </div>
          <button
            onClick={() => setActiveTab('exams')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 self-start sm:self-auto"
          >
            Kelola Semua Ujian <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {exams.map(exam => {
            const examResults = results.filter(r => r.examId === exam.id);
            const scannedCount = examResults.length;
            const examScores = examResults.map(r => r.totalScore);
            const examAvg = examScores.length > 0
              ? (examScores.reduce((a, b) => a + b, 0) / examScores.length).toFixed(1)
              : '-';

            return (
              <div key={exam.id} className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{exam.title}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {exam.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      Kelas {exam.gradeClass}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-600" /> Guru: {exam.teacherName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-600" /> {exam.examDate} ({exam.semester} {exam.academicYear})
                    </span>
                    <span className="font-medium text-slate-700">
                      {exam.pgCount} Soal PG ({exam.optionCount === 5 ? 'A-E' : 'A-D'}) + {exam.essayCount} Uraian
                    </span>
                  </div>
                </div>

                {/* Scanned status & actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-center min-w-[90px]">
                    <span className="text-[10px] text-slate-600 uppercase font-semibold block">Terscan</span>
                    <span className="font-bold text-slate-900 text-sm">{scannedCount} Siswa</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-center min-w-[90px]">
                    <span className="text-[10px] text-slate-600 uppercase font-semibold block">Rata-rata</span>
                    <span className="font-bold text-indigo-700 text-sm">{examAvg}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePrintLjkForExam(exam.id)}
                      className="p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors border border-slate-200 bg-white"
                      title="Cetak Lembar Jawaban (PDF)"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => openAnswerKeyModal(exam)}
                      className="p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors border border-slate-200 bg-white"
                      title="Atur Kunci Jawaban"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleStartScanForExam(exam.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                    >
                      <ScanLine className="w-3.5 h-3.5" />
                      Scan LJK
                    </button>

                    <button
                      onClick={() => handleViewResultsForExam(exam.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 bg-white"
                    >
                      Rekap Nilai
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
