import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { geoPath, geoNaturalEarth1 } from 'd3-geo';

// --- ICONS ---
const IconHeart = ({ solid, className }) => (
    <svg className={className} fill={solid ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
    </svg>
);
const IconChevronLeft = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
);
const IconChevronRight = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
);
const IconMap = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
);
const IconMusic = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
);
const IconLock = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
);
const IconMenu = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
);
const IconX = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
);
const IconSearch = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
);
const IconPlay = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
);
const IconPause = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
);
const IconSkipPrev = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zM9.5 12l8.5 6V6z" /></svg>
);
const IconSkipNext = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" /></svg>
);
const IconList = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h10" /></svg>
);

// --- METRONOME ENGINE ---
class Metronome {
    constructor() {
        this.audioCtx = null;
        this.isPlaying = false;
        this.timerID = null;
        this.bpm = 100;
        this.nextNoteTime = 0;
    }
    init() { if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
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
    setBpm(newBpm) { this.bpm = newBpm; }
}
const metronomeEngine = new Metronome();

// --- STORAGE ---
const storageAPI = (storage) => ({
    get: (key, defaultValue = null) => { try { return storage.getItem(key) || defaultValue; } catch { return defaultValue; } },
    set: (key, value) => { try { storage.setItem(key, value); } catch {} },
});
const local = storageAPI(window.localStorage);
const session = storageAPI(window.sessionStorage);

// --- SOUNDS (mp4 / wav under src/assets/sounds, subfolders allowed) ---
const soundModules = import.meta.glob('./assets/sounds/**/*.{mp4,wav}', { eager: true, import: 'default' });

const normalize = (s) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const formatTime = (t) => {
    if (!isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

const ALL_SOUNDS = Object.entries(soundModules).map(([path, url]) => {
    const parts = path.replace('./assets/sounds/', '').split('/');
    const filename = parts.pop();
    const label = filename.replace(/\.[^/.]+$/, '');
    return {
        id: path,
        path,
        url,
        label,
        ext: filename.split('.').pop().toLowerCase(),
        keys: [...parts, label].map(normalize),
    };
});

// --- WORLD MAP GEOGRAPHY DICTIONARY ---
const GEO_DICT = {
    "Argentinien*": [-64.0, -34.6], "Argentinien": [-64.0, -34.6], "Argentina": [-64.0, -34.6],
    "Deutschland": [10.4, 51.1], "Deutschland (Schwaben)": [9.8, 48.3], "Germany": [10.4, 51.1],
    "Brasilien": [-51.9, -14.2], "Brazil": [-51.9, -14.2],
    "Bolivien*": [-68.1, -16.2], "Bolivia": [-68.1, -16.2],
    "Ukraine": [31.1, 48.3],
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
    "Kurdistan (Region)*": [43.9, 36.1],
    "Roma/Balkan*": [21.1, 42.7], "Balkan": [21.1, 42.7],
    "Japan / Irland": [138.2, 36.2], "Japan": [138.2, 36.2], "Irland": [-8.2, 53.1], "Ireland": [-8.2, 53.1],
    "Klezmer (aschkenasisch-jüdisch, Osteuropa)": [25.0, 50.0], "Klezmer": [25.0, 50.0],
    "Slowakei": [19.6, 48.6], "Slovakia": [19.6, 48.6],
    "Schweden": [18.6, 60.1], "Sweden": [18.6, 60.1],
    "Nepal": [84.1, 28.3],
    "Türkei": [35.2, 38.9], "Turkey": [35.2, 38.9],
    "Wales*": [-3.8, 52.3], "Wales": [-3.8, 52.3],
    "Kongo*": [23.0, -4.0], "Kongo": [23.0, -4.0], "Congo": [23.0, -4.0]
};

// --- WORLD MAP TOOLTIP (SONG LIST) ---
const Tooltip = ({ data, x, y, visible, onSelect, onClose }) => {
    if (!visible || !data) return null;
    return (
        <div 
            className="fixed p-4 text-xl sm:text-2xl text-gray-900 transform -rotate-1 z-[60] bg-[#fffac2] border-2 border-[#d4cc7e] shadow-[4px_6px_25px_rgba(0,0,0,0.4)] flex flex-col pointer-events-auto"
            style={{ 
                left: `${x}px`, top: `${y}px`, width: 'max-content', maxWidth: '320px', maxHeight: '350px', borderRadius: '2px 10px 3px 8px / 10px 2px 8px 3px'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="font-bold border-b border-[#a6967f] mb-3 pb-1 text-[#d94a38] flex justify-between items-center shrink-0">
                <span className="pr-4 truncate uppercase tracking-wider text-sm font-sans">{data.countriesTitle}</span>
                <button onClick={onClose} className="text-gray-500 hover:text-black font-sans text-lg font-bold transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/10">✕</button>
            </div>
            
            <ul className="list-none p-0 m-0 overflow-y-auto hide-scrollbar space-y-1.5 flex-1">
                {data.songs.map(song => (
                    <li key={song.id}>
                        <button
                            onClick={() => {
                                onSelect(song.id);
                                onClose();
                            }}
                            className="w-full text-left px-3 py-2 rounded-md transition-all text-[18px] sm:text-[20px] leading-tight font-medium bg-[#d94a38]/5 hover:bg-[#d94a38]/20 hover:text-[#a72818] border border-transparent hover:border-[#d94a38]/30 hover:pl-4"
                        >
                            <span className="text-[#8c7a61] opacity-50 mr-2 text-sm font-sans">🎵</span>
                            {song.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// --- WORLD MAP COMPONENT ---
function WorldMap({ sheets, onSelect }) {
    const [worldData, setWorldData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredCountry, setHoveredCountry] = useState(null); 
    const [tooltipData, setTooltipData] = useState({ visible: false, x: 0, y: 0, data: null });
    
    const mapContainerRef = useRef(null);
    const svgRef = useRef(null);
    const zoomRef = useRef(null);
    
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [zoomState, setZoomState] = useState({ k: 1, x: 0, y: 0 });

    const markersData = useMemo(() => {
        const mapData = {};
        sheets.forEach(song => {
            if (!song.region) return;
            const coords = GEO_DICT[song.region] || GEO_DICT[song.region.replace('*', '')];
            if (coords) {
                const key = coords.join(",");
                if (!mapData[key]) mapData[key] = { coords: coords, countries: new Set(), songs: [] };
                mapData[key].countries.add(song.region.replace('*', ''));
                mapData[key].songs.push(song);
            }
        });
        
        return Object.values(mapData).map(item => ({
            ...item,
            countriesTitle: Array.from(item.countries).join(" / ")
        }));
    }, [sheets]);

    useEffect(() => {
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
            .then(data => { setWorldData(data); setLoading(false); })
            .catch(err => { console.error("Map load error:", err); setLoading(false); });

        const handleResize = () => {
            if (mapContainerRef.current) {
                setDimensions({ width: mapContainerRef.current.clientWidth, height: mapContainerRef.current.clientHeight });
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
            .on("zoom", (event) => setZoomState({ k: event.transform.k, x: event.transform.x, y: event.transform.y }));
        svg.call(zoom);
        zoomRef.current = zoom;
    }, [dimensions]); 

    const handleMarkerClick = (event, markerData) => {
        event.stopPropagation();
        
        let px = event.clientX + 15;
        let py = event.clientY + 15;
        if (px + 320 > window.innerWidth) px = Math.max(10, event.clientX - 330);
        if (py + 350 > window.innerHeight) py = Math.max(10, event.clientY - 360);

        setTooltipData({ visible: true, x: px, y: py, data: markerData });
        if (markerData.countries.size > 0) setHoveredCountry(Array.from(markerData.countries)[0]);

        const [x, y] = projection(markerData.coords);
        if (svgRef.current && zoomRef.current) {
            d3.select(svgRef.current).transition().duration(750).call(
                zoomRef.current.transform,
                d3.zoomIdentity.translate(dimensions.width / 2, dimensions.height / 2).scale(4).translate(-x, -y)
            );
        }
    };

    return (
        <div ref={mapContainerRef} className="w-full h-full relative cursor-move overflow-hidden select-none" onClick={() => { setTooltipData({ visible: false, x: 0, y: 0, data: null }); setHoveredCountry(null); }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap');
                .map-theme-layer { background-color: #f4ecd8; background-image: radial-gradient(#e5d8bc 1px, transparent 1px), linear-gradient(transparent 95%, rgba(0,0,0,0.05) 95%); background-size: 20px 20px, 100% 40px; font-family: 'Caveat', cursive; }
                @keyframes float { 0% { transform: translateY(0) rotate(0deg); opacity: 0.1; } 50% { transform: translateY(-20px) rotate(10deg); opacity: 0.2; } 100% { transform: translateY(0) rotate(0deg); opacity: 0.1; } }
            `}</style>
            
            <div className="absolute inset-0 map-theme-layer z-0 pointer-events-none"></div>
            <div className="absolute text-[#8c7a61] opacity-[0.03] pointer-events-none z-0 left-[5%] top-[20%] text-[200px] font-sans">𝄞</div>
            <div className="absolute opacity-10 pointer-events-none font-sans text-[#8c7a61] animate-[float_15s_infinite_ease-in-out]" style={{ top: '10%', right: '15%', fontSize: '4rem', animationDelay: '0s' }}>♪</div>
            <div className="absolute opacity-10 pointer-events-none font-sans text-[#8c7a61] animate-[float_15s_infinite_ease-in-out]" style={{ top: '30%', left: '40%', fontSize: '3rem', animationDelay: '2s' }}>♫</div>
            <div className="absolute opacity-10 pointer-events-none font-sans text-[#8c7a61] animate-[float_15s_infinite_ease-in-out]" style={{ bottom: '20%', right: '30%', fontSize: '5rem', animationDelay: '1s' }}>♬</div>
            
            <svg width="0" height="0" className="absolute pointer-events-none">
                <defs>
                    <filter id="sketched"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" /></filter>
                </defs>
            </svg>

            {loading && <div className="absolute inset-0 flex items-center justify-center bg-[#f4ecd8]/80 backdrop-blur-sm z-20"><p className="text-4xl animate-pulse text-[#8c7a61] font-[Caveat]">Zeichne Weltkarte...</p></div>}

            <svg ref={svgRef} width="100%" height="100%" style={{ outline: 'none' }} className="absolute inset-0 z-10 block">
                <g filter="url(#sketched)" transform={`translate(${zoomState.x}, ${zoomState.y}) scale(${zoomState.k})`}>
                    {worldData && worldData.features.map((feature, i) => (
                        <path key={`country-${i}`} d={pathGenerator(feature) || ""} fill="#fdfaf3" stroke="#b5a48b" strokeWidth={1.5 / zoomState.k} strokeLinejoin="round" strokeLinecap="round" />
                    ))}
                    {worldData && markersData.map((marker, i) => {
                        const [x, y] = projection(marker.coords);
                        const isMarkerHovered = Array.from(marker.countries).some(c => hoveredCountry && c === hoveredCountry.replace('*', ''));
                        const currentRadius = (isMarkerHovered ? 8 : 4) / Math.sqrt(zoomState.k);
                        const currentStrokeWidth = 1.5 / zoomState.k;
                        
                        return (
                            <g 
                                key={`marker-${i}`} 
                                className="cursor-pointer pointer-events-auto" 
                                transform={`translate(${x}, ${y})`} 
                                onMouseEnter={() => setHoveredCountry(Array.from(marker.countries)[0])} 
                                onMouseLeave={() => setHoveredCountry(null)} 
                                onClick={(e) => handleMarkerClick(e, marker)}
                            >
                                <circle cx="0" cy="0" r={currentRadius} fill={isMarkerHovered ? "#a72818" : "#d94a38"} stroke="#3e332a" strokeWidth={currentStrokeWidth} style={{ transition: 'fill 0.2s ease, r 0.1s ease' }} />
                                {zoomState.k > 3 && <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={currentRadius * 1.2} style={{ pointerEvents: 'none', fontFamily: 'sans-serif' }}>♪</text>}
                            </g>
                        );
                    })}
                </g>
            </svg>
            <Tooltip visible={tooltipData.visible} x={tooltipData.x} y={tooltipData.y} data={tooltipData.data} onSelect={onSelect} onClose={() => setTooltipData({ visible: false, x: 0, y: 0, data: null })} />
        </div>
    );
}

// --- PLAYLIST PLAYER ---
function PlaylistPlayer({ tracks }) {
    const audioRef = useRef(null);
    const shouldPlayRef = useRef(false);
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [time, setTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [listOpen, setListOpen] = useState(false);

    const track = tracks[index];

    // (Re)load when the track changes; auto-play only if requested
    useEffect(() => {
        const a = audioRef.current;
        if (!a) return;
        a.load();
        setTime(0);
        if (shouldPlayRef.current) a.play().catch(() => setPlaying(false));
    }, [track.url]);

    // Stop when the song changes (component is keyed per song) or unmounts
    useEffect(() => () => audioRef.current?.pause(), []);

    const select = (i, autoplay = true) => {
        shouldPlayRef.current = autoplay;
        if (i === index) {
            const a = audioRef.current;
            a.currentTime = 0;
            if (autoplay) a.play().catch(() => {});
        } else {
            setIndex(i);
        }
    };

    const togglePlay = () => {
        const a = audioRef.current;
        if (!a) return;
        if (a.paused) { shouldPlayRef.current = true; a.play().catch(() => setPlaying(false)); }
        else { shouldPlayRef.current = false; a.pause(); }
    };

    const prev = () => {
        const a = audioRef.current;
        if (a && a.currentTime > 3) { a.currentTime = 0; return; }
        select((index - 1 + tracks.length) % tracks.length, playing);
    };
    const next = () => select((index + 1) % tracks.length, playing);

    const handleEnded = () => {
        if (index < tracks.length - 1) select(index + 1, true);
        else { shouldPlayRef.current = false; setPlaying(false); }
    };

    return (
        <div className="shrink-0 bg-gray-900 border-t border-gray-800 z-20">
            <audio
                ref={audioRef}
                src={track.url}
                preload="metadata"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={handleEnded}
            />

            <div className="flex items-center gap-2 sm:gap-3 px-3 py-2">
                <button onClick={prev} className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800"><IconSkipPrev className="w-5 h-5" /></button>
                <button onClick={togglePlay} className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white active:scale-95 transition-all">
                    {playing ? <IconPause className="w-4 h-4" /> : <IconPlay className="w-4 h-4 ml-0.5" />}
                </button>
                <button onClick={next} className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800"><IconSkipNext className="w-5 h-5" /></button>

                <div className="min-w-0 flex-1 flex flex-col">
                    <span className="text-xs sm:text-sm text-gray-200 truncate">
                        {track.label} <span className="text-gray-500 uppercase text-[10px] ml-1">{track.ext}</span>
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-500 w-9 text-right">{formatTime(time)}</span>
                        <input
                            type="range" min="0" max={duration || 0} step="0.1" value={time}
                            onChange={(e) => { const v = parseFloat(e.target.value); audioRef.current.currentTime = v; setTime(v); }}
                            className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <span className="text-[10px] font-mono text-gray-500 w-9">{formatTime(duration)}</span>
                    </div>
                </div>

                <button
                    onClick={() => setListOpen(o => !o)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${listOpen ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-gray-800 text-gray-300 border-transparent hover:bg-gray-700'}`}
                >
                    <IconList className="w-4 h-4" />
                    <span className="font-mono">{index + 1}/{tracks.length}</span>
                </button>
            </div>

            {listOpen && (
                <ul className="max-h-40 overflow-y-auto hide-scrollbar border-t border-gray-800 p-2 space-y-1 bg-gray-950/40">
                    {tracks.map((t, i) => (
                        <li key={t.id}>
                            <button
                                onClick={() => select(i, true)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${i === index ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-300 hover:bg-gray-800 border border-transparent'}`}
                            >
                                <span className="truncate pr-2">{i + 1}. {t.label}</span>
                                <span className="text-[10px] uppercase text-gray-500">{t.ext}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// --- MAIN APPLICATION ---
const CORRECT_PASSWORD = 'folk';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => session.get('folkAuth') === 'true');
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
        if (showFavoritesOnly) result = result.filter(s => s.isFavorite);
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(s => s.name.toLowerCase().includes(query));
        }
        return result;
    }, [sheets, showFavoritesOnly, searchQuery]);

    const activeIndex = useMemo(() => displayedSheets.findIndex(s => s.id === activeId), [displayedSheets, activeId]);
    const activeSheet = displayedSheets[activeIndex];

    // Assign each sound file to the best-matching song (longest name match wins)
    const soundsBySong = useMemo(() => {
        const result = {};
        sheets.forEach(s => { result[s.id] = []; });
        const keysFor = sheets.map(s => ({
            id: s.id,
            keys: [normalize(s.name)].filter(Boolean),
        }));
        ALL_SOUNDS.forEach(sound => {
            let best = null, bestScore = 0;
            keysFor.forEach(({ id, keys }) => {
                keys.forEach(k => {
                    if (k.length > bestScore && sound.keys.some(sk => sk.startsWith(k))) { best = id; bestScore = k.length; }
                });
            });
            if (best) result[best].push(sound);
        });
        Object.values(result).forEach(list => list.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true })));
        return result;
    }, [sheets]);

    const activeTracks = activeSheet ? soundsBySong[activeSheet.id] || [] : [];

    useEffect(() => {
        if (displayedSheets.length > 0 && activeIndex === -1 && isAuthenticated) setActiveId(displayedSheets[0].id);
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

    // Load Images & Extract Region Robustly (Ensure 100% of songs load)
    useEffect(() => {
        if (!isAuthenticated) return;
        const savedFavs = (() => { try { return JSON.parse(local.get('folkFavorites', '[]')); } catch { return []; } })();
        const imageModules = import.meta.glob('./assets/images/*.{png,jpg,jpeg,gif,webp}', { eager: true, import: 'default' });
        
        const loadedSheets = Object.entries(imageModules).map(([path, url]) => {
            const filename = path.split('/').pop();
            const name = filename.replace(/\.[^/.]+$/, '');
            
            let region = null;
            
            // 1. Try parentheses first
            const match = name.match(/\(([^)]+)\)/);
            if (match) {
                region = match[1].trim();
            }
            
            // 2. Scan entire filename text against dictionary keys
            if (!region || (!GEO_DICT[region] && !GEO_DICT[region.replace('*', '')])) {
                const foundKey = Object.keys(GEO_DICT).find(countryKey => name.toLowerCase().includes(countryKey.replace('*', '').toLowerCase()));
                if (foundKey) region = foundKey;
            }

            return { id: filename, name, url, region: region || "Unmapped", isFavorite: savedFavs.includes(filename) };
        });

        loadedSheets.sort((a, b) => a.name.localeCompare(b.name));
        setSheets(loadedSheets);
        if (loadedSheets.length > 0) setActiveId(loadedSheets[0].id);
    }, [isAuthenticated]);

    const goNext = () => {
        if (displayedSheets.length === 0) return;
        setActiveId(displayedSheets[(activeIndex + 1) % displayedSheets.length].id);
    };

    const goPrev = () => {
        if (displayedSheets.length === 0) return;
        setActiveId(displayedSheets[(activeIndex - 1 + displayedSheets.length) % displayedSheets.length].id);
    };

    const toggleFavorite = (idToToggle) => {
        setSheets(prev => {
            const nextSheets = prev.map(s => s.id === idToToggle ? { ...s, isFavorite: !s.isFavorite } : s);
            local.set('folkFavorites', JSON.stringify(nextSheets.filter(s => s.isFavorite).map(s => s.id)));
            return nextSheets;
        });
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        const handleKeyDown = (e) => {
            if (isMenuOpen || e.target instanceof HTMLInputElement) return;
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAuthenticated, activeIndex, displayedSheets.length, isMenuOpen]);

    const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
    const handleTouchMove = (e) => { touchEndX.current = e.targetTouches[0].clientX; };
    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const dist = touchStartX.current - touchEndX.current;
        if (dist > 50) goNext();
        if (dist < -50) goPrev();
        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    const toggleMetronome = () => {
        if (metroPlaying) { metronomeEngine.stop(); setMetroPlaying(false); }
        else { metronomeEngine.start(); setMetroPlaying(true); }
    };
    const handleBpmChange = (e) => {
        const newBpm = parseInt(e.target.value, 10);
        setBpm(newBpm);
        metronomeEngine.setBpm(newBpm);
    };

    useEffect(() => { return () => metronomeEngine.stop(); }, []);

    if (!isAuthenticated) {
        return (
            <div className="h-[100dvh] w-screen flex items-center justify-center bg-gray-950 text-gray-100 font-sans p-4">
                <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
                        <IconLock className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">FolkRepertoire</h1>
                    <p className="text-gray-400 text-sm text-center mb-6">Enter your password to access the sheet music collection.</p>
                    <form onSubmit={handleLogin} className="w-full space-y-4">
                        <div>
                            <input type="password" placeholder="Password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className={`w-full px-4 py-3 bg-gray-950 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${loginError ? 'border-red-500 focus:ring-red-500' : 'border-gray-800 focus:ring-blue-500'}`} autoFocus />
                            {loginError && <p className="text-xs text-red-400 mt-2 ml-1">Incorrect password. Please try again.</p>}
                        </div>
                        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all font-semibold rounded-xl text-white shadow-lg shadow-blue-600/20">Unlock Repertoire</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[100dvh] w-screen flex flex-col bg-gray-900 text-gray-100 font-sans overflow-hidden">
            {isMenuOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" onClick={() => setIsMenuOpen(false)}></div>}

            {/* SIDEBAR */}
            <div className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-gray-900 border-r border-gray-800 z-50 transform transition-transform duration-300 flex flex-col shadow-2xl ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 shrink-0">
                    <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2"><IconMusic className="w-5 h-5 text-blue-500" /> Song List ({sheets.length})</h2>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"><IconX className="w-5 h-5" /></button>
                </div>

                <div className="p-4 border-b border-gray-800 space-y-4 bg-gray-900/50 shrink-0">
                    <div className="relative">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="text" placeholder="Search repertoire..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-950 border border-gray-700 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner" />
                        {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"><IconX className="w-4 h-4" /></button>}
                    </div>
                    <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer select-none w-max">
                        <input type="checkbox" checked={showFavoritesOnly} onChange={(e) => setShowFavoritesOnly(e.target.checked)} className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900 cursor-pointer" />
                        <span>Show Favorites Only</span>
                    </label>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-1 bg-gray-950/30">
                    {displayedSheets.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm mt-8 flex flex-col items-center"><IconSearch className="w-8 h-8 mb-2 opacity-20" /> No matching songs found.</div>
                    ) : (
                        displayedSheets.map((sheet) => (
                            <button key={sheet.id} onClick={() => { setActiveId(sheet.id); if (window.innerWidth < 768) setIsMenuOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between group transition-colors ${activeId === sheet.id ? 'bg-blue-600/20 text-blue-400 font-medium border border-blue-500/30' : 'text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent'}`}>
                                <span className="truncate pr-2 text-sm">{sheet.name}</span>
                                <span className="flex items-center gap-1.5 shrink-0">
                                    {soundsBySong[sheet.id]?.length > 0 && <IconMusic className="w-3.5 h-3.5 text-gray-500" />}
                                    {sheet.isFavorite && <IconHeart solid={true} className={`w-4 h-4 ${activeId === sheet.id ? 'text-blue-400' : 'text-red-500 opacity-60 group-hover:opacity-100'}`} />}
                                </span>
                            </button>
                        ))
                    )}
                </div>
                <div className="p-3 border-t border-gray-800 text-xs font-mono text-gray-500 text-center bg-gray-900 shrink-0">{displayedSheets.length} {displayedSheets.length === 1 ? 'RESULT' : 'RESULTS'}</div>
            </div>

            {/* TOP HEADER */}
            <div className="h-16 shrink-0 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-3 sm:px-4 z-20 shadow-md">
                <div className="flex items-center space-x-3">
                    <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors active:scale-95"><IconMenu className="w-6 h-6" /></button>
                    <h1 className="font-bold text-lg hidden sm:block text-blue-400 truncate">Repertoire</h1>
                    <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors border ${showFavoritesOnly ? 'bg-red-900/30 text-red-400 border-red-500/30' : 'bg-gray-700/50 hover:bg-gray-600 border-transparent text-gray-300'}`}>
                        <IconHeart solid={showFavoritesOnly} className="w-5 h-5" />
                        <span className="text-sm font-medium hidden md:block">Favorites</span>
                    </button>

                    <div className="flex items-center bg-gray-900/80 p-1 rounded-lg border border-gray-700 ml-1 sm:ml-4 shadow-inner">
                        <button onClick={() => setViewMode('viewer')} className={`p-1.5 rounded-md transition-all ${viewMode === 'viewer' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`} title="Sheet Viewer"><IconMusic className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('map')} className={`p-1.5 rounded-md transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`} title="World Map Overview"><IconMap className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="flex items-center bg-gray-900/60 rounded-xl p-1 px-3 border border-gray-700 shadow-inner">
                    <button onClick={toggleMetronome} className={`w-8 h-8 flex items-center justify-center rounded-lg mr-3 transition-all ${metroPlaying ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.5)]' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                        {metroPlaying ? <div className="w-3 h-3 bg-white rounded-sm animate-pulse"></div> : <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                    </button>
                    <div className="flex flex-col w-20 sm:w-32">
                        <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 font-mono mb-1">
                            <span>BPM</span><span className="font-bold text-gray-200">{bpm}</span>
                        </div>
                        <input type="range" min="40" max="240" value={bpm} onChange={handleBpmChange} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black outline-none min-h-0" tabIndex={0}>
                {displayedSheets.length === 0 ? (
                    <div className="text-gray-500 flex flex-col items-center">
                        <IconMusic className="w-16 h-16 mb-4 opacity-20" />
                        <p>No sheets found in this view.</p>
                        {searchQuery ? <p className="text-sm mt-2 text-gray-600">Try clearing your search.</p> : sheets.length === 0 && <p className="text-sm mt-2 text-gray-600">Add images to src/assets/images, e.g. "Greensleeves (England).png".</p>}
                    </div>
                ) : viewMode === 'map' ? (
                    <WorldMap 
                        sheets={displayedSheets} 
                        onSelect={(id) => { 
                            setActiveId(id); 
                            setViewMode('viewer'); 
                        }} 
                    />
                ) : (
                    <>
                        <div className="absolute inset-y-0 left-0 w-1/6 md:w-32 z-10 flex items-center justify-start group cursor-pointer" onClick={goPrev}>
                            <div className="ml-4 p-3 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hidden md:block"><IconChevronLeft className="w-8 h-8" /></div>
                        </div>

                        <div className="absolute inset-y-0 right-0 w-1/6 md:w-32 z-10 flex items-center justify-end group cursor-pointer" onClick={goNext}>
                            <div className="mr-4 p-3 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hidden md:block"><IconChevronRight className="w-8 h-8" /></div>
                        </div>

                        {activeSheet && (
                            <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                                <img key={activeSheet.id} src={activeSheet.url} alt={activeSheet.name} className="sheet-image max-w-full max-h-full object-contain rounded shadow-lg" draggable="false" />

                                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-xl flex items-center space-x-3 border border-gray-700/50 shadow-2xl">
                                    <span className="font-semibold text-sm max-w-[150px] sm:max-w-md truncate">{activeSheet.name}</span>
                                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(activeSheet.id); }} className={`p-1.5 rounded-full transition-transform active:scale-90 ${activeSheet.isFavorite ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                                        <IconHeart solid={activeSheet.isFavorite} className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* PLAYLIST (only for songs with matching sound files) */}
            {viewMode === 'viewer' && activeSheet && activeTracks.length > 0 && (
                <PlaylistPlayer key={activeSheet.id} tracks={activeTracks} />
            )}

            {/* BOTTOM THUMBNAILS - Safe area padding added for mobile */}
            <div className="h-24 sm:h-28 shrink-0 bg-gray-900 border-t border-gray-800 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] overflow-x-auto hide-scrollbar flex items-center space-x-2 sm:space-x-3 shadow-[0_-10px_20px_rgba(0,0,0,0.3)] z-20">
                {displayedSheets.map((sheet) => (
                    <div key={sheet.id} onClick={() => setActiveId(sheet.id)} className={`relative h-full shrink-0 w-16 sm:w-20 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden ${sheet.id === activeId ? 'ring-2 ring-blue-500 scale-95 opacity-100' : 'opacity-50 hover:opacity-100'}`}>
                        <img src={sheet.url} alt={sheet.name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 to-transparent p-1 pt-6">
                            <p className="text-[9px] font-medium truncate text-center text-gray-300">{sheet.name}</p>
                        </div>
                        {sheet.isFavorite && (
                            <div className="absolute top-1 right-1 text-red-500"><IconHeart solid={true} className="w-3 h-3 drop-shadow-md" /></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;
