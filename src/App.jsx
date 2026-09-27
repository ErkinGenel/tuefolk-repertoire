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
    // State
    const [sheets, setSheets] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    
    // Metronome State
    const [metroPlaying, setMetroPlaying] = useState(false);
    const [bpm, setBpm] = useState(100);

    // Refs for touch swipe detection
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // Derived state
    const displayedSheets = useMemo(() => {
        if (showFavoritesOnly) return sheets.filter(s => s.isFavorite);
        return sheets;
    }, [sheets, showFavoritesOnly]);

    const activeIndex = useMemo(() => {
        return displayedSheets.findIndex(s => s.id === activeId);
    }, [displayedSheets, activeId]);

    const activeSheet = displayedSheets[activeIndex];

    // Load images natively from the Vite bundler instead of GitHub API
    useEffect(() => {
        const savedFavs = JSON.parse(localStorage.getItem('folkFavorites') || '[]');

        // Vite magically processes all images in this folder at build time. 
        // No network requests needed to find out what files exist!
        const imageModules = import.meta.glob('./assets/images/*.{png,jpg,jpeg,gif,webp}', { eager: true, import: 'default' });
        
        const loadedSheets = Object.entries(imageModules).map(([path, url]) => {
            const filename = path.split('/').pop();
            const name = filename.replace(/\.[^/.]+$/, ""); // Remove extension for display
            return {
                id: filename,
                name: name,
                url: url, // This is the compiled URL Vite provides
                isFavorite: savedFavs.includes(filename)
            };
        });

        // Sort alphabetically
        loadedSheets.sort((a, b) => a.name.localeCompare(b.name));

        setSheets(loadedSheets);
        if (loadedSheets.length > 0) setActiveId(loadedSheets[0].id);
    }, []);

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
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeIndex, displayedSheets.length]);

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

    // Cleanup metronome on unmount
    useEffect(() => { return () => metronomeEngine.stop(); }, []);

    return (
        <div className="h-screen w-screen flex flex-col bg-gray-900 text-gray-100 font-sans">
            {/* Header Bar */}
            <div className="h-16 shrink-0 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 z-20 shadow-md">
                <div className="flex items-center space-x-4">
                    <h1 className="font-bold text-lg hidden sm:block text-blue-400">Repertoire</h1>

                    <button 
                        onClick={() => {
                            const newFavState = !showFavoritesOnly;
                            setShowFavoritesOnly(newFavState);
                            if (newFavState && activeSheet && !activeSheet.isFavorite) {
                                const firstFav = sheets.find(s => s.isFavorite);
                                setActiveId(firstFav ? firstFav.id : null);
                            } else if (!newFavState && !activeId && sheets.length > 0) {
                                setActiveId(sheets[0].id);
                            }
                        }}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${showFavoritesOnly ? 'bg-red-900/40 text-red-400' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                    >
                        <IconHeart solid={showFavoritesOnly} className="w-5 h-5" />
                        <span className="text-sm font-medium hidden sm:block">Favorites</span>
                    </button>
                </div>

                {/* Metronome Controls */}
                <div className="flex items-center bg-gray-900/50 rounded-xl p-1 px-3 border border-gray-700">
                    <button 
                        onClick={toggleMetronome}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg mr-3 transition-colors ${metroPlaying ? 'bg-green-600 text-white animate-pulse' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                    >
                        {metroPlaying ? (
                            <div className="w-3 h-3 bg-white rounded-sm"></div>
                        ) : (
                            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        )}
                    </button>
                    <div className="flex flex-col w-24 sm:w-32">
                        <div className="flex justify-between text-xs text-gray-400 font-mono mb-1">
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
                        <p className="text-xs mt-2">Make sure you put images in `src/assets/images/`</p>
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
                                
                                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-xl flex items-center space-x-3 border border-gray-700/50 shadow-2xl">
                                    <span className="font-semibold text-sm max-w-[200px] sm:max-w-md truncate">{activeSheet.name}</span>
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
            <div className="h-28 shrink-0 bg-gray-900 border-t border-gray-800 p-2 overflow-x-auto hide-scrollbar flex items-center space-x-3 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
                {displayedSheets.map((sheet) => (
                    <div 
                        key={sheet.id}
                        onClick={() => setActiveId(sheet.id)}
                        className={`relative h-full shrink-0 w-20 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden ${sheet.id === activeId ? 'ring-2 ring-blue-500 scale-95 opacity-100' : 'opacity-50 hover:opacity-100'}`}
                    >
                        <img src={sheet.url} alt={sheet.name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-1 pt-4">
                            <p className="text-[9px] font-medium truncate text-center text-gray-200">{sheet.name}</p>
                        </div>
                        {sheet.isFavorite && (
                            <div className="absolute top-1 right-1 text-red-500">
                                <IconHeart solid={true} className="w-3 h-3" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;