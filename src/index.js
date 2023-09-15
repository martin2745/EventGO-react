import React from "react";
import ReactDOM from "react-dom";
import "./css/index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import i18next from "i18next";
import { I18nextProvider } from "react-i18next";
import global_es from "./traducciones/es/global.json";
import global_en from "./traducciones/en/global.json";
import global_ga from "./traducciones/ga/global.json";

i18next.init({
  interpolation: { escapeValue: false },
  lng: localStorage.getItem("idioma"),
  resources: {
    es: {
      global: global_es,
    },
    en: {
      global: global_en,
    },
    ga: {
      global: global_ga,
    },
  },
});
ReactDOM.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <App />
    </I18nextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
