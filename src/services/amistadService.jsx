import REST from "./REST";
import authHeader from "../components/autenticacion/autenticacionHeader";

class AmistadService {
  buscarTodosParametros(data) {
    const parametros = Object.keys(data)
      .filter((key) => data[key] !== "")
      .map((key) => `${key}=${encodeURIComponent(data[key])}`)
      .join("&");

    const url = `/amistad?${parametros}`;
    return REST.get(url, { headers: authHeader() });
  }

  crear(amistad) {
    return REST.post("/amistad", amistad, {
      headers: authHeader(),
    });
  }

  eliminar(id) {
    return REST.post(`/amistad/eliminar/${id}`, "", { headers: authHeader() });
  }
}

export default new AmistadService();
