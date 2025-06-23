import axios from "axios";

// fallback baseURL incase proxy is missing/disabled
axios.defaults.baseURL = "http://localhost:5000";
// enable credentials for future auth / cookies
axios.defaults.withCredentials = true;

export default axios;
