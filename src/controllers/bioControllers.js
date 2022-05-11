const {dbCon} = require('../connections') 

module.exports = {  

    editBio: async (req,res) => { 

        const {bio, fullname, username} = req.body 
        const {id} = req.user  

        let conn, sql 

        try { 
            conn = await dbCon.promise().getConnection()

            sql = 'select username from users where username=? and id!=?'
            let [resultuser] = await conn.query(sql,[username, id])
            if (resultuser.length){
                throw {message:"username already used"}
            }
            sql= 'update users set ? where id = ?'
            let update={
                bio: bio, 
                username: username,
                fullname: fullname
            } 
            let [result] = await conn.query(sql,[update, id])
            console.log(result,'berhasil update bio') 
            return res.status(200).send(result)
        } catch (error) { 
            console.log(error)
            return res.status(500).send({message:error.message || error})
            
        }

    }
}