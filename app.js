const express = require("express")
const day = require(__dirname+"/day.js")
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express()

app.set("view engine","ejs")
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin-vyom:test123@cluster0.jbfgx.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology:true});

const itemsSchema={
    name:String
}

const Item = mongoose.model("Item",itemsSchema)

const eat = new Item({
    name:"Eat"
})

const valo = new Item({
    name:"Play Valorant"
})

const sleep = new Item({
    name:"Sleep"
})

const defaultItems = [eat,valo,sleep]

const newListSchema = {
    name:String,
    items:[itemsSchema]
}

const List = mongoose.model("List",newListSchema)

app.get("/",function(req,res){
    Item.find({},function(err,foundItems){
        if(err){
            console.log(err)
        }
        else{
            if(foundItems.length==0){
                Item.insertMany(defaultItems,function(err){
                    if(err){
                        console.log(err)
                    }
                    else{
                        console.log("Inserted Successfully")
                        res.redirect("/")
                    }
                })
            }
            else{
            // const currentDate=day.getDate()
            res.render("list",{currentTitle:"Today",newItems:foundItems})
            //could pass currentDate inplace of "Today"
            }
        }
    })
})

app.get("/:newList",function(req,res){
    const newList = _.capitalize(req.params.newList)
    List.findOne({name:newList},function(err,results){
        if(!results){
            const item = new List({
                name:newList,
                items:defaultItems
            })
            item.save(function(err){
                if(!err){
                    res.redirect("/"+newList)
                }
            })
        }
        else{
            res.render("list",{currentTitle:results.name,newItems:results.items})
        }
    })
})

app.post("/",function(req,res){
    const item = req.body.task
    const title = req.body.submit
    const newItem =  new Item({
        name:item
    })
    if(title=="Today"){
        newItem.save()
        res.redirect("/")
    }
    else{
        List.findOne({name:title},function(err,foundList){
            foundList.items.push(newItem)
            foundList.save()
            res.redirect("/"+title)
        })
    }
    
    // if(req.body.submit==="Work"){
    //     work.push(item)
    //     res.redirect("/work")
    // }
    // else{
    //     items.push(item)
    //     res.redirect("/")
    // }   
})

app.post("/delete",function(req,res){
    const deleteItem = req.body.checkbox
    const listName = req.body.listName

    if(listName=="Today"){
        Item.findByIdAndDelete(deleteItem,function(err){
            if(err){
                console.log(err)
            }
            else{
                console.log("Removed Successfully")
                res.redirect("/")
            }
        })
    }
    else{
        List.findOneAndDelete({name:listName},{$pull:{items:{_id:deleteItem}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName)
            }
        })
    }
    
})

// app.get("/work",function(req,res){
//     res.render("list",{currentTitle:"Work List",newItems:work})
// })

app.get("/about",function(req,res){
    res.render("about")
})

app.listen(process.env.PORT || 3000,function(){
    console.log("Port 3000 created")
})