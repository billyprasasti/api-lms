const express = require("express");
const cors = require("cors");
const courseRoutes = require("./routes/courseRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ success: true, message: "videobelajar API berjalan", endpoints: ["/course"] }));
app.use("/course", courseRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: "Endpoint tidak ditemukan." }));
app.use(errorHandler);

module.exports = app;
