import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { classNames } from "primereact/utils";
import { Form, Field } from "react-final-form";
import { useTranslation } from "react-i18next";
import autenticacionService from "../../services/autenticacionService";

export default function RecuperarPassword() {
  //contantes
  const datosVacio = {
    login: "",
    email: "",
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
  function okeyMensaje() {
    setShowMessage(false);
    navigate("/");
    window.location.reload();
  }
  //funciones
  function ocultarDialogo() {
    setDialogoError(false);
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

  function onRecuperarPassword(event) {
    navigate("/");
  }

  const validate = (data) => {
    let errors = {};
    var patronLogin = /([A-Za-z0-9_]{3,15})/;
    var patronCorreoElectronico =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    //login
    if (!data.login) {
      errors.login = <p>{t("usuario.validaciones.loginVacio")}</p>;
    } else if (!patronLogin.test(data.login)) {
      errors.login = (
        <p>{t("usuario.validaciones.loginInvalidoAlfanumerico")}</p>
      );
    } else if (data.login.length > 15) {
      errors.login = <p>{t("usuario.validaciones.loginInvalidoTamañoMax")}</p>;
    } else if (data.login.length < 3) {
      errors.login = <p>{t("usuario.validaciones.loginInvalidoTamañoMin")}</p>;
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

    return errors;
  };

  const onSubmit = (data, form) => {
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

  return (
    <div className="form-demo text-xl">
      <div className="flex justify-content-left text-xl">
        <div className="card text-xl formLateral">
          <h5 className="text-center text-900 text-2xl">
            {t("usuario.tituloRecuperarPassword")}
          </h5>
          <Form
            onSubmit={onSubmit}
            initialValues={datosVacio}
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
                    onClick={onRecuperarPassword}
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
