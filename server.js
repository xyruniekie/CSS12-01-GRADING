const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 4000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const historyFilePath = path.join(__dirname, 'history.json');

// Serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle grade calculation and history saving
app.post('/calculate', (req, res) => {
  const { name, grades } = req.body;
  if (!name || !grades || !Array.isArray(grades)) {
    return res.status(400).json({ error: 'Name and grades are required' });
  }

  const average = (grades.reduce((sum, grade) => sum + grade, 0) / grades.length).toFixed(2);

  // Read history, update and save
  let history = [];
  if (fs.existsSync(historyFilePath)) {
    history = JSON.parse(fs.readFileSync(historyFilePath, 'utf8'));
  }
  history.push({ name, grades, average, date: new Date().toISOString() });
  fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));

  res.json({ average });
});

// Get history
app.get('/history', (req, res) => {
  if (fs.existsSync(historyFilePath)) {
    const history = JSON.parse(fs.readFileSync(historyFilePath, 'utf8'));
    res.json(history);
  } else {
    res.json([]);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
