
//Fórmula de Haversine 
/*
  Essa função executa toda a formula de Haversine, nela é possivel você descobrir a distância de dois pontos de qualquer lugar do planeta Terra!
 */
export function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; //Raio da Terra
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Essa função serve para encontrar
export function encontrarPontosProximos(latUsuario, lngUsuario, listaPontos) { //ListaPontos armazena aquele JSON...
  const pontosComDistancia = listaPontos.map((ponto) => {
    const dist = calcularDistancia(
      latUsuario,
      lngUsuario,
      ponto.lat,
      ponto.lng,
    );
    return { ...ponto, distancia: dist };
  });

  pontosComDistancia.sort((a, b) => a.distancia - b.distancia); // .sort() Organiza os elementos de uma lista! 
  //a.distancia - b.distancia --> é feita a verificação em ordem crescente(Se o resultado der negativo, o ponto a é mais perto que o b e o colca antes na fila)
  //Se for positivo o resultado --> o ponto b é o mais perto e ele assume a frente
  // Ao final da lista o ponto do indice[0](primeiro) será o mais proximo da localização
  return pontosComDistancia.slice(0, 3); //Slice define até onde pode ser exibida a lista, ou seja irá exibir os indices: [0], [1], [2]... a partir do [3] não exibe.
  // Ou seja o slice é o limita a quantidade de itens!
}
