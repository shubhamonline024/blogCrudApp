const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");
require("dotenv").config();

const PORT = process.env.PORT || 80;

const app = express();
app.use(helmet());
app.use(express.json());
// app.use(cors({ origin: "// your domain" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const { USER, PASSWORD } = process.env;
const url = `mongodb+srv://${USER}:${encodeURIComponent(
  PASSWORD
)}@cluster0.xwlwpuu.mongodb.net/?appName=Cluster0`;
mongoose
  .connect(url)
  .then(() => {
    console.log("successfully connected to mongodb");
  })
  .catch((err) => {
    console.log("Error while connecting to mongodb", err);
  });

const blogSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const blog = mongoose.model("blogs", blogSchema);

app.get("/", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.get("/blogs", async (req, res) => {
  try {
    const result = await blog.find();

    if (result.length) {
      res.status(200).json({
        data: result,
        total_blogs: result.length,
      });
    } else {
      res.status(404).json({
        data: [],
        total_blogs: result.length,
        message: "No Data Found",
      });
    }
  } catch (error) {
    res.status(500).json({
      data: [],
      message: `Error: ${error.message}`,
    });
  }
});

app.post("/add", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        data: [],
        message: `No Body Found in Request`,
      });
    }

    const reqArray = req.body;

    if (!Array.isArray(reqArray)) {
      return res.status(400).json({
        data: [],
        message: `Invalid Array`,
      });
    }

    const arrayLength = reqArray.length;

    if (arrayLength === 0) {
      return res.status(400).json({
        data: [],
        message: `Array is empty`,
      });
    }

    const newBlog = [];
    for (let i = 0; i < arrayLength; i++) {
      if (!reqArray[i].title) {
        return res.status(400).json({
          data: [],
          message: `Title Not Present for ${i + 1} element`,
        });
      }
      if (!reqArray[i].content) {
        return res.status(400).json({
          data: [],
          message: `Content Not Present for ${i + 1} element`,
        });
      }
      const newData = {
        id: uuid(),
        title: reqArray[i].title,
        content: reqArray[i].content,
      };
      newBlog.push(newData);
    }

    await blog.insertMany(newBlog);

    res.status(201).json({
      data: newBlog,
      message: `Successfully Added ${newBlog.length} blogs`,
    });
  } catch (error) {
    res.status(500).json({
      data: [],
      message: `Error: ${error.message}`,
    });
  }
});

app
  .route("/blog/:id")
  .get(async (req, res) => {
    const paramId = req.params.id;

    if (!paramId) {
      res.status(400).json({
        data: [],
        message: `No Id Found`,
      });
    }

    try {
      const result = await blog.find({ id: paramId });

      if (result.length > 0) {
        res.status(200).json({
          data: result,
          message: `Successfully Found Blog for ID: ${paramId}`,
        });
      } else {
        res.status(404).json({
          data: [],
          message: `Error No Blog Found for ID: ${paramId}`,
        });
      }
    } catch (error) {
      res.status(500).json({
        data: [],
        message: `Error: ${error.message}`,
      });
    }
  })
  .patch(async (req, res) => {
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

    try {
      const updatedRecord = await blog.findOneAndUpdate(
        { id: paramId },
        { $set: { title: req.body.title, content: req.body.content } },
        { new: true }
      );
      if (updatedRecord) {
        res.status(200).json({
          data: updatedRecord,
          message: `Successfully updated Blog for ID ${paramId}`,
        });
      } else {
        res.status(404).json({
          data: [],
          message: `No Blog Found for ID ${paramId}`,
        });
      }
    } catch (error) {
      res.status(500).json({
        data: [],
        message: `Error: ${error.message}`,
      });
    }
  })
  .delete(async (req, res) => {
    const paramId = req.params.id;

    if (!paramId) {
      res.status(400).json({
        data: [],
        message: `No Id Found`,
      });
    }

    try {
      const deletedRecord = await blog.findOneAndDelete({ id: paramId });

      if (deletedRecord) {
        res.status(200).json({
          data: deletedRecord,
          message: `Successfully Deleted Blog for ID ${paramId}`,
        });
      } else {
        res.status(404).json({
          data: [],
          message: `No Blog Found for ID ${paramId}`,
        });
      }
    } catch (error) {
      res.status(500).json({
        data: [],
        message: `Error: ${error.message}`,
      });
    }
  });

app.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});
