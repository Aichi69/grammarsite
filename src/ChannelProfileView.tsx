import React, { useState } from 'react';
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
    subsubtopic?: string;
    videoUrl?: string;
    created_at?: string;
}

// ── Platform theme ────────────────────────────────────────────────────────
const bannerGradients: Record<Platform, string> = {
    YouTube: 'from-red-600 to-red-800',
    TikTok: 'from-zinc-900 to-black',
    Instagram: 'from-purple-600 via-pink-600 to-orange-500',
    Facebook: 'from-blue-600 to-blue-800',
};

const platformIcons: Record<Platform, React.ReactNode> = {
    YouTube: <PlayCircle size={44} fill="white" className="text-red-500" />,
    TikTok: <Zap size={44} fill="white" className="text-black" />,
    Instagram: <Instagram size={44} className="text-white" />,
    Facebook: <Users size={44} className="text-white" />,
};

const PLATFORM_COLORS: Record<Platform, string> = {
    YouTube: 'from-red-600 to-red-700',
    TikTok: 'from-zinc-900 via-zinc-800 to-black',
    Instagram: 'from-fuchsia-600 via-pink-600 to-orange-500',
    Facebook: 'from-blue-600 to-blue-700',
};

const TOPIC_COLORS: Record<string, string> = {
    Grammar: 'from-indigo-600 to-purple-600',
    Vocabulary: 'from-emerald-500 to-teal-600',
    Pronunciation: 'from-amber-400 to-orange-500',
    Writing: 'from-rose-500 to-pink-600',
    General: 'from-slate-600 to-slate-800',
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

// ── Collapsible topic section ──────────────────────────────────────────
interface TopicSectionProps {
    topic: string;
    lessons: Lesson[];
    hasQuizIds: Set<string>;
    onVideoClick: (id: string) => void;
    activeTab: 'lessons' | 'quizzes';
    onStartQuiz: (lesson: Lesson) => void;
    defaultOpen: boolean;
}

const TopicSection: React.FC<TopicSectionProps> = ({
    topic,
    lessons,
    hasQuizIds,
    onVideoClick,
    activeTab,
    onStartQuiz,
    defaultOpen,
}) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="mb-2 rounded-2xl overflow-hidden border border-on-surface/6 bg-white">
            {/* Category header */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-on-surface/4 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-base font-black text-on-surface">{topic}</span>
                    <span className="text-xs font-bold text-on-surface-variant bg-on-surface/6 px-2 py-0.5 rounded-full">
                        {lessons.length} {lessons.length === 1 ? 'video' : 'videos'}
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={18} className="text-on-surface-variant" />
                </motion.div>
            </button>

            {/* Lesson rows */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-on-surface/6 divide-y divide-on-surface/5">
                            {lessons.map((lesson, idx) => (
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
                                        <p className="text-sm font-semibold text-on-surface group-hover:text-secondary transition-colors line-clamp-1 leading-snug">
                                            {lesson.title}
                                        </p>
                                        <p className="text-xs text-on-surface-variant opacity-60 mt-0.5 line-clamp-1">
                                            {lesson.description}
                                        </p>
                                        {lesson.created_at && (
                                            <p className="text-[10px] text-on-surface-variant/50 mt-0.5 flex items-center gap-1">
                                                <Clock size={9} />
                                                {new Date(lesson.created_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>

                                    {/* Quiz tab action */}
                                    {activeTab === 'quizzes' ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onStartQuiz(lesson); }}
                                            className="shrink-0 bg-secondary text-white text-xs font-black px-3 py-1.5 rounded-xl hover:bg-secondary-dim transition-all shadow-md shadow-secondary/20 flex items-center gap-1"
                                        >
                                            <Zap size={11} />
                                            Start
                                        </button>
                                    ) : (
                                        <ChevronRight
                                            size={16}
                                            className="text-on-surface-variant/25 group-hover:text-secondary group-hover:translate-x-0.5 transition-all shrink-0"
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function ChannelProfileView({
    platform,
    lessons,
    hasQuizIds,
    onBack,
    onVideoClick,
}: {
    platform: Platform;
    lessons: Lesson[];
    hasQuizIds: Set<string>;
    onBack: () => void;
    onVideoClick: (id: string) => void;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'lessons' | 'quizzes'>('lessons');
    const [quizLesson, setQuizLesson] = useState<Lesson | null>(null);

    // Filter by tab and search
    const visibleLessons = lessons.filter(
        (l) =>
            (activeTab === 'quizzes' ? hasQuizIds.has(l.id) : true) &&
            (l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (l.topic || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Group by topic
    const grouped: Record<string, Lesson[]> = {};
    for (const lesson of visibleLessons) {
        const t = lesson.topic || 'General';
        if (!grouped[t]) grouped[t] = [];
        grouped[t].push(lesson);
    }
    const topics = Object.keys(grouped).sort();

    const quizCount = [...hasQuizIds].filter((id) => lessons.find((l) => l.id === id)).length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#f7f8fa] flex flex-col"
        >
            {/* ── Banner ─────────────────────────────────────────────────────── */}
            <div className={`h-36 md:h-48 w-full bg-gradient-to-br ${bannerGradients[platform]} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10" />
                <motion.button
                    whileHover={{ x: -4 }}
                    onClick={onBack}
                    className="absolute top-5 left-5 md:left-8 z-[60] flex items-center gap-2 text-white/80 hover:text-white transition-all group"
                >
                    <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-white/25 shadow-xl border border-white/10">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="hidden md:block text-sm font-bold drop-shadow">Back to Channels</span>
                </motion.button>
            </div>

            {/* ── Channel header ──────────────────────────────────────────────── */}
            <div className="max-w-3xl mx-auto w-full px-5 -mt-10 relative z-10 flex items-end gap-4 mb-6">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] bg-white shadow-2xl p-4 flex items-center justify-center shrink-0">
                    {platformIcons[platform]}
                </div>
                <div className="pb-1">
                    <h1 className="text-2xl md:text-3xl font-black text-on-surface">
                        {platform} <span className="text-secondary">Academy</span>
                    </h1>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                        @{platform.toLowerCase()}_grammar · <span className="font-semibold">{lessons.length}</span> lesson{lessons.length !== 1 ? 's' : ''}
                    </p>
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

                    {/* Search */}
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

            {/* ── Accordion list ──────────────────────────────────────────────── */}
            <div className="max-w-3xl mx-auto w-full px-4 md:px-5 pt-5 pb-24">
                {topics.length > 0 ? (
                    topics.map((t, i) => (
                        <TopicSection
                            key={t}
                            topic={t}
                            lessons={grouped[t]}
                            hasQuizIds={hasQuizIds}
                            onVideoClick={onVideoClick}
                            activeTab={activeTab}
                            onStartQuiz={(l) => setQuizLesson(l)}
                            defaultOpen={i === 0}
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
