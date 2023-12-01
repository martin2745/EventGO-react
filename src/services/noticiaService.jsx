import REST from "./REST";
import authHeader from "../components/autenticacion/autenticacionHeader";

class NoticiaService {
  buscarTodos() {
    return REST.get("/noticia", { headers: authHeader() });
  }

  buscarTodosParametros(data) {
    const parametros = Object.keys(data)
      .filter((key) => data[key] !== "")
      .map((key) => `${key}=${encodeURIComponent(data[key])}`)
      .join("&");

    const url = `/noticia?${parametros}`;
    return REST.get(url, { headers: authHeader() });
  }

  buscarPorId(id) {
    return REST.get(`/noticia/${id}`, { headers: authHeader() });
  }

  crear(solicitud) {
    return REST.post("/noticia", solicitud, {
      headers: authHeader(),
    });
  }

  eliminar(id) {
    return REST.post(`/noticia/eliminar/${id}`, "", {
      headers: authHeader(),
    });
  }
}

export default new NoticiaService();
