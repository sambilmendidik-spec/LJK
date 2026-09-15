import React, { useState, useEffect } from 'react';
import { Exam, StudentResult, ActiveTab, ScanDetectionResult } from './types';
import { INITIAL_EXAMS, INITIAL_RESULTS } from './data/sampleData';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ExamManagerView } from './components/ExamManagerView';
import { PrintLJKView } from './components/PrintLJKView';
import { ScannerView } from './components/ScannerView';
import { ResultsAnalyticsView } from './components/ResultsAnalyticsView';
import { AnswerKeyModal } from './components/AnswerKeyModal';
import { GradingReviewModal } from './components/GradingReviewModal';

const EXAMS_STORAGE_KEY = 'ljk_exams_v1';
const RESULTS_STORAGE_KEY = 'ljk_results_v1';

export default function App() {
  // Load initial exams from storage or sample data
  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem(EXAMS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load exams from localStorage', e);
    }
    return INITIAL_EXAMS;
  });

  // Load initial student results from storage or sample data
  const [results, setResults] = useState<StudentResult[]>(() => {
    try {
      const saved = localStorage.getItem(RESULTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load results from localStorage', e);
    }
    return INITIAL_RESULTS;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Currently selected exam ID for scanning, printing, results
  const [selectedExamId, setSelectedExamId] = useState<string>(() => {
    return exams[0]?.id || 'exam-pas-ipa-9';
  });

  // Modals state
  const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState(false);
  const [answerKeyExam, setAnswerKeyExam] = useState<Exam | null>(null);

  // Scan & Grading Review Modal State
  const [isGradingReviewOpen, setIsGradingReviewOpen] = useState(false);
  const [currentScanResult, setCurrentScanResult] = useState<ScanDetectionResult | null>(null);
  const [currentScanImageSrc, setCurrentScanImageSrc] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
    } catch (e) {
      console.error('Failed to save exams', e);
    }
  }, [exams]);

  useEffect(() => {
    try {
      localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results));
    } catch (e) {
      console.error('Failed to save results', e);
    }
  }, [results]);

  // Exam handlers
  const handleAddExam = (newExam: Exam) => {
    setExams(prev => [newExam, ...prev]);
    setSelectedExamId(newExam.id);
  };

  const handleUpdateExam = (updatedExam: Exam) => {
    setExams(prev => prev.map(e => (e.id === updatedExam.id ? updatedExam : e)));
  };

  const handleDeleteExam = (examId: string) => {
    setExams(prev => prev.filter(e => e.id !== examId));
    setResults(prev => prev.filter(r => r.examId !== examId));
    if (selectedExamId === examId && exams.length > 1) {
      const remaining = exams.filter(e => e.id !== examId);
      setSelectedExamId(remaining[0]?.id || '');
    }
  };

  // Result handlers
  const handleSaveResult = (newResult: StudentResult) => {
    setResults(prev => {
      // Check if student with same exam and studentNumber already exists
      const existingIdx = prev.findIndex(
        r => r.examId === newResult.examId && r.studentNumber === newResult.studentNumber
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newResult;
        return updated;
      }
      return [newResult, ...prev];
    });

    // Switch to results tab so teacher sees the newly saved score
    setSelectedExamId(newResult.examId);
  };

  const handleDeleteResult = (resultId: string) => {
    setResults(prev => prev.filter(r => r.id !== resultId));
  };

  // Scanner callback when image is analyzed by server AI / OMR
  const handleScanComplete = (scanResult: ScanDetectionResult, imageSrc: string) => {
    setCurrentScanResult(scanResult);
    setCurrentScanImageSrc(imageSrc);
    setIsGradingReviewOpen(true);
  };

  // Open detail / edit existing result
  const handleOpenGradingDetail = (result: StudentResult) => {
    setCurrentScanResult({
      studentNumber: result.studentNumber,
      studentName: result.studentName,
      confidence: 0.98,
      answers: result.pgAnswers,
      essayAnswers: Object.entries(result.essayAnswers || {}).map(([num, text]) => ({
        essayNumber: parseInt(num, 10),
        extractedText: text,
        isAnswered: true,
      })),
      source: 'omr-engine',
      notes: result.teacherNotes,
    });
    setCurrentScanImageSrc(result.scanImageUrl || null);
    setIsGradingReviewOpen(true);
  };

  const currentSelectedExam = exams.find(e => e.id === selectedExamId) || exams[0];

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        examCount={exams.length}
        scannedCount={results.length}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardView
            exams={exams}
            results={results}
            setActiveTab={setActiveTab}
            setSelectedExamId={setSelectedExamId}
            openCreateExamModal={() => {
              setActiveTab('exams');
              setIsCreateExamModalOpen(true);
            }}
            openAnswerKeyModal={exam => setAnswerKeyExam(exam)}
          />
        )}

        {activeTab === 'exams' && (
          <ExamManagerView
            exams={exams}
            onAddExam={handleAddExam}
            onUpdateExam={handleUpdateExam}
            onDeleteExam={handleDeleteExam}
            onOpenAnswerKey={exam => setAnswerKeyExam(exam)}
            onSelectExamForScan={examId => {
              setSelectedExamId(examId);
              setActiveTab('scan');
            }}
            onSelectExamForPrint={examId => {
              setSelectedExamId(examId);
              setActiveTab('print');
            }}
            setActiveTab={setActiveTab}
            isCreateModalOpen={isCreateExamModalOpen}
            setIsCreateModalOpen={setIsCreateExamModalOpen}
          />
        )}

        {activeTab === 'print' && (
          <PrintLJKView
            exams={exams}
            selectedExamId={selectedExamId}
            onSelectExam={setSelectedExamId}
          />
        )}

        {activeTab === 'scan' && (
          <ScannerView
            exams={exams}
            selectedExamId={selectedExamId}
            onSelectExam={setSelectedExamId}
            onScanComplete={handleScanComplete}
          />
        )}

        {activeTab === 'results' && (
          <ResultsAnalyticsView
            exams={exams}
            results={results}
            selectedExamId={selectedExamId}
            onSelectExam={setSelectedExamId}
            onDeleteResult={handleDeleteResult}
            onOpenGradingDetail={handleOpenGradingDetail}
          />
        )}
      </main>

      {/* Answer Key Modal */}
      {answerKeyExam && (
        <AnswerKeyModal
          exam={answerKeyExam}
          isOpen={!!answerKeyExam}
          onClose={() => setAnswerKeyExam(null)}
          onSave={handleUpdateExam}
        />
      )}

      {/* Grading & Verification Modal (After Scan or Detail Click) */}
      {isGradingReviewOpen && currentSelectedExam && currentScanResult && (
        <GradingReviewModal
          isOpen={isGradingReviewOpen}
          onClose={() => setIsGradingReviewOpen(false)}
          exam={currentSelectedExam}
          scanResult={currentScanResult}
          scannedImageSrc={currentScanImageSrc}
          onSaveResult={handleSaveResult}
        />
      )}
    </div>
  );
}
