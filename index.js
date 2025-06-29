import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const db= new pg.Client({
  user: process.env.DB_USER,
  database:process.env.DB_DATABASE,
  password:process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port:process.env.DB_HOST,
});

db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "buy milk" },
  { id: 2, title: "paint wall" },
];

app.get("/", async(req, res) => {
  try{
  const result = await db.query("select * from items where list = 'Today' order by id asc");
  items= result.rows;
const listsResult = await db.query("SELECT DISTINCT list FROM items ORDER BY list ASC");
    const allLists = listsResult.rows.map(row => row.list);

    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
      allLists: allLists
    });
}
catch(err){
  console.log(err);
}
});

app.get("/:customList", async (req, res) => {
  const customList = req.params.customList;
  const formattedList = customList.charAt(0).toUpperCase() + customList.slice(1).toLowerCase();
  try {
    const result = await db.query("SELECT * FROM items WHERE list = $1 ORDER BY id ASC", [formattedList]);

    const listsResult = await db.query("SELECT DISTINCT list FROM items ORDER BY list ASC");
    const allLists = listsResult.rows.map(row => row.list);

    res.render("index.ejs", {
      listTitle: formattedList,
      listItems: result.rows,
      allLists: allLists
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/newlist",(req,res)=>{
const newList= req.body.newList.trim();
if(!newList) res.redirect("/");
else{
res.redirect("/"+newList.toLowerCase());
}
})
app.post("/add", async(req, res) => {
  const item = req.body.newItem;
  const list = req.body.list;
  try{
  await db.query("insert into items(title,list)values ($1,$2)",[item,list]);
     res.redirect(
      list==="Today"?"/":"/"+list.toLowerCase()
    );
  } 
  catch(err){
    console.log(err);
  }
});

app.post("/edit", async(req, res) => {
  const title= req.body.updatedItemTitle;
  const id= req.body.updatedItemId;
  const list = req.body.list;
  try{
  await db.query("update items set title =($1) where id = $2",[title,id]);
    res.redirect(
      list==="Today"?"/":"/"+list.toLowerCase()
    );
  }
  catch(err){
    console.log(err);
  }
});

app.post("/delete", async(req, res) => {
  const id= req.body.deleteItemId;
  const list = req.body.list;
  try{
   await db.query("delete from items where id = $1",[id]);
  res.redirect(
      list==="Today"?"/":"/"+list.toLowerCase()
    );
  }
  catch(err){
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
