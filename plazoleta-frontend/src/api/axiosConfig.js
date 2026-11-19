import axios from 'axios';

export const usuariosApi = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
});

export const plazoletaApi = axios.create({
    baseURL: 'http://localhost:8081/api/v1',
});

const attachToken = (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

usuariosApi.interceptors.request.use(attachToken);
plazoletaApi.interceptors.request.use(attachToken);