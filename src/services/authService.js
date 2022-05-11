const{dbCon} = require('../connections')

const crypto = require(('crypto'))

const hashPass = (password) => {
    let hashing = crypto
        .createHmac('sha256','yukbisayuk') 
        .update(password) 
        .digest('hex') 
    return hashing
} 

module.exports = {
    loginService : async(data) => {
        let{username,email,password} = data
        let conn,sql
       
        try {
            conn = await dbCon.promise().getConnection()
            password = hashPass(password) 

            sql = `select * from users where (username=? or email=?) and password=?`
            let[result] = await conn.query(sql,[username,email,password])
            console.log(result)
            if (!result.length){
                throw {message: 'users not found'}
            }  

            // let dataToken = {
            //     id: result[0].id,
            //     username: result[0].username
            // } 
            // let tokenAccess = createJwtAccess(dataToken)

            conn.release() 
            return {success: true, data:result[0]}

            // res.set('x-access-token', tokenAccess)
            // return res.status(200).send(result[0])
        } catch (error) {
            conn.release()
            console.log(error) 
            throw new Error (error.message||error)
        }
    }, 
    registerService: async (data) =>{
        let {username,email,password} = data
        let conn,sql 
        try {
            conn = await dbCon.promise().getConnection()
            let regex = new RegExp(/ /g)
            if(regex.test(username)){
                throw{message: 'ada spasi'}
            } 
            await conn.beginTransaction()
            sql = `select id from users where username = ? or email = ?`
            let [result] = await conn.query(sql, [username,email])
            if (result.length){
                throw {message: 'username or email already used'}
            } 
            sql = `insert into users set ?`
            let insertData = {
                username, 
                email,
                password: hashPass(password), 
                isVerified: 0
            } 
            let [result1] = await conn.query(sql,insertData)
            sql = `select id,username,isVerified,email from users where id = ?`
            let [userData] = await conn.query(sql,[result1.insertId])
            await conn.commit()
            conn.release()
            return {success: true, data: userData[0]}
        } catch (error) { 
            conn.rollback()
            conn.release()
            console.log(error)
            throw new Error(error.message||error)
            // return res.status(500).send({message:error.message || error})

        }
    },
}