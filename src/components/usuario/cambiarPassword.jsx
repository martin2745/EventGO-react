import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Password } from "primereact/password";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { classNames } from "primereact/utils";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Field } from "react-final-form";
import { useTranslation } from "react-i18next";

import usuarioService from "../../services/usuarioService";
import autenticacionService from "../../services/autenticacionService";
import Paises from "../recursos/paises";
import "../../css/CambiarPassword.css";

export default function CambiarPassword() {
  const params = useParams();
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(false);
  const [t, i18n] = useTranslation("global");

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

  const [pais, setPais] = useState([" "]);
  const [dialogoError, setDialogoError] = useState(false);
  const [resMessage, setResMessage] = useState("");
  const f = new Date();
  const h = null;
  const [fech, setFech] = useState("");
  const [usuario, setUsuario] = useState(usuarioVacio);
  const [currentUser, setCurrentUser] = useState(false);

  useEffect(() => {
    usuarioService.buscarPorId(params.id).then((res) => {
      res.data.password = "";
      setUsuario(res.data);
      setPais(res.data.pais);
      setFech(new Date(res.data.fechaNacimiento));
    });

    const user = autenticacionService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const rolOptions = [
    { label: "Usuario", value: "ROLE_USUARIO" },
    { label: "Gestor", value: "ROLE_GESTOR" },
  ];
  const paises = Paises.paises();

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

  function onCancel(event) {
    navigate("/usuario/micuenta/" + currentUser.id.toString());
  }

  const isFormFieldValid = (meta) => !!(meta.touched && meta.error);
  const getFormErrorMessage = (meta) => {
    return (
      isFormFieldValid(meta) && <small className="p-error">{meta.error}</small>
    );
  };

  function convertirFecha(fechaTexto) {
    const fecha = new Date(fechaTexto);

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0"); // Sumamos 1 al mes porque los meses en JavaScript comienzan desde 0
    const dia = String(fecha.getDate()).padStart(2, "0");

    const fechaFormateada = `${año}-${mes}-${dia}`;

    return fechaFormateada;
  }

  const validate = (data) => {
    let errors = {};
    var patronContraseña = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])\S{3,16}$/;

    //password
    if (!data.password) {
      errors.password = <p>{t("usuario.validaciones.contraseñaVacia")}</p>;
    } else if (data.password.length > 16) {
      errors.password = (
        <p>{t("usuario.validaciones.contraseñaInvalidaTamañoMax")}</p>
      );
    } else if (data.password.length < 3) {
      errors.password = (
        <p>{t("usuario.validaciones.contraseñaInvalidaTamañoMin")}</p>
      );
    } else if (!patronContraseña.test(data.password)) {
      errors.password = <p>{t("usuario.validaciones.contraseñaInvalida")}</p>;
    }

    //repitePassword
    if (!data.repitePassword) {
      errors.repitePassword = (
        <p>{t("usuario.validaciones.contraseñaVacia")}</p>
      );
    } else if (data.repitePassword.length > 16) {
      errors.repitePassword = (
        <p>{t("usuario.validaciones.contraseñaInvalidaTamañoMax")}</p>
      );
    } else if (data.repitePassword.length < 3) {
      errors.repitePassword = (
        <p>{t("usuario.validaciones.contraseñaInvalidaTamañoMin")}</p>
      );
    } else if (!patronContraseña.test(data.repitePassword)) {
      errors.repitePassword = (
        <p>{t("usuario.validaciones.contraseñaInvalida")}</p>
      );
    } else if (data.repitePassword != data.password) {
      errors.repitePassword = (
        <p>{t("usuario.validaciones.contraseñasNoCoinciden")}</p>
      );
    }

    return errors;
  };

  function ocultarDialogo() {
    setDialogoError(false);
  }

  const onSubmit = (data, form) => {
    data[`pais`] = pais;
    data[`fechaNacimiento`] = convertirFecha(fech);
    usuarioService.modificar(data.id.toString(), data).then(
      () => {
        setShowMessage(true);
        form.restart();
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.codigo) ||
          error.message ||
          error.toString();
        setResMessage(resMessage);
        setDialogoError(true);
      }
    );
  };

  const dialogFooter = (
    <div className="flex justify-content-center">
      <Button
        label="OK"
        className="p-button-text"
        autoFocus
        onClick={okeyMensaje}
      />
    </div>
  );

  const dialogFooterError = (
    <div className="flex justify-content-center">
      <Button
        label="OK"
        className="p-button-text"
        autoFocus
        onClick={ocultarDialogo}
      />
    </div>
  );

  function okeyMensaje() {
    setShowMessage(false);
    navigate("/usuario/micuenta/" + currentUser.id.toString());
  }

  return (
    <div className="form-demo recuperarPassword">
      <div className="flex justify-content-left text-xl">
        <div className="card text-xl formLateral">
          <h5 className="text-center text-900 text-2xl">
            {t("usuario.tituloEditarPassword")}
          </h5>

          <Form
            onSubmit={onSubmit}
            initialValues={usuario}
            validate={validate}
            render={({ handleSubmit }) => (
              <form className=" text-xl p-fluid" onSubmit={handleSubmit}>
                <Field
                  name="password"
                  render={({ input, meta }) => (
                    <div className="field ">
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
                            footer={passwordFooter}
                            required
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />

                <Field
                  name="repitePassword"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Password
                            id="repitePassword"
                            {...input}
                            name="repitePassword"
                            placeholder={t("usuario.repitaContraseña")}
                            className={classNames(
                              { "p-invalid": isFormFieldValid(meta) },
                              { "p-error": isFormFieldValid(meta) }
                            )}
                            toggleMask
                            footer={passwordFooter}
                            required
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />

                <div className="grid">
                  <div className="col">
                    <Button
                      icon="pi pi-arrow-circle-left"
                      label={t("botones.cancelar")}
                      className="p-button-outlined mr-2 "
                      onClick={onCancel}
                    />
                  </div>
                  <div className="col">
                    <Button
                      type="submit"
                      label={t("botones.editar")}
                      icon="pi pi-pencil"
                      className="p-button-outlined mr-2"
                    />
                  </div>
                </div>
              </form>
            )}
          />

          <Dialog
            visible={showMessage}
            onHide={() => setShowMessage(false)}
            position="center"
            footer={dialogFooter}
            showHeader={false}
            breakpoints={{ "960px": "80vw" }}
            style={{ width: "30vw" }}
          >
            <div className="flex align-items-center flex-column pt-6 px-3">
              <i
                className="pi pi-check-circle"
                style={{ fontSize: "5rem", color: "var(--green-500)" }}
              ></i>
              <h4>{t("mensajes.recuperarPasswordRealizado")}</h4>
            </div>
          </Dialog>

          <Dialog
            visible={dialogoError}
            position="center"
            footer={dialogFooterError}
            showHeader={false}
            onHide={ocultarDialogo}
            breakpoints={{ "960px": "80vw" }}
            style={{ width: "30vw" }}
          >
            <div className="flex align-items-center flex-column pt-6 px-3">
              <i
                className="pi pi-times-circle"
                style={{ fontSize: "5rem", color: "red" }}
              ></i>
              <h4>{t(resMessage)}</h4>
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
