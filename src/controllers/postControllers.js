const {dbCon} = require('../connections')   
const fs = require('fs')  

module.exports = {
    post: async(req,res) => {  
        console.log('ini req.files',req.files) 

        const {image} = req.files
        
        const {id} = req.user
        const {caption} = req.body   
        // let path = '/imagepost' 
        
        // const imagePath = `${path}/${image.filename}`
        
        let conn,sql  
        if(!image){
            return res.status(500).send({message:'foto tidak ditemukan'})
        }
        try {  
            conn = await dbCon.promise().getConnection()
            
            await conn.beginTransaction() 
            //masukkan data ke table post
            sql = 'insert into post set ?' 
            let insertData = { 
                image: imagePath,
                caption, 
                Users_id:id
            }  
            //masuk sini berarti berhasil post
            let [result] = await conn.query(sql,insertData) 
            console.log(result.insertId)              
           
            return res.status(200).send({message: 'berhasil upload post'})
            
        } catch (error) { 
            console.log(error) 
            if(imagePath){ 
                //kalo foto sudah terupload dan gagal masuk ke sql maka fotonya dihapus
                fs.unlinkSync('./public' + imagePath)
            }
            return res.status(500).send({message: error.message || error})
        }
    }
} 


