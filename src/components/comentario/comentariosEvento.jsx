import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataScroller } from "primereact/datascroller";
import { useNavigate } from "react-router-dom";
import { Rating } from "primereact/rating";
import { useTranslation } from "react-i18next";
import { Divider } from "primereact/divider";
import { Chart } from "primereact/chart";
import autenticacionService from "../../services/autenticacionService";
import comentarioService from "../../services/comentarioService";
import avatar from "./../recursos/imagenes/avatar.png";

export default function ComentariosEvento() {
  const pathname = window.location.pathname;
  const parts = pathname.split("/");
  const idEvento = parseInt(parts[parts.length - 1], 10);
  const [t, i18n] = useTranslation("global");
  const navigate = useNavigate();
  const [comentarios, setComentarios] = useState([]);
  const [valoraciones, setValoraciones] = useState([]);
  const [imagenEvento, setImagenEvento] = useState([]);
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  //Carga de comentarios
  useEffect(() => {
    if (JSON.parse(localStorage.getItem("user")).rol === "ROLE_GERENTE") {
      comentarioService.buscarTodos(idEvento).then((res) => {
        setComentarios(res.data);
        if (res.data[0].evento.imagenEvento != "") {
          setImagenEvento(res.data[0].evento.imagenEvento);
        } else {
          setImagenEvento(avatar);
        }
      });
    } else {
      autenticacionService.logout();
      navigate("/");
      window.location.reload();
    }
  }, []);

  //Gráfico
  useEffect(() => {
    if (JSON.parse(localStorage.getItem("user")).rol === "ROLE_GERENTE") {
      comentarioService.numEstrellasEvento(idEvento).then((res) => {
        let labelsIdoma = ["1 pts", "2 pts", "3 pts", "4 pts", "5 pts"];

        const data = {
          labels: labelsIdoma,
          datasets: [
            {
              label: "Rating",
              data: [
                res.data[0],
                res.data[1],
                res.data[2],
                res.data[3],
                res.data[4],
              ],
              backgroundColor: [
                "rgba(255, 159, 64, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(95, 162, 192, 0.2)",
              ],
              borderColor: [
                "rgb(255, 159, 64)",
                "rgb(75, 192, 192)",
                "rgb(54, 162, 235)",
                "rgb(153, 102, 255)",
                "rgb(35, 122, 212)",
              ],
              borderWidth: 1,
            },
          ],
        };

        const options = {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        };

        setChartData(data);
        setChartOptions(options);
      });
    } else {
      autenticacionService.logout();
      navigate("/");
      window.location.reload();
    }
  }, []);

  const imagenUsuario = (comentario) => {
    return (
      <>
        {comentario.usuario.imagenUsuario ? (
          <img
            src={comentario.usuario.imagenUsuario}
            className="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round"
          />
        ) : (
          <img
            src={avatar}
            className="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round"
          />
        )}
      </>
    );
  };

  const volverGestionEventos = () => {
    navigate("/evento/misEventosGestor/");
  };

  const itemTemplate = (comentario) => {
    return (
      <div className="col-12">
        <div className="flex flex-column xl:flex-row xl:align-items-start p-4 gap-4">
          {imagenUsuario(comentario)}
          <div className="ml-5 flex flex-column lg:flex-row justify-content-between align-items-center xl:align-items-start lg:flex-1 gap-4">
            <div className="flex flex-column align-items-center lg:align-items-start gap-3">
              <div className="flex flex-column gap-1">
                <div className="text-2xl font-bold text-900">
                  {comentario.usuario.nombre}
                </div>
                <div className="text-700">{comentario.comentario}</div>
                <Rating
                  value={comentario.puntuacion}
                  readOnly
                  cancel={false}
                ></Rating>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="card">
        <Button
          icon="pi pi-arrow-left"
          className="p-button-rounded mr-2"
          tooltip={t("botones.volverGestionEventos")}
          onClick={volverGestionEventos}
        />
        <div className="card flex justify-content-center">
          <img
            className="mx-auto border-round"
            style={{ width: "250px", height: "200px" }}
            src={imagenEvento}
          ></img>
          <Divider layout="vertical" />
          <Chart
            type="bar"
            data={chartData}
            options={chartOptions}
            style={{ width: "500px", height: "200px" }}
          />
        </div>
      </div>
      <DataScroller
        value={comentarios}
        itemTemplate={itemTemplate}
        rows={comentarios.length}
        inline
        scrollHeight="600px"
        header={t("comentarios.titulo")}
      />
    </div>
  );
}
