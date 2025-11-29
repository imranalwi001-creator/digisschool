
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClassManager from './components/ClassManager';
import Gradebook from './components/Gradebook';
import ReportGenerator from './components/ReportGenerator';
import Attendance from './components/Attendance';
import TeachingJournal from './components/TeachingJournal';
import QuestionBank from './components/QuestionBank';
import StudentExam from './components/StudentExam';
import AssignmentManager from './components/AssignmentManager';
import StudentAssignment from './components/StudentAssignment';
import QuestionnaireManager from './components/QuestionnaireManager';
import StudentQuestionnaire from './components/StudentQuestionnaire';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import ForumPage from './components/ForumPage';
import ForumManager from './components/ForumManager';
import SchoolSettings from './components/SchoolSettings';
import DataManager from './components/DataManager'; // New Import
import { Classroom, ExamSubmission, Assignment, StudentQuestionnaireResponse, SchoolProfile } from './types';
import { loadClassrooms, saveClassrooms, loadSchoolProfile, saveSchoolProfile } from './services/storageService';
import { Menu } from 'lucide-react';
import { ToastProvider } from './components/Toast';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  
  // Navigation States
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showForum, setShowForum] = useState(false);

  // Student Modes
  const [examMode, setExamMode] = useState<{ active: boolean, examId: string, classroomId: string }>({ 
      active: false, examId: '', classroomId: '' 
  });
  const [assignmentMode, setAssignmentMode] = useState<{ active: boolean, assignmentId: string, classroomId: string }>({
      active: false, assignmentId: '', classroomId: ''
  });
  const [questionnaireMode, setQuestionnaireMode] = useState<{ active: boolean, questionnaireId: string, classroomId: string }>({
      active: false, questionnaireId: '', classroomId: ''
  });

  // Load data and auth status on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('digisschool_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoadingAuth(false);
    const data = loadClassrooms();
    setClassrooms(data);
    const profile = loadSchoolProfile();
    setSchoolProfile(profile);
  }, []);

  const handleUpdateClassrooms = (updated: Classroom[]) => {
    setClassrooms(updated);
    saveClassrooms(updated);
  };

  const handleUpdateSchoolProfile = (updated: SchoolProfile) => {
      setSchoolProfile(updated);
      saveSchoolProfile(updated);
  };

  const handleLoginSuccess = (status: boolean) => {
    if (status) {
      setIsAuthenticated(true);
      localStorage.setItem('digisschool_auth', 'true');
      setShowLoginForm(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('digisschool_auth');
    setActiveTab('dashboard');
    setShowLoginForm(false);
  };

  // Student Sim Handlers
  const handleStartExamSim = (examId: string, classroomId: string) => setExamMode({ active: true, examId, classroomId });
  
  const handleSubmitExam = (classroomId: string, submission: ExamSubmission) => {
    const updatedClasses = classrooms.map(c => {
        if (c.id === classroomId) {
            const currentExams = c.exams || [];
            return {
                ...c,
                exams: currentExams.map(e => e.id === submission.examId ? { ...e, submissions: [...e.submissions, submission] } : e)
            };
        }
        return c;
    });
    handleUpdateClassrooms(updatedClasses);
  };

  const handleStartAssignmentSim = (assignmentId: string, classroomId: string) => setAssignmentMode({ active: true, assignmentId, classroomId });

  const handleSubmitAssignment = (classroomId: string, updatedAssignment: Assignment) => {
      const updatedClasses = classrooms.map(c => {
          if (c.id === classroomId) {
              return { ...c, assignments: (c.assignments || []).map(a => a.id === updatedAssignment.id ? updatedAssignment : a) };
          }
          return c;
      });
      handleUpdateClassrooms(updatedClasses);
  };

  const handleStartQuestionnaireSim = (questionnaireId: string, classroomId: string) => setQuestionnaireMode({ active: true, questionnaireId, classroomId });

  const handleSubmitQuestionnaire = (classroomId: string, response: StudentQuestionnaireResponse) => {
      const updatedClasses = classrooms.map(c => {
          if (c.id === classroomId) {
              const currentQuizzes = c.questionnaires || [];
              return {
                  ...c,
                  questionnaires: currentQuizzes.map(q => q.id === response.questionnaireId ? { ...q, responses: [...q.responses, response] } : q)
              };
          }
          return c;
      });
      handleUpdateClassrooms(updatedClasses);
  };

  const handleStudentAccess = (type: 'exam' | 'assignment' | 'questionnaire', id: string, nis: string) => {
      let found = false;
      for (const cls of classrooms) {
          const student = cls.students.find(s => s.nis === nis);
          if (student) {
              if (type === 'exam') {
                  const exam = cls.exams?.find(e => e.id === id);
                  if (exam) { setExamMode({ active: true, examId: id, classroomId: cls.id }); found = true; break; }
              } else if (type === 'assignment') {
                  const assign = cls.assignments?.find(a => a.id === id);
                  if (assign) { setAssignmentMode({ active: true, assignmentId: id, classroomId: cls.id }); found = true; break; }
              } else if (type === 'questionnaire') {
                  const quiz = cls.questionnaires?.find(q => q.id === id);
                  if (quiz) { setQuestionnaireMode({ active: true, questionnaireId: id, classroomId: cls.id }); found = true; break; }
              }
          }
      }
      if (!found) alert("Kode atau NIS tidak valid.");
  };

  if (isLoadingAuth) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  if (showForum) return <ForumPage onBack={() => setShowForum(false)} />;

  if (examMode.active) return <StudentExam examId={examMode.examId} classroomId={examMode.classroomId} classrooms={classrooms} onSubmit={handleSubmitExam} onExit={() => setExamMode({ active: false, examId: '', classroomId: '' })} />;

  if (assignmentMode.active) return <StudentAssignment assignmentId={assignmentMode.assignmentId} classroomId={assignmentMode.classroomId} classrooms={classrooms} onSubmit={handleSubmitAssignment} onExit={() => setAssignmentMode({ active: false, assignmentId: '', classroomId: '' })} />;

  if (questionnaireMode.active) return <StudentQuestionnaire questionnaireId={questionnaireMode.questionnaireId} classroomId={questionnaireMode.classroomId} classrooms={classrooms} onSubmit={handleSubmitQuestionnaire} onExit={() => setQuestionnaireMode({ active: false, questionnaireId: '', classroomId: '' })} />;

  if (!isAuthenticated) {
     if (showLoginForm) return <Login onLogin={handleLoginSuccess} onBack={() => setShowLoginForm(false)} />;
     return <LandingPage onLoginClick={() => setShowLoginForm(true)} onNavigateToForum={() => setShowForum(true)} onStudentAccess={handleStudentAccess} />; 
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard classrooms={classrooms} />;
      case 'classes': return <ClassManager classrooms={classrooms} onUpdateClassrooms={handleUpdateClassrooms} />;
      case 'gradebook': return <Gradebook classrooms={classrooms} onUpdateClassrooms={handleUpdateClassrooms} />;
      case 'attendance': return <Attendance classrooms={classrooms} onUpdateClassrooms={handleUpdateClassrooms} />;
      case 'journal': return <TeachingJournal classrooms={classrooms} onUpdateClassrooms={handleUpdateClassrooms} />;
      case 'assignments': return <AssignmentManager classrooms={classrooms} onUpdateClassrooms={handleUpdateClassrooms} onNavigateToStudentPortal={handleStartAssignmentSim} />;
      case 'question_bank': return <QuestionBank classrooms={classrooms} onUpdateClassrooms={handleUpdateClassrooms} onNavigateToExam={handleStartExamSim} />;
      case 'questionnaire': return <QuestionnaireManager classrooms={classrooms} onUpdateClassrooms={handleUpdateClassrooms} onNavigateToStudentPortal={handleStartQuestionnaireSim} />;
      case 'forum_admin': return <ForumManager />;
      case 'reports': return <ReportGenerator classrooms={classrooms} />;
      case 'school_settings': return schoolProfile ? <SchoolSettings profile={schoolProfile} onSave={handleUpdateSchoolProfile} /> : null;
      case 'data_manager': return <DataManager />; // Render Data Manager
      default: return <Dashboard classrooms={classrooms} />;
    }
  };

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isOpen={isSidebarOpen} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          onLogout={handleLogout}
          schoolLogo={schoolProfile?.logoUrl}
        />
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center gap-3 shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
            <span className="font-bold text-lg text-slate-800">Digisschool</span>
          </div>
          <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth"><div className="max-w-7xl mx-auto h-full">{renderContent()}</div></div>
        </main>
      </div>
    </ToastProvider>
  );
};

export default App;
