import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Exam, ScanDetectionResult, StudentResult } from '../types';
import { generateSampleLjkImage } from '../data/sampleData';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  SwitchCamera, 
  ScanLine, 
  Play, 
  Image as ImageIcon,
  Zap,
  Info
} from 'lucide-react';

interface ScannerViewProps {
  exams: Exam[];
  selectedExamId: string;
  onSelectExam: (examId: string) => void;
  onScanComplete: (result: ScanDetectionResult, imageSrc: string) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  exams,
  selectedExamId,
  onSelectExam,
  onScanComplete,
}) => {
  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0];

  const [inputMode, setInputMode] = useState<'camera' | 'upload'>('upload');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepMessage, setScanStepMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Drag & drop state
  const [isDragOver, setIsDragOver] = useState(false);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    stopCamera();
    setErrorMessage(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setErrorMessage(
        'Tidak dapat mengakses kamera perangkat. Pastikan izin kamera telah diberikan atau gunakan mode unggah berkas.'
      );
      setCameraActive(false);
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    if (inputMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [inputMode, startCamera, stopCamera]);

  const toggleCameraFacing = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Process image with backend server (with AI & OMR Engine)
  const processImage = async (base64Image: string) => {
    if (!currentExam) return;
    setIsScanning(true);
    setErrorMessage(null);

    try {
      setScanStepMessage('Mendeteksi 4 sudut orientasi lembar jawaban...');
      await new Promise(r => setTimeout(r, 400));

      setScanStepMessage('Membaca bulatan OMR Nomor Absen siswa...');
      await new Promise(r => setTimeout(r, 400));

      setScanStepMessage('Menganalisis bulatan Pilihan Ganda & mencocokkan kunci...');

      const response = await fetch('/api/scan-ljk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          totalQuestions: currentExam.pgCount,
          optionCount: currentExam.optionCount,
          essayCount: currentExam.essayCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal memproses pemindaian di server.');
      }

      const data = await response.json();
      setScanStepMessage('Pemindaian selesai! Membuka verifikasi hasil...');
      await new Promise(r => setTimeout(r, 300));

      onScanComplete(data, base64Image);
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMessage(err.message || 'Gagal memproses lembar jawaban.');
    } finally {
      setIsScanning(false);
      setScanStepMessage('');
    }
  };

  // Handle capture from camera feed
  const handleCaptureCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    processImage(dataUrl);
  };

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          processImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          processImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle 1-click test with pre-generated sample LJK
  const handleTestWithSampleLjk = () => {
    const sampleImg = generateSampleLjkImage('07', 'Budi Santoso');
    processImage(sampleImg);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header & Exam Selector */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-indigo-600" />
            Pemindai & Pemeriksa Lembar Jawaban (LJK)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pindai lembar jawaban siswa menggunakan kamera HP/laptop atau unggah gambar/scan untuk koreksi otomatis.
          </p>
        </div>

        {/* Exam Dropdown */}
        <div className="w-full sm:w-72">
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Ujian yang Diperiksa:
          </label>
          <select
            value={currentExam.id}
            onChange={e => onSelectExam(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden shadow-2xs"
          >
            {exams.map(e => (
              <option key={e.id} value={e.id}>
                {e.title} - {e.subject} ({e.gradeClass})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Mode Selector & Demo Test CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setInputMode('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              inputMode === 'upload'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Unggah Foto / Berkas</span>
          </button>

          <button
            onClick={() => setInputMode('camera')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              inputMode === 'camera'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Kamera Langsung</span>
          </button>
        </div>

        {/* 1-Click Fast Test Button */}
        <button
          onClick={handleTestWithSampleLjk}
          disabled={isScanning}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all shadow-2xs active:scale-95"
          title="Uji coba sistem scanner langsung menggunakan lembar jawaban sampel Budi Santoso"
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Tes Cepat dengan LJK Sampel (#07 Budi Santoso)</span>
        </button>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="flex-1">{errorMessage}</p>
        </div>
      )}

      {/* Scanning In-Progress Overlay Banner */}
      {isScanning && (
        <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-300" />
          </div>
          <div>
            <h4 className="font-bold text-base">Memproses Pemindaian Lembar Jawaban...</h4>
            <p className="text-indigo-200 text-xs mt-0.5">{scanStepMessage}</p>
          </div>
        </div>
      )}

      {/* Mode 1: Camera Scanner View */}
      {inputMode === 'camera' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl relative">
          <div className="relative aspect-4/3 sm:aspect-16/9 bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Camera Overlay Framing Guide */}
            <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-4">
              {/* Corner Targets */}
              <div className="flex justify-between">
                <div className="w-8 h-8 border-t-4 border-l-4 border-emerald-400"></div>
                <div className="w-8 h-8 border-t-4 border-r-4 border-emerald-400"></div>
              </div>

              {/* Center crosshair */}
              <div className="self-center text-center bg-black/60 backdrop-blur-xs px-4 py-1.5 rounded-full text-[11px] font-semibold text-emerald-300 border border-emerald-400/40">
                Posisikan 4 sudut lembar jawaban di dalam area bidik
              </div>

              <div className="flex justify-between">
                <div className="w-8 h-8 border-b-4 border-l-4 border-emerald-400"></div>
                <div className="w-8 h-8 border-b-4 border-r-4 border-emerald-400"></div>
              </div>
            </div>

            {/* Camera Controls Bar */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 px-4">
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-600 shadow-md backdrop-blur-xs transition-transform active:scale-95"
                title="Putar Kamera Depan/Belakang"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleCaptureCamera}
                disabled={isScanning || !cameraActive}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-900/40 transition-transform active:scale-95 disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
                <span>Ambil Foto & Periksa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Upload File / Drag and Drop View */}
      {inputMode === 'upload' && (
        <div
          onDragOver={e => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-50/50'
              : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
        >
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-xs">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tarik & Lepas Foto Lembar Jawaban ke Sini
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Mendukung format JPG, PNG, atau WEBP hasil kamera HP atau scanner flatbed.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer transition-all active:scale-95">
                <ImageIcon className="w-4 h-4" />
                <span>Pilih Foto dari Galeri</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 flex items-center justify-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Pastikan seluruh bagian kertas dan 4 sudut hitam (corner markers) tampak jelas dan tidak terpotong.
            </div>
          </div>
        </div>
      )}

      {/* Instructions Card */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Alur Pemeriksaan Otomatis:
        </h4>
        <ol className="list-decimal list-inside space-y-1 text-slate-600">
          <li>Sistem membaca nomor absen siswa dari bulatan OMR puluhan & satuan.</li>
          <li>Sistem mendeteksi bulatan pilihan ganda yang disilang/dihitamkan.</li>
          <li>Sistem mencocokkan secara otomatis dengan kunci jawaban ujian {currentExam.title}.</li>
          <li>Jendela verifikasi guru akan muncul untuk mengonfirmasi hasil dan menginput nilai uraian.</li>
          <li>Hasil nilai akhir langsung direkap ke database nilai siswa.</li>
        </ol>
      </div>
    </div>
  );
};
