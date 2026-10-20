import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';
import { importMap } from './import.js';
const map = L.map('map').setView([47.16, 19.5], 7);
const status = document.querySelector('#status');
const sidebar = document.querySelector('#sidebar');
const sidebarToggle = document.querySelector('#sidebar-toggle');
sidebarToggle.onclick = () => {
  sidebar.hidden = !sidebar.hidden;
  sidebarToggle.setAttribute('aria-expanded', String(!sidebar.hidden));
  sidebarToggle.textContent = sidebar.hidden ? 'Oldalsáv megjelenítése' : 'Oldalsáv elrejtése';
  map.invalidateSize({ pan: false });
};
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).on('tileerror', () => { status.textContent = 'Az alaptérkép nem tölthető be. Ellenőrizd az internetkapcsolatot.'; }).addTo(map);
let projects = [];
const rendered = [];
const storageKey = 'kdanni-map-v1';
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(projects)); }
  catch { status.textContent = 'A rétegek láthatók, de a helyi mentéshez nincs elegendő tárhely.'; }
}
function fit() {
  const bounds = L.latLngBounds([]);
  for (const layer of rendered) if (map.hasLayer(layer)) bounds.extend(layer.getBounds());
  if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
}
function button(text, action) {
  const b = document.createElement('button'); b.textContent = text; b.onclick = action; return b;
}
function render() {
  rendered.forEach(layer => map.removeLayer(layer)); rendered.length = 0;
  const panel = document.querySelector('#layers'); panel.replaceChildren();
  projects.forEach((project, index) => {
    const section = document.createElement('section');
    const title = document.createElement('h2'); title.textContent = project.name;
    section.append(title, button('Eltávolítás', () => { projects.splice(index, 1); save(); render(); }));
    project.groups.forEach(group => {
      const layer = L.geoJSON(group.data, {
        style: f => ({ color: f.properties.stroke || '#2563eb', weight: f.properties['stroke-width'] ?? 3,
          opacity: f.properties['stroke-opacity'] ?? 1, fillColor: f.properties.fill,
          fillOpacity: f.properties['fill-opacity'] ?? 0.2 }),
        pointToLayer: (_f, latlng) => L.circleMarker(latlng, { radius: 6 }),
        onEachFeature: (feature, featureLayer) => {
          const content = document.createElement('div');
          const name = document.createElement('strong'); name.textContent = feature.properties.name || 'Névtelen elem';
          const description = document.createElement('p'); description.textContent = feature.properties.description || '';
          content.append(name, description); featureLayer.bindPopup(content);
        }
      });
      rendered.push(layer); if (group.visible) layer.addTo(map);
      const row = document.createElement('div'); row.className = 'layer';
      const label = document.createElement('label'); const checkbox = document.createElement('input');
      checkbox.type = 'checkbox'; checkbox.checked = group.visible;
      checkbox.onchange = () => { group.visible = checkbox.checked; group.visible ? layer.addTo(map) : map.removeLayer(layer); save(); };
      label.append(checkbox, document.createTextNode(`${group.name} (${group.data.features.length})`));
      row.append(label, button('Mutat', () => { const bounds = layer.getBounds(); if (bounds.isValid()) map.fitBounds(bounds, { maxZoom: 16 }); }));
      section.append(row);
    }); panel.append(section);
  });
}
document.querySelector('#files').onchange = async event => {
  const files = Array.from(event.target.files);
  for (const file of files) {
    try {
      const groups = importMap(new Uint8Array(await file.arrayBuffer()), file.name);
      projects.push({ name: file.name, groups }); render();
      status.textContent = `${file.name}: ${groups.length} csoport importálva.`; save();
    } catch (error) { status.textContent = `${file.name}: ${error.message}`; }
  }
  fit(); event.target.value = '';
};
document.querySelector('#fit').onclick = fit;
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!Array.isArray(saved)) throw new Error('Invalid session');
  projects = saved; render(); fit();
} catch { projects = []; render(); status.textContent = 'A mentett rétegek nem tölthetők be; importáld őket újra.'; }
