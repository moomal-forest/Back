const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const port = 3000;

// Spotify API 설정
const spotifyApi = new SpotifyWebApi({
  clientId: '10f74f0d068b43e4a672cde78c8e6676',
  clientSecret: 'a90616967ae94de88f59d2b76adfb533'
});

// Spotify 액세스 토큰 갱신
async function refreshAccessToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log('Access token refreshed');
  } catch (error) {
    console.error('Error refreshing access token:', error);
  }
}

// 초기 액세스 토큰 설정
refreshAccessToken();

// 1시간마다 액세스 토큰 갱신
setInterval(refreshAccessToken, 3600000);

app.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const data = await spotifyApi.searchTracks(query);
    const tracks = data.body.tracks.items.map(track => ({
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      preview_url: track.preview_url
    }));

    res.json(tracks);
  } catch (error) {
    console.error('Error searching tracks:', error);
    res.status(500).json({ error: 'An error occurred while searching tracks' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});