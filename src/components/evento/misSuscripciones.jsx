import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Form, Field } from "react-final-form";
import { classNames } from "primereact/utils";
import eventoService from "../../services/eventoService";
import comentarioService from "../../services/comentarioService";
import suscripcionService from "../../services/suscripcionService";
import avatar from "./../recursos/imagenes/avatar.png";
import logo from "./../recursos/imagenes/logo.png";
import { Rating } from "primereact/rating";

export default function MisSuscripciones() {
  const comentarioVacio = {
    id: "",
    comentario: "",
    puntuacion: "",
    evento: "",
    usuario: "",
  };
  const suscripcionVacio = {
    id: "",
    fechaSuscripcion: "",
    evento: "",
    usuario: "",
  };
  const [suscripciones, setSuscripciones] = useState([]);
  const [t, i18n] = useTranslation("global");
  const [fechaSuscripcion, setFechaSuscripcion] = useState(new Date());
  const navigate = useNavigate();
  const [showMessageCrear, setShowMessageCrear] = useState(false);
  const [showMessageEliminar, setShowMessageEliminar] = useState(false);
  const [dialogoError, setDialogoError] = useState(false);
  const [resMessage, setResMessage] = useState("");
  const [suscripcionActual, setSuscripcionActual] = useState(suscripcionVacio);
  const [visibleDialogoBuscar, setVisibleDialogoBuscar] = useState(false);
  const [eventoOptions, setEventoOptions] = useState([" "]);
  const [evento, setEvento] = useState([" "]);
  const [visibleDialogoBorrado, setVisibleDialogoBorrado] = useState(false);
  const [visibleDialogoComentar, setVisibleDialogoComentar] = useState(false);
  const idUsuario = localStorage.getItem("idUsuario");
  const [comentario, setComentario] = useState(null);
  const [puntuacion, setPuntuacion] = useState(null);

  //Carga inicial de datos
  useEffect(() => {
    const datos = {
      idUsuario: idUsuario,
    };
    suscripcionService.buscarTodosParametros(datos).then((res) => {
      setSuscripciones(res.data);
    });
  }, []);

  useEffect(() => {
    const datos = {
      idUsuario: idUsuario,
    };
    eventoService.eventosSuscritos(datos).then((res) => {
      for (var i = 0; i < res.data.length; i++) {
        eventoOptions[i] = {
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

  const formatoFechaSuscripcion = (rowData) => {
    const fechaOriginal = rowData.fechaSuscripcion; // Supongamos que la fecha está en el formato 'YYYY-MM-DD'
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
    const fechaFormateada = `${dia}/${mes}/${anio}`;
    return fechaFormateada;
  };

  const direccionEvento = (rowData) => {
    return rowData.evento.direccion;
  };

  const emailEvento = (rowData) => {
    return rowData.evento.emailContacto;
  };

  const telefonoEvento = (rowData) => {
    return rowData.evento.telefonoContacto;
  };

  const nombreEvento = (rowData) => {
    return rowData.evento.nombre;
  };

  const imagenEvento = (rowData) => {
    const evento = rowData.evento;
    return (
      <>
        {evento.imagenEvento ? (
          <a
            onClick={() => enlaceImagen(evento.url)}
            style={{ cursor: "pointer" }}
          >
            <img
              src={evento.imagenEvento}
              className="w-4rem shadow-2 border-round"
            />
          </a>
        ) : (
          <a
            onClick={() => enlaceImagen(evento.url)}
            style={{ cursor: "pointer" }}
          >
            <img src={avatar} className="w-4rem shadow-2 border-round" />
          </a>
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

  const validateComentar = (data) => {};

  const buscarSuscripcion = () => {
    setFechaSuscripcion("");
    setEvento("");
    setVisibleDialogoBuscar(true);
  };

  const comentarSuscripcion = (suscripcion) => {
    setPuntuacion(1);
    setComentario("");
    setSuscripcionActual(suscripcion);
    setVisibleDialogoComentar(true);
  };

  const confirmarEliminarSuscripcion = (suscripcion) => {
    setSuscripcionActual(suscripcion);
    setVisibleDialogoBorrado(true);
  };

  const ocultarDialogoBuscar = () => {
    setVisibleDialogoBuscar(false);
  };

  const ocultarDialogoComentar = () => {
    setVisibleDialogoComentar(false);
  };

  const ocultarDialogoBorrado = () => {
    setSuscripcionActual(suscripcionVacio);
    setVisibleDialogoBorrado(false);
  };

  const volverMisEventos = () => {
    navigate("/evento/evetosLayout");
  };

  //Recarga de página
  const reloadPage = () => {
    const datos = {
      idUsuario: idUsuario,
    };
    suscripcionService.buscarTodosParametros(datos).then(
      (res) => {
        setSuscripciones(res.data);
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
              onClick={buscarSuscripcion}
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
  const footer = `${suscripciones ? suscripciones.length : 0}${t(
    "footer.suscripciones"
  )}`;

  const onSubmitBuscar = (data, form) => {
    let fechaBuscar = "";
    if (fechaSuscripcion != "" && fechaSuscripcion != undefined) {
      fechaBuscar = convertirFechaGuiones(fechaSuscripcion);
    }

    const datos = {
      fechaSuscripcion: fechaBuscar,
      idEvento: evento,
      idUsuario: idUsuario,
    };

    suscripcionService.buscarTodosParametros(datos).then(
      (res) => {
        if (res.data && Array.isArray(res.data)) {
          setSuscripciones(res.data);
        } else {
          setSuscripciones([]);
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

  const onSubmitComentar = (data, form) => {
    const datos = {
      comentario: comentario,
      puntuacion: puntuacion,
      usuario: {
        id: suscripcionActual.usuario.id,
      },
      evento: {
        id: suscripcionActual.evento.id,
      },
    };

    comentarioService.crear(datos).then(
      (res) => {
        setShowMessageCrear(true);
        form.restart();
        ocultarDialogoComentar();
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

  const onSubmitEliminarSuscripcion = () => {
    suscripcionService.eliminar(suscripcionActual.id.toString()).then(
      () => {
        const suscripcionesActualizados = suscripciones.filter(
          (evento) => evento.id !== suscripcionActual.id
        );
        setSuscripciones(suscripcionesActualizados);
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

  const generarPDF = (rowData) => {
    let doc;
    const login = localStorage.getItem("login");
    const idioma = localStorage.getItem("idioma");
    const arrayDescripcion = dividirDescripcionEnArray(
      rowData.evento.descripcion
    );

    switch (idioma) {
      case "es":
        doc = new jsPDF();
        doc.setFont("italic");
        doc.setFontSize(25);
        doc.setTextColor(86, 189, 255);
        doc.text("Datos del evento", 30, 18);

        doc.setFontSize(15);
        doc.setTextColor(0, 0, 0);
        doc.line(10, 20, 140, 20);
        doc.addImage(logo, 140, 10, 50, 10);

        doc.text(`- Usuario inscrito: ${login}`, 20, 35);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `- Nombre de la categoría: ${rowData.evento.categoria.nombre}`,
          20,
          45
        );
        doc.setTextColor(0, 0, 0);
        doc.text(`- Nombre del evento: ${rowData.evento.nombre}`, 20, 55);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `- Plazas del evento: ${rowData.evento.numAsistentes}`,
          20,
          65
        );
        doc.setTextColor(0, 0, 0);
        doc.text(
          `- Número de inscritos: ${rowData.evento.numInscritos}`,
          20,
          75
        );
        doc.setTextColor(100, 100, 100);
        doc.text(
          `- Teléfono de contacto: ${rowData.evento.telefonoContacto}`,
          20,
          85
        );
        doc.setTextColor(0, 0, 0);
        doc.text(
          `- Email de contacto: ${rowData.evento.emailContacto}`,
          20,
          95
        );
        doc.setTextColor(100, 100, 100);
        doc.text(
          `- Tipo de asistencia: ${rowData.evento.tipoAsistencia}`,
          20,
          105
        );
        doc.setTextColor(0, 0, 0);
        doc.text(`- Descripción del evento:`, 20, 115, 0, 30);

        // Ejecutar el código para cada elemento del array
        arrayDescripcion.forEach((elemento, index) => {
          doc.text(elemento, 30, 125 + 10 * index, 0, 30);
        });

        doc.addImage(rowData.evento.imagenEvento, 140, 30, 50, 50);
        doc.line(10, 280, 200, 280);
        doc.text("Copyright 2023 Martín Gil Blanco - MEI", 60, 290);
        doc.save(`factura_${rowData.evento.nombre}_${login}.pdf`);
        break;
      case "ga":
        doc = new jsPDF();
        doc.setFont("italic");
        doc.setFontSize(25);
        doc.setTextColor(86, 189, 255);
        doc.text("Datos do evento", 30, 18);

        doc.setFontSize(15);
        doc.setTextColor(0, 0, 0);
        doc.line(10, 20, 140, 20);
        doc.addImage(logo, 140, 10, 50, 10);

        doc.text(`- Usuario inscrito: ${login}`, 20, 35);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `- Nome da categoría: ${rowData.evento.categoria.nombre}`,
          20,
          45
        );
        doc.setTextColor(0, 0, 0);
        doc.text(`- Nome do evento: ${rowData.evento.nombre}`, 20, 55);
        doc.setTextColor(100, 100, 100);
        doc.text(`- Plazas do evento: ${rowData.evento.numAsistentes}`, 20, 65);
        doc.setTextColor(0, 0, 0);
        doc.text(
          `- Número de inscritos: ${rowData.evento.numInscritos}`,
          20,
          75
        );
        doc.setTextColor(100, 100, 100);
        doc.text(
          `- Teléfono de contacto: ${rowData.evento.telefonoContacto}`,
          20,
          85
        );
        doc.setTextColor(0, 0, 0);
        doc.text(
          `- Email de contacto: ${rowData.evento.emailContacto}`,
          20,
          95
        );
        doc.setTextColor(100, 100, 100);
        doc.text(
          `- Tipo de asistencia: ${rowData.evento.tipoAsistencia}`,
          20,
          105
        );
        doc.setTextColor(0, 0, 0);
        doc.text(`- Descripción do evento:`, 20, 115, 0, 30);

        // Ejecutar el código para cada elemento del array
        arrayDescripcion.forEach((elemento, index) => {
          doc.text(elemento, 30, 125 + 10 * index, 0, 30);
        });

        doc.addImage(rowData.evento.imagenEvento, 140, 30, 50, 50);
        doc.line(10, 280, 200, 280);
        doc.text("Copyright 2023 Martín Gil Blanco - MEI", 60, 290);
        doc.save(`factura_${rowData.evento.nombre}_${login}.pdf`);
        break;
      case "en":
        doc = new jsPDF();
        doc.setFont("italic");
        doc.setFontSize(25);
        doc.setTextColor(86, 189, 255);
        doc.text("Event details", 30, 18);

        doc.setFontSize(15);
        doc.setTextColor(0, 0, 0);
        doc.line(10, 20, 140, 20);
        doc.addImage(logo, 140, 10, 50, 10);

        doc.text(`- Registered user: ${login}`, 20, 35);
        doc.setTextColor(100, 100, 100);
        doc.text(`- Event name: ${rowData.evento.nombre}`, 20, 45);
        doc.setTextColor(0, 0, 0);
        doc.text(
          `- Number of participants: ${rowData.evento.numInscritos}`,
          20,
          55
        );
        doc.setTextColor(100, 100, 100);
        doc.text(`- Category name: ${rowData.evento.categoria.nombre}`, 20, 65);
        doc.setTextColor(0, 0, 0);
        doc.text(`- Contact email: ${rowData.evento.emailContacto}`, 20, 75);
        doc.setTextColor(100, 100, 100);
        doc.text(`- Event capacity: ${rowData.evento.numAsistentes}`, 20, 85);
        doc.setTextColor(0, 0, 0);
        doc.text(`- Attendance type: ${rowData.evento.tipoAsistencia}`, 20, 95);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `- Contact phone: ${rowData.evento.telefonoContacto}`,
          20,
          105
        );
        doc.setTextColor(0, 0, 0);
        doc.text(`- Event description:`, 20, 115, 0, 30);

        // Ejecutar el código para cada elemento del array
        arrayDescripcion.forEach((elemento, index) => {
          doc.text(elemento, 30, 125 + 10 * index, 0, 30);
        });

        doc.addImage(rowData.evento.imagenEvento, 140, 30, 50, 50);
        doc.line(10, 280, 200, 280);
        doc.text("Copyright 2023 Martín Gil Blanco - MEI", 60, 290);
        doc.save(`factura_${rowData.evento.nombre}_${login}.pdf`);
        break;
      default:
        doc.save(`IDIOMA_NO_DISPONIBLE.pdf`);
    }
  };

  const dividirDescripcionEnArray = (descripcion) => {
    const palabras = descripcion.split(" ");
    const arrayResultado = [];
    while (palabras.length > 0) {
      const elementoArray = palabras.splice(0, 12).join(" ");
      arrayResultado.push(elementoArray);
    }
    return arrayResultado;
  };

  //Funciones de modal
  const ocultarDialogo = () => {
    setDialogoError(false);
  };

  const okeyMensajeCrear = () => {
    setShowMessageCrear(false);
  };

  const okeyMensajeEliminar = () => {
    setShowMessageEliminar(false);
  };

  //Acciones de una tupla de la tabla
  const accionesSuscripcion = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-comment"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.comentar")}
          onClick={() => comentarSuscripcion(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.eliminar")}
          onClick={() => confirmarEliminarSuscripcion(rowData)}
        />
        <Button
          icon="pi pi-file-pdf"
          className="p-button-rounded p-button-wrap"
          tooltip={t("botones.generarSuscripciónPDF")}
          onClick={() => generarPDF(rowData)}
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
        onClick={onSubmitEliminarSuscripcion}
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

  return (
    <div className="card">
      <div>
        <DataTable
          value={suscripciones}
          paginator
          rows={2}
          header={header}
          filters={filters}
          onFilter={(e) => setFilters(e.filters)}
          footer={footer}
          tableStyle={{ minWidth: "60rem" }}
        >
          <Column
            field="imagenEvento"
            header={t("columnas.imagenEnlace")}
            body={imagenEvento}
          ></Column>
          <Column
            field={nombreEvento}
            header={t("columnas.evento")}
            sortable
          ></Column>
          <Column
            field={formatoFechaSuscripcion}
            header={t("columnas.fechaSuscripcion")}
            sortable
          ></Column>
          <Column
            field={formatoFechaEvento}
            header={t("columnas.fechaEvento")}
            sortable
          ></Column>
          <Column
            field={direccionEvento}
            header={t("columnas.direccion")}
            sortable
          ></Column>
          <Column
            field={emailEvento}
            header={t("columnas.email")}
            sortable
          ></Column>
          <Column
            field={telefonoEvento}
            header={t("columnas.telefono")}
            sortable
          ></Column>
          <Column header={t("columnas.acciones")} body={accionesSuscripcion} />
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
            initialValues={suscripcionVacio}
            validate={validateBuscar}
            render={({ handleSubmit }) => (
              <form
                className=" text-xl p-fluid formGestion"
                onSubmit={handleSubmit}
              >
                <Field
                  name="fechaSuscripcion"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Calendar
                            id="fechaSuscripcion"
                            value={fechaSuscripcion}
                            name="fechaSuscripcion"
                            placeholder={t("suscripcion.fechaSuscripcion")}
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
                            onChange={(e) => setFechaSuscripcion(e.value)}
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />

                <Field
                  name="evento"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Dropdown
                            id="evento"
                            value={evento}
                            placeholder={t("suscripcion.nombreEvento")}
                            showClear
                            name="evento"
                            options={eventoOptions}
                            onChange={(e) => setEvento(e.value)}
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
        visible={visibleDialogoComentar}
        style={{ width: "450px" }}
        header={t("mensajes.tituloModalComentar")}
        modal
        onHide={ocultarDialogoComentar}
      >
        <div className="flex align-items-center justify-content-center">
          <Form
            onSubmit={onSubmitComentar}
            initialValues={comentarioVacio}
            validate={validateComentar}
            render={({ handleSubmit }) => (
              <form
                className=" text-xl p-fluid formGestion"
                onSubmit={handleSubmit}
              >
                <InputTextarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Comenta el evento y puntualo"
                  rows={5}
                  cols={30}
                  required
                  className="mb-2 ml-2 mr-2"
                />
                <Rating
                  value={puntuacion}
                  onChange={(e) => setPuntuacion(e.value)}
                  cancel={false}
                  required
                  className="mb-2 ml-2"
                />
                <div className="col">
                  <Button
                    type="submit"
                    label={t("botones.comentar")}
                    icon="pi pi-comment"
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
          {suscripcionActual && (
            <span>{t("mensajes.preguntaModalBorradoSuscripcion")}</span>
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
          <h4>{t("mensajes.creacionComentario")}</h4>
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
