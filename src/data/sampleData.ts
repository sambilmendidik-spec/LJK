import { Exam, StudentResult } from '../types';

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam-pas-ipa-9',
    title: 'Penilaian Akhir Semester (PAS) Ganjil',
    subject: 'Ilmu Pengetahuan Alam (IPA)',
    gradeClass: 'IX-A',
    teacherName: 'Dra. Sri Wahyuni, M.Pd.',
    schoolName: 'SMP NEGERI 1 TELADAN NUSANTARA',
    academicYear: '2024/2025',
    semester: 'Ganjil',
    examDate: '2024-12-05',
    durationMinutes: 90,
    description: 'Petunjuk: Hitamkan atau silang (X) salah satu bulatan pilihan jawaban A, B, C, atau D dengan pensil 2B atau pulpen hitam.',
    pgCount: 40,
    optionCount: 4,
    pgWeight: 70,
    essayCount: 5,
    essayWeight: 30,
    passingScore: 75,
    answerKeys: {
      1: 'A', 2: 'C', 3: 'B', 4: 'D', 5: 'A',
      6: 'B', 7: 'C', 8: 'A', 9: 'D', 10: 'B',
      11: 'C', 12: 'A', 13: 'B', 14: 'D', 15: 'C',
      16: 'A', 17: 'D', 18: 'B', 19: 'C', 20: 'A',
      21: 'D', 22: 'B', 23: 'C', 24: 'A', 25: 'B',
      26: 'D', 27: 'C', 28: 'A', 29: 'B', 30: 'D',
      31: 'A', 32: 'C', 33: 'B', 34: 'D', 35: 'A',
      36: 'C', 37: 'B', 38: 'A', 39: 'D', 40: 'C',
    },
    essayMaxScores: {
      1: 6, 2: 6, 3: 6, 4: 6, 5: 6,
    },
    createdAt: '2024-12-01T08:00:00.000Z',
  },
  {
    id: 'exam-matematika-8',
    title: 'Asesmen Sumatif Tengah Semester',
    subject: 'Matematika',
    gradeClass: 'VIII-B',
    teacherName: 'Bambang Sudarsono, S.Pd.',
    schoolName: 'SMP NEGERI 1 TELADAN NUSANTARA',
    academicYear: '2024/2025',
    semester: 'Ganjil',
    examDate: '2024-10-18',
    durationMinutes: 80,
    description: 'Kerjakan soal pilihan ganda (opsi A-E) dan uraian terstruktur dengan teliti.',
    pgCount: 25,
    optionCount: 5,
    pgWeight: 70,
    essayCount: 3,
    essayWeight: 30,
    passingScore: 72,
    answerKeys: {
      1: 'C', 2: 'A', 3: 'E', 4: 'B', 5: 'D',
      6: 'A', 7: 'C', 8: 'B', 9: 'E', 10: 'D',
      11: 'B', 12: 'A', 13: 'C', 14: 'D', 15: 'E',
      16: 'A', 17: 'B', 18: 'C', 19: 'D', 20: 'B',
      21: 'E', 22: 'A', 23: 'C', 24: 'D', 25: 'B',
    },
    essayMaxScores: {
      1: 10, 2: 10, 3: 10,
    },
    createdAt: '2024-10-10T09:00:00.000Z',
  }
];

export const INITIAL_RESULTS: StudentResult[] = [
  {
    id: 'res-1',
    examId: 'exam-pas-ipa-9',
    studentNumber: '01',
    studentName: 'Ahmad Dahlan',
    pgAnswers: {
      1: 'A', 2: 'C', 3: 'B', 4: 'D', 5: 'A',
      6: 'B', 7: 'C', 8: 'A', 9: 'D', 10: 'B',
      11: 'C', 12: 'A', 13: 'B', 14: 'D', 15: 'C',
      16: 'A', 17: 'D', 18: 'B', 19: 'C', 20: 'A',
      21: 'D', 22: 'B', 23: 'C', 24: 'A', 25: 'B',
      26: 'D', 27: 'C', 28: 'A', 29: 'B', 30: 'D',
      31: 'A', 32: 'C', 33: 'B', 34: 'D', 35: 'B', // wrong
      36: 'C', 37: 'B', 38: 'A', 39: 'D', 40: 'C',
    },
    essayScores: { 1: 6, 2: 5, 3: 6, 4: 5, 5: 6 },
    essayAnswers: {
      1: 'Sistem pernapasan manusia dimulai dari rongga hidung, faring, laring, trakea, bronkus, dan alveolus di mana terjadi pertukaran oksigen dan karbon dioksida.',
      2: 'Hukum Ohm menyatakan bahwa kuat arus listrik berbanding lurus dengan beda potensial dan berbanding terbalik dengan hambatan.',
      3: 'Contoh simbiosis mutualisme adalah lebah dengan bunga dan bakteri Rhizobium dengan akar polong-polongan.',
      4: 'Fotosintesis menghasilkan glukosa dan oksigen dengan bantuan klorofil dan sinar matahari.',
      5: 'Prinsip kerja transformator step-up adalah menaikkan tegangan bolak-balik dengan jumlah lilitan sekunder lebih banyak daripada primer.'
    },
    correctPgCount: 39,
    wrongPgCount: 1,
    blankPgCount: 0,
    pgScore: 68.25, // (39/40)*70
    essayScore: 28.0, // (28/30)*30
    totalScore: 96.3,
    isPassed: true,
    scannedAt: '2024-12-05T10:15:00.000Z',
    status: 'verified',
    teacherNotes: 'Sangat baik, penjelasan uraian runtut dan tepat.'
  },
  {
    id: 'res-2',
    examId: 'exam-pas-ipa-9',
    studentNumber: '02',
    studentName: 'Annisa Putri Rahmadani',
    pgAnswers: {
      1: 'A', 2: 'C', 3: 'B', 4: 'D', 5: 'A',
      6: 'B', 7: 'C', 8: 'A', 9: 'D', 10: 'B',
      11: 'C', 12: 'A', 13: 'B', 14: 'C', 15: 'C', // 14 wrong
      16: 'A', 17: 'D', 18: 'B', 19: 'C', 20: 'A',
      21: 'D', 22: 'B', 23: 'C', 24: 'A', 25: 'B',
      26: 'D', 27: 'C', 28: 'B', 29: 'B', 30: 'D', // 28 wrong
      31: 'A', 32: 'C', 33: 'B', 34: 'D', 35: 'A',
      36: 'C', 37: 'B', 38: 'A', 39: 'B', 40: 'C', // 39 wrong
    },
    essayScores: { 1: 5, 2: 5, 3: 5, 4: 6, 5: 5 },
    essayAnswers: {
      1: 'Rongga hidung menyaring udara kotor sebelum masuk ke trakea dan paru-paru.',
      2: 'V = I x R, jika tegangan naik maka kuat arus bertambah.',
      3: 'Mutualisme menguntungkan kedua belah pihak contohnya anemon dan ikan badut.',
      4: '6CO2 + 6H2O menghasilkan C6H12O6 dan 6O2.',
      5: 'Trafo step up memiliki lilitan output lebih banyak.'
    },
    correctPgCount: 37,
    wrongPgCount: 3,
    blankPgCount: 0,
    pgScore: 64.75,
    essayScore: 26.0,
    totalScore: 90.8,
    isPassed: true,
    scannedAt: '2024-12-05T10:18:00.000Z',
    status: 'verified',
    teacherNotes: 'Bagus, perhatikan kembali konsep hambatan listrik.'
  },
  {
    id: 'res-3',
    examId: 'exam-pas-ipa-9',
    studentNumber: '03',
    studentName: 'Bagas Pratama',
    pgAnswers: {
      1: 'A', 2: 'B', 3: 'B', 4: 'D', 5: 'A', // 2 wrong
      6: 'B', 7: 'C', 8: 'B', 9: 'D', 10: 'B', // 8 wrong
      11: 'C', 12: 'A', 13: 'B', 14: 'D', 15: 'C',
      16: 'A', 17: 'D', 18: 'B', 19: 'C', 20: 'A',
      21: 'D', 22: 'A', 23: 'C', 24: 'A', 25: 'B', // 22 wrong
      26: 'D', 27: 'C', 28: 'A', 29: 'B', 30: 'D',
      31: 'A', 32: 'C', 33: 'B', 34: 'D', 35: 'A',
      36: 'C', 37: 'B', 38: 'A', 39: 'D', 40: 'B', // 40 wrong
    },
    essayScores: { 1: 4, 2: 4, 3: 5, 4: 4, 5: 4 },
    correctPgCount: 36,
    wrongPgCount: 4,
    blankPgCount: 0,
    pgScore: 63.0,
    essayScore: 21.0,
    totalScore: 84.0,
    isPassed: true,
    scannedAt: '2024-12-05T10:21:00.000Z',
    status: 'verified',
  },
  {
    id: 'res-4',
    examId: 'exam-pas-ipa-9',
    studentNumber: '04',
    studentName: 'Citra Lestari',
    pgAnswers: {
      1: 'A', 2: 'C', 3: 'B', 4: 'D', 5: 'A',
      6: 'B', 7: 'C', 8: 'A', 9: 'D', 10: 'B',
      11: 'A', 12: 'A', 13: 'B', 14: 'D', 15: 'C', // 11 wrong
      16: 'A', 17: 'D', 18: 'B', 19: 'C', 20: 'A',
      21: 'D', 22: 'B', 23: 'C', 24: 'A', 25: 'B',
      26: 'D', 27: 'B', 28: 'A', 29: 'B', 30: 'D', // 27 wrong
      31: 'A', 32: 'C', 33: 'B', 34: 'D', 35: 'A',
      36: 'C', 37: 'B', 38: 'A', 39: 'D', 40: 'C',
    },
    essayScores: { 1: 5, 2: 4, 3: 5, 4: 5, 5: 5 },
    correctPgCount: 38,
    wrongPgCount: 2,
    blankPgCount: 0,
    pgScore: 66.5,
    essayScore: 24.0,
    totalScore: 90.5,
    isPassed: true,
    scannedAt: '2024-12-05T10:24:00.000Z',
    status: 'verified',
  },
  {
    id: 'res-5',
    examId: 'exam-pas-ipa-9',
    studentNumber: '05',
    studentName: 'Dimas Anggara',
    pgAnswers: {
      1: 'A', 2: 'C', 3: 'B', 4: 'A', 5: 'A', // 4 wrong
      6: 'B', 7: 'A', 8: 'A', 9: 'D', 10: 'B', // 7 wrong
      11: 'C', 12: 'A', 13: 'B', 14: 'D', 15: 'C',
      16: 'A', 17: 'D', 18: 'B', 19: 'C', 20: 'A',
      21: 'D', 22: 'B', 23: 'C', 24: 'A', 25: 'B',
      26: 'D', 27: 'C', 28: 'A', 29: 'B', 30: 'D',
      31: 'A', 32: 'C', 33: 'B', 34: 'D', 35: 'A',
      36: 'C', 37: 'B', 38: 'A', 39: 'D', 40: 'C',
    },
    essayScores: { 1: 3, 2: 3, 3: 4, 4: 3, 5: 3 },
    correctPgCount: 38,
    wrongPgCount: 2,
    blankPgCount: 0,
    pgScore: 66.5,
    essayScore: 16.0,
    totalScore: 82.5,
    isPassed: true,
    scannedAt: '2024-12-05T10:27:00.000Z',
    status: 'verified',
  },
  {
    id: 'res-6',
    examId: 'exam-pas-ipa-9',
    studentNumber: '06',
    studentName: 'Eka Saputra',
    pgAnswers: {
      1: 'B', 2: 'C', 3: 'B', 4: 'D', 5: 'B', // 1, 5 wrong
      6: 'B', 7: 'C', 8: 'A', 9: 'A', 10: 'B', // 9 wrong
      11: 'C', 12: 'A', 13: 'B', 14: 'D', 15: 'C',
      16: 'B', 17: 'D', 18: 'B', 19: 'C', 20: 'A', // 16 wrong
      21: 'D', 22: 'B', 23: 'C', 24: 'A', 25: 'B',
      26: 'D', 27: 'C', 28: 'A', 29: 'B', 30: 'D',
      31: 'A', 32: 'C', 33: 'B', 34: 'D', 35: 'A',
      36: 'C', 37: 'B', 38: 'A', 39: 'D', 40: 'C',
    },
    essayScores: { 1: 2, 2: 2, 3: 3, 4: 2, 5: 2 },
    correctPgCount: 36,
    wrongPgCount: 4,
    blankPgCount: 0,
    pgScore: 63.0,
    essayScore: 11.0,
    totalScore: 74.0, // Below KKM 75
    isPassed: false,
    scannedAt: '2024-12-05T10:30:00.000Z',
    status: 'verified',
    teacherNotes: 'Perlu bimbingan remedial untuk materi transformator dan listrik.'
  }
];

// Helper to generate a realistic synthetic LJK image using HTML5 Canvas for quick 1-click testing
export function generateSampleLjkImage(studentNumber = '07', studentName = 'Budi Santoso'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1260;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background Paper
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Corner Fiducial Markers for OMR Camera Vision
  ctx.fillStyle = '#111827';
  const markerSize = 36;
  const margin = 28;
  // Top-Left
  ctx.fillRect(margin, margin, markerSize, markerSize);
  // Top-Right
  ctx.fillRect(canvas.width - margin - markerSize, margin, markerSize, markerSize);
  // Bottom-Left
  ctx.fillRect(margin, canvas.height - margin - markerSize, markerSize, markerSize);
  // Bottom-Right
  ctx.fillRect(canvas.width - margin - markerSize, canvas.height - margin - markerSize, markerSize, markerSize);

  // Outer Border Line
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#1F2937';
  ctx.strokeRect(margin + 5, margin + 5, canvas.width - (margin + 5) * 2, canvas.height - (margin + 5) * 2);

  // Header Title
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LEMBAR JAWABAN KOMPUTER (LJK) SISWA', canvas.width / 2, 75);

  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillText('SMP NEGERI 1 TELADAN NUSANTARA', canvas.width / 2, 100);

  ctx.font = '13px Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Mata Pelajaran: IPA | Kelas: IX-A | Penilaian Akhir Semester (PAS)', canvas.width / 2, 122);

  // Divider Line
  ctx.beginPath();
  ctx.moveTo(margin + 20, 135);
  ctx.lineTo(canvas.width - margin - 20, 135);
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Student Identity Box
  ctx.textAlign = 'left';
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(margin + 20, 150, 480, 125);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('IDENTITAS PESERTA DIDIK', margin + 35, 175);

  ctx.font = '13px Arial, sans-serif';
  ctx.fillText('NAMA SISWA  : ', margin + 35, 205);
  // Hand-written or printed student name
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillStyle = '#1E3A8A';
  ctx.fillText(studentName, margin + 145, 205);

  ctx.font = '13px Arial, sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText('KELAS / NO. : ', margin + 35, 235);
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillStyle = '#1E3A8A';
  ctx.fillText(`IX-A / No. Absen ${studentNumber}`, margin + 145, 235);

  ctx.font = '12px Arial, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Petunjuk: Hitamkan atau beri tanda silang (X) pada bulatan pilihan.', margin + 35, 260);

  // OMR BUBBLE NOMOR ABSEN
  const absenBoxX = 570;
  const absenBoxY = 150;
  const absenBoxW = 270;
  const absenBoxH = 125;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(absenBoxX, absenBoxY, absenBoxW, absenBoxH);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('NOMOR ABSEN (OMR)', absenBoxX + 15, 175);

  // Absen Digits written
  const tensDigit = parseInt(studentNumber[0] || '0', 10);
  const onesDigit = parseInt(studentNumber[1] || '7', 10);

  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText(`[ ${tensDigit} ]`, absenBoxX + 45, 200);
  ctx.fillText(`[ ${onesDigit} ]`, absenBoxX + 160, 200);

  // Draw OMR Bubbles 0-9 in two columns
  const drawAbsenRow = (startX: number, selectedDigit: number) => {
    // 0 to 4 in row 1, 5 to 9 in row 2
    for (let d = 0; d <= 9; d++) {
      const col = d < 5 ? 0 : 1;
      const row = d < 5 ? d : d - 5;
      const bx = startX + (d % 5) * 22;
      const by = 220 + Math.floor(d / 5) * 22;

      ctx.beginPath();
      ctx.arc(bx, by, 7.5, 0, Math.PI * 2);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#1E293B';
      ctx.stroke();

      ctx.font = '9px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#334155';
      ctx.fillText(String(d), bx, by + 3);

      // If selected, fill bubble with realistic black/dark marker
      if (d === selectedDigit) {
        ctx.beginPath();
        ctx.arc(bx, by, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = '#111827';
        ctx.fill();
        // subtle cross
        ctx.strokeStyle = '#F8FAFC';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(bx - 3, by - 3);
        ctx.lineTo(bx + 3, by + 3);
        ctx.moveTo(bx + 3, by - 3);
        ctx.lineTo(bx - 3, by + 3);
        ctx.stroke();
      }
    }
  };

  drawAbsenRow(absenBoxX + 25, tensDigit);
  drawAbsenRow(absenBoxX + 145, onesDigit);

  // Section Header: Pilihan Ganda
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillText('LEMBAR JAWABAN PILIHAN GANDA (40 SOAL)', margin + 20, 305);

  // Draw 4 columns of 10 questions each (1-10, 11-20, 21-30, 31-40)
  const cols = [
    { start: 1, end: 10, x: margin + 20 },
    { start: 11, end: 20, x: margin + 230 },
    { start: 21, end: 30, x: margin + 440 },
    { start: 31, end: 40, x: margin + 650 },
  ];

  // Preset answers for Budi Santoso (sample student)
  const studentFilledAnswers: Record<number, string> = {
    1: 'A', 2: 'C', 3: 'B', 4: 'D', 5: 'A',
    6: 'B', 7: 'C', 8: 'A', 9: 'D', 10: 'B',
    11: 'C', 12: 'A', 13: 'B', 14: 'D', 15: 'C',
    16: 'A', 17: 'D', 18: 'B', 19: 'C', 20: 'A',
    21: 'D', 22: 'B', 23: 'C', 24: 'A', 25: 'B',
    26: 'D', 27: 'C', 28: 'A', 29: 'B', 30: 'D',
    31: 'A', 32: 'C', 33: 'B', 34: 'D', 35: 'A',
    36: 'C', 37: 'B', 38: 'A', 39: 'D', 40: 'C',
  };

  const options = ['A', 'B', 'C', 'D'];
  const startY = 325;
  const rowHeight = 32;

  cols.forEach(col => {
    // Column frame
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(col.x, startY, 195, 335);

    for (let q = col.start; q <= col.end; q++) {
      const qRowY = startY + (q - col.start) * rowHeight + 20;

      // Question Number
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${q}.`, col.x + 28, qRowY + 4);

      // Bubbles A, B, C, D
      const chosen = studentFilledAnswers[q];
      options.forEach((opt, optIdx) => {
        const bubbleX = col.x + 55 + optIdx * 34;
        const bubbleY = qRowY;

        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, 9, 0, Math.PI * 2);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#1E293B';
        ctx.stroke();

        ctx.font = 'bold 10px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#334155';
        ctx.fillText(opt, bubbleX, bubbleY + 3.5);

        // If filled
        if (chosen === opt) {
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, 7.8, 0, Math.PI * 2);
          ctx.fillStyle = '#111827';
          ctx.fill();

          // cross mark inside filled bubble
          ctx.strokeStyle = '#F1F5F9';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(bubbleX - 4, bubbleY - 4);
          ctx.lineTo(bubbleX + 4, bubbleY + 4);
          ctx.moveTo(bubbleX + 4, bubbleY - 4);
          ctx.lineTo(bubbleX - 4, bubbleY + 4);
          ctx.stroke();
        }
      });
    }
  });

  // Section Header: Jawaban Uraian
  const essayY = 685;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillText('LEMBAR JAWABAN SOAL URAIAN (5 SOAL)', margin + 20, essayY);

  // Uraian Rows
  const essayRows = 5;
  const essayRowHeight = 96;
  for (let e = 1; e <= essayRows; e++) {
    const ey = essayY + 15 + (e - 1) * (essayRowHeight + 10);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(margin + 20, ey, canvas.width - (margin + 20) * 2, essayRowHeight);

    // Question tag
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(margin + 21, ey + 1, 90, 24);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText(`Soal No. ${e}`, margin + 30, ey + 17);

    // Score teacher box on right
    ctx.strokeRect(canvas.width - margin - 130, ey, 110, essayRowHeight);
    ctx.fillStyle = '#64748B';
    ctx.font = '10px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SKOR GURU', canvas.width - margin - 75, ey + 18);

    // Lined rules for student handwritten answer
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 0.8;
    for (let line = 1; line <= 3; line++) {
      const ly = ey + 22 + line * 20;
      ctx.beginPath();
      ctx.moveTo(margin + 35, ly);
      ctx.lineTo(canvas.width - margin - 145, ly);
      ctx.stroke();
    }

    // Simulated handwriting text
    ctx.textAlign = 'left';
    ctx.font = 'italic 12px Georgia, serif';
    ctx.fillStyle = '#1E3A8A';
    if (e === 1) {
      ctx.fillText('Pertukaran gas oksigen dan karbondioksida terjadi di alveolus melalui difusi membran kapiler.', margin + 40, ey + 40);
    } else if (e === 2) {
      ctx.fillText('Hukum Ohm: Beda potensial (V) berbanding lurus dengan arus (I) dan hambatan kawat (R).', margin + 40, ey + 40);
    } else if (e === 3) {
      ctx.fillText('Contoh simbiosis mutualisme: Bunga dengan lebah, dan kerbau dengan burung jalak.', margin + 40, ey + 40);
    } else if (e === 4) {
      ctx.fillText('Reaksi fotosintesis: 6CO2 + 6H2O + energi matahari -> C6H12O6 + 6O2.', margin + 40, ey + 40);
    } else if (e === 5) {
      ctx.fillText('Trafo step up berfungsi menaikkan tegangan AC dengan perbandingan Ns > Np.', margin + 40, ey + 40);
    }
  }

  // Footer bar
  ctx.fillStyle = '#64748B';
  ctx.font = '10px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('* Lembar Jawaban Resmi Ujian Sekolah. Jangan melipat, merobek, atau mengotori lembar jawaban ini. *', canvas.width / 2, canvas.height - margin - 10);

  return canvas.toDataURL('image/jpeg', 0.92);
}
