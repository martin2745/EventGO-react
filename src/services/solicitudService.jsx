import REST from "./REST";
import authHeader from "../components/autenticacion/autenticacionHeader";

class SolicitudService {
  buscarTodos() {
    return REST.get("/solicitud", { headers: authHeader() });
  }

  buscarTodosParametros(data) {
    const parametros = Object.keys(data)
      .filter((key) => data[key] !== "")
      .map((key) => `${key}=${encodeURIComponent(data[key])}`)
      .join("&");

    const url = `/solicitud?${parametros}`;
    return REST.get(url, { headers: authHeader() });
  }

  buscarPorId(id) {
    return REST.get(`/solicitud/${id}`, { headers: authHeader() });
  }

  crear(solicitud) {
    return REST.post("/solicitud", solicitud, {
      headers: authHeader(),
    });
  }

  aceptarSolicitud(id, solicitud) {
    return REST.post(`/solicitud/aceptarSolicitud/${id}`, solicitud, {
      headers: authHeader(),
    });
  }

  eliminar(id) {
    return REST.post(`/solicitud/eliminar/${id}`, "", {
      headers: authHeader(),
    });
  }
}

export default new SolicitudService();
