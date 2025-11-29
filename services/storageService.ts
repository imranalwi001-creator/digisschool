
import { Classroom, Student, Assessment, Grade, ClassWeight, AttendanceRecord, JournalEntry, Exam, Assignment, ForumTopic, ForumReply, Questionnaire, SchoolProfile } from '../types';

const STORAGE_KEY = 'digisschool_data_v1';
const FORUM_KEY = 'digisschool_forum_v1';
const SCHOOL_PROFILE_KEY = 'digisschool_profile_v1';

const defaultWeights: ClassWeight = {
  PH: 20,
  PTS: 20,
  PAS: 25,
  Tugas: 15,
  Sikap: 10,
  Keterampilan: 10,
};

const defaultSchoolProfile: SchoolProfile = {
  name: 'DIGISS BOARDING SCHOOL',
  address: 'Jl. Pendidikan No. 123, Jakarta Selatan',
  email: 'info@digisschool.sch.id',
  website: 'www.digisschool.sch.id',
  headmaster: 'Dr. H. Ahmad Fauzi, M.Pd',
  headmasterNip: '19700505 199503 1 002'
};

// Dummy Exam Data
const dummyExam: Exam = {
  id: 'ex1',
  title: 'Ujian Harian: Bilangan Bulat',
  type: 'PH',
  durationMinutes: 60,
  isActive: true,
  kkm: 75,
  dateCreated: '2023-08-01',
  questions: [
    {
      id: 'q1',
      text: 'Hasil dari -12 + 7 adalah...',
      type: 'multiple_choice',
      options: ['-5', '5', '-19', '19'],
      correctOptionIndex: 0,
      points: 20
    },
    {
      id: 'q2',
      text: 'Manakah yang merupakan bilangan prima?',
      type: 'multiple_choice',
      options: ['9', '15', '17', '21'],
      correctOptionIndex: 2,
      points: 20
    },
    {
        id: 'q3',
        text: 'Jelaskan pengertian bilangan bulat positif dan berikan 3 contohnya dalam kehidupan sehari-hari!',
        type: 'essay',
        points: 60,
        rubric: '20 poin pengertian, 40 poin contoh (masing-masing contoh 13 poin).'
    }
  ],
  submissions: []
};

// Dummy Assignment Data
const dummyAssignment: Assignment = {
    id: 'as1',
    title: 'Proyek Video: Bilangan di Sekitar Kita',
    description: 'Buatlah video pendek (durasi 1-3 menit) yang menjelaskan contoh penggunaan bilangan bulat negatif dalam kehidupan sehari-hari (misal: suhu, kedalaman laut). Upload file video atau link Google Drive.',
    deadline: '2023-10-15',
    maxScore: 100,
    isActive: true,
    submissions: [
        {
            studentId: 's1',
            assignmentId: 'as1',
            textResponse: 'Berikut link video saya pak: https://youtube.com/shorts/example',
            submittedAt: '2023-10-10T14:00:00Z',
            status: 'Submitted'
        }
    ]
};

// Dummy Questionnaire Data
const dummyQuestionnaire: Questionnaire = {
    id: 'qz1',
    title: 'Tes Gaya Belajar (V-A-K)',
    description: 'Kuesioner ini bertujuan untuk mengetahui apakah kamu lebih dominan belajar dengan cara Melihat (Visual), Mendengar (Auditori), atau Melakukan (Kinestetik). Jawablah dengan jujur sesuai kebiasaanmu.',
    isActive: true,
    createdAt: '2023-08-01',
    responses: [],
    questions: [
        {
            id: 'qq1',
            text: 'Kalau ada pelajaran baru, kamu lebih suka...',
            options: [
                { text: 'Melihat gambar, diagram, atau peta konsep di papan tulis', pointsToType: 'Visual' },
                { text: 'Mendengarkan penjelasan guru dengan seksama', pointsToType: 'Auditori' },
                { text: 'Langsung mencoba praktik atau melakukan eksperimen', pointsToType: 'Kinestetik' }
            ]
        },
        {
            id: 'qq2',
            text: 'Saat waktu luang, kamu lebih sering...',
            options: [
                { text: 'Membaca buku atau komik', pointsToType: 'Visual' },
                { text: 'Mendengarkan musik atau podcast', pointsToType: 'Auditori' },
                { text: 'Olahraga atau membuat kerajinan tangan', pointsToType: 'Kinestetik' }
            ]
        },
        {
            id: 'qq3',
            text: 'Jika kamu tersesat di jalan, apa yang kamu lakukan?',
            options: [
                { text: 'Melihat peta di Google Maps', pointsToType: 'Visual' },
                { text: 'Bertanya pada orang di sekitar', pointsToType: 'Auditori' },
                { text: 'Jalan saja dulu mengikuti insting/arah', pointsToType: 'Kinestetik' }
            ]
        },
        {
            id: 'qq4',
            text: 'Apa yang paling mengganggumu saat belajar?',
            options: [
                { text: 'Tampilan ruangan yang berantakan', pointsToType: 'Visual' },
                { text: 'Suara bising atau keributan', pointsToType: 'Auditori' },
                { text: 'Duduk diam terlalu lama', pointsToType: 'Kinestetik' }
            ]
        }
    ],
    resultsDefinition: [
        {
            typeKey: 'Visual',
            title: 'Tipe Visual (Si Pelihat)',
            description: 'Kamu adalah pembelajar yang mengandalkan indra penglihatan. Kamu lebih mudah mengingat apa yang dilihat daripada yang didengar. Kamu suka kerapian dan visualisasi.',
            characteristics: [
                'Rapi dan teratur',
                'Berbicara dengan cepat',
                'Mengingat gambar dengan baik',
                'Lebih suka membaca daripada dibacakan'
            ],
            learningTips: [
                'Gunakan spidol warna-warni atau stabilo saat mencatat',
                'Buat peta konsep (mind mapping) untuk merangkum materi',
                'Gunakan video pembelajaran dan gambar ilustrasi',
                'Duduk di barisan depan agar bisa melihat papan tulis jelas'
            ]
        },
        {
            typeKey: 'Auditori',
            title: 'Tipe Auditori (Si Pendengar)',
            description: 'Kamu belajar paling baik dengan mendengarkan. Penjelasan lisan lebih mudah masuk ke otakmu dibanding membaca teks panjang.',
            characteristics: [
                'Mudah terganggu oleh keributan',
                'Suka membaca dengan suara keras',
                'Suka berdiskusi dan bercerita',
                'Pandai menirukan nada suara'
            ],
            learningTips: [
                'Rekam penjelasan guru dan dengarkan ulang di rumah',
                'Belajar sambil berdiskusi dengan teman',
                'Baca materi dengan suara lantang',
                'Hindari belajar di tempat bising, gunakan musik instrumental jika perlu'
            ]
        },
        {
            typeKey: 'Kinestetik',
            title: 'Tipe Kinestetik (Si Penggerak)',
            description: 'Kamu belajar melalui gerakan dan sentuhan. Duduk diam mendengarkan ceramah adalah siksaan bagimu. Kamu perlu aktif bergerak untuk memahami sesuatu.',
            characteristics: [
                'Berbicara perlahan',
                'Menyentuh orang untuk mendapatkan perhatian',
                'Tidak bisa duduk diam dalam waktu lama',
                'Belajar melalui praktik langsung'
            ],
            learningTips: [
                'Lakukan eksperimen atau praktik langsung',
                'Kunyah permen karet saat belajar (jika diizinkan)',
                'Gunakan flashcard yang bisa dipindah-pindahkan',
                'Belajar dalam sesi pendek tapi sering, selingi dengan peregangan'
            ]
        }
    ]
};

const seedData: Classroom[] = [
  {
    id: 'c1',
    name: 'VII-A',
    gradeLevel: 'VII',
    academicYear: '2023/2024',
    weights: defaultWeights,
    exams: [dummyExam],
    assignments: [dummyAssignment],
    questionnaires: [dummyQuestionnaire],
    students: [
      { id: 's1', nis: '7001', name: 'Ahmad Santoso', gender: 'L', notes: 'Sangat aktif di kelas, perlu ditingkatkan ketelitiannya.' },
      { id: 's2', nis: '7002', name: 'Budi Pratama', gender: 'L', notes: 'Sering terlambat mengumpulkan tugas.' },
      { id: 's3', nis: '7003', name: 'Citra Dewi', gender: 'P', notes: 'Memiliki bakat kepemimpinan yang baik.' },
      { id: 's4', nis: '7004', name: 'Dian Sastro', gender: 'P' },
      { id: 's5', nis: '7005', name: 'Eko Yuli', gender: 'L' },
      { id: 's6', nis: '7006', name: 'Fajar Nugraha', gender: 'L' },
      { id: 's7', nis: '7007', name: 'Gita Gutawa', gender: 'P' },
      { id: 's8', nis: '7008', name: 'Hadi Sucipto', gender: 'L', notes: 'Butuh bimbingan tambahan di matematika.' },
      { id: 's9', nis: '7009', name: 'Indah Permata', gender: 'P' },
      { id: 's10', nis: '7010', name: 'Joko Anwar', gender: 'L' },
    ],
    assessments: [
      { id: 'a1', title: 'PH 1: Bilangan Bulat', type: 'PH', maxScore: 100, date: '2023-07-25' },
      { id: 'a2', title: 'Tugas 1: Video Presentasi', type: 'Tugas', maxScore: 100, date: '2023-08-05' },
      { id: 'a3', title: 'PH 2: Aljabar Dasar', type: 'PH', maxScore: 100, date: '2023-08-20' },
      { id: 'a4', title: 'PTS Ganjil', type: 'PTS', maxScore: 100, date: '2023-09-15' },
      { id: 'a5', title: 'Obs. Kedisiplinan', type: 'Sikap', maxScore: 100, date: '2023-09-20' },
      { id: 'a6', title: 'Praktik: Pengukuran', type: 'Keterampilan', maxScore: 100, date: '2023-09-25' },
    ],
    grades: [
      // Ahmad (Pintar)
      { studentId: 's1', assessmentId: 'a1', score: 85 },
      { studentId: 's1', assessmentId: 'a2', score: 90 },
      { studentId: 's1', assessmentId: 'a3', score: 88 },
      { studentId: 's1', assessmentId: 'a4', score: 85 },
      { studentId: 's1', assessmentId: 'a5', score: 95 },
      { studentId: 's1', assessmentId: 'a6', score: 90 },
      // Budi (Remedial)
      { studentId: 's2', assessmentId: 'a1', score: 65 },
      { studentId: 's2', assessmentId: 'a2', score: 70 },
      { studentId: 's2', assessmentId: 'a3', score: 60 },
      { studentId: 's2', assessmentId: 'a4', score: 55 },
      { studentId: 's2', assessmentId: 'a5', score: 75 },
      { studentId: 's2', assessmentId: 'a6', score: 70 },
      // Citra (Sangat Pintar)
      { studentId: 's3', assessmentId: 'a1', score: 95 },
      { studentId: 's3', assessmentId: 'a2', score: 98 },
      { studentId: 's3', assessmentId: 'a3', score: 92 },
      { studentId: 's3', assessmentId: 'a4', score: 96 },
      { studentId: 's3', assessmentId: 'a5', score: 100 },
      { studentId: 's3', assessmentId: 'a6', score: 95 },
      // Dian (Rata-rata)
      { studentId: 's4', assessmentId: 'a1', score: 78 },
      { studentId: 's4', assessmentId: 'a2', score: 80 },
      { studentId: 's4', assessmentId: 'a3', score: 75 },
      { studentId: 's4', assessmentId: 'a4', score: 77 },
      { studentId: 's4', assessmentId: 'a5', score: 85 },
      { studentId: 's4', assessmentId: 'a6', score: 80 },
      // Eko (Mixed)
      { studentId: 's5', assessmentId: 'a1', score: 80 },
      { studentId: 's5', assessmentId: 'a2', score: 60 }, // Malas tugas
      { studentId: 's5', assessmentId: 'a3', score: 82 },
      { studentId: 's5', assessmentId: 'a4', score: 75 },
      { studentId: 's5', assessmentId: 'a5', score: 70 },
      { studentId: 's5', assessmentId: 'a6', score: 85 },
      // Fajar
      { studentId: 's6', assessmentId: 'a1', score: 90 }, { studentId: 's6', assessmentId: 'a4', score: 88 },
      // Hadi (Struggling)
      { studentId: 's8', assessmentId: 'a1', score: 40 }, { studentId: 's8', assessmentId: 'a2', score: 50 }, { studentId: 's8', assessmentId: 'a4', score: 45 },
    ],
    attendance: {
      's1': [
        { date: '2023-10-02', status: 'H' }, { date: '2023-10-03', status: 'H' }, { date: '2023-10-04', status: 'H' }
      ],
      's2': [
         { date: '2023-10-02', status: 'S' }, { date: '2023-10-03', status: 'H' }, { date: '2023-10-04', status: 'A' }
      ],
      's3': [{ date: '2023-10-02', status: 'H' }, { date: '2023-10-03', status: 'I' }, { date: '2023-10-04', status: 'H' }],
      's8': [{ date: '2023-10-02', status: 'A' }, { date: '2023-10-03', status: 'A' }, { date: '2023-10-04', status: 'H' }],
    },
    journals: [
      {
        id: 'j1',
        date: '2023-07-25',
        timeStart: '07:30',
        timeEnd: '09:00',
        topic: 'Bilangan Bulat',
        subTopic: 'Operasi Penjumlahan & Pengurangan',
        method: 'Diskusi Kelompok',
        notes: 'Siswa antusias, namun 3 siswa butuh bimbingan khusus pada pengurangan bilangan negatif.',
        absentSummary: 'Nihil',
        status: 'Terlaksana'
      },
      {
        id: 'j2',
        date: '2023-08-01',
        timeStart: '09:00',
        timeEnd: '10:30',
        topic: 'Bilangan Bulat',
        subTopic: 'Perkalian & Pembagian',
        method: 'Ceramah & Latihan Soal',
        notes: 'LCD proyektor sempat mati 10 menit. Budi Pratama tertidur di kelas.',
        absentSummary: 'Budi (S), Citra (I)',
        status: 'Terlaksana'
      }
    ]
  },
  {
    id: 'c2',
    name: 'VIII-B',
    gradeLevel: 'VIII',
    academicYear: '2023/2024',
    weights: defaultWeights,
    exams: [],
    assignments: [],
    questionnaires: [],
    students: [
      { id: 's21', nis: '8001', name: 'Kartika Sari', gender: 'P' },
      { id: 's22', nis: '8002', name: 'Lukman Hakim', gender: 'L' },
      { id: 's23', nis: '8003', name: 'Maya Angela', gender: 'P' },
      { id: 's24', nis: '8004', name: 'Nanda Putra', gender: 'L' },
      { id: 's25', nis: '8005', name: 'Oscar Lawalata', gender: 'L' },
    ],
    assessments: [
      { id: 'b1', title: 'PH 1: Tekanan Zat', type: 'PH', maxScore: 100, date: '2023-08-10' },
      { id: 'b2', title: 'Tugas: Laporan Praktikum', type: 'Tugas', maxScore: 100, date: '2023-08-15' },
      { id: 'b3', title: 'PTS Ganjil', type: 'PTS', maxScore: 100, date: '2023-09-18' },
      { id: 'b4', title: 'Praktik: Tekanan Hidrostatis', type: 'Keterampilan', maxScore: 100, date: '2023-09-20' },
    ],
    grades: [
        { studentId: 's21', assessmentId: 'b1', score: 88 }, { studentId: 's21', assessmentId: 'b2', score: 90 }, { studentId: 's21', assessmentId: 'b3', score: 85 }, { studentId: 's21', assessmentId: 'b4', score: 92 },
        { studentId: 's22', assessmentId: 'b1', score: 70 }, { studentId: 's22', assessmentId: 'b2', score: 75 }, { studentId: 's22', assessmentId: 'b3', score: 72 }, { studentId: 's22', assessmentId: 'b4', score: 70 },
        { studentId: 's23', assessmentId: 'b1', score: 95 }, { studentId: 's23', assessmentId: 'b2', score: 92 }, { studentId: 's23', assessmentId: 'b3', score: 94 }, { studentId: 's23', assessmentId: 'b4', score: 90 },
    ],
    attendance: {
        's21': [{ date: '2023-10-02', status: 'H' }],
        's22': [{ date: '2023-10-02', status: 'I' }],
    },
    journals: []
  }
];

// Seed Data for Forum
const forumSeedData: ForumTopic[] = [
  {
    id: 't1',
    title: "Strategi Penerapan Projek P5 dalam Kurikulum Merdeka",
    content: "Bapak/Ibu, saya mengalami kendala dalam mengkoordinasikan jadwal P5 dengan mata pelajaran lain. Apakah ada yang punya contoh jadwal blok yang efektif?",
    author: "Bu Ani S.Pd",
    role: "Guru Senior",
    category: "Kurikulum",
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    likes: 156,
    isPinned: true,
    avatarColor: "bg-pink-100 text-pink-600",
    replies: [
        {
            id: 'r1',
            topicId: 't1',
            author: 'Pak Budi',
            role: 'Wali Kelas',
            content: 'Di sekolah kami, kami menggunakan sistem blok mingguan. Jadi minggu ke-4 setiap bulan khusus untuk P5.',
            createdAt: new Date(Date.now() - 3600000).toISOString()
        }
    ]
  },
  {
    id: 't2',
    title: "Cara efektif mengatasi siswa yang kurang motivasi pasca pandemi?",
    content: "Banyak siswa yang sepertinya kehilangan 'learning habit' setelah lama daring. Bagaimana cara menumbuhkannya kembali?",
    author: "Pak Budi",
    role: "Wali Kelas",
    category: "Pedagogik",
    createdAt: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
    likes: 342,
    isPinned: false,
    avatarColor: "bg-blue-100 text-blue-600",
    replies: []
  },
  {
    id: 't3',
    title: "Sharing Rubrik Penilaian Keterampilan Abad 21",
    content: "Izin berbagi dan meminta masukan mengenai instrumen penilaian Critical Thinking yang saya buat.",
    author: "Dinda Pratiwi",
    role: "Admin Sekolah",
    category: "Administrasi",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    likes: 98,
    isPinned: false,
    avatarColor: "bg-emerald-100 text-emerald-600",
    replies: []
  }
];

export const loadClassrooms = (): Classroom[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return seedData;
};

export const saveClassrooms = (classrooms: Classroom[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classrooms));
};

export const loadForumTopics = (): ForumTopic[] => {
    const data = localStorage.getItem(FORUM_KEY);
    if (data) {
        return JSON.parse(data);
    }
    return forumSeedData;
};

export const saveForumTopics = (topics: ForumTopic[]) => {
    localStorage.setItem(FORUM_KEY, JSON.stringify(topics));
};

export const loadSchoolProfile = (): SchoolProfile => {
    const data = localStorage.getItem(SCHOOL_PROFILE_KEY);
    if (data) {
        return JSON.parse(data);
    }
    return defaultSchoolProfile;
};

export const saveSchoolProfile = (profile: SchoolProfile) => {
    localStorage.setItem(SCHOOL_PROFILE_KEY, JSON.stringify(profile));
};

export const calculateFinalScore = (classroom: Classroom, studentId: string): number => {
  const { students, assessments, grades, weights } = classroom;
  
  // Group grades by type
  const scoresByType: Record<string, { total: number; count: number }> = {
    PH: { total: 0, count: 0 },
    PTS: { total: 0, count: 0 },
    PAS: { total: 0, count: 0 },
    Tugas: { total: 0, count: 0 },
    Sikap: { total: 0, count: 0 },
    Keterampilan: { total: 0, count: 0 },
  };

  assessments.forEach(ass => {
    const grade = grades.find(g => g.assessmentId === ass.id && g.studentId === studentId);
    if (grade) {
      scoresByType[ass.type].total += grade.score;
      scoresByType[ass.type].count += 1;
    }
  });

  let finalScore = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([type, weight]) => {
    if (weight > 0) {
      const typeData = scoresByType[type];
      if (typeData.count > 0) {
        const average = typeData.total / typeData.count;
        finalScore += average * (weight / 100);
        totalWeight += weight;
      }
    }
  });

  // Jika belum ada nilai sama sekali, return 0
  if (totalWeight === 0) return 0;

  // Normalisasi jika bobot belum 100% (misal belum PAS)
  const normalizedScore = (finalScore / totalWeight) * 100;
  
  return parseFloat(normalizedScore.toFixed(2));
};

export const getAttendanceStats = (records: AttendanceRecord[]) => {
  const stats = { H: 0, S: 0, I: 0, A: 0 };
  if (!records) return stats;
  
  records.forEach(r => {
    if (stats[r.status] !== undefined) {
      stats[r.status]++;
    }
  });
  return stats;
};

// --- BACKUP & RESTORE FUNCTIONS ---

export interface BackupData {
    version: number;
    timestamp: string;
    classrooms: Classroom[];
    forumTopics: ForumTopic[];
    schoolProfile: SchoolProfile;
}

export const getAllDataForBackup = (): BackupData => {
    return {
        version: 1,
        timestamp: new Date().toISOString(),
        classrooms: loadClassrooms(),
        forumTopics: loadForumTopics(),
        schoolProfile: loadSchoolProfile()
    };
};

export const restoreDataFromBackup = (data: Partial<BackupData>): boolean => {
    try {
        if (!data || typeof data !== 'object') {
            throw new Error("Format file tidak valid (bukan JSON object).");
        }

        // Validate essentials but allow others to be missing (backward compatibility)
        if (!data.classrooms || !Array.isArray(data.classrooms)) {
             throw new Error("Data 'classrooms' tidak ditemukan atau rusak.");
        }

        // Save data with fallbacks to defaults if keys are missing
        saveClassrooms(data.classrooms);
        saveForumTopics(data.forumTopics || []);
        saveSchoolProfile(data.schoolProfile || defaultSchoolProfile);
        
        return true;
    } catch (e) {
        console.error("Restore failed details:", e);
        return false;
    }
};
