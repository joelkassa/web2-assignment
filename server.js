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

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Movie Review API is running' }));
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});