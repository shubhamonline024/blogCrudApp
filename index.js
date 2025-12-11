const express = require("express");
const helmet = require("helmet");

const PORT = 80;
const DB = [];
let id = 0;

const app = express();
app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.get("/blogs", (req, res) => {
  if (DB.length) {
    res.status(200).json({
      data: DB,
      total_blogs: DB.length,
    });
  } else {
    res.status(404).json({
      data: DB,
      total_blogs: DB.length,
      message: "No Data Found",
    });
  }
});

app.post("/add", (req, res) => {
  if (!req.body) {
    res.status(400).json({
      data: [],
      message: `No Body Found in Request`,
    });
  }

  const reqArray = req.body;

  if (!Array.isArray(reqArray)) {
    res.status(400).json({
      data: [],
      message: `Invalid Array`,
    });
  }

  const arrayLength = reqArray.length;

  const newBlog = [];
  for (let i = 0; i < arrayLength; i++) {
    const newId = id;
    if (!req.body[i].title) {
      res.status(400).json({
        data: [],
        message: `Title Not Present for ${i + 1} element`,
      });
    }
    if (!req.body[i].content) {
      res.status(400).json({
        data: [],
        message: `Content Not Present for ${i + 1} element`,
      });
    }
    const newData = {
      id: newId,
      title: req.body[i].title,
      content: req.body[i].content,
    };
    newBlog.push(newData);
    DB.push(newData);
  }
  res.status(201).json({
    data: newBlog,
    message: `Successfully Added ${newBlog.length} blogs`,
  });
});

app
  .route("/blog/:id")
  .get((req, res) => {
    const paramId = req.params.id;

    if (!paramId) {
      res.status(400).json({
        data: [],
        message: `No Id Found`,
      });
    }

    const recordFound = DB.filter((obj) => obj.id === paramId);
    if (recordFound.length > 0) {
      res.status(200).json({
        data: recordFound,
        message: `Successfully Found Blog for ID: ${paramId}`,
      });
    } else {
      res.status(404).json({
        data: [],
        message: `Error No Blog Found for ID: ${paramId}`,
      });
    }
  })
  .patch((req, res) => {
    const paramId = req.params.id;

    if (!paramId) {
      res.status(400).json({
        data: [],
        message: `No Id Found`,
      });
    }

    if (!req.body.title) {
      res.status(400).json({
        data: [],
        message: `Title Not Present for element`,
      });
    }
    if (!req.body.content) {
      res.status(400).json({
        data: [],
        message: `Content Not Present for element`,
      });
    }

    const blogIdx = DB.findIndex((obj) => obj.id === +paramId);
    if (blogIdx !== -1) {
      DB[blogIdx] = { ...DB[blogIdx], ...req.body };
      const newBlog = {
        id: +paramId,
        title: req.body.title,
        content: req.body.content,
      };
      res.status(200).json({
        data: newBlog,
        message: `Successfully updated Blog for ID ${paramId}`,
      });
    } else {
      res.status(404).json({
        data: [],
        message: `No Blog Found for ID ${paramId}`,
      });
    }
  })
  .delete((req, res) => {
    const paramId = req.params.id;

    if (!paramId) {
      res.status(400).json({
        data: [],
        message: `No Id Found`,
      });
    }

    const blogIdx = DB.findIndex((obj) => obj.id === +paramId);
    if (blogIdx !== -1) {
      const removedBlog = DB[blogIdx];
      DB.splice(blogIdx, 1);
      res.status(200).json({
        data: removedBlog,
        message: `Successfully Deleted Blog for ID ${paramId}`,
      });
    } else {
      res.status(404).json({
        data: [],
        message: `No Blog Found for ID ${paramId}`,
      });
    }
  });

app.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});
