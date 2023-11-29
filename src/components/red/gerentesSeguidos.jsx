import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Form, Field } from "react-final-form";
import { classNames } from "primereact/utils";
import amistadService from "../../services/amistadService";
import avatar from "./../recursos/imagenes/avatar.png";

export default function GerentesSeguidos() {
  const amistadVacio = {
    id: "",
    gerente: {
      id: "",
    },
    seguidor: {
      id: "",
    },
  };
  const [amistades, setAmistades] = useState([]);
  const [t, i18n] = useTranslation("global");
  const navigate = useNavigate();
  const [showMessageEliminar, setShowMessageEliminar] = useState(false);
  const [dialogoError, setDialogoError] = useState(false);
  const [resMessage, setResMessage] = useState("");
  const [amistadActual, setAmistadActual] = useState(amistadVacio);
  const [visibleDialogoBuscar, setVisibleDialogoBuscar] = useState(false);
  const [gerente, setGerente] = useState([" "]);
  const [visibleDialogoBorrado, setVisibleDialogoBorrado] = useState(false);
  const idUsuario = localStorage.getItem("idUsuario");

  //Carga inicial de datos
  useEffect(() => {
    const datos = {
      idSeguidor: idUsuario,
    };
    amistadService.buscarTodosParametros(datos).then((res) => {
      setAmistades(res.data);
    });
  }, []);

  //Validación de datos del formulario
  const isFormFieldValid = (meta) => !!(meta.touched && meta.error);
  const getFormErrorMessage = (meta) => {
    return (
      isFormFieldValid(meta) && <small className="p-error">{meta.error}</small>
    );
  };

  //Buscador por palabra clave
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    representative: { value: null, matchMode: FilterMatchMode.IN },
    status: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
  });

  const onGlobalFilterChange = (event) => {
    const value = event.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
  };

  const nombreGerente = (rowData) => {
    return rowData.gerente.nombre;
  };

  const emailGerente = (rowData) => {
    return rowData.gerente.email;
  };

  const imagenGerente = (rowData) => {
    const gerente = rowData.gerente;
    return (
      <>
        {gerente.imagenUsuario ? (
          <img
            src={gerente.imagenUsuario}
            className="w-4rem shadow-2 border-round"
          />
        ) : (
          <img src={avatar} className="w-4rem shadow-2 border-round" />
        )}
      </>
    );
  };

  const validateBuscar = (data) => {};

  const buscarAmistad = () => {
    setGerente("");
    setVisibleDialogoBuscar(true);
  };

  const confirmarEliminarAmistad = (amistad) => {
    setAmistadActual(amistad);
    setVisibleDialogoBorrado(true);
  };

  const ocultarDialogoBuscar = () => {
    setVisibleDialogoBuscar(false);
  };

  const ocultarDialogoBorrado = () => {
    setAmistadActual(amistadVacio);
    setVisibleDialogoBorrado(false);
  };

  //Recarga de página
  const reloadPage = () => {
    const datos = {
      idSeguidor: idUsuario,
    };
    amistadService.buscarTodosParametros(datos).then(
      (res) => {
        setAmistades(res.data);
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

  //Cabecera de la tabla y footer
  const renderHeader = () => {
    const value = filters["global"] ? filters["global"].value : "";

    return (
      <div className="flex flex-wrap gap-2 justify-content-between align-items-center">
        <div className="flex flex-wrap gap-2">
          <React.Fragment>
            <Button
              icon="pi pi-search"
              className="p-button-rounded"
              tooltip={t("botones.buscar")}
              onClick={buscarAmistad}
            />
          </React.Fragment>
        </div>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <React.Fragment>
            <InputText
              type="search"
              className="mr-2"
              value={value || ""}
              onChange={(e) => onGlobalFilterChange(e)}
              placeholder={t("botones.buscarClave")}
            />
            <Button
              icon="pi pi-undo"
              className="p-button-rounded"
              tooltip={t("botones.recargar")}
              onClick={reloadPage}
            />
          </React.Fragment>
        </span>
      </div>
    );
  };

  const header = renderHeader();
  const footer = `${amistades ? amistades.length : 0}${t(
    "footer.gestoresSeguidos"
  )}`;

  const onSubmitBuscar = (data, form) => {
    const datos = {
      id: "",
      nombreGerente: data.nombre,
      seguidor: {
        idSeguidor: idUsuario,
      },
    };
    amistadService.buscarTodosParametros(datos).then(
      (res) => {
        if (res.data && Array.isArray(res.data)) {
          setAmistades(res.data);
        } else {
          setAmistades([]);
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

  const onSubmitEliminarAmistad = () => {
    amistadService.eliminar(amistadActual.id.toString()).then(
      (res) => {
        const amistadesActualizados = amistades.filter(
          (amistad) => amistad.id !== amistadActual.id
        );
        setAmistades(amistadesActualizados);
        setShowMessageEliminar(true);
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
    ocultarDialogoBorrado();
  };

  //Funciones de modal
  const ocultarDialogo = () => {
    setDialogoError(false);
  };

  const okeyMensajeEliminar = () => {
    setShowMessageEliminar(false);
  };

  //Acciones de una tupla de la tabla
  const accionesSolicitud = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.eliminar")}
          onClick={() => confirmarEliminarAmistad(rowData)}
        />
      </React.Fragment>
    );
  };

  //Footer de las modales de acción
  const pieDialogoBorrado = (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Button
        label={t("mensajes.no")}
        icon="pi pi-times"
        className="p-button-text"
        onClick={ocultarDialogoBorrado}
      />
      <Button
        label={t("mensajes.si")}
        icon="pi pi-check"
        className="p-button-text"
        onClick={onSubmitEliminarAmistad}
      />
    </div>
  );

  const dialogFooterEliminar = (
    <div className="flex justify-content-center">
      <Button
        label="OK"
        className="p-button-text"
        autoFocus
        onClick={okeyMensajeEliminar}
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

  return (
    <div className="card">
      <div>
        <DataTable
          value={amistades}
          paginator
          rows={2}
          header={header}
          filters={filters}
          onFilter={(e) => setFilters(e.filters)}
          footer={footer}
          tableStyle={{ minWidth: "60rem" }}
        >
          <Column
            field="imagenGerente"
            header={t("columnas.imagenEnlace")}
            body={imagenGerente}
          ></Column>
          <Column
            field={nombreGerente}
            header={t("columnas.evento")}
            sortable
          ></Column>
          <Column
            field={emailGerente}
            header={t("columnas.email")}
            sortable
          ></Column>
          <Column header={t("columnas.acciones")} body={accionesSolicitud} />
        </DataTable>
      </div>

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
            initialValues={amistadVacio}
            validate={validateBuscar}
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
        visible={visibleDialogoBorrado}
        style={{ width: "450px" }}
        header={t("mensajes.tituloModalBorrado")}
        modal
        footer={pieDialogoBorrado}
        onHide={ocultarDialogoBorrado}
      >
        <div className="flex align-items-center justify-content-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {amistadActual && (
            <span>{t("mensajes.preguntaModalBorradoAmistad")}</span>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={showMessageEliminar}
        onHide={() => setShowMessageEliminar(false)}
        position="center"
        footer={dialogFooterEliminar}
        showHeader={false}
        breakpoints={{ "960px": "80vw" }}
        style={{ width: "30vw" }}
      >
        <div className="flex align-items-center flex-column pt-6 px-3">
          <i
            className="pi pi-check-circle"
            style={{ fontSize: "5rem", color: "var(--green-500)" }}
          ></i>
          <h4>{t("mensajes.eliminacionElemento")}</h4>
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
  );
}
