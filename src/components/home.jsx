import { useState } from "react";
import autenticacionService from "../services/autenticacionService";
import { useTranslation } from "react-i18next";

export default function Home() {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [t, i18n] = useTranslation("global");

  useState(() => {
    const user = autenticacionService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
    }
  }, []);

  if (currentUser != null) {
    return (
      <div className="container text-900">
        <header className="jumbotron">
          <h3>
            <strong>{currentUser.login}</strong> Profile
            <p>
              {t("bienvenido")} {currentUser.rol}
            </p>
          </h3>
        </header>
        <p>
          <strong>Token:</strong> {currentUser.token.substring(0, 20)} ...{" "}
          {currentUser.token.substr(currentUser.token.length - 20)}
        </p>
        <p>
          <strong>id:</strong> {currentUser.id}
        </p>
        <strong>Authorities:</strong>
        <ul>{currentUser.rol}</ul>
      </div>
    );
  } else {
    return <div>no hay sesion activa</div>;
  }
}
