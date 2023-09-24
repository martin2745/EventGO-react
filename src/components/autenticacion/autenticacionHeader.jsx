export default function authHeader() {
  const user = JSON.parse(localStorage.getItem("user"));
  const idioma = localStorage.getItem("idioma");

  if (user.login && user.token) {
    return {
      Authorization: "Bearer " + user.token,
      login: user.login,
      "Content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
      idioma: idioma,
    };
  } else {
    return {};
  }
}
