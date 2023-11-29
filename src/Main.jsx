//recursos
import "./css/App.css";
import "./css/Footer.css";
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { useEffect } from "react";
import { Divider } from "primereact/divider";
import { Menubar } from "primereact/menubar";
import { SplitButton } from "primereact/splitbutton";
import { useTranslation } from "react-i18next";
import "./css/comun.css";
import Spain from "./components/recursos/imagenes/Spain.png";
import United_Kingdom from "./components/recursos/imagenes/United_Kingdom.png";
import Galicia from "./components/recursos/imagenes/Galicia.png";
//Español
import circuito from "./components/recursos/imagenes/circuito.jpg";
import concierto from "./components/recursos/imagenes/concierto.jpg";
import fiesta from "./components/recursos/imagenes/fiesta.jpg";
import formula1 from "./components/recursos/imagenes/formula1.jpg";
import restaurante from "./components/recursos/imagenes/restaurante.jpg";
//Inglés
import circuitoI from "./components/recursos/imagenes/circuitoI.jpg";
import conciertoI from "./components/recursos/imagenes/conciertoI.jpg";
import fiestaI from "./components/recursos/imagenes/fiestaI.jpg";
import formula1I from "./components/recursos/imagenes/formula1I.jpg";
import restauranteI from "./components/recursos/imagenes/restauranteI.jpg";
//Gallego
import circuitoG from "./components/recursos/imagenes/circuitoG.jpg";
import fiestaG from "./components/recursos/imagenes/fiestaG.jpg";

//componentes
import Footer from "./components/Footer/Footer";
import InicioSesion from "./components/usuario/inicioSesion";
import Registro from "./components/usuario/registro";
import RecuperarPassword from "./components/usuario/recuperarPassword";
import autenticacionService from "./services/autenticacionService";
import UsuarioDetalle from "./components/usuario/usuarioDetalle";
import UsuarioEdit from "./components/usuario/usuarioEdit";
import CambiarPassword from "./components/usuario/cambiarPassword";
import UsuarioShowAll from "./components/usuario/usuarioShowAll";
import CategoriaShowAll from "./components/categoria/categoriaShowAll";
import EventosCategoria from "./components/categoria/eventosCategoria";
import EventoShowAll from "./components/evento/eventoShowAll";
import MisEventosGestor from "./components/evento/misEventosGestor";
import MisEventosLayout from "./components/evento/misEventosLayout";
import MisSuscripciones from "./components/evento/misSuscripciones";
import MisSolicitudes from "./components/evento/misSolicitudes";
import SuscripcionesEvento from "./components/evento/suscripcionesEvento";
import SolicitudesEvento from "./components/evento/solicitudesEvento";
import CategoriaLayout from "./components/categoria/categoriaLayout";
import ComentariosEvento from "./components/comentario/comentariosEvento";
import GerentesSeguir from "./components/red/gerentesSeguir";
import GerentesSeguidos from "./components/red/gerentesSeguidos";

function Main() {
  //constantes
  const [currentUser, setCurrentUser] = useState(false);
  const [rol, setRol] = useState("");
  const [idioma, setIdioma] = useState(
    localStorage.getItem("idiomaDesplegable")
  );
  if (!idioma) {
    localStorage.setItem("idiomaDesplegable", "Español");
    localStorage.setItem("idioma", "es");
  }
  const navigate = useNavigate();
  //cambio de idioma
  const [t, i18n] = useTranslation("global");
  const items = [
    {
      label: (
        <div>
          <img className="bandera" src={Spain} />
          <span className="textoBandera">{t("bandera.Spain")}</span>
        </div>
      ),
      command: (e) => {
        localStorage.setItem("idiomaDesplegable", "Español");
        setIdioma(localStorage.getItem("idiomaDesplegable"));
        localStorage.setItem("idioma", "es");
        i18n.changeLanguage("es");
      },
    },
    {
      label: (
        <div>
          <img className="bandera" src={Galicia} />
          <span className="textoBandera">{t("bandera.Galicia")}</span>
        </div>
      ),
      command: (e) => {
        localStorage.setItem("idiomaDesplegable", "Gallego");
        setIdioma(localStorage.getItem("idiomaDesplegable"));
        localStorage.setItem("idioma", "ga");
        i18n.changeLanguage("ga");
      },
    },
    {
      label: (
        <div>
          <img className="bandera" src={United_Kingdom} />
          <span className="textoBandera">{t("bandera.United_Kingdom")}</span>
        </div>
      ),
      command: (e) => {
        localStorage.setItem("idiomaDesplegable", "Inglés");
        setIdioma(localStorage.getItem("idiomaDesplegable"));
        localStorage.setItem("idioma", "en");
        i18n.changeLanguage("en");
      },
    },
  ];
  //Cabecera
  const navs = [];
  if (rol === "ROLE_ADMINISTRADOR") {
    navs.push({
      label: <p className="ml-8 h-0rem"></p>,
      disabled: true,
    });
    navs.push({
      label: <a className="mr-3">{t("main.categorias")}</a>,
      command: (e) => {
        navigate("/categoria/categoriaLayout/");
      },
    });
    navs.push({
      label: <a className="mr-3">{t("main.gestionCategorias")}</a>,
      command: (e) => {
        navigate("/categoria/categoriaShowAll/");
      },
    });
    navs.push({
      label: <a className="mr-3">{t("main.gestionUsuarios")}</a>,
      command: (e) => {
        navigate("/usuario/usuarioShowAll/");
      },
    });
    navs.push({
      label: <a className="mr-3">{t("main.micuenta")}</a>,
      command: (e) => {
        navigate("/usuario/micuenta/" + currentUser.id);
      },
    });
  } else if (rol === "ROLE_GERENTE") {
    navs.push({
      label: <p className="ml-8 h-0rem"></p>,
      disabled: true,
    });
    navs.push({
      label: <a className="mr-3">{t("main.categorias")}</a>,
      command: (e) => {
        navigate("/categoria/categoriaLayout/");
      },
    });
    navs.push({
      label: <a className="mr-3">{t("main.gestionEventos")}</a>,
      command: (e) => {
        navigate("/evento/misEventosGestor/");
      },
    });
    navs.push({
      label: <a className="mr-3">{t("main.misEventos")}</a>,
      command: (e) => {
        navigate("/evento/evetosLayout");
      },
    });
    navs.push({
      label: <a className="mr-3">{t("main.red")}</a>,
      command: (e) => {
        navigate("/red");
      },
    });
    navs.push({
      label: <a className="mr-3">{t("main.misAmistades")}</a>,
      command: (e) => {
        navigate("/misAmistades");
      },
    });
    navs.push({
      label: <a className="mr-3">{t("main.micuenta")}</a>,
      command: (e) => {
        navigate("/usuario/micuenta/" + currentUser.id);
      },
    });
  } else if (rol === "ROLE_USUARIO") {
    navs.push({
      label: <p className="ml-8 h-0rem"></p>,
      disabled: true,
    });
    navs.push({
      label: <a className="mr-3">{t("main.categorias")}</a>,
      command: (e) => {
        navigate("/categoria/categoriaLayout/");
      },
    });
    navs.push({
      label: <a className="mr-3">{t("main.misEventos")}</a>,
      command: (e) => {
        navigate("/evento/evetosLayout");
      },
    });
    navs.push({
      label: <a className="mr-3">{t("main.red")}</a>,
      command: (e) => {
        navigate("/red");
      },
    });
    navs.push({
      label: <a className="mr-3">{t("main.misAmistades")}</a>,
      command: (e) => {
        navigate("/misAmistades");
      },
    });
    navs.push({
      label: <a className="mr-3">{t("main.micuenta")}</a>,
      command: (e) => {
        navigate("/usuario/micuenta/" + currentUser.id);
      },
    });
  }

  useState(() => {
    const user = autenticacionService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    const user = autenticacionService.getCurrentUser();
    const rolUser = localStorage.getItem("rol");

    if (user) {
      setCurrentUser(user);
      setRol(rolUser);
    }
  }, []);

  //funciones
  function cerrarSesion(event) {
    event.preventDefault();
    autenticacionService.logout();

    navigate("/");
    window.location.reload();
  }

  return (
    <div>
      <nav className="card">
        {currentUser ? (
          <div>
            <Menubar
              className="text-2xl"
              model={navs}
              start={
                <div className="grid">
                  <div className="col text-900 py-3">
                    <h1> EventGO</h1>
                  </div>
                </div>
              }
              end={
                <div className="grid">
                  {idioma == "Español" ? (
                    <div>
                      <SplitButton
                        className="mr-3"
                        label={
                          <div>
                            <img className="bandera" src={Spain} />
                            <span className="textoBandera">
                              {t("bandera.Spain")}
                            </span>
                          </div>
                        }
                        optionLabel="label"
                        model={items}
                      ></SplitButton>
                    </div>
                  ) : idioma == "Inglés" ? (
                    <div>
                      <SplitButton
                        className="mr-3"
                        label={
                          <div>
                            <img className="bandera" src={United_Kingdom} />
                            <span className="textoBandera">
                              {t("bandera.United_Kingdom")}
                            </span>
                          </div>
                        }
                        optionLabel="label"
                        model={items}
                      ></SplitButton>
                    </div>
                  ) : (
                    <div>
                      <SplitButton
                        className="mr-3"
                        label={
                          <div>
                            <img className="bandera" src={Galicia} />
                            <span className="textoBandera">
                              {t("bandera.Galicia")}
                            </span>
                          </div>
                        }
                        optionLabel="label"
                        model={items}
                      ></SplitButton>
                    </div>
                  )}
                  <Button
                    className="md:mb-2"
                    label={t("main.cerrarSesion") + " " + currentUser.login}
                    icon="pi pi-power-off"
                    onClick={cerrarSesion}
                  ></Button>
                </div>
              }
            />
          </div>
        ) : (
          <div>
            <Menubar
              className="text-2xl"
              start={
                <div className="grid">
                  <div className="col text-900 py-3">
                    <h1> EventGO</h1>
                  </div>
                </div>
              }
              end={
                idioma == "Español" ? (
                  <div>
                    <SplitButton
                      className="mr-3"
                      label={
                        <div>
                          <img className="bandera" src={Spain} />
                          <span className="textoBandera">
                            {t("bandera.Spain")}
                          </span>
                        </div>
                      }
                      optionLabel="label"
                      model={items}
                    ></SplitButton>
                  </div>
                ) : idioma == "Inglés" ? (
                  <div>
                    <SplitButton
                      className="mr-3"
                      label={
                        <div>
                          <img className="bandera" src={United_Kingdom} />
                          <span className="textoBandera">
                            {t("bandera.United_Kingdom")}
                          </span>
                        </div>
                      }
                      optionLabel="label"
                      model={items}
                    ></SplitButton>
                  </div>
                ) : (
                  <div>
                    <SplitButton
                      className="mr-3"
                      label={
                        <div>
                          <img className="bandera" src={Galicia} />
                          <span className="textoBandera">
                            {t("bandera.Galicia")}
                          </span>
                        </div>
                      }
                      optionLabel="label"
                      model={items}
                    ></SplitButton>
                  </div>
                )
              }
            />
          </div>
        )}
      </nav>
      <Divider />

      {currentUser ? (
        <div className="container">
          <div>
            <Routes>
              <Route
                path="/"
                element={<InicioSesion mensaje="Inicio de sesión" />}
              />
              <Route
                path="/registro"
                element={<Registro mensaje="Registro" />}
              />
              <Route
                path="/recuperarPassword"
                element={<RecuperarPassword mensaje="Recuperar Contraseña" />}
              />
              {/* usuario */}
              <Route path="usuario">
                <Route path="view">
                  <Route path=":id" element={<UsuarioDetalle />} />
                </Route>
                <Route path="micuenta">
                  <Route path=":id" element={<UsuarioDetalle />} />
                </Route>
                <Route path="datosmicuenta">
                  <Route path=":id" element={<UsuarioEdit />} />
                </Route>
                <Route path="cambiarPassword">
                  <Route path=":id" element={<CambiarPassword />} />
                </Route>
                <Route path="usuarioShowAll">
                  <Route index element={<UsuarioShowAll />} />
                </Route>
              </Route>
              {/* categoria */}
              <Route path="categoria">
                <Route path="categoriaShowAll">
                  <Route index element={<CategoriaShowAll />} />
                </Route>
                <Route path="categoriaLayout">
                  <Route index element={<CategoriaLayout />} />
                </Route>
                <Route path="eventosCategoria">
                  <Route path=":id" element={<EventosCategoria />} />
                </Route>
              </Route>
              {/* evento */}
              <Route path="evento">
                <Route path="eventoShowAll">
                  <Route path=":id" element={<EventoShowAll />} />
                </Route>
                <Route path="misEventosGestor">
                  <Route index element={<MisEventosGestor />} />
                </Route>
                <Route path="evetosLayout">
                  <Route index element={<MisEventosLayout />} />
                </Route>
                <Route path="misSuscripciones">
                  <Route index element={<MisSuscripciones />} />
                </Route>
                <Route path="misSolicitudes">
                  <Route index element={<MisSolicitudes />} />
                </Route>
                <Route path="suscripcionesEvento">
                  <Route path=":id" element={<SuscripcionesEvento />} />
                </Route>
                <Route path="solicitudesEvento">
                  <Route path=":id" element={<SolicitudesEvento />} />
                </Route>
                <Route path="comentarios">
                  <Route path=":id" element={<ComentariosEvento />} />
                </Route>
              </Route>
              {/* red */}
              <Route path="red" element={<GerentesSeguir />}></Route>
              <Route path="misAmistades" element={<GerentesSeguidos />}></Route>
            </Routes>
          </div>
        </div>
      ) : (
        <div className="container">
          <div className="div1">
            <Routes>
              <Route
                path="/"
                element={<InicioSesion mensaje="Inicio de sesión" />}
              />
              <Route
                path="/registro"
                element={<Registro mensaje="Registro" />}
              />
              <Route
                path="/recuperarPassword"
                element={<RecuperarPassword mensaje="Recuperar Contraseña" />}
              />
            </Routes>
          </div>
          <div className="div2">
            <section>
              {idioma == "Español" ? (
                <>
                  <img className="foto1" src={circuito} />
                  <img src={concierto} />
                  <img src={fiesta} />
                  <img src={formula1} />
                  <img className="foto5" src={restaurante} />
                </>
              ) : idioma == "Inglés" ? (
                <>
                  <img className="foto1" src={circuitoI} />
                  <img src={conciertoI} />
                  <img src={fiestaI} />
                  <img src={formula1I} />
                  <img className="foto5" src={restauranteI} />
                </>
              ) : (
                <>
                  <img className="foto1" src={circuitoG} />
                  <img src={concierto} />
                  <img src={fiestaG} />
                  <img src={formula1} />
                  <img className="foto5" src={restaurante} />
                </>
              )}
            </section>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Main;
