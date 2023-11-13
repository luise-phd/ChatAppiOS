import Axios from 'axios';

const server = Axios.create({
    // baseURL: 'http://192.168.20.23:4000',
    baseURL: 'https://backchatapp-production.up.railway.app'
});

export default server;
