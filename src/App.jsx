import { useState, useEffect, useRef, useMemo } from 'react';

const IconHeart = ({ solid, className }) => (
    <svg className={className} fill={solid ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
    </svg>
);

const IconChevronLeft = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path>
    </svg>
);

const IconChevronRight = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
    </svg>
);

const IconMusic = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
    </svg>
);

const IconLock = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002-2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
    </svg>
);

const IconMenu = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>
);

const IconX = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

const IconSearch = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
    </svg>
);

class Metronome {
    constructor() {
        this.audioCtx = null;
        this.isPlaying = false;
        this.timerID = null;
        this.bpm = 120;
        this.nextNoteTime = 0;
    }

    init() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    scheduleNote() {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.frequency.value = 800;
        
        gain.gain.setValueAtTime(1, this.nextNoteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.nextNoteTime + 0.05);
        
        osc.start(this.nextNoteTime);
        osc.stop(this.nextNoteTime + 0.05);
    }

    scheduler() {
        while (this.nextNoteTime < this.audioCtx.currentTime + 0.1) {
            this.scheduleNote();
            const secondsPerBeat = 60.0 / this.bpm;
            this.nextNoteTime += secondsPerBeat;
        }
        this.timerID = requestAnimationFrame(this.scheduler.bind(this));
    }

    start() {
        this.init();
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.nextNoteTime = this.audioCtx.currentTime + 0.05;
        this.scheduler();
    }

    stop() {
        this.isPlaying = false;
        cancelAnimationFrame(this.timerID);
    }
    
    setBpm(newBpm) {
        this.bpm = newBpm;
    }
}

const metronomeEngine = new Metronome();

const App = () => {
    // Authentication State
    const CORRECT_PASSWORD = "folk"; 
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return sessionStorage.getItem('folkAuth') === 'true';
    });
    const [passwordInput, setPasswordInput] = useState('');
    const [loginError, setLoginError] = useState(false);

    // Repertoire State
    const [sheets, setSheets] = useState([]);
    const [activeId, setActiveId] = useState(null);
    
    // Sidebar / Menu State
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    
    // Metronome State
    const [metroPlaying, setMetroPlaying] = useState(false);
    const [bpm, setBpm] = useState(100);

    // Refs for touch swipe detection
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // Derived state: Filtered sheets based on search AND favorites
    const displayedSheets = useMemo(() => {
        let result = sheets;
        if (showFavoritesOnly) {
            result = result.filter(s => s.isFavorite);
        }
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(s => s.name.toLowerCase().includes(query));
        }
        return result;
    }, [sheets, showFavoritesOnly, searchQuery]);

    const activeIndex = useMemo(() => {
        return displayedSheets.findIndex(s => s.id === activeId);
    }, [displayedSheets, activeId]);

    const activeSheet = displayedSheets[activeIndex];

    // Auto-select first item if the current one gets filtered out via search/favorites
    useEffect(() => {
        if (displayedSheets.length > 0 && activeIndex === -1 && isAuthenticated) {
            setActiveId(displayedSheets[0].id);
        }
    }, [displayedSheets, activeIndex, isAuthenticated]);

    // Handle Login Submit
    const handleLogin = (e) => {
        e.preventDefault();
        if (passwordInput === CORRECT_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('folkAuth', 'true');
            setLoginError(false);
        } else {
            setLoginError(true);
            setPasswordInput('');
        }
    };

    // Load images natively from the Vite bundler
    useEffect(() => {
        if (!isAuthenticated) return;

        const savedFavs = JSON.parse(localStorage.getItem('folkFavorites') || '[]');
        const imageModules = import.meta.glob('./assets/images/*.{png,jpg,jpeg,gif,webp}', { eager: true, import: 'default' });
        
        const loadedSheets = Object.entries(imageModules).map(([path, url]) => {
            const filename = path.split('/').pop();
            const name = filename.replace(/\.[^/.]+$/, "");
            return {
                id: filename,
                name: name,
                url: url,
                isFavorite: savedFavs.includes(filename)
            };
        });

        loadedSheets.sort((a, b) => a.name.localeCompare(b.name));
        setSheets(loadedSheets);
        if (loadedSheets.length > 0) setActiveId(loadedSheets[0].id);
    }, [isAuthenticated]);

    const goNext = () => {
        if (displayedSheets.length === 0) return;
        const nextIdx = (activeIndex + 1) % displayedSheets.length;
        setActiveId(displayedSheets[nextIdx].id);
    };

    const goPrev = () => {
        if (displayedSheets.length === 0) return;
        const prevIdx = (activeIndex - 1 + displayedSheets.length) % displayedSheets.length;
        setActiveId(displayedSheets[prevIdx].id);
    };

    const toggleFavorite = (idToToggle) => {
        setSheets(prev => {
            const nextSheets = prev.map(s => 
                s.id === idToToggle ? { ...s, isFavorite: !s.isFavorite } : s
            );
            const favIds = nextSheets.filter(s => s.isFavorite).map(s => s.id);
            localStorage.setItem('folkFavorites', JSON.stringify(favIds));
            return nextSheets;
        });
    };

    // Keyboard navigation
    useEffect(() => {
        if (!isAuthenticated) return;
        const handleKeyDown = (e) => {
            if (isMenuOpen) return; // Disable arrow keys when typing in search menu
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAuthenticated, activeIndex, displayedSheets.length, isMenuOpen]);

    // Touch Swipe logic
    const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
    const handleTouchMove = (e) => { touchEndX.current = e.targetTouches[0].clientX; };
    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const distance = touchStartX.current - touchEndX.current;
        if (distance > 50) goNext();
        if (distance < -50) goPrev();
        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    const toggleMetronome = () => {
        if (metroPlaying) {
            metronomeEngine.stop();
            setMetroPlaying(false);
        } else {
            metronomeEngine.start();
            setMetroPlaying(true);
        }
    };

    const handleBpmChange = (e) => {
        const newBpm = parseInt(e.target.value);
        setBpm(newBpm);
        metronomeEngine.setBpm(newBpm);
    };

    useEffect(() => { return () => metronomeEngine.stop(); }, []);

    if (!isAuthenticated) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-950 text-gray-100 font-sans p-4">
                <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
                        <IconLock className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">FolkRepertoire</h1>
                    <p className="text-gray-400 text-sm text-center mb-6">Enter your password to access the sheet music collection.</p>

                    <form onSubmit={handleLogin} className="w-full space-y-4">
                        <div>
                            <input 
                                type="password" 
                                placeholder="Password" 
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className={`w-full px-4 py-3 bg-gray-950 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${loginError ? 'border-red-500 focus:ring-red-500' : 'border-gray-800 focus:ring-blue-500'}`}
                                autoFocus
                            />
                            {loginError && (
                                <p className="text-xs text-red-400 mt-2 ml-1">Incorrect password. Please try again.</p>
                            )}
                        </div>

                        <button 
                            type="submit"
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all font-semibold rounded-xl text-white shadow-lg shadow-blue-600/20"
                        >
                            Unlock Repertoire
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex flex-col bg-gray-900 text-gray-100 font-sans overflow-hidden">
            
            {/* Dark Overlay when Sidebar is Open */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" 
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar Drawer */}
            <div className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-gray-900 border-r border-gray-800 z-50 transform transition-transform duration-300 flex flex-col shadow-2xl ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 shrink-0">
                    <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                        <IconMusic className="w-5 h-5 text-blue-500" />
                        Song List
                    </h2>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                        <IconX className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-4 border-b border-gray-800 space-y-4 bg-gray-900/50 shrink-0">
                    <div className="relative">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Search repertoire..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-700 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                            >
                                <IconX className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    
                    <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer select-none w-max">
                        <input 
                            type="checkbox" 
                            checked={showFavoritesOnly} 
                            onChange={(e) => setShowFavoritesOnly(e.target.checked)} 
                            className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900 cursor-pointer" 
                        />
                        <span>Show Favorites Only</span>
                    </label>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-1 bg-gray-950/30">
                    {displayedSheets.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm mt-8 flex flex-col items-center">
                            <IconSearch className="w-8 h-8 mb-2 opacity-20" />
                            No matching songs found.
                        </div>
                    ) : (
                        displayedSheets.map(sheet => (
                            <button
                                key={sheet.id}
                                onClick={() => {
                                    setActiveId(sheet.id);
                                    if (window.innerWidth < 768) setIsMenuOpen(false); // Auto-close on mobile
                                }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between group transition-colors ${activeId === sheet.id ? 'bg-blue-600/20 text-blue-400 font-medium border border-blue-500/30' : 'text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent'}`}
                            >
                                <span className="truncate pr-2 text-sm">{sheet.name}</span>
                                {sheet.isFavorite && <IconHeart solid={true} className={`w-4 h-4 shrink-0 ${activeId === sheet.id ? 'text-blue-400' : 'text-red-500 opacity-60 group-hover:opacity-100'}`} />}
                            </button>
                        ))
                    )}
                </div>
                
                <div className="p-3 border-t border-gray-800 text-xs font-mono text-gray-500 text-center bg-gray-900 shrink-0">
                    {displayedSheets.length} {displayedSheets.length === 1 ? 'RESULT' : 'RESULTS'}
                </div>
            </div>

            {/* Header Bar */}
            <div className="h-16 shrink-0 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-3 sm:px-4 z-20 shadow-md">
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2 -ml-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors active:scale-95"
                    >
                        <IconMenu className="w-6 h-6" />
                    </button>
                    
                    <h1 className="font-bold text-lg hidden sm:block text-blue-400 truncate">Repertoire</h1>

                    <button 
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors border ${showFavoritesOnly ? 'bg-red-900/30 text-red-400 border-red-500/30' : 'bg-gray-700/50 hover:bg-gray-600 border-transparent text-gray-300'}`}
                    >
                        <IconHeart solid={showFavoritesOnly} className="w-5 h-5" />
                        <span className="text-sm font-medium hidden md:block">Favorites</span>
                    </button>
                </div>

                {/* Metronome Controls */}
                <div className="flex items-center bg-gray-900/60 rounded-xl p-1 px-3 border border-gray-700 shadow-inner">
                    <button 
                        onClick={toggleMetronome}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg mr-3 transition-all ${metroPlaying ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.5)]' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                    >
                        {metroPlaying ? (
                            <div className="w-3 h-3 bg-white rounded-sm animate-pulse"></div>
                        ) : (
                            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        )}
                    </button>
                    <div className="flex flex-col w-20 sm:w-32">
                        <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 font-mono mb-1">
                            <span>BPM</span>
                            <span className="font-bold text-gray-200">{bpm}</span>
                        </div>
                        <input 
                            type="range" min="40" max="240" 
                            value={bpm} onChange={handleBpmChange}
                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Main Viewer Area */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black outline-none" tabIndex="0">
                {displayedSheets.length === 0 ? (
                    <div className="text-gray-500 flex flex-col items-center">
                        <IconMusic className="w-16 h-16 mb-4 opacity-20" />
                        <p>No sheets found in this view.</p>
                        {searchQuery && <p className="text-sm mt-2 text-gray-600">Try clearing your search.</p>}
                    </div>
                ) : (
                    <>
                        {/* Navigation Overlays */}
                        <div className="absolute inset-y-0 left-0 w-1/6 md:w-32 z-10 flex items-center justify-start group cursor-pointer" onClick={goPrev}>
                            <div className="ml-4 p-3 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hidden md:block">
                                <IconChevronLeft className="w-8 h-8" />
                            </div>
                        </div>

                        <div className="absolute inset-y-0 right-0 w-1/6 md:w-32 z-10 flex items-center justify-end group cursor-pointer" onClick={goNext}>
                            <div className="mr-4 p-3 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hidden md:block">
                                <IconChevronRight className="w-8 h-8" />
                            </div>
                        </div>

                        {/* Active Sheet */}
                        {activeSheet && (
                            <div 
                                className="relative w-full h-full flex items-center justify-center p-2 sm:p-4"
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                <img 
                                    key={activeSheet.id}
                                    src={activeSheet.url} 
                                    alt={activeSheet.name} 
                                    className="sheet-image max-w-full max-h-full object-contain rounded shadow-lg"
                                    draggable="false"
                                />
                                
                                {/* Added z-20 class here so it sits above the Navigation Overlays */}
                                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-xl flex items-center space-x-3 border border-gray-700/50 shadow-2xl">
                                    <span className="font-semibold text-sm max-w-[150px] sm:max-w-md truncate">{activeSheet.name}</span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(activeSheet.id); }}
                                        className={`p-1.5 rounded-full transition-transform active:scale-90 ${activeSheet.isFavorite ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                                    >
                                        <IconHeart solid={activeSheet.isFavorite} className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bottom Thumbnail Strip */}
            <div className="h-24 sm:h-28 shrink-0 bg-gray-900 border-t border-gray-800 p-2 overflow-x-auto hide-scrollbar flex items-center space-x-2 sm:space-x-3 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
                {displayedSheets.map((sheet) => (
                    <div 
                        key={sheet.id}
                        onClick={() => setActiveId(sheet.id)}
                        className={`relative h-full shrink-0 w-16 sm:w-20 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden ${sheet.id === activeId ? 'ring-2 ring-blue-500 scale-95 opacity-100' : 'opacity-50 hover:opacity-100'}`}
                    >
                        <img src={sheet.url} alt={sheet.name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 to-transparent p-1 pt-6">
                            <p className="text-[9px] font-medium truncate text-center text-gray-300">{sheet.name}</p>
                        </div>
                        {sheet.isFavorite && (
                            <div className="absolute top-1 right-1 text-red-500">
                                <IconHeart solid={true} className="w-3 h-3 drop-shadow-md" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;