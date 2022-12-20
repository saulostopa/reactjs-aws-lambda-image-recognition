import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_AWS_API_BE_UPLOAD_IMG
});

export default api;
