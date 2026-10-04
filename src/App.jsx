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

const getMapCoordinates = (id, regionName) => {
    // Generate a deterministic hash based on the song's filename
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Deterministic offset (-2% to +2%) to prevent exact overlapping of pins in the same country
    const offsetX = ((Math.abs(hash * 31) % 40) / 10) - 2;
    const offsetY = ((Math.abs(hash * 73) % 40) / 10) - 2;

    const regionsMap = {
        'german': { x: 51, y: 27 }, 'germany': { x: 51, y: 27 },
        'french': { x: 48.5, y: 29 }, 'france': { x: 48.5, y: 29 },
        'english': { x: 47, y: 26 }, 'uk': { x: 47, y: 26 }, 'england': { x: 47, y: 26 },
        'ireland': { x: 46, y: 26 }, 'irish': { x: 46, y: 26 },
        'scottish': { x: 46.5, y: 25 }, 'scotland': { x: 46.5, y: 25 },
        'spanish': { x: 47, y: 32 }, 'spain': { x: 47, y: 32 },
        'italian': { x: 51, y: 32 }, 'italy': { x: 51, y: 32 },
        'swedish': { x: 52, y: 20 }, 'sweden': { x: 52, y: 20 },
        'norwegian': { x: 50.5, y: 20 }, 'norway': { x: 50.5, y: 20 },
        'danish': { x: 51, y: 24 }, 'denmark': { x: 51, y: 24 },
        'finnish': { x: 54, y: 19 }, 'finland': { x: 54, y: 19 },
        'russian': { x: 65, y: 22 }, 'russia': { x: 65, y: 22 },
        'polish': { x: 53, y: 26 }, 'poland': { x: 53, y: 26 },
        'ukrainian': { x: 56, y: 27 }, 'ukraine': { x: 56, y: 27 },
        'turkish': { x: 57, y: 33 }, 'turkey': { x: 57, y: 33 },
        'greek': { x: 54, y: 34 }, 'greece': { x: 54, y: 34 },
        'arabic': { x: 58, y: 40 },
        'american': { x: 22, y: 32 }, 'usa': { x: 22, y: 32 },
        'canadian': { x: 22, y: 25 }, 'canada': { x: 22, y: 25 },
        'mexican': { x: 19, y: 43 }, 'mexico': { x: 19, y: 43 },
        'brazilian': { x: 32, y: 62 }, 'brazil': { x: 32, y: 62 },
        'argentinian': { x: 28, y: 75 }, 'argentina': { x: 28, y: 75 },
        'japanese': { x: 86, y: 32 }, 'japan': { x: 86, y: 32 },
        'chinese': { x: 78, y: 35 }, 'china': { x: 78, y: 35 },
        'korean': { x: 83, y: 33 }, 'korea': { x: 83, y: 33 },
        'indian': { x: 70, y: 42 }, 'india': { x: 70, y: 42 },
        'australian': { x: 85, y: 75 }, 'australia': { x: 85, y: 75 },
        'celtic': { x: 46.5, y: 26 },
        'yiddish': { x: 54, y: 27 },
        'israel': { x: 58, y: 36 }, 'jewish': { x: 58, y: 36 },
        'dutch': { x: 49, y: 26 }, 'netherlands': { x: 49, y: 26 },
        'belgian': { x: 49, y: 27 }, 'belgium': { x: 49, y: 27 },
        'swiss': { x: 50, y: 29 }, 'switzerland': { x: 50, y: 29 },
        'austrian': { x: 52, y: 29 }, 'austria': { x: 52, y: 29 },
        'czech': { x: 53, y: 27 },
        'hungarian': { x: 54, y: 29 }, 'hungary': { x: 54, y: 29 },
        'romanian': { x: 55, y: 30 }, 'romania': { x: 55, y: 30 },
        'bulgarian': { x: 56, y: 32 }, 'bulgaria': { x: 56, y: 32 },
        'serbian': { x: 54, y: 31 }, 'serbia': { x: 54, y: 31 },
        'croatian': { x: 53, y: 31 }, 'croatia': { x: 53, y: 31 },
        'portuguese': { x: 46, y: 33 }, 'portugal': { x: 46, y: 33 }
    };

    if (regionName) {
        const key = regionName.toLowerCase();
        
        // Exact Match First
        if (regionsMap[key]) {
            return { 
                x: Math.max(0, Math.min(100, regionsMap[key].x + offsetX)), 
                y: Math.max(0, Math.min(100, regionsMap[key].y + offsetY)) 
            };
        }
        
        // Fuzzy Match Fallback (e.g., "French Canadian" matching "French")
        for (const [rKey, rCoords] of Object.entries(regionsMap)) {
            if (key.includes(rKey)) {
                return { 
                    x: Math.max(0, Math.min(100, rCoords.x + offsetX)), 
                    y: Math.max(0, Math.min(100, rCoords.y + offsetY)) 
                };
            }
        }
    }
    
    // FALLBACK: If no region found, distribute pseudo-randomly within bounding boxes
    const fallbackRegions = [
        [15, 30, 20, 35], // North America
        [25, 35, 55, 75], // South America
        [45, 55, 20, 35], // Europe
        [48, 60, 45, 65], // Africa
        [65, 85, 20, 45], // Asia
        [75, 88, 70, 85]  // Oceania
    ];
    const regionIdx = Math.abs(hash) % fallbackRegions.length;
    const region = fallbackRegions[regionIdx];
    
    // Distribute pseudo-randomly within the selected region
    const x = region[0] + (Math.abs(hash * 31) % (region[1] - region[0]));
    const y = region[2] + (Math.abs(hash * 73) % (region[3] - region[2]));
    
    return { x, y };
};

const WorldMap = ({ sheets, activeId, onSelect }) => {
    const [hoveredSheet, setHoveredSheet] = useState(null);

    return (
        <div className="absolute inset-0 bg-[#060a13] flex items-center justify-center overflow-hidden z-0">
            {/* Dot-matrix style world map SVG background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none p-4 sm:p-10">
                <svg viewBox="0 0 1008 650" className="w-full max-w-6xl h-auto" preserveAspectRatio="xMidYMid meet">
                    <path fill="#3b82f6" d="M305,129c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S307,129,305,129z M287,144c-3,0-5,2-5,5c0,3,2,5,5,5c3,0,5-2,5-5C292,146,290,144,287,144z M323,161c-3,0-5,2-5,5c0,3,2,5,5,5c3,0,5-2,5-5C328,163,326,161,323,161z M273,169c-2,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S276,169,273,169z M301,180c-3,0-5,2-5,5c0,3,2,5,5,5c2,0,5-2,5-5C306,183,304,180,301,180z M258,197c-3,0-5,2-5,5c0,3,2,5,5,5c3,0,5-2,5-5C263,199,261,197,258,197z M288,206c-3,0-5,2-5,5c0,3,2,5,5,5c2,0,5-2,5-5C293,208,291,206,288,206z M271,228c-3,0-5,2-5,5c0,3,2,5,5,5c2,0,5-2,5-5C276,231,274,228,271,228z M253,248c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S256,248,253,248z M277,265c-2,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S280,265,277,265z M316,259c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S318,259,316,259z M305,291c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S307,291,305,291z M342,284c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S345,284,342,284z M330,317c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S333,317,330,317z M367,314c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S369,314,367,314z M315,348c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S318,348,315,348z M353,353c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S355,353,353,353z M381,385c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S383,385,381,385z M341,399c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S344,399,341,399z M367,429c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S369,429,367,429z M350,466c-2,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S353,466,350,466z M475,138c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S478,138,475,138z M513,116c-3,0-5,2-5,5c0,3,2,5,5,5c2,0,5-2,5-5C518,118,515,116,513,116z M551,130c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S554,130,551,130z M502,159c-2,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S505,159,502,159z M484,188c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S487,188,484,188z M528,185c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S530,185,528,185z M565,165c-3,0-5,2-5,5c0,3,2,5,5,5c3,0,5-2,5-5C570,167,568,165,565,165z M606,149c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S609,149,606,149z M642,126c-3,0-5,2-5,5c0,3,2,5,5,5c3,0,5-2,5-5C647,128,645,126,642,126z M683,141c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S685,141,683,141z M651,166c-2,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S654,166,651,166z M609,186c-2,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S612,186,609,186z M574,204c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S576,204,574,204z M529,223c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S532,223,529,223z M491,234c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S493,234,491,234z M474,271c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S477,271,474,271z M511,265c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S514,265,511,265z M547,258c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S550,258,547,258z M586,242c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S588,242,586,242z M628,217c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S631,217,628,217z M671,199c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S674,199,671,199z M716,183c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S719,183,716,183z M764,177c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S767,177,764,177z M810,195c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S812,195,810,195z M771,215c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S774,215,771,215z M735,221c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S738,221,735,221z M695,237c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S698,237,695,237z M654,258c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S657,258,654,258z M617,285c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S619,285,617,285z M579,307c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S582,307,579,307z M542,301c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S544,301,542,301z M498,312c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S501,312,498,312z M509,350c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S512,350,509,350z M551,348c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S554,348,551,348z M593,348c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S596,348,593,348z M636,326c-2,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S639,326,636,326z M678,298c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S680,298,678,298z M720,277c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S723,277,720,277z M764,253c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S766,253,764,253z M815,247c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S818,247,815,247z M859,256c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S862,256,859,256z M824,289c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S827,289,824,289z M778,295c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S781,295,778,295z M740,323c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S742,323,740,323z M695,348c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S698,348,695,348z M654,374c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S657,374,654,374z M616,400c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S618,400,616,400z M579,426c-2,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S582,426,579,426z M536,448c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S539,448,536,448z M509,394c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S512,394,509,394z M542,385c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S544,385,542,385z M707,388c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S709,388,707,388z M751,364c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S753,364,751,364z M796,338c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S799,338,796,338z M843,307c-2,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S846,307,843,307z M896,326c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S898,326,896,326z M863,356c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S866,356,863,356z M820,380c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S823,380,820,380z M776,401c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S779,401,776,401z M738,429c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S741,429,738,429z M701,455c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S704,455,701,455z M793,440c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S796,440,793,440z M843,409c-3,0-5,2-5,5s2,5,5,5c2,0,5-2,5-5S846,409,843,409z M898,393c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S901,393,898,393z M865,429c-3,0-5,2-5,5s2,5,5,5c3,0,5-2,5-5S868,429,865,429z" />
                </svg>
            </div>
            
            {/* Overlay Container perfectly aligning with SVG viewBox aspect ratio */}
            <div className="relative w-full max-w-6xl aspect-[1008/650] px-4 sm:px-10 pointer-events-none">
                {sheets.map(sheet => {
                    const coords = getMapCoordinates(sheet.id, sheet.region);
                    const isActive = sheet.id === activeId;
                    return (
                        <div 
                            key={sheet.id}
                            className={`absolute w-3 h-3 md:w-4 md:h-4 -ml-1.5 -mt-1.5 md:-ml-2 md:-mt-2 rounded-full cursor-pointer transition-all duration-300 pointer-events-auto ${isActive ? 'bg-blue-400 scale-[2] md:scale-150 z-20 shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'bg-gray-400/80 hover:bg-white hover:scale-150 z-10 shadow-sm'}`}
                            style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                            onClick={() => onSelect(sheet.id)}
                            onMouseEnter={() => setHoveredSheet(sheet)}
                            onMouseLeave={() => setHoveredSheet(null)}
                        />
                    );
                })}

                {/* Animated Map Tooltip */}
                {hoveredSheet && (
                    <div 
                        className="absolute z-30 flex flex-col items-center bg-gray-900/95 backdrop-blur-md border border-gray-600 p-2 rounded-xl shadow-2xl transition-opacity transform -translate-x-1/2 -translate-y-full pb-3 pointer-events-none"
                        style={{ 
                            left: `${getMapCoordinates(hoveredSheet.id, hoveredSheet.region).x}%`, 
                            top: `${getMapCoordinates(hoveredSheet.id, hoveredSheet.region).y}%`,
                            marginTop: '-12px'
                        }}
                    >
                        <img src={hoveredSheet.url} alt="" className="w-24 h-32 object-cover rounded border border-gray-700 shadow-md mb-2 bg-white" />
                        <span className="text-[10px] md:text-xs font-bold text-white whitespace-nowrap px-1 max-w-[120px] md:max-w-[150px] truncate">{hoveredSheet.name}</span>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-600"></div>
                    </div>
                )}
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