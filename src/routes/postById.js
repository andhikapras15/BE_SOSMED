const express = require('express')
const {verifyTokenAccess} = require('../lib/verifyToken') 
const Router = express.Router()
const {postControllers} = require ('./../controllers') 
const {getPostById} =   postControllers  
const upload = require('../lib/upload') 

  
Router.get("/getPostById",verifyTokenAccess, getPostById) 

module.exports = Router
