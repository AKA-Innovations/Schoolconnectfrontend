const axios = require('axios');

async function testFetch() {
  try {
    // Attempt to read the credentials or token if they exist in localStorage or standard configurations
    console.log("Checking API URL...");
    const apiUrl = 'https://skoolconnectbackend.onrender.com';
    
    // We can list timetable entries by making a GET request to the public or test fetch endpoint
    // Sometimes no params or default params will work to see the schema, or we can see if it requires auth
    const res = await axios.get(`${apiUrl}/class/timetable/fetch`, {
      params: { session: '2026-2027' }
    });
    
    const items = res.data;
    console.log("Response type:", typeof items, Array.isArray(items) ? "Array" : "Object");
    
    const list = Array.isArray(items) ? items : (items.data || items.timetable || items.items || []);
    if (list.length > 0) {
      console.log("First item keys and values:", JSON.stringify(list[0], null, 2));
    } else {
      console.log("No timetable items returned, response body was:", JSON.stringify(items, null, 2));
    }
  } catch (err) {
    console.error("Fetch failed as expected if unauthorized. Status:", err.response?.status);
    if (err.response?.data) {
      console.log("Error details:", JSON.stringify(err.response.data, null, 2));
    }
  }
}

testFetch();
