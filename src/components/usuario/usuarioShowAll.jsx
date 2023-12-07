import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Password } from "primereact/password";
import { InputText } from "primereact/inputtext";
import { useTranslation } from "react-i18next";
import { Divider } from "primereact/divider";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Form, Field } from "react-final-form";
import { classNames } from "primereact/utils";
import autenticacionService from "../../services/autenticacionService";
import usuarioService from "../../services/usuarioService";
import axios from "axios";
import avatar from "./../recursos/imagenes/avatar.png";
import Paises from "../recursos/paises";

export default function UsuarioShowAll() {
  const usuarioVacio = {
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
  const [usuarios, setUsuarios] = useState([]);
  const [t, i18n] = useTranslation("global");
  const navigate = useNavigate();
  const [showMessageCrear, setShowMessageCrear] = useState(false);
  const [showMessageEditar, setShowMessageEditar] = useState(false);
  const [showMessageCambiarPassword, setShowMessageCambiarPassword] =
    useState(false);
  const [showMessageEliminar, setShowMessageEliminar] = useState(false);
  const [dialogoError, setDialogoError] = useState(false);
  const [resMessage, setResMessage] = useState("");
  const [usuarioActual, setUsuarioActual] = useState(usuarioVacio);
  const [visibleDialogoCrear, setVisibleDialogoCrear] = useState(false);
  const [visibleDialogoBuscar, setVisibleDialogoBuscar] = useState(false);
  const [visibleDialogoEditar, setVisibleDialogoEditar] = useState(false);
  const [visibleDialogoCambiarPassword, setVisibleDialogoCambiarPassword] =
    useState(false);
  const [visibleDialogoSubirImagen, setVisibleDialogoSubirImagen] =
    useState(false);
  const [visibleDialogoReactivarUsuario, setVisibleDialogoReactivarUsuario] =
    useState(false);
  const [file, setFile] = useState();
  const [visibleDialogoVerEnDetalle, setVisibleDialogoVerEnDetalle] =
    useState(false);
  const [visibleDialogoBorrado, setVisibleDialogoBorrado] = useState(false);
  const paises = Paises.paises();
  const [fech, setFech] = useState("");
  const [fecha, setFecha] = useState(new Date());
  const [rol, setRol] = useState([" "]);
  const [borradoLogico, setBorradoLogico] = useState([""]);
  const [pais, setPais] = useState([" "]);
  const rolOptions = [
    { label: <a>{t("usuario.usuario")}</a>, value: "usuario" },
    { label: <a>{t("usuario.gerente")}</a>, value: "gerente" },
  ];
  const borradoLogicoOptions = [
    { label: <a>{t("usuario.activo")}</a>, value: "0" },
    { label: <a>{t("usuario.inactivo")}</a>, value: "1" },
  ];

  useEffect(() => {
    if (JSON.parse(localStorage.getItem("user")).rol === "ROLE_ADMINISTRADOR") {
      usuarioService.buscarTodos().then((res) => {
        if (res.data && Array.isArray(res.data)) {
          // Filtrar usuarios con rol "ROLE_ADMINISTRADOR"
          const usuariosFiltrados = res.data.filter(
            (usuario) => usuario.rol !== "ROLE_ADMINISTRADOR"
          );
          setUsuarios(usuariosFiltrados);
        } else {
          setUsuarios([]);
        }
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
    "country.name": {
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

  function convertirFechaGuiones(fechaTexto) {
    const fecha = new Date(fechaTexto);
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    const fechaFormateada = `${año}-${mes}-${dia}`;
    return fechaFormateada;
  }

  function convertirFechaBarras(fechaTexto) {
    const fecha = new Date(fechaTexto);
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1;
    const anio = fecha.getFullYear();

    const diaFormateado = dia < 10 ? `0${dia}` : dia;
    const mesFormateado = mes < 10 ? `0${mes}` : mes;
    const fechaFormateada = `${diaFormateado}/${mesFormateado}/${anio}`;
    return fechaFormateada;
  }

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
              onClick={crearUsuario}
            />
            <Button
              icon="pi pi-search"
              className="p-button-rounded"
              tooltip={t("botones.buscar")}
              onClick={buscarUsuario}
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

  const passwordFooter = (
    <React.Fragment>
      <Divider />
      <p className="mt-2">
        {t("mensajes.instruccionesContraseña.recomendaciones")}
      </p>
      <ul className="pl-2 ml-2 mt-0" style={{ lineHeight: "1.5" }}>
        <li>{t("mensajes.instruccionesContraseña.instruccion1")}</li>
        <li>{t("mensajes.instruccionesContraseña.instruccion2")}</li>
        <li>{t("mensajes.instruccionesContraseña.instruccion3")}</li>
        <li>{t("mensajes.instruccionesContraseña.instruccion4")}</li>
      </ul>
    </React.Fragment>
  );

  const footer = `${usuarios ? usuarios.length : 0}${t("footer.usuarios")}`;

  const imagenUsuario = (usuario) => {
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

  const formatoRol = (usuario) => {
    const idioma = localStorage.getItem("idioma");
    switch (usuario.rol) {
      case "ROLE_USUARIO":
        if (idioma == "es") {
          return "Usuario";
        } else if (idioma == "en") {
          return "User";
        } else if (idioma == "ga") {
          return "Usuario";
        } else {
          return "Usuario";
        }
      case "ROLE_GERENTE":
        if (idioma == "es") {
          return "Gerente";
        } else if (idioma == "en") {
          return "Manager";
        } else if (idioma == "ga") {
          return "Gerente";
        } else {
          return "Usuario";
        }
      default:
        if (idioma == "es") {
          return "Otro usuario";
        } else if (idioma == "en") {
          return "Another user";
        } else if (idioma == "ga") {
          return "Outro usuario";
        } else {
          return "Otro usuario";
        }
    }
  };

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

  const validateCrear = (data) => {
    let errors = {};
    var patron =
      /^[a-zA-ZÀ-ÿ\u00f1\u00d1\ ]*(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1\ ]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1\ ]*$/g; // patrón letras y espacios
    var patronLogin = /([A-Za-z0-9_]{3,15})/;
    var patronContraseña = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])\S{3,16}$/;
    var patronCorreoElectronico =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    var validChars = "TRWAGMYFPDXBNJZSQVHLCKET";
    var nifRexp = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKET]$/i;
    var nieRexp = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKET]$/i;

    //login
    if (!data.login) {
      errors.login = <p>{t("usuario.validaciones.loginVacio")}</p>;
    } else if (!patronLogin.test(data.login)) {
      errors.login = (
        <p>{t("usuario.validaciones.nombreInvalidoAlfabetico")}</p>
      );
    } else if (data.login.length > 15) {
      errors.login = <p>{t("usuario.validaciones.loginInvalidoTamañoMax")}</p>;
    } else if (data.login.length < 3) {
      errors.login = <p>{t("usuario.validaciones.loginInvalidoTamañoMin")}</p>;
    }

    //password
    if (!data.password) {
      errors.password = <p>{t("usuario.validaciones.contraseñaVacia")}</p>;
    } else if (data.password.length > 16) {
      errors.password = (
        <p>{t("usuario.validaciones.contraseñaInvalidaTamañoMax")}</p>
      );
    } else if (data.password.length < 3) {
      errors.password = (
        <p>{t("usuario.validaciones.contraseñaInvalidaTamañoMin")}</p>
      );
    } else if (!patronContraseña.test(data.password)) {
      errors.password = <p>{t("usuario.validaciones.contraseñaInvalida")}</p>;
    }

    //nombre
    if (!data.nombre) {
      errors.nombre = <p>{t("usuario.validaciones.nombreVacio")}</p>;
    } else if (!patron.test(data.nombre)) {
      errors.nombre = (
        <p>{t("usuario.validaciones.nombreInvalidoAlfabetico")}</p>
      );
    } else if (data.nombre.length > 40) {
      errors.nombre = (
        <p>{t("usuario.validaciones.nombreInvalidoTamañoMax")}</p>
      );
    } else if (data.nombre.length < 3) {
      errors.nombre = (
        <p>{t("usuario.validaciones.nombreInvalidoTamañoMin")}</p>
      );
    }

    //email
    if (!data.email) {
      errors.email = <p>{t("usuario.validaciones.emailVacio")}</p>;
    } else if (!patronCorreoElectronico.test(data.email)) {
      errors.email = <p>{t("usuario.validaciones.emailInvalido")}</p>;
    } else if (data.email.length > 40) {
      errors.email = <p>{t("email.validaciones.emailInvalidoTamañoMax")}</p>;
    } else if (data.email.length < 3) {
      errors.email = <p>{t("usuario.validaciones.emailInvalidoTamañoMin")}</p>;
    }

    //dni
    if (!data.dni) {
      errors.dni = <p>{t("usuario.validaciones.dniVacio")}</p>;
    } else if (!nifRexp.test(data.dni) && !nieRexp.test(data.dni)) {
      errors.dni = <p>{t("usuario.validaciones.dniInvalido")}</p>;
    } else {
      var nie = data.dni
        .replace(/^[X]/, "0")
        .replace(/^[Y]/, "1")
        .replace(/^[Z]/, "2");

      var letter = data.dni.substr(-1);
      var charIndex = parseInt(nie.substr(0, 8)) % 23;

      if (validChars.charAt(charIndex) === letter) {
        // correcto = true;
      } else {
        errors.dni = <p>{t("usuario.validaciones.dniLetraInvalida")}</p>;
      }
    }

    return errors;
  };

  const validateEditar = (data) => {
    let errors = {};
    var patron =
      /^[a-zA-ZÀ-ÿ\u00f1\u00d1\ ]*(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1\ ]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1\ ]*$/g; // patrón letras y espacios
    var patronLogin = /([A-Za-z0-9_]{3,15})/;
    var patronCorreoElectronico =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    var validChars = "TRWAGMYFPDXBNJZSQVHLCKET";
    var nifRexp = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKET]$/i;
    var nieRexp = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKET]$/i;

    //login
    if (!data.login) {
      errors.login = <p>{t("usuario.validaciones.loginVacio")}</p>;
    } else if (!patronLogin.test(data.login)) {
      errors.login = (
        <p>{t("usuario.validaciones.nombreInvalidoAlfabetico")}</p>
      );
    } else if (data.login.length > 15) {
      errors.login = <p>{t("usuario.validaciones.loginInvalidoTamañoMax")}</p>;
    } else if (data.login.length < 3) {
      errors.login = <p>{t("usuario.validaciones.loginInvalidoTamañoMin")}</p>;
    }

    //nombre
    if (!data.nombre) {
      errors.nombre = <p>{t("usuario.validaciones.nombreVacio")}</p>;
    } else if (!patron.test(data.nombre)) {
      errors.nombre = (
        <p>{t("usuario.validaciones.nombreInvalidoAlfabetico")}</p>
      );
    } else if (data.nombre.length > 40) {
      errors.nombre = (
        <p>{t("usuario.validaciones.nombreInvalidoTamañoMax")}</p>
      );
    } else if (data.nombre.length < 3) {
      errors.nombre = (
        <p>{t("usuario.validaciones.nombreInvalidoTamañoMin")}</p>
      );
    }

    //email
    if (!data.email) {
      errors.email = <p>{t("usuario.validaciones.emailVacio")}</p>;
    } else if (!patronCorreoElectronico.test(data.email)) {
      errors.email = <p>{t("usuario.validaciones.emailInvalido")}</p>;
    } else if (data.email.length > 40) {
      errors.email = <p>{t("email.validaciones.emailInvalidoTamañoMax")}</p>;
    } else if (data.email.length < 3) {
      errors.email = <p>{t("usuario.validaciones.emailInvalidoTamañoMin")}</p>;
    }

    //dni
    if (!data.dni) {
      errors.dni = <p>{t("usuario.validaciones.dniVacio")}</p>;
    } else if (!nifRexp.test(data.dni) && !nieRexp.test(data.dni)) {
      errors.dni = <p>{t("usuario.validaciones.dniInvalido")}</p>;
    } else {
      var nie = data.dni
        .replace(/^[X]/, "0")
        .replace(/^[Y]/, "1")
        .replace(/^[Z]/, "2");

      var letter = data.dni.substr(-1);
      var charIndex = parseInt(nie.substr(0, 8)) % 23;

      if (validChars.charAt(charIndex) === letter) {
        // correcto = true;
      } else {
        errors.dni = <p>{t("usuario.validaciones.dniLetraInvalida")}</p>;
      }
    }

    return errors;
  };

  const validateCambiarPassword = (data) => {
    let errors = {};
    var patronContraseña = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])\S{3,16}$/;

    //password
    if (!data.password) {
      errors.password = <p>{t("usuario.validaciones.contraseñaVacia")}</p>;
    } else if (data.password.length > 16) {
      errors.password = (
        <p>{t("usuario.validaciones.contraseñaInvalidaTamañoMax")}</p>
      );
    } else if (data.password.length < 3) {
      errors.password = (
        <p>{t("usuario.validaciones.contraseñaInvalidaTamañoMin")}</p>
      );
    } else if (!patronContraseña.test(data.password)) {
      errors.password = <p>{t("usuario.validaciones.contraseñaInvalida")}</p>;
    }

    //repitePassword
    if (!data.repitePassword) {
      errors.repitePassword = (
        <p>{t("usuario.validaciones.contraseñaVacia")}</p>
      );
    } else if (data.repitePassword.length > 16) {
      errors.repitePassword = (
        <p>{t("usuario.validaciones.contraseñaInvalidaTamañoMax")}</p>
      );
    } else if (data.repitePassword.length < 3) {
      errors.repitePassword = (
        <p>{t("usuario.validaciones.contraseñaInvalidaTamañoMin")}</p>
      );
    } else if (!patronContraseña.test(data.repitePassword)) {
      errors.repitePassword = (
        <p>{t("usuario.validaciones.contraseñaInvalida")}</p>
      );
    } else if (data.repitePassword != data.password) {
      errors.repitePassword = (
        <p>{t("usuario.validaciones.contraseñasNoCoinciden")}</p>
      );
    }

    return errors;
  };

  function crearUsuario() {
    setPais([" "]);
    setRol([" "]);
    setFecha(new Date());
    setVisibleDialogoCrear(true);
  }

  function buscarUsuario() {
    setPais([" "]);
    setRol([" "]);
    setBorradoLogico([""]);
    setFecha(new Date());
    setVisibleDialogoBuscar(true);
  }

  function editarUsuario(usuario) {
    setPais(usuario.pais);
    setRol(usuario.rol.replace("ROLE_", "").toLowerCase());
    setFech(new Date(usuario.fechaNacimiento));
    setUsuarioActual(usuario);
    setVisibleDialogoEditar(true);
  }

  function cambiarPassword(usuario) {
    usuario.password = "";
    setUsuarioActual(usuario);
    setVisibleDialogoCambiarPassword(true);
  }

  function subirImagen(usuario) {
    setUsuarioActual(usuario);
    setVisibleDialogoSubirImagen(true);
  }

  function confirmarReactivarUsuario(usuario) {
    usuario.borradoLogico = "0";
    setUsuarioActual(usuario);
    setVisibleDialogoReactivarUsuario(true);
  }

  function solicitudesUsuario(usuario) {
    navigate("/evento/solicitudesUsuario/" + usuario.id);
  }

  function suscripcionesUsuario(usuario) {
    navigate("/evento/suscripcionesUsuario/" + usuario.id);
  }

  function confirmarVerEnDetalleUsuario(usuario) {
    setPais(usuario.pais);
    setRol(usuario.rol.replace("ROLE_", "").toLowerCase());
    setFech(convertirFechaBarras(usuario.fechaNacimiento));
    setUsuarioActual(usuario);
    setVisibleDialogoVerEnDetalle(true);
  }

  function confirmarEliminarUsuario(usuario) {
    setUsuarioActual(usuario);
    setVisibleDialogoBorrado(true);
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

  function ocultarDialogoCambiarPassword() {
    setVisibleDialogoCambiarPassword(false);
  }

  function ocultarDialogoSubirImagen() {
    setVisibleDialogoSubirImagen(false);
  }

  function ocultarDialogoVerEnDetalle() {
    setVisibleDialogoVerEnDetalle(false);
  }

  function ocultarDialogoBorrado() {
    setUsuarioActual(usuarioVacio);
    setVisibleDialogoBorrado(false);
  }

  function ocultarDialogoReactivarUsuario() {
    setVisibleDialogoReactivarUsuario(false);
  }

  const onSubmitCrear = (data, form) => {
    const fechaActual = new Date();
    if (pais.length >= 3) {
      data[`pais`] = pais;
    }
    if (rol == "usuario" || rol == "gerente") {
      data[`rol`] = "ROLE_" + rol.toUpperCase();
    }
    if (convertirFechaGuiones(fecha) != convertirFechaGuiones(fechaActual)) {
      data[`fechaNacimiento`] = convertirFechaGuiones(fecha);
    }
    usuarioService.crear(data).then(
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
    setPais([" "]);
    setRol([" "]);
    setFecha(new Date());
  };

  const onSubmitBuscar = (data, form) => {
    const fechaActual = new Date();
    if (pais.length >= 3) {
      data[`pais`] = pais;
    }
    if (rol == "usuario" || rol == "gerente") {
      data[`rol`] = "ROLE_" + rol.toUpperCase();
    }
    if (convertirFechaGuiones(fecha) != convertirFechaGuiones(fechaActual)) {
      data[`fechaNacimiento`] = convertirFechaGuiones(fecha);
    }
    if (borradoLogico != "") {
      data[`borradoLogico`] = borradoLogico;
    }
    usuarioService.buscarTodosParametros(data).then(
      (res) => {
        if (res.data && Array.isArray(res.data)) {
          // Filtrar usuarios con rol "ROLE_ADMINISTRADOR"
          const usuariosFiltrados = res.data.filter(
            (usuario) => usuario.rol !== "ROLE_ADMINISTRADOR"
          );
          setUsuarios(usuariosFiltrados);
        } else {
          setUsuarios([]);
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
    setBorradoLogico([""]);
    setPais([" "]);
    setRol([" "]);
    setFecha(new Date());
  };

  const onSubmitEditar = (data, form) => {
    const fechaActual = new Date();
    if (pais.length >= 3) {
      data[`pais`] = pais;
    }
    if (convertirFechaGuiones(fecha) != convertirFechaGuiones(fechaActual)) {
      data[`fechaNacimiento`] = convertirFechaGuiones(fecha);
    }
    usuarioService.modificar(data.id.toString(), data).then(
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
    setPais([" "]);
    setRol([" "]);
    setFecha(new Date());
  };

  const onSubmitCambiarPassword = (data, form) => {
    const fechaActual = new Date();
    if (pais.length >= 3) {
      data[`pais`] = pais;
    }
    if (convertirFechaGuiones(fecha) != convertirFechaGuiones(fechaActual)) {
      data[`fechaNacimiento`] = convertirFechaGuiones(fecha);
    }
    usuarioService.modificar(data.id.toString(), data).then(
      () => {
        setShowMessageCambiarPassword(true);
        form.restart();
        ocultarDialogoCambiarPassword();
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
    setPais([" "]);
    setRol([" "]);
    setFecha(new Date());
  };

  function onSubmitSubirImagen(event) {
    event.preventDefault();
    const url = "http://localhost:8080/api/usuario/uploadImagenUsuario";
    const formData = new FormData();
    const idUsuario = usuarioActual.id;
    const user = JSON.parse(localStorage.getItem("user"));

    formData.append("file", file);
    formData.append("fileName", file.name);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
        login: user.login,
        id: idUsuario,
        Authorization: "Bearer " + user.token,
      },
    };
    cargarImagenAlServidor(url, formData, config);
    ocultarDialogoSubirImagen();
  }

  function onSubmitReactivar() {
    usuarioActual.borradoLogico = "0";
    usuarioService.modificar(usuarioActual.id.toString(), usuarioActual).then(
      () => {
        setShowMessageCambiarPassword(true);
        ocultarDialogoCambiarPassword();
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
    ocultarDialogoReactivarUsuario();
  }

  function cargarImagenAlServidor(url, formData, config) {
    axios.post(url, formData, config).then((response) => {
      const usuarioConImagen = usuarioActual;
      usuarioConImagen.imagenUsuario = response.data.texto;
      setUsuarioActual(usuarioConImagen);
      reloadPage();
    });
  }

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  function onSubmitEliminarUsuario() {
    usuarioService.eliminar(usuarioActual.id.toString()).then(
      () => {
        const usuariosActualizados = usuarios.filter(
          (usuario) => usuario.id !== usuarioActual.id
        );
        setUsuarios(usuariosActualizados);
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
    usuarioService.buscarTodos().then(
      (res) => {
        if (res.data && Array.isArray(res.data)) {
          const usuariosFiltrados = res.data.filter(
            (usuario) => usuario.rol !== "ROLE_ADMINISTRADOR"
          );
          setUsuarios(usuariosFiltrados);
        } else {
          setUsuarios([]);
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
        onClick={onSubmitEliminarUsuario}
      />
    </div>
  );

  const pieDialogoReactivar = (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Button
        label={t("mensajes.no")}
        icon="pi pi-times"
        className="p-button-text"
        onClick={ocultarDialogoReactivarUsuario}
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

  const dialogFooterCambiarPassword = (
    <div className="flex justify-content-center">
      <Button
        label="OK"
        className="p-button-text"
        autoFocus
        onClick={okeyMensajeCambiarPassword}
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

  function okeyMensajeCambiarPassword() {
    setShowMessageCambiarPassword(false);
  }

  function okeyMensajeEliminar() {
    setShowMessageEliminar(false);
  }

  function accionesUsuario(rowData) {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.editar")}
          onClick={() => editarUsuario(rowData)}
        />
        <Button
          icon="pi pi-envelope"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.cambiarPassword")}
          onClick={() => cambiarPassword(rowData)}
        />
        <Button
          icon="pi pi-upload"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.subirImagen")}
          onClick={() => subirImagen(rowData)}
        />
        <Button
          icon="pi pi-file"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.verEnDetalle")}
          onClick={() => confirmarVerEnDetalleUsuario(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.eliminar")}
          onClick={() => confirmarEliminarUsuario(rowData)}
        />
        {rowData.borradoLogico === "1" && (
          <Button
            icon="pi pi-heart mr-2"
            className="p-button-rounded p-button-wrap"
            tooltip={t("botones.reactivar")}
            onClick={() => confirmarReactivarUsuario(rowData)}
          />
        )}
        <Button
          icon="pi pi-envelope"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.solicitudesUsuario")}
          onClick={() => solicitudesUsuario(rowData)}
        />
        <Button
          icon="pi pi-check"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.suscripcionesUsuario")}
          onClick={() => suscripcionesUsuario(rowData)}
        />
      </React.Fragment>
    );
  }

  return (
    <div className="card">
      <div>
        <h2 className="tituloTablas">{t("main.gestionUsuarios")}</h2>
        <DataTable
          value={usuarios}
          paginator
          rows={5}
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
          <Column field="login" header={t("columnas.login")} sortable></Column>
          <Column
            field="nombre"
            header={t("columnas.nombre")}
            sortable
          ></Column>
          <Column field="dni" header={t("columnas.dni")} sortable></Column>
          <Column field="email" header={t("columnas.email")} sortable></Column>
          <Column
            field="rol"
            header={t("columnas.rol")}
            body={formatoRol}
            sortable
          ></Column>
          <Column
            field={formatoEstado}
            header={t("columnas.estado")}
            sortable
          ></Column>
          <Column header={t("columnas.acciones")} body={accionesUsuario} />
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
            initialValues={usuarioVacio}
            validate={validateCrear}
            render={({ handleSubmit }) => (
              <form
                className=" text-xl p-fluid formGestion"
                onSubmit={handleSubmit}
              >
                <Field
                  name="login"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="login"
                            {...input}
                            placeholder={t("usuario.login")}
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
                  name="password"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Password
                            id="password"
                            {...input}
                            name="password"
                            placeholder={t("usuario.contraseña")}
                            className={classNames(
                              { "p-invalid": isFormFieldValid(meta) },
                              { "p-error": isFormFieldValid(meta) }
                            )}
                            toggleMask
                            footer={passwordFooter}
                            required
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />

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
                  name="email"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="email"
                            {...input}
                            placeholder={t("usuario.email")}
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
                  name="rol"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Dropdown
                            value={rol}
                            id="rol"
                            placeholder={t("usuario.selectRol")}
                            showClear
                            name="rol"
                            options={rolOptions}
                            onChange={(e) => setRol(e.value)}
                            required
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />

                <Field
                  name="dni"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="dni"
                            {...input}
                            placeholder={t("usuario.dni")}
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
                  name="fechaNacimiento"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Calendar
                            onChange={(e) => setFecha(e.value)}
                            id="fechaNacimiento"
                            name="fechaNacimiento"
                            placeholder={t("usuario.fechaNac")}
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
                  name="pais"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Dropdown
                            value={pais}
                            options={paises}
                            optionLabel="label"
                            filter
                            showClear
                            filterBy="label"
                            placeholder={t("usuario.selecPais")}
                            onChange={(e) => setPais(e.value)}
                            required
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
            initialValues={usuarioVacio}
            render={({ handleSubmit }) => (
              <form
                className=" text-xl p-fluid formGestion"
                onSubmit={handleSubmit}
              >
                <Field
                  name="login"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="login"
                            {...input}
                            placeholder={t("usuario.login")}
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

                <Field
                  name="email"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="email"
                            {...input}
                            placeholder={t("usuario.email")}
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
                  name="rol"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Dropdown
                            value={rol}
                            id="rol"
                            placeholder={t("usuario.selectRol")}
                            showClear
                            name="rol"
                            options={rolOptions}
                            onChange={(e) => setRol(e.value)}
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />

                <Field
                  name="dni"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="dni"
                            {...input}
                            placeholder={t("usuario.dni")}
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
                  name="fechaNacimiento"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Calendar
                            onChange={(e) => setFecha(e.value)}
                            id="fechaNacimiento"
                            name="fechaNacimiento"
                            placeholder={t("usuario.fechaNac")}
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
                  name="pais"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Dropdown
                            value={pais}
                            options={paises}
                            optionLabel="label"
                            filter
                            showClear
                            filterBy="label"
                            placeholder={t("usuario.selecPais")}
                            onChange={(e) => setPais(e.value)}
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
                            placeholder={t("usuario.borradoLogico")}
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
            initialValues={usuarioActual}
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
                        <label htmlFor="nombre">{t("usuario.nombre")}</label>
                      </div>
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

                <Field
                  name="email"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="email">{t("usuario.email")}</label>
                      </div>
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="email"
                            {...input}
                            placeholder={t("usuario.email")}
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
                  name="dni"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="dni">{t("usuario.dni")}</label>
                      </div>
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="dni"
                            {...input}
                            placeholder={t("usuario.dni")}
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
                  name="fechaNacimiento"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="fechaNacimiento">
                          {t("usuario.fechaNac")}
                        </label>
                      </div>
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Calendar
                            onChange={(e) => setFecha(e.value)}
                            id="fechaNacimiento"
                            value={fech}
                            name="fechaNacimiento"
                            placeholder={t("usuario.fechaNac")}
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
                  name="pais"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <div className="p-field px-5 py-1 text-900 ">
                        <label htmlFor="pais">{t("usuario.pais")}</label>
                      </div>
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Dropdown
                            value={pais}
                            options={paises}
                            optionLabel="label"
                            filter
                            showClear
                            filterBy="label"
                            placeholder={t("usuario.selecPais")}
                            onChange={(e) => setPais(e.value)}
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
        visible={visibleDialogoCambiarPassword}
        style={{ width: "450px" }}
        header={t("mensajes.tituloModalEditarPassword")}
        modal
        onHide={ocultarDialogoCambiarPassword}
      >
        <div className="flex align-items-center justify-content-center">
          <Form
            onSubmit={onSubmitCambiarPassword}
            initialValues={usuarioActual}
            validate={validateCambiarPassword}
            render={({ handleSubmit }) => (
              <form
                className=" text-xl p-fluid formGestion"
                onSubmit={handleSubmit}
              >
                <Field
                  name="password"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Password
                            id="password"
                            {...input}
                            name="password"
                            placeholder={t("usuario.contraseña")}
                            className={classNames(
                              { "p-invalid": isFormFieldValid(meta) },
                              { "p-error": isFormFieldValid(meta) }
                            )}
                            toggleMask
                            footer={passwordFooter}
                            required
                          />
                        </div>
                      </span>
                      {getFormErrorMessage(meta)}
                    </div>
                  )}
                />

                <Field
                  name="repitePassword"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Password
                            id="repitePassword"
                            {...input}
                            name="repitePassword"
                            placeholder={t("usuario.repitaContraseña")}
                            className={classNames(
                              { "p-invalid": isFormFieldValid(meta) },
                              { "p-error": isFormFieldValid(meta) }
                            )}
                            toggleMask
                            footer={passwordFooter}
                            required
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
                    label={t("botones.cambiarPassword")}
                    icon="pi pi-envelope"
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
        header={t("mensajes.tituloModalSubirImagen")}
        modal
        onHide={ocultarDialogoSubirImagen}
      >
        <div className="card flex justify-content-center cargarImagen">
          <form onSubmit={onSubmitSubirImagen}>
            <Button
              type="submit"
              label={t("botones.subirImagen")}
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
                <label htmlFor="login">{t("usuario.login")}</label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText
                    className="tamanhoInput"
                    value={usuarioActual.login}
                  />
                </div>
              </span>
            </div>
          </div>

          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="nombre">{t("usuario.nombre")}</label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText
                    className="tamanhoInput"
                    value={usuarioActual.nombre}
                  />
                </div>
              </span>
            </div>
          </div>

          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="dni">{t("usuario.dni")}</label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText
                    className="tamanhoInput"
                    value={usuarioActual.dni}
                  />
                </div>
              </span>
            </div>
          </div>

          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="fechaNac">{t("usuario.fechaNac")}</label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText className="tamanhoInput" value={fech} />
                </div>
              </span>
            </div>
          </div>

          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="pais">{t("usuario.pais")}</label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText
                    className="tamanhoInput"
                    value={usuarioActual.pais}
                  />
                </div>
              </span>
            </div>
          </div>

          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="email">{t("usuario.email")}</label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText
                    className="tamanhoInput"
                    value={usuarioActual.email}
                  />
                </div>
              </span>
            </div>
          </div>

          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="rol">{t("usuario.rol")}</label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText className="tamanhoInput" value={rol} />
                </div>
              </span>
            </div>
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
          {usuarioActual && (
            <span>
              {t("mensajes.preguntaModalBorrado")} <b>{usuarioActual.nombre}</b>
              ?
            </span>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={visibleDialogoReactivarUsuario}
        style={{ width: "450px" }}
        header={t("mensajes.tituloModalReactivar")}
        modal
        footer={pieDialogoReactivar}
        onHide={ocultarDialogoReactivarUsuario}
      >
        <div className="flex align-items-center justify-content-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {usuarioActual && (
            <span>
              {t("mensajes.preguntaModalReactivar")}{" "}
              <b>{usuarioActual.nombre}</b>?
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
        visible={showMessageCambiarPassword}
        onHide={() => setShowMessageCambiarPassword(false)}
        position="center"
        footer={dialogFooterCambiarPassword}
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
