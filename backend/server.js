const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());

/* Database */
mongoose
  .connect(
    "mongodb+srv://praveenyabalasubramaniyam_db_user:3tzWGyRXAxgWW9Tv@cluster0.ti454qw.mongodb.net/Laundry?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

/* Routes */
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/queue", require("./routes/queueRoutes"));
app.use("/api/machines", require("./routes/machineRoutes"));

/* Models */
const Queue = require("./models/Queue");
const Machine = require("./models/Machine");

/* Start server */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});