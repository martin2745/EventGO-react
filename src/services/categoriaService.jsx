import REST from "./REST";
import authHeader from "../components/autenticacion/autenticacionHeader";

class CategoriaService {
  buscarTodos() {
    return REST.get("/categoria", { headers: authHeader() });
  }

  buscarTodosParametros(data) {
    const parametros = Object.keys(data)
      .filter((key) => data[key] !== "")
      .map((key) => `${key}=${encodeURIComponent(data[key])}`)
      .join("&");

    const url = `/categoria?${parametros}`;
    return REST.get(url, { headers: authHeader() });
  }

  buscarPorId(id) {
    return REST.get(`/categoria/${id}`, { headers: authHeader() });
  }

  crear(solicitud) {
    return REST.post("/categoria", solicitud, {
      headers: authHeader(),
    });
  }

  modificar(id, categoria) {
    return REST.post(`/categoria/modificar/${id}`, categoria, {
      headers: authHeader(),
    });
  }

  eliminar(id) {
    return REST.post(`/categoria/eliminar/${id}`, "", {
      headers: authHeader(),
    });
  }
}

export default new CategoriaService();
