import React, { useRef } from "react";
import autenticacionService from "../../services/autenticacionService";
import usuarioService from "../../services/usuarioService";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Image } from "primereact/image";
import { Dialog } from "primereact/dialog";
import avatar from "./../recursos/imagenes/avatar.png";
import "../../css/UsuarioDetalle.css";
import { Divider } from "primereact/divider";
import { useTranslation } from "react-i18next";
import { Form, Field } from "react-final-form";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { Password } from "primereact/password";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import Paises from "../recursos/paises";

import axios from "axios";

export default function UsuarioDetalle() {
  // const navigate = useNavigate();
  const params = useParams();
  const navigate = useNavigate();
  const [t, i18n] = useTranslation("global");
  const paises = Paises.paises();
  const usuarioVacio = {
    id: "",
    dni: "",
    nombre: "",
    fechaNacimiento: "",
    pais: "",
    login: "",
    password: "",
    rol: "",
    imagenUsuario: "",
  };
  const [usuario, setUsuario] = useState(usuarioVacio);
  const [imagenUsuario, setImagenUsuario] = useState(usuario.imagenUsuario);
  const [currentUser, setCurrentUser] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [fech, setFech] = useState("");
  const [pais, setPais] = useState([" "]);
  const passwordHeader = (
    <h5>{t("mensajes.instruccionesContraseña.titulo")}</h5>
  );
  const passwordFooter = (
    <React.Fragment>
      <Divider />
      <p className="mt-2">
        {t("mensajes.instruccionesContraseña.recomendaciones")}
      </p>
      <ul className="pl-2 ml-2 mt-0" style={{ lineHeight: "1.5" }}>
        <li>{t("mensajes.instruccionesContraseña.instruccion1")}</li>
        <li>{t("mensajes.instruccionesContraseña.instruccion2")}</li>
        <li>{t("mensajes.instruccionesContraseña.instruccion3")} </li>
        <li>{t("mensajes.instruccionesContraseña.instruccion4")}</li>
      </ul>
    </React.Fragment>
  );

  useEffect(() => {
    usuarioService.buscarPorId(params.id).then((res) => {
      setUsuario(res.data);
      if (res.data.imagenUsuario === "") {
        setImagenUsuario(avatar);
      } else {
        setImagenUsuario(res.data.imagenUsuario);
      }
      const fechAux = new Date(res.data.fechaNacimiento);
      const fecha = fechAux.toLocaleDateString("ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      setFech(fecha);
    });
    const user = autenticacionService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const header = (
    <>
      <Image id="imagen" src={imagenUsuario} imageClassName="w-15rem h-15rem" />
    </>
  );

  function convertirFecha(fechaTexto) {
    const fecha = new Date(fechaTexto);

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0"); // Sumamos 1 al mes porque los meses en JavaScript comienzan desde 0
    const dia = String(fecha.getDate()).padStart(2, "0");

    const fechaFormateada = `${año}-${mes}-${dia}`;

    return fechaFormateada;
  }

  const [file, setFile] = useState();

  const [visible, setVisible] = useState(false);
  const isFormFieldValid = (meta) => !!(meta.touched && meta.error);
  const getFormErrorMessage = (meta) => {
    return (
      isFormFieldValid(meta) && <small className="p-error">{meta.error}</small>
    );
  };

  function editarUsuario(usuario) {
    navigate("/usuario/datosmicuenta/" + usuario.id.toString()); // navega a URL del cliente
  }

  function cambiarPassword(usuario) {
    navigate("/usuario/cambiarPassword/" + usuario.id.toString()); // navega a URL del cliente
  }

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  function upload(event) {
    event.preventDefault();
    const url = "http://localhost:8080/api/usuario/uploadImagenUsuario";
    const formData = new FormData();
    const idUsuario = usuario.id;
    const user = JSON.parse(localStorage.getItem("user"));

    formData.append("file", file);
    formData.append("fileName", file.name);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
        login: user.login,
        id: idUsuario,
        Authorization: "Bearer " + user.token,
      },
    };
    subirImagen(url, formData, config);
  }

  function subirImagen(url, formData, config) {
    axios.post(url, formData, config).then((response) => {
      setImagenUsuario(response.data.texto);
      //window.location.reload();
    });
  }
  function cambiarFormatoFecha(fecha) {
    // Dividir la fecha en año, mes y día
    var partes = fecha.split("-");
    var year = partes[0];
    var month = partes[1];
    var day = partes[2];
    // Crear la fecha en el formato deseado (DD/MM/YYYY)
    var fechaFormateada = day + "/" + month + "/" + year;
    return fechaFormateada;
  }

  const onSubmit = (data, form) => {
    data[`pais`] = pais;
    data[`fechaNacimiento`] = convertirFecha(fech);
    usuarioService.modificar(data.id.toString(), data);
    setShowMessage(true);
  };
  const footer = (
    <span>
      {currentUser.id == usuario.id && (
        <div className="card flex justify-content-center editar">
          <Button
            label={t("botones.editar")}
            icon="pi pi-pencil"
            onClick={() => setVisible(true)}
          />

          <Dialog
            header={t("botones.modificarPerfil")}
            visible={visible}
            onHide={() => setVisible(false)}
            style={{ width: "50vw" }}
            breakpoints={{ "960px": "75vw", "641px": "100vw" }}
          >
            <Form
              onSubmit={onSubmit}
              initialValues={usuario}
              render={({ handleSubmit }) => (
                <form className=" text-900 p-fluid" onSubmit={handleSubmit}>
                  <Field
                    name="login"
                    render={({ input, meta }) => (
                      <div className="field ">
                        <div className="p-field px-5 py-1 text-900 ">
                          <label htmlFor="login">{t("usuario.login")}</label>
                        </div>
                        <span className="p-float-label">
                          <div className="p-field px-5 text-900 ">
                            <InputText
                              disabled={true}
                              id="login"
                              {...input}
                              placeholder={t("usuario.login")}
                              required
                              className={classNames(
                                { "p-invalid": isFormFieldValid(meta) },
                                { "p-error": isFormFieldValid(meta) }
                              )}
                            />
                          </div>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />

                  <Field
                    name="nombre"
                    render={({ input, meta }) => (
                      <div className="field ">
                        <div className="p-field px-5 py-1 text-900 ">
                          <label htmlFor="nombre">{t("usuario.nombre")}</label>
                        </div>
                        <span className="p-float-label">
                          <div className="p-field px-5 text-900 ">
                            <InputText
                              disabled={true}
                              id="nombre"
                              {...input}
                              placeholder={t("usuario.nombre")}
                              required
                              className={classNames(
                                { "p-invalid": isFormFieldValid(meta) },
                                { "p-error": isFormFieldValid(meta) }
                              )}
                            />
                          </div>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />

                  <Field
                    name="password"
                    render={({ input, meta }) => (
                      <div className="field " style={{ display: "none" }}>
                        <div className="p-field px-5 py-1 text-900 ">
                          <label htmlFor="password">
                            {t("usuario.contraseña")}
                          </label>
                        </div>
                        <span className="p-float-label">
                          <div className="p-field px-5 text-900 ">
                            <Password
                              id="password"
                              {...input}
                              name="password"
                              placeholder={t("usuario.contraseña")}
                              className={classNames(
                                { "p-invalid": isFormFieldValid(meta) },
                                { "p-error": isFormFieldValid(meta) }
                              )}
                              toggleMask
                              header={passwordHeader}
                              footer={passwordFooter}
                            />
                          </div>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />

                  <Field
                    name="dni"
                    render={({ input, meta }) => (
                      <div className="field ">
                        <div className="p-field px-5 py-1 text-900 ">
                          <label htmlFor="dni">{t("usuario.dni")}</label>
                        </div>

                        <span className="p-float-label">
                          <div className="p-field px-5 text-900 ">
                            <InputText
                              disabled={true}
                              id="dni"
                              {...input}
                              placeholder={t("usuario.dni")}
                              required
                              className={classNames(
                                { "p-invalid": isFormFieldValid(meta) },
                                { "p-error": isFormFieldValid(meta) }
                              )}
                            />
                          </div>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />

                  <Field
                    name="fechaNacimiento"
                    render={({ input, meta }) => (
                      <div className="field ">
                        <div className="p-field px-5 py-1 text-900 ">
                          <label htmlFor="fechaNacimiento">
                            {t("usuario.fechaNac")}
                          </label>
                        </div>

                        <span className="p-float-label">
                          <div className="p-field px-5 text-900 ">
                            <InputText
                              disabled={true}
                              id="fechaNacimiento"
                              value={cambiarFormatoFecha(
                                usuario.fechaNacimiento
                              )}
                              placeholder={t("usuario.fechaNacimiento")}
                              required
                              className={classNames(
                                { "p-invalid": isFormFieldValid(meta) },
                                { "p-error": isFormFieldValid(meta) }
                              )}
                            />
                          </div>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />

                  <Field
                    name="pais"
                    render={({ input, meta }) => (
                      <div className="field ">
                        <div className="p-field px-5 py-1 text-900 ">
                          <label htmlFor="pais">{t("usuario.pais")}</label>
                        </div>

                        <span className="p-float-label">
                          <div className="p-field px-5 text-900 ">
                            <InputText
                              disabled={true}
                              id="pais"
                              value={usuario.pais}
                              placeholder={t("usuario.pais")}
                              required
                              className={classNames(
                                { "p-invalid": isFormFieldValid(meta) },
                                { "p-error": isFormFieldValid(meta) }
                              )}
                            />
                          </div>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />

                  <Field
                    name="email"
                    render={({ input, meta }) => (
                      <div className="field ">
                        <div className="p-field px-5 py-1 text-900 ">
                          <label htmlFor="email">{t("usuario.email")}</label>
                        </div>

                        <span className="p-float-label">
                          <div className="p-field px-5 text-900 ">
                            <InputText
                              disabled={true}
                              id="email"
                              value={usuario.email}
                              name="email"
                              tooltip="Tu email"
                            />
                          </div>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />

                  <Field
                    name="rol"
                    render={({ input, meta }) => (
                      <div className="field ">
                        <div className="p-field px-5 py-1 text-900 ">
                          <label htmlFor="rol">{t("usuario.rol")}</label>
                        </div>

                        <span className="p-float-label">
                          <div className="p-field px-5 text-900 ">
                            <InputText
                              disabled={true}
                              id="rol"
                              value={usuario.rol.split("_")[1]}
                              name="rol"
                              tooltip="Tu rol"
                            />
                          </div>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />

                  <Divider />

                  <div className="grid">
                    <div className="col">
                      <Button
                        label={t("botones.cambiarPassword")}
                        icon="pi pi-envelope"
                        className="p-button-outlined mr-2"
                        onClick={() => cambiarPassword(usuario)}
                      />
                    </div>
                    <div className="col">
                      <Button
                        label={t("botones.editarDatos")}
                        icon="pi pi-pencil"
                        className="p-button-outlined mr-2"
                        onClick={() => editarUsuario(usuario)}
                      />
                    </div>
                  </div>
                </form>
              )}
            />
          </Dialog>
          <div className="card flex justify-content-center cargarImagen">
            <form onSubmit={upload}>
              <Button
                type="submit"
                label={t("botones.subirImagen")}
                icon="pi pi-upload"
              />
              <input
                type="file"
                id="file"
                className="inputSeleccionarArchivo"
                onChange={handleChange}
              />
              <br></br>
              <label
                htmlFor="file"
                id="file"
                className="labelSeleccionarArchivo"
              >
                {t("botones.seleccionarArchivo")}
              </label>
            </form>
          </div>
        </div>
      )}
    </span>
  );

  return (
    <div>
      <div className="card flex justify-content-center carta">
        <Card
          header={header}
          title={usuario.login}
          subTitle={usuario.rol.split("_")[1]}
          footer={footer}
          className="md:w-25rem"
        >
          <p className="m-0" style={{ textAlign: "justify" }}>
            {t("cuenta.funcionalidadUsuario")}
          </p>
        </Card>
      </div>
    </div>
  );
}
