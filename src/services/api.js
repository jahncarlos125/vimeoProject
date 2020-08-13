import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.vimeo.com/',
});

export default api;
