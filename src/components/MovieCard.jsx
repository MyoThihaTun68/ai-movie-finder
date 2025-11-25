import React, { useState } from 'react';
import { Search, Copy, Check } from 'lucide-react';

export default function MovieCard({ movie }) {
    const { title, description, release_year, genres = [], source, country } = movie;
    const [copied, setCopied] = useState(false);

    const displayTitle = title || "Unknown Title";
    const year = release_year || "N/A";
    const displayCountry = country || "N/A";

    // Generate a consistent "AI Score" based on title length for demo purposes
    const aiScore = 80 + (displayTitle.length % 15);

    // Generate a deterministic gradient based on the title
    const getGradient = (str) => {
        const hash = str.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        const hues = [
            'from-purple-500 to-indigo-900',
            'from-blue-500 to-slate-900',
            'from-emerald-500 to-teal-900',
            'from-rose-500 to-pink-900',
            'from-amber-500 to-orange-900',
            'from-cyan-500 to-blue-900',
        ];
        return hues[hash % hues.length];
    };

    const gradientClass = getGradient(displayTitle);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(displayTitle);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGoogleSearch = () => {
        const query = encodeURIComponent(`${displayTitle} ${year} movie`);
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
    };

    return (
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg border border-slate-700/50 bg-slate-800 flex flex-col group">

            {/* Poster Background (Gradient) */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-60`}></div>

            {/* Texture Overlay */}
            <div className="absolute inset-0 bg-white/5 mix-blend-overlay"></div>

            {/* Source Badge */}
            {source && (
                <div className="absolute top-4 right-4 z-20">
                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-black/40 backdrop-blur-md border border-white/10 rounded-md shadow-sm">
                        {source}
                    </span>
                </div>
            )}

            {/* Content Container */}
            <div className="absolute inset-0 p-5 flex flex-col justify-end bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">

                {/* Title & Copy Row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                        className="text-lg font-bold text-white leading-tight drop-shadow-md cursor-pointer hover:text-indigo-300 transition-colors"
                        onClick={handleCopy}
                        title="Click to copy title"
                    >
                        {displayTitle}
                    </h3>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-all shrink-0"
                        title="Copy Title"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300 mb-3 opacity-90">
                    <span>{year}</span>
                    <span>•</span>
                    <span>{displayCountry}</span>
                    <span className="ml-auto text-indigo-400 font-bold">{aiScore}% Match</span>
                </div>

                {/* Description */}
                {description && (
                    <p className="text-xs text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                        {description}
                    </p>
                )}

                {/* Genres */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {genres.slice(0, 3).map((g, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 bg-white/5 text-slate-300 rounded border border-white/5">
                            {g}
                        </span>
                    ))}
                </div>

                {/* Google Search Button */}
                <button
                    onClick={handleGoogleSearch}
                    className="mt-auto w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                >
                    <Search className="w-4 h-4" />
                    Google Search
                </button>
            </div>
        </div>
    );
}