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
import "../../css/UsuarioEdit.css";

export default function UsuarioEdit() {
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
      setUsuario(res.data);
      setPais(res.data.pais);
      setFech(new Date(res.data.fechaNacimiento));
    });

    const user = autenticacionService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  function convertirFecha(fechaTexto) {
    const fecha = new Date(fechaTexto);

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0"); // Sumamos 1 al mes porque los meses en JavaScript comienzan desde 0
    const dia = String(fecha.getDate()).padStart(2, "0");

    const fechaFormateada = `${año}-${mes}-${dia}`;

    return fechaFormateada;
  }

  const paises = Paises.paises();

  function onCancel(event) {
    navigate("/usuario/micuenta/" + currentUser.id.toString());
  }

  const isFormFieldValid = (meta) => !!(meta.touched && meta.error);
  const getFormErrorMessage = (meta) => {
    return (
      isFormFieldValid(meta) && <small className="p-error">{meta.error}</small>
    );
  };

  const validate = (data) => {
    let errors = {};
    var patron =
      /^[a-zA-ZÀ-ÿ\u00f1\u00d1\ ]*(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1\ ]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1\ ]*$/g; // patrón letras y espacios
    var patronLogin = /([A-Za-z0-9_]{3,15})/;
    var patronCorreoElectronico =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    var validChars = "TRWAGMYFPDXBNJZSQVHLCKET";
    var nifRexp = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKET]$/i;
    var nieRexp = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKET]$/i;

    //login
    if (!data.login) {
      errors.login = <p>{t("usuario.validaciones.loginVacio")}</p>;
    } else if (!patronLogin.test(data.login)) {
      errors.login = (
        <p>{t("usuario.validaciones.nombreInvalidoAlfabetico")}</p>
      );
    } else if (data.login.length > 15) {
      errors.login = <p>{t("usuario.validaciones.loginInvalidoTamañoMax")}</p>;
    } else if (data.login.length < 3) {
      errors.login = <p>{t("usuario.validaciones.loginInvalidoTamañoMin")}</p>;
    }

    //nombre
    if (!data.nombre) {
      errors.nombre = <p>{t("usuario.validaciones.nombreVacio")}</p>;
    } else if (!patron.test(data.nombre)) {
      errors.nombre = (
        <p>{t("usuario.validaciones.nombreInvalidoAlfabetico")}</p>
      );
    } else if (data.nombre.length > 40) {
      errors.nombre = (
        <p>{t("usuario.validaciones.nombreInvalidoTamañoMax")}</p>
      );
    } else if (data.nombre.length < 3) {
      errors.nombre = (
        <p>{t("usuario.validaciones.nombreInvalidoTamañoMin")}</p>
      );
    }

    //email
    if (!data.email) {
      errors.email = <p>{t("usuario.validaciones.emailVacio")}</p>;
    } else if (!patronCorreoElectronico.test(data.email)) {
      errors.email = <p>{t("usuario.validaciones.emailInvalido")}</p>;
    } else if (data.email.length > 40) {
      errors.email = <p>{t("email.validaciones.emailInvalidoTamañoMax")}</p>;
    } else if (data.email.length < 3) {
      errors.email = <p>{t("usuario.validaciones.emailInvalidoTamañoMin")}</p>;
    }

    //dni
    if (!data.dni) {
      errors.dni = <p>{t("usuario.validaciones.dniVacio")}</p>;
    } else if (!nifRexp.test(data.dni) && !nieRexp.test(data.dni)) {
      errors.dni = <p>{t("usuario.validaciones.dniInvalido")}</p>;
    } else {
      var nie = data.dni
        .replace(/^[X]/, "0")
        .replace(/^[Y]/, "1")
        .replace(/^[Z]/, "2");

      var letter = data.dni.substr(-1);
      var charIndex = parseInt(nie.substr(0, 8)) % 23;

      if (validChars.charAt(charIndex) === letter) {
        // correcto = true;
      } else {
        errors.dni = <p>{t("usuario.validaciones.dniLetraInvalida")}</p>;
      }
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
    <div className="form-demo usuarioEdit">
      <div className="flex justify-content-center">
        <div className="card col-3">
          <h5 className="text-center text-900 text-xl ">
            {t("usuario.tituloModificar")}
          </h5>

          <Form
            onSubmit={onSubmit}
            initialValues={usuario}
            validate={validate}
            render={({ handleSubmit }) => (
              <form className=" text-900 p-fluid" onSubmit={handleSubmit}>
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
                  name="email"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="email">{t("usuario.email")}</label>
                      </div>
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="email"
                            {...input}
                            placeholder={t("usuario.email")}
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
                  name="dni"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="dni">{t("usuario.dni")}</label>
                      </div>

                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
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
                          <Calendar
                            onChange={(e) => setFech(e.value)}
                            id="fechaNacimiento"
                            value={fech}
                            name="fechaNacimiento"
                            placeholder={t("usuario.fechaNac")}
                            dateFormat="dd/mm/yy"
                            mask="99/99/9999"
                            monthNavigator
                            yearNavigator
                            yearRange="1900:2030"
                            className={classNames(
                              { "p-invalid": isFormFieldValid(meta) },
                              { "p-error": isFormFieldValid(meta) }
                            )}
                            showIcon
                            required
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
                          <Dropdown
                            value={pais}
                            options={paises}
                            optionLabel="label"
                            filter
                            showClear
                            filterBy="label"
                            placeholder={t("usuario.selecPais")}
                            onChange={(e) => setPais(e.value)}
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
              <h4>{t("mensajes.edicionElemento")}</h4>
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
