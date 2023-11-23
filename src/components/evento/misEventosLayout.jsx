import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function MisEventosLayout() {
  const [t, i18n] = useTranslation("global");
  const navigate = useNavigate();

  const verMisSuscripciones = () => {
    navigate("/evento/misSuscripciones/");
  };

  const verMisSolicitudes = () => {
    navigate("/evento/misSolicitudes/");
  };

  const footerSuscripciones = (
    <>
      <Button
        label={t("evento.carta.ver")}
        icon="pi pi-chevron-right"
        style={{ width: "100%" }}
        onClick={verMisSuscripciones}
      />
    </>
  );

  const footerSolicitudes = (
    <>
      <Button
        label={t("evento.carta.ver")}
        icon="pi pi-chevron-right"
        style={{ width: "100%" }}
        onClick={verMisSolicitudes}
      />
    </>
  );

  return (
    <div className="card flex justify-content-center">
      <Card
        title={t("evento.carta.suscripcionesTitulo")}
        subTitle={t("evento.carta.suscripcionesSubtitulo")}
        footer={footerSuscripciones}
        className="md:w-25rem mr-5"
        style={{ backgroundColor: "#333d4c" }}
      >
        <p className="m-0">{t("evento.carta.suscripcionesTexto")}</p>
      </Card>
      <Card
        title={t("evento.carta.solicitudesTitulo")}
        subTitle={t("evento.carta.solicitudesSubtitulo")}
        footer={footerSolicitudes}
        className="md:w-25rem"
        style={{ backgroundColor: "#333d4c" }}
      >
        <p className="m-0">{t("evento.carta.solicitudesTexto")}</p>
      </Card>
    </div>
  );
}
