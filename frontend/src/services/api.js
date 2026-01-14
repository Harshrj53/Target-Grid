import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getContacts = () => axios.get(`${API_URL}/contacts`);
export const createContact = (data) => axios.post(`${API_URL}/contacts`, data);
export const updateContact = (id, data) => axios.put(`${API_URL}/contacts/${id}`, data);
export const getStats = () => axios.get(`${API_URL}/stats`);
export const getConflicts = () => axios.get(`${API_URL}/conflicts`);
export const resolveConflict = (data) => axios.post(`${API_URL}/conflicts/resolve`, data);
