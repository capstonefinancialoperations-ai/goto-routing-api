const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Store numbers in memory
const allowedCallers = new Set();

// Load CSV on startup
function loadCsv() {
  allowedCallers.clear();

  fs.createReadStream("callers.csv")
    .pipe(csv())
    .on("data", (row) => {
      if (row.caller_number) {
        allowedCallers.add(row.caller_number.trim());
      }
    })
    .on("end", () => {
      console.log("CSV loaded:", allowedCallers.size, "numbers");
    });
}

loadCsv();

// Reload CSV every 5 minutes (optional but useful)
setInterval(loadCsv, 5 * 60 * 1000);

// API endpoint GoTo will call
app.get("/lookup", (req, res) => {
  const caller = req.query.caller;

  console.log("Caller received:", caller);

  if (!caller) {
    return res.status(400).json({ vip: false });
  }

  const isVip = allowedCallers.has(caller);

  return res.json({
    vip: isVip
  });
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
