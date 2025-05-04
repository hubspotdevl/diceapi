require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express(); 
const token = process.env.token;
const PORT = process.env.PORT || 3000;
//
// Middleware to parsgie JSON request body 
app.use(express.json());

// CORS middleware (you can refine this to allow requests only from your frontend domain)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Endpoint to fetch data from HubSpot API
 


app.get('/hubspot-api-search', async (req, res) => {

    const roll_no = req.query.roll_no;
    const rawPhone = req.query.phone;
    const phone =  rawPhone.replace(/\s+/g, '');

    let data = JSON.stringify({
        "filterGroups": [
          {
            "filters": [
              {
                "value": roll_no,
                "propertyName": "roll_no_",
                "operator": "EQ"
              },
              {
                "value": phone,
                "propertyName": "phone",
                "operator": "EQ"
              }
            ]
          }
        ],
        properties: ['firstname','lastname','phone','roll_no_','hs_lead_status','stop_class','full_name']
      });
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.hubspot.com/crm/v3/objects/contacts/search',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data : data
      };
      
      axios.request(config)
      .then((response) => {
          console.log(JSON.stringify(response.data));
          
        res.json(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
      
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
