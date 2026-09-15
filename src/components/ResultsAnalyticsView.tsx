import React, { useState } from 'react';
import { Exam, StudentResult } from '../types';
import { exportResultsToCsv, getGradePredicate } from '../utils/scoring';
import { exportElementToPdf } from '../utils/pdfExport';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Trash2, 
  FileSpreadsheet, 
  GraduationCap, 
  TrendingUp, 
  Award, 
  AlertTriangle,
  Sparkles,
  School,
  FileDown,
  Loader2
} from 'lucide-react';

interface ResultsAnalyticsViewProps {
  exams: Exam[];
  results: StudentResult[];
  selectedExamId: string;
  onSelectExam: (examId: string) => void;
  onDeleteResult: (resultId: string) => void;
  onOpenGradingDetail: (result: StudentResult) => void;
}

export const ResultsAnalyticsView: React.FC<ResultsAnalyticsViewProps> = ({
  exams,
  results,
  selectedExamId,
  onSelectExam,
  onDeleteResult,
  onOpenGradingDetail,
}) => {
  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'remedial'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'table' | 'analysis' | 'report'>('table');

  if (!currentExam) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
        <p className="text-slate-500">Pilih atau buat ujian terlebih dahulu.</p>
      </div>
    );
  }

  // Filter results for current exam
  const examResults = results.filter(r => r.examId === currentExam.id);

  // Search and filter
  const filteredResults = examResults
    .filter(r => {
      const matchSearch = 
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentNumber.includes(searchTerm);
      if (statusFilter === 'passed') return matchSearch && r.isPassed;
      if (statusFilter === 'remedial') return matchSearch && !r.isPassed;
      return matchSearch;
    })
    .sort((a, b) => parseInt(a.studentNumber || '0', 10) - parseInt(b.studentNumber || '0', 10));

  // Statistics calculation
  const scores = examResults.map(r => r.totalScore);
  const totalStudents = examResults.length;
  const avgScore = totalStudents > 0 
    ? Number((scores.reduce((a, b) => a + b, 0) / totalStudents).toFixed(1)) 
    : 0;
  const maxScore = totalStudents > 0 ? Math.max(...scores) : 0;
  const minScore = totalStudents > 0 ? Math.min(...scores) : 0;
  const passedCount = examResults.filter(r => r.isPassed).length;
  const remedialCount = totalStudents - passedCount;
  const passRate = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0;

  // Item Analysis (Analisis Butir Soal PG)
  // For each question 1..N, calculate how many students answered correctly
  const itemStats = Array.from({ length: currentExam.pgCount }, (_, idx) => {
    const qNum = idx + 1;
    const correctKey = currentExam.answerKeys[qNum];
    let correctCount = 0;
    let wrongCount = 0;
    let blankCount = 0;

    examResults.forEach(r => {
      const ans = r.pgAnswers[qNum];
      if (!ans) blankCount++;
      else if (ans === correctKey) correctCount++;
      else wrongCount++;
    });

    const accuracyRate = totalStudents > 0 ? Math.round((correctCount / totalStudents) * 100) : 0;
    return {
      qNum,
      correctKey,
      correctCount,
      wrongCount,
      blankCount,
      accuracyRate,
      difficulty: accuracyRate >= 80 ? 'Mudah' : accuracyRate >= 50 ? 'Sedang' : 'Sukar / Perlu Bahas',
    };
  });

  const [isExportingReportPdf, setIsExportingReportPdf] = useState(false);
  const [reportPdfSuccess, setReportPdfSuccess] = useState<string | null>(null);
  const [reportPaperSize, setReportPaperSize] = useState<'F4' | 'A4'>('F4');

  const handlePrintOfficialReport = () => {
    window.print();
  };

  const handleSaveReportPdf = async () => {
    if (isExportingReportPdf || !currentExam) return;
    setIsExportingReportPdf(true);
    setReportPdfSuccess(null);

    // Ensure report view is active so DOM elements are rendered
    if (activeSubTab !== 'report') {
      setActiveSubTab('report');
      // Brief delay to allow React to mount/paint the tab content
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      const sanitizedSubject = (currentExam.subject || 'Ujian').replace(/[^a-zA-Z0-9_-]/g, '_');
      const sanitizedClass = (currentExam.gradeClass || 'Kelas').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Raport_Nilai_LJK_${sanitizedSubject}_${sanitizedClass}_${reportPaperSize}.pdf`;

      await exportElementToPdf('printable-report', {
        filename,
        orientation: 'portrait',
        format: reportPaperSize === 'F4' ? 'f4' : 'a4',
        marginMm: 6,
        scale: 2.2,
      });

      setReportPdfSuccess(`✓ Berhasil mengunduh "${filename}" (${reportPaperSize})!`);
      setTimeout(() => setReportPdfSuccess(null), 4000);
    } catch (error) {
      console.error('Gagal membuat PDF raport:', error);
      alert('Terjadi kesalahan saat memproses PDF laporan. Anda dapat menggunakan tombol "Cetak Laporan" lalu pilih "Save as PDF".');
    } finally {
      setIsExportingReportPdf(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Exam Selector */}
      <div className="print:hidden bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Rekap Nilai Siswa & Analisis Hasil Ujian
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar lengkap perolehan nilai nomor absen, pilihan ganda, uraian, dan statistik ketuntasan belajar.
          </p>
        </div>

        {/* Dropdown Ujian & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-60">
            <select
              value={currentExam.id}
              onChange={e => onSelectExam(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {exams.map(e => (
                <option key={e.id} value={e.id}>
                  {e.title} - {e.subject} ({e.gradeClass})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => exportResultsToCsv(currentExam, examResults)}
            disabled={totalStudents === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Ekspor data nilai siswa ke format Microsoft Excel / CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor CSV</span>
          </button>

          {/* Pilihan Format Kertas F4 / A4 */}
          <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setReportPaperSize('F4')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                reportPaperSize === 'F4'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Format Kertas F4 / Folio (215 x 330 mm)"
            >
              F4
            </button>
            <button
              type="button"
              onClick={() => setReportPaperSize('A4')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                reportPaperSize === 'A4'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Format Kertas A4 (210 x 297 mm)"
            >
              A4
            </button>
          </div>

          {/* Tombol Simpan PDF Raport Nilai */}
          <button
            onClick={handleSaveReportPdf}
            disabled={totalStudents === 0 || isExportingReportPdf}
            id="btn-simpan-pdf-raport"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            title={`Unduh berkas PDF dokumen rekap nilai raport format ${reportPaperSize}`}
          >
            {isExportingReportPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Membuat PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Simpan PDF</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrintOfficialReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors cursor-pointer"
            title="Cetak Laporan Raport Nilai ke Printer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {reportPdfSuccess && (
        <div className="print:hidden flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{reportPdfSuccess}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="print:hidden grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <span className="text-xs font-semibold text-slate-600 block">Total Siswa</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalStudents}</p>
          <span className="text-[11px] text-slate-500">Lembar diperiksa</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <span className="text-xs font-semibold text-slate-600 block">Rata-rata Nilai</span>
          <p className="text-2xl font-black text-indigo-700 mt-1">{avgScore}</p>
          <span className="text-[11px] text-slate-500">KKM: {currentExam.passingScore}</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <span className="text-xs font-semibold text-slate-600 block">Nilai Tertinggi</span>
          <p className="text-2xl font-black text-teal-700 mt-1">{maxScore}</p>
          <span className="text-[11px] text-teal-600 font-medium">Maksimal 100</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <span className="text-xs font-semibold text-slate-600 block">Nilai Terendah</span>
          <p className="text-2xl font-black text-rose-700 mt-1">{minScore}</p>
          <span className="text-[11px] text-rose-600 font-medium">Minimal</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <span className="text-xs font-semibold text-slate-600 block">Tuntas (Lulus)</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{passedCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Tingkat {passRate}%</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <span className="text-xs font-semibold text-slate-600 block">Remedial</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{remedialCount}</p>
          <span className="text-[11px] text-amber-600 font-medium">&lt; KKM {currentExam.passingScore}</span>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="print:hidden flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('table')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeSubTab === 'table'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tabel Rekap Nilai Siswa ({filteredResults.length})
          </button>

          <button
            onClick={() => setActiveSubTab('analysis')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeSubTab === 'analysis'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Analisis Butir Soal PG ({currentExam.pgCount} Soal)
          </button>

          <button
            onClick={() => setActiveSubTab('report')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeSubTab === 'report'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Preview Laporan Resmi Raport
          </button>
        </div>
      </div>

      {/* TAB 1: TABEL REKAP NILAI SISWA */}
      {activeSubTab === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Search & Filter Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama siswa atau no. absen..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Status:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setStatusFilter('passed')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    statusFilter === 'passed' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Tuntas
                </button>
                <button
                  onClick={() => setStatusFilter('remedial')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    statusFilter === 'remedial' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Remedial
                </button>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-20 text-center">Absen</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 text-center">Benar / Salah</th>
                  <th className="py-3 px-4 text-right">Skor PG ({currentExam.pgWeight}%)</th>
                  {currentExam.essayCount > 0 && (
                    <th className="py-3 px-4 text-right">Skor Uraian ({currentExam.essayWeight}%)</th>
                  )}
                  <th className="py-3 px-4 text-center">Nilai Akhir</th>
                  <th className="py-3 px-4 text-center">Predikat</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-slate-400">
                      Belum ada data lembar jawaban siswa yang dipindai untuk ujian ini. Silakan masuk ke menu <strong>Scan & Koreksi</strong>.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((item, idx) => {
                    const pred = getGradePredicate(item.totalScore);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-indigo-700 bg-indigo-50/40">
                          {item.studentNumber}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{item.studentName}</span>
                          {item.teacherNotes && (
                            <span className="text-[10px] text-slate-500 block italic truncate max-w-xs">
                              {item.teacherNotes}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-emerald-700 font-bold">{item.correctPgCount}B</span>
                          <span className="text-slate-400 mx-1">/</span>
                          <span className="text-rose-700 font-bold">{item.wrongPgCount}S</span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-800">
                          {item.pgScore}
                        </td>
                        {currentExam.essayCount > 0 && (
                          <td className="py-3 px-4 text-right font-semibold text-slate-800">
                            {item.essayScore}
                          </td>
                        )}
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-black text-indigo-900">
                            {item.totalScore}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${pred.color}`}>
                            {pred.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                            item.isPassed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.isPassed ? 'TUNTAS' : 'REMEDIAL'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenGradingDetail(item)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50"
                              title="Lihat / Edit Koreksi"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus hasil nilai ${item.studentName}?`)) {
                                  onDeleteResult(item.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* TAB 2: ANALISIS BUTIR SOAL */}
      {activeSubTab === 'analysis' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Analisis Tingkat Kesulitan Butir Soal (Pilihan Ganda)
            </h3>
            <p className="text-xs text-slate-500">
              Menampilkan persentase siswa yang menjawab benar pada setiap nomor soal untuk evaluasi materi pengajaran.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {itemStats.map(item => {
              const isHard = item.accuracyRate < 50;
              return (
                <div
                  key={item.qNum}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    isHard
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 text-sm">Soal #{item.qNum}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white border border-slate-200 text-indigo-700">
                      Kunci: {item.correctKey}
                    </span>
                  </div>

                  {/* Progress bar accuracy */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Kebenaran Jawaban</span>
                      <span className="font-bold text-slate-800">{item.accuracyRate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.accuracyRate >= 80
                            ? 'bg-emerald-500'
                            : item.accuracyRate >= 50
                            ? 'bg-blue-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${item.accuracyRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                    <span>Benar: <strong>{item.correctCount}</strong></span>
                    <span>Salah: <strong>{item.wrongCount}</strong></span>
                    <span className={`font-bold ${isHard ? 'text-rose-700' : 'text-slate-600'}`}>
                      {item.difficulty}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: OFFICIAL PRINTABLE REPORT (RAPORT DAFTAR NILAI RESMI) */}
      {(activeSubTab === 'report' || true) && (
        <div 
          id="printable-report" 
          className={`${activeSubTab === 'report' ? 'block' : 'print:block hidden'} print:m-0 bg-white p-6 sm:p-8 border border-slate-200 rounded-2xl shadow-xs print:border-none print:p-0`}
        >
          {/* School Header */}
          <div className="border-b-2 border-black pb-3 mb-4 text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider">DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
            <h1 className="text-lg font-black uppercase text-black">{currentExam.schoolName}</h1>
            <h2 className="text-sm font-bold uppercase mt-0.5">
              DAFTAR NILAI HASIL PEMERIKSAAN LEMBAR JAWABAN (LJK)
            </h2>
            <p className="text-xs text-slate-700 mt-1">
              Ujian: <strong>{currentExam.title}</strong> • Mata Pelajaran: <strong>{currentExam.subject}</strong> • Kelas: <strong>{currentExam.gradeClass}</strong>
            </p>
            <p className="text-[11px] text-slate-600">
              Tahun Pelajaran: {currentExam.academicYear} • Standar KKM: {currentExam.passingScore}
            </p>
          </div>

          {/* Results Table for Print */}
          <table className="w-full text-xs text-left border-collapse border border-black mb-6">
            <thead>
              <tr className="bg-slate-100 border-b border-black text-center font-bold">
                <th className="border border-black py-1.5 px-2 w-10">No</th>
                <th className="border border-black py-1.5 px-2 w-16">Absen</th>
                <th className="border border-black py-1.5 px-3 text-left">Nama Siswa</th>
                <th className="border border-black py-1.5 px-2 w-16">Benar</th>
                <th className="border border-black py-1.5 px-2 w-16">Salah</th>
                <th className="border border-black py-1.5 px-2 w-20">Skor PG</th>
                {currentExam.essayCount > 0 && (
                  <th className="border border-black py-1.5 px-2 w-20">Skor Uraian</th>
                )}
                <th className="border border-black py-1.5 px-2 w-20">Nilai Akhir</th>
                <th className="border border-black py-1.5 px-2 w-16">Predikat</th>
                <th className="border border-black py-1.5 px-2 w-24">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {examResults.map((st, idx) => {
                const pred = getGradePredicate(st.totalScore);
                return (
                  <tr key={st.id} className="border-b border-black">
                    <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                    <td className="border border-black py-1 px-2 text-center font-bold">{st.studentNumber}</td>
                    <td className="border border-black py-1 px-3 font-semibold">{st.studentName}</td>
                    <td className="border border-black py-1 px-2 text-center">{st.correctPgCount}</td>
                    <td className="border border-black py-1 px-2 text-center">{st.wrongPgCount}</td>
                    <td className="border border-black py-1 px-2 text-center">{st.pgScore}</td>
                    {currentExam.essayCount > 0 && (
                      <td className="border border-black py-1 px-2 text-center">{st.essayScore}</td>
                    )}
                    <td className="border border-black py-1 px-2 text-center font-bold">{st.totalScore}</td>
                    <td className="border border-black py-1 px-2 text-center">{pred.grade}</td>
                    <td className="border border-black py-1 px-2 text-center font-bold">
                      {st.isPassed ? 'TUNTAS' : 'REMEDIAL'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Signature Footer */}
          <div className="flex justify-between items-start text-xs pt-4">
            <div className="text-center w-48">
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala Sekolah</p>
              <div className="h-16"></div>
              <p className="font-bold underline">H. Suharsono, M.Pd.</p>
              <p className="text-[10px]">NIP. 19740512 199903 1 004</p>
            </div>

            <div className="text-center w-48">
              <p>Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
              <p className="font-bold">Guru Mata Pelajaran,</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{currentExam.teacherName}</p>
              <p className="text-[10px]">Guru Pengampu {currentExam.subject}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
