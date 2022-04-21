const express = require('express')
const {verifyTokenAccess, verifyTokenEmail} = require('../lib/verifyToken') 
const Router = express.Router()
const {authControllers} = require ('./../controllers') 
const {register, login, keeplogin, sendEmailVerified, accountVerified} = authControllers  



Router.post('/register', register) 
Router.post('/login', login) 
Router.get('/keepLogin',verifyTokenAccess,keeplogin) 
Router.get('/verified',verifyTokenEmail,accountVerified) 
Router.post('/sendemail-verified', sendEmailVerified) 


module.exports = Router
