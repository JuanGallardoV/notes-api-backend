// ? Juan Gallardo 28-03-2022
const mongoose = require('mongoose')
// const { Schema, model } = mongoose
const connectionString = process.env.MONGO_DB_URI

// ? Conexion con MongoDB
mongoose.connect(connectionString)
  .then(() => {
    console.log('Conectado con la base de datos')
  }).catch(error => {
    console.error(error)
  })

// const noteSchema = new Schema({
//   content: String,
//   date: Date,
//   important: Boolean
// })

// const Note = model('Note', noteSchema)

// const note = new Note({
//   content: 'Nota creada desde un schema',
//   date: new Date(),
//   important: true
// })

// note.save()
//   .then(result => {
//     console.log(result)
//     mongoose.connection.close()
//   })
//   .catch(error => {
//     console.error(error)
//   })
