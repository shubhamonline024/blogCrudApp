const express = require("express");

const PORT = 80;
const DB = [];
let id = 0;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "healthy" });
});

app.get("/blogs", (req, res) => {
  res.json({
    data: DB,
    total_blogs: DB.length,
  });
});

app.post("/add", (req, res) => {
  const reqArray = req.body;
  const arrayLength = reqArray.length;

  const newBlog = [];
  for (let i = 0; i < arrayLength; i++) {
    const newId = id;
    const newData = {
      id: newId,
      title: req.body[i].title,
      content: req.body[i].content,
    };
    newBlog.push(newData);
    DB.push(newData);
    id = id + 1;
  }
  res.json({
    data: newBlog,
    message: `Successfully Added ${newBlog.length} blogs`,
  });
});

app
  .route("/blog/:id")
  .get((req, res) => {
    const paramId = req.params.id;
    const recordFound = DB.filter((obj) => obj.id === +paramId);
    if (recordFound.length > 0) {
      res.json({
        data: recordFound,
        message: `Successfully Found Blog for ID: ${paramId}`,
      });
    } else {
      res.json({
        data: [],
        message: `Error No Blog Found for ID: ${paramId}`,
      });
    }
  })
  .patch((req, res) => {
    const paramId = req.params.id;
    const blogIdx = DB.findIndex((obj) => obj.id === +paramId);
    if (blogIdx !== -1) {
      DB.splice(blogIdx, 1);
      const newBlog = {
        id: +paramId,
        title: req.body.title,
        content: req.body.content,
      };
      DB.push(newBlog);
      res.json({
        data: newBlog,
        message: `Successfully updated Blog for ID ${paramId}`,
      });
    } else {
      res.json({
        data: [],
        message: `No Blog Found for ID ${paramId}`,
      });
    }
  })
  .delete((req, res) => {
    const paramId = req.params.id;
    const blogIdx = DB.findIndex((obj) => obj.id === +paramId);
    if (blogIdx !== -1) {
      const removedBlog = DB[blogIdx];
      DB.splice(blogIdx, 1);
      res.json({
        data: removedBlog,
        message: `Successfully Deleted Blog for ID ${paramId}`,
      });
    } else {
      res.json({
        data: [],
        message: `No Blog Found for ID ${paramId}`,
      });
    }
  });

app.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});
