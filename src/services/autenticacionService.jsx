import REST from "./REST";

class AutenticacionService {
  login(datoslogin) {
    return REST.post("/auth/login", datoslogin).then((response) => {
      if (response.data.token) {
        localStorage.setItem("token", JSON.stringify(response.data.token));
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      if (response.data.login) {
        localStorage.setItem("login", response.data.login);
      }
      if (response.data.rol) {
        localStorage.setItem("rol", response.data.rol);
      }
      return response.data;
    });
  }

  registro(datosRegistro) {
    return REST.post("/auth/registro", datosRegistro);
  }

  recuperarPassword(datosRecuperarPassword) {
    const idioma = localStorage.getItem("idioma");
    datosRecuperarPassword.idioma = idioma;
    return REST.post("/auth/recuperarPassword", datosRecuperarPassword);
  }

  logout() {
    localStorage.removeItem("login");
    localStorage.removeItem("rol");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
}
export default new AutenticacionService();
