/* Importações para utilizar arquivos externos */
import { map, usuarioIcon } from "./mapa.js";
import { encontrarPontosProximos } from "./calculos.js"; 

let dadosDosPontos = []; // Variavel global para utilizar em outras funções

async function carregarPontos() {
  const resposta = await fetch("./dados/coletas.json"); //Pega o JSON dos pontos que criei.
  dadosDosPontos = await resposta.json(); // converte para JSON para ser possivel pegar suas propiedades
  dadosDosPontos.forEach((p) => {
    L.marker([p.lat, p.lng]).addTo(map).bindPopup(`<b>${p.nome}</b>`);
  });
}
/*
    O JSON segue a ideia de Chave = "valor"
    Quando você passa p.nome, que nem no exemplo do forEach ele pega o VALOR do p.nome, 
    que pode ser qualquer coisa que foi definida
*/


// Atualizar interface recebe a nova localização (Ou do GPS ou do Campo de busca) 
// e ela coordena todas as mudanças visuais que devem acontecer no mapa e na lista lateral...

function atualizarInterface(lat, lng, titulo) {
  map.flyTo([lat, lng], 15); //Vai pra localização e da um zoom...
  L.marker([lat, lng], { icon: usuarioIcon }) // Ele cria um novo marcador para na posição exata do usuario (icon: usuarioIcon ==> Icone que vem do ./mapa.js) 
    .addTo(map)  //Adiciona ao MAPA
    .bindPopup(titulo) // Cria um popup que exibe o titulo
    .openPopup(); // Abre apos adicionar.

  const proximos = encontrarPontosProximos(lat, lng, dadosDosPontos); // É passada a localizacao atual e a lista .json que temos. É chamada uma função da ./calculos.js
  const listaUl = document.getElementById("lista"); //Criamo uma lista sem ordem
  listaUl.innerHTML = ""; // Inicialmente vazio, mas quando a função é chamada ela lista a lista para vir outra....

  proximos.forEach((p) => { // Loop ele percorre os 3 endereços pré-definidos na função encontrarPontosProximos();
    const li = document.createElement("li"); // Cria um elemento li
    li.classList = "item-lista"
    li.innerHTML = `<strong>${p.nome}</strong><br><small>${p.distancia.toFixed(2)} km</small>`; // Na lista é exibido o nome da localização e a distância da sua localização até ela!
    li.onclick = () => map.flyTo([p.lat, p.lng], 17); // Quando você clica no endereço o mapa redireciona até o endereço clicado....
    listaUl.appendChild(li); // adiciona essas Li dentro da UL
  });
}


document.getElementById("btn-location").addEventListener("click", () => { // Botão + Ação ao executar botao da Localização Atual... Essa é pega pelo navegador!
  navigator.geolocation.getCurrentPosition((pos) => {
    atualizarInterface(pos.coords.latitude, pos.coords.longitude, "Você");
  });
});

document.getElementById("btn-buscar").addEventListener("click", async () => { //  Botão + Ação no botao da busca, 
  const query = document.getElementById("input-endereco").value; // ao clicar ele pega o texto digitado no input-endereco
  const res = await fetch( // FETCH ==> Realiza busca na API OpenStreetMap, é como se ele entrasse no site e jogasse o endereço la e retornasse a latitude e longitude... Mas feito via API REST (https)
    `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=br&limit=1`, // ?format=json é o jeito que o dado irá retornar, q=${query} é o texto que o usuario digitou. &countrycodes=br(é pego no BRASIL) limit=1(Apenas um retorno)
  );
  const dados = await res.json(); // Converte oque pegou para JSON.
  if (dados.length > 0) // Verifica se foi pego algum dado.
    atualizarInterface(
      parseFloat(dados[0].lat), // Caso venha mais de um sempre pega a 1º lat, 
      parseFloat(dados[0].lon), // Caso venha mais de um sempre pega a 1º lon, 
      "Localização", // --> Texto exibido no pop-up
    );
});

carregarPontos(); // Chamada da função por ultimo quando todos os elementos estiverem carregados.
