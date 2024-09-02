const express = require('express');
const mysql = require("mysql");
const cors = require("cors");

const port = 5000;

const app = express();

//middlewares

app.use(cors());
app.use(express.json());

//making connection with mySQL server

let db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'postbook'
  });

  db.connect((err) => {
    if (err) {
        console.log("Something went wrong while connecting to the database: ",err);
        throw err;
    }else {
        console.log("MySQL server connected...");
    }
  }); 

  //getting user data from server

  app.post("/getUserInfo",(req, res) => {
    const { userId, password } = req.body;

  const getUserInfosql = `SELECT userId, userName, userImage FROM users WHERE users.userId = ? AND users.userpassword = ?` 
  
  let query = db.query(getUserInfosql, [userId, password], (err, result) => {
  if (err){
    console.log("Error getting user info from server: ", err);
    throw err;
  } 
  else{
      res.send(result);   
  } 
  });
  });

app.get("/getAllPosts", (req, res) => {
  const sqlForAllPosts = `SELECT users.userName AS postedUserName, users.userImage AS postedUserImage, posts.postedTime, posts.PostText, posts.postImageUrl, posts.postId FROM posts INNER JOIN users ON posts.postedUserId=users.userId ORDER BY posts.postedTime DESC`;

let query = db.query(sqlForAllPosts, (err, result) => {
  if (err) {
    console.log("Error loading all posts from database: ",err);
    throw err;
  }else {
    console.log(result);
    res.send(result);
  }
}) 
}); 

//getting comments of a single post
app.get('/getAllComments/:postId',(req, res) => {
let id = req.params.postId;
let sqlForAllComments = `SELECT users.userName As commentedUserName, users.userImage AS commentedUserImage, 
comments.commentId, comments.commentOfPostId, comments.commentText, comments.commentTime
FROM comments
INNER JOIN users ON comments.commentedUserId=users.userId WHERE comments.commentOfPostId = ${id}`;

let query = db.query(sqlForAllComments, (err, result) => {
  if (err) {
    console.log("Error fetching comments from the database: ", err);
    throw err;
  } else{
    res.send(result);
  }
});
});

//adding new comment to a post
app.post("/postComment", (req, res) => {
const {commentOfPostId, commentedUserId, commentText, commentTime } = req.body;

let sqlForAddingNewComments = `INSERT INTO comments (commentId, commentOfPostId, commentedUserId, commentText, commentTime) VALUES (NULL, ?, ?, ?, ?);`;

let query = db.query(sqlForAddingNewComments, [
  commentOfPostId, 
  commentedUserId, 
  commentText, 
  commentTime,
], (err, result) => {
    if (err){
      console.log("Error adding coment to the database: ", err);
    }else{
      res.send(result);
    }
});

});
//adding a new post

app.post('/addNewPost', (req,res) => {
//destructure the req.body object 
const {postedUserId, postedTime, postText, postImageUrl} = req.body;

//sql query
let sqlForAddingNewPost = `INSERT INTO posts (postId, postedUserId, postedTime, PostText, postImageUrl) VALUES (NULL, ?, ?, ?, ?)`;
let query = db.query(sqlForAddingNewPost, [postedUserId, postedTime, postText, postImageUrl], (err, result) => {
  if(err){
console.log ("Error while adding a new post in the database: ",err);  
throw err;
  }else {
    res.send(result);
  }
});
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);

});
