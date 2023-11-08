import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataView, DataViewLayoutOptions } from "primereact/dataview";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import eventoService from "../../services/eventoService";
import eventoGenerica from "./../recursos/imagenes/categoriaGenerica.png";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

export default function Eventosevento() {
  const pathname = window.location.pathname;
  const parts = pathname.split("/");
  const numero = parseInt(parts[parts.length - 1], 10);
  const [eventos, setEventos] = useState([]);
  const [eventoActual, setEventoActual] = useState([""]);
  const [t, i18n] = useTranslation("global");
  const [layout, setLayout] = useState("grid");
  const navigate = useNavigate();
  const [visibleDialogoVerEnDetalle, setVisibleDialogoVerEnDetalle] =
    useState(false);

  useEffect(() => {
    eventoService.buscarEventosCategoriaValidos(numero).then((res) => {
      setEventos(res.data);
    });
  }, []);

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
                Web del evento
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
              Web del evento
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
        <DataViewLayoutOptions
          layout={layout}
          onChange={(e) => setLayout(e.value)}
        />
      </div>
    );
  };

  function cambiarFormatoFecha(fecha) {
    if (fecha != undefined) {
      var partes = fecha.split("-");
      var year = partes[0];
      var month = partes[1];
      var day = partes[2];
      var fechaFormateada = day + "/" + month + "/" + year;
      return fechaFormateada;
    }
  }

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
    setEventoActual(evento);
    setVisibleDialogoVerEnDetalle(true);
  };

  const ocultarDialogoVerEnDetalle = () => {
    setVisibleDialogoVerEnDetalle(false);
  };

  const inscribirse = (evento) => {
    setEventoActual(evento);
  };

  const inscribirseEvento = () => {
    console.log(eventoActual);
  };

  const documentoInformativo = () => {
    window.open(eventoActual.documentoEvento, "_blank");
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
    </div>
  );
}
