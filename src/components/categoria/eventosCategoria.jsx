import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataView, DataViewLayoutOptions } from "primereact/dataview";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import eventoGenerica from "./../recursos/imagenes/categoriaGenerica.png";
import { Dialog } from "primereact/dialog";
import { Form, Field } from "react-final-form";
import { classNames } from "primereact/utils";
import { InputText } from "primereact/inputtext";
import eventoService from "../../services/eventoService";
import usuarioService from "../../services/usuarioService";
import suscripcionService from "../../services/suscripcionService";
import solicitudService from "../../services/solicitudService";

export default function Eventosevento() {
  const pathname = window.location.pathname;
  const parts = pathname.split("/");
  const numero = parseInt(parts[parts.length - 1], 10);
  const [t, i18n] = useTranslation("global");
  const [eventos, setEventos] = useState([]);
  const [eventoActual, setEventoActual] = useState([""]);
  const [layout, setLayout] = useState("grid");
  const navigate = useNavigate();
  const [visibleDialogoVerEnDetalle, setVisibleDialogoVerEnDetalle] =
    useState(false);
  const [usuario, setUsuario] = useState([" "]);
  const [fecha, setFecha] = useState(new Date());
  const [visibleDialogoBuscar, setVisibleDialogoBuscar] = useState(false);
  const [tipoAsistencia, setTipoAsistencia] = useState([" "]);
  const [resMessage, setResMessage] = useState("");
  const [dialogoError, setDialogoError] = useState(false);
  const [showSuscripcionCrear, setShowSuscripcionCrear] = useState(false);
  const [estado, setEstado] = useState([" "]);
  const [gerente, setGerente] = useState([" "]);
  const [gerenteOptions, setGerenteOptions] = useState([" "]);
  const tipoAsistenciaOptions = [
    { label: <a>{t("evento.publico")}</a>, value: "PUBLICO" },
    { label: <a>{t("evento.privado")}</a>, value: "PRIVADO" },
  ];
  const [gerenteDetalle, setGerenteDetalle] = useState("");
  const idUsuario = localStorage.getItem("idUsuario");

  const eventoVacio = {
    id: "",
    nombre: "",
    descripcion: "",
    tipoAsistencia: "",
    numAsistentes: "",
    numInscritos: "",
    estado: "",
    fechaEvento: "",
    direccion: "",
    emailContacto: "",
    telefonoContacto: "",
    categoria: "",
    usuario: "",
    imagenEvento: "",
    url: "",
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      eventoService.buscarEventosCategoriaValidos(numero).then((res) => {
        setEventos(res.data);
      });
    } else {
      eventoService.buscarEventosCategoriaValidosAbierto(numero).then((res) => {
        setEventos(res.data);
      });
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      usuarioService.buscarTodos().then((res) => {
        setGerente(res.data);
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].rol == "ROLE_GERENTE") {
            gerenteOptions[i] = {
              label: res.data[i][`login`],
              value: res.data[i][`id`],
            };
          }
        }
      });
    } else {
      usuarioService.buscarTodosAbierto().then((res) => {
        setGerente(res.data);
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].rol == "ROLE_GERENTE") {
            gerenteOptions[i] = {
              label: res.data[i][`login`],
              value: res.data[i][`id`],
            };
          }
        }
      });
    }
  }, [gerente]);

  const isFormFieldValid = (meta) => !!(meta.touched && meta.error);
  const getFormErrorMessage = (meta) => {
    return (
      isFormFieldValid(meta) && <small className="p-error">{meta.error}</small>
    );
  };

  const enlaceImagen = (url) => {
    window.open(url, "_blank");
  };

  const listItem = (evento) => {
    return (
      <div className="col-12">
        <div className="flex flex-column xl:flex-row xl:align-items-start p-4 gap-4">
          {evento.imagenEvento ? (
            <img
              className="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round"
              src={evento.imagenEvento}
              alt={evento.nombre}
            />
          ) : (
            <img
              src={eventoGenerica}
              className="w-4rem shadow-2 border-round"
            />
          )}
          <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
            <div className="flex flex-column align-items-center sm:align-items-start gap-3">
              <div className="text-2xl font-bold text-900 ml-3">
                {evento.nombre}
              </div>
              <div className="text font-italic text-900 ml-3">
                {evento.descripcion}
              </div>
              <a
                onClick={() => enlaceImagen(evento.url)}
                style={{ cursor: "pointer" }}
              >
                {t("botones.webEvento")}
              </a>
            </div>
            <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
              <Button
                icon="pi "
                className="p-button p-component mt-2"
                tooltip={t("botones.informacion")}
                style={{ width: "100%" }}
                onClick={() => infoEvento(evento)}
              >
                {t("evento.informacion")}
              </Button>
              <Button
                icon="pi "
                className="p-button p-component mt-3"
                tooltip={t("botones.inscribirse")}
                style={{ width: "100%" }}
                onClick={() => inscribirse(evento)}
              >
                {t("evento.inscribirse")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const gridItem = (evento) => {
    return (
      <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2">
        <div className="p-4 border-1 surface-border surface-card border-round">
          <div className="flex flex-wrap align-items-center justify-content-between gap-2"></div>
          <div className="flex flex-column align-items-center gap-3 py-5">
            {evento.imagenEvento ? (
              <img
                className="w-9 shadow-2 border-round"
                src={evento.imagenEvento}
                alt={evento.nombre}
              />
            ) : (
              <img
                src={eventoGenerica}
                className="w-4rem shadow-2 border-round"
              />
            )}
            <div className="text-2xl font-bold">{evento.nombre}</div>
            <div className="text font-italic">{evento.descripcion}</div>
            <a
              onClick={() => enlaceImagen(evento.url)}
              style={{ cursor: "pointer" }}
            >
              {t("botones.webEvento")}
            </a>
          </div>
          <div className="card flex justify-content-center">
            <Button
              icon="pi "
              className="p-button p-component mr-2"
              tooltip={t("botones.informacion")}
              style={{ width: "100%" }}
              onClick={() => infoEvento(evento)}
            >
              {t("evento.informacion")}
            </Button>

            <Button
              icon="pi "
              className="p-button p-component"
              tooltip={t("botones.inscribirse")}
              style={{ width: "100%" }}
              onClick={() => inscribirse(evento)}
            >
              {t("evento.inscribirse")}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const itemTemplate = (evento, layout) => {
    if (!evento) {
      return;
    }

    if (layout === "list") return listItem(evento);
    else if (layout === "grid") return gridItem(evento);
  };

  const header = () => {
    return (
      <div className="flex justify-content-end">
        <React.Fragment>
          <Button
            icon="pi pi-arrow-left"
            className="p-button-rounded mr-2"
            tooltip={t("botones.volverCategorias")}
            onClick={volverCategorias}
          />
          <Button
            icon="pi pi-search"
            className="p-button-rounded mr-2"
            tooltip={t("botones.buscar")}
            onClick={buscarEvento}
          />
          <Button
            icon="pi pi-undo"
            className="p-button-rounded mr-2"
            tooltip={t("botones.recargar")}
            onClick={reloadPage}
          />
          <DataViewLayoutOptions
            layout={layout}
            onChange={(e) => setLayout(e.value)}
          />
        </React.Fragment>
      </div>
    );
  };

  const okeyMensajeCrear = () => {
    setShowSuscripcionCrear(false);
  };

  const dialogFooterSuscripcion = (
    <div className="flex justify-content-center">
      <Button
        label="OK"
        className="p-button-text"
        autoFocus
        onClick={okeyMensajeCrear}
      />
    </div>
  );

  const volverCategorias = () => {
    navigate("/categoria/categoriaLayout/");
  };

  const buscarEvento = () => {
    setTipoAsistencia("");
    setEstado("");
    setFecha("");
    setUsuario("");
    setVisibleDialogoBuscar(true);
  };

  const ocultarDialogoBuscar = () => {
    setVisibleDialogoBuscar(false);
  };

  const reloadPage = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      eventoService.buscarEventosCategoria(numero).then(
        (res) => {
          if (res.data && Array.isArray(res.data)) {
            setEventos(res.data);
          } else {
            setEventos([]);
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
    } else {
      eventoService.buscarEventosCategoriaAbierto(numero).then(
        (res) => {
          if (res.data && Array.isArray(res.data)) {
            setEventos(res.data);
          } else {
            setEventos([]);
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
    }
  };

  const cambiarFormatoFecha = (fecha) => {
    if (fecha != undefined) {
      var partes = fecha.split("-");
      var year = partes[0];
      var month = partes[1];
      var day = partes[2];
      var fechaFormateada = day + "/" + month + "/" + year;
      return fechaFormateada;
    }
  };

  const convertirFecha = (fechaTexto) => {
    const fecha = new Date(fechaTexto);
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    const fechaFormateada = `${año}-${mes}-${dia}`;
    return fechaFormateada;
  };

  const formatoTipoAsistencia = (tipoAsistencia) => {
    const idioma = localStorage.getItem("idioma");

    switch (tipoAsistencia) {
      case "PUBLICO":
        switch (idioma) {
          case "es":
            return "Público";
          case "ga":
            return "Público";
          case "en":
            return "Public";
          default:
            return "Público";
        }

      case "PRIVADO":
        switch (idioma) {
          case "es":
            return "Privado";
          case "ga":
            return "Privado";
          case "en":
            return "Private";
          default:
            return "Privado";
        }

      default:
        return tipoAsistencia;
    }
  };

  const infoEvento = (evento) => {
    setGerenteDetalle(evento.usuario.nombre);
    setEventoActual(evento);
    setVisibleDialogoVerEnDetalle(true);
  };

  const ocultarDialogoVerEnDetalle = () => {
    setVisibleDialogoVerEnDetalle(false);
  };

  //En esta usamos evento
  const inscribirse = (evento) => {
    onSubmitInscribirse(evento);
  };

  //En esta usamos eventoActual
  const inscribirseEvento = () => {
    onSubmitInscribirse(eventoActual);
  };

  const documentoInformativo = () => {
    window.open(eventoActual.documentoEvento, "_blank");
  };

  const onSubmitInscribirse = (evento) => {
    const datos = {
      usuario: {
        id: idUsuario,
      },
      evento: {
        id: evento.id,
      },
      fechaSuscripcion: "",
    };

    if (evento.tipoAsistencia === "PUBLICO") {
      suscripcionService.crear(datos).then(
        () => {
          setShowSuscripcionCrear(true);
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
    } else {
      solicitudService.crear(datos).then(
        () => {
          setShowSuscripcionCrear(true);
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
    }
  };

  const onSubmitBuscar = (data, form) => {
    const pathname = window.location.pathname;
    const parts = pathname.split("/");
    const idCategoria = parseInt(parts[parts.length - 1], 10);
    let fechaBuscar = "";

    if (fecha != "" && fecha != undefined) {
      fechaBuscar = convertirFecha(fecha);
    }

    const datos = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      tipoAsistencia: tipoAsistencia,
      numAsistentes: data.numAsistentes,
      numInscritos: data.numInscritos,
      estado: estado,
      fechaEvento: fechaBuscar,
      direccion: data.direccion,
      emailContacto: data.emailContacto,
      telefonoContacto: data.telefonoContacto,
      idCategoria: idCategoria,
      idUsuario: usuario,
    };

    eventoService.buscarTodosParametros(datos).then(
      (res) => {
        if (res.data && Array.isArray(res.data)) {
          setEventos(res.data);
        } else {
          setEventos([]);
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

  return (
    <div className="card">
      {eventos.length > 0 ? (
        <DataView
          value={eventos}
          itemTemplate={itemTemplate}
          layout={layout}
          header={header()}
          paginator
          rows={6}
        />
      ) : (
        <div className="col text-900 py-3">
          <h1>{t("evento.noExistenEventos")}</h1>
        </div>
      )}
      <Dialog
        visible={visibleDialogoVerEnDetalle}
        style={{ width: "450px" }}
        header={t("mensajes.tituloModalVerEnDetalleEvento")}
        modal
        onHide={ocultarDialogoVerEnDetalle}
      >
        <div className="formGestion">
          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="gerente">{t("evento.gerente")}</label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText className="tamanhoInput" value={gerenteDetalle} />
                </div>
              </span>
            </div>
          </div>

          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="direccion">{t("evento.direccion")}</label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText
                    className="tamanhoInput"
                    value={eventoActual.direccion}
                  />
                </div>
              </span>
            </div>
          </div>

          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="fechaEvento">{t("evento.fechaEvento")}</label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText
                    className="tamanhoInput"
                    value={cambiarFormatoFecha(eventoActual.fechaEvento)}
                  />
                </div>
              </span>
            </div>
          </div>

          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="emailContacto">
                  {t("evento.emailContacto")}
                </label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText
                    className="tamanhoInput"
                    value={eventoActual.emailContacto}
                  />
                </div>
              </span>
            </div>
          </div>

          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="numAsistentes">
                  {t("evento.numAsistentes")}
                </label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText
                    className="tamanhoInput"
                    value={eventoActual.numAsistentes}
                  />
                </div>
              </span>
            </div>
          </div>

          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="numInscritos">{t("evento.numInscritos")}</label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText
                    className="tamanhoInput"
                    value={eventoActual.numInscritos}
                  />
                </div>
              </span>
            </div>
          </div>

          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="tipoAsistencia">
                  {t("evento.tipoAsistencia")}
                </label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText
                    className="tamanhoInput"
                    value={formatoTipoAsistencia(eventoActual.tipoAsistencia)}
                  />
                </div>
              </span>
            </div>
          </div>
          <div className="card flex justify-content-center">
            {eventoActual.documentoEvento ? (
              <React.Fragment>
                <Button
                  icon="pi"
                  className="p-button p-component mr-2"
                  tooltip={t("botones.documentoInformativo")}
                  style={{ width: "100%" }}
                  onClick={() => documentoInformativo()}
                >
                  {t("evento.documentoInformativo")}
                </Button>
                <Button
                  icon="pi"
                  className="p-button p-component"
                  tooltip={t("botones.inscribirse")}
                  style={{ width: "100%" }}
                  onClick={() => inscribirseEvento()}
                >
                  {t("evento.inscribirse")}
                </Button>
              </React.Fragment>
            ) : (
              <Button
                icon="pi"
                className="p-button p-component"
                tooltip={t("botones.inscribirse")}
                style={{ width: "100%" }}
                onClick={() => inscribirseEvento()}
              >
                {t("evento.inscribirse")}
              </Button>
            )}
          </div>
        </div>
      </Dialog>
      <Dialog
        visible={visibleDialogoBuscar}
        style={{ width: "450px" }}
        header={t("mensajes.tituloModalBuscar")}
        modal
        onHide={ocultarDialogoBuscar}
      >
        <div className="flex align-items-center justify-content-center">
          <Form
            onSubmit={onSubmitBuscar}
            initialValues={eventoVacio}
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
                            placeholder={t("evento.nombre")}
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
                  name="descripcion"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="descripcion"
                            {...input}
                            placeholder={t("evento.descripcion")}
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
                  name="tipoAsistencia"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Dropdown
                            id="tipoAsistencia"
                            value={tipoAsistencia}
                            placeholder={t("evento.tipoAsistencia")}
                            showClear
                            name="tipoAsistencia"
                            options={tipoAsistenciaOptions}
                            onChange={(e) => setTipoAsistencia(e.value)}
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />

                <Field
                  name="gerente"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Dropdown
                            id="tipoAsistencia"
                            value={usuario}
                            placeholder={t("evento.gerente")}
                            showClear
                            name="gerente"
                            options={gerenteOptions}
                            onChange={(e) => setUsuario(e.value)}
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />

                <Field
                  name="fechaEvento"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Calendar
                            onChange={(e) => setFecha(e.value)}
                            id="fechaEvento"
                            value={null}
                            name="fechaEvento"
                            placeholder={t("evento.fechaEvento")}
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
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />

                <Field
                  name="direccion"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="direccion"
                            {...input}
                            placeholder={t("evento.direccion")}
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
                  name="emailContacto"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="emailContacto"
                            {...input}
                            placeholder={t("evento.emailContacto")}
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
                  name="telefonoContacto"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="telefonoContacto"
                            {...input}
                            placeholder={t("evento.telefonoContacto")}
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
        visible={showSuscripcionCrear}
        onHide={() => showSuscripcionCrear(false)}
        position="center"
        footer={dialogFooterSuscripcion}
        showHeader={false}
        breakpoints={{ "960px": "80vw" }}
        style={{ width: "30vw" }}
      >
        <div className="flex align-items-center flex-column pt-6 px-3">
          <i
            className="pi pi-check-circle"
            style={{ fontSize: "5rem", color: "var(--green-500)" }}
          ></i>
          <h4>{t("mensajes.accionExito")}</h4>
        </div>
      </Dialog>
    </div>
  );
}
