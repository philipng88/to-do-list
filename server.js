require('dotenv').config()
const express = require('express')
const mongodb = require('mongodb')
const sanitizeHTML = require('sanitize-html')
const favicon = require('serve-favicon')
const path = require('path')

const app = express()
let db

app.use(express.static('public'))
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')))

mongodb.connect(process.env.CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
  db = client.db()
  app.listen(3000)
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get('/', (req, res) => {
  db.collection('items').find().toArray((err, items) => {
    res.send(`<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>To-Do App</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.5/css/bulma.min.css" integrity="sha256-vK3UTo/8wHbaUn+dTQD0X6dzidqc5l7gczvH+Bnowwk=" crossorigin="anonymous" />
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="container is-fluid">
        <h1 class="title is-1 has-text-centered">To-Do App</h1>
        
        <div class="hero">
          <div class="hero-body">
            <form id="create-form" action="/create-item" method="POST">
              <div class="field is-grouped">
                <div class="control is-expanded">
                  <input id="create-field" autocomplete="off" class="input" type="text" name="item" />
                </div>
                <div class="control">
                  <button class="button is-primary">Add New Item</button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <div class="list-wrapper">
          <div id="item-list" class="list"></div>
        </div>
      
      </div>
      <script>
          let items = ${JSON.stringify(items)}
      </script>
      <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
      <script src="/browser.js"></script>
    </body>
  </html>`)
  })
})

app.post('/create-item', (req, res) => {
  let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
  db.collection('items').insertOne({text: safeText}, (err, info) => {
    res.json(info.ops[0])
  })
})

app.post('/update-item', (req, res) => {
  let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
  db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)}, {$set: {text: safeText}}, () => {
    res.send("Success")
  })
})

app.post('/delete-item', (req, res) => {
  db.collection('items').deleteOne({_id: new mongodb.ObjectId(req.body.id)}, () => {
    res.send("Success")
  })
})