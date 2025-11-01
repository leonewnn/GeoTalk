

const WIKI_API = 'https://en.wikipedia.org/w/api.php';


export async function getNearby(lat, lon, radius = 1000, limit = 20) {
  if (lat == null || lon == null) {
    throw new Error('getNearby: lat and lon are required');
  }

  const params = new URLSearchParams({
    action: 'query',
    list: 'geosearch',
    gscoord: `${lat}|${lon}`,
    gsradius: String(radius),
    gslimit: String(limit),
    format: 'json',
    origin: '*', 
  });

  const url = `${WIKI_API}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Wikipedia API error: ${res.status}`);
  }

  const data = await res.json();
  const items = data?.query?.geosearch ?? [];

 
  return items.map(({ pageid, title, lat, lon, dist }) => ({
    id: pageid,
    title,
    lat,
    lon,
    dist,
  }));
}

export default { getNearby };
