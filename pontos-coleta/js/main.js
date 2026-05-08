import { map, usuarioIcon } from "./mapa.js";
import { encontrarPontosProximos } from "./calculos.js";

let dadosDosPontos = [];
async function carregarPontos() {
  const resposta = await fetch("./dados/coletas.json");
  dadosDosPontos = await resposta.json();
  dadosDosPontos.forEach((p) => {
    L.marker([p.lat, p.lng]).addTo(map).bindPopup(`<b>${p.nome}</b>`);
  });
}

function atualizarInterface(lat, lng, titulo) {
  map.flyTo([lat, lng], 15);
  L.marker([lat, lng], { icon: usuarioIcon })
    .addTo(map)
    .bindPopup(titulo)
    .openPopup();

  const proximos = encontrarPontosProximos(lat, lng, dadosDosPontos);
  const listaUl = document.getElementById("lista");
  listaUl.innerHTML = "";

  proximos.forEach((p) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${p.nome}</strong><br><small>${p.distancia.toFixed(2)} km</small>`;
    li.onclick = () => map.flyTo([p.lat, p.lng], 17);
    listaUl.appendChild(li);
  });
}


document.getElementById("btn-location").addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition((pos) => {
    atualizarInterface(pos.coords.latitude, pos.coords.longitude, "Você");
  });
});

document.getElementById("btn-buscar").addEventListener("click", async () => {
  const query = document.getElementById("input-endereco").value;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=br&limit=1`,
  );
  const dados = await res.json();
  if (dados.length > 0)
    atualizarInterface(
      parseFloat(dados[0].lat),
      parseFloat(dados[0].lon),
      "Localização",
    );
});

carregarPontos();
