// ? Juan Gallardo 21-03-2022
require('dotenv').config()
require('./mongo')

const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const express = require('express')
// ? Necesario para la comunicacion con otros dominios (Buscar CORS[Cross-Origin Resource Sharing] para mas info)
const cors = require('cors')
const Note = require('./models/Note')
const app = express()
const logger = require('./middleware/logger')
const notFound = require('./middleware/notFound')
const handleErrors = require('./middleware/handleErrors')

app.use(cors())
app.use(express.json())
//* const http = require('http');
app.use(logger)

Sentry.init({
  dsn: 'https://db677a1b6a1a4c1da6e34083543e217f@o1180786.ingest.sentry.io/6293784',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app })
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
})

app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.tracingHandler())

// const notes = []
// let notes = [
//   {
//     id: 1,
//     content: 'Nota 1',
//     date: '2019-05-30T17:30:31.098Z',
//     important: true
//   },
//   {
//     id: 2,
//     content: 'Nota 2',
//     date: '2019-05-30T18:30:34.091Z',
//     important: false
//   },
//   {
//     id: 3,
//     content: 'Nota 3',
//     date: '2019-05-30T19:20:14.298Z',
//     important: true
//   }
// ]

//* const app = http.createServer((request, response) => {
//*     response.writeHead(200, { 'Content-Type': 'application/json'});
//*     response.end(JSON.stringify(notes));
//* });

// ? Rutas con Express

app.get('/', (request, response) => {
  response.send('<h1>Hola</h1>')
})

app.get('/api/notes', (request, response, next) => {
  // response.json(notes)
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response, next) => {
  // const id = Number(request.params.id)
  const { id } = request.params
  // const note = notes.find(note => note.id === id)
  Note.findById(id).then(note => {
    //* Si no se encuentra, no existe, por lo tanto, devuelve un error 404 (Not Found)
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  }).catch(error => {
    next(error)
    // console.log(error.message)
    // response.status(400).end()
  })
})

app.put('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  const note = request.body
  const newNoteInfo = {
    content: note.content,
    important: note.important
  }
  Note.findByIdAndUpdate(id, newNoteInfo, { new: true }).then(result => {
    response.json(result)
  })
})

app.delete('/api/notes/:id', (request, response, next) => {
  // const id = Number(request.params.id)
  const { id } = request.params
  // notes = notes.filter(note => note.id !== id)
  Note.findByIdAndRemove(id).then(result => {
    response.status(204).end()
  }).catch(error => next(error))
  response.status(204).end()
})

app.post('/api/notes', (request, response) => {
  const note = request.body

  if (!note || !note.content) {
    return response.status(400).json({
      error: 'note.content is missing'
    })
  }

  const newNote = new Note({
    content: note.content,
    date: new Date(),
    important: note.important || false
  })

  //* Se consigue la id con el mayor valor
  // const ids = notes.map(note => note.id)
  // const maxId = Math.max(...ids)

  // const newNote = {
  //   id: maxId + 1,
  //   content: note.content,
  //   important: typeof note.important !== 'undefined' ? note.important : false,
  //   date: new Date().toISOString()
  // }

  // notes = [...notes, newNote]

  newNote.save().then(savedNote => {
    response.json(savedNote)
  })

  // response.status(201).json(newNote)
})

app.use(notFound)
// ? Manejo de Errores
app.use(Sentry.Handlers.errorHandler())
app.use(handleErrors)

// app.use((request, response) => {
//   response.status(404).json({
//     error: 'Not found'
//   })
// })

//* Ya que el levantamiento tarda un poco, con este codigo una vez terminado de levantar el servidor, imprime por consola el msg
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
