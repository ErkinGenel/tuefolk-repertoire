<<<<<<< HEAD
import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { geoPath, geoNaturalEarth1 } from 'd3-geo';

const GEO_DICT = {
    "Argentinien*": [-64.0, -34.6], "Argentinien": [-64.0, -34.6], "Argentina": [-64.0, -34.6],
    "Deutschland": [10.4, 51.1], "Deutschland (Schwaben)": [9.8, 48.3], "Germany": [10.4, 51.1],
    "Brasilien": [-51.9, -14.2], "Brazil": [-51.9, -14.2],
    "Bolivien*": [-68.1, -16.2], "Bolivia": [-68.1, -16.2],
    "Ukraine": [31.1, 48.3], "Ukraine": [31.1, 48.3],
    "Ägypten": [30.8, 26.8], "Egypt": [30.8, 26.8],
    "Uganda*": [32.2, 1.3], "Uganda": [32.2, 1.3],
    "Spanien (Mallorca)": [2.9, 39.6], "Spanien": [-3.7, 40.4], "Spain": [-3.7, 40.4],
    "Italien (Friaul)": [13.2, 46.1], "Italien (Neapel)": [14.2, 40.8], "Italien (Apulien)": [16.8, 41.1], "Italien": [12.5, 41.8], "Italy": [12.5, 41.8],
    "Algerien": [1.6, 28.0], "Algeria": [1.6, 28.0],
    "Bulgarien": [25.4, 42.7], "Bulgaria": [25.4, 42.7],
    "Chile": [-71.5, -35.6],
    "Frankreich (Bretagne)": [-2.9, 48.2], "Frankreich (Elsass)": [7.4, 48.3], "Frankreich": [2.2, 46.2], "France": [2.2, 46.2],
    "Georgien": [43.3, 42.3], "Georgia": [43.3, 42.3],
    "Griechenland": [22.0, 39.0], "Greece": [22.0, 39.0],
    "Iran": [53.6, 32.4],
    "Niederlande": [5.2, 52.1], "Netherlands": [5.2, 52.1],
    "Palästina": [35.2, 31.9], "Palestine": [35.2, 31.9],
    "Peru": [-75.0, -9.1],
    "Polen": [19.1, 51.9], "Poland": [19.1, 51.9],
    "Portugal": [-8.2, 39.3],
    "USA": [-95.7, 37.0],
    "Kanada": [-106.3, 56.1], "Canada": [-106.3, 56.1],
    "China": [104.1, 35.8],
    "Kolumbien": [-74.0, 4.5], "Colombia": [-74.0, 4.5],
    "Indien": [78.9, 20.5], "Indien*": [78.9, 20.5], "India": [78.9, 20.5],
    "Libanon": [35.8, 33.8], "Lebanon": [35.8, 33.8],
    "Kurdistan (Region)*": [43.9, 36.1], "Kurdistan": [43.9, 36.1],
    "Roma/Balkan*": [21.1, 42.7], "Balkan": [21.1, 42.7],
    "Japan / Irland": [138.2, 36.2], "Japan": [138.2, 36.2], "Irland": [-8.2, 53.4], "Ireland": [-8.2, 53.4],
    "Klezmer (aschkenasisch-jüdisch, Osteuropa)": [25.0, 50.0], "Klezmer": [25.0, 50.0],
    "Slowakei": [19.6, 48.6], "Slovakia": [19.6, 48.6],
    "Schweden": [18.6, 60.1], "Sweden": [18.6, 60.1],
    "Nepal": [84.1, 28.3],
    "Türkei": [35.2, 38.9], "Turkey": [35.2, 38.9],
    "Wales*": [-3.8, 52.3], "Wales": [-3.8, 52.3],
    "Kongo*": [23.0, -4.0], "Congo": [23.0, -4.0],
    "England": [-1.5, 52.5]
=======
import { useState, useEffect, useRef, useMemo } from 'react';

// ======================================================================
// Icons
// ======================================================================
const Svg = ({ className, solid, children }) => (
    <svg
        className={className}
        fill={solid ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
    >
        {children}
    </svg>
);

const P = ({ d }) => <path strokeLinecap="round" strokeLinejoin="round" d={d} />;

const IconHeart = ({ solid, className }) => (
    <Svg solid={solid} className={className}>
        <P d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </Svg>
);

const IconChevronLeft = ({ className }) => (
    <Svg className={className}><P d="M15 19l-7-7 7-7" /></Svg>
);

const IconChevronRight = ({ className }) => (
    <Svg className={className}><P d="M9 5l7 7-7 7" /></Svg>
);

const IconMap = ({ className }) => (
    <Svg className={className}>
        <P d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </Svg>
);

const IconMusic = ({ className }) => (
    <Svg className={className}>
        <P d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </Svg>
);

const IconLock = ({ className }) => (
    <Svg className={className}>
        <P d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002-2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </Svg>
);

const IconMenu = ({ className }) => (
    <Svg className={className}><P d="M4 6h16M4 12h16M4 18h16" /></Svg>
);

const IconX = ({ className }) => (
    <Svg className={className}><P d="M6 18L18 6M6 6l12 12" /></Svg>
);

const IconSearch = ({ className }) => (
    <Svg className={className}>
        <P d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </Svg>
);

// ======================================================================
// Safe browser storage (can be blocked in private mode / sandboxed iframes)
// ======================================================================
// Storage can be unavailable (private mode, sandboxed iframes). Never let that crash the app.
const wrap = (kind) => ({
    get(key, fallback = null) {
        try { const v = window[kind].getItem(key); return v === null ? fallback : v; } catch { return fallback; }
    },
    set(key, value) {
        try { window[kind].setItem(key, value); } catch { /* ignore */ }
    },
});
const session = wrap('sessionStorage');
const local = wrap('localStorage');

// ======================================================================
// Metronome
// ======================================================================
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
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
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
            this.nextNoteTime += 60.0 / this.bpm;
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

// ======================================================================
// Map projection + regions
// ======================================================================
// ---------------------------------------------------------------------------
// Map projection
//
// The Wikimedia "World_map_blank_without_borders.svg" is drawn in an
// equirectangular projection, so longitude/latitude map linearly to x/y.
// If markers are shifted by a constant amount, tune MAP_BOUNDS (the lon/lat
// range the SVG actually covers) instead of editing individual countries.
// ---------------------------------------------------------------------------
const MAP_BOUNDS = { west: -180, east: 180, north: 90, south: -90 };

const project = (lat, lon) => ({
    x: ((lon - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100,
    y: ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100,
});

const C = (id, name, lat, lon) => ({ id, name, ...project(lat, lon) });

// One entry per place (real latitude / longitude) ...
const GERMANY = C('germany', 'Germany', 51, 10);
const FRANCE = C('france', 'France', 46.5, 2.5);
const UK = C('uk', 'United Kingdom', 54, -2);
const IRELAND = C('ireland', 'Ireland', 53, -8);
const SCOTLAND = C('scotland', 'Scotland', 56.5, -4);
const SPAIN = C('spain', 'Spain', 40, -3.5);
const ITALY = C('italy', 'Italy', 42.5, 12.5);
const SWEDEN = C('sweden', 'Sweden', 62, 15);
const NORWAY = C('norway', 'Norway', 61, 9);
const DENMARK = C('denmark', 'Denmark', 56, 10);
const FINLAND = C('finland', 'Finland', 64, 26);
const RUSSIA = C('russia', 'Russia', 58, 45);
const POLAND = C('poland', 'Poland', 52, 19.5);
const UKRAINE = C('ukraine', 'Ukraine', 49, 32);
const TURKEY = C('turkey', 'Turkey', 39, 35);
const GREECE = C('greece', 'Greece', 39, 22);
const ROMANIA = C('romania', 'Romania', 46, 25);
const BULGARIA = C('bulgaria', 'Bulgaria', 42.7, 25.5);
const NETHERLANDS = C('netherlands', 'Netherlands', 52.3, 5.5);
const BELGIUM = C('belgium', 'Belgium', 50.6, 4.7);
const SWITZERLAND = C('switzerland', 'Switzerland', 46.8, 8.2);
const AUSTRIA = C('austria', 'Austria', 47.5, 14.5);
const CZECHIA = C('czechia', 'Czechia', 49.8, 15.5);
const HUNGARY = C('hungary', 'Hungary', 47, 19.5);
const SERBIA = C('serbia', 'Serbia', 44, 21);
const BALKAN = C('balkan', 'Balkan', 43.5, 20);
const CROATIA = C('croatia', 'Croatia', 45.1, 15.5);
const PORTUGAL = C('portugal', 'Portugal', 39.5, -8);
const CELTIC = C('celtic', 'Celtic', 52.5, -4);
const YIDDISH = C('yiddish', 'Yiddish', 50.5, 24);

const USA = C('usa', 'USA', 39, -98);
const CANADA = C('canada', 'Canada', 56, -106);
const MEXICO = C('mexico', 'Mexico', 23, -102);
const BRAZIL = C('brazil', 'Brazil', -10, -52);
const ARGENTINA = C('argentina', 'Argentina', -36, -64);
const COLOMBIA = C('colombia', 'Colombia', 4.5, -73);
const CHILE = C('chile', 'Chile', -33, -71);

const ARABIC = C('arabic', 'Arabic', 24, 45);
const ISRAEL = C('israel', 'Israel', 31.5, 35);
const EGYPT = C('egypt', 'Egypt', 26.5, 30);
const ALGERIA = C('algeria', 'Algeria', 28, 2.5);
const SOUTH_AFRICA = C('south_africa', 'South Africa', -29, 24);
const JAPAN = C('japan', 'Japan', 36, 138);
const CHINA = C('china', 'China', 35, 103);
const KOREA = C('korea', 'Korea', 36.5, 127.8);
const INDIA = C('india', 'India', 22, 78);
const AUSTRALIA = C('australia', 'Australia', -25, 134);

// ... and the words (lower case) that may appear in "(Region)" in a file name.
const regionsMap = {
    // Europe
    german: GERMANY, germany: GERMANY, deutsch: GERMANY,
    french: FRANCE, france: FRANCE, francais: FRANCE,
    english: UK, uk: UK, england: UK,
    ireland: IRELAND, irish: IRELAND, eire: IRELAND,
    scottish: SCOTLAND, scotland: SCOTLAND,
    spanish: SPAIN, spain: SPAIN, espana: SPAIN,
    italian: ITALY, italy: ITALY, italia: ITALY,
    swedish: SWEDEN, sweden: SWEDEN,
    norwegian: NORWAY, norway: NORWAY,
    danish: DENMARK, denmark: DENMARK,
    finnish: FINLAND, finland: FINLAND,
    russian: RUSSIA, russia: RUSSIA,
    polish: POLAND, poland: POLAND,
    ukrainian: UKRAINE, ukraine: UKRAINE,
    turkish: TURKEY, turkey: TURKEY,
    greek: GREECE, greece: GREECE,
    romanian: ROMANIA, romania: ROMANIA,
    bulgarian: BULGARIA, bulgaria: BULGARIA,
    dutch: NETHERLANDS, netherlands: NETHERLANDS,
    belgian: BELGIUM, belgium: BELGIUM,
    swiss: SWITZERLAND, switzerland: SWITZERLAND,
    austrian: AUSTRIA, austria: AUSTRIA,
    czech: CZECHIA, czechia: CZECHIA, bohemian: CZECHIA,
    hungarian: HUNGARY, hungary: HUNGARY,
    serbian: SERBIA, serbia: SERBIA,
    balkan: BALKAN,
    croatian: CROATIA, croatia: CROATIA,
    portuguese: PORTUGAL, portugal: PORTUGAL,
    celtic: CELTIC, britain: CELTIC,
    yiddish: YIDDISH, klezmer: YIDDISH,

    // Americas
    american: USA, usa: USA, america: USA,
    canadian: CANADA, canada: CANADA,
    mexican: MEXICO, mexico: MEXICO,
    brazilian: BRAZIL, brazil: BRAZIL, brasil: BRAZIL,
    argentinian: ARGENTINA, argentina: ARGENTINA,
    columbian: COLOMBIA, colombia: COLOMBIA, colobian: COLOMBIA,
    chilean: CHILE, chile: CHILE,

    // Middle East, Africa, Asia, Oceania
    arabic: ARABIC, arab: ARABIC,
    israel: ISRAEL, jewish: ISRAEL, hebrew: ISRAEL,
    egyptian: EGYPT, egypt: EGYPT, egipt: EGYPT,
    algerian: ALGERIA, algeria: ALGERIA,
    'south african': SOUTH_AFRICA, 'south africa': SOUTH_AFRICA,
    japanese: JAPAN, japan: JAPAN,
    chinese: CHINA, china: CHINA,
    korean: KOREA, korea: KOREA,
    indian: INDIA, india: INDIA,
    australian: AUSTRALIA, australia: AUSTRALIA,
};

const getRegionData = (regionName) => {
    if (!regionName) {
        return { id: 'unspecified', name: 'Unspecified', x: 50, y: 92, isUnknown: true };
    }

    const key = regionName.toLowerCase().trim();

    if (regionsMap[key]) return regionsMap[key];

    // Fuzzy match (min. 4 characters so short strings can't match everything)
    const cleanKey = key.replace(/[^a-z]/g, '');
    if (cleanKey.length >= 4) {
        for (const [rKey, rData] of Object.entries(regionsMap)) {
            if (rKey.length >= 4 && (cleanKey.includes(rKey) || rKey.includes(cleanKey))) {
                return rData;
            }
        }
    }

    // Unmapped regions are parked along the bottom edge ("ocean dock")
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);

    return {
        id: key.replace(/[^a-z0-9]/g, '') || 'unmapped',
        name: regionName,
        x: 10 + (Math.abs(hash) % 80),
        y: 92 + (Math.abs(hash) % 4),
        isUnknown: true,
    };
};

// ======================================================================
// World map
// ======================================================================
const MAP_URL = 'https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg';

function WorldMap({ sheets, activeId, onSelect }) {
    const [activeRegion, setActiveRegion] = useState(null);
    const [hoveredRegion, setHoveredRegion] = useState(null);

    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const regions = useMemo(() => {
        const groups = {};
        sheets.forEach((sheet) => {
            const rData = getRegionData(sheet.region);
            if (!groups[rData.id]) {
                groups[rData.id] = { ...rData, sheets: [] };
            }
            groups[rData.id].sheets.push(sheet);
        });
        return Object.values(groups);
    }, [sheets]);

    const handlePointerDown = (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        isDragging.current = true;
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current) return;
        setPosition({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y,
        });
    };

    const handlePointerUp = () => {
        isDragging.current = false;
    };

    const handleWheel = (e) => {
        const zoomSensitivity = 0.002;
        setScale((s) => Math.min(Math.max(1, s - e.deltaY * zoomSensitivity), 8));
    };

    const zoomIn = () => setScale((s) => Math.min(s * 1.5, 8));
    const zoomOut = () => {
        setScale((s) => {
            const newScale = Math.max(s / 1.5, 1);
            if (newScale === 1) setPosition({ x: 0, y: 0 });
            return newScale;
        });
    };

    return (
        <div className="absolute inset-0 bg-[#060a13] flex flex-col overflow-hidden z-0 select-none">
            <div className="absolute bottom-6 right-6 z-50 flex flex-col space-y-2 bg-gray-900/80 backdrop-blur-md p-2 rounded-xl border border-gray-700 shadow-xl">
                <button onClick={zoomIn} className="w-10 h-10 flex items-center justify-center text-2xl text-white hover:bg-gray-700 rounded-lg transition-colors">+</button>
                <div className="w-full h-px bg-gray-700 my-1"></div>
                <button onClick={zoomOut} className="w-10 h-10 flex items-center justify-center text-3xl text-white hover:bg-gray-700 rounded-lg transition-colors leading-none pb-1">-</button>
            </div>

            <div
                className={`relative w-full h-full flex items-center justify-center ${isDragging.current ? 'cursor-grabbing' : 'cursor-grab'}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onWheel={handleWheel}
                onClick={() => setActiveRegion(null)}
            >
                <div
                    className="relative w-full max-w-7xl flex items-center justify-center transition-transform duration-75 origin-center"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        touchAction: 'none',
                    }}
                >
                    <div className="relative w-full shadow-2xl rounded-lg" style={{ aspectRatio: '1.97 / 1' }}>
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                backgroundColor: '#3b82f6',
                                opacity: 0.35,
                                maskImage: `url("${MAP_URL}")`,
                                WebkitMaskImage: `url("${MAP_URL}")`,
                                maskSize: '100% 100%',
                                WebkitMaskSize: '100% 100%',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                            }}
                        ></div>

                        {regions.map((region) => {
                            const isActive = activeRegion === region.id;
                            const isHovered = hoveredRegion === region.id;
                            const hasActiveSheet = region.sheets.some((s) => s.id === activeId);
                            const popupIsAbove = region.y > 60;

                            return (
                                <div
                                    key={region.id}
                                    className="absolute pointer-events-auto"
                                    style={{ left: `${region.x}%`, top: `${region.y}%` }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveRegion(isActive ? null : region.id);
                                    }}
                                    onMouseEnter={() => setHoveredRegion(region.id)}
                                    onMouseLeave={() => setHoveredRegion(null)}
                                >
                                    <div
                                        className={`absolute -ml-1.5 -mt-1.5 rounded-full cursor-pointer transition-all duration-300 shadow-md ${isActive ? 'bg-blue-400 z-20 shadow-[0_0_15px_rgba(59,130,246,0.9)]' : hasActiveSheet ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : region.isUnknown ? 'bg-gray-500 hover:bg-gray-400 z-10' : 'bg-red-500 hover:bg-red-400 z-10'}`}
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            transform: `scale(${isActive ? 1.5 / scale : 1 / scale})`,
                                        }}
                                    />

                                    {isHovered && !isActive && (
                                        <div
                                            className="absolute z-30 bg-gray-900/95 text-white text-xs font-bold px-2 py-1 rounded border border-gray-600 mt-[-14px] whitespace-nowrap shadow-xl pointer-events-none"
                                            style={{ transform: `translate(-50%, -100%) scale(${1 / scale})`, transformOrigin: 'bottom center' }}
                                        >
                                            {region.name} {region.isUnknown ? '(Unmapped)' : ''} <span className="text-gray-400 font-normal">({region.sheets.length})</span>
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-600"></div>
                                        </div>
                                    )}

                                    {isActive && (
                                        <div
                                            className={`absolute z-[100] bg-gray-900/95 backdrop-blur-md border border-gray-600 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-3 w-56 sm:w-64 cursor-default ${popupIsAbove ? 'mt-[-20px]' : 'mt-[10px]'}`}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                transform: `translate(-50%, ${popupIsAbove ? '-100%' : '0'}) scale(${1 / scale})`,
                                                transformOrigin: popupIsAbove ? 'bottom center' : 'top center',
                                            }}
                                        >
                                            <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                                                <h3 className="text-sm font-bold text-white truncate pr-2">{region.name}</h3>
                                                <button onClick={() => setActiveRegion(null)} className="text-gray-400 hover:text-white shrink-0 bg-gray-800 rounded p-0.5 transition-colors">
                                                    <IconX className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="max-h-48 overflow-y-auto hide-scrollbar flex flex-col space-y-1" onWheel={(e) => e.stopPropagation()}>
                                                {region.sheets.map((sheet) => (
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
}

// ======================================================================
// App
// ======================================================================
// NOTE: this password check runs in the browser only. It keeps casual visitors
// out, but it is not real security – anyone can read it in the built JS.
const CORRECT_PASSWORD = 'folk';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return session.get('folkAuth') === 'true';
    });
    const [passwordInput, setPasswordInput] = useState('');
    const [loginError, setLoginError] = useState(false);

    const [sheets, setSheets] = useState([]);
    const [activeId, setActiveId] = useState(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    const [viewMode, setViewMode] = useState('viewer');

    const [metroPlaying, setMetroPlaying] = useState(false);
    const [bpm, setBpm] = useState(100);

    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const displayedSheets = useMemo(() => {
        let result = sheets;
        if (showFavoritesOnly) {
            result = result.filter((s) => s.isFavorite);
        }
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter((s) => s.name.toLowerCase().includes(query));
        }
        return result;
    }, [sheets, showFavoritesOnly, searchQuery]);

    const activeIndex = useMemo(() => {
        return displayedSheets.findIndex((s) => s.id === activeId);
    }, [displayedSheets, activeId]);

    const activeSheet = displayedSheets[activeIndex];

    useEffect(() => {
        if (displayedSheets.length > 0 && activeIndex === -1 && isAuthenticated) {
            setActiveId(displayedSheets[0].id);
        }
    }, [displayedSheets, activeIndex, isAuthenticated]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (passwordInput === CORRECT_PASSWORD) {
            setIsAuthenticated(true);
            session.set('folkAuth', 'true');
            setLoginError(false);
        } else {
            setLoginError(true);
            setPasswordInput('');
        }
    };

    // Load all images from src/assets/images once authenticated.
    // File names look like "Song Title (Region).png" – the text in brackets
    // is used to place the song on the world map.
    useEffect(() => {
        if (!isAuthenticated) return;

        const savedFavs = (() => { try { return JSON.parse(local.get('folkFavorites', '[]')); } catch { return []; } })();
        const imageModules = import.meta.glob('./assets/images/*.{png,jpg,jpeg,gif,webp}', {
            eager: true,
            import: 'default',
        });

        const loadedSheets = Object.entries(imageModules).map(([path, url]) => {
            const filename = path.split('/').pop();
            const name = filename.replace(/\.[^/.]+$/, '');

            const match = name.match(/\(([^)]+)\)/);
            const region = match ? match[1].trim() : null;

            return {
                id: filename,
                name,
                url,
                region,
                isFavorite: savedFavs.includes(filename),
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
        setSheets((prev) => {
            const nextSheets = prev.map((s) =>
                s.id === idToToggle ? { ...s, isFavorite: !s.isFavorite } : s
            );
            const favIds = nextSheets.filter((s) => s.isFavorite).map((s) => s.id);
            local.set('folkFavorites', JSON.stringify(favIds));
            return nextSheets;
        });
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        const handleKeyDown = (e) => {
            if (isMenuOpen) return;
            if (e.target instanceof HTMLInputElement) return;
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, activeIndex, displayedSheets.length, isMenuOpen]);

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
        const newBpm = parseInt(e.target.value, 10);
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
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}

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
                        displayedSheets.map((sheet) => (
                            <button
                                key={sheet.id}
                                onClick={() => {
                                    setActiveId(sheet.id);
                                    if (window.innerWidth < 768) setIsMenuOpen(false);
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

                <div className="flex items-center bg-gray-900/60 rounded-xl p-1 px-3 border border-gray-700 shadow-inner">
                    <button
                        onClick={toggleMetronome}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg mr-3 transition-all ${metroPlaying ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.5)]' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                    >
                        {metroPlaying ? (
                            <div className="w-3 h-3 bg-white rounded-sm animate-pulse"></div>
                        ) : (
                            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
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

            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black outline-none" tabIndex={0}>
                {displayedSheets.length === 0 ? (
                    <div className="text-gray-500 flex flex-col items-center">
                        <IconMusic className="w-16 h-16 mb-4 opacity-20" />
                        <p>No sheets found in this view.</p>
                        {searchQuery
                            ? <p className="text-sm mt-2 text-gray-600">Try clearing your search.</p>
                            : sheets.length === 0 && <p className="text-sm mt-2 text-gray-600">Add images to src/assets/images, e.g. “Greensleeves (England).png”.</p>}
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
>>>>>>> ed3cb30049ccb604e9744d27641049c296e3a220
};

export default function WorldMap({ sheets, activeId, onSelect }) {
    const [worldData, setWorldData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredCountry, setHoveredCountry] = useState(null);
    const [popupData, setPopupData] = useState(null); // { x, y, marker }
    
    const mapContainerRef = useRef(null);
    const svgRef = useRef(null);
    const zoomRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [zoomState, setZoomState] = useState({ k: 1, x: 0, y: 0 });

    useEffect(() => {
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
            .then(data => { setWorldData(data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });

        const handleResize = () => {
            if (mapContainerRef.current) {
                setDimensions({
                    width: mapContainerRef.current.clientWidth,
                    height: mapContainerRef.current.clientHeight
                });
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const projection = useMemo(() => {
        return geoNaturalEarth1()
            .scale(dimensions.width / 5.5)
            .translate([dimensions.width / 2, dimensions.height / 2]);
    }, [dimensions]);

    const pathGenerator = useMemo(() => geoPath().projection(projection), [projection]);

    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);
        const zoom = d3.zoom()
            .scaleExtent([0.5, 8])
            .on("zoom", (event) => {
                setZoomState({ k: event.transform.k, x: event.transform.x, y: event.transform.y });
            });

        svg.call(zoom);
        zoomRef.current = zoom;
    }, [dimensions]);

    const markersData = useMemo(() => {
        const mapData = {};
        sheets.forEach(song => {
            if (!song.region) return;
            // Lookup coordinate or fallback to center
            const coords = GEO_DICT[song.region] || GEO_DICT[song.region.replace('*', '')] || [0, 20];
            const key = coords.join(",");
            if (!mapData[key]) {
                mapData[key] = { coords: coords, countries: new Set(), songs: [] };
            }
            mapData[key].countries.add(song.region.replace('*', ''));
            mapData[key].songs.push(song);
        });
        
        return Object.values(mapData).map(item => ({
            ...item,
            countriesTitle: Array.from(item.countries).join(" / ")
        }));
    }, [sheets]);

    const handleMarkerClick = (event, markerData) => {
        event.stopPropagation();
        const [x, y] = projection(markerData.coords);
        // Transform screen coordinates for popup placement
        setPopupData({
            x: event.clientX,
            y: event.clientY,
            marker: markerData
        });
        if (markerData.countries.size > 0) {
            setHoveredCountry(Array.from(markerData.countries)[0]);
        }
    };

    const handleBackgroundClick = () => {
        setPopupData(null);
        setHoveredCountry(null);
    };

    return (
        <div ref={mapContainerRef} className="w-full h-full relative cursor-move bg-[#f4ecd8] overflow-hidden select-none" onClick={handleBackgroundClick}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#f4ecd8]/90 backdrop-blur-sm z-30">
                    <p className="text-3xl animate-pulse text-[#8c7a61] font-serif">Drawing World Map...</p>
                </div>
            )}

            <svg ref={svgRef} width="100%" height="100%" className="absolute inset-0 z-10 outline-none">
                <g transform={`translate(${zoomState.x}, ${zoomState.y}) scale(${zoomState.k})`}>
                    {worldData && worldData.features.map((feature, i) => (
                        <path
                            key={`country-${i}`}
                            d={pathGenerator(feature) || ""}
                            fill="#fdfaf3"
                            stroke="#b5a48b"
                            strokeWidth={1.5 / zoomState.k}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                    ))}

                    {worldData && markersData.map((marker, i) => {
                        const [x, y] = projection(marker.coords);
                        const isHovered = Array.from(marker.countries).some(c => hoveredCountry && c === hoveredCountry.replace('*', ''));
                        const baseRadius = isHovered ? 9 : 5;
                        const currentRadius = baseRadius / Math.sqrt(zoomState.k);
                        const currentStrokeWidth = 1.5 / zoomState.k;
                        
                        return (
                            <g
                                key={`marker-${i}`}
                                className="cursor-pointer transition-transform"
                                transform={`translate(${x}, ${y})`}
                                onClick={(e) => handleMarkerClick(e, marker)}
                                onMouseEnter={() => marker.countries.size > 0 && setHoveredCountry(Array.from(marker.countries)[0])}
                                onMouseLeave={() => setHoveredCountry(null)}
                            >
                                <circle
                                    cx="0"
                                    cy="0"
                                    r={currentRadius * 1.4}
                                    fill="rgba(217, 74, 56, 0.2)"
                                    className="animate-ping"
                                />
                                <circle
                                    cx="0"
                                    cy="0"
                                    r={currentRadius}
                                    fill={isHovered ? "#a72818" : "#d94a38"}
                                    stroke="#3e332a"
                                    strokeWidth={currentStrokeWidth}
                                />
                                <text
                                    x="0"
                                    y="0"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill="#fff"
                                    fontSize={currentRadius * 1.1}
                                    style={{ pointerEvents: 'none', fontFamily: 'sans-serif' }}
                                >
                                    ♪
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>

            {/* Interactive Region Song Popup Menu */}
            {popupData && (
                <div 
                    className="absolute z-50 bg-[#fffac2] border-2 border-[#d4cc7e] shadow-2xl rounded-xl p-4 w-72 max-h-96 overflow-y-auto transform -translate-x-1/2 -translate-y-full mb-3"
                    style={{ left: `${Math.min(Math.max(popupData.x, 140), window.innerWidth - 140)}px`, top: `${popupData.y - 15}px` }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center border-b border-amber-300 pb-2 mb-3">
                        <span className="font-bold text-amber-900 text-lg truncate font-serif">
                            {popupData.marker.countriesTitle}
                        </span>
                        <button 
                            onClick={() => setPopupData(null)}
                            className="text-amber-800 hover:text-red-600 font-bold px-1 text-sm bg-amber-200/50 rounded"
                        >
                            ✕
                        </button>
                    </div>
                    <ul className="space-y-1.5 m-0 p-0 list-none">
                        {popupData.marker.songs.map(song => (
                            <li key={song.id}>
                                <button
                                    onClick={() => {
                                        onSelect(song.id);
                                        setPopupData(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${song.id === activeId ? 'bg-amber-500 text-white font-semibold' : 'bg-amber-100/60 hover:bg-amber-200 text-amber-950'}`}
                                >
                                    <span className="truncate pr-2">{song.name}</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">➔</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}