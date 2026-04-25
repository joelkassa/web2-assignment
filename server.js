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

const parseBody = (req, callback) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      callback(JSON.parse(body));
    } catch {
      callback(null);
    }
  });
};

const server = http.createServer((req, res) => {
  console.log(`Received: ${req.method} ${req.url}`);
  
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

  else if (url === '/movies' && method === 'POST') {
    parseBody(req, (body) => {
      if (!body) {
        return sendJSON(res, 400, { message: 'Invalid JSON body' });
      }

      const movies = readMovies();
      const newMovie = {
        id: Date.now(),
        title: body.title,
        director: body.director,
        year: body.year,
        rating: body.rating,
        review: body.review
      };

      movies.push(newMovie);
      writeMovies(movies);
      sendJSON(res, 201, newMovie);
    });
  }

  else if (url.startsWith('/movies/') && method === 'PUT') {
    const id = parseInt(url.split('/')[2]);
    parseBody(req, (body) => {
      if (!body) {
        return sendJSON(res, 400, { message: 'Invalid JSON body' });
      }

      const movies = readMovies();
      const index = movies.findIndex(m => m.id === id);

      if (index === -1) {
        return sendJSON(res, 404, { message: 'Movie not found' });
      }

      movies[index] = { ...movies[index], ...body, id: movies[index].id };
      writeMovies(movies);
      sendJSON(res, 200, movies[index]);
    });
  }

  else if (url.startsWith('/movies/') && method === 'DELETE') {
    const id = parseInt(url.split('/')[2]);
    const movies = readMovies();
    const index = movies.findIndex(m => m.id === id);

    if (index === -1) {
      return sendJSON(res, 404, { message: 'Movie not found' });
    }

    const deleted = movies.splice(index, 1)[0];
    writeMovies(movies);
    sendJSON(res, 200, { message: 'Movie deleted', movie: deleted });
  }

  else {
    sendJSON(res, 404, { message: 'Route not found' });
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});