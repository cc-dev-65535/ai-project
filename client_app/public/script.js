// fetch("/api")
//   .then((response) => response.json())
//   .then((data) => {
//     const p = document.createElement("p");
//     p.innerHTML = data.response;
//     document.body.appendChild(p);
//   });

const login = () => {
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: document.getElementById("login-user").value,
      password: document.getElementById("login-pass").value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.response);
    });
};


const signup = () => {
  fetch("/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: document.getElementById("signup-user").value,
      name: document.getElementById("signup-name").value,
      password: document.getElementById("signup-pass").value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.response);
    });
};
