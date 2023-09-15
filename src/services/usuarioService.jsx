import REST from "./REST";

class UsuarioService {

  buscarPorId(id) {
    return REST.get(`/usuarios/${id}`);
  }


}


export default new UsuarioService();