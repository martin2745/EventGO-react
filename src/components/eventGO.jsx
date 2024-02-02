import React from "react";
import { TabView, TabPanel } from "primereact/tabview";
import Avatar from "./recursos/imagenes/fotoPerfil.png";

export default function EventGO() {
  const idioma = localStorage.getItem("idioma");
  const tab1HeaderTemplate = (options) => {
    return (
      <button
        type="button"
        onClick={options.onClick}
        className={options.className}
      >
        <i className="pi pi-info-circle mr-2" />
        {options.titleElement}
      </button>
    );
  };

  const tab2HeaderTemplate = (options) => {
    return (
      <div
        className="flex align-items-center px-3"
        style={{ cursor: "pointer" }}
        onClick={options.onClick}
      >
        <img
          src={Avatar}
          style={{ width: "30px", height: "30px", borderRadius: "50%" }}
          className="mx-2"
          alt="Avatar"
        />
        Martín Gil Blanco
      </div>
    );
  };

  return (
    <div className="card">
      <TabView>
        <TabPanel
          header={
            idioma === "es"
              ? "Descripción de la herramienta"
              : idioma === "ga"
              ? "Descrición da ferramenta"
              : "Tool Description"
          }
          headerTemplate={tab1HeaderTemplate}
        >
          <div>
            {idioma === "es" ? (
              <>
                <p>
                  Este trabajo tiene como objetivo destacar la aplicación
                  'eventGo' como una propuesta sólida y práctica para la gestión
                  de eventos, simplificando el proceso de organización y
                  mejorando la experiencia tanto para organizadores como para
                  asistentes.
                </p>
                <p>
                  Se abordan aspectos fundamentales, como funcionalidad,
                  arquitectura de la aplicación y experiencia de usuario,
                  mediante un análisis exhaustivo de las necesidades y desafíos
                  en la gestión de eventos.
                </p>
                <p>
                  Cualquier cuestión técnica puede consultarla con el
                  administrador en el correo: gilblancomartin@gmail.com.
                </p>
              </>
            ) : idioma === "ga" ? (
              <>
                <p>
                  Este traballo ten como obxectivo destacar a aplicación
                  'eventGo' como unha proposta sólida e práctica para a xestión
                  de eventos, simplificando o proceso de organización e
                  mellorando a experiencia tanto para organizadores como para
                  asistentes.
                </p>
                <p>
                  Abórdanse aspectos fundamentais, como funcionalidade,
                  arquitectura da aplicación e experiencia do usuario, mediante
                  un análise exhaustivo das necesidades e desafíos na xestión de
                  eventos.
                </p>
                <p>
                  Calquera cuestión técnica pódese consultar co administrador no
                  correo: gilblancomartin@gmail.com.
                </p>
              </>
            ) : (
              <>
                <p>
                  This work aims to highlight the 'eventGo' application as a
                  solid and practical proposal for event management, simplifying
                  the organization process and improving the experience for both
                  organizers and attendees.
                </p>
                <p>
                  Fundamental aspects such as functionality, application
                  architecture, and user experience are addressed through a
                  thorough analysis of the needs and challenges in event
                  management.
                </p>
                <p>
                  Any technical questions can be addressed to the administrator
                  at gilblancomartin@gmail.com.
                </p>
              </>
            )}
          </div>
        </TabPanel>
        <TabPanel
          headerTemplate={tab2HeaderTemplate}
          headerClassName="flex align-items-center"
        >
          <div>
            {idioma === "es" ? (
              <>
                <p>Saludos a todos, mi nombre es Martín Gil Blanco 👋.</p>
                <p>Educación:</p>
                <p>
                  - Graduado en Ingeniería Informática en la ESEI de la
                  Universidad de Vigo (2018-2022). Especialidad en: Ingeniería
                  del Software.
                </p>
                <p>
                  - Máster en Ingeniería Informática en la Universidad de Vigo
                  (2023-2024). Especialidad en: Seguridad Informática en
                  Sistemas y Redes.
                </p>
                <p>
                  Mi enfoque se dirige hacia diversas tecnologías, donde he
                  colaborado en proyectos y he adquirido habilidades en Java,
                  Spring, PHP, SQL, JavaScript, React, HTML, CSS, entre otras.
                </p>
                <p>
                  Mi apasionado interés por mantenerme actualizado en este campo
                  me impulsa a enfrentar nuevos desafíos y a continuar creciendo
                  en esta industria dinámica.
                </p>
                <p>
                  A lo largo de mi trayectoria profesional, me esfuerzo por
                  dejar una huella positiva en cada proyecto en el que
                  participo, trabajando con entusiasmo y determinación.
                </p>
              </>
            ) : idioma === "ga" ? (
              <>
                <p>Saudacións a todos, o meu nome é Martín Gil Blanco 👋.</p>
                <p>Educación:</p>
                <p>
                  - Graduado en Enxeñaría Informática na ESEI da Universidade de
                  Vigo (2018-2022). Especialidade en: Enxeñaría do Software.
                </p>
                <p>
                  - Máster en Enxeñaría Informática na Universidade de Vigo
                  (2023-2024). Especialidade en: Seguridade Informática en
                  Sistemas e Redes.
                </p>
                <p>
                  O meu enfoque diríxese cara a diversas tecnoloxías, onde
                  collaborei en proxectos e adquirín habilidades en Java,
                  Spring, PHP, SQL, JavaScript, React, HTML, CSS, entre outras.
                </p>
                <p>
                  O meu interese apaixonado por manterme actualizado neste campo
                  impúlsame a enfrontar novos desafíos e a continuar crecendo
                  nesta industria dinámica.
                </p>
                <p>
                  Ao longo da miña traxectoria profesional, esforzome por deixar
                  unha pegada positiva en cada proxecto no que participo,
                  traballando con entusiasmo e determinación.
                </p>
              </>
            ) : (
              <>
                <p>Greetings to all, my name is Martín Gil Blanco 👋.</p>
                <p>Education:</p>
                <p>
                  - Graduated in Computer Engineering from ESEI, University of
                  Vigo (2018-2022). Specialization: Software Engineering.
                </p>
                <p>
                  - Master's in Computer Engineering at the University of Vigo
                  (2023-2024). Specialization: Information Security in Systems
                  and Networks.
                </p>
                <p>
                  My focus is on various technologies, where I have collaborated
                  on projects and acquired skills in Java, Spring, PHP, SQL,
                  JavaScript, React, HTML, CSS, among others.
                </p>
                <p>
                  My passionate interest in staying updated in this field drives
                  me to face new challenges and continue growing in this dynamic
                  industry.
                </p>
                <p>
                  Throughout my professional journey, I strive to leave a
                  positive mark on every project I participate in, working with
                  enthusiasm and determination.
                </p>
              </>
            )}
          </div>
        </TabPanel>
      </TabView>
    </div>
  );
}
