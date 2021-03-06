require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const expressLayouts = require('express-ejs-layouts');

const multer = require("multer");

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const upload = multer({ storage: storage });

app.set("view engine", "ejs");

app.use("/static", express.static("static"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const imageMimeTypes = ["image/jpeg", "image/png", "images/gif"];

/* -------------------- mongodb setup ------------------- */
mongoose.connect("mongodb://localhost:27017/thriftDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//creating items schema
const thriftItemSchema = new Schema(
  {
    itemName: String,
    dropTime: Date,
    img: {
      data: Buffer,
      type: String,
      // required: true
    },
    desc: String,

    // dateAdded: Date,
  },
  { typeKey: "$type" }
);

//creating thrift store schema
const thriftStoreSchema = new Schema({
  storeName: String,
  storeEmail: String,
  storePhone: Number,
  storeAddress: String,
  storeInfo: String,
  items: [thriftItemSchema],
});

//creating model for thrift store
const ThriftStore = mongoose.model("ThriftStore", thriftStoreSchema);
const Item = mongoose.model("Item", thriftItemSchema);
app.route("/").get((req, res) => {
  ThriftStore.find({}, (err, store) => {
    console.log(store.items);
    res.render("index", {
      storex: store,
      // post: store[0].items,
    });
  });
});

app.route("/home").get((req, res) => {
  res.render("home");
});

app.route("/myStore").get((req, res) => {
  Item.find({}, (err, items) => {
    console.log(items);
    res.render("myStore", {
      items: items,
    });
  });
});

app
  .route("/storeRegister")
  .get((req, res) => {
    res.render("storeRegister");
  })
  .post((req, res) => {
    const store = new ThriftStore({
      storeName: req.body.storeName,
      storeEmail: req.body.storeEmail,
      storePhone: req.body.storePhone,
      storeAddress: req.body.storeAddress,
      storeInfo: req.body.storeInfo,
    });
    store.save();
    res.redirect("/");
  });
app.route("/newPost").get((req, res) => {
  res.render("newPost");
});
app.post("/newPost", upload.single("itemImage"), (req, res) => {
  console.log(req.body);

  let item = new Item({
    itemName: req.body.itemName,
    dropTime: req.body.dropTime,
    img: {
      data: fs.readFileSync(
        path.join(__dirname + "/uploads/" + req.file.filename)
      ),
      type: "image/jpg",
    },
    desc: req.body.desc,
  });
  console.log(item);
  item.save();
  res.redirect("/myStore");
});

app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
