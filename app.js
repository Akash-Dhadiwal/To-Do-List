//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//mongoose.connect("mongodb://localhost:27017/todolistDB",{useUnifiedTopology: true,useNewUrlParser: true});;
mongoose.connect("mongodb+srv://admin-akash:Akash123@cluster0.rciuz.mongodb.net/todolistDB?retryWrites=true&w=majority",{useUnifiedTopology: true,useNewUrlParser: true});;


const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name : "Welcome to your todolist!"
});

const item2 = new Item({
  name : "Click on New Item and hit the + button to add a new item."
});


const item3 = new Item({
  name : "<-- Hit this to delete an item."
});

const defaultArray = [item1,item2,item3];

const listSchema = {
  name : String ,
  items : [itemsSchema]
};

const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {

  const day = date.getDate();

  Item.find({},function(err,foundItems)
  {
    if(foundItems.length===0){
      Item.insertMany(defaultArray,function(err){
      if(err)
      {
        console.log(err);
      }
      else{
        console.log("Successfully saved default array items");
      }
    });
    res.redirect("/");
    }
    else{
      //console.log(foundItems.name);
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});
var count =0;

app.get("/:customListName", function(req,res){
  const routeName = _.capitalize(req.params.customListName);
  List.findOne({name: routeName},function(err,foundList){
    if(!err){
      if(!foundList){
        // Create a new list
        const list = new List({
        name : routeName,
        items : defaultArray
      });
      list.save();
      count=1;
      res.redirect("/" + routeName);
      }
      else{
        // List.find({name:"Kedarnath"},function(err,ans){
        //   console.log(ans);
        // })
        
        res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
      }
    }

  });
  
});



app.post("/delete",function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  
  if(listName === "Today"){
    Item.deleteOne({_id:checkedItemId},function(err){
      if(err){
            console.log(err);
        }
        else{
            console.log("Successfully Deleted");
        }  
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull : {items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
  
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name : itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});

