import {
    facebookProvider,
    googleProvider,
    signInPopup,
    signinEmailPassword,
  } from "./global.js";

import { getData } from "./data.js";  
  
  const form = document.getElementById("login-form");
  const loginBtn = document.getElementById("login-btn");
  const loginGoogleBtn = document.getElementById("google-login-btn");
  const loginFacebookBtn = document.getElementById("facebook-login-btn");
  
  async function loginWithInputs() {
    const email = document.getElementById("user-email").value;
    const password = document.getElementById("user-password").value;
    signinEmailPassword(email, password)
      .then(async (userCredential) => {
        const userData = await getData(userCredential.user.uid);
        if (userCredential.user.emailVerified) {
          if (userData.exists()) {
            const user = userData.data();
            if (user.adm) {
              // Redirigir a la parte de administrador si adm es true
              window.location.href = "./templates/admin.html";
            } else {
              // Redirigir a la parte de usuario normal si adm es false
              window.location.href = "./templates/home.html";
            }
          } else {
            alert("Usuario no encontrado en la base de datos");
          }
        } else {
          alert("Para iniciar sesión debes verificar el correo");
        }
      })
      .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
      });
  }
  
 document.addEventListener("DOMContentLoaded", () => {
    loginBtn.addEventListener("click", loginWithInputs);
    loginGoogleBtn.addEventListener("click", () => {
      signInPopup(googleProvider).then(() => {
        window.location.href = "./templates/home.html";
      }).catch(error => {
        console.error("Error during Google sign-in:", error);
      });
    });
    loginFacebookBtn.addEventListener("click", () => {
      signInPopup(facebookProvider).then(() => {
        window.location.href = "./templates/home.html";
      }).catch(error => {
        console.error("Error during Facebook sign-in:", error);
      });
    });
  }); 
