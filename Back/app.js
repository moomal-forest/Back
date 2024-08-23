const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

dotenv.config();

// DB 라우터 imports
const userRoutes = require('./routes/userRoutes');
const diaryRoutes = require('./routes/diaryRoutes');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // 프론트엔드(리액트) 서버 주소
  credentials: true
}));  // cors를 미들웨어로 사용

const port = 3080;

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

app.get('/search', async (req, res) => {
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

//데이터베이스 연결
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// DB 라우터 설정
app.use('/api/users', userRoutes);
app.use('/api/diaries', diaryRoutes);

// 서버의 루트 경로('/')에 대한 GET 요청 처리
app.get('/', (req, res) => {
  res.send('Welcome to the Moomalforest API');
});

// 서버 오류 처리
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
});

// 3080 서버 실행
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});