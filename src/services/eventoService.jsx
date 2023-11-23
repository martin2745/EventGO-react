import REST from "./REST";
import authHeader from "../components/autenticacion/autenticacionHeader";

class EventoService {
  buscarTodos() {
    return REST.get("/evento", { headers: authHeader() });
  }

  buscarTodosParametros(data) {
    const parametros = Object.keys(data)
      .filter((key) => data[key] !== "")
      .map((key) => `${key}=${encodeURIComponent(data[key])}`)
      .join("&");

    const url = `/evento?${parametros}`;
    return REST.get(url, { headers: authHeader() });
  }

  eventosSuscritos(data) {
    const parametros = Object.keys(data)
      .filter((key) => data[key] !== "")
      .map((key) => `${key}=${encodeURIComponent(data[key])}`)
      .join("&");

    const url = `/evento/eventosSuscritos?${parametros}`;
    return REST.get(url, { headers: authHeader() });
  }

  eventosSolicitud(data) {
    const parametros = Object.keys(data)
      .filter((key) => data[key] !== "")
      .map((key) => `${key}=${encodeURIComponent(data[key])}`)
      .join("&");

    const url = `/evento/eventosSolicitud?${parametros}`;
    return REST.get(url, { headers: authHeader() });
  }

  buscarPorId(id) {
    return REST.get(`/evento/${id}`, { headers: authHeader() });
  }

  buscarEventosCategoria(id) {
    return REST.get(`/evento/eventosCategoria/${id}`, {
      headers: authHeader(),
    });
  }

  buscarEventosCategoriaValidos(id) {
    return REST.get(`/evento/eventosCategoriaValidos/${id}`, {
      headers: authHeader(),
    });
  }

  crear(solicitud) {
    return REST.post("/evento", solicitud, {
      headers: authHeader(),
    });
  }

  modificar(id, evento) {
    return REST.post(`/evento/modificar/${id}`, evento, {
      headers: authHeader(),
    });
  }

  eliminar(id) {
    return REST.post(`/evento/eliminar/${id}`, "", {
      headers: authHeader(),
    });
  }
}

export default new EventoService();
