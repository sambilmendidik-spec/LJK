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
  const [sampleStudentNumber, setSampleStudentNumber] = useState('07');
  const [studentNumberDigits, setStudentNumberDigits] = useState<2 | 3>(2);
  const [schoolLogoText, setSchoolLogoText] = useState('TUT WURI HANDAYANI');
  const [customHeader, setCustomHeader] = useState('DINAS PENDIDIKAN DAN KEBUDAYAAN KABUPATEN');
  const [paperSize, setPaperSize] = useState<'A4' | 'F4'>('A4');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (isExportingPdf || !currentExam) return;
    setIsExportingPdf(true);
    setPdfSuccessMessage(null);

    try {
      const sanitizedSubject = (currentExam.subject || 'Ujian').replace(/[^a-zA-Z0-9_-]/g, '_');
      const sanitizedClass = (currentExam.gradeClass || 'Kelas').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `LJK_${sanitizedSubject}_${sanitizedClass}_${paperSize}${isSampleFilled ? '_ContohTerisi' : ''}.pdf`;

      await exportElementToPdf('printable-ljk', {
        filename,
        orientation: 'portrait',
        format: paperSize === 'F4' ? 'f4' : 'a4',
        marginMm: 6,
        scale: 2.5,
      });

      setPdfSuccessMessage(`✓ Berhasil mengunduh "${filename}" (Ukuran ${paperSize})! Berkas tersimpan di folder Unduhan.`);
      setTimeout(() => {
        setPdfSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Gagal mengunduh PDF:', error);
      alert('Terjadi kendala saat memproses berkas PDF. Silakan gunakan tombol "Cetak Printer" lalu pilih opsi "Save as PDF / Simpan sebagai PDF" di dialog browser.');
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

  // Digits array for horizontal student number OMR
  const paddedNumber = sampleStudentNumber.padStart(studentNumberDigits, '0').slice(-studentNumberDigits);
  const digitsArray = paddedNumber.split('').map(d => parseInt(d, 10) || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Dynamic print style for paper size A4 vs F4 */}
      <style>
        {`@media print {
          @page {
            size: ${paperSize === 'F4' ? '215mm 330mm' : 'A4 portrait'};
            margin: 5mm;
          }
        }`}
      </style>

      {/* Non-Printable Configuration Toolbar */}
      <div className="print:hidden bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Printer className="w-5 h-5 text-indigo-600" />
              Pembuat & Cetak Lembar Jawaban (LJK)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Lembar jawaban presisi OMR dengan nomor siswa mendatar hemat ruang dan pilihan format kertas A4 & F4.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tombol Unduh PDF Aktif (Langsung Download Berkas PDF) */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              id="btn-unduh-pdf"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm active:scale-95 transition-all disabled:opacity-75 cursor-pointer"
              title={`Unduh langsung berkas PDF lembar jawaban ukuran ${paperSize}`}
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengunduh PDF ({paperSize})...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Unduh PDF</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Pilih Ujian</label>
            <select
              value={currentExam.id}
              onChange={e => onSelectExam(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {exams.map(e => (
                <option key={e.id} value={e.id}>
                  {e.title} - {e.subject} ({e.gradeClass})
                </option>
              ))}
            </select>
          </div>

          {/* Pilihan Ukuran Kertas A4 & F4 */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Pilihan Ukuran Kertas
            </label>
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                type="button"
                id="btn-paper-a4"
                onClick={() => setPaperSize('A4')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  paperSize === 'A4'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                A4 (210 × 297 mm)
              </button>
              <button
                type="button"
                id="btn-paper-f4"
                onClick={() => setPaperSize('F4')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  paperSize === 'F4'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                F4 / Folio (215 × 330 mm)
              </button>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              {paperSize === 'A4'
                ? 'Standar umum ISO (21,0 × 29,7 cm)'
                : 'Standar kertas Folio sekolah Indonesia (21,5 × 33,0 cm)'}
            </span>
          </div>

          {/* Format Digit Nomor Siswa */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Format Nomor Siswa (OMR)
            </label>
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setStudentNumberDigits(2);
                  if (sampleStudentNumber.length > 2) {
                    setSampleStudentNumber(sampleStudentNumber.slice(-2));
                  }
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  studentNumberDigits === 2
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                2 Digit (01-99)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStudentNumberDigits(3);
                  if (sampleStudentNumber.length < 3) {
                    setSampleStudentNumber(sampleStudentNumber.padStart(3, '0'));
                  }
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  studentNumberDigits === 3
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                3 Digit (001-999)
              </button>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              Disusun melebar mendatar (hemat ruang vertikal LJK)
            </span>
          </div>

          {/* Tipe Lembar Jawaban */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tipe Lembar Jawaban</label>
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => setIsSampleFilled(false)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
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
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isSampleFilled
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Contoh Terisi
              </button>
            </div>
          </div>
        </div>

        {isSampleFilled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
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
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nomor Siswa Sampel ({studentNumberDigits} Digit)
              </label>
              <input
                type="text"
                maxLength={studentNumberDigits}
                value={sampleStudentNumber}
                onChange={e => setSampleStudentNumber(e.target.value.replace(/\D/g, '').slice(0, studentNumberDigits))}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            <strong>Tips Unduh & Cetak:</strong> Klik <strong>"Unduh PDF"</strong> untuk mengunduh langsung berkas PDF dengan ukuran <strong>{paperSize}</strong>. Kolom nomor siswa dirancang mendatar ke samping agar tidak menghabiskan ruang halaman sehingga muat rapi dalam satu lembar.
          </span>
        </div>
      </div>

      {/* PRINTABLE LJK CANVAS / PAPER CONTAINER */}
      <div className="flex justify-center">
        <div 
          id="printable-ljk" 
          className={`w-full max-w-[840px] bg-white text-slate-900 border-2 border-slate-800 shadow-xl rounded-sm p-6 sm:p-7 relative print:border-2 print:border-black print:p-5 print:shadow-none print:m-0 print:w-full print:max-w-none select-none ${
            paperSize === 'F4' ? 'min-h-[1200px]' : 'min-h-[1100px]'
          }`}
          style={{ fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}
        >
          {/* Badge Format Kertas (Layar saja, tidak tercetak) */}
          <div className="print:hidden absolute top-2 right-12 bg-slate-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
            Kertas: {paperSize} ({paperSize === 'F4' ? '215 × 330 mm' : '210 × 297 mm'})
          </div>

          {/* 4 CORNER FIDUCIAL CALIBRATION MARKERS ([ ■ ]) FOR CAMERA/OMR OCR */}
          <div className="absolute top-3 left-3 w-7 h-7 bg-black print:bg-black" title="Corner Marker TL"></div>
          <div className="absolute top-3 right-3 w-7 h-7 bg-black print:bg-black" title="Corner Marker TR"></div>
          <div className="absolute bottom-3 left-3 w-7 h-7 bg-black print:bg-black" title="Corner Marker BL"></div>
          <div className="absolute bottom-3 right-3 w-7 h-7 bg-black print:bg-black" title="Corner Marker BR"></div>

          {/* KOP / HEADER LEMBAR JAWABAN */}
          <div className="border-b-2 border-black pb-2.5 mb-3 text-center relative px-8">
            <div className="flex items-center justify-between gap-4">
              {/* School Logo */}
              <div className="w-14 h-14 border-2 border-black flex flex-col items-center justify-center p-1 rounded-sm text-center shrink-0">
                <School className="w-7 h-7 text-slate-900" />
                <span className="text-[7px] font-bold uppercase leading-none mt-0.5">LOGO</span>
              </div>

              {/* Header Titles */}
              <div className="flex-1 text-center">
                <h4 className="text-[10px] font-bold tracking-wider uppercase text-slate-800">{customHeader}</h4>
                <h2 className="text-base sm:text-lg font-black tracking-tight uppercase text-black">{currentExam.schoolName}</h2>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-900 mt-0.5">
                  LEMBAR JAWABAN KOMPUTER (LJK)
                </h3>
                <p className="text-[10.5px] font-semibold text-slate-700">
                  {currentExam.title} • TAHUN PELAJARAN {currentExam.academicYear} ({currentExam.semester.toUpperCase()})
                </p>
              </div>

              {/* Right Box: Exam Code & Time */}
              <div className="w-24 border border-black p-1.5 text-center text-[10px] shrink-0">
                <span className="block font-bold text-slate-900">DURASI</span>
                <span className="font-extrabold text-xs">{currentExam.durationMinutes} Menit</span>
                <span className="block text-[8px] text-slate-600 mt-0.5">KODE: {currentExam.id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* BAGIAN IDENTITAS SISWA & NOMOR SISWA OMR (MELEBAR KE SAMPING - HEMAT RUANG) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
            {/* Box 1: Identitas Siswa (sm:col-span-6) */}
            <div className="sm:col-span-6 border-2 border-black p-2.5 rounded-xs space-y-1.5 bg-white">
              <div className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 border-b border-black">
                A. IDENTITAS PESERTA DIDIK
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-24 font-bold text-slate-900 text-[11px]">Mata Pelajaran</span>
                  <span className="font-semibold text-slate-900 text-[11px] truncate">: {currentExam.subject}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-24 font-bold text-slate-900 text-[11px]">Kelas / Guru</span>
                  <span className="font-semibold text-slate-900 text-[11px] truncate">: {currentExam.gradeClass} / {currentExam.teacherName}</span>
                </div>

                <div className="flex items-center gap-1.5 pt-0.5 border-t border-slate-200">
                  <span className="w-24 font-bold text-slate-900 text-[11px]">Nama Siswa</span>
                  <div className="flex-1 border-b-2 border-dotted border-black min-h-[20px] px-1 font-bold text-slate-900 text-[11px]">
                    {isSampleFilled ? sampleStudentName : ''}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-24 font-bold text-slate-900 text-[11px]">Tanda Tangan</span>
                  <div className="flex-1 border-b border-slate-400 min-h-[18px]"></div>
                </div>

                <div className="text-[8.5px] text-slate-600 italic pt-0.5 leading-tight">
                  * Petunjuk: Tuliskan nama lengkap. Hitamkan bulatan nomor dan pilihan jawaban dengan pensil 2B atau pulpen hitam.
                </div>
              </div>
            </div>

            {/* Box 2: NOMOR SISWA OMR MELEBAR KE SAMPING (sm:col-span-6) */}
            <div className="sm:col-span-6 border-2 border-black p-2.5 rounded-xs bg-slate-50/60 flex flex-col justify-between">
              <div className="flex items-center justify-between bg-black text-white px-2 py-0.5 mb-1.5 rounded-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  B. NOMOR SISWA / PESERTA (OMR)
                </span>
                <span className="text-[8px] text-slate-300 font-normal">
                  Hitamkan bulatan mendatar
                </span>
              </div>

              {/* Grid OMR Baris Mendatar */}
              <div className="bg-white border border-black p-1.5 rounded-xs space-y-1">
                {/* Baris Panduan Angka 0 - 9 di Atas */}
                <div className="flex items-center text-[9px] font-bold text-slate-700 pb-0.5 border-b border-slate-300">
                  <div className="w-14 shrink-0 text-left pl-0.5 text-[8px] uppercase tracking-tight text-slate-600 font-bold">
                    Digit
                  </div>
                  <div className="w-6 shrink-0 text-center text-[8px] uppercase tracking-tight text-slate-600 font-bold mr-1">
                    Tulis
                  </div>
                  <div className="flex-1 flex justify-between px-0.5">
                    {Array.from({ length: 10 }, (_, d) => (
                      <span key={d} className="w-4.5 text-center font-mono font-bold text-[9px] text-slate-800">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Baris Mendatar untuk Setiap Digit */}
                {digitsArray.map((digitVal, rowIdx) => {
                  const label = studentNumberDigits === 2
                    ? (rowIdx === 0 ? 'Puluhan' : 'Satuan')
                    : (rowIdx === 0 ? 'Ratusan' : rowIdx === 1 ? 'Puluhan' : 'Satuan');

                  return (
                    <div key={rowIdx} className="flex items-center py-0.5">
                      {/* Label Baris Digit */}
                      <div className="w-14 shrink-0 text-left pl-0.5">
                        <span className="text-[9px] font-bold uppercase text-slate-800 block leading-tight">
                          {label}
                        </span>
                        <span className="text-[7px] text-slate-500 leading-none">D{rowIdx + 1}</span>
                      </div>

                      {/* Kotak Tulis Angka */}
                      <div className="w-6 h-5 border-2 border-black shrink-0 flex items-center justify-center font-bold text-[11px] bg-white text-black font-mono mr-1">
                        {isSampleFilled ? digitVal : ''}
                      </div>

                      {/* 10 Bulatan OMR Terentang Melebar ke Samping */}
                      <div className="flex-1 flex justify-between px-0.5">
                        {Array.from({ length: 10 }, (_, d) => {
                          const isSelected = isSampleFilled && d === digitVal;
                          return (
                            <div
                              key={d}
                              className={`w-4.5 h-4.5 rounded-full border border-black flex items-center justify-center text-[8.5px] font-bold leading-none ${
                                isSelected
                                  ? 'bg-black text-white ring-1 ring-black'
                                  : 'bg-white text-slate-900'
                              }`}
                            >
                              {isSelected ? 'X' : d}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[8px] text-slate-600 italic text-center mt-1 leading-tight">
                Tulis angka pada kotak kiri, lalu hitamkan satu bulatan angka yang sesuai pada baris tersebut.
              </div>
            </div>
          </div>

          {/* BAGIAN LEMBAR JAWABAN PILIHAN GANDA */}
          <div className="border-2 border-black p-2.5 mb-3 rounded-xs">
            <div className="flex items-center justify-between border-b-2 border-black pb-1 mb-2">
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
