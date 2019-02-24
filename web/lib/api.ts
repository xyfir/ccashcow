import axios from 'axios';
export const api = axios.create({ baseURL: process.enve.RICH_COW_API_URL });
