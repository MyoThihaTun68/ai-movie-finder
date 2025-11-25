import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2, MessageSquare, Grid, Mic, MicOff, Volume2, StopCircle } from 'lucide-react';
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
  const [mobileView, setMobileView] = useState('chat');

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, mobileView]);

  // --- FEATURE 1: SPEECH TO TEXT (Voice Input) ---
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Try Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.start();
  };

  // --- FEATURE 2: TEXT TO SPEECH (Voice Output) ---
  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      // If currently speaking, stop it
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported in this browser.");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Stop speaking if user sends new message
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    const currentQuery = query;
    setQuery('');
    setLoading(true);

    if (window.innerWidth < 768) {
      setMobileView('chat');
    }

    try {
      const data = await searchMovies(currentQuery);
      const movies = findRecommendations(data) || [];

      if (!movies.length) {
        const reply = "I couldn't find any movies matching that. Could you try being more specific?";
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        handleSpeak(reply); // Auto-read error
      } else {
        setResults(movies);
        const reply = `I found ${movies.length} recommendations for you based on "${currentQuery}".`;
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        handleSpeak(reply); // Auto-read success

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
      <div className={`
        flex-col border-r border-white/5 bg-[#11121C] relative z-10 transition-all duration-300
        w-full md:w-[400px] md:flex
        ${mobileView === 'results' ? 'hidden' : 'flex'}
      `}>
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold text-lg tracking-wide">AI Recommender</span>
          </div>
          {/* Global Stop Speaking Button */}
          {isSpeaking && (
            <button onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); }} className="text-red-400 hover:text-red-300 animate-pulse">
              <StopCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-24 md:pb-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                {msg.role === 'assistant' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
              </div>

              <div className={`max-w-[85%] group relative p-3 md:p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'assistant'
                ? 'bg-[#1A1B26] text-slate-300 rounded-tl-none'
                : 'bg-indigo-600 text-white rounded-tr-none'
                }`}>
                {msg.content}

                {/* Speaker Button on Assistant Messages */}
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleSpeak(msg.content)}
                    className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-500 hover:text-indigo-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                    title="Read aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
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
        <div className="p-4 md:p-6 border-t border-white/5 bg-[#11121C] mb-14 md:mb-0">
          <form onSubmit={handleSearch} className="relative flex items-center gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isListening ? "Listening..." : "Type or speak..."}
                className={`w-full bg-[#1A1B26] text-white placeholder-slate-500 rounded-xl py-4 pl-4 pr-12 border transition-all text-sm ${isListening ? 'border-red-500 ring-1 ring-red-500' : 'border-white/5 focus:ring-1 focus:ring-indigo-500'
                  }`}
              />

              {/* Mic Button */}
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-white'
                  }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT MAIN CONTENT - RESULTS */}
      <div className={`
        flex-grow flex-col bg-[#0B0C15] relative overflow-hidden transition-all duration-300
        md:flex
        ${mobileView === 'chat' ? 'hidden' : 'flex'}
      `}>
        <div className="absolute top-[-20%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-600/10 blur-[80px] md:blur-[120px] rounded-full pointer-events-none"></div>

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

      {/* MOBILE BOTTOM NAV */}
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