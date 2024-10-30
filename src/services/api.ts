import axios from "axios";

const api = axios.create({
   timeout: 30000,
   timeoutErrorMessage: "A requisição excedeu o tempo limite",
});

export default api;
