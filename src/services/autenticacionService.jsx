import REST from "./REST";

class AutenticacionService {
  login(datoslogin) {
    return REST.post("/auth/login", datoslogin).then((response) => {
      if (response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    });
  }

  registro(datosRegistro) {
    return REST.post("/auth/registro", datosRegistro);
  }

  logout() {
    localStorage.removeItem("user");
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
}
export default new AutenticacionService();
