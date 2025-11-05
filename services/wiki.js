
const getWikiAPI = (language = 'en') => `https://${language}.wikipedia.org/w/api.php`;

export async function getNearby(lat, lon, radius = 1000, limit = 20, language = 'en') {
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

  const url = `${getWikiAPI(language)}?${params.toString()}`;
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

export async function getSummary(title, language = 'en') {
  if (!title) throw new Error('getSummary: title is required');
  const url = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Wikipedia summary error: ${res.status}`);
  const d = await res.json();
  return {
    id: d.pageid,
    title: d.title,
    description: d.description ?? null,
    extract: d.extract ?? '',
    image: d.originalimage?.source ?? d.thumbnail?.source ?? null,
    imageWidth: d.originalimage?.width ?? d.thumbnail?.width ?? null,
    imageHeight: d.originalimage?.height ?? d.thumbnail?.height ?? null,
    url: d.content_urls?.mobile?.page ?? d.content_urls?.desktop?.page ?? null,
  };
}

export default { getNearby, getSummary };
