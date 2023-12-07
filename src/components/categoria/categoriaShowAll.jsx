import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Form, Field } from "react-final-form";
import { classNames } from "primereact/utils";
import autenticacionService from "../../services/autenticacionService";
import categoriaService from "../../services/categoriaService";
import axios from "axios";
import avatar from "./../recursos/imagenes/avatar.png";

export default function CategoriaShowAll() {
  const categoriaVacio = {
    id: "",
    nombre: "",
    descripcion: "",
    borradoLogico: "",
  };
  const [categorias, setCategorias] = useState([]);
  const [t, i18n] = useTranslation("global");
  const navigate = useNavigate();
  const [showMessageCrear, setShowMessageCrear] = useState(false);
  const [showMessageEditar, setShowMessageEditar] = useState(false);
  const [showMessageEliminar, setShowMessageEliminar] = useState(false);
  const [dialogoError, setDialogoError] = useState(false);
  const [resMessage, setResMessage] = useState("");
  const [categoriaActual, setCategoriaActual] = useState(categoriaVacio);
  const [visibleDialogoCrear, setVisibleDialogoCrear] = useState(false);
  const [visibleDialogoBuscar, setVisibleDialogoBuscar] = useState(false);
  const [visibleDialogoEditar, setVisibleDialogoEditar] = useState(false);
  const [visibleDialogoSubirImagen, setVisibleDialogoSubirImagen] =
    useState(false);
  const [file, setFile] = useState();
  const [visibleDialogoVerEnDetalle, setVisibleDialogoVerEnDetalle] =
    useState(false);
  const [visibleDialogoBorrado, setVisibleDialogoBorrado] = useState(false);
  const [borradoLogico, setBorradoLogico] = useState([""]);
  const borradoLogicoOptions = [
    { label: <a>{t("usuario.activo")}</a>, value: "0" },
    { label: <a>{t("usuario.inactivo")}</a>, value: "1" },
  ];
  const [
    visibleDialogoReactivarCategoria,
    setVisibleDialogoReactivarCategoria,
  ] = useState(false);

  useEffect(() => {
    if (JSON.parse(localStorage.getItem("user")).rol === "ROLE_ADMINISTRADOR") {
      categoriaService.buscarTodos().then((res) => {
        setCategorias(res.data);
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
              onClick={crearCategoria}
            />
            <Button
              icon="pi pi-search"
              className="p-button-rounded"
              tooltip={t("botones.buscar")}
              onClick={buscarCategoria}
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

  const footer = `${categorias ? categorias.length : 0}${t(
    "footer.categorias"
  )}`;

  const imagenCategoria = (categoria) => {
    return (
      <>
        {categoria.imagenCategoria ? (
          <img
            src={categoria.imagenCategoria}
            className="w-4rem shadow-2 border-round"
          />
        ) : (
          <img src={avatar} className="w-4rem shadow-2 border-round" />
        )}
      </>
    );
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
    var patronNombre = /^[A-Za-z0-9_áéíóúñÁÉÍÓÚÑ ]+$/;
    var patronDescripcion = /^[A-Za-z0-9_áéíóúñÁÉÍÓÚÑ ]+$/;

    //nombre
    if (!data.nombre) {
      errors.nombre = <p>{t("categoria.validaciones.nombreVacio")}</p>;
    } else if (!patronNombre.test(data.nombre)) {
      errors.nombre = (
        <p>{t("categoria.validaciones.nombreInvalidoAlfanumerico")}</p>
      );
    } else if (data.nombre.length > 15) {
      errors.nombre = (
        <p>{t("categoria.validaciones.nombreCategoriaInvalidoTamañoMax")}</p>
      );
    } else if (data.nombre.length < 3) {
      errors.nombre = (
        <p>{t("categoria.validaciones.nombreCategoriaInvalidoTamañoMin")}</p>
      );
    }

    //descripcion
    if (!data.descripcion) {
      errors.descripcion = (
        <p>{t("categoria.validaciones.descripcionVacio")}</p>
      );
    } else if (!patronDescripcion.test(data.descripcion)) {
      errors.descripcion = (
        <p>
          {t("categoria.validaciones.descripcionCategoriaInvalidoAlfanumerico")}
        </p>
      );
    } else if (data.descripcion.length > 255) {
      errors.descripcion = (
        <p>
          {t("categoria.validaciones.descripcionCategoriaInvalidoTamañoMax")}
        </p>
      );
    } else if (data.descripcion.length < 3) {
      errors.descripcion = (
        <p>
          {t("categoria.validaciones.descripcionCategoriaInvalidoTamañoMin")}
        </p>
      );
    }

    return errors;
  };

  const validateEditar = (data) => {
    let errors = {};
    var patronNombre = /^[A-Za-z0-9_áéíóúñÁÉÍÓÚÑ ]+$/;
    var patronDescripcion = /^[A-Za-z0-9_áéíóúñÁÉÍÓÚÑ ]+$/;

    //nombre
    if (!data.nombre) {
      errors.nombre = <p>{t("categoria.validaciones.nombreVacio")}</p>;
    } else if (!patronNombre.test(data.nombre)) {
      errors.nombre = (
        <p>{t("categoria.validaciones.nombreInvalidoAlfanumerico")}</p>
      );
    } else if (data.nombre.length > 15) {
      errors.nombre = (
        <p>{t("categoria.validaciones.nombreCategoriaInvalidoTamañoMax")}</p>
      );
    } else if (data.nombre.length < 3) {
      errors.nombre = (
        <p>{t("categoria.validaciones.nombreCategoriaInvalidoTamañoMin")}</p>
      );
    }

    //descripcion
    if (!data.descripcion) {
      errors.descripcion = (
        <p>{t("categoria.validaciones.descripcionVacio")}</p>
      );
    } else if (!patronDescripcion.test(data.descripcion)) {
      errors.descripcion = (
        <p>
          {t("categoria.validaciones.descripcionCategoriaInvalidoAlfanumerico")}
        </p>
      );
    } else if (data.descripcion.length > 255) {
      errors.descripcion = (
        <p>
          {t("categoria.validaciones.descripcionCategoriaInvalidoTamañoMax")}
        </p>
      );
    } else if (data.descripcion.length < 3) {
      errors.descripcion = (
        <p>
          {t("categoria.validaciones.descripcionCategoriaInvalidoTamañoMin")}
        </p>
      );
    }

    return errors;
  };

  function crearCategoria() {
    setVisibleDialogoCrear(true);
  }

  function buscarCategoria() {
    setBorradoLogico([""]);
    setVisibleDialogoBuscar(true);
  }

  function editarCategoria(categoria) {
    setCategoriaActual(categoria);
    setVisibleDialogoEditar(true);
  }

  function confirmarReactivarCategoria(categoria) {
    categoria.borradoLogico = "0";
    setCategoriaActual(categoria);
    setVisibleDialogoReactivarCategoria(true);
  }

  function subirImagen(categoria) {
    setCategoriaActual(categoria);
    setVisibleDialogoSubirImagen(true);
  }

  function confirmarVerEnDetalleCategoria(categoria) {
    setCategoriaActual(categoria);
    setVisibleDialogoVerEnDetalle(true);
  }

  function confirmarEliminarCategoria(categoria) {
    setCategoriaActual(categoria);
    setVisibleDialogoBorrado(true);
  }

  function eventosCategoria(categoria) {
    setCategoriaActual(categoria);
    navigate("/evento/eventoShowAll/" + categoria.id); // navega a URL de gestión de eventos
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
    setCategoriaActual(categoriaVacio);
    setVisibleDialogoBorrado(false);
  }

  function ocultarDialogoReactivarCategoria() {
    setVisibleDialogoReactivarCategoria(false);
  }

  const onSubmitCrear = (data, form) => {
    categoriaService.crear(data).then(
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
    if (borradoLogico != "") {
      data[`borradoLogico`] = borradoLogico;
    }

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

  const onSubmitEditar = (data, form) => {
    categoriaService.modificar(data.id.toString(), data).then(
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
    categoriaActual.borradoLogico = "0";
    categoriaService
      .modificar(categoriaActual.id.toString(), categoriaActual)
      .then(
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
    ocultarDialogoReactivarCategoria();
  }

  function onSubmitSubirImagen(event) {
    event.preventDefault();
    const url = "http://localhost:8080/api/categoria/uploadImagenCategoria";
    const formData = new FormData();
    const idCategoria = categoriaActual.id;
    const user = JSON.parse(localStorage.getItem("user"));

    formData.append("file", file);
    formData.append("fileName", file.name);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
        login: user.login,
        id: idCategoria,
        Authorization: "Bearer " + user.token,
      },
    };
    cargarImagenAlServidor(url, formData, config);
    ocultarDialogoSubirImagen();
  }

  function cargarImagenAlServidor(url, formData, config) {
    axios.post(url, formData, config).then((response) => {
      const categoriaConImagen = categoriaActual;
      categoriaConImagen.imageCategoria = response.data.texto;
      setCategoriaActual(categoriaConImagen);
      reloadPage();
    });
  }

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  function onSubmitEliminarCategoria() {
    categoriaService.eliminar(categoriaActual.id.toString()).then(
      () => {
        const categoriasActualizados = categorias.filter(
          (categoria) => categoria.id !== categoriaActual.id
        );
        setCategorias(categoriasActualizados);
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
        onClick={onSubmitEliminarCategoria}
      />
    </div>
  );

  const pieDialogoReactivar = (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Button
        label={t("mensajes.no")}
        icon="pi pi-times"
        className="p-button-text"
        onClick={ocultarDialogoReactivarCategoria}
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

  function accionesCategoria(rowData) {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.editar")}
          onClick={() => editarCategoria(rowData)}
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
          onClick={() => confirmarVerEnDetalleCategoria(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.eliminar")}
          onClick={() => confirmarEliminarCategoria(rowData)}
        />
        <Button
          icon="pi pi-users"
          className="p-button-rounded p-button-wrap mr-2"
          tooltip={t("botones.gestionEventos")}
          onClick={() => eventosCategoria(rowData)}
        />
        {rowData.borradoLogico === "1" && (
          <Button
            icon="pi pi-heart mr-2"
            className="p-button-rounded p-button-wrap"
            tooltip={t("botones.reactivar")}
            onClick={() => confirmarReactivarCategoria(rowData)}
          />
        )}
      </React.Fragment>
    );
  }

  return (
    <div className="card">
      <div>
        <h2 className="tituloTablas">{t("main.gestionCategorias")}</h2>
        <DataTable
          value={categorias}
          paginator
          rows={5}
          header={header}
          filters={filters}
          onFilter={(e) => setFilters(e.filters)}
          footer={footer}
          tableStyle={{ minWidth: "60rem" }}
        >
          <Column
            field="imagenCategoria"
            header={t("columnas.imagen")}
            body={imagenCategoria}
          ></Column>
          <Column
            field="nombre"
            header={t("columnas.nombre")}
            sortable
          ></Column>
          <Column
            field="descripcion"
            header={t("columnas.descripcion")}
            sortable
          ></Column>
          <Column
            field={formatoEstado}
            header={t("columnas.estado")}
            sortable
          ></Column>
          <Column header={t("columnas.acciones")} body={accionesCategoria} />
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
            initialValues={categoriaVacio}
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
                            placeholder={t("categoria.nombre")}
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
                            placeholder={t("categoria.descripcion")}
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

                <Field
                  name="borradoLogico"
                  render={({ input, meta }) => (
                    <div className="field ">
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <Dropdown
                            value={borradoLogico}
                            id="borradoLogico"
                            placeholder={t("categoria.borradoLogico")}
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
            initialValues={categoriaActual}
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
                      <span className="p-float-label">
                        <div className="p-field px-5 text-900 ">
                          <InputText
                            id="nombre"
                            {...input}
                            placeholder={t("categoria.nombre")}
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
                            placeholder={t("categoria.descripcion")}
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
                <label htmlFor="nombre">{t("categoria.nombre")}</label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText
                    className="tamanhoInput"
                    value={categoriaActual.nombre}
                  />
                </div>
              </span>
            </div>
          </div>

          <div className="flex align-items-center justify-content-center">
            <div className="field ">
              <div className="p-field px-5 py-1 text-900 ">
                <label htmlFor="descripcion">
                  {t("categoria.descripcion")}
                </label>
              </div>
              <span className="p-float-label">
                <div className="p-field px-5 text-900 ">
                  <InputText
                    className="tamanhoInput"
                    value={categoriaActual.descripcion}
                  />
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
          {categoriaActual && (
            <span>
              {t("mensajes.preguntaModalBorrado")}{" "}
              <b>{categoriaActual.nombre}</b>?
            </span>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={visibleDialogoReactivarCategoria}
        style={{ width: "450px" }}
        header={t("mensajes.tituloModalReactivar")}
        modal
        footer={pieDialogoReactivar}
        onHide={ocultarDialogoReactivarCategoria}
      >
        <div className="flex align-items-center justify-content-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {categoriaActual && (
            <span>
              {t("mensajes.preguntaModalReactivar")}{" "}
              <b>{categoriaActual.nombre}</b>?
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
