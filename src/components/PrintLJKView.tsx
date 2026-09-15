import React, { useState } from 'react';
import { Exam } from '../types';
import { Printer, Sparkles, School, Eye, CheckCircle2, Sliders, FileDown, Loader2 } from 'lucide-react';
import { exportElementToPdf } from '../utils/pdfExport';

interface PrintLJKViewProps {
  exams: Exam[];
  selectedExamId: string;
  onSelectExam: (examId: string) => void;
}

export const PrintLJKView: React.FC<PrintLJKViewProps> = ({
  exams,
  selectedExamId,
  onSelectExam,
}) => {
  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0];

  // Print customization states
  const [isSampleFilled, setIsSampleFilled] = useState(false);
  const [sampleStudentName, setSampleStudentName] = useState('Budi Santoso');
  const [sampleAbsen, setSampleAbsen] = useState('07');
  const [schoolLogoText, setSchoolLogoText] = useState('TUT WURI HANDAYANI');
  const [customHeader, setCustomHeader] = useState('DINAS PENDIDIKAN DAN KEBUDAYAAN KABUPATEN');
  const [paperOrientation, setPaperOrientation] = useState<'A4'>('A4');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleSavePdf = async () => {
    if (isExportingPdf || !currentExam) return;
    setIsExportingPdf(true);
    setPdfSuccessMessage(null);

    try {
      const sanitizedSubject = (currentExam.subject || 'Ujian').replace(/[^a-zA-Z0-9_-]/g, '_');
      const sanitizedClass = (currentExam.gradeClass || 'Kelas').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `LJK_${sanitizedSubject}_${sanitizedClass}${isSampleFilled ? '_ContohTerisi' : ''}.pdf`;

      await exportElementToPdf('printable-ljk', {
        filename,
        orientation: 'portrait',
        format: 'a4',
        marginMm: 6,
        scale: 2.5,
      });

      setPdfSuccessMessage(`✓ Berhasil mengunduh "${filename}"!`);
      setTimeout(() => {
        setPdfSuccessMessage(null);
      }, 4000);
    } catch (error) {
      console.error('Gagal mengunduh PDF:', error);
      alert('Terjadi kendala saat memproses berkas PDF. Silakan gunakan tombol "Cetak Printer" dan pilih "Save as PDF" di dialog browser.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (!currentExam) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
        <p className="text-slate-500">Belum ada ujian yang dipilih. Silakan buat ujian terlebih dahulu.</p>
      </div>
    );
  }

  // Pre-calculate multiple choice columns
  const options = currentExam.optionCount === 5 ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];
  const questionsPerCol = 10;
  const totalCols = Math.ceil(currentExam.pgCount / questionsPerCol);

  // Sample student answers if sample mode is ON
  const sampleAnswers: Record<number, string> = {};
  if (isSampleFilled) {
    for (let i = 1; i <= currentExam.pgCount; i++) {
      const correct = currentExam.answerKeys[i];
      // Mostly correct with 2 realistic errors
      if (i === 14) {
        sampleAnswers[i] = options[(options.indexOf(correct) + 1) % options.length];
      } else if (i === 28) {
        sampleAnswers[i] = options[(options.indexOf(correct) + 2) % options.length];
      } else {
        sampleAnswers[i] = correct || 'A';
      }
    }
  }

  const tensDigit = parseInt(sampleAbsen[0] || '0', 10);
  const onesDigit = parseInt(sampleAbsen[1] || '7', 10);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Non-Printable Configuration Toolbar */}
      <div className="print:hidden bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Printer className="w-5 h-5 text-indigo-600" />
              Pembuat & Cetak Lembar Jawaban (LJK)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Lembar jawaban dirancang presisi dengan 4 corner markers dan grid OMR untuk pembacaan kamera otomatis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tombol Simpan PDF Aktif (Unduh Langsung) */}
            <button
              onClick={handleSavePdf}
              disabled={isExportingPdf}
              id="btn-simpan-pdf"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm active:scale-95 transition-all disabled:opacity-75 cursor-pointer"
              title="Unduh langsung lembar jawaban format berkas PDF (A4 presisi OMR)"
            >
              {isExportingPdf ? (
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

            {/* Tombol Cetak Printer Fisik */}
            <button
              onClick={handlePrint}
              id="btn-cetak-printer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Buka dialog cetak browser untuk diarahkan ke printer fisik"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Printer</span>
            </button>
          </div>
        </div>

        {/* Notifikasi Unduhan PDF Sukses */}
        {pdfSuccessMessage && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pdfSuccessMessage}</span>
          </div>
        )}

        {/* Filters and options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Pilih Ujian</label>
            <select
              value={currentExam.id}
              onChange={e => onSelectExam(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {exams.map(e => (
                <option key={e.id} value={e.id}>
                  {e.title} - {e.subject} ({e.gradeClass})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tipe Lembar Jawaban</label>
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setIsSampleFilled(false)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  !isSampleFilled
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Lembar Kosong
              </button>
              <button
                type="button"
                onClick={() => setIsSampleFilled(true)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSampleFilled
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Contoh Terisi
              </button>
            </div>
          </div>

          {isSampleFilled && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Siswa Sampel</label>
                <input
                  type="text"
                  value={sampleStudentName}
                  onChange={e => setSampleStudentName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">No. Absen Sampel (2 Digit)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={sampleAbsen}
                  onChange={e => setSampleAbsen(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            <strong>Tips Cetak:</strong> Saat jendela print terbuka, pilih tujuan <em>"Save as PDF"</em> atau cetak langsung ke printer dengan orientasi <strong>Potrait</strong> dan margin <strong>None / Default</strong> untuk hasil presisi OMR.
          </span>
        </div>
      </div>

      {/* PRINTABLE LJK CANVAS / PAPER CONTAINER */}
      <div className="flex justify-center">
        <div 
          id="printable-ljk" 
          className="w-full max-w-[840px] bg-white text-slate-900 border-2 border-slate-800 shadow-xl rounded-sm p-6 sm:p-8 relative print:border-2 print:border-black print:p-6 print:shadow-none print:m-0 print:w-full print:max-w-none select-none"
          style={{ fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}
        >
          {/* 4 CORNER FIDUCIAL CALIBRATION MARKERS ([ ■ ]) FOR CAMERA/OMR OCR */}
          <div className="absolute top-3 left-3 w-7 h-7 bg-black print:bg-black" title="Corner Marker TL"></div>
          <div className="absolute top-3 right-3 w-7 h-7 bg-black print:bg-black" title="Corner Marker TR"></div>
          <div className="absolute bottom-3 left-3 w-7 h-7 bg-black print:bg-black" title="Corner Marker BL"></div>
          <div className="absolute bottom-3 right-3 w-7 h-7 bg-black print:bg-black" title="Corner Marker BR"></div>

          {/* KOP / HEADER LEMBAR JAWABAN */}
          <div className="border-b-2 border-black pb-3 mb-4 text-center relative px-8">
            <div className="flex items-center justify-between gap-4">
              {/* School Logo */}
              <div className="w-16 h-16 border-2 border-black flex flex-col items-center justify-center p-1 rounded-sm text-center shrink-0">
                <School className="w-8 h-8 text-slate-900" />
                <span className="text-[7px] font-bold uppercase leading-none mt-0.5">LOGO</span>
              </div>

              {/* Header Titles */}
              <div className="flex-1 text-center">
                <h4 className="text-[11px] font-bold tracking-wider uppercase text-slate-800">{customHeader}</h4>
                <h2 className="text-base sm:text-lg font-black tracking-tight uppercase text-black">{currentExam.schoolName}</h2>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-900 mt-0.5">
                  LEMBAR JAWABAN KOMPUTER (LJK)
                </h3>
                <p className="text-[11px] font-semibold text-slate-700">
                  {currentExam.title} • TAHUN PELAJARAN {currentExam.academicYear} ({currentExam.semester.toUpperCase()})
                </p>
              </div>

              {/* Right Box: Exam Code & Time */}
              <div className="w-24 border border-black p-1.5 text-center text-[10px] shrink-0">
                <span className="block font-bold text-slate-900">DURASI</span>
                <span className="font-extrabold text-xs">{currentExam.durationMinutes} Menit</span>
                <span className="block text-[8px] text-slate-600 mt-1">KODE: {currentExam.id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* BAGIAN IDENTITAS SISWA & NOMOR ABSEN OMR */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
            {/* Box 1: Identitas Siswa (7 cols) */}
            <div className="sm:col-span-7 border-2 border-black p-3 space-y-2 rounded-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 border-b border-black">
                A. IDENTITAS PESERTA DIDIK
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-24 font-bold text-slate-900">Mata Pelajaran</span>
                  <span className="font-semibold text-slate-900">: {currentExam.subject}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-24 font-bold text-slate-900">Kelas / Guru</span>
                  <span className="font-semibold text-slate-900">: {currentExam.gradeClass} / {currentExam.teacherName}</span>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                  <span className="w-24 font-bold text-slate-900">Nama Siswa</span>
                  <div className="flex-1 border-b-2 border-dotted border-black min-h-[22px] px-1 font-bold text-slate-900">
                    {isSampleFilled ? sampleStudentName : ''}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-24 font-bold text-slate-900">Tanda Tangan</span>
                  <div className="flex-1 border-b border-slate-300 min-h-[20px]"></div>
                </div>

                <div className="text-[9px] text-slate-600 italic pt-1 leading-tight">
                  * Petunjuk: Isikan nama lengkap dan nomor absen dengan jelas. Hitamkan atau silang penuh (X) pada bulatan pilihan jawaban.
                </div>
              </div>
            </div>

            {/* Box 2: NOMOR ABSEN OMR BUBBLE (5 cols) (Requested explicitly in Prompt) */}
            <div className="sm:col-span-5 border-2 border-black p-3 rounded-xs bg-slate-50/50">
              <div className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 text-center mb-2">
                B. NOMOR ABSEN (OMR)
              </div>

              <div className="flex justify-center gap-6">
                {/* Tens Column */}
                <div className="text-center">
                  <span className="text-[10px] font-bold block mb-1 text-slate-700">PULUHAN</span>
                  <div className="w-8 h-8 border-2 border-black mb-2 flex items-center justify-center font-bold text-sm bg-white">
                    {isSampleFilled ? tensDigit : ''}
                  </div>
                  {/* Bubbles 0 to 9 */}
                  <div className="space-y-1">
                    {Array.from({ length: 10 }, (_, d) => {
                      const isSelected = isSampleFilled && d === tensDigit;
                      return (
                        <div
                          key={d}
                          className={`w-6 h-6 mx-auto rounded-full border border-black flex items-center justify-center text-[10px] font-bold ${
                            isSelected ? 'bg-black text-white ring-1 ring-black' : 'bg-white text-slate-900'
                          }`}
                        >
                          {isSelected ? 'X' : d}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ones Column */}
                <div className="text-center">
                  <span className="text-[10px] font-bold block mb-1 text-slate-700">SATUAN</span>
                  <div className="w-8 h-8 border-2 border-black mb-2 flex items-center justify-center font-bold text-sm bg-white">
                    {isSampleFilled ? onesDigit : ''}
                  </div>
                  {/* Bubbles 0 to 9 */}
                  <div className="space-y-1">
                    {Array.from({ length: 10 }, (_, d) => {
                      const isSelected = isSampleFilled && d === onesDigit;
                      return (
                        <div
                          key={d}
                          className={`w-6 h-6 mx-auto rounded-full border border-black flex items-center justify-center text-[10px] font-bold ${
                            isSelected ? 'bg-black text-white ring-1 ring-black' : 'bg-white text-slate-900'
                          }`}
                        >
                          {isSelected ? 'X' : d}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BAGIAN LEMBAR JAWABAN PILIHAN GANDA */}
          <div className="border-2 border-black p-3 mb-4 rounded-xs">
            <div className="flex items-center justify-between border-b-2 border-black pb-1 mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-black">
                C. PILIHAN GANDA ({currentExam.pgCount} SOAL - BOBOT {currentExam.pgWeight}%)
              </span>
              <span className="text-[10px] font-semibold text-slate-600">
                Pilihan Jawaban: {options.join(' - ')}
              </span>
            </div>

            {/* Questions Columns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Array.from({ length: totalCols }, (_, colIdx) => {
                const start = colIdx * questionsPerCol + 1;
                const end = Math.min(start + questionsPerCol - 1, currentExam.pgCount);

                return (
                  <div key={colIdx} className="border border-slate-400 p-2 bg-white rounded-xs space-y-1.5">
                    <div className="text-[9px] font-bold text-center border-b border-slate-300 pb-0.5 uppercase tracking-wider text-slate-600">
                      Soal {start} - {end}
                    </div>

                    {Array.from({ length: end - start + 1 }, (_, qOffset) => {
                      const qNum = start + qOffset;
                      const filledChoice = isSampleFilled ? sampleAnswers[qNum] : null;

                      return (
                        <div key={qNum} className="flex items-center justify-between gap-1 py-0.5">
                          <span className="text-[11px] font-bold text-slate-900 w-5 text-right shrink-0">
                            {qNum}.
                          </span>
                          <div className="flex items-center gap-1">
                            {options.map(opt => {
                              const isFilled = filledChoice === opt;
                              return (
                                <div
                                  key={opt}
                                  className={`w-5 h-5 rounded-full border border-black flex items-center justify-center text-[9px] font-bold leading-none ${
                                    isFilled
                                      ? 'bg-black text-white'
                                      : 'bg-white text-slate-800'
                                  }`}
                                >
                                  {isFilled ? 'X' : opt}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* BAGIAN LEMBAR JAWABAN URAIAN (JIKA ADA) */}
          {currentExam.essayCount > 0 && (
            <div className="border-2 border-black p-3 rounded-xs">
              <div className="flex items-center justify-between border-b-2 border-black pb-1 mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-black">
                  D. SOAL URAIAN ({currentExam.essayCount} SOAL - BOBOT {currentExam.essayWeight}%)
                </span>
                <span className="text-[10px] font-semibold text-slate-600">
                  Tuliskan jawaban pada kolom bergaris di bawah ini
                </span>
              </div>

              <div className="space-y-2">
                {Array.from({ length: currentExam.essayCount }, (_, eIdx) => {
                  const essayNum = eIdx + 1;
                  const maxScore = currentExam.essayMaxScores[essayNum] || 6;
                  return (
                    <div key={essayNum} className="border border-black p-2 flex gap-3 rounded-xs">
                      {/* Question Label */}
                      <div className="w-16 border-r border-black pr-2 shrink-0">
                        <span className="text-xs font-bold block text-black">No. {essayNum}</span>
                        <span className="text-[9px] text-slate-500 block">Maks: {maxScore}</span>
                      </div>

                      {/* Lined Ruled Answer Area */}
                      <div className="flex-1 space-y-3 py-1">
                        <div className="border-b border-slate-300 h-4">
                          {isSampleFilled && essayNum === 1 && (
                            <span className="text-[11px] font-serif italic text-blue-900">
                              Pertukaran O2 dan CO2 terjadi di alveolus secara difusi melewati kapiler.
                            </span>
                          )}
                        </div>
                        <div className="border-b border-slate-300 h-4"></div>
                        <div className="border-b border-slate-300 h-4"></div>
                      </div>

                      {/* Teacher Score Stamp Box */}
                      <div className="w-16 border-l border-black pl-2 text-center flex flex-col justify-between shrink-0">
                        <span className="text-[8px] font-bold text-slate-600">SKOR GURU</span>
                        <div className="border border-dashed border-black h-8 flex items-center justify-center font-bold text-sm">
                          {isSampleFilled && essayNum === 1 ? '5' : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-3 pt-2 border-t border-slate-300 text-center text-[9px] text-slate-500">
            Koreksi Otomatis Lembar Jawaban • Pastikan lembar tidak terlipat, basah, atau ternoda pada area bulatan OMR.
          </div>
        </div>
      </div>
    </div>
  );
};
