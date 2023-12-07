import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Form, Field } from "react-final-form";
import { classNames } from "primereact/utils";
import { Dialog } from "primereact/dialog";
import autenticacionService from "../../services/autenticacionService";

export default function InicioSesion() {
  //contantes
  const loginVacio = {
    login: "",
    password: "",
  };
  const [t, i18n] = useTranslation("global");
  const [resMessage, setResMessage] = useState("");
  const [dialogoError, setDialogoError] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();
  const isFormFieldValid = (meta) => !!(meta.touched && meta.error);
  const getFormErrorMessage = (meta) => {
    return (
      isFormFieldValid(meta) && <small className="p-error">{meta.error}</small>
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
    navigate("/");
    window.location.reload();
  }
  //funciones
  function ocultarDialogo() {
    setDialogoError(false);
  }
  const validate = (data) => {
    let errors = {};
    var patronLogin = /([A-Za-z0-9_]{3,15})/;
    var patronContraseña = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])\S{3,16}$/;

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

    return errors;
  };

  function onRegister(event) {
    navigate("/registro");
  }
  function onRecuperarPassword(event) {
    navigate("/recuperarPassword");
  }

  const onSubmit = (data, form) => {
    autenticacionService.login(data).then(
      () => {
        const rol = localStorage.getItem("rol");
        form.restart();
        if (rol === "ROLE_ADMINISTRADOR") {
          navigate("/categoria/categoriaShowAll/");
          window.location.reload();
        } else {
          navigate("/categoria/categoriaLayout/");
          window.location.reload();
        }
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

  return (
    <div className="form-demo text-xl">
      <div className="flex justify-content-left text-xl">
        <div className="card text-xl formLateral">
          <h5 className="text-center text-900 text-2xl">
            {t("usuario.tituloInicioSesion")}
          </h5>
          <Form
            onSubmit={onSubmit}
            initialValues={loginVacio}
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
                            required
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />
                <Button
                  label={t("botones.iniciarSesion")}
                  className="text-xl mb-4 mt-4"
                  type="submit"
                  icon="pi pi-sign-in"
                />
                <Button
                  label={t("botones.registrarse")}
                  icon="pi pi-user-plus"
                  className="text-xl p-button-outlined mr-2"
                  onClick={onRegister}
                />
                <Button
                  label={t("botones.recuperarPassword")}
                  icon="pi pi-envelope"
                  className="text-xl p-button-outlined mt-4"
                  onClick={onRecuperarPassword}
                />
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
