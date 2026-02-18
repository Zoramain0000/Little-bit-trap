import axios from 'axios';

const getApiUrl = (provider, ipAddress) => {
  switch (provider) {
    case 'abstract':
      return `https://api.abstractapi.com/v1/geoip?ipAddress=${ipAddress}&api_key=04e3e0dc50f34d74a60dc7b45a4abf1d`;
    case 'geolocationio':
      return `https://api.ipgeolocation.io/ipgeo?apiKey=294f98a3977343a8a33f35b7e25d5e61&ip=${ipAddress}`;
    case 'ip2location':
      return `https://api.ip2location.com/?ip=${ipAddress}&key=E30841E50B64D74EC7D7CBE6159A6C28c&package=WS6`;
    case 'locationiq':
      return `https://us1.locationiq.com/v1/reverse.php?key=59bcca48bceb97833ffa74410f5bd7b7&lat=45.464&lon=9.189&format=json`;
    case 'graphhopper':
      return `https://graphhopper.com/api/1/geocode?q=${ipAddress}&key=2f497f07-cb55-40f1-ac27-34d020addeba`;
    case 'geoapify':
      return `https://api.geoapify.com/v1/ipinfo?ip=${ipAddress}&apiKey=a0809826225144cbb40eeebf7d63d0c7`;
    case 'geocodingmaps':
      return `https://geocoding.maps.com/api/v1/geocode?ip=${ipAddress}&key=662e28fce0b7f817139327cpx78b703`;
    case 'opencagedata':
      return `https://api.opencagedata.com/geocode/v1/json?q=${ipAddress}&key=6da4b5e698bc4e638dd31ebc9fe7af38`;
    case 'distancematrix':
      return `https://distancematrix.ai/api/v1/route?key=jumQOWCDAbJlt45oCWGFdxXjlKu524y3gSvZI42KH0XLHUeP4XFC3ciq51HJ7UhT&ip=${ipAddress}`;
    case 'zipcodeapi':
      return `https://api.zipcodestack.com/v1/lookup?apikey=01HWQERGEF9KQ4SH4Y6SFQBDHY&ip=${ipAddress}`;
    case 'billingWhoisFreak':
      return `https://billimg.whoisfreak.com/v1/details?apikey=2b5d04a532924334868c28e9e9749c87&ip=${ipAddress}`;
    case 'ipGeolocationWhoisXmlApi':
      return `https://ip-geolocation.whoisxmlapi.com/api/v1?apiKey=at_Ti38rIdTUk3Mj0Vg5KkiT2dtoP8a1&ipAddress=${ipAddress}`;
    case 'dnsHistoryWhoisXmlApi':
      return `https://dns-history.whoisxmlapi.com/api/v1?apiKey=at_Ti38rIdTUk3Mj0Vg5KkiT2dtoP8a1&ipAddress=${ipAddress}`;
    case 'cloudflareTrace':
      return `https://api.cloudflare.com/client/v4/trace?ip=${ipAddress}`;
    case 'ipdata':
      return `https://api.ipdata.co/${ipAddress}?api-key=133f11117637a688c35e0464c0911b763c6736f81ab24a30aaef9d07`;
    case 'metadapi':
      return `https://metadapi.com/api/${ipAddress}?key=90210`;
    case 'smarty':
      return `https://smarty.com/api/${ipAddress}?key=ptv9P3P6b7Jl9O8DyddQ`;
    default:
      return null;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { ip, providers } = req.body;
  
  console.log(`🔍 Tracking ${ip} (${providers.length} APIs)`);
  
  const results = [];
  
  for (const provider of providers) {
    try {
      const url = getApiUrl(provider, ip);
      if (!url) continue;
      
      const response = await axios.get(url, { timeout: 8000 });
      const data = response.data;
      
      // Parse coordinates from various formats
      const lat = data.latitude || data.lat || data.location?.lat || data.geo?.lat || 
                  data.results?.[0]?.geometry?.location?.lat || data.coordinates?.[0];
      const lon = data.longitude || data.lon || data.location?.lon || data.geo?.lon || 
                  data.results?.[0]?.geometry?.location?.lng || data.coordinates?.[1];
      const city = data.city || data.location?.city || data.geolocation?.city || 'N/A';
      const country = data.country || data.country_name || data.country_code || 'N/A';
      const isp = data.isp || data.organization || data.asn?.name || 'N/A';

      if (lat && lon && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon))) {
        results.push({
          provider,
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          city,
          country,
          isp
        });
      }
    } catch (e) {
      console.log(`${provider}: ${e.message}`);
    }
  }

  res.json({
    success: true,
    results,
    stats: { total: providers.length, valid: results.length }
  });
}