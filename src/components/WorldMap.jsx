import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { geoPath, geoNaturalEarth1 } from 'd3-geo';

const GEO_DICT = {
    "Argentinien*": [-64.0, -34.6], "Argentinien": [-64.0, -34.6],
    "Deutschland": [10.4, 51.1], "Deutschland (Schwaben)": [9.8, 48.3],
    "Brasilien": [-51.9, -14.2],
    "Bolivien*": [-68.1, -16.2],
    "Ukraine": [31.1, 48.3],
    "Ägypten": [30.8, 26.8],
    "Uganda*": [32.2, 1.3], "Uganda": [32.2, 1.3],
    "Spanien (Mallorca)": [2.9, 39.6],
    "Italien (Friaul)": [13.2, 46.1], "Italien (Neapel)": [14.2, 40.8], "Italien (Apulien)": [16.8, 41.1], "Italien": [12.5, 41.8],
    "Algerien": [1.6, 28.0],
    "Bulgarien": [25.4, 42.7],
    "Chile": [-71.5, -35.6],
    "Frankreich (Bretagne)": [-2.9, 48.2], "Frankreich (Elsass)": [7.4, 48.3], "Frankreich": [2.2, 46.2],
    "Georgien": [43.3, 42.3],
    "Griechenland": [22.0, 39.0],
    "Iran": [53.6, 32.4],
    "Niederlande": [5.2, 52.1],
    "Palästina": [35.2, 31.9],
    "Peru": [-75.0, -9.1],
    "Polen": [19.1, 51.9],
    "Portugal": [-8.2, 39.3],
    "USA": [-95.7, 37.0],
    "Kanada": [-106.3, 56.1],
    "China": [104.1, 35.8],
    "Kolumbien": [-74.0, 4.5],
    "Indien": [78.9, 20.5], "Indien*": [78.9, 20.5],
    "Libanon": [35.8, 33.8],
    "Kurdistan (Region)*": [43.9, 36.1],
    "Roma/Balkan*": [21.1, 42.7],
    "Japan / Irland": [138.2, 36.2], 
    "Klezmer (aschkenasisch-jüdisch, Osteuropa)": [25.0, 50.0],
    "Slowakei": [19.6, 48.6],
    "Schweden": [18.6, 60.1],
    "Nepal": [84.1, 28.3],
    "Türkei": [35.2, 38.9],
    "Wales*": [-3.8, 52.3],
    "Kongo*": [23.0, -4.0]
};

const Tooltip = ({ data, x, y, visible, activeId, onSelect, onClose }) => {
    if (!visible || !data) return null;

    return (
        <div 
            className="fixed p-3 sm:p-4 text-xl sm:text-2xl text-gray-800 transform -rotate-1 z-[60] bg-[#fffac2] border border-[#d4cc7e] shadow-[2px_4px_15px_rgba(0,0,0,0.3)] flex flex-col"
            style={{ 
                left: `${x}px`, 
                top: `${y}px`,
                width: 'max-content',
                maxWidth: '280px',
                maxHeight: '320px',
                borderRadius: '2px 10px 3px 8px / 10px 2px 8px 3px'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="font-bold border-b border-gray-400 mb-2 pb-1 text-[#d94a38] flex justify-between items-center shrink-0">
                <span className="pr-4 truncate">{data.countriesTitle}</span>
                <button 
                    onClick={onClose}
                    className="text-gray-500 hover:text-black font-sans text-base transition-colors"
                >
                    ✕
                </button>
            </div>
            <ul className="list-none pl-1 pr-2 leading-tight m-0 overflow-y-auto hide-scrollbar space-y-1">
                {data.songs.map(song => (
                    <li key={song.id}>
                        <button
                            onClick={() => {
                                onSelect(song.id);
                                onClose();
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded transition-colors text-[18px] ${song.id === activeId ? 'bg-[#d94a38]/20 font-bold text-[#a72818]' : 'hover:bg-[#d94a38]/10'}`}
                        >
                            {song.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default function WorldMap({ sheets, activeId, onSelect }) {
    const [worldData, setWorldData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredCountry, setHoveredCountry] = useState(null); 
    const [tooltipData, setTooltipData] = useState({ visible: false, x: 0, y: 0, data: null });
    
    const mapContainerRef = useRef(null);
    const svgRef = useRef(null);
    const zoomRef = useRef(null);
    
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [zoomState, setZoomState] = useState({ k: 1, x: 0, y: 0 });

    // Extract regions and aggregate coordinates
    const markersData = useMemo(() => {
        const mapData = {};
        sheets.forEach(song => {
            if (!song.region) return;
            const coords = GEO_DICT[song.region];
            if (coords) {
                const key = coords.join(",");
                if (!mapData[key]) {
                    mapData[key] = { coords: coords, countries: new Set(), songs: [] };
                }
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

    const handleMarkerClick = (event, markerData) => {
        event.stopPropagation();
        
        // Calculate tooltip position
        let px = event.clientX + 15;
        let py = event.clientY + 15;
        if (px + 280 > window.innerWidth) px = Math.max(10, event.clientX - 295);
        if (py + 150 > window.innerHeight) py = Math.max(10, event.clientY - 165);

        setTooltipData({ visible: true, x: px, y: py, data: markerData });
        if (markerData.countries.size > 0) {
            setHoveredCountry(Array.from(markerData.countries)[0]);
        }

        // Zoom into marker
        const [x, y] = projection(markerData.coords);
        if (svgRef.current && zoomRef.current) {
            const svg = d3.select(svgRef.current);
            svg.transition().duration(750).call(
                zoomRef.current.transform,
                d3.zoomIdentity
                    .translate(dimensions.width / 2, dimensions.height / 2)
                    .scale(4)
                    .translate(-x, -y)
            );
        }
    };

    const handleBackgroundClick = () => {
        setTooltipData({ visible: false, x: 0, y: 0, data: null });
        setHoveredCountry(null);
    };

    return (
        <div ref={mapContainerRef} className="w-full h-full relative cursor-move overflow-hidden select-none" onClick={handleBackgroundClick}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap');
                
                .map-theme-layer {
                    background-color: #f4ecd8;
                    background-image: 
                        radial-gradient(#e5d8bc 1px, transparent 1px),
                        linear-gradient(transparent 95%, rgba(0,0,0,0.05) 95%);
                    background-size: 20px 20px, 100% 40px;
                    font-family: 'Caveat', cursive;
                }
                
                @keyframes float {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
                    50% { transform: translateY(-20px) rotate(10deg); opacity: 0.2; }
                    100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
                }
            `}</style>
            
            <div className="absolute inset-0 map-theme-layer z-0 pointer-events-none"></div>
            
            {/* Background Music Theme Decorations */}
            <div className="absolute text-[#8c7a61] opacity-[0.03] pointer-events-none z-0 left-[5%] top-[20%] text-[200px] font-sans">𝄞</div>
            <div className="absolute opacity-10 pointer-events-none font-sans text-[#8c7a61] animate-[float_15s_infinite_ease-in-out]" style={{ top: '10%', right: '15%', fontSize: '4rem', animationDelay: '0s' }}>♪</div>
            <div className="absolute opacity-10 pointer-events-none font-sans text-[#8c7a61] animate-[float_15s_infinite_ease-in-out]" style={{ top: '30%', left: '40%', fontSize: '3rem', animationDelay: '2s' }}>♫</div>
            <div className="absolute opacity-10 pointer-events-none font-sans text-[#8c7a61] animate-[float_15s_infinite_ease-in-out]" style={{ bottom: '20%', right: '30%', fontSize: '5rem', animationDelay: '1s' }}>♬</div>
            <div className="absolute opacity-10 pointer-events-none font-sans text-[#8c7a61] animate-[float_15s_infinite_ease-in-out]" style={{ bottom: '10%', left: '20%', fontSize: '3.5rem', animationDelay: '3s' }}>♩</div>

            <svg width="0" height="0" className="absolute pointer-events-none">
                <defs>
                    <filter id="sketched">
                        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                </defs>
            </svg>

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#f4ecd8]/80 backdrop-blur-sm z-20">
                    <p className="text-4xl animate-pulse text-[#8c7a61] font-[Caveat]">Zeichne Weltkarte...</p>
                </div>
            )}

            <svg ref={svgRef} width="100%" height="100%" style={{ outline: 'none' }} className="absolute inset-0 z-10 block">
                <g filter="url(#sketched)" transform={`translate(${zoomState.x}, ${zoomState.y}) scale(${zoomState.k})`}>
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
                        const isMarkerHovered = Array.from(marker.countries).some(c => hoveredCountry && c === hoveredCountry.replace('*', ''));
                        
                        const baseRadius = isMarkerHovered ? 8 : 4;
                        const currentRadius = baseRadius / Math.sqrt(zoomState.k);
                        const currentStrokeWidth = 1.5 / zoomState.k;
                        
                        return (
                            <g
                                key={`marker-${i}`}
                                className="cursor-pointer"
                                transform={`translate(${x}, ${y})`}
                                onMouseEnter={(e) => {
                                    if(marker.countries.size > 0) setHoveredCountry(Array.from(marker.countries)[0]);
                                }}
                                onMouseLeave={() => setHoveredCountry(null)}
                                onClick={(e) => handleMarkerClick(e, marker)}
                            >
                                <circle
                                    cx="0"
                                    cy="0"
                                    r={currentRadius}
                                    fill={isMarkerHovered ? "#a72818" : "#d94a38"}
                                    stroke="#3e332a"
                                    strokeWidth={currentStrokeWidth}
                                    style={{ transition: 'fill 0.2s ease, r 0.1s ease' }}
                                />
                                {zoomState.k > 3 && (
                                    <text
                                        x="0"
                                        y="0"
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fill="#fff"
                                        fontSize={currentRadius * 1.2}
                                        style={{ pointerEvents: 'none', fontFamily: 'sans-serif' }}
                                    >
                                        ♪
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </g>
            </svg>

            <Tooltip 
                visible={tooltipData.visible} 
                x={tooltipData.x} 
                y={tooltipData.y} 
                data={tooltipData.data} 
                activeId={activeId}
                onSelect={onSelect}
                onClose={() => setTooltipData({ visible: false, x: 0, y: 0, data: null })}
            />
        </div>
    );
}