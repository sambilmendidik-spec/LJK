import React, { useState } from 'react';
import { Exam, OptionChoice } from '../types';
import { X, Check, KeyRound, Sparkles, Shuffle, Copy, ClipboardPaste } from 'lucide-react';

interface AnswerKeyModalProps {
  exam: Exam;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedExam: Exam) => void;
}

export const AnswerKeyModal: React.FC<AnswerKeyModalProps> = ({
  exam,
  isOpen,
  onClose,
  onSave,
}) => {
  const [keys, setKeys] = useState<Record<number, OptionChoice>>({ ...exam.answerKeys });
  const [essayScores, setEssayScores] = useState<Record<number, number>>({ ...exam.essayMaxScores });
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);

  if (!isOpen) return null;

  const options: OptionChoice[] = exam.optionCount === 5 ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];

  const handleSelectOption = (questionNum: number, choice: OptionChoice) => {
    setKeys(prev => ({
      ...prev,
      [questionNum]: choice,
    }));
  };

  const handleEssayScoreChange = (essayNum: number, value: number) => {
    setEssayScores(prev => ({
      ...prev,
      [essayNum]: Math.max(1, value),
    }));
  };

  const handleRandomize = () => {
    const newKeys: Record<number, OptionChoice> = {};
    for (let i = 1; i <= exam.pgCount; i++) {
      const randIdx = Math.floor(Math.random() * options.length);
      newKeys[i] = options[randIdx];
    }
    setKeys(newKeys);
  };

  const handleCopyKeys = () => {
    const text = Array.from({ length: exam.pgCount }, (_, i) => `${i + 1}:${keys[i + 1] || 'A'}`).join(', ');
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleApplyPaste = () => {
    if (!pasteText.trim()) return;
    const cleanStr = pasteText.replace(/[^A-Ea-e]/g, '').toUpperCase();
    const newKeys: Record<number, OptionChoice> = { ...keys };
    for (let i = 0; i < cleanStr.length && i < exam.pgCount; i++) {
      const char = cleanStr[i] as OptionChoice;
      if (options.includes(char)) {
        newKeys[i + 1] = char;
      }
    }
    setKeys(newKeys);
    setShowPasteBox(false);
    setPasteText('');
  };

  const handleSaveAll = () => {
    onSave({
      ...exam,
      answerKeys: keys,
      essayMaxScores: essayScores,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Atur Kunci Jawaban & Bobot</h3>
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

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700">
            Pilihan Ganda: {exam.pgCount} Soal (Opsi: {options.join(', ')})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPasteBox(!showPasteBox)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              Tempel Kunci
            </button>
            <button
              onClick={handleCopyKeys}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedNotification ? 'Tersalin!' : 'Salin Kunci'}
            </button>
            <button
              onClick={handleRandomize}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Acak Kunci
            </button>
          </div>
        </div>

        {/* Paste Box Drawer */}
        {showPasteBox && (
          <div className="px-6 py-3 bg-indigo-50/70 border-b border-indigo-100 flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              placeholder="Ketik atau tempel deretan jawaban (contoh: ABCDEABCDA...)"
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              className="w-full sm:flex-1 px-3 py-2 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono tracking-wider"
            />
            <button
              onClick={handleApplyPaste}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg whitespace-nowrap"
            >
              Terapkan Kunci
            </button>
          </div>
        )}

        {/* Modal Body - Matrix Grid */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Multiple Choice Grid */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span>Kunci Jawaban Pilihan Ganda</span>
              <span className="text-xs font-normal text-slate-500">
                (Klik huruf untuk mengubah kunci jawaban)
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: Math.ceil(exam.pgCount / 10) }, (_, colIdx) => {
                const start = colIdx * 10 + 1;
                const end = Math.min(start + 9, exam.pgCount);
                return (
                  <div key={colIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="text-[11px] font-bold text-slate-600 border-b border-slate-200 pb-1 uppercase tracking-wider text-center">
                      Nomor {start} - {end}
                    </div>
                    {Array.from({ length: end - start + 1 }, (_, rowIdx) => {
                      const qNum = start + rowIdx;
                      const selected = keys[qNum] || 'A';
                      return (
                        <div key={qNum} className="flex items-center justify-between gap-1 py-1 px-2 rounded-lg hover:bg-white transition-colors">
                          <span className="text-xs font-bold text-slate-700 w-7 text-right">
                            {qNum}.
                          </span>
                          <div className="flex items-center gap-1">
                            {options.map(opt => {
                              const isKey = selected === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => handleSelectOption(qNum, opt)}
                                  className={`w-6 h-6 rounded-md text-xs font-bold transition-all ${
                                    isKey
                                      ? 'bg-indigo-600 text-white shadow-xs scale-105'
                                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                                  }`}
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
                );
              })}
            </div>
          </div>

          {/* Section 2: Essay Configuration */}
          {exam.essayCount > 0 && (
            <div className="border-t border-slate-200 pt-5">
              <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span>Bobot Skor Maksimal Soal Uraian ({exam.essayCount} Soal)</span>
                <span className="text-xs font-normal text-slate-500">
                  (Skor maksimal yang dapat diperoleh siswa per nomor)
                </span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Array.from({ length: exam.essayCount }, (_, idx) => {
                  const essayNum = idx + 1;
                  const currentMax = essayScores[essayNum] || 6;
                  return (
                    <div key={essayNum} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Soal Uraian #{essayNum}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={currentMax}
                          onChange={e => handleEssayScoreChange(essayNum, parseInt(e.target.value, 10) || 1)}
                          className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                        <span className="text-xs text-slate-500">Poin</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Semua perubahan akan langsung diterapkan pada koreksi pemindaian otomatis.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSaveAll}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              Simpan Kunci Jawaban
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
