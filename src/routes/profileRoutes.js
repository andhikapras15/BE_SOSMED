const express = require('express')
const {verifyTokenAccess} = require('../lib/verifyToken') 
const Router = express.Router()
const {profileControllers,bioControllers} = require ('./../controllers') 
const {editProfilePic} =   profileControllers 
const {editBio} = bioControllers
const upload = require('../lib/upload') 

const uploader = upload("/profile", "PROFILE").fields([
    { name: "profilepic", maxCount: 3 },
  ]);

Router.put('/profile', verifyTokenAccess,uploader,editProfilePic) 
Router.put('/editBio', verifyTokenAccess,editBio)


module.exports = Router
