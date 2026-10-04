# FolkRepertoire

Sheet-music viewer with favorites, a metronome and a world map that shows where each song comes from.

## Run

```bash
npm install
npm run dev      # development
npm run build    # production build in dist/
npm run preview  # serve the production build
```

## Add songs

Put images (`png`, `jpg`, `jpeg`, `gif`, `webp`) into `src/assets/images/`.
The text in brackets in the file name is the region used for the map:

```
Greensleeves (England).png
Hava Nagila (Israel).jpg
```

Known region words are listed in `src/lib/regions.js`. Add a new place by giving it a
latitude/longitude there; unknown regions appear as grey markers along the bottom of the map.

## Map calibration

`src/lib/regions.js` projects latitude/longitude to the map with a linear (equirectangular)
projection. If every marker is shifted by the same amount, adjust `MAP_BOUNDS` there.

## Password

The password (`folk`) is set at the top of `src/App.jsx`. It is checked in the browser only,
so it is a gate for casual visitors, not real security.
