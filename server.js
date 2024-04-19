import express from 'express';
import bodyParser from 'body-parser';
import * as serverCjs from './server.cjs';

const app = express();
app.use(bodyParser.json());

app.post('/process.json', (req, res) => {
  console.log('Received POST request to /process.json'); // Add this line
  const data = req.body;
  console.log('Data:', data); // And this line
  serverCjs.updateProcessJson(data)
    .then(() => {
      res.send('Data successfully written to file');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error writing to file');
    });
});

app.listen(3000, () => console.log('Server listening on port 3000'));