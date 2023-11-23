import REST from "./REST";
import authHeader from "../components/autenticacion/autenticacionHeader";

class SuscripcionService {
  buscarTodos() {
    return REST.get("/suscripcion", { headers: authHeader() });
  }

  buscarTodosParametros(data) {
    const parametros = Object.keys(data)
      .filter((key) => data[key] !== "")
      .map((key) => `${key}=${encodeURIComponent(data[key])}`)
      .join("&");

    const url = `/suscripcion?${parametros}`;
    return REST.get(url, { headers: authHeader() });
  }

  buscarPorId(id) {
    return REST.get(`/suscripcion/${id}`, { headers: authHeader() });
  }

  crear(solicitud) {
    return REST.post("/suscripcion", solicitud, {
      headers: authHeader(),
    });
  }

  eliminar(id) {
    return REST.post(`/suscripcion/eliminar/${id}`, "", {
      headers: authHeader(),
    });
  }
}

export default new SuscripcionService();
