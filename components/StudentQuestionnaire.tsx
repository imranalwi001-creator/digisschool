
import React, { useState } from 'react';
import { Classroom, Questionnaire, StudentQuestionnaireResponse } from '../types';
import { User, ArrowRight, CheckCircle, BrainCircuit, ArrowLeft, BookOpen, Lightbulb } from 'lucide-react';

interface StudentQuestionnaireProps {
  questionnaireId: string;
  classroomId: string;
  classrooms: Classroom[];
  onSubmit: (classroomId: string, response: StudentQuestionnaireResponse) => void;
  onExit: () => void;
}

const StudentQuestionnaire: React.FC<StudentQuestionnaireProps> = ({ questionnaireId, classroomId, classrooms, onSubmit, onExit }) => {
  const [nis, setNis] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState('');
  
  // Quiz State
  const [answers, setAnswers] = useState<Record<string, number>>({}); // questionId -> optionIndex
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [calculatedResult, setCalculatedResult] = useState<string | null>(null);

  const classroom = classrooms.find(c => c.id === classroomId);
  const questionnaire = classroom?.questionnaires?.find(q => q.id === questionnaireId);

  // Check if already taken
  const existingResponse = questionnaire?.responses.find(r => r.studentId === currentStudentId);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroom) return;
    
    const student = classroom.students.find(s => s.nis === nis);
    if (student) {
        setCurrentStudentId(student.id);
        setIsLoggedIn(true);
    } else {
        alert("NIS tidak ditemukan.");
    }
  };

  const handleOptionSelect = (qId: string, optionIndex: number) => {
      setAnswers(prev => ({ ...prev, [qId]: optionIndex }));
  };

  const calculateResult = () => {
      if (!questionnaire) return;

      const tally: Record<string, number> = {};

      questionnaire.questions.forEach(q => {
          const selectedIdx = answers[q.id];
          if (selectedIdx !== undefined) {
              const type = q.options[selectedIdx].pointsToType;
              if (type) {
                  tally[type] = (tally[type] || 0) + 1;
              }
          }
      });

      // Find winner
      let winner = '';
      let maxCount = -1;
      Object.entries(tally).forEach(([type, count]) => {
          if (count > maxCount) {
              maxCount = count;
              winner = type;
          }
      });

      setCalculatedResult(winner);
      setIsCompleted(true);

      const response: StudentQuestionnaireResponse = {
          studentId: currentStudentId,
          questionnaireId: questionnaire.id,
          answers: Object.entries(answers).map(([qid, idx]) => ({ questionId: qid, selectedOptionIndex: idx as number })),
          resultType: winner,
          submittedAt: new Date().toISOString()
      };

      // Only submit if not just viewing past result
      if (!existingResponse) {
          onSubmit(classroomId, response);
      }
  };

  // If already logged in and has existing response, show result immediately
  if (isLoggedIn && existingResponse && !isCompleted) {
      setCalculatedResult(existingResponse.resultType);
      setIsCompleted(true);
  }

  if (!questionnaire || !classroom) return <div className="p-8 text-center text-red-500">Kuesioner tidak ditemukan.</div>;

  const resultDetails = questionnaire.resultsDefinition.find(r => r.typeKey === calculatedResult);
  const studentName = classroom.students.find(s => s.id === currentStudentId)?.name;

  if (!isLoggedIn) {
      return (
        <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                        <BrainCircuit size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Kenali Dirimu</h1>
                    <p className="text-slate-500 mt-2">Masuk untuk memulai kuesioner.</p>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
                    <h3 className="font-bold text-indigo-900">{questionnaire.title}</h3>
                    <p className="text-sm text-indigo-700 mt-1">{questionnaire.description}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Masukkan NIS</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-400" size={20}/>
                            <input 
                                type="text" 
                                className="w-full pl-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Contoh: 7001"
                                value={nis}
                                onChange={e => setNis(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                        Mulai <ArrowRight size={18} />
                    </button>
                </form>
                <button onClick={onExit} className="w-full mt-4 text-sm text-slate-400 hover:text-slate-600">Batal / Kembali</button>
            </div>
        </div>
      );
  }

  if (isCompleted && resultDetails) {
      return (
          <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center">
              <div className="max-w-3xl w-full">
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
                          <h2 className="text-3xl font-bold mb-2">Hasil Analisis Kamu</h2>
                          <p className="opacity-90">Halo, {studentName}!</p>
                      </div>
                      
                      <div className="p-8">
                          <div className="text-center mb-8">
                              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tipe Dominan Kamu Adalah</span>
                              <h3 className="text-4xl font-extrabold text-indigo-600 mt-2">{resultDetails.title}</h3>
                          </div>

                          <div className="prose max-w-none text-slate-600 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
                              <p className="text-lg leading-relaxed">{resultDetails.description}</p>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6 mb-8">
                              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                      <CheckCircle className="text-emerald-500" size={20} /> Karakteristik
                                  </h4>
                                  <ul className="space-y-2">
                                      {resultDetails.characteristics.map((char, i) => (
                                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0"></span>
                                              {char}
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                      <Lightbulb className="text-amber-500" size={20} /> Saran Belajar
                                  </h4>
                                  <ul className="space-y-2">
                                      {resultDetails.learningTips.map((tip, i) => (
                                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0"></span>
                                              {tip}
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                          </div>

                          <div className="text-center">
                              <button onClick={onExit} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                                  Kembali ke Halaman Utama
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  const currentQ = questionnaire.questions[currentStep];
  const totalSteps = questionnaire.questions.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4">
         <div className="w-full max-w-2xl mt-8">
             {/* Progress Bar */}
             <div className="mb-6">
                 <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                     <span>Pertanyaan {currentStep + 1} dari {totalSteps}</span>
                     <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
                 </div>
                 <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}></div>
                 </div>
             </div>

             <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 min-h-[400px] flex flex-col">
                 <h2 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">
                     {currentQ.text}
                 </h2>

                 <div className="space-y-4 flex-1">
                     {currentQ.options.map((opt, idx) => (
                         <button
                             key={idx}
                             onClick={() => handleOptionSelect(currentQ.id, idx)}
                             className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                                 answers[currentQ.id] === idx 
                                 ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-sm' 
                                 : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-600'
                             }`}
                         >
                             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                 answers[currentQ.id] === idx ? 'border-indigo-600' : 'border-slate-300'
                             }`}>
                                 {answers[currentQ.id] === idx && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                             </div>
                             {opt.text}
                         </button>
                     ))}
                 </div>

                 <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                     <button 
                        disabled={currentStep === 0}
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 font-medium"
                     >
                         <ArrowLeft size={18} /> Sebelumnya
                     </button>
                     
                     <button 
                        disabled={answers[currentQ.id] === undefined}
                        onClick={() => {
                            if (currentStep < totalSteps - 1) {
                                setCurrentStep(prev => prev + 1);
                            } else {
                                calculateResult();
                            }
                        }}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
                     >
                         {currentStep === totalSteps - 1 ? 'Lihat Hasil' : 'Selanjutnya'}
                     </button>
                 </div>
             </div>
         </div>
    </div>
  );
};

export default StudentQuestionnaire;
