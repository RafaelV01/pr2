import { getAllUsers, addData, deleteDataUser, getData, db } from "./data.js";
import { logOut, createUserEmailPassword, sendEmail, archivoimg } from "./global.js";
import { setDoc, collection, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const logoutBtn = document.getElementById("logout-btn");
const viewUsersBtn = document.getElementById("view-users-btn");
const createUserBtn = document.getElementById("create-user-btn");
const usersListElement = document.getElementById("users-list");

logoutBtn.addEventListener("click", () => {
  logOut().then(() => {
    window.location.href = "../index.html";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  usersListElement.style.display = "none";

  viewUsersBtn.addEventListener("click", async () => {
    try {
      usersListElement.innerHTML = "";

      const users = await getAllUsers();
      renderUsers(users);

      const ccInput = document.createElement("input");
      ccInput.type = "text";
      ccInput.placeholder = "Buscar por CC";
      const searchBtn = document.createElement("button");
      searchBtn.textContent = "Buscar";
      searchBtn.addEventListener("click", async () => {
        const ccValue = ccInput.value.trim().toLowerCase();
        const filteredUsers = users.filter(user => user.cc.toLowerCase().includes(ccValue));
        filteredUsers.sort((a, b) => (a.fullName > b.fullName) ? 1 : ((b.fullName > a.fullName) ? -1 : 0));
        renderUsers(filteredUsers);
      });

      usersListElement.appendChild(ccInput);
      usersListElement.appendChild(searchBtn);

      usersListElement.style.display = "block";
    } catch (error) {
      console.error("Error al obtener la lista de usuarios:", error);
    }
  });

  createUserBtn.addEventListener("click", () => {
    const card = document.createElement("div");
    card.className = "card";

    const form = document.createElement("form");

    const table = document.createElement("table");

    const fullNameRow = table.insertRow();
    const fullNameLabel = fullNameRow.insertCell();
    fullNameLabel.textContent = "Nombre:";
    const fullNameInputCell = fullNameRow.insertCell();
    const fullNameInput = document.createElement("input");
    fullNameInput.type = "text";
    fullNameInput.id = "full-name";
    fullNameInput.name = "fullName";
    fullNameInputCell.appendChild(fullNameInput);

    const emailRow = table.insertRow();
    const emailLabel = emailRow.insertCell();
    emailLabel.textContent = "Correo electrónico:";
    const emailInputCell = emailRow.insertCell();
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.id = "email";
    emailInput.name = "email";
    emailInputCell.appendChild(emailInput);

    const passwordRow = table.insertRow();
    const passwordLabel = passwordRow.insertCell();
    passwordLabel.textContent = "Contraseña:";
    const passwordInputCell = passwordRow.insertCell();
    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.id = "password";
    passwordInput.name = "password";
    passwordInputCell.appendChild(passwordInput);

    const ccRow = table.insertRow();
    const ccLabel = ccRow.insertCell();
    ccLabel.textContent = "CC:";
    const ccInputCell = ccRow.insertCell();
    const ccInput = document.createElement("input");
    ccInput.type = "text";
    ccInput.id = "cc";
    ccInput.name = "cc";
    ccInputCell.appendChild(ccInput);

    const imageRow = table.insertRow();
    const imageLabel = imageRow.insertCell();
    imageLabel.textContent = "Imagen:";
    const imageInputCell = imageRow.insertCell();
    const imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.id = "fileimg";
    imageInput.name = "fileimg";
    imageInputCell.appendChild(imageInput);

    const createButton = document.createElement("button");
    createButton.textContent = "Crear Usuario";
    createButton.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const userCredential = await createUserEmailPassword(emailInput.value, passwordInput.value);
        const user = userCredential.user;
        await sendEmail(user);

        let archivourl = '';
        const urlimagen = document.getElementById('fileimg').files[0];
        if (urlimagen) {
          archivourl = await archivoimg(urlimagen, fullNameInput.value);
        }

        await addData(user.uid, fullNameInput.value, emailInput.value, ccInput.value, archivourl);
        alert("Usuario creado correctamente. Se ha enviado un correo de verificación.");
        card.remove();
      } catch (error) {
        console.error("Error al crear usuario:", error);
        alert("Error al crear usuario. Consulte la consola para más detalles.");
      }
    });

    form.appendChild(table);
    form.appendChild(createButton);
    card.appendChild(form);
    usersListElement.appendChild(card);
  });

  async function delete_data(docUserId) {
    console.log("Tratando de borrar");

    try {
      const action = deleteDataUser(docUserId);
      const borrar = await action;
      alert("Usuario eliminado.");
      location.reload();
    } catch (error) {
      console.error("Error al eliminar datos de usuario:", error.code);

      switch (error.code) {
        case 'permission-denied':
          alert("Permisos insuficientes para eliminar el usuario.");
          break;
        case 'not-found':
          alert("Usuario no encontrado.");
          break;
        default:
          alert("Error al eliminar usuario: " + error.message);
          break;
      }
    }
  }

  async function edit_user(userId) {
    const userData = await getData(userId);

    const card = document.createElement("div");
    card.className = "card";

    const form = document.createElement("form");

    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Nombre:";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = userData.fullName || '';
    nameInput.id = "edit-full-name";
    nameInput.name = "editFullName";

    const emailLabel = document.createElement("label");
    emailLabel.textContent = "Correo electrónico:";
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.value = userData.email || '';
    emailInput.id = "edit-email";
    emailInput.name = "editEmail";

    const ccLabel = document.createElement("label");
    ccLabel.textContent = "CC:";
    const ccInput = document.createElement("input");
    ccInput.type = "text";
    ccInput.value = userData.cc || '';
    ccInput.id = "edit-cc";
    ccInput.name = "editCC";

    const updateButton = document.createElement("button");
    updateButton.textContent = "Actualizar";
    updateButton.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const docRef = doc(db, "usuarios", userId);
        await setDoc(docRef, {
          fullName: nameInput.value || userData.fullName,
          email: emailInput.value || userData.email,
          cc: ccInput.value || userData.cc
        }, { merge: true });

        alert("Datos de usuario actualizados.");
        card.remove();
        const users = await getAllUsers();
        renderUsers(users);
      } catch (error) {
        console.error("Error al actualizar datos del usuario:", error.message);
        alert("Error al actualizar datos del usuario. Consulte la consola para más detalles.");
      }
    });

    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    form.appendChild(emailLabel);
    form.appendChild(emailInput);
    form.appendChild(ccLabel);
    form.appendChild(ccInput);
    form.appendChild(updateButton);
    card.appendChild(form);

    usersListElement.appendChild(card);
  }

  function renderUsers(users) {
    usersListElement.innerHTML = "";
    users.forEach((user) => {
      const listItem = document.createElement("li");
      listItem.className = "user-list-item";

      if (user.imageUrl) {
        const userImage = document.createElement("img");
        userImage.src = user.imageUrl;
        userImage.alt = `Imagen de ${user.fullName}`;
        userImage.className = "user-image";
        listItem.appendChild(userImage);
      }

      const userInfo = document.createElement("div");
      userInfo.textContent = `ID: ${user.id}, Nombre: ${user.fullName}, Email: ${user.email}, CC: ${user.cc}`;
      userInfo.className = "user-info";

      const editButton = document.createElement("button");
      editButton.textContent = "Editar";
      editButton.className = "edit-button";
      editButton.addEventListener("click", () => edit_user(user.id));

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Eliminar";
      deleteButton.className = "delete-button";
      deleteButton.addEventListener("click", () => delete_data(user.id));

      listItem.appendChild(userInfo);
      listItem.appendChild(editButton);
      listItem.appendChild(deleteButton);

      usersListElement.appendChild(listItem);
    });
  }
});
