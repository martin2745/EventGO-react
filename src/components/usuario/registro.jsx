import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Password } from "primereact/password";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { classNames } from "primereact/utils";
import { Form, Field } from "react-final-form";
import { useTranslation } from "react-i18next";
import autenticacionService from "../../services/autenticacionService";
import Paises from "../recursos/paises";

export default function Registro() {
  //constantes
  const [t, i18n] = useTranslation("global");
  const [resMessage, setResMessage] = useState("");
  const [dialogoError, setDialogoError] = useState(false);
  const rolOptions = [
    { label: <a>{t("usuario.usuario")}</a>, value: "usuario" },
    { label: <a>{t("usuario.gerente")}</a>, value: "gerente" },
  ];
  const paises = Paises.paises();
  const [showMessage, setShowMessage] = useState(false);
  const [fecha, setFecha] = useState(new Date());
  const [rol, setRol] = useState([" "]);
  const [pais, setPais] = useState([" "]);
  const usuarioVacio = {
    login: "",
    password: "",
    nombre: "",
    email: "",
    rol: "",
    dni: "",
    fechaNacimiento: "",
    pais: "",
  };
  const [usuario, setUsuario] = useState(usuarioVacio);
  //Información de contraseña
  const passwordFooter = (
    <React.Fragment>
      <Divider />
      <p className="mt-2">
        {t("mensajes.instruccionesContraseña.recomendaciones")}
      </p>
      <ul className="pl-2 ml-2 mt-0" style={{ lineHeight: "1.5" }}>
        <li>{t("mensajes.instruccionesContraseña.instruccion1")}</li>
        <li>{t("mensajes.instruccionesContraseña.instruccion2")}</li>
        <li>{t("mensajes.instruccionesContraseña.instruccion3")}</li>
        <li>{t("mensajes.instruccionesContraseña.instruccion4")}</li>
      </ul>
    </React.Fragment>
  );
  const navigate = useNavigate();
  function onRegister(event) {
    navigate("/");
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
    var patronContraseña = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])\S{3,16}$/;
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

    //password
    if (!data.password) {
      errors.password = <p>{t("usuario.validaciones.contraseñaVacia")}</p>;
    } else if (!patronContraseña.test(data.password)) {
      errors.password = <p>{t("usuario.validaciones.contraseñaInvalida")}</p>;
    } else if (data.password.length > 16) {
      errors.password = (
        <p>{t("usuario.validaciones.contraseñaInvalidaTamañoMax")}</p>
      );
    } else if (data.password.length < 3) {
      errors.password = (
        <p>{t("usuario.validaciones.contraseñaInvalidaTamañoMin")}</p>
      );
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

  const onSubmit = (data, form) => {
    data[`pais`] = pais;
    data[`rol`] = "ROLE_" + rol.toUpperCase();
    data[`fechaNacimiento`] = fecha;
    autenticacionService.registro(data).then(
      () => {
        setShowMessage(true);
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.texto) ||
          error.message ||
          error.toString();
        setResMessage(resMessage);
        setDialogoError(true);
      }
    );
    form.restart();
  };

  //funciones
  function ocultarDialogo() {
    setDialogoError(false);
  }

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

  function okeyMensaje() {
    setShowMessage(false);
    navigate("/");
    window.location.reload();
  }

  const pieDialogo = (
    <React.Fragment>
      <Button
        label="Ok"
        icon="pi pi-check"
        className="p-button-text"
        onClick={ocultarDialogo}
      />
    </React.Fragment>
  );

  return (
    <div className="form-demo text-xl">
      <div className="flex justify-content-left text-xl">
        <div className="card text-xl formLateral">
          <h5 className="text-center text-900 text-2xl">
            {t("usuario.tituloRegistro")}
          </h5>
          <Form
            onSubmit={onSubmit}
            initialValues={usuario}
            validate={validate}
            render={({ handleSubmit }) => (
              <form className=" text-xl p-fluid" onSubmit={handleSubmit}>
                <Field
                  name="login"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
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
                  name="nombre"
                  render={({ input, meta }) => (
                    <div className="field ">
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
                  name="rol"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Dropdown
                            value={rol}
                            id="rol"
                            placeholder={t("usuario.selectRol")}
                            showClear
                            name="rol"
                            options={rolOptions}
                            onChange={(e) => setRol(e.value)}
                            required
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
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Calendar
                            onChange={(e) => setFecha(e.value)}
                            id="fechaNacimiento"
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

                <div className="col">
                  <Button
                    type="submit"
                    label={t("botones.registrarse")}
                    icon="pi pi-user-plus"
                    className="text-xl mr-2"
                  />
                </div>
                <div className="col">
                  <Button
                    icon="pi pi-arrow-circle-left"
                    label={t("botones.cancelar")}
                    className="text-xl p-button-outlined mr-2 "
                    onClick={onRegister}
                  />
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
              <h4>{t("mensajes.registroRealizado")}</h4>
            </div>
          </Dialog>
          <Dialog
            visible={dialogoError}
            style={{ width: "450px" }}
            header={t("mensajes.error")}
            modal
            footer={pieDialogo}
            onHide={ocultarDialogo}
          >
            {resMessage}
          </Dialog>
        </div>
      </div>
    </div>
  );
}
