
var express = require('express');
var app = express.Router();
var passport = require('passport');
var Account = require('../models/account');

//const popup = require('node-popup');
//const popup = require('node-popup/dist/cjs.js');

const mongoose = require('mongoose');

var monk = require('monk');
var db = monk('localhost:27017/SpecialityBakery');
var collection = db.get('users');
var collection_product = db.get('products');
var carts = db.get('carts');
var orderhistory = db.get('orderhistory');

const path = require("path")
const multer = require("multer")

const cartSchema = mongoose.Schema({

            userId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "users"
            },

            products: [
            {
                productId: Number,
                quantity: Number,
                name: String,
                price: Number
            }
            ],

            active: {
              type: Boolean,
              default: true
            },

            modifiedOn: {
              type: Date,
              default: Date.now
            }

          },

          { timestamps: true }
        );

     module.exports = mongoose.model('carts', cartSchema);

const orderSchema = mongoose.Schema({

            userId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "users"
            },

            orders : [{

                orderId: {
                    type : String                        //combine userid and order date time.
                },
                          
                orderOn: {
                  type: Date,
                  default: Date.now
                },

                products: [
                    {
                        productId: Number,
                        quantity: Number,
                        name: String,
                        price: Number
                    }
                ],
            }],
          },

          { timestamps: true }
        );

module.exports = mongoose.model('orderhistory', orderSchema);

//---------------------------------------------------------------------------------------------------------------------------------------------//


app.get('/register', function(req, res) {
    res.render('register', {});
});

//---------------------------------------------------------------------------------------------------------------------------------------------//

app.get('/', function(req, res, next) {
//     //res.send("hello");

    var perPage = 8;
     var page = req.query.page || 1;

     var options = {
          "limit": perPage,
          "skip": (perPage * page) - perPage
      }

        //res.send(page);
        collection_product.find({},options, function(err, products) { 

          collection_product.count({},(function(err, count) {
              
                if (err) return next(err);
                var num = Math.ceil(count/perPage);
                res.render('index', {results : products, user : req.user, current : page, pages : num});
            }));
      }); 
 });


//---------------------------------------------------------------------------------------------------------------------------------------------//

app.get('/product_detail', function(req, res, next) {               
  
      let index = req.query.pid;
     //let userid = req.query.uid;
      collection_product.findOne({_id: index }, function(err, product){
       if (err) throw err;
    res.render('product_detail', { product : product, userid : req.query});
    //res.send(req.query);
   });

 });


//---------------------------------------------------------------------------------------------------------------------------------------------//

app.get('/hometocart',function(req,res,next){
    //res.send("heloo");
    var userid = req.query.uid;
    //res.send(userid);
    carts.find({userId : userid})
    .then (resp => {

        if(resp.length != 0)
        {
            res.render('cart',{results : cartdetails});
        }
        else
        {
            res.render('emptycart');
        }
    });
                            
});


//---------------------------------------------------------------------------------------------------------------------------------------------//

app.post('/cart', function(req,res,next){                   //Add to Cart Functionality
    
    var q = req.body.qtyfrompd;
    var userid = req.query.uid;
    var productid = req.query.pid;
    var pname;
    var price;
    var pdquantity;
    

    collection_product.findOne({_id : productid}, function(err, productdetails){                //fetches product details from product collection using product id
       if (err) throw err;

       var present = 0;
        pname = productdetails.Name;
        price = productdetails.Price;
        pdquantity = productdetails.qty; 


        if(q <= pdquantity)
        {   
             carts.find({userId : userid })              // checks whether user has already created cart or not
             .then(resp => {
               
                if(resp.length != 0) 
                {
                    present = 1;
                }
               else
               {   
                    present = 0; 
               }

               if(Number(present) == 1)                                    //If cart for user already exists update that cart
                 {
                       carts.find({userId : userid, products : { $elemMatch : { productId : productid}}})
                       .then(value => {

                            if(value.length > 0)
                           {
                                carts.findOneAndUpdate({userId : userid , products : { $elemMatch : { productId : productid}}}, {$set : {"products.$.quantity" : q }})
                                
                                   carts.findOne({userId : userid , products : { $elemMatch : { productId : productid}}}, function(err,p){
                                    res.render('cart', {results : p});
                                });
                            }
                            else
                            {
                                carts.update({userId : userid}, {$push : { products : { productId : productid, quantity : q, name : pname, price : price}}});
                           
                                    carts.findOne({userId : userid , products : { $elemMatch : { productId : productid}}}, function(err,p){
                                    // console.log("find");
                                    res.render('cart', {results : p});
                                });
                           }
                       });
                 }
                 else    //Inserts new cart for user having no cart history and also showing current added product
                 {
                       carts.insert({                                   
                         userId : userid,
                         products: [{ productId : productid, quantity : 1,name : pname, price : price }]
                       });

                       carts.findOne({userId : userid},function(err, cartdetails){
                            res.render('cart', {results : cartdetails} );
                       });
                 }      
                
         });

        }
        else
        {
           
          collection_product.findOne({_id: productid }, function(err, product){
                   if (err) throw err;
                res.render('product_detail', { product : product, userid : userid});
                
            });
           
        }
    });
       
});

//---------------------------------------------------------------------------------------------------------------------------------------------//

// Delete prduct from cart
app.post('/cartdelete', function(req, res){
    var pid = req.query.pid;

    carts.findOneAndUpdate({userId : req.query.uid}, {$pull : { products : { productId : pid}}});
  
    carts.findOne({userId : req.query.uid},function(err, cartdetails){
                            res.render('cart', {results : cartdetails} );
                       });
});


//---------------------------------------------------------------------------------------------------------------------------------------------//

//Checkout from cart
app.post('/cartcheckout', function(req, res){
    var uid = req.query.uid;
    var oid = uid + new Date();

     carts.findOne({userId : uid}, function(err, cartdetails){                //fetches product details from product collection using product id
       

            for (var i = 0; i < cartdetails.products.length; i++)
            {
                p = cartdetails.products[i];

                collection_product.findOne({_id : p.productId}, function(err, products) {

                         var updatedquantity = products.qty - p.quantity;

                         if(updatedquantity < 0)
                         {
                            updatedquantity = 0;
                         }

                         collection_product.findOneAndUpdate({_id : p.productId},{ $set : { qty : updatedquantity}});
                         console.log(updatedquantity);
                } );
               
               // 
            } 
            

            orderhistory.find({ userId : uid})
             .then(resp => {

                 if(resp.length != 0)
                 {

                          orderhistory.update({userId : uid}, {$push : { orders : { orderId : oid, orderOn : new Date(), products : cartdetails.products}}});

                 }
                 else
                 {
                      orderhistory.insert({                                   
                        
                          userId : uid,

                          orders : [{

                                    orderId : uid + new Date(),
                                       
                                    orderOn : new Date(),

                                    products : cartdetails.products
                                }],
                                 
                     });
 
                 }
             });
     });

     //res.send("kay");

     carts.findOne({userId : uid},function(err, cartdetails){

                            carts.remove({userId : req.query.uid});

                            res.render('orderplaced', {results : cartdetails} );
                       });

}); 



//---------------------------------------------------------------------------------------------------------------------------------------------//

app.get('/orderhistoryUser', function(req,res) {

    var uid = req.query.userid;

    

    orderhistory.aggregate([{$match : { userId : uid}},{$unwind : "$orders"}], function(err, orderdetails){

        {
            //res.send(orderdetails);
            res.render('orderhistoryUser',{results : orderdetails});
        };
       
    });
   

})


// If user has already registered with same user name 
app.get('/invaliduser', function(req, res, next) {
    res.render('invaliduser')//, { message : req.flash('success', 'Registration successfully') });
});

app.post('/register', function(req, res) {
  Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
      if (err) {
         res.redirect('/invaliduser');
      }
      else{

      passport.authenticate('local')(req, res, function () {
        res.redirect('/');
      });
  }
  });
});

// Login Functionality 
app.get('/login', function(req, res) {
    res.render('login');
});

app.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});


//Search and Filter with Pagination functionality
app.post('/dashboard', function(req, res) {
    var perPage = 8;
         var page = req.query.page || 1;

         var options = {
              "limit": perPage,
              "skip": (perPage * page) - perPage
          }

    var collection = db.get('products');
    if (req.body.scategory == "all") {
        
        collection_product.find({"Name": { '$regex': new RegExp("" + req.body.sname, "ig") }},options, function(err, products) { 

          collection_product.count({},(function(err, count) {
              
                if (err) return next(err);
                var num = Math.ceil(count/perPage);
                res.render('dashboard', {results : products, current : page, pages : num});
            }));
      });  
    } else {
        
          collection_product.find({ 
            $and: [
                { "Name": { '$regex': new RegExp("" + req.body.sname, "ig") } },
                { "Category": { '$regex': new RegExp("" + req.body.scategory, "ig") } }
            ]
            },options, function(err, products) { 

          collection_product.count({},(function(err, count) {
              
                if (err) return next(err);
                var num = Math.ceil(count/perPage);
                res.render('dashboard', {results : products, current : page, pages : num});
            }));
      });  
    }

});

//image upload initial assignment code 
//image:
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
  
        // Uploads is the Upload_folder_name
        cb(null, "C:/Users/kajal/Downloads/Final_Jugnu (2)/Final_Jugnu/proj-loginsignup/public/img/shop")
    },
    filename: function (req, file, cb) {
      //cb(null, file.originalname + "-" + Date.now()+".jpg") 
      cb(null, file.originalname);
    }
  })

const maxSize = 1 * 1000 * 1000;
var upload = multer({ 
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb){
    
        // Set the filetypes, it is optional
        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);
  
        var extname = filetypes.test(path.extname(
                    file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
      
        cb("Error: File upload only supports the "
                + "following filetypes - " + filetypes);
      } 
  
// product is the name of file attribute
}).single("product");

//Add a new product
app.get('/addproducts', function(req, res, next) {
    //res.send('hello');
    res.render('addproducts'); 
});


//upload image and add new item
app.post('/', function(req, res) {

    upload(req,res,function(err) {

        if(err) {
  
            // ERROR occured (here it can be occured due
            // to uploading image of size greater than
            // 1MB or uploading different file type)
            res.send(err)
        }
        else {
                var collection = db.get('products');  
                  collection.insert({
                    Name: req.body.name,
                    category: req.body.category,
                    Price : req.body.price,
                    qty: req.body.quantity,
                    image : req.body.image,
                    description: req.body.description,
                    flag : '1'

                  }, function(err, product){

                      if (err) throw err;
                      res.redirect('/');

                  });
      }
  });

});

//render edit apge
app.get('/product_detail/editproduct', function(req, res) {
    var collection = db.get('products'); 
 // res.send('Hello');
  let index = req.query.id;
 // res.send('Hello' + index);
   collection.findOne({ _id: req.query.id }, function(err, products){
     if (err) throw err;
     //res.json(products);
    res.render('editproduct',{results:products});
   });
});

//update item details
app.post('/update', function(req, res){

    upload(req,res,function(err) {

        if(err) {
  
            // ERROR occured (here it can be occured due
            // to uploading image of size greater than
            // 1MB or uploading different file type)
            res.send(err)
        }
        else {
                var index = req.query.id;
              collection_product.update({ _id: index }, {
                $set: {
                    Name: req.body.Name,
                    Price: req.body.Price,
                    image: req.body.image,
                    qty: req.body.quantity,
                    Category: req.body.category,
                    flag : req.body.flag
                }
              },{ upsert:true}, function(err, products){
                if (err) throw err;
                res.redirect('/');
              });
      }
  });
});


//delete 
app.post('/delete', function(req, res){
    var index = req.query.id;
  collection_product.update({ _id: index},  {
    $set: {
        flag: 0,
    }
  },{ upsert:true}, function(err, products){
    if (err) throw err;
      res.redirect('/');
  });
});

module.exports = app;