// Fórmula de Haversine
// Calcula a distância entre dois pontos geográficos no planeta Terra.
export function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
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

export function encontrarPontosProximos(latUsuario, lngUsuario, listaPontos, quantidade = 3) {
  const pontosComDistancia = listaPontos.map((ponto) => {
    const dist = calcularDistancia(latUsuario, lngUsuario, ponto.lat, ponto.lng);
    return { ...ponto, distancia: dist };
  });

  pontosComDistancia.sort((a, b) => a.distancia - b.distancia);
  return pontosComDistancia.slice(0, quantidade);
}
