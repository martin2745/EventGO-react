import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Form, Field } from "react-final-form";
import { classNames } from "primereact/utils";
import autenticacionService from "../../services/autenticacionService";
import noticiaService from "../../services/noticiaService";

export default function NoticiaShowAll() {
  const noticiaVacio = {
    id: "",
    titulo: "",
    descripcion: "",
    fechaNoticia: "",
    idUsuario: "",
  };
  const [noticias, setNoticias] = useState([]);
  const [t, i18n] = useTranslation("global");
  const [fecha, setFecha] = useState(new Date());
  const navigate = useNavigate();
  const [showMessageCrear, setShowMessageCrear] = useState(false);
  const [showMessageEliminar, setShowMessageEliminar] = useState(false);
  const [dialogoError, setDialogoError] = useState(false);
  const [resMessage, setResMessage] = useState("");
  const [noticiaActual, setNoticiaActual] = useState(noticiaVacio);
  const [visibleDialogoCrear, setVisibleDialogoCrear] = useState(false);
  const [visibleDialogoBuscar, setVisibleDialogoBuscar] = useState(false);
  const [visibleDialogoBorrado, setVisibleDialogoBorrado] = useState(false);
  const idUsuario = localStorage.getItem("idUsuario");

  useEffect(() => {
    if (JSON.parse(localStorage.getItem("user")).rol === "ROLE_GERENTE") {
      const datos = {
        idUsuario: idUsuario,
      };
      noticiaService.buscarTodosParametros(datos).then((res) => {
        setNoticias(res.data);
      });
    } else {
      autenticacionService.logout();
      navigate("/");
      window.location.reload();
    }
  }, []);

  const isFormFieldValid = (meta) => !!(meta.touched && meta.error);
  const getFormErrorMessage = (meta) => {
    return (
      isFormFieldValid(meta) && <small className="p-error">{meta.error}</small>
    );
  };

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

  function convertirFecha(fechaTexto) {
    const fecha = new Date(fechaTexto);

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    const fechaFormateada = `${año}-${mes}-${dia}`;

    return fechaFormateada;
  }

  const formatoFechaNoticia = (rowData) => {
    const fechaOriginal = rowData.fechaNoticia; // Supongamos que la fecha está en el formato 'YYYY-MM-DD'
    const fecha = new Date(fechaOriginal);

    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Los meses en JavaScript se cuentan desde 0, así que sumamos 1
    const anio = fecha.getFullYear();

    // Formateamos la fecha en el formato 'DD/MM/YYYY'
    const fechaFormateada = `${dia}/${mes}/${anio}`;

    return fechaFormateada;
  };

  const renderHeader = () => {
    const value = filters["global"] ? filters["global"].value : "";

    return (
      <div className="flex flex-wrap gap-2 justify-content-between align-items-center">
        <div className="flex flex-wrap gap-2">
          <React.Fragment>
            <Button
              icon="pi pi-plus"
              severity="success"
              className="p-button-rounded mr-2"
              tooltip={t("botones.nuevo")}
              onClick={crearNoticia}
            />
            <Button
              icon="pi pi-search"
              className="p-button-rounded"
              tooltip={t("botones.buscar")}
              onClick={buscarNoticia}
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

  const footer = `${noticias ? noticias.length : 0}${t("footer.noticias")}`;

  const validateCrear = (data) => {};

  const validateBuscar = (data) => {};

  function crearNoticia() {
    setVisibleDialogoCrear(true);
  }

  function buscarNoticia() {
    setFecha("");
    setVisibleDialogoBuscar(true);
  }

  function confirmarEliminarNoticia(noticia) {
    setNoticiaActual(noticia);
    setVisibleDialogoBorrado(true);
  }

  function ocultarDialogoCrear() {
    setVisibleDialogoCrear(false);
  }

  function ocultarDialogoBuscar() {
    setVisibleDialogoBuscar(false);
  }

  function ocultarDialogoBorrado() {
    setNoticiaActual(noticiaVacio);
    setVisibleDialogoBorrado(false);
  }

  const onSubmitCrear = (data, form) => {
    const datos = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      usuario: {
        id: idUsuario,
      },
    };

    noticiaService.crear(datos).then(
      () => {
        setShowMessageCrear(true);
        form.restart();
        ocultarDialogoCrear();
        reloadPage();
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

  const onSubmitBuscar = (data, form) => {
    let fechaBuscar = "";

    if (fecha != "" && fecha != undefined) {
      fechaBuscar = convertirFecha(fecha);
    }

    const datos = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      fechaNoticia: fechaBuscar,
      usuario: {
        id: idUsuario,
      },
    };

    noticiaService.buscarTodosParametros(datos).then(
      (res) => {
        if (res.data && Array.isArray(res.data)) {
          setNoticias(res.data);
        } else {
          setNoticias([]);
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

  function onSubmitEliminarNoticia() {
    noticiaService.eliminar(noticiaActual.id.toString()).then(
      () => {
        const noticiasActualizados = noticias.filter(
          (noticia) => noticia.id !== noticiaActual.id
        );
        setNoticias(noticiasActualizados);
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
  }

  function reloadPage() {
    const datos = {
      idUsuario: idUsuario,
    };
    noticiaService.buscarTodosParametros(datos).then(
      (res) => {
        if (res.data && Array.isArray(res.data)) {
          setNoticias(res.data);
        } else {
          setNoticias([]);
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
        onClick={onSubmitEliminarNoticia}
      />
    </div>
  );

  const dialogFooterCrear = (
    <div className="flex justify-content-center">
      <Button
        label="OK"
        className="p-button-text"
        autoFocus
        onClick={okeyMensajeCrear}
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

  function ocultarDialogo() {
    setDialogoError(false);
  }

  function okeyMensajeCrear() {
    setShowMessageCrear(false);
  }

  function okeyMensajeEliminar() {
    setShowMessageEliminar(false);
  }

  function accionesNoticia(rowData) {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.eliminar")}
          onClick={() => confirmarEliminarNoticia(rowData)}
        />
      </React.Fragment>
    );
  }

  return (
    <div className="card">
      <div>
        <DataTable
          value={noticias}
          paginator
          rows={2}
          header={header}
          filters={filters}
          onFilter={(e) => setFilters(e.filters)}
          footer={footer}
          tableStyle={{ minWidth: "60rem" }}
        >
          <Column
            field="titulo"
            header={t("columnas.titulo")}
            sortable
          ></Column>
          <Column
            field="descripcion"
            header={t("columnas.descripcion")}
            sortable
          ></Column>
          <Column
            field={formatoFechaNoticia}
            header={t("columnas.fechaNoticia")}
            sortable
          ></Column>
          <Column header={t("columnas.acciones")} body={accionesNoticia} />
        </DataTable>
      </div>

      <Dialog
        visible={visibleDialogoCrear}
        style={{ width: "450px" }}
        header={t("mensajes.tituloModalCrear")}
        modal
        onHide={ocultarDialogoCrear}
      >
        <div className="flex align-items-center justify-content-center">
          <Form
            onSubmit={onSubmitCrear}
            initialValues={noticiaVacio}
            validate={validateCrear}
            render={({ handleSubmit }) => (
              <form
                className=" text-xl p-fluid formGestion"
                onSubmit={handleSubmit}
              >
                <Field
                  name="titulo"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="nombre"
                            {...input}
                            placeholder={t("noticia.titulo")}
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
                  name="descripcion"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="descripcion"
                            {...input}
                            placeholder={t("noticia.descripcion")}
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
                    label={t("botones.crear")}
                    icon="pi pi-plus"
                    className="p-button-outlined mr-2"
                  />
                </div>
              </form>
            )}
          />
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
            initialValues={noticiaVacio}
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
                            placeholder={t("noticia.titulo")}
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
                            placeholder={t("noticia.descripcion")}
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
                  name="fechaNoticia"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Calendar
                            onChange={(e) => setFecha(e.value)}
                            id="fechaNoticia"
                            value={null}
                            name="fechaNoticia"
                            placeholder={t("noticia.fechaNoticia")}
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
          {noticiaActual && (
            <span>{t("mensajes.preguntaModalBorradoNoticia")}</span>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={showMessageCrear}
        onHide={() => setShowMessageCrear(false)}
        position="center"
        footer={dialogFooterCrear}
        showHeader={false}
        breakpoints={{ "960px": "80vw" }}
        style={{ width: "30vw" }}
      >
        <div className="flex align-items-center flex-column pt-6 px-3">
          <i
            className="pi pi-check-circle"
            style={{ fontSize: "5rem", color: "var(--green-500)" }}
          ></i>
          <h4>{t("mensajes.creacionElemento")}</h4>
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
