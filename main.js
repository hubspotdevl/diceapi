require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express(); 

const token = process.env.token;
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Utility function to clean up phone number
function normalizePhone(phone) {
    return phone.replace(/[\s\-+]/g, '').replace(/^91/, '');
}

// Endpoint to fetch data from HubSpot API
app.get('/hubspot-api-search', async (req, res) => {
    try {
        const roll_no = req.query.roll_no;
        const rawPhoneInput = req.query.phone;
        const inputPhone = normalizePhone(rawPhoneInput);

        const searchPayload = JSON.stringify({
            filterGroups: [
                {
                    filters: [
                        {
                            value: roll_no,
                            propertyName: "roll_no_",
                            operator: "EQ"
                        }
                    ]
                }
            ],
            properties: ['firstname', 'lastname', 'phone', 'roll_no_', 'hs_lead_status', 'stop_class', 'full_name']
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.hubspot.com/crm/v3/objects/contacts/search',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: searchPayload
        };

        const response = await axios.request(config);

        if (response.data.results.length === 0) {
            return res.status(404).json({ message: "No contact found with the provided roll number." });
        }

        const contact = response.data.results[0];
        const hubspotPhone = normalizePhone(contact.properties.phone || '');

        if (hubspotPhone === inputPhone) {
            return res.json(contact);
        } else {
            return res.status(403).json({ message: "Phone number does not match." });
        }

    } catch (error) {
        console.error("Error fetching from HubSpot:", error.response?.data || error.message);
        res.status(500).json({ message: "Internal server error." });
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
