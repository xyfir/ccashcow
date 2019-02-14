import { RICH_COW_API_URL } from 'constants/config';
import axios from 'axios';

export const api = axios.create({ baseURL: RICH_COW_API_URL });
