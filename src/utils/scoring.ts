import { Exam, OptionChoice, StudentResult } from '../types';

export function calculateGrade(
  exam: Exam,
  pgAnswers: Record<number, OptionChoice | null>,
  essayScores: Record<number, number>
): {
  correctPgCount: number;
  wrongPgCount: number;
  blankPgCount: number;
  pgScore: number;
  essayScore: number;
  totalScore: number;
  isPassed: boolean;
} {
  let correctPgCount = 0;
  let wrongPgCount = 0;
  let blankPgCount = 0;

  for (let q = 1; q <= exam.pgCount; q++) {
    const studentAns = pgAnswers[q];
    const key = exam.answerKeys[q];

    if (!studentAns || studentAns.trim() === '') {
      blankPgCount++;
    } else if (studentAns.toUpperCase() === key?.toUpperCase()) {
      correctPgCount++;
    } else {
      wrongPgCount++;
    }
  }

  // Calculate PG scaled score
  const pgAccuracy = exam.pgCount > 0 ? correctPgCount / exam.pgCount : 0;
  const pgScore = Number((pgAccuracy * exam.pgWeight).toFixed(2));

  // Calculate Essay scaled score
  let totalEssayEarned = 0;
  let totalEssayMax = 0;

  for (let e = 1; e <= exam.essayCount; e++) {
    const max = exam.essayMaxScores[e] || 10;
    const earned = Math.min(Math.max(essayScores[e] || 0, 0), max);
    totalEssayEarned += earned;
    totalEssayMax += max;
  }

  const essayAccuracy = totalEssayMax > 0 ? totalEssayEarned / totalEssayMax : 0;
  const essayScore = Number((essayAccuracy * exam.essayWeight).toFixed(2));

  const totalScore = Number((pgScore + essayScore).toFixed(1));
  const isPassed = totalScore >= exam.passingScore;

  return {
    correctPgCount,
    wrongPgCount,
    blankPgCount,
    pgScore,
    essayScore,
    totalScore,
    isPassed,
  };
}

export function getGradePredicate(score: number): { grade: 'A' | 'B' | 'C' | 'D'; label: string; color: string } {
  if (score >= 90) return { grade: 'A', label: 'Sangat Baik', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (score >= 80) return { grade: 'B', label: 'Baik', color: 'text-blue-700 bg-blue-50 border-blue-200' };
  if (score >= 70) return { grade: 'C', label: 'Cukup', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { grade: 'D', label: 'Kurang / Perlu Bimbingan', color: 'text-rose-700 bg-rose-50 border-rose-200' };
}

export function exportResultsToCsv(exam: Exam, results: StudentResult[]): void {
  const headers = [
    'No',
    'No. Absen',
    'Nama Siswa',
    'Benar PG',
    'Salah PG',
    'Kosong PG',
    `Skor PG (Bobot ${exam.pgWeight}%)`,
    `Skor Uraian (Bobot ${exam.essayWeight}%)`,
    'Nilai Akhir',
    'Predikat',
    'Status Kelulusan',
    'Tanggal Koreksi',
  ];

  const rows = results
    .sort((a, b) => parseInt(a.studentNumber || '0', 10) - parseInt(b.studentNumber || '0', 10))
    .map((res, idx) => {
      const pred = getGradePredicate(res.totalScore);
      return [
        idx + 1,
        `"${res.studentNumber}"`,
        `"${res.studentName}"`,
        res.correctPgCount,
        res.wrongPgCount,
        res.blankPgCount,
        res.pgScore,
        res.essayScore,
        res.totalScore,
        pred.grade,
        res.isPassed ? 'TUNTAS' : 'REMEDIAL',
        new Date(res.scannedAt).toLocaleDateString('id-ID'),
      ];
    });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Rekap_Nilai_${exam.subject}_${exam.gradeClass}_${exam.title.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
