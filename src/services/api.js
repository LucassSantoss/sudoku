import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Altere para o endereço do seu servidor
});

export const login = async (email, senha) => {
  try {
    const response = await api.post('/login', { email, senha });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const register = async (nome, email, senha) => {
  try {
    const response = await api.post('/register', { nome, email, senha });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
