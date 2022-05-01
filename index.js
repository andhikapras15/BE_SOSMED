require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = 5000;
// const db = require("./src/models");

// const { products, variaties } = db;

// middleware log
const logMiddleware = (req, res, next) => {
  console.log(req.method, req.url, new Date().toString());
  next();
};

// main();

// buat mengijinkan frontend akses backend
app.use(
  cors({
    exposedHeaders: ["x-total-count", "x-token-access"],
  })
);
// /verified/token
// buat mengaktifkan req.body method post,put,patch
// untuk ngirim data
// app.use : pemasangan middleware global
app.use(express.json());
// buat upload foto dan reserve file
app.use(express.urlencoded({ extended: false }));
app.use(logMiddleware);
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.status(200).send({ message: "ini API MATOA 1.0" });
});

const { authRoutes,profileRoutes,postRoutes, postById } = require("./src/routes"); 


// app.use("/product", productsRoutes);
app.use("/auth", authRoutes);
app.use('/profile', profileRoutes) 
app.use('/post', postRoutes, postById)
// const mongoose = require("mongoose");

// const mongoConnect = mongoose.connect(
//   `mongodb+srv://dino9611:pwdk123@cluster0.ydv5x.mongodb.net/jc20latmongo?retryWrites=true&w=majority`
// );

// mongoConnect
//   .then(() => {
//     console.log("connected mongodb");
//   })
//   .catch((err) => console.log(err));

// const userSchema = new mongoose.Schema(
//   {
//     username: {
//       type: String,
//       unique: true,
//       required: true, // klo true sama harus ada
//       set: (val) => val.replace(/ /g, ""), // buathapus spasi
//       validate: (val) => {
//         //membuat validasi
//         if (!isNaN(parseInt(val))) {
//           // if the incoming value is numbers
//           throw new Error("Name cannot be only numbers");
//         }
//       },
//     },
//     email: {
//       type: String,
//       unique: true,
//       required: true,
//     },
//     password: {
//       type: String,
//       required: true,
//       minlength: 8,
//     },
//     posts: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Posts",
//       },
//     ],
//   },
//   { timestamps: true }
// );

// const Users = mongoose.model("Users", userSchema);

// const postSchema = new mongoose.Schema(
//   {
//     content: {
//       type: String,
//     },
//     image: {
//       type: String,
//     },
//     likes: [
//       { default: [], type: mongoose.Schema.Types.ObjectId, ref: "Users" },
//     ],
//     comments: [
//       {
//         default: {},
//         user: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Users",
//         },
//         comment: {
//           type: String,
//         },
//       },
//     ],
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Users",
//     },
//   },
//   { timestamps: true }
// );

// const Posts = mongoose.model("Posts", postSchema);

// app.post("/auth/register", async (req, res) => {
//   // req.body sudah sesuai dengan schema
//   try {
//     // add data to users
//     const user = new Users({ ...req.body });
//     await user.save();
//     return res.status(200).send({ message: "berhasil add data" });
//   } catch (error) {
//     return res.status(500).send({ message: error.message || error });
//   }
// });

// app.post("/post/:iduser", async (req, res) => {
//   // req.body sudah sesuai dengan schema
//   try {
//     const { iduser } = req.params;
//     // add data to users
//     const post = new Posts({ ...req.body, user: iduser });
//     // edit user untuk push postingan
//     console.log(post);
//     // find user
//     const user = await Users.findById(iduser);
//     // edit seperti javascript
//     console.log(user);
//     user.posts = [...user.posts, post._id];
//     // edit harus di save
//     await user.save();
//     await post.save();
//     return res.status(200).send({ message: "berhasil add post" });
//   } catch (error) {
//     return res.status(500).send({ message: error.message || error });
//   }
// });

// app.get("/user", async (req, res) => {
//   try {
//     // cara 1
//     // const user = await Users.find({ username: "dinoaja" }).populate("posts", [
//     //   "content",
//     //   "image",
//     // ]);

//     // delete user
//     // const user = await User.findById(req.params.id);
//     // user.remove();

//     // cara 2
//     // select * from users where email = dika and username = 'dino aja'
//     // const user = await Users.where("email")
//     //   .equals("dika@gmail.com")
//     //   .where("username")
//     //   .equals("dinoaja")
//     //   .select(["username", "email"]);
//     // kalo tidak pake or
//     // const user = await Users.where("username")
//     //   .equals("dinoaja")
//     //   .select(["username", "email"]);

//     console.log(user);
//     return res.status(200).send(user);
//   } catch (error) {
//     return res.status(500).send({ message: error.message || error });
//   }
// });

// app.get("/seq/sync", (req, res) => {
//   db.sequelize.sync().then(() => {
//     console.log("syncronized");
//     res.status(200).send({ message: "henshin db" });
//   });
// });

// app.post("/seq/product", async (req, res) => {
//   // add data sequelize
//   try {
//     const instance = await products.create(req.body);
//     console.log(instance);
//     return res.status(200).send({ message: "berhasil add data" });
//   } catch (error) {
//     return res.status(500).send({ message: error.message || error });
//   }
// });

// app.get("/seq/product", async (req, res) => {
//   try {
//     // select * from products
//     let offset = 0;
//     let limit = 10;

//     // const result = await product.findAll({ limit: limit, offset: offset });
//     const result = await products.findAll({
//       limit: limit,
//       offset: offset,
//       // attribut untuk memilih colum yang dimau
//       attributes: ["name", "price", "id"],
//     });

//     console.log(result);
//     return res.status(200).send(result);
//   } catch (error) {
//     return res.status(500).send({ message: error.message || error });
//   }
// });

// app.get("/seq/product/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     // select * from products

//     // const result = await product.findAll({ limit: limit, offset: offset });
//     const result = await products.findAll({
//       // where: { id: id },
//       // order: [db.sequelize.col("variaties"), "DESC"],
//       include: [
//         {
//           model: variaties,
//           separate: true,
//           required: true,
//           order: [["id", "DESC"]],
//         },
//       ],
//     });

//     console.log(result);
//     return res.status(200).send(result);
//   } catch (error) {
//     return res.status(500).send({ message: error.message || error });
//   }
// });

// app.post("/seq/variaties", async (req, res) => {
//   try {
//     // ubah object jadi json
//     req.body.images = JSON.stringify(req.body.images);
//     await variaties.create(req.body);
//     return res.status(200).send({ message: "berhasil add data" });
//   } catch (error) {
//     return res.status(500).send({ message: error.message || error });
//   }
// });

// app.delete("/seq/product", async (req, res) => {});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});