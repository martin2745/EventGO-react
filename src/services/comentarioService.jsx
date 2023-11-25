import REST from "./REST";
import authHeader from "../components/autenticacion/autenticacionHeader";

class ComentarioService {
  buscarTodos(idEvento) {
    return REST.get(`/comentario/${idEvento}`, { headers: authHeader() });
  }

  buscarTodosParametros(data) {
    const parametros = Object.keys(data)
      .filter((key) => data[key] !== "")
      .map((key) => `${key}=${encodeURIComponent(data[key])}`)
      .join("&");

    const url = `/comentario?${parametros}`;
    return REST.get(url, { headers: authHeader() });
  }

  numEstrellasEvento(idEvento) {
    return REST.get(`/comentario/numEstrellasEvento/${idEvento}`, {
      headers: authHeader(),
    });
  }

  crear(comentario) {
    return REST.post("/comentario", comentario, {
      headers: authHeader(),
    });
  }
}

export default new ComentarioService();
