import { map, usuarioIcon } from "./mapa.js";
import { encontrarPontosProximos } from "./calculos.js";

// ─── Estado global ────────────────────────────────────────────────────────────
let dadosDosPontos = [];
let marcadorUsuario = null;

// ─── Elementos do DOM ─────────────────────────────────────────────────────────
const estadoVazio      = document.getElementById("estado-vazio");
const estadoLoading    = document.getElementById("estado-loading");
const estadoErro       = document.getElementById("estado-erro");
const textoErro        = document.getElementById("texto-erro");
const resultadosContainer = document.getElementById("resultados-container");
const listaUl          = document.getElementById("lista");
const resultadoContagem = document.getElementById("resultado-contagem");

// ─── Helpers de UI ────────────────────────────────────────────────────────────
function mostrarEstado(estado) {
  estadoVazio.style.display    = "none";
  estadoLoading.classList.remove("ativo");
  estadoErro.classList.remove("ativo");
  resultadosContainer.style.display = "none";

  if (estado === "vazio")      estadoVazio.style.display = "block";
  if (estado === "loading")    estadoLoading.classList.add("ativo");
  if (estado === "erro")       estadoErro.classList.add("ativo");
  if (estado === "resultado")  resultadosContainer.style.display = "block";
}

function mostrarErro(msg) {
  textoErro.textContent = msg;
  mostrarEstado("erro");
}

// ─── Carregar pontos do JSON ───────────────────────────────────────────────────
async function carregarPontos() {
  try {
    const resposta = await fetch("./dados/coletas.json");
    dadosDosPontos = await resposta.json();
    dadosDosPontos.forEach((p) => {
      L.marker([p.lat, p.lng])
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'DM Sans',sans-serif; min-width:160px;">
            <strong style="font-size:.9rem; color:#0d3d26;">${p.nome}</strong><br>
            <small style="color:#666;">${p.endereco}</small>
          </div>
        `);
    });
    document.getElementById("contagem-mapa").textContent =
      `${dadosDosPontos.length} pontos cadastrados`;
  } catch (e) {
    console.error("Erro ao carregar pontos:", e);
  }
}

// ─── Atualizar mapa e lista lateral ───────────────────────────────────────────
function atualizarInterface(lat, lng, titulo) {
  // Remove marcador anterior do usuário, se existir
  if (marcadorUsuario) map.removeLayer(marcadorUsuario);

  map.flyTo([lat, lng], 15);

  marcadorUsuario = L.marker([lat, lng], { icon: usuarioIcon })
    .addTo(map)
    .bindPopup(`
      <div style="font-family:'DM Sans',sans-serif;">
        <strong style="color:#1a7a4a;">📍 ${titulo}</strong>
      </div>
    `)
    .openPopup();

  const proximos = encontrarPontosProximos(lat, lng, dadosDosPontos, 3);

  listaUl.innerHTML = "";
  proximos.forEach((p, i) => {
    const li = document.createElement("li");
    li.className = "card-ponto";
    li.innerHTML = `
      <div class="card-ponto-topo">
        <div class="card-ponto-rank ${i === 0 ? "rank-1" : ""}">${i + 1}</div>
        <span class="card-ponto-nome">${p.nome}</span>
        <span class="card-ponto-dist">${p.distancia.toFixed(1)} km</span>
      </div>
      <div class="card-ponto-end">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        ${p.endereco}
      </div>
      <div class="card-ponto-hint">Clique para ver no mapa</div>
    `;
    li.addEventListener("click", () => {
      map.flyTo([p.lat, p.lng], 17);
      // Abre popup do marcador mais próximo visualmente
    });
    listaUl.appendChild(li);
  });

  resultadoContagem.textContent = `${proximos.length} de ${dadosDosPontos.length}`;
  mostrarEstado("resultado");
}

// ─── Detectar se input é CEP ────────────────────────────────────────────────
function isCEP(texto) {
  return /^\d{5}-?\d{3}$/.test(texto.trim());
}

// ─── Buscar coordenadas a partir de CEP (ViaCEP + Nominatim) ─────────────────
async function buscarPorCEP(cep) {
  const cepLimpo = cep.replace("-", "");
  // 1. ViaCEP retorna o endereço completo
  const resViaCep = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
  const dadosCep = await resViaCep.json();
  if (dadosCep.erro) throw new Error("CEP não encontrado.");

  // 2. Monta endereço legível e busca coordenadas no Nominatim
  const enderecoCompleto = `${dadosCep.logradouro}, ${dadosCep.localidade}, ${dadosCep.uf}, Brasil`;
  return await buscarCoordenadas(enderecoCompleto);
}

// ─── Buscar coordenadas a partir de endereço livre (Nominatim) ───────────────
async function buscarCoordenadas(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=1`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "pt-BR" }
  });
  const dados = await res.json();
  if (!dados.length) throw new Error("Endereço não encontrado. Tente incluir a cidade ou o CEP.");
  return { lat: parseFloat(dados[0].lat), lng: parseFloat(dados[0].lon), titulo: dados[0].display_name.split(",")[0] };
}

// ─── Evento: botão Buscar ──────────────────────────────────────────────────
document.getElementById("btn-buscar").addEventListener("click", async () => {
  const query = document.getElementById("input-endereco").value.trim();
  if (!query) return;

  mostrarEstado("loading");

  try {
    let resultado;
    if (isCEP(query)) {
      resultado = await buscarPorCEP(query);
    } else {
      resultado = await buscarCoordenadas(query);
    }
    atualizarInterface(resultado.lat, resultado.lng, resultado.titulo || "Localização buscada");
  } catch (e) {
    mostrarErro(e.message || "Não foi possível encontrar esse endereço.");
  }
});

// ─── Suporte a Enter no campo de busca ──────────────────────────────────────
document.getElementById("input-endereco").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("btn-buscar").click();
});

// ─── Evento: botão Localização atual ────────────────────────────────────────
document.getElementById("btn-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    mostrarErro("Seu navegador não suporta geolocalização.");
    return;
  }
  mostrarEstado("loading");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      atualizarInterface(pos.coords.latitude, pos.coords.longitude, "Você está aqui");
    },
    () => {
      mostrarErro("Não foi possível obter sua localização. Verifique as permissões do navegador.");
    }
  );
});

// ─── Inicialização ────────────────────────────────────────────────────────────
carregarPontos();
mostrarEstado("vazio");
