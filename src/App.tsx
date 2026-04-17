import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from 'motion/react';
import { QuizBuilder, QuizPlayer } from './Quiz';
import TopicProfileView from './TopicProfileView';
import ChannelProfileView from './ChannelProfileView';
import { CreatorLogin, CreatorDashboard, getThumbnailFromUrl } from './CreatorMode';
import {
  Home,
  BookOpen,
  Info,
  PlayCircle,
  Zap,
  Instagram,
  Users,
  ChevronRight,
  ChevronLeft,
  Star,
  MonitorPlay,
  Lightbulb,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  ArrowUpDown,
  Search,
  Bookmark,
  Share2,
  Clock,
  Layout,
  PenTool,
  AlertCircle,
  CheckCircle,
  Mic,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

type Section = 'home' | 'lessons' | 'about';
type Platform = 'YouTube' | 'TikTok' | 'Instagram' | 'Facebook';

interface Lesson {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  tag?: string;
  duration?: string;
  platform?: Platform;
  topic?: string;
  subtopic?: string;
  videoUrl?: string;
  created_at?: string; // Preserve Supabase timestamp
}

const TOPICS = [
  { id: 'Parts of Speech', title: 'Parts of Speech', icon: <BookOpen className="text-indigo-500" size={24} />, desc: 'Nouns, Verbs, Adjectives, Adverbs, and more...', bg: 'bg-indigo-50' },
  { id: 'Verb Tenses & Aspects', title: 'Verb Tenses & Aspects', icon: <Clock className="text-emerald-500" size={24} />, desc: 'Present, Past, Future, Perfect, and Continuous...', bg: 'bg-emerald-50' },
  { id: 'Sentence Structure & Syntax', title: 'Sentence Structure & Syntax', icon: <Layout className="text-amber-500" size={24} />, desc: 'Clauses, Phrases, Conjunctions, and Sentence Logic...', bg: 'bg-amber-50' },
  { id: 'Mechanics & Punctuation', title: 'Mechanics & Punctuation', icon: <PenTool className="text-rose-500" size={24} />, desc: 'Commas, Semicolons, Quotes, and Formatting...', bg: 'bg-rose-50' },
  { id: 'Advanced Grammatical Concepts', title: 'Advanced Grammatical Concepts', icon: <Zap className="text-purple-500" size={24} />, desc: 'Conditionals, Modals, Passive Voice, and Nuances...', bg: 'bg-purple-50' },
  { id: 'Common Usage Pitfalls', title: 'Common Usage Pitfalls', icon: <AlertCircle className="text-orange-500" size={24} />, desc: 'Common Mistakes, Easily Confused Words...', bg: 'bg-orange-50' },
  { id: 'Pronunciation', title: 'Pronunciation', icon: <Mic className="text-cyan-500" size={24} />, desc: 'Sounds, Stress, Intonation, and Rhythm...', bg: 'bg-cyan-50' },
];

const PLATFORM_LESSONS: Record<Platform, Lesson[]> = {
  YouTube: [],
  TikTok: [],
  Instagram: [],
  Facebook: []
};

const TOPIC_COLORS: Record<string, string> = {
  'Grammar': 'from-indigo-600 to-purple-600',
  'Vocabulary': 'from-emerald-500 to-teal-600',
  'Pronunciation': 'from-amber-400 to-orange-500',
  'Writing': 'from-rose-500 to-pink-600',
  'General': 'from-slate-600 to-slate-800'
};

const PLATFORM_COLORS: Record<Platform, string> = {
  YouTube: 'from-red-600 to-red-700',
  TikTok: 'from-zinc-900 via-zinc-800 to-black',
  Instagram: 'from-fuchsia-600 via-pink-600 to-orange-500',
  Facebook: 'from-blue-600 to-blue-700'
};

const PLATFORM_BADGE: Record<Platform, string> = {
  YouTube: 'bg-red-600',
  TikTok: 'bg-black',
  Instagram: 'bg-gradient-to-tr from-fuchsia-600 to-pink-600',
  Facebook: 'bg-blue-600'
};

function LessonThumbnail({ lesson, index, className }: { lesson: Lesson, index?: number, className?: string }) {
  const colorClass = lesson.platform ? PLATFORM_COLORS[lesson.platform] : (TOPIC_COLORS[lesson.topic || 'General'] || TOPIC_COLORS['General']);
  const hasImage = lesson.thumbnail && !lesson.thumbnail.includes('placeholder') && !lesson.thumbnail.includes('picsum.photos');

  const PlatformLogo = () => {
    switch (lesson.platform) {
      case 'YouTube': return <PlayCircle size={32} fill="white" className="text-red-500" />;
      case 'TikTok': return <Zap size={32} fill="white" className="text-black" />;
      case 'Instagram': return <Instagram size={32} className="text-white" />;
      default: return <MonitorPlay size={32} className="text-white" />;
    }
  };

  if (hasImage) {
    return (
      <div className={`${className} bg-black flex items-center justify-center overflow-hidden`}>
        <img
          src={lesson.thumbnail}
          alt={lesson.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`${className} bg-gradient-to-br ${colorClass} flex flex-col items-center justify-center p-6 text-white overflow-hidden relative group-hover:scale-105 transition-transform duration-700`}>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl mb-4 shadow-xl border border-white/30">
        <PlatformLogo />
      </div>
      <div className="text-center z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 block mb-1">
          {lesson.platform} Lesson
        </span>
        <span className="text-2xl font-black">
          #{index !== undefined ? index + 1 : lesson.id.slice(-4)}
        </span>
      </div>
      {/* Decorative background element */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl opacity-50" />
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCreatorMode, setIsCreatorMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [localLessons, setLocalLessons] = useState<Lesson[]>([]);
  const [lessonsWithQuizzes, setLessonsWithQuizzes] = useState<Set<string>>(new Set());
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('grammar_user_name'));
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [tempName, setTempName] = useState('');

  const handleTakePart = () => {
    setIsNameModalOpen(true);
  };

  const saveUserName = () => {
    if (tempName.trim()) {
      localStorage.setItem('grammar_user_name', tempName.trim());
      setUserName(tempName.trim());
      setIsNameModalOpen(false);
    }
  };

  const homeRef = useRef<HTMLElement>(null);
  const lessonsRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Check for creator route
    if (window.location.pathname === '/creator') {
      setIsCreatorMode(true);
    }

    // Sync with Supabase
    const fetchLessonsAndQuizzes = async () => {
      const [lessonsRes, quizzesRes] = await Promise.all([
        supabase.from('lessons').select('*').order('id', { ascending: false }),
        supabase.from('quizzes').select('lesson_id')
      ]);

      if (lessonsRes.data) {
        setLocalLessons(lessonsRes.data);
      }
      if (quizzesRes.data) {
        setLessonsWithQuizzes(new Set(quizzesRes.data.map(q => q.lesson_id)));
      }
    };

    fetchLessonsAndQuizzes();

    const handleScroll = () => {
      if (isCreatorMode) return;
      setIsScrolled(window.scrollY > 20);

      const scrollPosition = window.scrollY + 100;

      if (aboutRef.current && scrollPosition >= aboutRef.current.offsetTop) {
        setActiveSection('about');
      } else if (lessonsRef.current && scrollPosition >= lessonsRef.current.offsetTop) {
        setActiveSection('lessons');
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCreatorMode]);

  const saveLessons = async (updated: Lesson[]) => {
    setLocalLessons(updated);

    // Fix: PostgREST bulk upserts fill missing columns with null.
    // We must ensure all objects have a created_at if the DB column is NOT NULL.
    const toUpsert = updated.map(lesson => ({
      ...lesson,
      created_at: lesson.created_at || new Date().toISOString()
    }));

    const { error } = await supabase.from('lessons').upsert(toUpsert);
    if (error) console.error('Error saving lessons:', error);
  };

  const syncQuizStatus = async () => {
    const { data } = await supabase.from('quizzes').select('lesson_id');
    if (data) setLessonsWithQuizzes(new Set(data.map(q => q.lesson_id)));
  };

  const deleteLesson = async (id: string) => {
    const updated = localLessons.filter(l => l.id !== id);
    setLocalLessons(updated);

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting lesson from Supabase:', error);
    }
  };

  const getMergedLessons = (topicTitle: string) => {
    return localLessons.filter(l => l.topic === topicTitle);
  };

  function TopicCard({ icon, iconBg, title, description, lessons, onClick }: any) {
    return (
      <div
        onClick={onClick}
        className="bg-white rounded-3xl p-8 hover:shadow-2xl transition-all cursor-pointer border border-on-surface/5 group hover:border-secondary/20 h-full flex flex-col"
      >
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <h4 className="text-xl font-bold text-on-surface mb-3 group-hover:text-secondary transition-colors line-clamp-2">{title}</h4>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-grow">{description}</p>
        <div className="pt-6 border-t border-on-surface/5 mt-auto">
          <span className="text-xs font-bold text-secondary">{lessons}</span>
        </div>
      </div>
    );
  }

  const scrollTo = (section: Section) => {
    if (isCreatorMode) {
      window.location.pathname = '/';
      return;
    }
    if (selectedTopic) {
      setSelectedTopic(null);
      // Small timeout to allow the main view to mount before scrolling
      setTimeout(() => {
        const refs = { home: homeRef, lessons: lessonsRef, about: aboutRef };
        const ref = refs[section];
        if (ref.current) {
          window.scrollTo({
            top: ref.current.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      }, 50);
    } else {
      const refs = { home: homeRef, lessons: lessonsRef, about: aboutRef };
      const ref = refs[section];
      if (ref.current) {
        window.scrollTo({
          top: ref.current.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    }
  };

  if (isCreatorMode) {
    if (!isLoggedIn) {
      return <CreatorLogin onLogin={() => setIsLoggedIn(true)} />;
    }
    return (
      <CreatorDashboard
        lessons={localLessons}
        onSave={saveLessons}
        onDelete={deleteLesson}
        hasQuizIds={lessonsWithQuizzes}
        onQuizSaved={syncQuizStatus}
        onLogout={() => {
          setIsLoggedIn(false);
          setIsCreatorMode(false);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  if (selectedTopic && selectedLessonId) {
    return (
      <PlatformLessonsView
        topic={selectedTopic}
        lessons={getMergedLessons(selectedTopic)}
        hasQuizIds={lessonsWithQuizzes}
        initialLessonId={selectedLessonId}
        onBack={() => {
          console.log('Back from Feed to Profile');
          setSelectedLessonId(null);
        }}
      />
    );
  }

  if (selectedTopic) {
    return (
      <TopicProfileView
        topic={selectedTopic}
        lessons={getMergedLessons(selectedTopic)}
        hasQuizIds={lessonsWithQuizzes}
        onBack={() => {
          console.log('Navigation: Topic Grid -> Home');
          scrollTo('lessons');
        }}
        onVideoClick={(id) => setSelectedLessonId(id)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-on-surface/5 py-2' : 'bg-background py-4'}`}>
        <div className="max-w-7xl mx-auto px-5">
          {/* Mobile row 1: logo */}
          <div className="flex items-center justify-center md:hidden">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('home')}>
              <BookOpen className="text-secondary w-6 h-6" />
              <h1 className="text-base font-extrabold text-secondary tracking-tight leading-tight">Quintessen Grammar</h1>
            </div>
          </div>

          {/* Mobile row 2: nav centered */}
          <div className="flex justify-center mt-2.5 md:hidden">
            <nav className="flex items-center gap-1.5">
              <NavButton active={activeSection === 'home'} onClick={() => scrollTo('home')} icon={<Home size={18} />} label="Home" />
              <NavButton active={activeSection === 'lessons'} onClick={() => scrollTo('lessons')} icon={<BookOpen size={18} />} label="Lessons" />
              <NavButton active={activeSection === 'about'} onClick={() => scrollTo('about')} icon={<Info size={18} />} label="About Us" />
            </nav>
          </div>

          {/* Desktop: single row */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('home')}>
              <BookOpen className="text-secondary w-8 h-8" />
              <h1 className="text-2xl font-extrabold text-secondary tracking-tight leading-tight">Quintessen Grammar</h1>
            </div>

            <nav className="flex items-center gap-4">
              <NavButton active={activeSection === 'home'} onClick={() => scrollTo('home')} icon={<Home size={20} />} label="Home" />
              <NavButton active={activeSection === 'lessons'} onClick={() => scrollTo('lessons')} icon={<BookOpen size={20} />} label="Lessons" />
              <NavButton active={activeSection === 'about'} onClick={() => scrollTo('about')} icon={<Info size={20} />} label="About Us" />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-40 md:pt-24">
        {/* Hero Section */}
        <section ref={homeRef} className="max-w-7xl mx-auto px-6 py-12 md:py-20 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <h2 className="text-5xl md:text-7xl font-extrabold text-on-surface leading-[1.1] mb-8">
                The Grammar <br />
                <span className="text-secondary">Loop</span>
              </h2>
              <p className="text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed">
                To deliver bite-sized, high-impact grammar hacks that help creators and professionals master the English language in 60 seconds or less.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="bg-tertiary-container text-on-tertiary-container px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm">
                  <Star size={16} fill="currentColor" />
                  New Lessons Daily
                </span>
                <button
                  onClick={handleTakePart}
                  className="bg-secondary text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-secondary/20 hover:bg-secondary-dim transition-all flex items-center gap-2"
                >
                  <Users size={16} />
                  {userName ? `Hi, ${userName}` : 'Take Part'}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-5 relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative z-10">
                <img
                  className="w-full h-full object-cover"
                  src="https://picsum.photos/seed/learning/800/800"
                  alt="Learning environment"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-tertiary-container rounded-3xl -z-0 opacity-50 blur-2xl"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary-container rounded-full -z-0 opacity-30 blur-xl"></div>
            </motion.div>
          </div>
        </section>

        {/* Lessons Section - Updated Layout */}
        <section ref={lessonsRef} className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h3 className="text-4xl font-extrabold text-on-surface mb-3">Choose Your Topic</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {TOPICS.map((t) => (
              <TopicCard
                key={t.id}
                icon={t.icon}
                iconBg={t.bg}
                title={t.title}
                description={t.desc}
                lessons={`${getMergedLessons(t.id).length} Lessons`}
                onClick={() => setSelectedTopic(t.id)}
              />
            ))}
          </div>
        </section>



        {/* About Us Section - Updated Layout */}
        <section ref={aboutRef} className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-16">
            <h3 className="text-4xl font-extrabold text-on-surface mb-4">Our Mission</h3>
            <p className="text-on-surface-variant text-xl"></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <MissionCard
              icon={<Lightbulb className="text-secondary" size={24} />}
              title="Mission"
              description="To deliver bite-sized, high-impact grammar insights that empower creators and professionals to write with clarity, confidence, and precision. We aim to simplify complex grammar rules, provide practical writing strategies, and make language learning accessible, engaging, and useful for everyday communication."
            />
            <MissionCard
              icon={<GraduationCap className="text-secondary" size={24} />}
              title="Learning"
              description="To become a trusted and go-to platform for modern grammar learning, where individuals continuously improve their writing skills through simple, effective, and engaging content."
            />
          </div>

          <div className="text-center mb-16">
            <h3 className="text-4xl font-extrabold text-on-surface">Meet the Visionaries</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            <TeamCard
              image="https://picsum.photos/seed/elena/600/800"
              name="Antiquera, Shane M. "
              role="BSED ENGLISH III
Researcher"
              bio="A PhD in Cognitive Linguistics with 15 years of experience bridging the gap between brain science and language acquisition."
            />
            <TeamCard
              image="https://picsum.photos/seed/marcus/600/800"
              name="Bayani, Catherine M. "
              role="BSED ENGLISH III
Researcher"
              bio="The architect behind 'The Fluid Classroom.' Marcus ensures every pixel serves the learner's journey and mental momentum."
            />
            <TeamCard
              image="https://picsum.photos/seed/sarah/600/800"
              name="Belgado, Cyrel Ann M."
              role="BSED ENGLISH III
Researcher"
              bio="Dedicated to human-centric design, Sarah ensures GrammarFlow remains the most approachable learning tool in the market."
            />
            <TeamCard
              image="https://picsum.photos/seed/anya/600/800"
              name="Campita, Charlene C."
              role="BSED ENGLISH III
Researcher"
              bio="A full-stack wizard who transformed traditional learning logic into the smooth, interactive GrammarLoop experience."
            />
            <TeamCard
              image="https://picsum.photos/seed/david/600/800"
              name="Sidro, Dawn Yve A."
              role="BSED ENGLISH III
Researcher"
              bio="Scaling our mission to reach every corner of the globe, David ensures Quintessenen remains at the forefront of EdTech."
            />
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="bg-surface-container-low mt-20 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="text-secondary w-8 h-8" />
                <h4 className="text-2xl font-extrabold text-secondary tracking-tight">Quintessen Grammar</h4>
              </div>
              <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
                To deliver bite-sized, high-impact grammar hacks that help creators and professionals master the English language in 60 seconds or less.
              </p>
            </div>

            <div className="md:col-span-2 md:col-start-7">
              <h5 className="font-bold text-on-surface mb-6 text-lg">Quick Links</h5>
              <ul className="space-y-4 text-on-surface-variant">
                <li><button onClick={() => scrollTo('lessons')} className="hover:text-secondary transition-colors">All Lessons</button></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Study Guides</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Premium Perks</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h5 className="font-bold text-on-surface mb-6 text-lg">Support</h5>
              <ul className="space-y-4 text-on-surface-variant">
                <li><a href="#" className="hover:text-secondary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h5 className="font-bold text-on-surface mb-6 text-lg">Newsletter</h5>
              <div className="flex gap-2">
                <input type="email" placeholder="Email" className="bg-white border-none rounded-full px-4 py-2 text-sm w-full focus:ring-2 focus:ring-secondary/20" />
                <button className="bg-secondary text-white p-2 rounded-full hover:bg-secondary-dim transition-colors">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-on-surface/5 text-center text-on-surface-variant text-sm">
            <p>© {new Date().getFullYear()} Quintessenen Grammar . All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Name Input Modal */}
      <AnimatePresence>
        {isNameModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNameModalOpen(false)}
              className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-secondary">
                  <Users size={32} />
                </div>
                <h3 className="text-2xl font-black text-on-surface">Welcome!</h3>
                <p className="text-on-surface-variant mt-2 font-medium">What should we call you?</p>
              </div>

              <div className="space-y-6">
                <div>
                  <input
                    autoFocus
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveUserName()}
                    className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface text-center text-lg font-bold focus:ring-2 focus:ring-secondary/20 transition-all placeholder:font-normal"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setIsNameModalOpen(false)}
                    className="flex-1 bg-surface-container-low text-on-surface-variant py-4 rounded-2xl font-bold hover:bg-on-surface/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveUserName}
                    className="flex-1 bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20"
                  >
                    Save & Start
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


function PlatformLessonsView({ topic, lessons, hasQuizIds, onBack, initialLessonId }: { topic: string, lessons: Lesson[], hasQuizIds: Set<string>, onBack: () => void, initialLessonId?: string | null }) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [quizLesson, setQuizLesson] = useState<Lesson | null>(null);
  const [direction, setDirection] = useState<number>(0);
  const touchStartY = useRef<number>(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadCompleted = () => {
      const stored = localStorage.getItem('completed_quizzes');
      if (stored) {
        try { setCompletedIds(new Set(JSON.parse(stored))); }
        catch (e) { console.error(e); }
      }
    };
    loadCompleted();
    window.addEventListener('storage', loadCompleted);
    window.addEventListener('completed_quizzes_updated', loadCompleted);
    return () => {
      window.removeEventListener('storage', loadCompleted);
      window.removeEventListener('completed_quizzes_updated', loadCompleted);
    };
  }, []);

  const sortedLessons = lessons;

  useEffect(() => {
    if (initialLessonId) {
      const idx = sortedLessons.findIndex(l => l.id === initialLessonId);
      if (idx !== -1) setCurrentIdx(idx);
    }
  }, [initialLessonId, sortedLessons]);

  const lesson = sortedLessons[currentIdx] ?? null;

  const navigate = (idx: number) => {
    if (idx >= 0 && idx < sortedLessons.length) {
      setDirection(idx > currentIdx ? 1 : -1);
      setCurrentIdx(idx);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0) navigate(currentIdx + 1);
      else navigate(currentIdx - 1);
    }
  };

  const getEmbedUrl = (url?: string): string | null => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      if (url.includes('/shorts/')) {
        const videoId = url.split('/shorts/')[1]?.split(/[?#]/)[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
    }
    if (url.includes('facebook.com')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560`;
    }
    if (url.includes('instagram.com')) {
      const cleanUrl = url.split(/[?#]/)[0];
      return `${cleanUrl.endsWith('/') ? cleanUrl : cleanUrl + '/'}embed`;
    }
    if (url.includes('tiktok.com')) {
      const videoIdMatch = url.match(/\/video\/(\d+)/);
      if (videoIdMatch && videoIdMatch[1]) {
        return `https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`;
      }
      return url;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(lesson?.videoUrl);
  const isVertical = lesson?.platform === 'TikTok' ||
    lesson?.platform === 'Instagram' ||
    lesson?.videoUrl?.includes('/shorts/');

  const slideVariants = {
    enter: (dir: number) => ({ y: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (dir: number) => ({ y: dir > 0 ? '-40%' : '40%', opacity: 0 }),
  };

  if (sortedLessons.length === 0) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <MonitorPlay size={64} className="opacity-20 mb-4" />
        <h3 className="text-2xl font-black mb-2">No Lessons Yet</h3>
        <p className="text-white/50 text-center max-w-xs px-6">
          No lessons uploaded for this topic yet. Check back soon!
        </p>
        <button
          onClick={onBack}
          className="mt-8 bg-white/15 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/25 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black z-50 overflow-hidden select-none touch-none overscroll-none"
    >
      {/* ── Mobile Swipe Edge Zones ── */}
      {/* Left zone */}
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-40"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />
      {/* Right zone (excludes action bar area) */}
      <div
        className="absolute right-20 top-0 bottom-0 w-16 z-40"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />

      {/* ── Animated Slide ── */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={lesson?.id || 'empty'}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute inset-0"
        >
          {/* ── Blurred Background Fill (for vertical videos) ── */}
          {lesson && isVertical && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <LessonThumbnail
                lesson={lesson}
                className="absolute inset-0 w-full h-full scale-110 blur-3xl opacity-50 brightness-50"
              />
            </div>
          )}

          {/* Video / Thumbnail */}
          <div className="absolute inset-0 flex items-center justify-center bg-transparent">
            {lesson ? (
              embedUrl ? (
                <iframe
                  src={embedUrl}
                  className={
                    isVertical
                      ? 'h-full w-auto aspect-[9/16] max-w-full border-0 shadow-2xl z-10'
                      : 'w-full h-full border-0'
                  }
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={lesson?.title}
                />
              ) : (
                <LessonThumbnail
                  lesson={lesson}
                  index={currentIdx}
                  className="absolute inset-0 w-full h-full"
                />
              )
            ) : (
              <div className="flex flex-col items-center gap-4 text-white/20">
                <Search size={64} />
                <p className="text-lg font-bold">No matching lessons</p>
              </div>
            )}
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none z-20" />

          {/* ── Bottom lesson info bar ── */}
          {lesson && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="absolute bottom-0 left-0 right-20 px-5 pb-10 pointer-events-none z-30"
            >
              <div className="flex flex-col gap-2 max-w-lg">
                <div className="flex items-center gap-2 pointer-events-auto">
                  <span className="text-white font-black text-sm tracking-tight">
                    @{lesson.platform?.toLowerCase() || 'grammar'}
                  </span>
                  {lesson.platform && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-white shadow-sm ${PLATFORM_BADGE[lesson.platform]}`}>
                      {lesson.platform}
                    </span>
                  )}
                </div>

                <h3 className="text-white font-black text-xl md:text-2xl leading-tight drop-shadow-md">
                  {lesson.title}
                </h3>

                <p className="text-white/80 text-xs md:text-sm line-clamp-2 leading-relaxed font-medium">
                  {lesson.description}
                </p>

                {lesson.topic && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-secondary font-black text-[10px] uppercase tracking-widest">
                      #{lesson.topic.replace(/\s+/g, '')}
                    </span>
                    {lesson.duration && (
                      <span className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded text-[9px] text-white/60 font-bold">
                        {lesson.duration}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Right Action Bar (TikTok-style sidebar) */}
          {lesson && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute right-4 bottom-16 flex flex-col items-center gap-6 z-30"
            >
              <FeedActionButton
                icon={completedIds.has(lesson.id) ? <CheckCircle size={26} /> : <GraduationCap size={26} />}
                label={completedIds.has(lesson.id) ? "Passed" : "Quiz"}
                success={completedIds.has(lesson.id)}
                active={hasQuizIds.has(lesson.id)}
                disabled={!hasQuizIds.has(lesson.id)}
                onClick={() => setQuizLesson(lesson)}
              />
              <FeedActionButton
                icon={<ChevronUp size={28} />}
                label="Prev"
                onClick={() => navigate(currentIdx - 1)}
                disabled={currentIdx === 0}
              />
              <FeedActionButton
                icon={<ChevronDown size={28} />}
                label="Next"
                onClick={() => navigate(currentIdx + 1)}
                disabled={currentIdx === sortedLessons.length - 1}
              />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Fixed UI (does not animate with slides) ── */}

      {/* Top Header */}
      <div className="absolute top-0 inset-x-0 z-[60] bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <div className="flex items-center justify-between px-5 pt-4 pb-12 pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              console.log('Feed Back Clicked');
              onBack();
            }}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 transition-colors pointer-events-auto shadow-xl"
          >
            <ArrowLeft size={20} />
          </motion.button>

          <div className="text-center">
            <p className="text-white font-black text-base tracking-wide uppercase tracking-widest leading-none mb-1">{topic}</p>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
              {sortedLessons.length > 0 ? `${currentIdx + 1} / ${sortedLessons.length}` : '0 / 0'}
            </p>
          </div>

          <div className="w-10" />
        </div>
      </div>



      {/* Progress sidebar dots */}
      {sortedLessons.length > 1 && sortedLessons.length <= 40 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1">
          {sortedLessons.map((_, i) => (
            <button
              key={i}
              onClick={() => navigate(i)}
              aria-label={`Go to lesson ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${i === currentIdx
                ? 'w-1.5 h-6 bg-white'
                : 'w-1 h-1.5 bg-white/25 hover:bg-white/50'
                }`}
            />
          ))}
        </div>
      )}

      {/* Quiz Player */}
      <AnimatePresence>
        {quizLesson && (
          <QuizPlayer
            lessonId={quizLesson.id}
            lessonTitle={quizLesson.title}
            onClose={() => setQuizLesson(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FeedActionButton({
  icon,
  label,
  active = false,
  success = false,
  disabled = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  success?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.85 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`flex flex-col items-center gap-1.5 ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${success
          ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/40'
          : active
            ? 'bg-amber-400 text-amber-900 shadow-xl shadow-amber-400/40'
            : 'bg-white/20 text-white hover:bg-white/30'
          }`}
      >
        {icon}
      </div>
      <span className="text-white text-[9px] font-bold uppercase tracking-wider drop-shadow-lg">
        {label}
      </span>
    </motion.button>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group ${active
        ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
        }`}
    >
      <span className={`${active ? 'text-on-secondary-container' : 'text-on-surface-variant group-hover:text-secondary'} transition-colors`}>
        {icon}
      </span>
      <AnimatePresence mode="wait">
        {active && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="overflow-hidden whitespace-nowrap text-sm"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function PlatformCard({ icon, iconBg, title, description, lessons, onClick }: { icon: ReactNode, iconBg: string, title: string, description: string, lessons: string, onClick?: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-white rounded-3xl p-8 shadow-xl shadow-on-surface/5 border border-on-surface/5 flex flex-col h-full group cursor-pointer"
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${iconBg}`}>
        {icon}
      </div>
      <h4 className="text-2xl font-bold text-on-surface mb-3">{title}</h4>
      <p className="text-on-surface-variant mb-8 flex-grow leading-relaxed text-sm">
        {description}
      </p>
      <div className="pt-6 border-t border-on-surface/5">
        <span className="text-secondary font-bold text-sm">{lessons}</span>
      </div>
    </motion.div>
  );
}

function MissionCard({ icon, title, description, className }: { icon: ReactNode, title: string, description: string, className?: string }) {
  return (
    <div className={`bg-white rounded-3xl p-8 shadow-xl shadow-on-surface/5 border border-on-surface/5 ${className}`}>
      <div className="mb-6">
        {icon}
      </div>
      <h4 className="text-2xl font-bold text-on-surface mb-3">{title}</h4>
      <p className="text-on-surface-variant leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function TeamCard({ image, name, role, bio }: { image: string, name: string, role: string, bio: string }) {
  return (
    <div className="flex flex-col">
      <div className="aspect-[3/4] rounded-3xl overflow-hidden mb-6 shadow-2xl">
        <img src={image} alt={name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
      </div>
      <h4 className="text-lg font-bold text-on-surface mb-1">{name}</h4>
      <span className="text-secondary font-bold text-xs tracking-widest mb-4">{role}</span>
      <p className="text-on-surface-variant text-sm leading-relaxed">
        {bio}
      </p>
    </div>
  );
}
