// Inicialização do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBuO53NnPABPPNvoJwVd0Cf-uHdhjvp4ek",
  authDomain: "quiz-b1a5f.firebaseapp.com",
  projectId: "quiz-b1a5f",
  storageBucket: "quiz-b1a5f.appspot.com",
  messagingSenderId: "766849360617",
  appId: "1:766849360617:web:d4bb2f95268a31d74e8678",
  measurementId: "G-6HZ2LERNMW"
};
firebase.initializeApp(firebaseConfig);

let usuarioAutenticado = false;

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");

  localStorage.removeItem("usuarioLogado");

  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });

  const form = document.querySelector("form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const googleLoginBtn = document.getElementById("googleLogin");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");

  function mostrarErro(input, mensagem) {
    const grupo = input.parentElement;
    let erro = grupo.querySelector(".erro-msg");

    if (!erro) {
      erro = document.createElement("p");
      erro.classList.add("erro-msg");
      erro.style.color = "red";
      erro.style.fontSize = "0.8rem";
      erro.style.marginTop = "5px";
      grupo.appendChild(erro);
    }

    erro.textContent = mensagem;
  }

  function limparErro(input) {
    const grupo = input.parentElement;
    const erro = grupo.querySelector(".erro-msg");
    if (erro) erro.remove();
  }

  function validarEmail(email) {
    return email.endsWith("@gmail.com") || email.endsWith("@outlook.com");
  }

  function validarSenha(senha) {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(senha);
  }

  emailInput.addEventListener("blur", () => {
    const email = emailInput.value.trim();
    limparErro(emailInput);
    if (!email) {
      mostrarErro(emailInput, "Por favor, preencha o campo de e-mail.");
    } else if (!validarEmail(email)) {
      mostrarErro(emailInput, "O e-mail deve terminar com @gmail.com ou @outlook.com.");
    }
  });

  passwordInput.addEventListener("blur", () => {
    const senha = passwordInput.value.trim();
    limparErro(passwordInput);
    if (!senha) {
      mostrarErro(passwordInput, "Por favor, preencha o campo de senha.");
    } else if (!validarSenha(senha)) {
      mostrarErro(passwordInput, "A senha deve ter no mínimo 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial.");
    }
  });

  emailInput.addEventListener("input", () => limparErro(emailInput));
  passwordInput.addEventListener("input", () => limparErro(passwordInput));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    document.activeElement.blur();

    const email = emailInput.value.trim();
    const senha = passwordInput.value.trim();
    let valido = true;

    limparErro(emailInput);
    limparErro(passwordInput);

    if (!email) {
      mostrarErro(emailInput, "Por favor, preencha o campo de e-mail.");
      valido = false;
    } else if (!validarEmail(email)) {
      mostrarErro(emailInput, "O e-mail deve terminar com @gmail.com ou @outlook.com.");
      valido = false;
    }

    if (!senha) {
      mostrarErro(passwordInput, "Por favor, preencha o campo de senha.");
      valido = false;
    } else if (!validarSenha(senha)) {
      mostrarErro(passwordInput, "A senha deve ter no mínimo 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial.");
      valido = false;
    }

    if (valido) {
      firebase.auth().signInWithEmailAndPassword(email, senha)
        .then(() => {
          usuarioAutenticado = true;
          localStorage.setItem("usuarioLogado", "true");
          window.location.href = "home.html";
        })
        .catch((error) => {
          usuarioAutenticado = false;
          console.error("Erro de autenticação:", error.message);
          mostrarErro(emailInput, "Email ou senha incorretos.");
        });
    }
  });

  // Login com Google
  googleLoginBtn.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth()
      .signInWithPopup(provider)
      .then(() => {
        usuarioAutenticado = true;
        localStorage.setItem("usuarioLogado", "true");
        window.location.href = "quiz.html";
      })
      .catch((error) => {
        console.error("Erro ao autenticar com Google:", error.message);
        if (error.code === 'auth/popup-closed-by-user') {
          alert("Erro ao logar com o Google: o usuário fechou a janela de login.");
        } else {
          alert("Erro ao fazer login com o Google.");
        }
      });
  });

  // Redefinir senha
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    limparErro(emailInput);

    if (!email) {
      mostrarErro(emailInput, "Digite seu e-mail para redefinir a senha.");
    } else if (!validarEmail(email)) {
      mostrarErro(emailInput, "Digite um e-mail válido para redefinir a senha.");
    } else {
      firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
          alert("Um e-mail de redefinição de senha foi enviado!");
        })
        .catch((error) => {
          console.error("Erro ao enviar e-mail de redefinição:", error.message);
          alert("Erro ao enviar e-mail de redefinição. Verifique o e-mail digitado.");
        });
    }
  });

  const togglePassword = document.getElementById("togglePassword");
  const eyeIcon = document.getElementById("eyeIcon");

  togglePassword.addEventListener("click", () => {
    const isPasswordVisible = passwordInput.type === "text";
    passwordInput.type = isPasswordVisible ? "password" : "text";
    eyeIcon.classList.toggle("fa-eye");
    eyeIcon.classList.toggle("fa-eye-slash");
  });
});
