import axios from 'axios';
export const api = axios.create({ baseURL: process.enve.CCASHCOW_API_URL });
