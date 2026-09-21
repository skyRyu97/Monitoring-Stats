const express = require("express");
const app = express();
app.use(express.json());

app.post("/api/stats", (req, res) => {
  console.log(req.body);
  res.json({ ok: true });
});

app.listen(5000, () => console.log("Server running on port 5000"));
