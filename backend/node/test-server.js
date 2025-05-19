const express = require("express");
const app = express();

const PORT = parseInt(process.env.PORT, 10);
if (!PORT) {
  console.error("process.env.PORT not set");
  process.exit(1);
}

app.get("/", (req, res) => res.send("Hello from test server"));

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
