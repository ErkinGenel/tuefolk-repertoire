import { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { geoPath, geoNaturalEarth1 } from 'd3-geo';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';

const userFirebaseConfig = {
    apiKey: "AIzaSyC5zZGumULldodFaHMvenHq-BSfD57X51U",
    authDomain: "tuefolk.firebaseapp.com",
    projectId: "tuefolk",
    storageBucket: "tuefolk.firebasestorage.app",
    messagingSenderId: "599412217839",
    appId: "1:599412217839:web:304f84455b27dbd474481a"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' && __firebase_config 
    ? JSON.parse(__firebase_config) 
    : userFirebaseConfig;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' && __app_id ? __app_id : 'tuefolk-repertoire';

const SONGS_DATA = [
    { id: 1, name: "Apertura (Sergio Pinto)", country: "Argentinien*" },
    { id: 2, name: "Das Bürgerlied", country: "Deutschland" },
    { id: 3, name: "Cartomante", country: "Brasilien" },
    { id: 4, name: "Charagua", country: "Bolivien*" },
    { id: 5, name: "Chervona Ruta", country: "Ukraine" },
    { id: 6, name: "Eu Vi Mamãe Oxum", country: "Brasilien" },
    { id: 7, name: "Longa Farahfaza", country: "Ägypten" },
    { id: 8, name: "Omushiija Antiire", country: "Uganda*" },
    { id: 9, name: "Sa Pastera", country: "Spanien (Mallorca)" },
    { id: 10, name: "Schiarazula Marazula", country: "Italien (Friaul)" },
    { id: 11, name: "Hassebni u Khoud Karak", country: "Algerien" },
    { id: 12, name: "Ya Rayah", country: "Algerien" },
    { id: 13, name: "Merceditas", country: "Argentinien" },
    { id: 14, name: "Tvoite Ochi Leno", country: "Bulgarien" },
    { id: 15, name: "Despedida", country: "Chile" },
    { id: 16, name: "Gavotenn", country: "Frankreich (Bretagne)" },
    { id: 17, name: "Les Œufs en Meurette", country: "Frankreich" },
    { id: 18, name: "Kirialesa-Kintauri", country: "Georgien" },
    { id: 19, name: "Der Jungbrunnen", country: "Deutschland" },
    { id: 20, name: "Der Mond ist aufgegangen", country: "Deutschland" },
    { id: 21, name: "Gülbahar", country: "Griechenland" },
    { id: 22, name: "Dokhtare", country: "Iran" },
    { id: 23, name: "'O Te Voglio", country: "Italien (Neapel)" },
    { id: 24, name: "Amore Mio Non Piangere", country: "Italien" },
    { id: 25, name: "Menamenamo", country: "Italien" },
    { id: 26, name: "Mens Durf te Leven", country: "Niederlande" },
    { id: 27, name: "Ya Tal'een", country: "Palästina" },
    { id: 28, name: "Ojos Azules (Huayno)", country: "Peru" },
    { id: 29, name: "Czerwone Jabłuszko", country: "Polen" },
    { id: 30, name: "Quando Eu Era Pequenina", country: "Portugal" },
    { id: 31, name: "Ngabwa", country: "Uganda" },
    { id: 32, name: "Ja Pidu v Daleki Hory", country: "Ukraine" },
    { id: 33, name: "Pony Boy", country: "USA" },
    { id: 34, name: "Hilf, o Himmel", country: "Frankreich (Elsass)" },
    { id: 35, name: "Pelo Telefone", country: "Brasilien" },
    { id: 36, name: "The Crooked Stovepipe", country: "Kanada" },
    { id: 37, name: "Caicai Vilu", country: "Chile" },
    { id: 38, name: "Chun Jiang Hua Yue Ye (A Moonlit Night on the Spring River)", country: "China" },
    { id: 39, name: "Cumbia del Monte", country: "Kolumbien" },
    { id: 40, name: "El Helwa Di", country: "Ägypten" },
    { id: 41, name: "Tsangala da Gogona", country: "Georgien" },
    { id: 42, name: "Deutscher (58. Altländer)", country: "Deutschland" },
    { id: 43, name: "Kalitera sti Mavri Gis", country: "Griechenland" },
    { id: 44, name: "Kalyan", country: "Indien" },
    { id: 45, name: "Kameh (وقمح)", country: "Libanon" },
    { id: 46, name: "Yek Mumik", country: "Kurdistan (Region)*" },
    { id: 47, name: "Rumelay / Rumelaj", country: "Roma/Balkan*" },
    { id: 48, name: "Montanara di Carpino", country: "Italien (Apulien)" },
    { id: 49, name: "Bravade", country: "Niederlande" },
    { id: 50, name: "Apo Xeno Topo", country: "Griechenland" },
    { id: 51, name: "Japanisches Lied & irische Melodie", country: "Japan / Irland" },
    { id: 52, name: "Nakhes fun Kinder", country: "Klezmer (aschkenasisch-jüdisch, Osteuropa)" },
    { id: 53, name: "Maria Faia", country: "Portugal" },
    { id: 54, name: "Písali Noviny", country: "Slowakei" },
    { id: 55, name: "Der Schlossergsell", country: "Deutschland (Schwaben)" },
    { id: 56, name: "Polska", country: "Schweden" },
    { id: 57, name: "Sangini Dhun", country: "Nepal" },
    { id: 58, name: "Yüksek Yüksek Tepelere", country: "Türkei" },
    { id: 59, name: "Walzer 8-4", country: "Deutschland" },
    { id: 60, name: "1,2,3,4 Zwiefacher", country: "Deutschland" },
    { id: 61, name: "Migldi Magldi", country: "Wales*" },
    { id: 62, name: "Lo Sivano", country: "Kurdistan (Region)*" },
    { id: 63, name: "O Africa", country: "Kongo*" },
    { id: 64, name: "Suna Hai Hathi", country: "Indien*" },
    { id: 65, name: "Hicaz Mandıra", country: "Türkei" }
];

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

const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap');
        
        .map-app-container {
            background-color: #f4ecd8;
            background-image: 
                radial-gradient(#e5d8bc 1px, transparent 1px),
                linear-gradient(transparent 95%, rgba(0,0,0,0.05) 95%);
            background-size: 20px 20px, 100% 40px;
            font-family: 'Caveat', cursive;
            color: #3e332a;
        }

        .map-app-container ::-webkit-scrollbar { width: 8px; }
        .map-app-container ::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 4px; }
        .map-app-container ::-webkit-scrollbar-thumb { background: #b5a48b; border-radius: 4px; }
        .map-app-container ::-webkit-scrollbar-thumb:hover { background: #8e7d65; }

        .sketched-border {
            border: 2px solid #8c7a61;
            border-radius: 2px 255px 3px 25px / 255px 5px 225px 3px;
        }
        
        .song-item-transition { transition: all 0.2s ease; }

        .music-note {
            position: absolute;
            opacity: 0.1;
            pointer-events: none;
            font-family: sans-serif;
            color: #8c7a61;
            animation: float 15s infinite ease-in-out;
        }

        @keyframes float {
            0% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
            50% { transform: translateY(-20px) rotate(10deg); opacity: 0.2; }
            100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
        }

        .clef {
            position: absolute;
            font-size: 200px;
            opacity: 0.03;
            color: #8c7a61;
            pointer-events: none;
            z-index: 0;
            left: 5%;
            top: 20%;
        }

        .like-button-anim:active {
            transform: scale(0.8);
        }
    `}</style>
);

const Tooltip = ({ data, x, y, visible }) => {
    if (!visible || !data) return null;

    return (
        <div 
            className="fixed p-3 sm:p-4 text-xl sm:text-2xl text-gray-800 transform -rotate-1 pointer-events-none z-50 bg-[#fffac2] border border-[#d4cc7e] shadow-[2px_4px_10px_rgba(0,0,0,0.15)] rounded-[2px_10px_3px_8px_/_10px_2px_8px_3px]"
            style={{ 
                left: `${x}px`, 
                top: `${y}px`,
                width: 'max-content',
                maxWidth: '280px'
            }}
        >
            <div className="font-bold border-b border-gray-400 mb-2 pb-1 text-[#d94a38]">
                {data.countriesTitle}
            </div>
            <ul className="list-disc pl-5 leading-tight m-0">
                {data.songs.map(song => (
                    <li key={song.id}>{song.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default function App() {
    const [worldData, setWorldData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredCountry, setHoveredCountry] = useState(null); 
    const [tooltipData, setTooltipData] = useState({ visible: false, x: 0, y: 0, data: null });
    
    // Firebase states
    const [user, setUser] = useState(null);
    const [rawLikes, setRawLikes] = useState([]);
    
    const mapContainerRef = useRef(null);
    const svgRef = useRef(null);
    const zoomRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [zoomState, setZoomState] = useState({ k: 1, x: 0, y: 0 });

    useEffect(() => {
        // Authenticate silently to give user an ID for liking songs
        const initAuth = async () => {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(auth, __initial_auth_token);
            } else {
                await signInAnonymously(auth);
            }
        };
        initAuth();
        
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;
        
        // Listen to all public likes in real-time
        const likesRef = collection(db, 'artifacts', appId, 'public', 'data', 'song_likes');
        const unsubscribe = onSnapshot(likesRef, (snapshot) => {
            const fetchedLikes = [];
            snapshot.forEach(doc => fetchedLikes.push(doc.data()));
            setRawLikes(fetchedLikes);
        }, (error) => {
            console.error("Error fetching likes: ", error);
        });

        return () => unsubscribe();
    }, [user]);

    const likesData = useMemo(() => {
        const data = {};
        rawLikes.forEach(like => {
            if (!data[like.songId]) {
                data[like.songId] = { count: 0, isLikedByMe: false };
            }
            data[like.songId].count++;
            if (like.userId === user?.uid) {
                data[like.songId].isLikedByMe = true;
            }
        });
        return data;
    }, [rawLikes, user]);

    const markersData = useMemo(() => {
        const mapData = {};
        SONGS_DATA.forEach(song => {
            const coords = GEO_DICT[song.country];
            if (coords) {
                const key = coords.join(",");
                if (!mapData[key]) {
                    mapData[key] = { coords: coords, countries: new Set(), songs: [] };
                }
                mapData[key].countries.add(song.country.replace('*', ''));
                mapData[key].songs.push(song);
            }
        });
        
        return Object.values(mapData).map(item => ({
            ...item,
            countriesTitle: Array.from(item.countries).join(" / ")
        }));
    }, []);

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

    const handleZoomToCountry = (countryStr) => {
        const coords = GEO_DICT[countryStr];
        if (coords && svgRef.current && zoomRef.current) {
            const [x, y] = projection(coords);
            const svg = d3.select(svgRef.current);
            svg.transition().duration(1000).call(
                zoomRef.current.transform,
                d3.zoomIdentity
                    .translate(dimensions.width / 2, dimensions.height / 2)
                    .scale(3.5)
                    .translate(-x, -y)
            );
        }
    };

    const handleMarkerHover = (event, markerData) => {
        let x = event.clientX + 15;
        let y = event.clientY + 15;

        // Smart tooltip positioning for mobile to prevent overflow
        if (x + 280 > window.innerWidth) x = Math.max(10, event.clientX - 295);
        if (y + 150 > window.innerHeight) y = Math.max(10, event.clientY - 165);

        setTooltipData({ visible: true, x, y, data: markerData });
        if(markerData.countries.size > 0) {
            setHoveredCountry(Array.from(markerData.countries)[0]);
        }
    };

    const handleMarkerOut = () => {
        setTooltipData({ visible: false, x: 0, y: 0, data: null });
        setHoveredCountry(null);
    };

    const handleMarkerClick = (event, markerData) => {
        event.stopPropagation();
        handleMarkerHover(event, markerData);

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
        if (markerData.songs.length > 0) {
            const el = document.getElementById(`list-item-${markerData.songs[0].id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const toggleLike = async (event, songId) => {
        event.stopPropagation();
        if (!user) return;
        
        const isLiked = likesData[songId]?.isLikedByMe;
        const docId = `${songId}_${user.uid}`;
        const likeRef = doc(db, 'artifacts', appId, 'public', 'data', 'song_likes', docId);
        
        try {
            if (isLiked) {
                await deleteDoc(likeRef);
            } else {
                await setDoc(likeRef, { songId, userId: user.uid });
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const isSongHovered = (songCountry) => {
        if (!hoveredCountry) return false;
        return hoveredCountry.replace('*', '') === songCountry.replace('*', '');
    };

    return (
        <div className="map-app-container w-full h-[100dvh] flex flex-col md:flex-row overflow-hidden relative">
            <GlobalStyles />
            
            {/* Background Music Theme Decorations */}
            <div className="clef">𝄞</div>
            <div className="music-note" style={{ top: '10%', right: '15%', fontSize: '4rem', animationDelay: '0s' }}>♪</div>
            <div className="music-note" style={{ top: '30%', left: '40%', fontSize: '3rem', animationDelay: '2s' }}>♫</div>
            <div className="music-note" style={{ bottom: '20%', right: '30%', fontSize: '5rem', animationDelay: '1s' }}>♬</div>
            <div className="music-note" style={{ bottom: '10%', left: '20%', fontSize: '3.5rem', animationDelay: '3s' }}>♩</div>

            <svg width="0" height="0" className="absolute pointer-events-none">
                <defs>
                    <filter id="sketched">
                        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                </defs>
            </svg>

            {/* Sidebar List */}
            <div className="w-full md:w-1/3 lg:w-1/4 h-[45%] md:h-full order-2 md:order-1 border-t-4 md:border-t-0 md:border-r-4 border-dashed border-[#a6967f] flex flex-col p-2 sm:p-4 bg-white/70 backdrop-blur-md z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-xl relative">
                
                <div className="mb-2 sm:mb-6 text-center shrink-0 flex flex-col items-center">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#d94a38] mb-1 leading-tight">
                        TüFolk Tüfolkestra
                    </h1>
                    <h2 className="text-xl sm:text-2xl text-[#736351] m-0 font-semibold border-b-2 border-[#d94a38]/30 pb-2 inline-block">
                        Repertoire
                    </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 pb-4">
                    {SONGS_DATA.map(song => {
                        const hasCoords = !!GEO_DICT[song.country];
                        const isHovered = isSongHovered(song.country);
                        const songLikes = likesData[song.id] || { count: 0, isLikedByMe: false };
                        
                        return (
                            <div 
                                key={song.id}
                                id={`list-item-${song.id}`}
                                className={`song-item-transition p-3 mb-2 sketched-border cursor-pointer text-xl sm:text-2xl flex justify-between items-center group
                                    ${isHovered ? 'bg-[#f7dfd4] border-[#d94a38] translate-x-1 shadow-sm' : 'bg-white/60 hover:bg-[rgba(217,74,56,0.15)] hover:translate-x-1 hover:border-[#d94a38]'}`}
                                onMouseEnter={() => hasCoords && setHoveredCountry(song.country.replace('*',''))}
                                onMouseLeave={() => hasCoords && setHoveredCountry(null)}
                                onClick={() => hasCoords && handleZoomToCountry(song.country)}
                            >
                                <div className="flex-1 overflow-hidden flex items-start gap-2">
                                    <span className="text-[#8c7a61] opacity-40 font-sans text-sm mt-1">🎵</span>
                                    <div className="overflow-hidden">
                                        <div className="font-bold whitespace-nowrap overflow-hidden text-ellipsis text-[#3e332a]" title={song.name}>
                                            {song.id}. {song.name}
                                        </div>
                                        <div className="text-lg text-[#8c7a61] truncate">{song.country}</div>
                                    </div>
                                </div>
                                <div className="ml-2 flex-shrink-0 flex items-center gap-3">
                                    {/* Like Button */}
                                    <button 
                                        onClick={(e) => toggleLike(e, song.id)}
                                        className={`like-button-anim flex items-center gap-1 transition-colors duration-200 outline-none
                                            ${songLikes.isLikedByMe ? 'text-red-500' : 'text-[#a6967f] hover:text-red-400 opacity-60 group-hover:opacity-100'}`}
                                        title={songLikes.isLikedByMe ? "Gefällt mir nicht mehr" : "Gefällt mir"}
                                    >
                                        <svg viewBox="0 0 24 24" fill={songLikes.isLikedByMe ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-6 h-6 sm:w-7 sm:h-7">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                        </svg>
                                        {songLikes.count > 0 && (
                                            <span className="text-lg sm:text-xl font-bold font-sans">{songLikes.count}</span>
                                        )}
                                    </button>

                                    {/* Location Pin */}
                                    {hasCoords ? (
                                        <span className={`text-[#d94a38] transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>📍</span>
                                    ) : (
                                        <span className="text-gray-400 text-lg opacity-50" title="Keine Koordinaten">?</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Map Area */}
            <div ref={mapContainerRef} className="w-full md:w-2/3 lg:w-3/4 h-[55%] md:h-full order-1 md:order-2 relative cursor-move bg-transparent" onClick={handleMarkerOut}>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#f4ecd8]/80 backdrop-blur-sm z-20">
                        <p className="text-4xl animate-pulse text-[#8c7a61]">Zeichne Weltkarte...</p>
                    </div>
                )}

                <svg ref={svgRef} width="100%" height="100%" style={{ outline: 'none' }} className="relative z-10">
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
                                    onMouseEnter={(e) => handleMarkerHover(e, marker)}
                                    onMouseLeave={handleMarkerOut}
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
                                    {/* Small note inside marker when zoomed in closely */}
                                    {zoomState.k > 3 && (
                                        <text
                                            x="0"
                                            y="0"
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                            fill="#fff"
                                            fontSize={currentRadius * 1.2}
                                            style={{ pointerEvents: 'none' }}
                                        >
                                            ♪
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </g>
                </svg>

                <Tooltip visible={tooltipData.visible} x={tooltipData.x} y={tooltipData.y} data={tooltipData.data} />
            </div>
        </div>
    );
}