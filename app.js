require('dotenv').config();
const express = require('express');
const app = express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

app.set('view engine', 'ejs');

app.use('/static', express.static('static'));
app.use(bodyParser.urlencoded({ extended: true }));

/* -------------------- mongodb setup ------------------- */
mongoose.connect('mongodb://localhost:27017/thriftDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

//creating items schema
const thriftItemSchema = new Schema({
    itemName: String,
    dropTime: {
        //TODO: This will be a countdown timer
        type: String
    },
    itemImage: String,
    dateAdded: {
        type: String
        // type: Date
    }
})

//creating thrift store schema
const thriftStoreSchema = new Schema({
    storeName: String,
    storeEmail: String,
    storePhone: Number,
    storeAddress: String,
    storeInfo: String,
    items: [thriftItemSchema]
})

//creating model for thrift store
const ThriftStore = mongoose.model('ThriftStore', thriftStoreSchema);

app.route("/")
    .get((req,res) =>{
        ThriftStore.find({},(err,store)=>{
            console.log(store);
                res.render("index",{
                    storex:store,
                });
            
        })
    
    })

app.route("/myStore")
    .get((req,res)=>{
    res.render("myStore");
    });

app.route("/storeRegister")
    .get((req,res)=>{
    res.render("storeRegister");
    })
    .post((req, res) => {
        const store = new ThriftStore({
            storeName: req.body.storeName,
            storeEmail: req.body.storeEmail,
            storePhone: req.body.storePhone,
            storeAddress: req.body.storeAddress,
            storeInfo: req.body.storeInfo
        })
        store.save(err => {
            if (!err) {
                res.render("myStore",{
                    storeName: store.storeName,
                    storeEmail: store.storeEmail,
                    storePhone: store.storePhone,
                    storeAddress: store.storeAddress,
                    storeInfo: store.storeInfo
                });
            }else{
                console.log(err);
            }
        })
        res.redirect("/");
    });

app.route("/newPost/:storeName")
    .get((req,res)=>{
        res.render("newPost");
    })
    .post((req,res) => {
        const storeName = req.params.storeName;
        const item = new Item({
            itemName: req.body.itemName,
            //FIXME: Make this a countdown timer
            dropTime: req.body.dropTime,
            itemImage: req.body.itemImage
        });
        ThriftStore.findOne({ storeName: storeName}, (err,foundStore) => {
            if(foundStore){
                foundStore.items.push(item);
                foundStore.save(err => {
                    if(!err){
                        console.log("Item succesfully pushed")
                    }
                })
            }
            else{
                console.log(err);
            }

        })
    })

app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});
