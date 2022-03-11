const mysql = require("mysql2");
const express = require("express");
const inputCheck =  require('./utils/inputCheck');
const { param } = require("express/lib/request");

const PORT = process.env.PORT || 3001;
const app = express();

// EXPRESS MIDDLEWARE
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// CONNECT TO THE DATABASE
const db = mysql.createConnection(
{
    host: 'localhost',
    //Your MySQL username
    user: 'root',
    password: 'root',
    database: 'election'
},
    console.log('Connected to the election database')
);

// QUERY ALL THE CANDIDATE'S INFORMATION
app.get('/api/candidates', (req, res) => {  // api/candidates is the API endpoint
    const sql = `SELECT candidates.*, parties.name 
                AS party_name 
                FROM candidates 
                LEFT JOIN parties 
                ON candidates.party_id = parties.id`;  // The SQL statement "SELECT * FROM candidates" is assigned to sql variable.

db.query(sql, (err, rows) => {
    if(err) {
        res.status(500).json({error: err.message}); // Instead of console logging the error, we'll send a status code 500 and place the error message within a JSON object.
        // The 500 status code indicates a server error—different than a 404, which indicates a user request error.
        return; // The return statement will exit the database call once an error is encountered.
    }
    res.json({
        message: 'Success',     // Instead of console logging the result, "rows", from the database, we'll send this response as a JSON object to the browser, using res in the Espress.js route callback.
        data: rows   
    });
   });
});

// QUERY A SINGLE CANDIDATE.
app.get('/api/candidate/:id', (req, res) => {   // Here, we're using the get() route method again. This time, the endpoint has a route parameter that will hold the value of the id to specify which candidate we'll select from the database.
    const sql = `SELECT candidates.*, parties.name 
                AS party_name 
                FROM candidates 
                LEFT JOIN parties 
                ON candidates.party_id = parties.id 
                WHERE candidates.id = ?`;
    const params = [req.params.id];

db.query(sql, params, (err, row) => {  // In the database call, we'll assign the captured value populated in the req.params object wiht the key id to params.
            if (err) {
                res.status(400).json({error: err.message});
                return;
            }        
            res.json({
                message: "success",
                data: row
            })
        });
    })


app.get('/api/parties', (req, res) => {
  const sql = `SELECT * FROM parties`;

  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({error: err.message});
      return;
    }
    res.json({
      message: "Success",
      data: rows
    });
  });
});


app.get('/api/parties', (req, res) => {
  const sql = `SELECT * FROM parties`;
  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

app.get('/api/party/:id', (req, res) => {
  const sql = `SELECT * FROM parties WHERE id = ?`;
  const params = [req.params.id];
  db.query(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: row
    });
  });
});

// DELETE A CANDIDATE
app.delete('/api/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];
  
    db.query(sql, params, (err, result) => {
      if (err) {
        res.statusMessage(400).json({ error: res.message });
      } else if (!result.affectedRows) { // If there are no affectedRows as a result of the delete query, that means that there was no candidate by that id. 
        res.json({
          message: 'Candidate not found'
        });
      } else {
        res.json({
          message: 'deleted',
          changes: result.affectedRows,
          id: req.params.id
        });
      }
    });
  });

  app.delete('/api/party/:id', (req, res) => {
    const sql = `DELETE FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: res.message });
        // checks if anything was deleted
      } else if (!result.affectedRows) {
        res.json({
          message: 'Party not found'
        });
      } else {
        res.json({
          message: 'deleted',
          changes: result.affectedRows,
          id: req.params.id
        });
      }
    });
  });

// CREATE A CANDIDATE
app.post('/api/candidate', ({ body }, res) => { 
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
  VALUES (?,?,?)`;
const params = [body.first_name, body.last_name, body.industry_connected];

db.query(sql, params, (err, result) => {
  if (err) {
    res.status(400).json({ error: err.message });
    return;
  }
  res.json({
    message: 'success',
    data: body
  });
});
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected'); 
    if (errors) {
      res.status(400).json({ error: errors });
      return;
    }
  });

    // we use the HTTP request method post() to insert a candidate into the candidates table.  
    // In the callback function, we'll use the object req.body to populate the candidate's data. 
    // Notice that we're using object destructuring to pull the body property out of the request object. 
    // Until now, we've been passing the entire request object to the routes in the req parameter. 
    // In the callback function block, we assign errors to receive the return from the inputCheck function.
    // This inputCheck module was provided by a helpful U Develop It member. 
    // We'll use this module to verify that user info in the request can create a candidate.


  // UPDATE A CANDIDATE'S PARTY
  app.put('/api/candidate/:id', (req, res) => {
    const errors = inputCheck(req.body, 'party_id');

    if (errors) {
  res.status(400).json({ error: errors });
  return;
}
    const sql = `UPDATE candidates SET party_id = ?
                WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];
    db.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({error: err.message});
        // CHECK IF A RECORD WAS FOUND
      } else if (!result.affectedRows) {
        res.json({
          message: "Candidate not found"
        });
      } else {
        res.json({
          message: "Success",
          data: req.body,
          changes: result.affectedRows
        });
      }
    });
  });

// DEFAULT RESPONSE FOR ANY OTHER REQUESTS (Not Found)
app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});