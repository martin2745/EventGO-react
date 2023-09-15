import React from "react";
import Github from "../../components/recursos/imagenes/github.png";
import LinkedIn from "../../components/recursos/imagenes/linkedin.png";
import MEI from "../../components/recursos/imagenes/MEI.png";
import CopyRight from "../../components/recursos/imagenes/copyright.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="item1"></div>

        <div className="item2">
          <span style={{ paddingRight: 5 }}>Copyright </span>
          <img className="iconoFooterCR" src={CopyRight} />
          <span style={{ paddingLeft: 5 }}>
            {new Date().getFullYear()} Martín Gil Blanco - MEI
          </span>
        </div>
        <a
          href="https://github.com/martin2745"
          target="_blank"
          className="item3"
        >
          <img className="iconoFooter" src={Github} />
        </a>
        <a
          href="https://www.linkedin.com/feed/"
          target="_blank"
          className="item4"
        >
          <img className="iconoFooter" src={LinkedIn} />
        </a>
        <a
          href="https://master.enxeñeriainformatica.es//"
          target="_blank"
          className="item5"
        >
          <img className="iconoFooterMEI" src={MEI} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
