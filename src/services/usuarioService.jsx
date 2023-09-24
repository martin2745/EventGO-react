import REST from "./REST";
import authHeader from "../components/autenticacion/autenticacionHeader";

class UsuarioService {
  buscarTodos() {
    return REST.get("/usuario", { headers: authHeader() });
  }

  buscarTodosParametros(data) {
    const parametros = Object.keys(data)
      .filter((key) => data[key] !== "")
      .map((key) => `${key}=${encodeURIComponent(data[key])}`)
      .join("&");

    const url = `/usuario?${parametros}`;
    return REST.get(url, { headers: authHeader() });
  }

  buscarPorId(id) {
    return REST.get(`/usuario/${id}`, { headers: authHeader() });
  }

  crear(solicitud) {
    return REST.post("/usuario", solicitud, {
      headers: authHeader(),
    });
  }

  modificar(id, usuario) {
    return REST.post(`/usuario/modificar/${id}`, usuario, {
      headers: authHeader(),
    });
  }

  eliminar(id) {
    return REST.post(`/usuario/eliminar/${id}`, "", { headers: authHeader() });
  }
}

export default new UsuarioService();
