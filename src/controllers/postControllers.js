const {dbCon} = require('../connections')   
const fs = require('fs')  

module.exports = {
    post: async(req,res) => {  
        console.log(req.files) 

        // const {image} = postimage
        
        // const {postimage} = req.files 
        const {id} = req.user
        const {caption,image} = req.body   
        let path = '/imagepost' 
        
        // const imagepath = `${path}/${image[0].filename}`
        
        let conn,sql 

        try {  
            conn = await dbCon.promise().getConnection()
            // sql = "select * from post where id = ?" 
            // let[result] = await conn.query(sql,[id]) 
            // console.log(result)

            sql = 'insert into post set ?' 
            let insertData = {
                caption, 
                image, 
                Users_id:id
            } 
            let [result1] = await conn.query(sql,[insertData]) 
            console.log(result1)  
           
            return res.status(200).send({message: 'berhasil insert caption'})
            
        } catch (error) { 
            console.log(error)
            return res.status(500).send({message: error.message || error})
            
        }
    }
}

