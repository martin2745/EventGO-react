//recursos
import "./css/App.css";
import { BrowserRouter } from "react-router-dom";

//componentes
import Main from "./Main";

//estilos
import "primereact/resources/themes/bootstrap4-dark-blue/theme.css";
import "/node_modules/primeflex/primeflex.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

function App() {
  return (
    <div className="min-h-screen surface-ground border-round surface-card p-4">
      <BrowserRouter>
        <Main />
      </BrowserRouter>
    </div>
  );
}

export default App;
