import { useState, useRef, useMemo } from 'react';
import { IconHeart, IconX } from './icons.jsx';
import { getRegionData } from '../lib/regions.js';

const MAP_URL = import.meta.env.VITE_MAP_URL || 'https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg';

export default function WorldMap({ sheets, activeId, onSelect }) {
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
