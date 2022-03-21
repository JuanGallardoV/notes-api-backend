// ? Juan Gallardo 21-03-2022
const express = require('express')
// ? Necesario para la comunicacion con otros dominios (Buscar CORS[Cross-Origin Resource Sharing] para mas info)
const cors = require('cors')
const app = express()
const logger = require('./loggerMiddleware')

app.use(cors())
app.use(express.json())
//* const http = require('http');
app.use(logger)

let notes = [
  {
    id: 1,
    content: 'Nota 1',
    date: '2019-05-30T17:30:31.098Z',
    important: true
  },
  {
    id: 2,
    content: 'Nota 2',
    date: '2019-05-30T18:30:34.091Z',
    important: false
  },
  {
    id: 3,
    content: 'Nota 3',
    date: '2019-05-30T19:20:14.298Z',
    important: true
  }
]

//* const app = http.createServer((request, response) => {
//*     response.writeHead(200, { 'Content-Type': 'application/json'});
//*     response.end(JSON.stringify(notes));
//* });

// ? Rutas con Express

app.get('/', (request, response) => {
  response.send('<h1>Hola</h1>')
})

app.get('/api/notes', (request, response, next) => {
  response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find(note => note.id === id)
  //* Si no se encuentra, no existe, por lo tanto, devuelve un error 404 (Not Found)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)
  response.status(204).end()
})

app.post('/api/notes', (request, response) => {
  const note = request.body

  if (!note || !note.content) {
    return response.status(400).json({
      error: 'note.content is missing'
    })
  }

  //* Se consigue la id con el mayor valor
  const ids = notes.map(note => note.id)
  const maxId = Math.max(...ids)

  const newNote = {
    id: maxId + 1,
    content: note.content,
    important: typeof note.important !== 'undefined' ? note.important : false,
    date: new Date().toISOString()
  }

  notes = [...notes, newNote]

  response.status(201).json(newNote)
})

app.use((request, response) => {
  response.status(4004).json({
    error: 'Not found'
  })
})

//* Ya que el levantamiento tarda un poco, con este codigo una vez terminado de levantar el servidor, imprime por consola el msg
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
