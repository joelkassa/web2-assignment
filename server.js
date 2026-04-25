const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'movies.json');

const readMovies = () => {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
};

const writeMovies = (movies) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(movies, null, 2));
};

const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === '/movies' && method === 'GET') {
    const movies = readMovies();
    sendJSON(res, 200, movies);
  }

  else if (url.startsWith('/movies/') && method === 'GET') {
    const id = parseInt(url.split('/')[2]);
    const movies = readMovies();
    const movie = movies.find(m => m.id === id);

    if (movie) {
      sendJSON(res, 200, movie);
    } else {
      sendJSON(res, 404, { message: 'Movie not found' });
    }
  }

  else {
    sendJSON(res, 404, { message: 'Route not found' });
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});