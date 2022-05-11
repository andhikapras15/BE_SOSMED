const express = require('express')
const {verifyTokenAccess} = require('../lib/verifyToken') 
const Router = express.Router()
const {postControllers} = require ('./../controllers') 
const {post, getPost, deletePost,likePost, comment, editCaption, getComments, getPostbyPostId, countComments} = postControllers  
const upload = require('../lib/upload') 

const uploader = upload("/post", "POST").fields([
    { name: "post", maxCount: 3 },
  ]);  
  

Router.post("/post",verifyTokenAccess, uploader, post) 
Router.get("/getPost",verifyTokenAccess, getPost) 
Router.delete("/deletePost", verifyTokenAccess, deletePost) 
Router.post("/likePost", verifyTokenAccess, likePost) 
Router.post("/comment", verifyTokenAccess, comment) 
Router.put("/editCaption", verifyTokenAccess, editCaption)
Router.get("/getComments/:postId", verifyTokenAccess, getComments) 
Router.get("/getPostByPostId/:postId", verifyTokenAccess, getPostbyPostId) 
Router.get("/countComments/:postId", verifyTokenAccess, countComments)

module.exports = Router
