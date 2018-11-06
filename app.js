const express = require ('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const Blog = require('./models/blog')
const Comment = require('./models/comment')
const app = express()

const pgp = require('pg-promise')()
const connectionString = "postgres://localhost:5432/blogsdb"
const db = pgp(connectionString)

let blogs = [];

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

//Get all the blogs with their respective comments

app.get('/blogs/all', function(req,res){

    db.any('SELECT blogs.blogid,title,body,author,commentid,banner,description FROM blogs LEFT JOIN comments ON blogs.blogid = comments.blogid;')
    .then(function(items){
        console.log(items)
        items.forEach(function(item){


            let existingBlog = blogs.find(function(blog){
                return blog.blogId == item.blogid
            })

            if(existingBlog == null){

                let blog = new Blog(item.blogid,item.title,item.body,item.author)
                let comment = new Comment(item.commentid,item.banner,item.description)
                blog.comments.push(comment)
                blogs.push(blog)

            } else {
                let comment = new Comment(item.commentid,item.banner,item.description)
                existingBlog.comments.push(comment)
            }
        })
        console.log(blogs)
        res.render('all-blogs-all-comments',{blogs: blogs})
    })
})

// app,get('/blogs/:blogId',function(req,res){
//     let blogId = req.params.blogId

// })
