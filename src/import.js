import { unzipSync, strFromU8 } from 'fflate';
import { kml } from '@tmcw/togeojson';
const MAX_SIZE = 30 * 1024 * 1024;
export function importMap(bytes, filename, Parser = DOMParser) {
  if (bytes.byteLength > MAX_SIZE) throw new Error('A fájl legfeljebb 30 MB lehet.');
  let xml;
  if (/\.kmz$/i.test(filename)) {
    let total = 0;
    const entries = unzipSync(bytes, { filter: entry => {
      total += entry.originalSize;
      if (total > MAX_SIZE) throw new Error('A kibontott KMZ túl nagy (maximum 30 MB).');
      return /\.kml$/i.test(entry.name);
    } });
    const names = Object.keys(entries);
    const name = names.find(n => n.toLowerCase() === 'doc.kml') ?? names[0];
    if (!name) throw new Error('A KMZ nem tartalmaz KML fájlt.');
    xml = strFromU8(entries[name]);
  } else if (/\.kml$/i.test(filename)) xml = strFromU8(bytes);
  else throw new Error('Csak KML és KMZ fájl importálható.');
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('Külső XML-entitások nem engedélyezettek.');
  const doc = new Parser().parseFromString(xml, 'text/xml');
  if (doc.getElementsByTagName('parsererror').length || doc.documentElement.localName !== 'kml')
    throw new Error('Érvénytelen KML dokumentum.');
  const folders = [...Array.from(doc.getElementsByTagName('Folder'))];
  const groups = [];
  for (const container of [doc.documentElement, ...folders]) {
    const items = Array.from(container.getElementsByTagName('Placemark')).filter(pm => {
      let parent = pm.parentNode;
      while (parent && parent !== container) {
        if (parent.nodeName.split(':').pop() === 'Folder') return false;
        parent = parent.parentNode;
      }
      return true;
    });
    if (!items.length) continue;
    const copy = doc.cloneNode(true);
    for (const pm of Array.from(copy.getElementsByTagName('Placemark'))) pm.parentNode.removeChild(pm);
    const target = copy.getElementsByTagName('Document')[0] ?? copy.documentElement;
    for (const pm of items) target.appendChild(copy.importNode(pm, true));
    const data = kml(copy);
    data.features = data.features.filter(f => f.geometry);
    if (data.features.length) groups.push({ name: Array.from(container.childNodes).find(n => n.nodeName === 'name')?.textContent || filename, data, visible: true });
  }
  if (!groups.length) throw new Error('Nem található megjeleníthető térképi elem.');
  return groups;
}
