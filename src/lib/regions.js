// ---------------------------------------------------------------------------
// Map projection
//
// The Wikimedia "World_map_blank_without_borders.svg" is drawn in an
// equirectangular projection, so longitude/latitude map linearly to x/y.
// If markers are shifted by a constant amount, tune MAP_BOUNDS (the lon/lat
// range the SVG actually covers) instead of editing individual countries.
// ---------------------------------------------------------------------------
export const MAP_BOUNDS = { west: -180, east: 180, north: 90, south: -90 };

export const project = (lat, lon) => ({
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

export const getRegionData = (regionName) => {
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
