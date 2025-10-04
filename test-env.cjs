// test-env.cjs
const dotenv = require('dotenv');
dotenv.config();
console.log('VITE_XAI_API_KEY:', process.env.VITE_XAI_API_KEY);
console.log('VITE_API_URL:', process.env.VITE_API_URL);