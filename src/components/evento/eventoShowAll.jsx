import React, { useState, useEffect } from "react";
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
import autenticacionService from "../../services/autenticacionService";
import usuarioService from "../../services/usuarioService";
import eventoService from "../../services/eventoService";
import axios from "axios";
import avatar from "./../recursos/imagenes/avatar.png";

export default function EventoShowAll() {
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
    borradoLogico: "",
  };
  const pathname = window.location.pathname; // Obtén la parte de la URL
  const parts = pathname.split("/"); // Separa la parte de la URL en partes usando '/'
  const numero = parseInt(parts[parts.length - 1], 10); // Obtén el último elemento en número entero
  const [eventos, setEventos] = useState([]);
  const [t, i18n] = useTranslation("global");
  const [fecha, setFecha] = useState(new Date());
  const navigate = useNavigate();
  const [showMessageCrear, setShowMessageCrear] = useState(false);
  const [showMessageEditar, setShowMessageEditar] = useState(false);
  const [showMessageEliminar, setShowMessageEliminar] = useState(false);
  const [dialogoError, setDialogoError] = useState(false);
  const tipoAsistenciaOptions = [
    { label: <a>{t("evento.publico")}</a>, value: "PUBLICO" },
    { label: <a>{t("evento.privado")}</a>, value: "PRIVADO" },
  ];
  const estadoOptions = [
    { label: <a>{t("evento.abierto")}</a>, value: "ABIERTO" },
    { label: <a>{t("evento.cerrado")}</a>, value: "CERRADO" },
  ];
  const [resMessage, setResMessage] = useState("");
  const [eventoActual, setEventoActual] = useState(eventoVacio);
  const [visibleDialogoCrear, setVisibleDialogoCrear] = useState(false);
  const [visibleDialogoBuscar, setVisibleDialogoBuscar] = useState(false);
  const [visibleDialogoEditar, setVisibleDialogoEditar] = useState(false);
  const [visibleDialogoSubirImagen, setVisibleDialogoSubirImagen] =
    useState(false);
  const [file, setFile] = useState();
  const [tipoAsistencia, setTipoAsistencia] = useState([" "]);
  const [gerenteOptions, setGerenteOptions] = useState([" "]);
  const [usuario, setUsuario] = useState([" "]);
  const [estado, setEstado] = useState([" "]);
  const [gerente, setGerente] = useState([" "]);
  const [visibleDialogoVerEnDetalle, setVisibleDialogoVerEnDetalle] =
    useState(false);
  const [visibleDialogoBorrado, setVisibleDialogoBorrado] = useState(false);
  const [borradoLogico, setBorradoLogico] = useState([""]);
  const borradoLogicoOptions = [
    { label: <a>{t("usuario.activo")}</a>, value: "0" },
    { label: <a>{t("usuario.inactivo")}</a>, value: "1" },
  ];
  const [visibleDialogoReactivarEvento, setVisibleDialogoReactivarEvento] =
    useState(false);

  useEffect(() => {
    if (JSON.parse(localStorage.getItem("user")).rol === "ROLE_ADMINISTRADOR") {
      eventoService.buscarEventosCategoria(numero).then((res) => {
        setEventos(res.data);
      });
    } else {
      autenticacionService.logout();
      navigate("/");
      window.location.reload();
    }
  }, []);

  useEffect(() => {
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
  }, [gerente]);

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
              onClick={crearEvento}
            />
            <Button
              icon="pi pi-search"
              className="p-button-rounded"
              tooltip={t("botones.buscar")}
              onClick={buscarEvento}
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

  function convertirFecha(fechaTexto) {
    const fecha = new Date(fechaTexto);

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    const fechaFormateada = `${año}-${mes}-${dia}`;

    return fechaFormateada;
  }

  function cambiarFormatoFecha(fecha) {
    // Dividir la fecha en año, mes y día
    var partes = fecha.split("-");
    var year = partes[0];
    var month = partes[1];
    var day = partes[2];
    // Crear la fecha en el formato deseado (DD/MM/YYYY)
    var fechaFormateada = day + "/" + month + "/" + year;
    return fechaFormateada;
  }

  const formatoEstado = (usuario) => {
    const idioma = localStorage.getItem("idioma");
    switch (usuario.borradoLogico) {
      case "0":
        if (idioma == "es") {
          return "Activo";
        } else if (idioma == "en") {
          return "Activo";
        } else if (idioma == "ga") {
          return "Active";
        } else {
          return "Activo";
        }
      case "1":
        if (idioma == "es") {
          return "Inactivo";
        } else if (idioma == "en") {
          return "Inactivo";
        } else if (idioma == "ga") {
          return "Inactive";
        } else {
          return "Inactivo";
        }
    }
  };

  const header = renderHeader();

  const footer = `${eventos ? eventos.length : 0}${t("footer.eventos")}`;

  const imagenEvento = (evento) => {
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

  const validateCrear = (data) => {
    let errors = {};
    var patronNombre = /^[A-Za-z0-9_áéíóúñÁÉÍÓÚÑ., ]+$/;
    var patronDescripcion = /^[A-Za-z0-9_áéíóúñÁÉÍÓÚÑ., ]+$/;
    var patronNum = /^[0-9]+$/;
    var patronDireccion = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ/ºª,.;: ]+$/;
    var patronEmailContacto =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    var patronUrl = /^(http|https):\/\/[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

    //nombre
    if (!data.nombre) {
      errors.nombre = <p>{t("evento.validaciones.nombreVacio")}</p>;
    } else if (!patronNombre.test(data.nombre)) {
      errors.nombre = (
        <p>{t("evento.validaciones.nombreInvalidoAlfanumerico")}</p>
      );
    } else if (data.nombre.length > 30) {
      errors.nombre = (
        <p>{t("evento.validaciones.nombreEventoInvalidoTamañoMax")}</p>
      );
    } else if (data.nombre.length < 3) {
      errors.nombre = (
        <p>{t("evento.validaciones.nombreEventoInvalidoTamañoMin")}</p>
      );
    }

    //descripcion
    if (!data.descripcion) {
      errors.descripcion = <p>{t("evento.validaciones.descripcionVacio")}</p>;
    } else if (!patronDescripcion.test(data.descripcion)) {
      errors.descripcion = (
        <p>{t("evento.validaciones.descripcionEventoInvalidoAlfanumerico")}</p>
      );
    } else if (data.descripcion.length > 255) {
      errors.descripcion = (
        <p>{t("evento.validaciones.descripcionEventoInvalidoTamañoMax")}</p>
      );
    } else if (data.descripcion.length < 3) {
      errors.descripcion = (
        <p>{t("evento.validaciones.descripcionEventoInvalidoTamañoMin")}</p>
      );
    }

    //numAsistentes
    if (!data.numAsistentes) {
      errors.numAsistentes = (
        <p>{t("evento.validaciones.numAsistentesVacio")}</p>
      );
    } else if (!patronNum.test(data.numAsistentes)) {
      errors.numAsistentes = (
        <p>{t("evento.validaciones.numAsistentesEventoInvalidoNumerico")}</p>
      );
    }

    //direccion
    if (!data.direccion) {
      errors.direccion = <p>{t("evento.validaciones.direccionVacio")}</p>;
    } else if (!patronDireccion.test(data.direccion)) {
      errors.direccion = (
        <p>{t("evento.validaciones.direccionEventoInvalidoAlfanumerico")}</p>
      );
    } else if (data.direccion.length > 50) {
      errors.direccion = (
        <p>{t("evento.validaciones.direccionEventoInvalidoTamañoMax")}</p>
      );
    } else if (data.direccion.length < 5) {
      errors.direccion = (
        <p>{t("evento.validaciones.direccionEventoInvalidoTamañoMin")}</p>
      );
    }

    //emailContacto
    if (!data.emailContacto) {
      errors.emailContacto = <p>{t("evento.validaciones.emailVacio")}</p>;
    } else if (!patronEmailContacto.test(data.emailContacto)) {
      errors.emailContacto = <p>{t("evento.validaciones.emailInvalido")}</p>;
    } else if (data.emailContacto.length > 40) {
      errors.emailContacto = (
        <p>{t("evento.validaciones.emailInvalidoTamañoMax")}</p>
      );
    } else if (data.emailContacto.length < 3) {
      errors.emailContacto = (
        <p>{t("evento.validaciones.emailInvalidoTamañoMin")}</p>
      );
    }

    //telefonoContacto
    if (!data.telefonoContacto) {
      errors.telefonoContacto = (
        <p>{t("evento.validaciones.telefonoContactoVacio")}</p>
      );
    } else if (!patronNum.test(data.telefonoContacto)) {
      errors.telefonoContacto = (
        <p>{t("evento.validaciones.telefonoContactoFormato")}</p>
      );
    } else if (data.telefonoContacto.length > 9) {
      errors.telefonoContacto = (
        <p>{t("evento.validaciones.telefonoContactoFormato")}</p>
      );
    } else if (data.telefonoContacto.length < 9) {
      errors.telefonoContacto = (
        <p>{t("evento.validaciones.telefonoContactoFormato")}</p>
      );
    }

    //url
    if (!patronUrl.test(data.url)) {
      errors.url = <p>{t("evento.validaciones.urlFormato")}</p>;
    }

    return errors;
  };

  const validateEditar = (data) => {
    let errors = {};
    var patronNombre = /^[A-Za-z0-9_áéíóúñÁÉÍÓÚÑ., ]+$/;
    var patronDescripcion = /^[A-Za-z0-9_áéíóúñÁÉÍÓÚÑ., ]+$/;
    var patronNum = /^[0-9]+$/;
    var patronDireccion = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ/ºª,.;: ]+$/;
    var patronEmailContacto =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    //nombre
    if (!data.nombre) {
      errors.nombre = <p>{t("evento.validaciones.nombreVacio")}</p>;
    } else if (!patronNombre.test(data.nombre)) {
      errors.nombre = (
        <p>{t("evento.validaciones.nombreInvalidoAlfanumerico")}</p>
      );
    } else if (data.nombre.length > 30) {
      errors.nombre = (
        <p>{t("evento.validaciones.nombreEventoInvalidoTamañoMax")}</p>
      );
    } else if (data.nombre.length < 3) {
      errors.nombre = (
        <p>{t("evento.validaciones.nombreEventoInvalidoTamañoMin")}</p>
      );
    }

    //descripcion
    if (!data.descripcion) {
      errors.descripcion = <p>{t("evento.validaciones.descripcionVacio")}</p>;
    } else if (!patronDescripcion.test(data.descripcion)) {
      errors.descripcion = (
        <p>{t("evento.validaciones.descripcionEventoInvalidoAlfanumerico")}</p>
      );
    } else if (data.descripcion.length > 255) {
      errors.descripcion = (
        <p>{t("evento.validaciones.descripcionEventoInvalidoTamañoMax")}</p>
      );
    } else if (data.descripcion.length < 3) {
      errors.descripcion = (
        <p>{t("evento.validaciones.descripcionEventoInvalidoTamañoMin")}</p>
      );
    }

    //numAsistentes
    if (!data.numAsistentes) {
      errors.numAsistentes = (
        <p>{t("evento.validaciones.numAsistentesVacio")}</p>
      );
    } else if (!patronNum.test(data.numAsistentes)) {
      errors.numAsistentes = (
        <p>{t("evento.validaciones.numAsistentesEventoInvalidoNumerico")}</p>
      );
    }

    //direccion
    if (!data.direccion) {
      errors.direccion = <p>{t("evento.validaciones.direccionVacio")}</p>;
    } else if (!patronDireccion.test(data.direccion)) {
      errors.direccion = (
        <p>{t("evento.validaciones.direccionEventoInvalidoAlfanumerico")}</p>
      );
    } else if (data.direccion.length > 50) {
      errors.direccion = (
        <p>{t("evento.validaciones.direccionEventoInvalidoTamañoMax")}</p>
      );
    } else if (data.direccion.length < 5) {
      errors.direccion = (
        <p>{t("evento.validaciones.direccionEventoInvalidoTamañoMin")}</p>
      );
    }

    //emailContacto
    if (!data.emailContacto) {
      errors.emailContacto = <p>{t("evento.validaciones.emailVacio")}</p>;
    } else if (!patronEmailContacto.test(data.emailContacto)) {
      errors.emailContacto = <p>{t("evento.validaciones.emailInvalido")}</p>;
    } else if (data.emailContacto.length > 40) {
      errors.emailContacto = (
        <p>{t("evento.validaciones.emailInvalidoTamañoMax")}</p>
      );
    } else if (data.emailContacto.length < 3) {
      errors.emailContacto = (
        <p>{t("evento.validaciones.emailInvalidoTamañoMin")}</p>
      );
    }

    //telefonoContacto
    if (!data.telefonoContacto) {
      errors.telefonoContacto = (
        <p>{t("evento.validaciones.telefonoContactoVacio")}</p>
      );
    } else if (!patronNum.test(data.telefonoContacto)) {
      errors.telefonoContacto = (
        <p>{t("evento.validaciones.telefonoContactoFormato")}</p>
      );
    } else if (data.telefonoContacto.length > 9) {
      errors.telefonoContacto = (
        <p>{t("evento.validaciones.telefonoContactoFormato")}</p>
      );
    } else if (data.telefonoContacto.length < 9) {
      errors.telefonoContacto = (
        <p>{t("evento.validaciones.telefonoContactoFormato")}</p>
      );
    }

    return errors;
  };

  function crearEvento() {
    setTipoAsistencia("");
    setFecha("");
    setEstado("");
    setUsuario("");
    setTipoAsistencia();
    setVisibleDialogoCrear(true);
  }

  function buscarEvento() {
    setTipoAsistencia("");
    setFecha("");
    setEstado("");
    setUsuario("");
    setBorradoLogico([""]);
    setVisibleDialogoBuscar(true);
  }

  function editarEvento(evento) {
    setEventoActual(evento);
    setTipoAsistencia(evento.tipoAsistencia);
    setEstado(evento.estado);
    setVisibleDialogoEditar(true);
  }

  function confirmarReactivarEvento(evento) {
    evento.borradoLogico = "0";
    setEventoActual(evento);
    setVisibleDialogoReactivarEvento(true);
  }

  const comentariosEvento = (evento) => {
    navigate("/evento/comentarios/" + evento.id.toString());
  };

  function subirImagen(evento) {
    setEventoActual(evento);
    setVisibleDialogoSubirImagen(true);
  }

  function confirmarVerEnDetalleEvento(evento) {
    setEventoActual(evento);
    setVisibleDialogoVerEnDetalle(true);
  }

  function confirmarEliminarEvento(evento) {
    setEventoActual(evento);
    setVisibleDialogoBorrado(true);
  }

  function mostrarPDF(evento) {
    window.open(evento.documentoEvento, "_blank");
  }

  function ocultarDialogoCrear() {
    setVisibleDialogoCrear(false);
  }

  function ocultarDialogoBuscar() {
    setVisibleDialogoBuscar(false);
  }

  function ocultarDialogoEditar() {
    setVisibleDialogoEditar(false);
  }

  function ocultarDialogoSubirImagen() {
    setVisibleDialogoSubirImagen(false);
  }

  function ocultarDialogoVerEnDetalle() {
    setVisibleDialogoVerEnDetalle(false);
  }

  function ocultarDialogoBorrado() {
    setEventoActual(eventoVacio);
    setVisibleDialogoBorrado(false);
  }

  function ocultarDialogoReactivarEvento() {
    setVisibleDialogoReactivarEvento(false);
  }

  const onSubmitCrear = (data, form) => {
    const pathname = window.location.pathname;
    const parts = pathname.split("/");
    const idCategoria = parseInt(parts[parts.length - 1], 10);

    const datos = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      tipoAsistencia: tipoAsistencia,
      numAsistentes: data.numAsistentes,
      numInscritos: data.numInscritos,
      estado: data.estado,
      fechaEvento: convertirFecha(fecha),
      direccion: data.direccion,
      emailContacto: data.emailContacto,
      telefonoContacto: data.telefonoContacto,
      categoria: {
        id: idCategoria,
      },
      usuario: {
        id: usuario,
      },
      imagenEvento: data.imagenEvento,
      url: data.url,
      borradoLogico: "0",
    };

    eventoService.crear(datos).then(
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
    const pathname = window.location.pathname;
    const parts = pathname.split("/");
    const idCategoria = parseInt(parts[parts.length - 1], 10);
    let fechaBuscar = "";

    if (fecha != "" && fecha != undefined) {
      fechaBuscar = convertirFecha(fecha);
    }

    if (borradoLogico != "") {
      data[`borradoLogico`] = borradoLogico;
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
      borradoLogico: data[`borradoLogico`],
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

  const onSubmitEditar = (data, form) => {
    const pathname = window.location.pathname;
    const parts = pathname.split("/");
    const idCategoria = parseInt(parts[parts.length - 1], 10);

    const datos = {
      id: data.id,
      nombre: data.nombre,
      descripcion: data.descripcion,
      tipoAsistencia: tipoAsistencia,
      numAsistentes: data.numAsistentes,
      numInscritos: data.numInscritos,
      estado: estado,
      fechaEvento: convertirFecha(fecha),
      direccion: data.direccion,
      emailContacto: data.emailContacto,
      telefonoContacto: data.telefonoContacto,
      categoria: {
        id: idCategoria,
      },
      usuario: {
        id: data.usuario.id,
      },
      imagenEvento: data.imagenEvento,
      url: data.url,
      borradoLogico: "0",
    };

    eventoService.modificar(datos.id.toString(), datos).then(
      () => {
        setShowMessageEditar(true);
        form.restart();
        ocultarDialogoEditar();
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

  function onSubmitReactivar() {
    eventoActual.borradoLogico = "0";
    eventoService.modificar(eventoActual.id.toString(), eventoActual).then(
      () => {
        reloadPage();
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.usuarioActual &&
            error.response.usuarioActual.codigo) ||
          error.message ||
          error.toString();
        setResMessage(resMessage);
        setDialogoError(true);
      }
    );
    ocultarDialogoReactivarEvento();
  }

  function onSubmitSubirImagen(event) {
    event.preventDefault();
    const fileExtension = file.name.split(".").pop().toLowerCase();

    const formData = new FormData();
    const idEvento = eventoActual.id;
    const user = JSON.parse(localStorage.getItem("user"));

    formData.append("file", file);
    formData.append("fileName", file.name);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
        login: user.login,
        id: idEvento,
        Authorization: "Bearer " + user.token,
      },
    };

    if (fileExtension !== "pdf") {
      const url = "http://localhost:8080/api/evento/uploadImagenEvento";
      cargarImagenAlServidor(url, formData, config);
      ocultarDialogoSubirImagen();
    } else {
      const url = "http://localhost:8080/api/evento/uploadDocumentoEvento";
      cargarDocumentoAlServidor(url, formData, config);
      ocultarDialogoSubirImagen();
    }
  }

  function cargarImagenAlServidor(url, formData, config) {
    axios.post(url, formData, config).then((response) => {
      const eventoConImagen = eventoActual;
      eventoConImagen.imageEvento = response.data.texto;
      setEventoActual(eventoConImagen);
      reloadPage();
    });
  }

  function cargarDocumentoAlServidor(url, formData, config) {
    axios.post(url, formData, config).then((response) => {
      reloadPage();
    });
  }

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  function onSubmitEliminarEvento() {
    eventoService.eliminar(eventoActual.id.toString()).then(
      () => {
        const eventosActualizados = eventos.filter(
          (evento) => evento.id !== eventoActual.id
        );
        setEventos(eventosActualizados);
        setShowMessageEliminar(true);
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
    ocultarDialogoBorrado();
  }

  function reloadPage() {
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
  }

  const formatoFecha = (rowData) => {
    const fechaOriginal = rowData.fechaEvento; // Supongamos que la fecha está en el formato 'YYYY-MM-DD'
    const fecha = new Date(fechaOriginal);

    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Los meses en JavaScript se cuentan desde 0, así que sumamos 1
    const anio = fecha.getFullYear();

    // Formateamos la fecha en el formato 'DD/MM/YYYY'
    const fechaFormateada = `${dia}/${mes}/${anio}`;

    return fechaFormateada;
  };

  const formatoTipoAsistencia = (rowData) => {
    const idioma = localStorage.getItem("idioma");
    const tipoAsistencia = rowData.tipoAsistencia;

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

  const formatoEstadoAbiertoCerrado = (rowData) => {
    const idioma = localStorage.getItem("idioma");
    const estado = rowData.estado;

    switch (estado) {
      case "ABIERTO":
        switch (idioma) {
          case "es":
            return "Abierto";
          case "ga":
            return "Aberto";
          case "en":
            return "Open";
          default:
            return "Abierto";
        }

      case "CERRADO":
        switch (idioma) {
          case "es":
            return "Cerrado";
          case "ga":
            return "Pechado";
          case "en":
            return "Close";
          default:
            return "Cerrado";
        }

      default:
        return estado;
    }
  };

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
        onClick={onSubmitEliminarEvento}
      />
    </div>
  );

  const pieDialogoReactivar = (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Button
        label={t("mensajes.no")}
        icon="pi pi-times"
        className="p-button-text"
        onClick={ocultarDialogoReactivarEvento}
      />
      <Button
        label={t("mensajes.si")}
        icon="pi pi-check"
        className="p-button-text"
        onClick={onSubmitReactivar}
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

  const dialogFooterEditar = (
    <div className="flex justify-content-center">
      <Button
        label="OK"
        className="p-button-text"
        autoFocus
        onClick={okeyMensajeEditar}
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

  function okeyMensajeEditar() {
    setShowMessageEditar(false);
  }

  function okeyMensajeEliminar() {
    setShowMessageEliminar(false);
  }

  function accionesEvento(rowData) {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.editar")}
          onClick={() => editarEvento(rowData)}
        />
        <Button
          icon="pi pi-upload"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.subirImagenDocumento")}
          onClick={() => subirImagen(rowData)}
        />
        <Button
          icon="pi pi-file"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.verEnDetalle")}
          onClick={() => confirmarVerEnDetalleEvento(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.eliminar")}
          onClick={() => confirmarEliminarEvento(rowData)}
        />
        {rowData.documentoEvento !== null && (
          <Button
            icon="pi pi-file-pdf"
            className="p-button-rounded p-button-wrap mr-2"
            tooltip={t("botones.pdfInteres")}
            onClick={() => mostrarPDF(rowData)}
          />
        )}
        {rowData.borradoLogico === "1" && (
          <Button
            icon="pi pi-heart"
            className="p-button-rounded p-button-wrap mr-2"
            tooltip={t("botones.reactivar")}
            onClick={() => confirmarReactivarEvento(rowData)}
          />
        )}
        <Button
          icon="pi pi-comments"
          className="p-button-rounded p-button-wrap"
          tooltip={t("botones.comentariosEvento")}
          onClick={() => comentariosEvento(rowData)}
        />
      </React.Fragment>
    );
  }

  return (
    <div className="card">
      <div>
        <h2 className="tituloTablas">{t("main.gestionEventosTabla")}</h2>
        <DataTable
          value={eventos}
          paginator
          rows={5}
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
            field="nombre"
            header={t("columnas.nombre")}
            sortable
          ></Column>
          <Column
            field={formatoEstadoAbiertoCerrado}
            header={t("columnas.tipoAsistencia")}
            sortable
          ></Column>
          <Column
            field={formatoTipoAsistencia}
            header={t("columnas.tipoAsistencia")}
            sortable
          ></Column>
          <Column
            field={formatoFecha}
            header={t("columnas.fechaEvento")}
            sortable
          ></Column>
          <Column
            field="direccion"
            header={t("columnas.direccion")}
            sortable
          ></Column>
          <Column
            field={formatoEstado}
            header={t("columnas.estado")}
            sortable
          ></Column>
          <Column header={t("columnas.acciones")} body={accionesEvento} />
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
            initialValues={eventoVacio}
            validate={validateCrear}
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
                          <InputTextarea
                            id="descripcion"
                            {...input}
                            placeholder={t("evento.descripcion")}
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
                            required
                            filter
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
                            required
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />

                <Field
                  name="numAsistentes"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="numAsistentes"
                            {...input}
                            placeholder={t("evento.numAsistentes")}
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
                            required
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
                  name="emailContacto"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="emailContacto"
                            {...input}
                            placeholder={t("evento.emailContacto")}
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
                  name="telefonoContacto"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="telefonoContacto"
                            {...input}
                            placeholder={t("evento.telefonoContacto")}
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
                  name="url"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="url"
                            {...input}
                            placeholder={t("evento.url")}
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
                          <InputTextarea
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
                            filter
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />

                <Field
                  name="estado"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Dropdown
                            id="estado"
                            value={estado}
                            placeholder={t("evento.estado")}
                            showClear
                            name="estado"
                            options={estadoOptions}
                            onChange={(e) => setEstado(e.value)}
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />

                <Field
                  name="numAsistentes"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="numAsistentes"
                            {...input}
                            placeholder={t("evento.numAsistentes")}
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
                <Field
                  name="borradoLogico"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Dropdown
                            value={borradoLogico}
                            id="borradoLogico"
                            placeholder={t("evento.borradoLogico")}
                            showClear
                            name="borradoLogico"
                            options={borradoLogicoOptions}
                            onChange={(e) => setBorradoLogico(e.value)}
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
        visible={visibleDialogoEditar}
        style={{ width: "450px" }}
        header={t("mensajes.tituloModalEditar")}
        modal
        onHide={ocultarDialogoEditar}
      >
        <div className="flex align-items-center justify-content-center">
          <Form
            onSubmit={onSubmitEditar}
            initialValues={eventoActual}
            validate={validateEditar}
            render={({ handleSubmit }) => (
              <form
                className=" text-xl p-fluid formGestion"
                onSubmit={handleSubmit}
              >
                <Field
                  name="nombre"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="nombre">{t("evento.nombre")}</label>
                      </div>
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="nombre"
                            {...input}
                            placeholder={t("evento.nombre")}
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
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="descripcion">
                          {t("evento.descripcion")}
                        </label>
                      </div>
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputTextarea
                            id="descripcion"
                            {...input}
                            placeholder={t("evento.descripcion")}
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
                  name="tipoAsistencia"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="tipoAsistencia">
                          {t("evento.tipoAsistencia")}
                        </label>
                      </div>
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Dropdown
                            value={tipoAsistencia}
                            id="desplegableAsistencia"
                            name="tipoAsistencia"
                            options={tipoAsistenciaOptions}
                            onChange={(e) => setTipoAsistencia(e.value)}
                            required
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />

                <Field
                  name="estado"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="estado">{t("evento.estado")}</label>
                      </div>
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Dropdown
                            value={estado}
                            id="desplegableAsistencia"
                            name="estado"
                            options={estadoOptions}
                            onChange={(e) => setEstado(e.value)}
                            required
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />

                <Field
                  name="numAsistentes"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="numAsistentes">
                          {t("evento.numAsistentes")}
                        </label>
                      </div>
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="numAsistentes"
                            {...input}
                            placeholder={t("evento.numAsistentes")}
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
                  name="fechaEvento"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="fechaEvento">
                          {t("evento.fechaEvento")}
                        </label>
                      </div>
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Calendar
                            onChange={(e) => setFecha(e.value)}
                            id="fechaEvento"
                            name="fechaEvento"
                            placeholder={cambiarFormatoFecha(
                              eventoActual.fechaEvento
                            )}
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
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="direccion">
                          {t("evento.direccion")}
                        </label>
                      </div>
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="direccion"
                            {...input}
                            placeholder={t("evento.direccion")}
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
                  name="usuario.nombre"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="gerente">{t("evento.gerente")}</label>
                      </div>
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="usuario"
                            {...input}
                            placeholder={t("evento.usuario")}
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
                  name="emailContacto"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="emailContacto">
                          {t("evento.emailContacto")}
                        </label>
                      </div>
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="emailContacto"
                            {...input}
                            placeholder={t("evento.emailContacto")}
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
                  name="telefonoContacto"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="telefonoContacto">
                          {t("evento.telefonoContacto")}
                        </label>
                      </div>
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="telefonoContacto"
                            {...input}
                            placeholder={t("evento.telefonoContacto")}
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
                  name="url"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="telefonoContacto">
                          {t("evento.url")}
                        </label>
                      </div>
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="url"
                            {...input}
                            placeholder={t("evento.url")}
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
                    label={t("botones.editar")}
                    icon="pi pi-pencil"
                    className="p-button-outlined mr-2"
                  />
                </div>
              </form>
            )}
          />
        </div>
      </Dialog>
      <Dialog
        visible={visibleDialogoSubirImagen}
        style={{ width: "450px" }}
        header={t("mensajes.tituloModalSubirImagenDocumento")}
        modal
        onHide={ocultarDialogoSubirImagen}
      >
        <div className="card flex justify-content-center cargarImagen">
          <form onSubmit={onSubmitSubirImagen}>
            <Button
              type="submit"
              className="p-button-rounded p-button-wrap mr-2"
              label={t("botones.subirImagenDocumento")}
              icon="pi pi-upload"
            />
            <input
              type="file"
              id="file"
              className="inputSeleccionarArchivo"
              onChange={handleChange}
            />
            <br></br>
            <label htmlFor="file" id="file" className="labelSeleccionarArchivo">
              {t("botones.seleccionarArchivo")}
            </label>
          </form>
        </div>
      </Dialog>
      <Dialog
        visible={visibleDialogoVerEnDetalle}
        style={{ width: "450px" }}
        header={t("mensajes.tituloModalVerEnDetalle")}
        modal
        onHide={ocultarDialogoVerEnDetalle}
      >
        <div className="formGestion">
          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="nombre">{t("evento.nombre")}</label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText
                    className="tamanhoInput"
                    value={eventoActual.nombre}
                  />
                </div>
              </span>
            </div>
          </div>

          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="descripcion">{t("evento.descripcion")}</label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputTextarea
                    className="tamanhoInput"
                    value={eventoActual.descripcion}
                  />
                </div>
              </span>
            </div>
          </div>
        </div>

        <div className="formGestion">
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
                    value={eventoActual.estado}
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

        <div className="formGestion">
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
        </div>

        <div className="formGestion">
          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="gerente">{t("evento.gerente")}</label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText
                    className="tamanhoInput"
                    value={eventoActual.usuario.nombre}
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
        </div>

        <div className="flex align-items-center justify-content-center">
          <div className="field ">
            <div className="p-field px-5 py-1 text-900 ">
              <label htmlFor="telefonoContacto">
                {t("evento.telefonoContacto")}
              </label>
            </div>
            <span className="p-float-label">
              <div className="p-field px-5 text-900 ">
                <InputText
                  className="tamanhoInput"
                  value={eventoActual.telefonoContacto}
                />
              </div>
            </span>
          </div>
        </div>

        <div className="flex align-items-center justify-content-center">
          <div className="field ">
            <div className="p-field px-5 py-1 text-900 ">
              <label htmlFor="url">{t("evento.url")}</label>
            </div>
            <span className="p-float-label">
              <div className="p-field px-5 text-900 ">
                <InputText className="tamanhoInput" value={eventoActual.url} />
              </div>
            </span>
          </div>
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
          {eventoActual && (
            <span>
              {t("mensajes.preguntaModalBorrado")} <b>{eventoActual.nombre}</b>?
            </span>
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
        visible={showMessageEditar}
        onHide={() => setShowMessageEditar(false)}
        position="center"
        footer={dialogFooterEditar}
        showHeader={false}
        breakpoints={{ "960px": "80vw" }}
        style={{ width: "30vw" }}
      >
        <div className="flex align-items-center flex-column pt-6 px-3">
          <i
            className="pi pi-check-circle"
            style={{ fontSize: "5rem", color: "var(--green-500)" }}
          ></i>
          <h4>{t("mensajes.edicionElemento")}</h4>
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
        visible={visibleDialogoReactivarEvento}
        style={{ width: "450px" }}
        header={t("mensajes.tituloModalReactivar")}
        modal
        footer={pieDialogoReactivar}
        onHide={ocultarDialogoReactivarEvento}
      >
        <div className="flex align-items-center justify-content-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {eventoActual && (
            <span>
              {t("mensajes.preguntaModalReactivar")}{" "}
              <b>{eventoActual.nombre}</b>?
            </span>
          )}
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
