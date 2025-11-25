import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import MovieCard from './components/MovieCard';
import { searchMovies } from './services/api';
import { findRecommendations } from './utils/helpers';

export default function App() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! What are you in the mood for today? Tell me about a movie or series you like, and I'll find your next favorite." }
  ]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    const currentQuery = query;
    setQuery('');
    setLoading(true);

    try {
      const data = await searchMovies(currentQuery);
      const movies = findRecommendations(data) || [];

      if (!movies.length) {
        setMessages(prev => [...prev, { role: 'assistant', content: "I couldn't find any movies matching that. Could you try being more specific?" }]);
      } else {
        setResults(movies);
        setMessages(prev => [...prev, { role: 'assistant', content: `I found ${movies.length} recommendations for you based on "${currentQuery}".` }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I ran into an error connecting to the server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0B0C15] text-slate-100 font-sans overflow-hidden">

      {/* LEFT SIDEBAR - CHAT */}
      <div className="w-[400px] flex flex-col border-r border-white/5 bg-[#11121C] relative z-10">
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold text-lg tracking-wide">AI Movie/TV Series Recommender</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                {msg.role === 'assistant' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'assistant'
                ? 'bg-[#1A1B26] text-slate-300 rounded-tl-none'
                : 'bg-indigo-600 text-white rounded-tr-none'
                }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-[#1A1B26] p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-xs text-slate-400">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/5 bg-[#11121C]">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find me a sci-fi movie..."
              className="w-full bg-[#1A1B26] text-white placeholder-slate-500 rounded-xl py-4 pl-4 pr-12 border border-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT MAIN CONTENT - RESULTS */}
      <div className="flex-grow flex flex-col bg-[#0B0C15] relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Header / Filters */}
        <div className="p-8 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white">Here are some recommendations for you</h2>

          <div className="flex items-center gap-4">
            <div className="flex bg-[#1A1B26] rounded-lg p-1">
              {['Action', 'Drama', 'Thriller', 'School'].map(genre => (
                <button key={genre} className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-grow overflow-y-auto p-8 pt-0 z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {results ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((movie, index) => (
                <MovieCard key={index} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-40">
              <Sparkles className="w-16 h-16 mb-4" />
              <p>Start a chat to get recommendations</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
