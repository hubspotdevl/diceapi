
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express(); 
const token = process.env.token; 
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
});

 
function normalizePhone(phone) {
  if (!phone) return ''; 
  let cleaned = phone.replace(/\D/g, ''); 
  if (cleaned.startsWith('91')) {
      cleaned = cleaned.slice(2);
  }
  return cleaned;
}

async function checkRecord(rollNo, phone) {
  const url = 'https://api.hubspot.com/crm/v3/objects/contacts/search';

  const payload = {
    filterGroups: [
      {
        filters: [
          {
            propertyName: 'roll_no_',
            operator: 'EQ',
            value: rollNo
          }
        ]
      }
    ],
    properties: ['firstname', 'lastname', 'email', 'phone', 'roll_no_','stop_class'],
    limit: 1
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
 
    const results = response.data.results;  

    if (results?.length > 0) {
      const inputPhoneNumber = normalizePhone(phone);
      const rawPhoneNumberInDB = results[0]?.properties?.phone;
      const phoneInDB = normalizePhone(rawPhoneNumberInDB); 
      const returnObj = {
        ...results[0],
        nameToPrint: results[0]?.properties?.full_name ? results[0]?.properties?.full_name : results[0]?.properties?.firstname + " " + results[0]?.properties?.lastname,
      }

      if (inputPhoneNumber === phoneInDB) {
        console.log("Record found !", returnObj);
        return returnObj;
      }
      else {
        console.log("Record not found !", returnObj);
        return returnObj;
      }
    } else {
      console.log("Invalid Credentials.")
    }
  } catch (error) {
    console.error('Error fetching contact:', error.response?.data || error.message);
  }
}

app.get('/hubspot-api-search', async (req, res) => {
  try {
    const phone = req.query.phone;
    const rollNo = req.query.roll_no;
    checkRecord(rollNo,phone);
  } catch (error) {
    console.log(error.message);
  }
});

  
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

 

// require('dotenv').config();
// const express = require('express');
// const axios = require('axios');
// const app = express(); 
// const token = process.env.token;
// const PORT = process.env.PORT || 3000;
// //
// // Middleware to parsgie JSON request body 
// app.use(express.json());

// // CORS middleware (you can refine this to allow requests only from your frontend domain)
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// });

// // Endpoint to fetch data from HubSpot API
 


// app.get('/hubspot-api-search', async (req, res) => {

//     const roll_no = req.query.roll_no;
//     const rawPhone = req.query.phone;
//     const phone =  rawPhone.replace(/[\s-]+/g, '');

//     let data = JSON.stringify({
//         "filterGroups": [
//           {
//             "filters": [
//               {
//                 "value": roll_no,
//                 "propertyName": "roll_no_",
//                 "operator": "EQ"
//               },
//               {
//                 "value": phone,
//                 "propertyName": "phone",
//                 "operator": "EQ"
//               }
//             ]
//           }
//         ],
//         properties: ['firstname','lastname','phone','roll_no_','hs_lead_status','stop_class','full_name']
//       });
      
//       let config = {
//         method: 'post',
//         maxBodyLength: Infinity,
//         url: 'https://api.hubspot.com/crm/v3/objects/contacts/search',
//         headers: { 
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//         },
//         data : data
//       };
      
//       axios.request(config)
//       .then((response) => {
//           console.log(JSON.stringify(response.data));
          
//         res.json(response.data);
//       })
//       .catch((error) => {
//         console.log(error);
//       });
      
// });


// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
