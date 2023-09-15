//recursos
import "./css/App.css";
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
import circuito from "./components/recursos/imagenes/circuito.jpg";
import concierto from "./components/recursos/imagenes/concierto.jpg";
import fiesta from "./components/recursos/imagenes/fiesta.jpg";
import formula1 from "./components/recursos/imagenes/formula1.jpg";
import restaurante from "./components/recursos/imagenes/restaurante.jpg";

//componentes
import Home from "./components/home";
import Footer from "./components/Footer/Footer";
import "./css/Footer.css";
import InicioSesion from "./components/usuario/inicioSesion";
import Registro from "./components/usuario/registro";
import RecuperarPassword from "./components/usuario/recuperarPassword";
import autenticacionService from "./services/autenticacionService";

function Main() {
  //constantes
  const [currentUser, setCurrentUser] = useState(false);
  const [idioma, setIdioma] = useState(
    localStorage.getItem("idiomaDesplegable")
  );
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
  const navs = [
    {
      label: <p className="ml-8 h-0rem"></p>,
      disabled: true,
    },
    {
      label: <a className="mr-3">{t("main.micuenta")}</a>,
      command: (e) => {
        navigate("/usuario/micuenta/" + currentUser.id);
      },
    },
  ];

  useState(() => {
    const user = autenticacionService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    const user = autenticacionService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
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
                  <SplitButton
                    className="mr-2 md:mb-2"
                    label={idioma}
                    optionLabel="label"
                    model={items}
                  ></SplitButton>
                  <Button
                    className="md:mb-2"
                    label={t("main.cerrarSesion")}
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
      <div className="container">
        <div className="div1">
          <Routes>
            <Route
              path="/"
              element={<InicioSesion mensaje="Inicio de sesión" />}
            />
            <Route path="/registro" element={<Registro mensaje="Registro" />} />
            <Route
              path="/recuperarPassword"
              element={<RecuperarPassword mensaje="Recuperar Contraseña" />}
            />

            {currentUser && (
              <React.Fragment>
                <Route
                  path="/home"
                  element={<Home mensaje="Página principal" />}
                />
              </React.Fragment>
            )}
          </Routes>
        </div>
        <div className="div2">
          <section>
            <img className="foto1" src={circuito} />
            <img src={concierto} />
            <img src={fiesta} />
            <img src={formula1} />
            <img className="foto5" src={restaurante} />
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Main;
