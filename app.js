const express = require ('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const app = express()

const pgp = require('pg-promise')()
const connectionString = "postgres://localhost:5432/blogsdb"
const db = pgp(connectionString)

//adding css to mustache
app.use(express.static('css'))

app.use(bodyParser.urlencoded({extended:false}))

app.engine('mustache',mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')

app.listen(3000, function(req,res){
    console.log('Server is running...')
})

app.get('/blogs',function(req,res){
    //get all the posts from the database
    db.any('SELECT blogid,title,body,author from blogs;')
    .then(function(result){
        //render the blogs mustache page and pass the result(an array of blogs objects)
        res.render('blogs',{blogs : result})
    })
})

app.post('/blogs',function(req,res){

    let title = req.body.title
    let author = req.body.author
    let body = req.body.body

    db.none('INSERT INTO blogs(title,body,author) VALUES($1,$2,$3)',[title,body,author])
    .then(function(){
        res.redirect('/blogs')
    })
    .catch(function(error){
        console.log(error)
    })
})

app.get('/blogs/new',function(req,res){
    res.render('new-blog')
})

app.post('/delete-blog',function(req,res){
    let blogId = req.body.blogId

    db.none('DELETE FROM blogs WHERE blogid = $1;',[blogId])
    .then(function(){
        res.redirect('/blogs')
    })
    .catch(function(error){
        console.log(error)
    })
})
