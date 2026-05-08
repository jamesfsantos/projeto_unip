export const map = L.map("map").setView([-23.5182, -46.6817], 13); // Exportando a variavel map para utilizar-la em outros arquivos
// L.map("map") procura no meu documento HTML uma div que tenha o id="map" para desenhar o mapa dentro dela!
// .setView([lat, lng], zoom) essas coordenadas padrões foi algo delimitado para região da faculdade! 13 é o nivel de zoom.

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap",
}).addTo(map);
//O Leaflet, por si só, é apenas um quadro em branco. Este código baixa as imagens dos mapas (quadrados chamados de tiles):
/*
  URL: O endereço aponta para os servidores do OpenStreetMap. Os termos {s}, {z}, {x}, {y} são variáveis que o Leaflet troca automaticamente para baixar os pedaços corretos do mapa conforme você move a tela.
  attribution: É o crédito obrigatório aos cartógrafos do OpenStreetMap. Aparece naquele textinho pequeno no canto inferior do mapa.
  .addTo(map): adiciona o mapa desenhado ao que criamos la em cima!
*/

export const usuarioIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41], // Tamanho da imagem (largura, altura)
  iconAnchor: [12, 41], // Qual ponto da imagem "toca" a coordenada real
  popupAnchor: [1, -34], // Onde o balão de texto (popup) vai brotar em relação ao ícone
  shadowSize: [41, 41], // Tamanho da sombra
});

/*
  Como os marcadores padrão do Leaflet são azuis, este código cria um objeto de configuração para um marcador vermelho.
  iconAnchor: Este é o mais importante para a precisão. 
  Como o pin termina em uma pontinha embaixo, o valor [12, 41] garante que essa pontinha esteja exatamente em cima da latitude/longitude correta. 
  Se estiver errado, o ícone parece que está "flutuando" ou "deslocado" do lugar real.
*/