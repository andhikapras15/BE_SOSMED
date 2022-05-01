const express = require('express')
const {verifyTokenAccess} = require('../lib/verifyToken') 
const Router = express.Router()
const {postControllers} = require ('./../controllers') 
const {post, getPost, deletePost,likePost, comment} =   postControllers  
const upload = require('../lib/upload') 

const uploader = upload("/post", "POST").fields([
    { name: "post", maxCount: 3 },
  ]);  
  

Router.post("/post",verifyTokenAccess, uploader, post) 
Router.get("/getPost", getPost) 
Router.delete("/deletePost", verifyTokenAccess, deletePost) 
Router.post("/likePost", verifyTokenAccess, likePost) 
Router.post("/comment", verifyTokenAccess, comment)

module.exports = Router
