import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QuizBuilder } from './Quiz';
import {
    BookOpen,
    PlayCircle,
    Zap,
    Plus,
    Edit,
    Trash2,
    LogOut,
    Save,
    X,
    Link as LinkIcon,
} from 'lucide-react';

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

// ── Shared helpers ────────────────────────────────────────────────────────

export function getThumbnailFromUrl(url: string): string | null {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        if (url.includes('/shorts/')) {
            const videoId = url.split('/shorts/')[1]?.split(/[?#]/)[0];
            if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
        const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
        if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    return null;
}

// Inline thumbnail so we don't need to import from App
const PLATFORM_COLORS: Record<Platform, string> = {
    YouTube: 'from-red-600 to-red-700',
    TikTok: 'from-zinc-900 via-zinc-800 to-black',
    Instagram: 'from-fuchsia-600 via-pink-600 to-orange-500',
    Facebook: 'from-blue-600 to-blue-700',
};
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

const TOPIC_OPTIONS = [
    'Parts of Speech',
    'Verb Tenses & Aspects',
    'Sentence Structure & Syntax',
    'Mechanics & Punctuation',
    'Advanced Grammatical Concepts',
    'Common Usage Pitfalls',
    'Pronunciation'
];

function LessonThumb({ lesson, index, className }: { lesson: Lesson; index?: number; className?: string }) {
    const colorClass = lesson.platform
        ? PLATFORM_COLORS[lesson.platform]
        : TOPIC_COLORS[lesson.topic || 'General'] || TOPIC_COLORS['General'];
    const hasImage =
        lesson.thumbnail &&
        !lesson.thumbnail.includes('placeholder') &&
        !lesson.thumbnail.includes('picsum.photos');

    const PlatformLogo = () => {
        switch (lesson.platform) {
            case 'YouTube': return <PlayCircle size={32} fill="white" className="text-red-500" />;
            case 'TikTok': return <Zap size={32} fill="white" className="text-black" />;
            default: return <PlayCircle size={32} className="text-white" />;
        }
    };

    if (hasImage) {
        return (
            <div className={`${className} bg-black flex items-center justify-center overflow-hidden`}>
                <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
        );
    }
    return (
        <div className={`${className} bg-gradient-to-br ${colorClass} flex flex-col items-center justify-center p-6 text-white overflow-hidden relative`}>
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl mb-4 shadow-xl border border-white/30">
                <PlatformLogo />
            </div>
            <div className="text-center z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 block mb-1">{lesson.platform} Lesson</span>
                <span className="text-2xl font-black">#{index !== undefined ? index + 1 : lesson.id.slice(-4)}</span>
            </div>
        </div>
    );
}

// ── Creator Login ─────────────────────────────────────────────────────────

export function CreatorLogin({ onLogin }: { onLogin: () => void }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'admin' && password === 'creator123') {
            onLogin();
        } else {
            setError('Invalid credentials. Try admin / creator123');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-container-low p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-on-surface/5"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4">
                        <Zap className="text-secondary" size={32} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-on-surface">Creator Hub</h2>
                    <p className="text-on-surface-variant text-sm mt-2">Sign in to manage your lessons</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-on-surface mb-2 ml-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all"
                            placeholder="admin"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-on-surface mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20"
                    >
                        Enter Dashboard
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

// ── Creator Dashboard ─────────────────────────────────────────────────────

export function CreatorDashboard({
    lessons,
    onSave,
    onDelete,
    hasQuizIds,
    onQuizSaved,
    onLogout,
}: {
    lessons: Lesson[];
    onSave: (l: Lesson[]) => void;
    onDelete: (id: string) => void;
    hasQuizIds: Set<string>;
    onQuizSaved: () => void;
    onLogout: () => void;
}) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [quizLessonId, setQuizLessonId] = useState<{ id: string; title: string } | null>(null);
    const [formData, setFormData] = useState<Partial<Lesson>>({
        title: '',
        description: '',
        platform: 'YouTube',
        topic: 'Parts of Speech',
        subtopic: '',
        subsubtopic: '',
        thumbnail: '',
        videoUrl: '',
    });

    const handleVideoUrlChange = async (url: string) => {
        const autoThumb = getThumbnailFromUrl(url);
        setFormData((prev) => ({
            ...prev,
            videoUrl: url,
            thumbnail: autoThumb || prev.thumbnail || '',
        }));
        if (url.includes('tiktok.com') && url.length > 20) {
            try {
                const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.thumbnail_url) setFormData((prev) => ({ ...prev, thumbnail: data.thumbnail_url }));
                }
            } catch (e) {
                console.warn('TikTok thumbnail fetch failed:', e);
            }
        }
    };

    const previewThumbnail = formData.thumbnail || getThumbnailFromUrl(formData.videoUrl || '') || null;

    const handleAdd = () => {
        const autoThumb = getThumbnailFromUrl(formData.videoUrl || '');
        const existingLesson = editingId ? lessons.find((l) => l.id === editingId) : {};

        // Auto-format subtopic: trim whitespace and capitalize each word
        const formattedSubtopic = (formData.subtopic || 'General')
            .trim()
            .replace(/\b\w/g, c => c.toUpperCase());
        const formattedSubsubtopic = formData.subsubtopic
            ? formData.subsubtopic.trim().replace(/\b\w/g, c => c.toUpperCase())
            : undefined;

        const newLesson: Lesson = {
            ...existingLesson,
            id: editingId || Date.now().toString() + Math.random().toString(36).substring(2, 9),
            title: (formData.title || 'Untitled Lesson').trim(),
            description: (formData.description || '').trim(),
            platform: (formData.platform as Platform) || 'YouTube',
            topic: formData.topic || 'Parts of Speech',
            subtopic: formattedSubtopic,
            subsubtopic: formattedSubsubtopic,
            thumbnail: formData.thumbnail || autoThumb || `https://picsum.photos/seed/${Date.now()}/1200/600`,
            videoUrl: formData.videoUrl || '',
            tag: (existingLesson as any)?.tag || 'NEW',
            created_at: (existingLesson as any)?.created_at || new Date().toISOString(),
        };
        if (editingId) {
            onSave(lessons.map((l) => (l.id === editingId ? newLesson : l)));
        } else {
            onSave([newLesson, ...lessons]);
        }
        resetForm();
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', platform: 'YouTube', topic: 'Parts of Speech', subtopic: '', subsubtopic: '', thumbnail: '', videoUrl: '' });
        setIsAdding(false);
        setEditingId(null);
    };

    const startEdit = (lesson: Lesson) => {
        setFormData(lesson);
        setEditingId(lesson.id);
        setIsAdding(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this lesson?')) onDelete(id);
    };

    return (
        <div className="min-h-screen bg-surface-container-low flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-on-surface/5 py-4 px-8 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <BookOpen className="text-secondary w-8 h-8" />
                    <h1 className="text-xl font-extrabold text-on-surface tracking-tight">Creator Dashboard</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-secondary text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20"
                    >
                        <Plus size={18} />
                        Add Content
                    </button>
                    <button
                        onClick={onLogout}
                        className="text-on-surface-variant hover:text-red-500 transition-colors p-2"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Lesson grid */}
            <main className="flex-grow p-8 max-w-6xl mx-auto w-full">
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-on-surface mb-2">My Content</h2>
                    <p className="text-on-surface-variant">Manage your fluid grammar lessons across all platforms.</p>
                </div>

                {(() => {
                    const groupedLessons: Record<string, Lesson[]> = {};
                    for (const lesson of lessons) {
                        const t = lesson.topic || 'General';
                        if (!groupedLessons[t]) groupedLessons[t] = [];
                        groupedLessons[t].push(lesson);
                    }
                    const topicsWithLessons = Object.keys(groupedLessons).sort();

                    if (topicsWithLessons.length === 0 && !isAdding) {
                        return (
                            <div className="py-20 flex flex-col items-center justify-center text-on-surface-variant opacity-50">
                                <PlayCircle size={64} className="mb-4" />
                                <p className="text-xl font-bold">No content yet. Click "Add Content" to start.</p>
                            </div>
                        );
                    }

                    return topicsWithLessons.map(t => (
                        <div key={t} className="mb-12">
                            <h3 className="text-2xl font-bold text-on-surface mb-4 flex items-center gap-3">
                                {t}
                                <span className="text-sm font-bold bg-white shadow-sm px-3 py-1 rounded-full text-on-surface-variant">
                                    {groupedLessons[t].length} lessons
                                </span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {groupedLessons[t].map((lesson, idx) => (
                                        <motion.div
                                            key={lesson.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="bg-white rounded-3xl overflow-hidden shadow-xl border border-on-surface/5 group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                                        >
                                            <div className="aspect-video relative overflow-hidden">
                                                <LessonThumb lesson={lesson} index={lessons.length - idx - 1} className="w-full h-full object-cover" />
                                                <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                                                    {lesson.platform}
                                                </div>
                                                <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 ${hasQuizIds.has(lesson.id)
                                                    ? 'bg-amber-400 text-amber-950 shadow-lg shadow-amber-400/20'
                                                    : 'bg-black/40 backdrop-blur-md text-white/50'
                                                    }`}>
                                                    <Zap size={10} fill={hasQuizIds.has(lesson.id) ? 'currentColor' : 'none'} />
                                                    {hasQuizIds.has(lesson.id) ? 'Active' : 'Missing Quiz'}
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-on-surface mb-2 line-clamp-1">{lesson.title}</h3>
                                                <p className="text-on-surface-variant text-sm mb-6 line-clamp-2">{lesson.description}</p>
                                                <div className="flex justify-between items-center pt-4 border-t border-on-surface/5">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-secondary uppercase tracking-widest leading-tight">{lesson.topic}</span>
                                                        {lesson.subtopic && <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{lesson.subtopic}</span>}
                                                        {lesson.subsubtopic && <span className="text-[9px] font-bold text-on-surface-variant/70 uppercase tracking-widest">{lesson.subsubtopic}</span>}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setQuizLessonId({ id: lesson.id, title: lesson.title })}
                                                            className="p-2 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-tertiary-container hover:text-on-tertiary-container transition-all"
                                                            title="Edit Quiz"
                                                        >
                                                            <Zap size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => startEdit(lesson)}
                                                            className="p-2 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-secondary hover:text-white transition-all"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(lesson.id)}
                                                            className="p-2 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-red-500 hover:text-white transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ));
                })()}
            </main>

            {/* Add / Edit modal */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={resetForm}
                            className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-on-surface/5 flex justify-between items-center">
                                <h3 className="text-2xl font-black text-on-surface">{editingId ? 'Edit Lesson' : 'Add New Lesson'}</h3>
                                <button onClick={resetForm} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-on-surface mb-2">Lesson Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all"
                                            placeholder="e.g. Mastering the Present Perfect"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-on-surface mb-2">Platform</label>
                                        <select
                                            value={formData.platform}
                                            onChange={(e) => setFormData({ ...formData, platform: e.target.value as Platform })}
                                            className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all appearance-none"
                                        >
                                            <option value="YouTube">YouTube</option>
                                            <option value="TikTok">TikTok</option>
                                            <option value="Instagram">Instagram</option>
                                            <option value="Facebook">Facebook</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-on-surface mb-2">Main Topic</label>
                                        <select
                                            value={formData.topic}
                                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                            className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all appearance-none"
                                        >
                                            {TOPIC_OPTIONS.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-on-surface mb-2">Sub-Topic</label>
                                        <input
                                            type="text"
                                            list="subtopic-suggestions"
                                            value={formData.subtopic || ''}
                                            onChange={(e) => setFormData({ ...formData, subtopic: e.target.value })}
                                            className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all"
                                            placeholder="e.g. Present Perfect"
                                        />
                                        <datalist id="subtopic-suggestions">
                                            {Array.from(new Set(lessons.filter(l => l.topic === formData.topic && l.subtopic).map(l => l.subtopic as string))).sort().map(st => (
                                                <option key={st} value={st} />
                                            ))}
                                        </datalist>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-on-surface mb-2">Sub-subtopic <span className="text-on-surface-variant/60 font-normal">(optional)</span></label>
                                        <input
                                            type="text"
                                            list="subsubtopic-suggestions"
                                            value={formData.subsubtopic || ''}
                                            onChange={(e) => setFormData({ ...formData, subsubtopic: e.target.value })}
                                            className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all"
                                            placeholder="e.g. Types of Verb"
                                        />
                                        <datalist id="subsubtopic-suggestions">
                                            {Array.from(new Set(lessons.filter(l => l.topic === formData.topic && l.subtopic === formData.subtopic && l.subsubtopic).map(l => l.subsubtopic as string))).sort().map(st => (
                                                <option key={st} value={st} />
                                            ))}
                                        </datalist>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-on-surface mb-2">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all h-32 resize-none"
                                            placeholder="Describe the lesson content..."
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-on-surface mb-2">Video Link / Embed URL</label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                                            <input
                                                type="text"
                                                value={formData.videoUrl}
                                                onChange={(e) => handleVideoUrlChange(e.target.value)}
                                                className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-14 pr-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all"
                                                placeholder="https://youtube.com/..."
                                            />
                                        </div>
                                        {previewThumbnail ? (
                                            <div className="mt-4 relative rounded-2xl overflow-hidden aspect-video bg-surface-container-low">
                                                <img
                                                    src={previewThumbnail}
                                                    alt="Thumbnail preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full">PREVIEW</div>
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-on-surface-variant mt-2 ml-2 italic">Paste a YouTube URL to auto-generate the thumbnail.</p>
                                        )}
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-on-surface mb-2">
                                            Custom Thumbnail URL <span className="font-normal text-on-surface-variant">(optional override)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.thumbnail}
                                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                            className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-on-surface/5 flex gap-4">
                                <button
                                    onClick={resetForm}
                                    className="flex-1 bg-surface-container-low text-on-surface-variant py-4 rounded-2xl font-bold hover:bg-on-surface/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    className="flex-1 bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                                >
                                    <Save size={20} />
                                    {editingId ? 'Update Lesson' : 'Publish Lesson'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Quiz Builder */}
            <AnimatePresence>
                {quizLessonId && (
                    <QuizBuilder
                        lessonId={quizLessonId.id}
                        lessonTitle={quizLessonId.title}
                        onClose={() => { setQuizLessonId(null); onQuizSaved(); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
