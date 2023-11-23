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
import usuarioService from "../../services/usuarioService";
import solicitudService from "../../services/solicitudService";
import avatar from "./../recursos/imagenes/avatar.png";

export default function SolicitudesEvento() {
  const solicitudVacio = {
    id: "",
    fechaSolicitud: "",
    evento: "",
    usuario: "",
  };
  const [solicitudes, setSolicitudes] = useState([]);
  const [t, i18n] = useTranslation("global");
  const [fechaSolicitud, setFechaSolicitud] = useState(new Date());
  const navigate = useNavigate();
  const [showMessageEliminar, setShowMessageEliminar] = useState(false);
  const [showMessageAceptar, setShowMessageAceptar] = useState(false);
  const [dialogoError, setDialogoError] = useState(false);
  const [resMessage, setResMessage] = useState("");
  const [solicitudActual, setSolicitudActual] = useState(solicitudVacio);
  const [visibleDialogoBuscar, setVisibleDialogoBuscar] = useState(false);
  const [usuarioOptions, setUsuarioOptions] = useState([" "]);
  const [usuario, setUsuario] = useState([" "]);
  const [visibleDialogoBorrado, setVisibleDialogoBorrado] = useState(false);
  const [visibleDialogoAceptado, setVisibleDialogoAceptado] = useState(false);
  const idUsuario = localStorage.getItem("idUsuario");
  const pathname = window.location.pathname; // Obtén la parte de la URL
  const parts = pathname.split("/"); // Separa la parte de la URL en partes usando '/'
  const idEvento = parseInt(parts[parts.length - 1], 10); // Obtén el último elemento en número entero

  //Carga inicial de datos
  useEffect(() => {
    const datos = {
      idEvento: idEvento,
    };
    solicitudService.buscarTodosParametros(datos).then((res) => {
      setSolicitudes(res.data);
    });
  }, []);

  useEffect(() => {
    const datos = {
      idEvento: idEvento,
    };
    usuarioService.usuariosSolicitud(datos).then((res) => {
      for (var i = 0; i < res.data.length; i++) {
        usuarioOptions[i] = {
          label: res.data[i][`nombre`],
          value: res.data[i][`id`],
        };
      }
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

  const formatoFechaSolicitud = (rowData) => {
    const fechaOriginal = rowData.fechaSolicitud; // Supongamos que la fecha está en el formato 'YYYY-MM-DD'
    const fecha = new Date(fechaOriginal);

    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Los meses en JavaScript se cuentan desde 0, así que sumamos 1
    const anio = fecha.getFullYear();

    // Formateamos la fecha en el formato 'DD/MM/YYYY'
    const fechaFormateada = `${dia}/${mes}/${anio}`;

    return fechaFormateada;
  };

  const formatoFechaEvento = (rowData) => {
    const fechaOriginal = rowData.evento.fechaEvento; // Supongamos que la fecha está en el formato 'YYYY-MM-DD'
    const fecha = new Date(fechaOriginal);

    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Los meses en JavaScript se cuentan desde 0, así que sumamos 1
    const anio = fecha.getFullYear();

    // Formateamos la fecha en el formato 'DD/MM/YYYY'
    const fechaFormateada = `${dia}/${mes}/${anio}`;

    return fechaFormateada;
  };

  const emailUsuario = (rowData) => {
    return rowData.usuario.email;
  };

  const nombreusuario = (rowData) => {
    return rowData.usuario.nombre;
  };

  const imagenUsuario = (rowData) => {
    const usuario = rowData.usuario;
    return (
      <>
        {usuario.imagenUsuario ? (
          <img
            src={usuario.imagenUsuario}
            className="w-4rem shadow-2 border-round"
          />
        ) : (
          <img src={avatar} className="w-4rem shadow-2 border-round" />
        )}
      </>
    );
  };

  const enlaceImagen = (url) => {
    window.open(url, "_blank");
  };

  //Funciones de formato
  const convertirFechaGuiones = (fechaTexto) => {
    let fecha = new Date(fechaTexto);
    let año = fecha.getFullYear();
    let mes = String(fecha.getMonth() + 1).padStart(2, "0");
    let dia = String(fecha.getDate()).padStart(2, "0");
    let fechaFormateada = `${año}-${mes}-${dia}`;
    return fechaFormateada;
  };

  const validateBuscar = (data) => {};

  const buscarSolicitud = () => {
    setFechaSolicitud("");
    setUsuario("");
    setVisibleDialogoBuscar(true);
  };

  const confirmarAceptarSolicitud = (solicitud) => {
    setSolicitudActual(solicitud);
    setVisibleDialogoAceptado(true);
  };

  const confirmarEliminarSolicitud = (solicitud) => {
    setSolicitudActual(solicitud);
    setVisibleDialogoBorrado(true);
  };

  const ocultarDialogoBuscar = () => {
    setVisibleDialogoBuscar(false);
  };

  const ocultarDialogoAceptado = () => {
    setSolicitudActual(solicitudVacio);
    setVisibleDialogoAceptado(false);
  };

  const ocultarDialogoBorrado = () => {
    setSolicitudActual(solicitudVacio);
    setVisibleDialogoBorrado(false);
  };

  const volverMisEventos = () => {
    navigate("/evento/misEventosGestor/");
  };

  //Recarga de página
  const reloadPage = () => {
    const datos = {
      idEvento: idEvento,
    };
    solicitudService.buscarTodosParametros(datos).then(
      (res) => {
        setSolicitudes(res.data);
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
              icon="pi pi-arrow-left"
              className="p-button-rounded mr-2"
              tooltip={t("botones.volverMisEventos")}
              onClick={volverMisEventos}
            />
            <Button
              icon="pi pi-search"
              className="p-button-rounded"
              tooltip={t("botones.buscar")}
              onClick={buscarSolicitud}
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
  const footer = `${solicitudes ? solicitudes.length : 0}${t(
    "footer.solicitudes"
  )}`;

  const onSubmitBuscar = (data, form) => {
    let fechaBuscar = "";
    if (fechaSolicitud != "" && fechaSolicitud != undefined) {
      fechaBuscar = convertirFechaGuiones(fechaSolicitud);
    }

    const datos = {
      fechaSolicitud: fechaBuscar,
      idEvento: idEvento,
      idUsuario: usuario,
    };

    solicitudService.buscarTodosParametros(datos).then(
      (res) => {
        if (res.data && Array.isArray(res.data)) {
          setSolicitudes(res.data);
        } else {
          setSolicitudes([]);
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

  const onSubmitAceptarSolicitud = () => {
    solicitudService
      .aceptarSolicitud(solicitudActual.id.toString(), solicitudActual)
      .then(
        () => {
          const solicitudesActualizados = solicitudes.filter(
            (evento) => evento.id !== solicitudActual.id
          );
          setSolicitudes(solicitudesActualizados);
          setShowMessageAceptar(true);
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
    ocultarDialogoAceptado();
  };

  const onSubmitEliminarSolicitud = () => {
    solicitudService.eliminar(solicitudActual.id.toString()).then(
      () => {
        const solicitudesActualizados = solicitudes.filter(
          (evento) => evento.id !== solicitudActual.id
        );
        setSolicitudes(solicitudesActualizados);
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

  const okeyMensajeAceptar = () => {
    setShowMessageAceptar(false);
  };

  const okeyMensajeEliminar = () => {
    setShowMessageEliminar(false);
  };

  //Acciones de una tupla de la tabla
  const accionesSolicitud = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-check"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.aceptarSolicitud")}
          onClick={() => confirmarAceptarSolicitud(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.eliminar")}
          onClick={() => confirmarEliminarSolicitud(rowData)}
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
        onClick={onSubmitEliminarSolicitud}
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

  const pieDialogoAceptado = (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Button
        label={t("mensajes.no")}
        icon="pi pi-times"
        className="p-button-text"
        onClick={ocultarDialogoAceptado}
      />
      <Button
        label={t("mensajes.si")}
        icon="pi pi-check"
        className="p-button-text"
        onClick={onSubmitAceptarSolicitud}
      />
    </div>
  );

  const dialogFooterAceptar = (
    <div className="flex justify-content-center">
      <Button
        label="OK"
        className="p-button-text"
        autoFocus
        onClick={okeyMensajeAceptar}
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
          value={solicitudes}
          paginator
          rows={2}
          header={header}
          filters={filters}
          onFilter={(e) => setFilters(e.filters)}
          footer={footer}
          tableStyle={{ minWidth: "60rem" }}
        >
          <Column
            field="imagenUsuario"
            header={t("columnas.imagen")}
            body={imagenUsuario}
          ></Column>
          <Column
            field={nombreusuario}
            header={t("columnas.nombreUsuario")}
            sortable
          ></Column>
          <Column
            field={formatoFechaSolicitud}
            header={t("columnas.fechaSolicitud")}
            sortable
          ></Column>
          <Column
            field={formatoFechaEvento}
            header={t("columnas.fechaEvento")}
            sortable
          ></Column>
          <Column
            field={emailUsuario}
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
            initialValues={solicitudVacio}
            validate={validateBuscar}
            render={({ handleSubmit }) => (
              <form
                className=" text-xl p-fluid formGestion"
                onSubmit={handleSubmit}
              >
                <Field
                  name="fechaSolicitud"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Calendar
                            id="fechaSolicitud"
                            value={fechaSolicitud}
                            name="fechaSolicitud"
                            placeholder={t("solicitud.fechaSolicitud")}
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
                            onChange={(e) => setFechaSolicitud(e.value)}
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />

                <Field
                  name="usuario"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Dropdown
                            id="usuario"
                            value={usuario}
                            placeholder={t("solicitud.nombreUsuario")}
                            showClear
                            name="usuario"
                            options={usuarioOptions}
                            onChange={(e) => setUsuario(e.value)}
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
        visible={visibleDialogoAceptado}
        style={{ width: "450px" }}
        header={t("mensajes.tituloModalAceptado")}
        modal
        footer={pieDialogoAceptado}
        onHide={ocultarDialogoAceptado}
      >
        <div className="flex align-items-center justify-content-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {solicitudActual && (
            <span>
              {t("mensajes.preguntaModalAceptadoSolicitud")}
              {solicitudActual.usuario.nombre}?
            </span>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={showMessageAceptar}
        onHide={() => setShowMessageAceptar(false)}
        position="center"
        footer={dialogFooterAceptar}
        showHeader={false}
        breakpoints={{ "960px": "80vw" }}
        style={{ width: "30vw" }}
      >
        <div className="flex align-items-center flex-column pt-6 px-3">
          <i
            className="pi pi-check-circle"
            style={{ fontSize: "5rem", color: "var(--green-500)" }}
          ></i>
          <h4>{t("mensajes.aceptarSolicitud")}</h4>
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
          {solicitudActual && (
            <span>{t("mensajes.preguntaModalBorradoSolicitud")}</span>
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
