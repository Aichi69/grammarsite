import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowLeft,
    PlayCircle,
    Zap,
    Search,
    Instagram,
    Users,
    BookOpen,
    Clock,
    ChevronDown,
    ChevronRight,
    Layout,
    Filter,
    ArrowUpDown,
    PenTool,
    AlertCircle,
    CheckCircle,
    Mic
} from 'lucide-react';
import { QuizPlayer } from './Quiz';

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
    created_at?: string;
}

// ── Topic Theme ────────────────────────────────────────────────────────
const TOPIC_COLORS: Record<string, string> = {
    'Parts of Speech': 'from-indigo-600 to-indigo-800',
    'Verb Tenses & Aspects': 'from-emerald-500 to-emerald-700',
    'Sentence Structure & Syntax': 'from-amber-500 to-amber-700',
    'Mechanics & Punctuation': 'from-rose-500 to-rose-700',
    'Advanced Grammatical Concepts': 'from-purple-500 to-purple-800',
    'Common Usage Pitfalls': 'from-orange-500 to-orange-700',
    'Pronunciation': 'from-cyan-500 to-cyan-700',
    'General': 'from-slate-600 to-slate-800',
};

const TOPIC_ICONS: Record<string, React.ReactNode> = {
    'Parts of Speech': <BookOpen size={44} className="text-indigo-500" />,
    'Verb Tenses & Aspects': <Clock size={44} className="text-emerald-500" />,
    'Sentence Structure & Syntax': <Layout size={44} className="text-amber-500" />,
    'Mechanics & Punctuation': <PenTool size={44} className="text-rose-500" />,
    'Advanced Grammatical Concepts': <Zap size={44} className="text-purple-500" />,
    'Common Usage Pitfalls': <AlertCircle size={44} className="text-orange-500" />,
    'Pronunciation': <Mic size={44} className="text-cyan-500" />,
    'General': <BookOpen size={44} className="text-slate-500" />
};

const PLATFORM_COLORS: Record<Platform, string> = {
    YouTube: 'from-red-600 to-red-700',
    TikTok: 'from-zinc-900 via-zinc-800 to-black',
    Instagram: 'from-fuchsia-600 via-pink-600 to-orange-500',
    Facebook: 'from-blue-600 to-blue-700',
};

// ── Mini thumbnail ────────────────────────────────────────────────────────
function MiniThumb({ lesson, index }: { lesson: Lesson; index: number }) {
    const colorClass = lesson.platform
        ? PLATFORM_COLORS[lesson.platform]
        : TOPIC_COLORS[lesson.topic || 'General'] || TOPIC_COLORS['General'];

    const hasImage =
        lesson.thumbnail &&
        !lesson.thumbnail.includes('placeholder') &&
        !lesson.thumbnail.includes('picsum.photos');

    if (hasImage) {
        return (
            <img
                src={lesson.thumbnail}
                alt={lesson.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
            />
        );
    }

    const PIcon = () => {
        switch (lesson.platform) {
            case 'YouTube': return <PlayCircle size={18} fill="white" className="text-red-400" />;
            case 'TikTok': return <Zap size={18} fill="white" className="text-slate-800" />;
            case 'Instagram': return <Instagram size={18} className="text-white" />;
            default: return <BookOpen size={18} className="text-white" />;
        }
    };

    return (
        <div className={`w-full h-full bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
            <PIcon />
        </div>
    );
}

// ── Collapsible SubTopic section ──────────────────────────────────────────

interface LessonRowProps {
    lesson: Lesson;
    idx: number;
    onVideoClick: (id: string) => void;
    activeTab: 'lessons' | 'quizzes';
    hasQuizIds: Set<string>;
    completedIds: Set<string>;
    onStartQuiz: (lesson: Lesson) => void;
}

const LessonRow: React.FC<LessonRowProps> = ({ lesson, idx, onVideoClick, activeTab, hasQuizIds, completedIds, onStartQuiz }) => (
    <motion.div
        key={lesson.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: idx * 0.03 }}
        onClick={() => onVideoClick(lesson.id)}
        className="group flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-secondary/4 transition-colors"
    >
        {/* Index */}
        <span className="w-5 text-xs font-bold text-on-surface-variant/50 shrink-0 text-center group-hover:hidden">
            {idx + 1}
        </span>
        <span className="hidden group-hover:flex w-5 items-center justify-center shrink-0">
            <ChevronRight size={15} className="text-secondary" />
        </span>

        {/* Thumbnail */}
        <div className="w-24 aspect-video rounded-lg overflow-hidden bg-black shrink-0 relative shadow-sm">
            <MiniThumb lesson={lesson} index={idx} />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <PlayCircle size={20} className="text-white" fill="white" />
            </div>
            {hasQuizIds.has(lesson.id) && (
                <div className="absolute top-1 right-1 bg-secondary text-white text-[7px] font-black px-1 py-0.5 rounded uppercase flex items-center gap-0.5">
                    <Zap size={7} fill="currentColor" /> Quiz
                </div>
            )}
            {lesson.duration && (
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] px-1 rounded font-bold">
                    {lesson.duration}
                </div>
            )}
        </div>

        {/* Text */}
        <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-on-surface group-hover:text-secondary transition-colors line-clamp-1 leading-snug">
                    {lesson.title}
                </p>
                {completedIds.has(lesson.id) && (
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                )}
            </div>
            <p className="text-xs text-on-surface-variant opacity-60 mt-0.5 line-clamp-1">
                {lesson.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
                {lesson.platform && (
                    <span className="px-1.5 py-0.5 bg-black/5 rounded text-[8px] font-black uppercase text-on-surface-variant/70">
                        {lesson.platform}
                    </span>
                )}
                {lesson.created_at && (
                    <span className="text-[10px] text-on-surface-variant/50 flex items-center gap-1">
                        <Clock size={9} />
                        {new Date(lesson.created_at).toLocaleDateString()}
                    </span>
                )}
            </div>
        </div>

        {/* Quiz tab action */}
        {activeTab === 'quizzes' ? (
            completedIds.has(lesson.id) ? (
                <button
                    onClick={(e) => { e.stopPropagation(); onStartQuiz(lesson); }}
                    className="shrink-0 bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1"
                >
                    <CheckCircle size={11} />
                    Completed
                </button>
            ) : (
                <button
                    onClick={(e) => { e.stopPropagation(); onStartQuiz(lesson); }}
                    className="shrink-0 bg-secondary text-white text-xs font-black px-3 py-1.5 rounded-xl hover:bg-secondary-dim transition-all shadow-md shadow-secondary/20 flex items-center gap-1"
                >
                    <Zap size={11} />
                    Start
                </button>
            )
        ) : (
            <ChevronRight
                size={16}
                className="text-on-surface-variant/25 group-hover:text-secondary group-hover:translate-x-0.5 transition-all shrink-0"
            />
        )}
    </motion.div>
);

interface SubTopicSectionProps {
    subtopic: string;
    lessons: Lesson[];
    hasQuizIds: Set<string>;
    onVideoClick: (id: string) => void;
    activeTab: 'lessons' | 'quizzes';
    onStartQuiz: (lesson: Lesson) => void;
    defaultOpen: boolean;
    completedIds: Set<string>;
}

const SubSubTopicSection: React.FC<{ subsubtopic: string; lessons: Lesson[]; } & Omit<SubTopicSectionProps, 'subtopic' | 'defaultOpen'>> = ({
    subsubtopic, lessons, hasQuizIds, onVideoClick, activeTab, onStartQuiz, completedIds
}) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="bg-on-surface/2">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-on-surface/5 transition-colors border-b border-on-surface/5">
                <div className="flex items-center gap-2">
                    <ChevronRight size={14} className={`text-on-surface-variant transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
                    <span className="text-sm font-bold text-on-surface-variant capitalize">{subsubtopic}</span>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant/70 bg-on-surface/5 px-2 py-0.5 rounded-md">
                    {lessons.length} {lessons.length === 1 ? 'video' : 'videos'}
                </span>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="divide-y divide-on-surface/5 border-b border-on-surface/5 bg-white/50">
                            {lessons.map((lesson, idx) => (
                                <LessonRow key={lesson.id} lesson={lesson} idx={idx} onVideoClick={onVideoClick} activeTab={activeTab} hasQuizIds={hasQuizIds} completedIds={completedIds} onStartQuiz={onStartQuiz} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SubTopicSection: React.FC<SubTopicSectionProps> = ({
    subtopic, lessons, hasQuizIds, onVideoClick, activeTab, onStartQuiz, defaultOpen, completedIds
}) => {
    const [open, setOpen] = useState(defaultOpen);

    const { groups, ungrouped } = React.useMemo(() => {
        const _groups: Record<string, Lesson[]> = {};
        const _ungrouped: Lesson[] = [];
        lessons.forEach(l => {
            if (l.subsubtopic) {
                if (!_groups[l.subsubtopic]) _groups[l.subsubtopic] = [];
                _groups[l.subsubtopic].push(l);
            } else {
                _ungrouped.push(l);
            }
        });
        return { groups: _groups, ungrouped: _ungrouped };
    }, [lessons]);

    return (
        <div className="mb-2 rounded-2xl overflow-hidden border border-on-surface/6 bg-white">
            <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-on-surface/4 transition-colors">
                <div className="flex items-center gap-3">
                    <span className="text-base font-black text-on-surface capitalize">{subtopic}</span>
                    <span className="text-xs font-bold text-on-surface-variant bg-on-surface/6 px-2 py-0.5 rounded-full">
                        {lessons.length} {lessons.length === 1 ? 'video' : 'videos'}
                    </span>
                </div>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} className="text-on-surface-variant" />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }} className="overflow-hidden">
                        <div className="border-t border-on-surface/6">
                            {/* Grouped Sub-subtopics */}
                            {Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([sst, sstLessons]) => (
                                <SubSubTopicSection key={sst} subsubtopic={sst} lessons={sstLessons} hasQuizIds={hasQuizIds} onVideoClick={onVideoClick} activeTab={activeTab} completedIds={completedIds} onStartQuiz={onStartQuiz} />
                            ))}
                            {/* Ungrouped lessons */}
                            <div className="divide-y divide-on-surface/5">
                                {ungrouped.map((lesson, idx) => (
                                    <LessonRow key={lesson.id} lesson={lesson} idx={idx} onVideoClick={onVideoClick} activeTab={activeTab} hasQuizIds={hasQuizIds} completedIds={completedIds} onStartQuiz={onStartQuiz} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function TopicProfileView({
    topic,
    lessons,
    hasQuizIds,
    onBack,
    onVideoClick,
}: {
    topic: string;
    lessons: Lesson[];
    hasQuizIds: Set<string>;
    onBack: () => void;
    onVideoClick: (id: string) => void;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'lessons' | 'quizzes'>('lessons');
    const [quizLesson, setQuizLesson] = useState<Lesson | null>(null);
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

    // Filter Logic
    const allSubtopics = Array.from(new Set(lessons.map(l => {
        const t = l.subtopic || 'General';
        return t.replace(/\b\w/g, char => char.toUpperCase());
    }))).sort();
    const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>(allSubtopics);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [sortBy, setSortBy] = useState<'az' | 'za' | 'newest' | 'oldest'>('az');
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    useEffect(() => {
        // Reset subtopics when lessons change
        setSelectedSubtopics(allSubtopics);
    }, [lessons.length]);

    useEffect(() => {
        const loadCompleted = () => {
            const stored = localStorage.getItem('completed_quizzes');
            if (stored) {
                try {
                    setCompletedIds(new Set(JSON.parse(stored)));
                } catch (e) {
                    console.error('Error parsing completed quizzes', e);
                }
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

    // Filter by tab and search
    const visibleLessons = lessons.filter(
        (l) => {
            const sub = (l.subtopic || 'General').replace(/\b\w/g, char => char.toUpperCase());
            return (activeTab === 'quizzes' ? hasQuizIds.has(l.id) : true) &&
                selectedSubtopics.includes(sub) &&
                ((l.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (l.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (l.subtopic || '').toLowerCase().includes(searchQuery.toLowerCase()));
        }
    );

    // Group by subtopic
    const grouped: Record<string, Lesson[]> = {};
    for (const lesson of visibleLessons) {
        let t = lesson.subtopic || 'General';
        // Capitalize each word for cleaner presentation
        t = t.replace(/\b\w/g, char => char.toUpperCase());

        if (!grouped[t]) grouped[t] = [];
        grouped[t].push(lesson);
    }

    // Sort the subtopic keys
    const subtopics = Object.keys(grouped).sort((a, b) => {
        if (sortBy === 'az') return a.localeCompare(b);
        if (sortBy === 'za') return b.localeCompare(a);

        // Date sorting: find most recent/oldest date for each group
        const getLatest = (sub: string) => {
            const dates = grouped[sub].map(l => l.created_at ? new Date(l.created_at).getTime() : 0);
            return Math.max(...dates);
        };
        const getOldest = (sub: string) => {
            const dates = grouped[sub].map(l => l.created_at ? new Date(l.created_at).getTime() : Infinity);
            return Math.min(...dates);
        };

        if (sortBy === 'newest') return getLatest(b) - getLatest(a);
        if (sortBy === 'oldest') return getLatest(a) - getLatest(b);
        return 0;
    });

    // Also sort lessons WITHIN each group if date sorting is active
    if (sortBy === 'newest' || sortBy === 'oldest') {
        for (const sub of subtopics) {
            grouped[sub].sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
            });
        }
    }

    const quizCount = [...hasQuizIds].filter((id) => lessons.find((l) => l.id === id)).length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#f7f8fa] flex flex-col"
        >
            {/* ── Banner ─────────────────────────────────────────────────────── */}
            <div className={`h-36 md:h-64 w-full bg-gradient-to-br ${TOPIC_COLORS[topic] || TOPIC_COLORS['General']} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10" />
                <motion.button
                    whileHover={{ x: -4 }}
                    onClick={onBack}
                    className="absolute top-5 left-5 md:left-8 z-[60] flex items-center gap-2 text-white/80 hover:text-white transition-all group"
                >
                    <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-white/25 shadow-xl border border-white/10">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="hidden md:block text-sm font-bold drop-shadow">Back to Topics</span>
                </motion.button>
            </div>

            {/* ── Topic header ──────────────────────────────────────────────── */}
            <div className="max-w-3xl mx-auto w-full px-5 -mt-12 md:-mt-16 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-8 mb-10">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-white shadow-2xl p-5 md:p-6 flex items-center justify-center shrink-0 border-4 border-white">
                    {TOPIC_ICONS[topic] || TOPIC_ICONS['General']}
                </div>
                <div className="text-center md:text-left md:pt-16">
                    <h1 className="text-3xl md:text-5xl font-black text-on-surface leading-tight tracking-tight">
                        {topic}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                        <p className="text-sm md:text-base text-on-surface-variant font-medium bg-on-surface/5 px-4 py-1.5 rounded-full">
                            <span className="font-bold text-on-surface">{lessons.length}</span> {lessons.length === 1 ? 'lesson' : 'lessons'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Sticky tab + search bar ─────────────────────────────────────── */}
            <div className="sticky top-0 bg-[#f7f8fa]/95 backdrop-blur-xl border-b border-on-surface/6 z-20">
                <div className="max-w-3xl mx-auto px-5 flex items-center justify-between gap-3 py-3">
                    {/* Tabs */}
                    <div className="flex gap-5">
                        {(['lessons', 'quizzes'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-sm font-bold capitalize pb-0.5 border-b-2 transition-all ${activeTab === tab
                                    ? 'text-secondary border-secondary'
                                    : 'text-on-surface-variant border-transparent hover:text-on-surface'
                                    }`}
                            >
                                {tab}
                                {tab === 'quizzes' && quizCount > 0 && (
                                    <span className="ml-1.5 bg-secondary/10 text-secondary text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                        {quizCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search & Filter */}
                    <div className="flex items-center gap-2">
                        {/* Sort Toggle */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                className={`p-2 rounded-xl border transition-all flex items-center gap-2 ${showSortDropdown
                                    ? 'bg-secondary/10 border-secondary text-secondary'
                                    : 'bg-white border-on-surface/8 text-on-surface-variant hover:border-on-surface/20'
                                    }`}
                                title="Sort order"
                            >
                                <ArrowUpDown size={18} />
                            </button>

                            {/* Sort Dropdown */}
                            <AnimatePresence>
                                {showSortDropdown && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-30"
                                            onClick={() => setShowSortDropdown(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-on-surface/8 p-2 z-40 overflow-hidden"
                                        >
                                            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 mb-2 px-2 pt-1">Sort By</div>
                                            {[
                                                { id: 'az', label: 'Alphabetical: A-Z' },
                                                { id: 'za', label: 'Alphabetical: Z-A' },
                                                { id: 'newest', label: 'Newest First' },
                                                { id: 'oldest', label: 'Oldest First' },
                                            ].map(option => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => {
                                                        setSortBy(option.id as any);
                                                        setShowSortDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${sortBy === option.id
                                                        ? 'bg-secondary text-white'
                                                        : 'text-on-surface hover:bg-on-surface/4'
                                                        }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Filter Toggle */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className={`p-2 rounded-xl border transition-all flex items-center gap-2 ${showFilterDropdown || selectedSubtopics.length < allSubtopics.length
                                    ? 'bg-secondary/10 border-secondary text-secondary'
                                    : 'bg-white border-on-surface/8 text-on-surface-variant hover:border-on-surface/20'
                                    }`}
                                title="Filter subtopics"
                            >
                                <Filter size={18} />
                                {selectedSubtopics.length < allSubtopics.length && (
                                    <span className="text-[10px] font-bold bg-secondary text-white w-4 h-4 rounded-full flex items-center justify-center">
                                        {selectedSubtopics.length}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown */}
                            <AnimatePresence>
                                {showFilterDropdown && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-30"
                                            onClick={() => setShowFilterDropdown(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-on-surface/8 p-3 z-40 overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between mb-2 px-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Subtopics</span>
                                                <button
                                                    onClick={() => setSelectedSubtopics(selectedSubtopics.length === allSubtopics.length ? [] : allSubtopics)}
                                                    className="text-[10px] font-bold text-secondary hover:underline"
                                                >
                                                    {selectedSubtopics.length === allSubtopics.length ? 'Clear All' : 'Select All'}
                                                </button>
                                            </div>
                                            <div className="space-y-1 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                                {allSubtopics.map(sub => (
                                                    <label
                                                        key={sub}
                                                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-on-surface/4 cursor-pointer transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSubtopics.includes(sub)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedSubtopics([...selectedSubtopics, sub]);
                                                                } else {
                                                                    setSelectedSubtopics(selectedSubtopics.filter(s => s !== sub));
                                                                }
                                                            }}
                                                            className="w-4 h-4 rounded border-on-surface/20 text-secondary focus:ring-secondary/20"
                                                        />
                                                        <span className="text-sm font-medium text-on-surface capitalize">{sub}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={14} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white border border-on-surface/8 rounded-xl py-2 pl-8 pr-3 text-on-surface text-sm w-44 focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Accordion list ──────────────────────────────────────────────── */}
            <div className="max-w-3xl mx-auto w-full px-4 md:px-5 pt-5 pb-24">
                {subtopics.length > 0 ? (
                    subtopics.map((t, i) => (
                        <SubTopicSection
                            key={t}
                            subtopic={t}
                            lessons={grouped[t]}
                            hasQuizIds={hasQuizIds}
                            onVideoClick={onVideoClick}
                            activeTab={activeTab}
                            onStartQuiz={(l) => setQuizLesson(l)}
                            defaultOpen={i === 0}
                            completedIds={completedIds}
                        />
                    ))
                ) : (
                    <div className="py-28 flex flex-col items-center justify-center text-on-surface-variant opacity-40">
                        <Search size={52} className="mb-4" />
                        <p className="text-lg font-black">No {activeTab} found</p>
                        <p className="text-sm mt-1">Try a different search term</p>
                    </div>
                )}
            </div>

            {/* ── Quiz Player overlay ──────────────────────────────────────────── */}
            <AnimatePresence>
                {quizLesson && (
                    <QuizPlayer
                        lessonId={quizLesson.id}
                        lessonTitle={quizLesson.title}
                        onClose={() => setQuizLesson(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
