# map.kdanni.hu

- A Google Earth Pro asztali számítógépen 2027. június 25-től nem lesz letölthető.
- Asztali alkalmazás a Google Earth kiváltására
- Kimitált funkcionalitás elégséges
  - Open street map megjelenítés
    - Megjegyzés: Valójában prefelált az Open street map, a jelen Google Earth Pro használat közben egy Open Street map layer van használatban.
  - KMZ rétegek importálása és megjelenítése
    - Praktikusan több Google térkép exportja egy térképen megjelenítve.


## Első működő alap (Windows)

Electron + Leaflet alkalmazás OpenStreetMap alaptérképpel. Több KML/KMZ egyszerre
importálható. A mappák külön kapcsolhatók, a rétegek eltávolíthatók és térképre
illeszthetők. A vonalak színe és vastagsága megmarad; pontok körjelölővel jelennek
meg. A megnyitott rétegeket a program helyben, localStorage-ban menti.

### Fejlesztés

Node.js 24 és npm szükséges. A repository gyökerében:

```sh
npm ci
npm test
npm run dev
```

Az asztali alkalmazás indítása (grafikus környezetben):

```sh
npm start
```

### Windows telepítő

Windows alatt:

```sh
npm ci
npm run dist:win
```

A telepítő a `release/` könyvtárba kerül. A GitHub Actions minden push/PR esetén
Windows alatt tesztel és telepítőt épít; sikeres futás után a
`kdanni-map-windows` artifact tölthető le. A telepítő jelenleg nincs aláírva.
A Windows telepítést és futást külön Windows gépen kell ellenőrizni.

### Korlátok és adatkezelés

- Az OSM csempékhez internet és `tile.openstreetmap.org` hozzáférés kell.
  Az OSM attribúció mindig látható. Nincs tömeges letöltés vagy offline mód;
  nagyobb terjesztés előtt a csempeszolgáltató felhasználási feltételeit és a
  https://operations.osmfoundation.org/policies/tiles/ szabályait ellenőrizni kell.
- A KMZ-ből a `doc.kml`, ennek hiányában az első KML kerül beolvasásra.
  Legfeljebb 30 MB-os fájl/kibontott archívum támogatott.
- A beágyazott képek, egyedi ikonok, hálózati linkek és földfelszíni képrétegek
  jelenleg nem támogatottak. A leírások szövegként jelennek meg.
- A helyi mentés tárhelykorlátos; az eredeti KMZ/KML fájlokat őrizd meg.
  A program nem tölti fel a rétegek tartalmát, de a látható térképrészlet csempéit
  az OSM szolgáltatótól kéri le.
- Nincs még keresés, szerkesztés vagy mérés.
- A Google Earth Pro letöltésének fent említett dátuma nincs ellenőrizve;
  a projekt tervezési céldátumaként szerepel.

Az importtesztek szintetikus adatokat használnak. A személyes mintafájl nem része
a repositorynak.
