const express = require('express');
const router = express.Router();
const SpotifyWebApi = require('spotify-web-api-node');
const dotenv = require('dotenv');

dotenv.config();

// Spotify API 설정
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
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

router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const data = await spotifyApi.searchTracks(query);
    const tracks = data.body.tracks.items.map(track => ({
      name: track.name,
      artists: track.artists.map(artist => artist.name),
      album: {
        name: track.album.name,
        images: track.album.images
      },
      duration_ms: track.duration_ms,
      preview_url: track.preview_url
    }));

    res.json(tracks);
  } catch (error) {
    console.error('Error searching tracks:', error);
    res.status(500).json({ error: 'An error occurred while searching tracks' });
  }
});

module.exports = router;