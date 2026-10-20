import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DOMParser } from '@xmldom/xmldom';
import { zipSync, strToU8 } from 'fflate';
import { importMap } from '../src/import.js';
const xml = `<kml xmlns="http://www.opengis.net/kml/2.2"><Document><Style id="red"><LineStyle><color>ff0000ff</color><width>4</width></LineStyle></Style><Folder><name>Útvonalak</name><Placemark><name>A</name><styleUrl>#red</styleUrl><LineString><coordinates>19,47 20,48</coordinates></LineString></Placemark><Folder><name>Pontok</name><Placemark><Point><coordinates>19,47</coordinates></Point></Placemark></Folder></Folder></Document></kml>`;
test('KMZ preserves folder membership, coordinates and shared styles', () => {
  const groups = importMap(zipSync({'doc.kml': strToU8(xml)}), 'routes.kmz', DOMParser);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].name, 'Útvonalak');
  assert.equal(groups[0].data.features.length, 1);
  assert.deepEqual(groups[0].data.features[0].geometry.coordinates, [[19,47],[20,48]]);
  assert.equal(groups[0].data.features[0].properties.stroke, '#ff0000');
  assert.equal(groups[0].data.features[0].properties['stroke-width'], 4);
  assert.equal(groups[1].data.features[0].geometry.type, 'Point');
});
test('rejects missing KML, entities and empty documents', () => {
  assert.throws(() => importMap(zipSync({'a.txt': strToU8('no')}), 'a.kmz', DOMParser));
  assert.throws(() => importMap(strToU8('<!DOCTYPE kml><kml/>'), 'a.kml', DOMParser));
  assert.throws(() => importMap(strToU8('<kml/>'), 'a.kml', DOMParser));
});
