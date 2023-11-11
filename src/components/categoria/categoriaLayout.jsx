import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataView, DataViewLayoutOptions } from "primereact/dataview";
import categoriaService from "../../services/categoriaService";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Form, Field } from "react-final-form";
import { classNames } from "primereact/utils";
import { InputText } from "primereact/inputtext";

import CategoriaGenerica from "./../recursos/imagenes/categoriaGenerica.png";

export default function BasicDemo() {
  const [categorias, setCategorias] = useState([]);
  const [layout, setLayout] = useState("grid");
  const [t, i18n] = useTranslation("global");
  const navigate = useNavigate();
  const [visibleDialogoBuscar, setVisibleDialogoBuscar] = useState(false);
  const isFormFieldValid = (meta) => !!(meta.touched && meta.error);
  const [resMessage, setResMessage] = useState("");
  const [dialogoError, setDialogoError] = useState(false);
  const [currentCategoria, setCurrentCategoria] = useState(" ");
  const getFormErrorMessage = (meta) => {
    return (
      isFormFieldValid(meta) && <small className="p-error">{meta.error}</small>
    );
  };
  const categoriaVacio = {
    id: "",
    nombre: "",
    descripcion: "",
  };

  useEffect(() => {
    categoriaService.buscarTodos().then((res) => {
      setCategorias(res.data);
    });
  }, []);

  const listItem = (categoria) => {
    return (
      <div className="col-12">
        <div className="flex flex-column xl:flex-row xl:align-items-start p-4 gap-4">
          {categoria.imagenCategoria ? (
            <img
              className="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round"
              src={categoria.imagenCategoria}
              alt={categoria.nombre}
            />
          ) : (
            <img
              src={CategoriaGenerica}
              className="w-4rem shadow-2 border-round"
            />
          )}
          <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
            <div className="flex flex-column align-items-center sm:align-items-start gap-3">
              <div className="text-2xl font-bold text-900 ml-3">
                {categoria.nombre}
              </div>
              <div className="text font-italic text-900 ml-3">
                {categoria.descripcion}
              </div>
            </div>
            <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
              <Button
                icon="pi "
                className="p-button p-component"
                style={{ width: "100%" }}
                onClick={() => eventos(categoria)}
              >
                {t("categoria.verEvento")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const gridItem = (categoria) => {
    return (
      <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2">
        <div className="p-4 border-1 surface-border surface-card border-round">
          <div className="flex flex-wrap align-items-center justify-content-between gap-2"></div>
          <div className="flex flex-column align-items-center gap-3 py-5">
            {categoria.imagenCategoria ? (
              <img
                className="w-9 shadow-2 border-round"
                src={categoria.imagenCategoria}
                alt={categoria.nombre}
              />
            ) : (
              <img
                src={CategoriaGenerica}
                className="w-4rem shadow-2 border-round"
              />
            )}
            <div className="text-2xl font-bold">{categoria.nombre}</div>
            <div className="text font-italic">{categoria.descripcion}</div>
          </div>
          <div className="card flex justify-content-center">
            <Button
              icon="pi "
              className="p-button p-component"
              style={{ width: "100%" }}
              onClick={() => eventos(categoria)}
            >
              {t("categoria.verEvento")}
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
            tooltip={t("botones.buscar")}
            onClick={buscarCategoria}
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
            onClick={reloadPage}
          />
        </React.Fragment>
      </div>
    );
  };

  const eventos = (categoria) => {
    setCurrentCategoria(categoria);
    navigate("/categoria/eventosCategoria/" + categoria.id.toString());
  };

  const buscarCategoria = () => {
    setVisibleDialogoBuscar(true);
  };

  const ocultarDialogoBuscar = () => {
    setVisibleDialogoBuscar(false);
  };

  const onSubmitBuscar = (data, form) => {
    categoriaService.buscarTodosParametros(data).then(
      (res) => {
        if (res.data && Array.isArray(res.data)) {
          setCategorias(res.data);
        } else {
          setCategorias([]);
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
    categoriaService.buscarTodos().then(
      (res) => {
        if (res.data && Array.isArray(res.data)) {
          setCategorias(res.data);
        } else {
          setCategorias([]);
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
    <div className="card">
      <DataView
        value={categorias}
        itemTemplate={itemTemplate}
        layout={layout}
        header={header()}
        paginator
        rows={6}
      />
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
            initialValues={categoriaVacio}
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
                            placeholder={t("categoria.nombre")}
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
                            placeholder={t("categoria.descripcion")}
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
    </div>
  );
}
