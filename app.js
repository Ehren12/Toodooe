
// Imports
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

//Declaring app
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));


//Connecting the mongo db database with mongoose.connect via port 27017
mongoose.connect("mongodb://localhost:27017/toodoosDB", {useNewUrlParser: true, useUnifiedTopology: true})

// Items Schema
const itemsSchema = {
  name: String,
};


//Mongoose Model
const Item = mongoose.model("Item", itemsSchema);

//Default Items
const item1 = new Item ({
  name: "Welcome"
});

const item2 = new Item ({
  name: "Welcome  how are you doing this lovely day"
});

const item3 = new Item ({
  name: "Welcome lad"
});

const itemArray = [item1, item2, item3]

//List Schema
const listSchema = {
  name: String,
  items: [itemsSchema]
}

//List Model
const List = mongoose.model("List", listSchema)


// Home Route or Today list
app.get("/", function (req, res) {
  const day = date.getDate();

  //If statement which finds out weather new items
  //exsist or not if they exsist it will add.
  Item.find({}, (err, result) => {
    if (result.length === 0){
      Item.insertMany(itemArray, (err) => {
        if (err){
          console.log(err)
        }else{
          console.log("Success")
        }
      })
      res.redirect("/")
    } else{
      res.render("list", { listTitle: "Today", newTodoItems: result});
    }
    
   })

  
});

// This is a dynamic route
// To access other lists apart from the Today list 
app.get("/:CustomListName", (req, res) => {
  const CustomListName = req.params.CustomListName

  
  // This adds the list name to the database
  List.findOne({name: CustomListName}, function(err, result){
    if(!err){
      if (!result){
        const list = new List ({
          name: CustomListName,
          item: itemArray
        });
      
        list.save()
      } else {
        res.render("list", { listTitle: result.name, newTodoItems: result.item})
      }
    } 
  })
})


// Post route
app.post("/", function (req, res) {
  const todoName = req.body.todo;
  const listName = req.body.list;

  const todo= new Item ({
    name: todoName
  });

  // This part is responsible for adding new items in other lists

  if (listName === "Today"){
    todo.save();
    res.redirect("/")
  } else {
     List.findOne({name: listName}, (err, result) => {
        
        result.items.push(todo)
        result.save()
        res.redirect("/" + listName)
     })
  }

});


// delete route
app.post("/delete", (req, res) => {
  const checkedItem = req.body.checkbox
  Item.findByIdAndRemove(checkedItem, (err) => {
    if (err){
      console.log(err)
    } else{
      console.log("GGoood")
      res.redirect("/")
    }
  })
})


app.get("/about", function (req, res) {
  res.render("about");
});

// Port
app.listen(3000, function () {
  console.log("Started at port 3000");
});
