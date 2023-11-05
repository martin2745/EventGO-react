import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataView, DataViewLayoutOptions } from "primereact/dataview";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import eventoService from "../../services/eventoService";
import eventoGenerica from "./../recursos/imagenes/categoriaGenerica.png";

export default function Eventosevento() {
  const pathname = window.location.pathname; // Obtén la parte de la URL
  const parts = pathname.split("/"); // Separa la parte de la URL en partes usando '/'
  const numero = parseInt(parts[parts.length - 1], 10); // Obtén el último elemento en número entero
  const [eventos, setEventos] = useState([]);
  const [t, i18n] = useTranslation("global");
  const [layout, setLayout] = useState("grid");
  const navigate = useNavigate();
  const [visibleDialogoBorrado, setVisibleDialogoBorrado] = useState(false);

  useEffect(() => {
    eventoService.buscarEventosCategoria(numero).then((res) => {
      setEventos(res.data);
    });
  }, [visibleDialogoBorrado]);

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
            </div>
            <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
              <Button
                icon="pi "
                className="p-button p-component"
                style={{ width: "100%" }}
              >
                {t("evento.verEvento")}
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
          </div>
          <div className="card flex justify-content-center">
            <Button
              icon="pi "
              className="p-button p-component"
              style={{ width: "100%" }}
            >
              {t("evento.verEvento")}
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

  return (
    <div className="card">
      <DataView
        value={eventos}
        itemTemplate={itemTemplate}
        layout={layout}
        header={header()}
        paginator
        rows={6}
      />
    </div>
  );
}
