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