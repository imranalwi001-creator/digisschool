
import React, { useMemo } from 'react';
import { Classroom } from '../types';
import { calculateFinalScore } from '../services/storageService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Legend
} from 'recharts';
import { Users, AlertTriangle, BookOpen, BarChart2, Calendar, Clock, Trophy, Target, Sparkles, TrendingUp, CheckCircle, Award } from 'lucide-react';

interface DashboardProps {
  classrooms: Classroom[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC<DashboardProps> = ({ classrooms }) => {
  
  // Date & Greeting Logic
  const currentDate = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('id-ID', dateOptions);
  
  const hour = currentDate.getHours();
  let greeting = 'Selamat Pagi';
  if (hour >= 12 && hour < 15) greeting = 'Selamat Siang';
  else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
  else if (hour >= 18) greeting = 'Selamat Malam';

  // 1. General Stats
  const stats = useMemo(() => {
    let totalStudents = 0;
    let totalScoreSum = 0;
    let belowKKM = 0;
    const KKM = 75;

    classrooms.forEach(cls => {
      totalStudents += cls.students.length;
      cls.students.forEach(s => {
        const score = calculateFinalScore(cls, s.id);
        totalScoreSum += score;
        if (score < KKM) belowKKM++;
      });
    });

    const avgScore = totalStudents > 0 ? (totalScoreSum / totalStudents).toFixed(1) : 0;

    return { totalStudents, avgScore, belowKKM };
  }, [classrooms]);

  // Exam Monitoring Stats
  const examStats = useMemo(() => {
    let activeExams = 0;
    let missingSubmissions = 0;
    let remedialNeeded = 0;

    classrooms.forEach(cls => {
        (cls.exams || []).forEach(exam => {
            if (exam.isActive) {
                activeExams++;
                missingSubmissions += (cls.students.length - exam.submissions.length);
                remedialNeeded += exam.submissions.filter(s => s.score < exam.kkm).length;
            }
        });
    });
    return { activeExams, missingSubmissions, remedialNeeded };
  }, [classrooms]);

  // 2. Data for Average Comparison (Bar Chart)
  const avgComparisonData = useMemo(() => {
    return classrooms.map(cls => {
      let clsTotal = 0;
      cls.students.forEach(s => clsTotal += calculateFinalScore(cls, s.id));
      const avg = cls.students.length > 0 ? clsTotal / cls.students.length : 0;
      return {
        name: cls.name,
        Rata2: parseFloat(avg.toFixed(1)),
        students: cls.students.length
      };
    });
  }, [classrooms]);

  // 3. Data for Quality Distribution (Stacked Bar Chart)
  const qualityDistributionData = useMemo(() => {
    return classrooms.map(cls => {
      let remedial = 0; // < 75
      let good = 0;     // 75 - 89
      let excellent = 0; // >= 90

      cls.students.forEach(s => {
        const score = calculateFinalScore(cls, s.id);
        if (score < 75) remedial++;
        else if (score < 90) good++;
        else excellent++;
      });

      return {
        name: cls.name,
        Remedial: remedial,
        Baik: good,
        SangatBaik: excellent
      };
    });
  }, [classrooms]);

  // 4. Data for Overall Grade Distribution (Pie Chart)
  const overallDistributionData = useMemo(() => {
    let remedial = 0;
    let good = 0;
    let excellent = 0;

    classrooms.forEach(cls => {
      cls.students.forEach(s => {
        const score = calculateFinalScore(cls, s.id);
        if (score < 75) remedial++;
        else if (score < 90) good++;
        else excellent++;
      });
    });

    return [
      { name: 'Remedial (<75)', value: remedial, color: '#ef4444' },
      { name: 'Lulus (75-89)', value: good, color: '#f59e0b' },
      { name: 'Sangat Baik (≥90)', value: excellent, color: '#10b981' }
    ].filter(d => d.value > 0);
  }, [classrooms]);

  // 5. Data for Radar Chart (Category Comparison)
  const radarData = useMemo(() => {
    const categories = ['PH', 'PTS', 'PAS', 'Tugas', 'Sikap', 'Keterampilan'];
    
    return categories.map(cat => {
      const dataPoint: any = { subject: cat };
      classrooms.forEach(cls => {
        let total = 0;
        let count = 0;
        const assessments = cls.assessments.filter(a => a.type === cat);
        if (assessments.length > 0) {
           assessments.forEach(ass => {
               const grades = cls.grades.filter(g => g.assessmentId === ass.id);
               grades.forEach(g => {
                   total += g.score;
                   count++;
               });
           });
           dataPoint[cls.name] = count > 0 ? Math.round(total / count) : 0;
        } else {
           dataPoint[cls.name] = 0;
        }
      });
      return dataPoint;
    });
  }, [classrooms]);

  return (
    <div className="min-h-full pb-10">
      
      <div className="space-y-8 animate-in fade-in duration-500">
      
        {/* Modern Clean Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-indigo-600 shadow-xl shadow-indigo-200">
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/30 rounded-full blur-2xl -ml-10 -mb-10"></div>
            
            <div className="relative p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10">
                <div className="text-white">
                    <p className="text-indigo-200 font-medium mb-1 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Calendar size={14} /> {formattedDate}
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                        {greeting}, Admin 👋
                    </h1>
                    <p className="text-indigo-100 text-lg font-light opacity-90 max-w-xl">
                        Selamat datang kembali di dashboard Digisschool. Berikut adalah ringkasan aktivitas sekolah hari ini.
                    </p>
                </div>
                
                <div className="hidden md:block">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-white text-right">
                        <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider mb-1">Server Time</p>
                        <div className="text-3xl font-mono font-bold flex items-center gap-3">
                            <Clock size={24} className="text-indigo-300" />
                            {currentDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Clean Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Students */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Users size={24} />
               </div>
               <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp size={12} /> +5%
               </span>
            </div>
            <div>
                <h3 className="text-3xl font-extrabold text-slate-800 mb-1">{stats.totalStudents}</h3>
                <p className="text-slate-500 text-sm font-medium">Total Siswa Aktif</p>
            </div>
          </div>

          {/* Card 2: Avg Score */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Trophy size={24} />
               </div>
            </div>
            <div>
                <h3 className="text-3xl font-extrabold text-slate-800 mb-1">{stats.avgScore}</h3>
                <p className="text-slate-500 text-sm font-medium">Rata-rata Nilai Sekolah</p>
            </div>
            <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
               <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, parseFloat(stats.avgScore as string))}%` }}></div>
            </div>
          </div>

          {/* Card 3: Remedial */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                  <AlertTriangle size={24} />
               </div>
                {stats.belowKKM > 0 && (
                   <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full animate-pulse">
                      Action Needed
                   </span>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-extrabold text-slate-800 mb-1">{stats.belowKKM}</h3>
                <p className="text-slate-500 text-sm font-medium">Siswa Perlu Remedial</p>
            </div>
          </div>

          {/* Card 4: Exams */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <BookOpen size={24} />
               </div>
               <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full text-xs font-bold">
                   Online
               </span>
            </div>
            <div>
                <h3 className="text-3xl font-extrabold text-slate-800 mb-1">{examStats.activeExams}</h3>
                <p className="text-slate-500 text-sm font-medium">Ujian / CBT Aktif</p>
            </div>
          </div>
        </div>
        
        {/* Charts Grid - Cleaner Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* Chart 1: Average Comparison */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <div className="mb-8 flex justify-between items-center">
                      <div>
                          <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                              <BarChart2 className="text-indigo-500" size={20}/> Performa Akademik
                          </h4>
                          <p className="text-sm text-slate-500 mt-1">Komparasi rata-rata nilai akhir antar kelas</p>
                      </div>
                  </div>
                  <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={avgComparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                              <Tooltip 
                                  cursor={{fill: '#f8fafc'}}
                                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                              />
                              <Bar dataKey="Rata2" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={48} name="Nilai Rata-rata">
                                  {avgComparisonData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              {/* Chart 2: Overall Grade Distribution */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <div className="mb-8 flex justify-between items-center">
                      <div>
                          <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                              <Target className="text-emerald-500" size={20}/> Distribusi Kelulusan
                          </h4>
                          <p className="text-sm text-slate-500 mt-1">Persentase status kelulusan seluruh siswa</p>
                      </div>
                  </div>
                  <div className="h-80 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={overallDistributionData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={80}
                                  outerRadius={120}
                                  paddingAngle={5}
                                  dataKey="value"
                                  cornerRadius={10}
                              >
                                  {overallDistributionData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                  ))}
                              </Pie>
                              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                              <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{fontSize: '13px', color: '#64748b', fontWeight: 500}}/>
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              {/* Chart 3: Quality Distribution per Class */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <div className="mb-8">
                      <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <CheckCircle className="text-blue-500" size={20} /> Kualitas per Kelas
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">Komposisi siswa Remedial vs Lulus vs Unggul</p>
                  </div>
                  <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={qualityDistributionData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }} barGap={8}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} width={70} />
                              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                              <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', color: '#64748b'}}/>
                              <Bar dataKey="SangatBaik" name="Sangat Baik (>90)" stackId="a" fill="#10b981" radius={[0, 6, 6, 0]} barSize={24} />
                              <Bar dataKey="Baik" name="Lulus (75-90)" stackId="a" fill="#f59e0b" />
                              <Bar dataKey="Remedial" name="Remedial (<75)" stackId="a" fill="#ef4444" radius={[6, 0, 0, 6]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              {/* Chart 4: Radar Chart */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <div className="mb-8">
                      <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Award className="text-purple-500" size={20} /> Peta Kompetensi
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">Kekuatan rata-rata siswa per mata pelajaran</p>
                  </div>
                  <div className="h-80 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                              <PolarGrid stroke="#e2e8f0" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              
                              {classrooms.map((cls, index) => (
                                  <Radar
                                      key={cls.id}
                                      name={cls.name}
                                      dataKey={cls.name}
                                      stroke={COLORS[index % COLORS.length]}
                                      strokeWidth={3}
                                      fill={COLORS[index % COLORS.length]}
                                      fillOpacity={0.1}
                                  />
                              ))}
                              
                              <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px', color: '#64748b'}}/>
                              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}/>
                          </RadarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
