const {dbCon} = require('../connections')   
const fs = require('fs');  
const connections = require('../connections');

module.exports = { 
    //ngepost
    post: async(req,res) => {  
        console.log('ini req.files',req.files) 
        console.log("req.body", req.body); 
        // const {post} = req.files  
        // const {imagePost} = req.files.post[0].path
        // console.log('ini post', post)

        const {path} = req.files.post[0]
        let image = path.slice(6,34)
        // console.log(image);
        
        const {id} = req.user
        const {caption} = req.body   
        // let path = '/imagepost' 
        
        // const imagePath = `${path}/${image[1].filename}`
        
        let conn,sql  
        // if(!image){
        //     return res.status(500).send({message:'foto tidak ditemukan'})
        // }
        try {  
            conn = await dbCon.promise().getConnection()
            
            await conn.beginTransaction() 
            //masukkan data ke table post
            sql = 'insert into post set ?' 
            let insertData = { 
                image:image,
                caption:caption, 
                Users_id:id
            }  
            //masuk sini berarti berhasil post
            let [result] = await conn.query(sql,[insertData]) 
            console.log(result.insertId)  
            
            conn.commit()
            conn.release()
           
            return res.status(200).send({message: 'berhasil upload post'}) 
            
        } catch (error) { 
            console.log(error) 
            // if(imagePath){ 
            //     //kalo foto sudah terupload dan gagal masuk ke sql maka fotonya dihapus
            //     fs.unlinkSync('./public' + imagePath)
            // }
            return res.status(500).send({message: error.message || error})
        }
    }, 
    //ngeget postingan
    getPost: async(req,res) => {
        let conn,sql 
        let {id} = req.user 
        let {page, limit} = req.query  

        //inisialisasi offset limit
        if(!page){
            page=0
        } 
        if(!limit){
            limit=10
        } 
        let offset = page*limit 

        limit= parseInt(limit) 
        try { 
            conn = await dbCon.promise().getConnection() 
            sql = `select post.id,caption,image, username,users_id, profilepic,post.createdAt,if(id_like is null, 0, 1) as already_like,(select count(*) from likes where post_id= post.id)as number_of_likes from post inner join users on post.users_id= users.id left join (select id as id_like, post_id from likes where users_id = ${id}) as l on post.id = l.post_id order by post.createdAt desc limit ${dbCon.escape(offset)}, 
            ${dbCon.escape(limit)}` 
            let[result] = await conn.query(sql) 
            
            sql = 'select * from post where post_id =?'  
            
            sql = `select count (*) as total_post from post` 

            let [totalPost] = await conn.query(sql) 

            console.log('ini result',result) 
            conn.release() 
            res.set("x-total-count", totalPost[0].total_post)
            return res.status(200).send(result)            
            
        } catch (error) { 
            console.log(error) 
            return res.status(500).send({message: error.message || error}) 
        }
    }, 
    // get post by id
    getPostById: async (req,res) => {
        const {id} = req.user  
      
        // let conn,sql 
       
        // try { 
        //     conn = await dbCon.promise().getConnection()
            
        //     sql = `select * from post where Users_id = ?`
        //     let [result] = await conn.query(sql, id)  

        //     conn.release()
        //     return res.status(200).send(result)
        // } catch (error) { 
        //     return res.status(500).send({message: error.message || error})
            
        // } 
        let conn,sql 
        let {page, limit} = req.query  

        //inisialisasi offset limit
        if(!page){
            page=0
        } 
        if(!limit){
            limit=10
        } 
        let offset = page*limit 

        limit= parseInt(limit) 
        try { 
            conn = await dbCon.promise().getConnection() 
            // sql = `select post.id,caption,image, username,users_id, profilepic,(select count(*) from likes where post_id= post.id)as number_of_likes from post inner join users on post.users_id= users.id order by post.createdAt desc limit ${dbCon.escape(offset)}, 
            // ${dbCon.escape(limit)}` 
            sql = `select post.id,caption,image, username,users_id,profilepic,post.createdAt,if(id_like is null, 0, 1) as already_like, (SELECT count(*) FROM likes WHERE post_id = post.id) as number_of_likes from post INNER JOIN users ON post.users_id = users.id LEFT JOIN (SELECT id as id_like, post_id FROM likes WHERE users_id = ${id}) as l ON post.id = l.post_id WHERE users.id = ${id} ORDER BY post.createdAt DESC LIMIT 
            ${dbCon.escape(offset)}, ${dbCon.escape(limit)}`
            let[result] = await conn.query(sql) 
            
            sql = `select * from post where Users_id = ?` 
            let[result1] = await conn.query(sql,id)
            
            sql = `select count (*) as total_post from post` 

            let [totalPost] = await conn.query(sql) 

            console.log('ini result',result) 
            conn.release() 
            res.set("x-total-count", totalPost[0].total_post)
            return res.status(200).send(result)            
            
        } catch (error) { 
            console.log(error) 
            return res.status(500).send({message: error.message || error}) 
        }
    },
    // delete post 
    deletePost: async (req,res) => {
       
        const {id} = req.user 
        const {post_id} = req.query
        
        let conn,sql
        try { 
            conn = await dbCon.promise().getConnection() 
            await conn.beginTransaction()

            // sql = `select * from post where id = ?` 
            // let [result]=await conn.query(sql,id)
            sql = `delete from comment_post where post_id=?`
            await conn.query(sql,post_id)

            sql = `delete from likes where post_id = ?`
            await conn.query(sql, post_id)

            // sql = `delete from post where users_id=?`
            // await conn.query(sql,id)  

            sql = `delete from post where id = ?`
            await conn.query(sql,post_id) 
            

            conn.commit()
            conn.release()
            return res.status(200).send({message: 'delete success'})
        } catch (error) {
            conn.rollback()
            return res.status(500).send({message: error.message || error})
        }
    }, 
    // like post 
    likePost: async (req,res) => {
        const { id } = req.user 
        let { post_id } = req.query  
        post_id = parseInt(post_id) 
        let sql, conn 
        
        try {
            conn = await dbCon.promise().getConnection()
            sql = `select * from post inner join likes on likes.post_id = post.id where post.id = ? and likes.users_id = ? `
            const [resultLiked] = await conn.query(sql,[post_id, id]) 
            if (resultLiked.length){
                sql = `delete from likes where post_id = ? and users_id = ?`
                const [deleteResult] = await conn.query(sql, [post_id, id])
                conn.release()
                return res.status(200).send({message:"unliked"})
            }
            
            sql = `insert into likes set ?`
            let inputData = { 
                post_id, 
                Users_id: id
            } 

            const [resultLike] = await conn.query(sql,inputData)
            conn.release() 
            return res.status(200).send({message:"liked"}, resultLike)
        } catch (error) {
            return res.status(500).send({message:error.message || error})
        }
    }, 
    // comment 
    comment: async(req,res) => {
        const {id} = req.user 
        const {comment} = req.body 
        const {post_id} = req.query 
        let conn, sql 

        try {
            conn = await dbCon.promise().getConnection()
            sql = `insert into comment_post set ?` 
            let inputData = {
                Users_id: id,
                comment,
                post_id 
            } 
            const [result] = await conn. query(sql, inputData) 
            conn.release() 
            return res.status(200).send(result)
        } catch (error) { 
            // return res.status(500).send({message: error.message || error}) 
            console.log(error)
        }
    }, 
    //get comments 
    getComments: async (req,res) => {
        let {postId} = req.params 
        postId = parseInt(postId) 
        let conn,sql 

        try {
            conn = await dbCon.promise().getConnection()

            await conn.beginTransaction()
            sql = `select comment_post.id, comment_post.comment, comment_post.post_id, comment_post.users_id, comment_post.createdAt, users.username, users.profilepic from comment_post join users on users.id = comment_post.users_id 
            where comment_post.post_id=? order by comment_post.createdAt desc`
            let [commentPost] = await conn.query(sql, postId) 

            sql = `select createdAt from comment_post where post_id=?`
            for (let i = 0; i < commentPost.length; i++) {
               const element = commentPost[i]
               const [result] = await conn.query(sql,element.post_id)
            } 
            conn.release()
            conn.commit()
            return res.status(200).send(commentPost)
        } catch (error) {
            conn.release()
            conn.rollback() 
            console.log(error);
            return res.status(500).send({message: error.message || error})
        }
    },
    // edit caption 
    editCaption: async (req,res) => {
        const {id} = req.user 
        const {caption} = req.body 
        const {post_id} = req.query 
        let conn, sql 

        try {
            conn = await dbCon.promise().getConnection()
            
            sql = `select * from post where Users_id = ? and id=?` 
            const [result] = await conn.query(sql,[id, post_id])

            sql = `update post set ? where id= ?`
            let updateCaption = {
                caption
            } 
            const [result1] = await conn.query(sql, [updateCaption, post_id])
            conn.release()
            return res.status(200).send(result1)
        } catch (error) {
            console.log(error)
            return res.status(500).send({message: error.message || error})
        }
    }, 
    //ngeget postingan by post id 
    getPostbyPostId: async(req,res) => {
        let {id} = req.user 
        let {postId} = req.params 
        // console.log('ini requery',req.query);
        // postId = parseInt(postId)
        console.log(postId)
        let conn, sql

        try {
            conn = await dbCon.promise().getConnection()
            sql = `select post.id,caption,image,username,users_id,profilepic,post.createdAt,if(id_like is null, 0, 1) as already_like,(select count (*) from likes where post_id = post.id) as number_of_likes from post inner join users on post.users_id = users.id left join (select id as id_like, post_id from likes where users_id = ${id}) as l on post.id = l.post_id where post.id = ${postId}`
            let [result] = await conn.query(sql, postId) 

            //comment di post 
            sql = `select comment, post_id,users_id from comment_post join users on users_id = users.id where post_id = ? order by comment_post.createdAt desc`
            for (let i = 0; i < result.length; i++) {
                const element = result[i]
                const [resultComment] = await conn.query(sql, element.id)

                result[i] = {...result[i], commnet_post:resultComment}
            } 

            //total post 
            sql = `select count (*) as total_post from post` 

            let [totalPost] = await conn.query(sql) 

            console.log('ini result',result) 
            conn.release() 
            res.set("x-total-count", totalPost[0].total_post)
            return res.status(200).send(result)

        } catch (error) { 
            console.log(error)
            return res.status(500).send({message: error.message || error})

        }
    }, 
    // jumlah total comment
    countComments: async (req,res) => {
        let {postId} = req.params
        postId = parseInt(postId) 
        let conn, sql 

        try {
            conn = await dbCon.promise().getConnection() 

            sql = `select count(comment) as comments from comment_post where post_id = ?`
            let [result] = await conn.query(sql, postId) 
            conn.release()
            return res.status(200).send(result[0])
        } catch (error) {
            console.log(error)
            return res.status(500).send({message: error.message || error})
        }
    }
} 


