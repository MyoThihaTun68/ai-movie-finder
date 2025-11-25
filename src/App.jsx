import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2, MessageSquare, Grid } from 'lucide-react';
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

  // New State for Mobile View Management ('chat' or 'results')
  const [mobileView, setMobileView] = useState('chat');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, mobileView]); // Scroll when view changes too

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    const currentQuery = query;
    setQuery('');
    setLoading(true);

    // On mobile, keep user on chat view while loading to see the "Thinking..." state
    if (window.innerWidth < 768) {
      setMobileView('chat');
    }

    try {
      const data = await searchMovies(currentQuery);
      const movies = findRecommendations(data) || [];

      if (!movies.length) {
        setMessages(prev => [...prev, { role: 'assistant', content: "I couldn't find any movies matching that. Could you try being more specific?" }]);
      } else {
        setResults(movies);
        setMessages(prev => [...prev, { role: 'assistant', content: `I found ${movies.length} recommendations for you based on "${currentQuery}".` }]);

        // Auto-switch to results view on mobile when data arrives
        if (window.innerWidth < 768) {
          setMobileView('results');
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I ran into an error connecting to the server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0B0C15] text-slate-100 font-sans overflow-hidden relative">

      {/* LEFT SIDEBAR - CHAT */}
      {/* Logic: Hidden on mobile IF mobileView is 'results'. Always flex on desktop (md:flex). */}
      <div className={`
        flex-col border-r border-white/5 bg-[#11121C] relative z-10 transition-all duration-300
        w-full md:w-[400px] md:flex
        ${mobileView === 'results' ? 'hidden' : 'flex'}
      `}>
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/5">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold text-lg tracking-wide">AI Recommender</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-24 md:pb-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                {msg.role === 'assistant' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[85%] p-3 md:p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'assistant'
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
        {/* Added extra bottom padding on mobile for the navigation bar */}
        <div className="p-4 md:p-6 border-t border-white/5 bg-[#11121C] mb-14 md:mb-0">
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
      {/* Logic: Hidden on mobile IF mobileView is 'chat'. Always flex on desktop (md:flex). */}
      <div className={`
        flex-grow flex-col bg-[#0B0C15] relative overflow-hidden transition-all duration-300
        md:flex
        ${mobileView === 'chat' ? 'hidden' : 'flex'}
      `}>
        {/* Background Glow - Adjusted size for mobile */}
        <div className="absolute top-[-20%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-600/10 blur-[80px] md:blur-[120px] rounded-full pointer-events-none"></div>

        {/* Header / Filters */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between z-10 gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-white">Recommendations</h2>

          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex bg-[#1A1B26] rounded-lg p-1 whitespace-nowrap w-max">
              {['Action', 'Drama', 'Thriller', 'Comedy', 'Sci-Fi'].map(genre => (
                <button key={genre} className="px-3 md:px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-grow overflow-y-auto p-4 md:p-8 pt-0 z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-20 md:pb-8">
          {results ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {results.map((movie, index) => (
                <MovieCard key={index} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-40">
              <Grid className="w-12 h-12 md:w-16 md:h-16 mb-4" />
              <p className="text-sm md:text-base">Start a chat to get recommendations</p>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {/* Only visible on mobile (md:hidden) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#11121C] border-t border-white/5 flex items-center justify-around z-50 pb-safe">
        <button
          onClick={() => setMobileView('chat')}
          className={`flex flex-col items-center gap-1 p-2 ${mobileView === 'chat' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium">Chat</span>
        </button>

        <button
          onClick={() => setMobileView('results')}
          className={`flex flex-col items-center gap-1 p-2 ${mobileView === 'results' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <div className="relative">
            <Grid className="w-5 h-5" />
            {results && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border border-[#11121C]"></span>
            )}
          </div>
          <span className="text-[10px] font-medium">Results</span>
        </button>
      </div>

    </div>
  );
}