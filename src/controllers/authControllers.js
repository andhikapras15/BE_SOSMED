const {createJwtAccess,createJwtEmail} = require('../lib/jwt')  
const {registerService,loginService} = require('../services/authService') 
const nodemailer = require ('nodemailer')  
const handlebars = require ('handlebars') 
const path = require ('path') 
const myCache = require("./../lib/cache");
const fs = require ('fs') 
const {dbCon} = require('../connections')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'andhikapraset@gmail.com',
        pass: 'lmcxxqqjlwzajwdi'
    }, 
    tls: {
        rejectUnauthorized: false
    }  
})

// const hashPass = (password) => {
//     let hashing = crypto
//         .createHmac('sha256','yukbisayuk') 
//         .update(password) 
//         .digest('hex') 
//     return hashing
// } 

module.exports = {
    register: async (req,res) => {
        try {
            const {
                data: userData,
               
            } = await registerService(req.body)  

            let timecreated = new Date().getTime() 

            const dataToken = {
                id: userData.id, 
                username: userData.username,
            }  

            let sukses = myCache.set(userData.id, dataToken, 10*60) 
            if(!sukses){
                throw {message: 'error caching'}
            }

            const tokenAccess = createJwtAccess(dataToken)
            const tokenEmail= createJwtEmail(dataToken) 
            const host = 
                process.env.NODE_ENV === 'production' 
                    ? 'http://namadomainfe' 
                    : 'http://localhost:3000'
                const link = `${host}/verified/${tokenEmail}` 
                let filePath = path.resolve(__dirname,'../templates/emailTemplate.html')
                let htmlString = fs.readFileSync(filePath, 'utf-8') 
                console.log(htmlString) 
                const template = handlebars.compile(htmlString)
                const htmlToEmail = template ({
                    username : userData.username,  
                    link
                }) 
                transporter.sendMail({
                    from: 'Social Media Email Verification<andhikapraset@gmail.com>',
                    to: 'andhikapraset@gmail.com',
                    subject: 'Link Email Verification',
                    html: htmlToEmail,
                })  
                res.set('x-token-access', tokenAccess)  
                console.log(transporter.sendMail)
                return res.status(200).send(userData)
        } catch (error) { 
            console.log(error)
            return res.status(500).send({message: error.message || error})
            
        }
    },  
    login: async (req,res) => {
        try {  
            const {data: userData, } = await loginService(req.body) 
            const dataToken = {
                id: userData.id,
                username: userData.username
            } 
            const tokenAccess = createJwtAccess(dataToken)  
            res.set('x-token-access', tokenAccess)
            return res.status(200).send(userData)
        } catch (error) {
             
           console.log(error) 
           return res.status(500).send({message: error.message || error})
        }
    },
    keeplogin: async(req,res) => {
        const {id} = req.user 
        let conn,sql
        try {
            conn = await dbCon.promise().getConnection()
            sql =`select * from users where id=?`
            let [result] = await conn.query(sql, [id])
            console.log(result)
            conn.release()
            return res.status(200).send(result[0])
        } catch (error) {
            console.log(error)
            return res.status(500).send({message:error.message||error})
        }
    }, 
    accountVerified: async (req,res) => {
        const {id} = req.user
        let conn,sql
        try {
            conn = await dbCon.promise().getConnection() 
            await conn.beginTransaction() 
            sql = `select id from users where id =? and isVerified = 1`
            let [userVerified] = await conn.query(sql, [id]) 
            console.log(req.user) 
            if(userVerified.length){
                throw {message: 'kan udah verified ngapain di klik lagi'}
            }
            sql = `update users set ? where id = ?` 
            let updateData = {
                isVerified: 1
            } 
            await conn.query(sql, [updateData,id]) 
            sql = `select * from users where id= ?` 
            let [result] = await conn.query(sql,[id]) 
            await conn.commit()
            
            return res.status(200).send(result[0])
        } catch (error) {
            conn.rollback()
            
            console.log(error)
            return res.status(500).send({message: error.message ||error})
        }
    }, 
    sendEmailVerified: async (req,res) => {
        const {id,email,username} = req.body 
        try {
           const dataToken = {
               id:id,
               username: username
           }  
           const tokenEmail = createJwtEmail(dataToken) 
           const host = 
            process.env.NODE_ENV === 'production' 
                ? 'http://namadomainfe'
                : 'http://localhost:3000'
            const link = `${host}/verified/${tokenEmail}` 
            let filepath = path.resolve(__dirname, '../templates/emailTemplate.html')
            let htmlString = fs.readFileSync(filepath,'utf-8')
            const template = handlebars.compile(htmlString)
            const htmlToEmail = template({
                username: username,
                link,
            }) 
            console.log(htmlToEmail)
            transporter.sendMail({
                from: 'Social Media Email Verification<andhikapraset@gmail.com',   
                to: `andhikapraset@gmail.com`, 
                subject: 'Link Email Verification', 
                hmtl: htmlToEmail
            }) 
            return res.status(200).send({message: 'berhasil kirim email'})
        } catch (error) {
            console.log(error)
            return res.status(200).send({message: error.message||error})
        }
    }
}