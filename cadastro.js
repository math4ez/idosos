// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBuO53NnPABPPNvoJwVd0Cf-uHdhjvp4ek",
    authDomain: "quiz-b1a5f.firebaseapp.com",
    projectId: "quiz-b1a5f",
    storageBucket: "quiz-b1a5f.appspot.com",
    messagingSenderId: "766849360617",
    appId: "1:766849360617:web:d4bb2f95268a31d74e8678"
  };
  
  firebase.initializeApp(firebaseConfig);

  let usuarioAutenticado = false;
  
  document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

    localStorage.removeItem("usuarioLogado");
  
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    });
  
    const nomeInput = document.getElementById("nome");
    const nascimentoInput = document.getElementById("nascimento");
    const telefoneInput = document.getElementById("telefone");
    const emailInput = document.getElementById("email");
    const senhaInput = document.getElementById("senha");
    const confirmarSenhaInput = document.getElementById("confirmarSenha");
  
    function mostrarErro(input, mensagem) {
      const grupo = input.parentElement;
      let erro = grupo.querySelector(".erro-msg");
  
      if (!erro) {
        erro = document.createElement("p");
        erro.classList.add("erro-msg");
        erro.style.fontSize = "0.7rem"; // Fonte menor
        erro.style.marginTop = "3px";
        erro.style.color = "red";
        grupo.appendChild(erro);
      }
  
      erro.textContent = mensagem;
    }
  
    function limparErro(input) {
      const erro = input.parentElement.querySelector(".erro-msg");
      if (erro) erro.remove();
    }
  
    function validarEmail(email) {
      return email.endsWith("@gmail.com") || email.endsWith("@outlook.com");
    }
  
    function validarSenha(senha) {
      const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      return regex.test(senha);
    }
  
    function validarNascimento(dataStr) {
      if (!dataStr) return false;
  
      const hoje = new Date();
      const nascimento = new Date(dataStr);
      const idade = hoje.getFullYear() - nascimento.getFullYear();
      const mes = hoje.getMonth() - nascimento.getMonth();
  
      const idadeFinal = mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate()) ? idade - 1 : idade;
  
      return nascimento <= hoje && idadeFinal >= 13;
    }
  
    function validarTelefone(telefone) {
      const telefoneLimpo = telefone.replace(/\D/g, "");
      return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11;
    }
  
    const togglePassword = document.getElementById("togglePassword");
    const eyeIcon = document.getElementById("eyeIcon");
  
    togglePassword.addEventListener("click", () => {
      const isVisible = senhaInput.type === "text";
      senhaInput.type = isVisible ? "password" : "text";
      eyeIcon.classList.toggle("fa-eye");
      eyeIcon.classList.toggle("fa-eye-slash");
    });

    
    const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
    const eyeConfirmIcon = document.getElementById("eyeConfirmIcon");

toggleConfirmPassword.addEventListener("click", () => {
  const isPasswordVisible = confirmarSenhaInput.type === "text";
  confirmarSenhaInput.type = isPasswordVisible ? "password" : "text";
  eyeConfirmIcon.classList.toggle("fa-eye");
  eyeConfirmIcon.classList.toggle("fa-eye-slash");
});

  
    document.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const nome = nomeInput.value.trim();
      const nascimento = nascimentoInput.value;
      const telefone = telefoneInput.value.trim();
      const email = emailInput.value.trim();
      const senha = senhaInput.value.trim();
      const confirmarSenha = confirmarSenhaInput.value.trim();
  
      // Limpar erros antigos
      [nomeInput, nascimentoInput, telefoneInput, emailInput, senhaInput, confirmarSenhaInput].forEach(limparErro);
  
      let valido = true;
  
      if (!nome) {
        mostrarErro(nomeInput, "Nome é obrigatório.");
        valido = false;
      }
  
      if (!validarNascimento(nascimento)) {
        mostrarErro(nascimentoInput, "Data inválida. Usuário deve ter pelo menos 13 anos.");
        valido = false;
      }
  
      if (!validarTelefone(telefone)) {
        mostrarErro(telefoneInput, "Telefone inválido. Use DDD + número com 9 dígitos.");
        valido = false;
      }
  
      if (!email || !validarEmail(email)) {
        mostrarErro(emailInput, "E-mail inválido. Use @gmail.com ou @outlook.com.");
        valido = false;
      }
  
      if (!validarSenha(senha)) {
        mostrarErro(senhaInput, "Senha fraca. Use 8+ caracteres, 1 maiúscula, 1 número e 1 símbolo.");
        valido = false;
      }
  
      if (senha !== confirmarSenha) {
        mostrarErro(confirmarSenhaInput, "As senhas não coincidem.");
        valido = false;
      }
  
      if (!valido) return;
  
      firebase.auth().createUserWithEmailAndPassword(email, senha)
      .then((userCredential) => {
        usuarioAutenticado = true;
        localStorage.setItem("usuarioLogado", "true");
        const user = userCredential.user;
        console.log("Usuário registrado:", user);
    
        const uid = user.uid; 
    
        // Salvando Usuário no Banco de dados
        return firebase.firestore().collection("usuarios").doc(uid).set({
          nomeCompleto: nome,
          nascimento: nascimento,
          telefone: telefone,
          email: email,
          criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(() => {
        alert("Cadastro realizado com sucesso!");
        window.location.href = "index.html";
      })
      .catch((error) => {
        console.error("Erro no cadastro:", error.message);
        alert("Erro ao cadastrar: " + error.message);
      });
    });
  });
  