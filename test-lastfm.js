
const apiKey = "9cb0b4149461b1448b00668cf94e5a59";
const username = "Egiii012";

async function testLastFM() {
  const url = `http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${username}&api_key=${apiKey}&period=6month&limit=3&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('Tracks:', JSON.stringify(data, null, 2));

  const urlArtists = `http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${username}&api_key=${apiKey}&period=6month&limit=3&format=json`;
  const resArtists = await fetch(urlArtists);
  const dataArtists = await resArtists.json();
  console.log('Artists:', JSON.stringify(dataArtists, null, 2));
}

testLastFM();
