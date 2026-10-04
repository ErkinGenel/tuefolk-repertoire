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

const IconMap = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
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

const getRegionData = (regionName) => {
    if (!regionName) {
        return { id: 'unspecified', name: 'Unspecified', x: 50, y: 90, isUnknown: true };
    }
    
    const key = regionName.toLowerCase().trim();
    
    // Visually calibrated coordinates for the Robinson Projection
    const regionsMap = {
        'german': { id: 'germany', name: 'Germany', x: 50, y: 29 }, 'germany': { id: 'germany', name: 'Germany', x: 50, y: 29 }, 'deutsch': { id: 'germany', name: 'Germany', x: 50, y: 29 },
        'french': { id: 'france', name: 'France', x: 48, y: 32 }, 'france': { id: 'france', name: 'France', x: 48, y: 32 }, 'francais': { id: 'france', name: 'France', x: 48, y: 32 },
        'english': { id: 'uk', name: 'United Kingdom', x: 47, y: 28 }, 'uk': { id: 'uk', name: 'United Kingdom', x: 47, y: 28 }, 'england': { id: 'uk', name: 'United Kingdom', x: 47, y: 28 },
        'ireland': { id: 'ireland', name: 'Ireland', x: 46, y: 28 }, 'irish': { id: 'ireland', name: 'Ireland', x: 46, y: 28 }, 'eire': { id: 'ireland', name: 'Ireland', x: 46, y: 28 },
        'scottish': { id: 'scotland', name: 'Scotland', x: 47, y: 26 }, 'scotland': { id: 'scotland', name: 'Scotland', x: 47, y: 26 },
        'spanish': { id: 'spain', name: 'Spain', x: 47, y: 35 }, 'spain': { id: 'spain', name: 'Spain', x: 47, y: 35 }, 'espana': { id: 'spain', name: 'Spain', x: 47, y: 35 },
        'italian': { id: 'italy', name: 'Italy', x: 51, y: 34 }, 'italy': { id: 'italy', name: 'Italy', x: 51, y: 34 }, 'italia': { id: 'italy', name: 'Italy', x: 51, y: 34 },
        'swedish': { id: 'sweden', name: 'Sweden', x: 51, y: 20 }, 'sweden': { id: 'sweden', name: 'Sweden', x: 51, y: 20 },
        'norwegian': { id: 'norway', name: 'Norway', x: 49, y: 20 }, 'norway': { id: 'norway', name: 'Norway', x: 49, y: 20 },
        'danish': { id: 'denmark', name: 'Denmark', x: 50, y: 25 }, 'denmark': { id: 'denmark', name: 'Denmark', x: 50, y: 25 },
        'finnish': { id: 'finland', name: 'Finland', x: 54, y: 20 }, 'finland': { id: 'finland', name: 'Finland', x: 54, y: 20 },
        'russian': { id: 'russia', name: 'Russia', x: 70, y: 20 }, 'russia': { id: 'russia', name: 'Russia', x: 70, y: 20 },
        'polish': { id: 'poland', name: 'Poland', x: 52, y: 29 }, 'poland': { id: 'poland', name: 'Poland', x: 52, y: 29 },
        'ukrainian': { id: 'ukraine', name: 'Ukraine', x: 55, y: 30 }, 'ukraine': { id: 'ukraine', name: 'Ukraine', x: 55, y: 30 },
        'turkish': { id: 'turkey', name: 'Turkey', x: 56, y: 36 }, 'turkey': { id: 'turkey', name: 'Turkey', x: 56, y: 36 },
        'greek': { id: 'greece', name: 'Greece', x: 54, y: 38 }, 'greece': { id: 'greece', name: 'Greece', x: 54, y: 38 },
        'arabic': { id: 'arabic', name: 'Arabic', x: 61, y: 45 }, 'arab': { id: 'arabic', name: 'Arabic', x: 61, y: 45 },
        'american': { id: 'usa', name: 'USA', x: 22, y: 35 }, 'usa': { id: 'usa', name: 'USA', x: 22, y: 35 }, 'america': { id: 'usa', name: 'USA', x: 22, y: 35 },
        'canadian': { id: 'canada', name: 'Canada', x: 23, y: 22 }, 'canada': { id: 'canada', name: 'Canada', x: 23, y: 22 },
        'mexican': { id: 'mexico', name: 'Mexico', x: 18, y: 44 }, 'mexico': { id: 'mexico', name: 'Mexico', x: 18, y: 44 },
        'brazilian': { id: 'brazil', name: 'Brazil', x: 32, y: 65 }, 'brazil': { id: 'brazil', name: 'Brazil', x: 32, y: 65 }, 'brasil': { id: 'brazil', name: 'Brazil', x: 32, y: 65 }, 'brasilian': { id: 'brazil', name: 'Brazil', x: 32, y: 65 },
        'argentinian': { id: 'argentina', name: 'Argentina', x: 30, y: 80 }, 'argentina': { id: 'argentina', name: 'Argentina', x: 30, y: 80 },
        'japanese': { id: 'japan', name: 'Japan', x: 86, y: 38 }, 'japan': { id: 'japan', name: 'Japan', x: 86, y: 38 },
        'chinese': { id: 'china', name: 'China', x: 75, y: 40 }, 'china': { id: 'china', name: 'China', x: 75, y: 40 },
        'korean': { id: 'korea', name: 'Korea', x: 82, y: 38 }, 'korea': { id: 'korea', name: 'Korea', x: 82, y: 38 },
        'indian': { id: 'india', name: 'India', x: 70, y: 48 }, 'india': { id: 'india', name: 'India', x: 70, y: 48 },
        'australian': { id: 'australia', name: 'Australia', x: 85, y: 75 }, 'australia': { id: 'australia', name: 'Australia', x: 85, y: 75 },
        'celtic': { id: 'celtic', name: 'Celtic', x: 46.5, y: 27 }, 'britain': { id: 'celtic', name: 'Celtic', x: 46.5, y: 27 },
        'yiddish': { id: 'yiddish', name: 'Yiddish', x: 53, y: 30 }, 'klezmer': { id: 'yiddish', name: 'Yiddish', x: 53, y: 30 },
        'israel': { id: 'israel', name: 'Israel', x: 58, y: 40 }, 'jewish': { id: 'israel', name: 'Israel', x: 58, y: 40 }, 'hebrew': { id: 'israel', name: 'Israel', x: 58, y: 40 },
        'dutch': { id: 'netherlands', name: 'Netherlands', x: 49.5, y: 29 }, 'netherlands': { id: 'netherlands', name: 'Netherlands', x: 49.5, y: 29 },
        'belgian': { id: 'belgium', name: 'Belgium', x: 49, y: 30 }, 'belgium': { id: 'belgium', name: 'Belgium', x: 49, y: 30 },
        'swiss': { id: 'switzerland', name: 'Switzerland', x: 50, y: 33 }, 'switzerland': { id: 'switzerland', name: 'Switzerland', x: 50, y: 33 },
        'austrian': { id: 'austria', name: 'Austria', x: 51, y: 32 }, 'austria': { id: 'austria', name: 'Austria', x: 51, y: 32 },
        'czech': { id: 'czechia', name: 'Czechia', x: 52, y: 31 }, 'bohemian': { id: 'czechia', name: 'Czechia', x: 52, y: 31 },
        'hungarian': { id: 'hungary', name: 'Hungary', x: 53, y: 32 }, 'hungary': { id: 'hungary', name: 'Hungary', x: 53, y: 32 },
        'romanian': { id: 'romania', name: 'Romania', x: 55, y: 33 }, 'romania': { id: 'romania', name: 'Romania', x: 55, y: 33 },
        'bulgarian': { id: 'bulgaria', name: 'Bulgaria', x: 55, y: 35 }, 'bulgaria': { id: 'bulgaria', name: 'Bulgaria', x: 55, y: 35 },
        'serbian': { id: 'serbia', name: 'Serbia', x: 53, y: 34 }, 'serbia': { id: 'serbia', name: 'Serbia', x: 53, y: 34 },
        'balkan': { id: 'balkan', name: 'Balkan', x: 53.5, y: 33 }, 'croatian': { id: 'croatia', name: 'Croatia', x: 52, y: 34 }, 'croatia': { id: 'croatia', name: 'Croatia', x: 52, y: 34 },
        'portuguese': { id: 'portugal', name: 'Portugal', x: 46, y: 36 }, 'portugal': { id: 'portugal', name: 'Portugal', x: 46, y: 36 },
        'egyptian': { id: 'egypt', name: 'Egypt', x: 55, y: 43 }, 'egypt': { id: 'egypt', name: 'Egypt', x: 55, y: 43 }, 'egipt': { id: 'egypt', name: 'Egypt', x: 55, y: 43 },
        'south african': { id: 'south_africa', name: 'South Africa', x: 55, y: 75 }, 'south africa': { id: 'south_africa', name: 'South Africa', x: 55, y: 75 }
    };

    if (regionsMap[key]) {
        return regionsMap[key];
    }
    
    // Fuzzy Match Fallback (Catch typos or additions like "Egyptian.")
    const cleanKey = key.replace(/[^a-z]/g, '');
    for (const [rKey, rCoords] of Object.entries(regionsMap)) {
        if (cleanKey.includes(rKey) || rKey.includes(cleanKey)) {
            return rCoords;
        }
    }
    
    // Unmapped Regions (Puts them in a clean row at the bottom of the map rather than randomly on land)
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
    
    return { 
        id: key.replace(/[^a-z0-9]/g, ''), 
        name: regionName,
        x: 10 + (Math.abs(hash) % 80), // Spread across the bottom
        y: 88 + (Math.abs(hash) % 4),  // Lock to the deep southern ocean
        isUnknown: true
    };
};

const WorldMap = ({ sheets, activeId, onSelect }) => {
    const [activeRegion, setActiveRegion] = useState(null);
    const [hoveredRegion, setHoveredRegion] = useState(null);

    // Zoom and Pan States
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });

    // Group individual sheets into Country/Region buckets
    const regions = useMemo(() => {
        const groups = {};
        sheets.forEach(sheet => {
            const rData = getRegionData(sheet.region);
            if (!groups[rData.id]) {
                groups[rData.id] = { ...rData, sheets: [] };
            }
            groups[rData.id].sheets.push(sheet);
        });
        return Object.values(groups);
    }, [sheets]);

    const handlePointerDown = (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return; // Only left click for mouse
        isDragging.current = true;
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        // Removed setPointerCapture - this was preventing clicks from firing!
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current) return;
        setPosition({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y
        });
    };

    const handlePointerUp = () => {
        isDragging.current = false;
    };

    // Wheel event for smooth zooming
    const handleWheel = (e) => {
        const zoomSensitivity = 0.002;
        setScale(s => Math.min(Math.max(1, s - e.deltaY * zoomSensitivity), 8));
    };

    // UI Buttons for Zooming
    const zoomIn = () => setScale(s => Math.min(s * 1.5, 8));
    const zoomOut = () => {
        setScale(s => {
            const newScale = Math.max(s / 1.5, 1);
            if (newScale === 1) setPosition({ x: 0, y: 0 }); // Reset position when fully zoomed out
            return newScale;
        });
    };

    return (
        <div className="absolute inset-0 bg-[#060a13] flex flex-col overflow-hidden z-0 select-none">
            
            {/* Zoom Controls Overlay */}
            <div className="absolute bottom-6 right-6 z-50 flex flex-col space-y-2 bg-gray-900/80 backdrop-blur-md p-2 rounded-xl border border-gray-700 shadow-xl">
                <button onClick={zoomIn} className="w-10 h-10 flex items-center justify-center text-2xl text-white hover:bg-gray-700 rounded-lg transition-colors">+</button>
                <div className="w-full h-px bg-gray-700 my-1"></div>
                <button onClick={zoomOut} className="w-10 h-10 flex items-center justify-center text-3xl text-white hover:bg-gray-700 rounded-lg transition-colors leading-none pb-1">-</button>
            </div>

            {/* Draggable Map Container */}
            <div 
                className={`relative w-full h-full flex items-center justify-center ${isDragging.current ? 'cursor-grabbing' : 'cursor-grab'}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onWheel={handleWheel}
                onClick={() => setActiveRegion(null)}
            >
                {/* The Transformation Layer */}
                <div 
                    className="relative w-full max-w-7xl flex items-center justify-center transition-transform duration-75 origin-center"
                    style={{ 
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        touchAction: 'none' // Prevents native scrolling while panning
                    }}
                >
                    
                    {/* The Unified Coordinate Container - Locks Map and Pins to exactly 1.97:1 ratio */}
                    <div className="relative w-full shadow-2xl rounded-lg" style={{ aspectRatio: '1.97 / 1' }}>
                        
                        {/* High-quality World Map (Robinson Projection) via WebKit Mask */}
                        <div 
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                backgroundColor: '#3b82f6', // Tailwind blue-500
                                opacity: 0.35,
                                maskImage: 'url("https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg")',
                                WebkitMaskImage: 'url("https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg")',
                                maskSize: '100% 100%',
                                WebkitMaskSize: '100% 100%',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat'
                            }}
                        ></div>
                        
                        {/* Overlay Pins */}
                        {regions.map(region => {
                            const isActive = activeRegion === region.id;
                            const isHovered = hoveredRegion === region.id;
                            const hasActiveSheet = region.sheets.some(s => s.id === activeId);
                            const popupIsAbove = region.y > 60; // Southern hemisphere opens up

                            return (
                                <div 
                                    key={region.id}
                                    className="absolute pointer-events-auto"
                                    style={{ left: `${region.x}%`, top: `${region.y}%` }}
                                    onPointerDown={(e) => e.stopPropagation()} // Prevents the map from dragging when touching a pin
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setActiveRegion(isActive ? null : region.id); 
                                    }}
                                    onMouseEnter={() => setHoveredRegion(region.id)}
                                    onMouseLeave={() => setHoveredRegion(null)}
                                >
                                    {/* Region Country Dot */}
                                    <div 
                                        className={`absolute -ml-1.5 -mt-1.5 rounded-full cursor-pointer transition-all duration-300 shadow-md ${isActive ? 'bg-blue-400 z-20 shadow-[0_0_15px_rgba(59,130,246,0.9)]' : hasActiveSheet ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : region.isUnknown ? 'bg-gray-500 hover:bg-gray-400 z-10' : 'bg-red-500 hover:bg-red-400 z-10'}`}
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            transform: `scale(${isActive ? 1.5 / scale : 1 / scale})`
                                        }}
                                    />

                                    {/* Hover Label */}
                                    {isHovered && !isActive && (
                                        <div 
                                            className="absolute z-30 bg-gray-900/95 text-white text-xs font-bold px-2 py-1 rounded border border-gray-600 -translate-x-1/2 -translate-y-full mt-[-14px] whitespace-nowrap shadow-xl pointer-events-none"
                                            style={{ transform: `translate(-50%, -100%) scale(${1 / scale})`, transformOrigin: 'bottom center' }}
                                        >
                                            {region.name} {region.isUnknown ? '(Unmapped)' : ''} <span className="text-gray-400 font-normal">({region.sheets.length})</span>
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-600"></div>
                                        </div>
                                    )}
                                    
                                    {/* Active Click Popup Menu (List of Songs) */}
                                    {isActive && (
                                        <div 
                                            className={`absolute z-[100] bg-gray-900/95 backdrop-blur-md border border-gray-600 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-3 w-56 sm:w-64 -translate-x-1/2 cursor-default ${popupIsAbove ? '-translate-y-full mt-[-20px]' : 'mt-[10px]'}`}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ transform: `scale(${1 / scale})`, transformOrigin: popupIsAbove ? 'bottom center' : 'top center' }}
                                        >
                                            <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                                                <h3 className="text-sm font-bold text-white truncate pr-2">{region.name}</h3>
                                                <button onClick={() => setActiveRegion(null)} className="text-gray-400 hover:text-white shrink-0 bg-gray-800 rounded p-0.5 transition-colors">
                                                    <IconX className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="max-h-48 overflow-y-auto hide-scrollbar flex flex-col space-y-1" onWheel={(e) => e.stopPropagation()}>
                                                {region.sheets.map(sheet => (
                                                    <button 
                                                        key={sheet.id}
                                                        onClick={() => onSelect(sheet.id)}
                                                        className={`flex items-center space-x-3 text-left w-full px-2 py-1.5 rounded transition-colors group ${activeId === sheet.id ? 'bg-blue-600/40 text-blue-300' : 'hover:bg-gray-800 text-gray-300'}`}
                                                    >
                                                        <img src={sheet.url} alt="" className="w-8 h-10 object-cover rounded shadow-sm opacity-90 group-hover:opacity-100 shrink-0 bg-white" />
                                                        <span className="text-xs font-medium group-hover:text-white truncate flex-1">{sheet.name}</span>
                                                        {sheet.isFavorite && <IconHeart solid className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                                                    </button>
                                                ))}
                                            </div>
                                            
                                            {/* Smart pointer arrows for popup orientation */}
                                            {popupIsAbove ? (
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-600"></div>
                                            ) : (
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-600"></div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

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
    
    const [viewMode, setViewMode] = useState('viewer'); // 'viewer' or 'map'
    
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
            
            // Extract region/country from parentheses, e.g. "Song Name (Germany)" -> "Germany"
            const match = name.match(/\(([^)]+)\)/);
            const region = match ? match[1].trim() : null;

            return {
                id: filename,
                name: name,
                url: url,
                region: region,
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

                    <div className="flex items-center bg-gray-900/80 p-1 rounded-lg border border-gray-700 ml-1 sm:ml-4 shadow-inner">
                        <button 
                            onClick={() => setViewMode('viewer')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'viewer' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                            title="Sheet Viewer"
                        >
                            <IconMusic className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('map')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                            title="World Map Overview"
                        >
                            <IconMap className="w-4 h-4" />
                        </button>
                    </div>
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
                ) : viewMode === 'map' ? (
                    <WorldMap 
                        sheets={displayedSheets}
                        activeId={activeId}
                        onSelect={(id) => {
                            setActiveId(id);
                            setViewMode('viewer');
                        }}
                    />
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