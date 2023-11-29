import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataView, DataViewLayoutOptions } from "primereact/dataview";
import usuarioService from "../../services/usuarioService";
import amistadService from "../../services/amistadService";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Form, Field } from "react-final-form";
import { classNames } from "primereact/utils";
import { InputText } from "primereact/inputtext";
import avatar from "./../recursos/imagenes/avatar.png";

export default function GerentesSeguir() {
  const gerenteVacio = {
    id: "",
    login: "",
    password: "",
    nombre: "",
    email: "",
    rol: "",
    dni: "",
    fechaNacimiento: "",
    pais: "",
    imagenUsuario: "",
    borradoLogico: "",
  };
  const idUsuario = localStorage.getItem("idUsuario");
  const [gerenteActual, setGerenteActual] = useState(gerenteVacio);
  const [gerentes, setGerentes] = useState([]);
  const [layout, setLayout] = useState("grid");
  const [t, i18n] = useTranslation("global");
  const navigate = useNavigate();
  const [visibleDialogoBuscar, setVisibleDialogoBuscar] = useState(false);
  const [visibleDialogoSeguido, setVisibleDialogoSeguido] = useState(false);
  const [showMessageSeguir, setShowMessageSeguir] = useState(false);
  const isFormFieldValid = (meta) => !!(meta.touched && meta.error);
  const [resMessage, setResMessage] = useState("");
  const [dialogoError, setDialogoError] = useState(false);
  const getFormErrorMessage = (meta) => {
    return (
      isFormFieldValid(meta) && <small className="p-error">{meta.error}</small>
    );
  };

  useEffect(() => {
    usuarioService.buscarGerentes(idUsuario).then((res) => {
      setGerentes(res.data);
    });
  }, []);

  const listItem = (gerente) => {
    return (
      <div className="col-12">
        <div className="flex flex-column xl:flex-row xl:align-items-start p-4 gap-4">
          {gerente.imagenUsuario ? (
            <img
              className="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round"
              src={gerente.imagenUsuario}
              alt={gerente.nombre}
            />
          ) : (
            <img src={avatar} className="w-4rem shadow-2 border-round" />
          )}
          <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
            <div className="flex flex-column align-items-center sm:align-items-start gap-3">
              <div className="text-2xl font-bold text-900 ml-3">
                {gerente.nombre}
              </div>
              <div className="text font-italic text-900 ml-3">
                {gerente.email}
              </div>
            </div>
            <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
              <Button
                icon="pi "
                className="p-button p-component"
                style={{ width: "100%" }}
                onClick={() => confirmarSeguirGerente(gerente)}
              >
                {t("usuario.seguir")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const gridItem = (gerente) => {
    return (
      <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2">
        <div className="p-4 border-1 surface-border surface-card border-round">
          <div className="flex flex-wrap align-items-center justify-content-between gap-2"></div>
          <div className="flex flex-column align-items-center gap-3 py-5">
            {gerente.imagenUsuario ? (
              <img
                className="w-9 shadow-2 border-round"
                src={gerente.imagenUsuario}
                alt={gerente.nombre}
              />
            ) : (
              <img src={avatar} className="w-4rem shadow-2 border-round" />
            )}
            <div className="text-2xl font-bold">{gerente.nombre}</div>
            <div className="text font-italic">{gerente.email}</div>
          </div>
          <div className="card flex justify-content-center">
            <Button
              icon="pi "
              className="p-button p-component"
              style={{ width: "100%" }}
              onClick={() => confirmarSeguirGerente(gerente)}
            >
              {t("usuario.seguir")}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const itemTemplate = (categoria, layout) => {
    if (!categoria) {
      return;
    }

    if (layout === "list") return listItem(categoria);
    else if (layout === "grid") return gridItem(categoria);
  };

  const header = () => {
    return (
      <div className="flex justify-content-end">
        <React.Fragment>
          <Button
            icon="pi pi-search"
            className="p-button-rounded mr-2"
            tooltip={t("usuario.buscar")}
            onClick={buscarGerente}
          />
          <Button
            icon="pi pi-undo"
            className="p-button-rounded mr-2"
            tooltip={t("usuario.recargar")}
            onClick={reloadPage}
          />
          <DataViewLayoutOptions
            layout={layout}
            onChange={(e) => setLayout(e.value)}
            onClick={reloadPage}
          />
        </React.Fragment>
      </div>
    );
  };

  const confirmarSeguirGerente = (gerente) => {
    setGerenteActual(gerente);
    setVisibleDialogoSeguido(true);
  };

  const ocultarDialogoSeguido = () => {
    setGerenteActual(gerenteVacio);
    setVisibleDialogoSeguido(false);
  };

  const buscarGerente = () => {
    setVisibleDialogoBuscar(true);
  };

  const ocultarDialogoBuscar = () => {
    setVisibleDialogoBuscar(false);
  };

  function okeyMensajeSeguir() {
    setShowMessageSeguir(false);
  }

  const onSubmitSeguir = (data, form) => {
    const datos = {
      gerente: {
        id: gerenteActual.id,
      },
      seguidor: {
        id: idUsuario,
      },
    };

    amistadService.crear(datos).then(
      (res) => {
        setShowMessageSeguir(true);
        reloadPage();
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
    ocultarDialogoSeguido();
  };

  const onSubmitBuscar = (data, form) => {
    usuarioService.buscarTodosParametros(data).then(
      (res) => {
        if (res.data && Array.isArray(res.data)) {
          setGerentes(res.data);
        } else {
          setGerentes([]);
        }
        form.restart();
        ocultarDialogoBuscar();
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

  const reloadPage = () => {
    usuarioService.buscarGerentes(idUsuario).then(
      (res) => {
        if (res.data && Array.isArray(res.data)) {
          setGerentes(res.data);
        } else {
          setGerentes([]);
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

  const pieDialogoSeguido = (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Button
        label={t("mensajes.si")}
        icon="pi pi-check"
        className="p-button-text"
        onClick={onSubmitSeguir}
      />
    </div>
  );

  const dialogFooterSeguir = (
    <div className="flex justify-content-center">
      <Button
        label="OK"
        className="p-button-text"
        autoFocus
        onClick={okeyMensajeSeguir}
      />
    </div>
  );

  return (
    <div className="card">
      <DataView
        value={gerentes}
        itemTemplate={itemTemplate}
        layout={layout}
        header={header()}
        paginator
        rows={6}
      />
      <Dialog
        visible={visibleDialogoBuscar}
        style={{ width: "450px" }}
        header={t("mensajes.tituloModalSeguido")}
        modal
        onHide={ocultarDialogoBuscar}
      >
        <div className="flex align-items-center justify-content-center">
          <Form
            onSubmit={onSubmitBuscar}
            initialValues={gerenteVacio}
            render={({ handleSubmit }) => (
              <form
                className=" text-xl p-fluid formGestion"
                onSubmit={handleSubmit}
              >
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
                    label={t("botones.buscar")}
                    icon="pi pi-search"
                    className="p-button-outlined mr-2"
                  />
                </div>
              </form>
            )}
          />
        </div>
      </Dialog>
      <Dialog
        visible={visibleDialogoSeguido}
        style={{ width: "450px" }}
        header={t("mensajes.tituloModalSeguido")}
        modal
        footer={pieDialogoSeguido}
        onHide={ocultarDialogoSeguido}
      >
        <div className="flex align-items-center justify-content-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {gerenteActual && (
            <span>
              {t("mensajes.preguntaModalSeguido")} <b>{gerenteActual.nombre}</b>
              ?
            </span>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={showMessageSeguir}
        onHide={() => setShowMessageSeguir(false)}
        position="center"
        footer={dialogFooterSeguir}
        showHeader={false}
        breakpoints={{ "960px": "80vw" }}
        style={{ width: "30vw" }}
      >
        <div className="flex align-items-center flex-column pt-6 px-3">
          <i
            className="pi pi-check-circle"
            style={{ fontSize: "5rem", color: "var(--green-500)" }}
          ></i>
          <h4>{t("mensajes.seguir")}</h4>
        </div>
      </Dialog>
    </div>
  );
}
