import React, { useState, useEffect } from 'react';
import { Exam, OptionChoice, StudentResult, ScanDetectionResult } from '../types';
import { calculateGrade, getGradePredicate } from '../utils/scoring';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Save, 
  X, 
  ZoomIn, 
  RotateCcw, 
  Sparkles, 
  Edit3, 
  Award,
  BookOpen
} from 'lucide-react';

interface GradingReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam;
  scanResult: ScanDetectionResult | null;
  scannedImageSrc: string | null;
  onSaveResult: (result: StudentResult) => void;
}

export const GradingReviewModal: React.FC<GradingReviewModalProps> = ({
  isOpen,
  onClose,
  exam,
  scanResult,
  scannedImageSrc,
  onSaveResult,
}) => {
  const [studentNumber, setStudentNumber] = useState('07');
  const [studentName, setStudentName] = useState('Budi Santoso');
  const [pgAnswers, setPgAnswers] = useState<Record<number, OptionChoice | null>>({});
  const [essayScores, setEssayScores] = useState<Record<number, number>>({});
  const [teacherNotes, setTeacherNotes] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);

  // Initialize data when scanResult changes
  useEffect(() => {
    if (scanResult) {
      setStudentNumber(scanResult.studentNumber || '07');
      setStudentName(scanResult.studentName || 'Budi Santoso');
      setPgAnswers({ ...scanResult.answers });

      // Default essay scores
      const initialEssayScores: Record<number, number> = {};
      for (let i = 1; i <= exam.essayCount; i++) {
        const max = exam.essayMaxScores[i] || 6;
        // Seed realistic provisional score
        initialEssayScores[i] = Math.max(1, max - 1);
      }
      setEssayScores(initialEssayScores);
      setTeacherNotes(scanResult.notes || 'Hasil pemindaian OMR berhasil diproses.');
    }
  }, [scanResult, exam]);

  if (!isOpen || !scanResult) return null;

  const options: OptionChoice[] = exam.optionCount === 5 ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];

  // Calculate live scores
  const grade = calculateGrade(exam, pgAnswers, essayScores);
  const predicate = getGradePredicate(grade.totalScore);

  const handleToggleAnswer = (questionNum: number, choice: OptionChoice) => {
    setPgAnswers(prev => ({
      ...prev,
      [questionNum]: prev[questionNum] === choice ? null : choice,
    }));
  };

  const handleEssayScoreChange = (essayNum: number, score: number) => {
    const max = exam.essayMaxScores[essayNum] || 10;
    const clamped = Math.min(Math.max(score, 0), max);
    setEssayScores(prev => ({
      ...prev,
      [essayNum]: clamped,
    }));
  };

  const handleSave = () => {
    const finalResult: StudentResult = {
      id: `res-${Date.now()}`,
      examId: exam.id,
      studentNumber: studentNumber.trim().padStart(2, '0'),
      studentName: studentName.trim() || `Siswa No. ${studentNumber}`,
      pgAnswers,
      essayScores,
      essayAnswers: scanResult.essayAnswers?.reduce((acc, curr) => {
        acc[curr.essayNumber] = curr.extractedText;
        return acc;
      }, {} as Record<number, string>),
      ...grade,
      scannedAt: new Date().toISOString(),
      scanImageUrl: scannedImageSrc || undefined,
      status: 'verified',
      teacherNotes,
    };

    // Trigger celebration confetti
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
    });

    onSaveResult(finalResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">
                  Verifikasi Hasil Pemindaian LJK
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Akurasi {Math.round((scanResult.confidence || 0.95) * 100)}%
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {exam.title} • {exam.subject} ({exam.gradeClass})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Split View (Left: Scanned Paper, Right: Editable Grade Breakdown) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Scanned Paper Visual (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 p-4 flex flex-col justify-between overflow-y-auto border-r border-slate-200">
            <div className="flex items-center justify-between text-white text-xs mb-2">
              <span className="font-semibold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Citra Lembar Jawaban Asli
              </span>
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-md"
              >
                <ZoomIn className="w-3 h-3" />
                {isZoomed ? 'Perkecil' : 'Perbesar'}
              </button>
            </div>

            <div className={`relative rounded-lg overflow-hidden border border-slate-700 bg-black flex items-center justify-center ${
              isZoomed ? 'min-h-[600px]' : 'max-h-[500px]'
            }`}>
              {scannedImageSrc ? (
                <img
                  src={scannedImageSrc}
                  alt="Scanned LJK"
                  className="w-full h-auto object-contain"
                />
              ) : (
                <div className="text-slate-500 text-xs py-16 text-center">
                  Lembar jawaban siswa diproses
                </div>
              )}
            </div>

            <div className="mt-3 bg-slate-800/80 p-2.5 rounded-lg text-slate-300 text-[11px] space-y-1">
              <p className="font-semibold text-white">Panduan Verifikasi Guru:</p>
              <p>Periksa kecocokan nomor absen dan nama. Anda dapat mengklik bulatan pilihan ganda di sebelah kanan untuk mengubah jawaban jika siswa melakukan koreksi kurang bersih.</p>
            </div>
          </div>

          {/* Right Column: Grading & Verification Form (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 overflow-y-auto space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Student Identity Verification Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nomor Absen (OMR)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={3}
                      value={studentNumber}
                      onChange={e => setStudentNumber(e.target.value)}
                      className="w-full px-3 py-1.5 text-base font-bold font-mono text-indigo-700 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Format 2 digit (misal: 07)</span>
                </div>

                <div className="sm:col-span-8">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Siswa Terdeteksi
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Dapat disunting jika ada kesalahan OCR</span>
                </div>
              </div>

              {/* Realtime Grade Score Card */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-indigo-800 font-semibold uppercase tracking-wider block">
                    Nilai Akhir Siswa
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-black text-indigo-950">{grade.totalScore}</span>
                    <span className="text-xs text-slate-500 font-medium">/ 100</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${predicate.color}`}>
                      Predikat {predicate.grade}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                      grade.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {grade.isPassed ? 'TUNTAS (KKM)' : 'REMEDIAL'}
                    </span>
                  </div>
                </div>

                {/* Stat Breakdown Chips */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-center shadow-2xs">
                    <span className="text-[10px] text-slate-500 block">PG ({grade.pgScore} pt)</span>
                    <span className="font-bold text-emerald-600">{grade.correctPgCount}B</span>
                    <span className="text-slate-400 mx-0.5">/</span>
                    <span className="font-bold text-rose-600">{grade.wrongPgCount}S</span>
                  </div>

                  {exam.essayCount > 0 && (
                    <div className="bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-center shadow-2xs">
                      <span className="text-[10px] text-slate-500 block">Uraian</span>
                      <span className="font-bold text-indigo-700">{grade.essayScore} pt</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 1: Multiple Choice Answers Interactive Matrix */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Koreksi Pilihan Ganda ({exam.pgCount} Soal)
                  </h4>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Benar ({grade.correctPgCount})
                    </span>
                    <span className="flex items-center gap-1 text-rose-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Salah ({grade.wrongPgCount})
                    </span>
                    <span className="flex items-center gap-1 text-amber-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Kosong ({grade.blankPgCount})
                    </span>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-white space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Array.from({ length: exam.pgCount }, (_, idx) => {
                      const qNum = idx + 1;
                      const studentAns = pgAnswers[qNum];
                      const correctAns = exam.answerKeys[qNum];
                      const isCorrect = studentAns === correctAns;
                      const isBlank = !studentAns;

                      return (
                        <div
                          key={qNum}
                          className={`p-2 rounded-lg border text-xs flex flex-col gap-1 transition-all ${
                            isBlank
                              ? 'bg-amber-50/70 border-amber-200'
                              : isCorrect
                              ? 'bg-emerald-50/70 border-emerald-200'
                              : 'bg-rose-50/70 border-rose-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-800">No. {qNum}</span>
                            <span className="text-[10px] text-slate-500">Kunci: {correctAns}</span>
                          </div>

                          {/* Options selector */}
                          <div className="flex items-center justify-between gap-1 pt-0.5">
                            {options.map(opt => {
                              const isChosen = studentAns === opt;
                              const isKey = correctAns === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => handleToggleAnswer(qNum, opt)}
                                  className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center transition-all ${
                                    isChosen
                                      ? isKey
                                        ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                        : 'bg-rose-600 text-white shadow-xs scale-105'
                                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                  }`}
                                  title={`Pilih ${opt}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 2: Essay Score Input (Prompt Section 1: Guru dapat melihat dan mengoreksi jawaban uraian) */}
              {exam.essayCount > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Koreksi Jawaban Soal Uraian ({exam.essayCount} Soal)
                  </h4>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Array.from({ length: exam.essayCount }, (_, idx) => {
                      const essayNum = idx + 1;
                      const maxScore = exam.essayMaxScores[essayNum] || 6;
                      const currentScore = essayScores[essayNum] || 0;
                      const detectedEssay = scanResult.essayAnswers?.find(e => e.essayNumber === essayNum);

                      return (
                        <div key={essayNum} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">
                              Uraian No. {essayNum}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-slate-600">Beri Nilai:</span>
                              <input
                                type="number"
                                min="0"
                                max={maxScore}
                                value={currentScore}
                                onChange={e => handleEssayScoreChange(essayNum, parseInt(e.target.value, 10) || 0)}
                                className="w-16 px-2 py-1 text-xs font-bold text-center bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              />
                              <span className="text-xs font-bold text-slate-500">/ {maxScore}</span>
                            </div>
                          </div>

                          {detectedEssay && (
                            <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200/80 italic font-serif">
                              "{detectedEssay.extractedText || 'Jawaban tertulis di lembar kertas siswa.'}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Teacher Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Tambahan Guru</label>
                <input
                  type="text"
                  placeholder="Catatan guru, misal: Sangat baik, perlu pembinaan, dll."
                  value={teacherNotes}
                  onChange={e => setTeacherNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Hasil ke Rekap Nilai</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
