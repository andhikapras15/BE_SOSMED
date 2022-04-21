const {dbCon} = require('../connections') 

module.exports = {  

    editBio: async (req,res) => { 

        const {bio, fullname} = req.body 
        const {id} = req.user  

        let conn, sql 
        try { 
            conn = await dbCon.promise()
            sql= 'update users set ? where id = ?'
            let update={
                bio: bio, 
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