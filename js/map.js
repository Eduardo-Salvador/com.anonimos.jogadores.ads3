'use strict';

let mapaInicializado = false;
let map;
let markersLayer;

async function initMap(endpoint = 'https://comanonimosjogadoresads3-production.up.railway.app/reunioes?size=50') {

  if (!mapaInicializado) {
    mapaInicializado = true;

    map = L.map('map').setView([-23.5505, -46.6333], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
  }

  try {
    markersLayer.clearLayers();

    const res = await fetch(endpoint);
    const data = await res.json();

    const reunioes = data.content ?? data ?? [];

    for (const r of reunioes) {

      const coords = await geocodificar(r.endereco);

      if (!coords) continue;

      L.marker([coords.lat, coords.lng])
        .addTo(markersLayer)
        .bindPopup(`
          <div style="min-width:200px">
            <strong>${r.titulo}</strong><br>
            ${r.endereco}
          </div>
        `);
    }

  } catch (e) {
    console.error('Erro ao carregar mapa:', e);
  }

  setTimeout(() => map.invalidateSize(), 300);
}