document.addEventListener("DOMContentLoaded", function () {
    chrome.runtime.sendMessage({ action: "getActiveTab" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error obteniendo pestaña:", chrome.runtime.lastError);
            return;
        }

        if (response && response.url) {
            document.getElementById("urlInput").value = response.url;
            document.getElementById("titleInput").value = response.title;
        } else {
            document.getElementById("urlInput").value = "No se pudo obtener la URL";
            document.getElementById("titleInput").value = "No se pudo obtener el título";
        }
    });
});


//STILL NO FIXED, PENDING
// document.querySelector("#response", function () {
//     //Running
// });


///
const likeIcon = document.getElementById('like');
const dislikeIcon = document.getElementById('dislike');

// Manejar el clic en el icono "like"
likeIcon.addEventListener('click', function() {
    // Si ya está seleccionado, deseleccionarlo
    if (likeIcon.classList.contains('liked')) {
        likeIcon.classList.remove('liked');
    } else {
        likeIcon.classList.add('liked');
        // Asegurarse de que "dislike" no esté seleccionado
        dislikeIcon.classList.remove('disliked');
    }
  });
//

import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from './br5f7-7uaaa-aaaaa-qaaca-cai&id=bkyz2-fmaaa-aaaaa-qaaaq-cai';

const canisterId = "br5f7-7uaaa-aaaaa-qaaca-cai&id=bkyz2-fmaaa-aaaaa-qaaaq-cai";

// Crear el agente de conexión con el ICP
const agent = new HttpAgent({ host: "https://ic0.app" });

// Si usas un navegador, asegúrate de conectar a la red de Internet Computer
if (window.ic) {
  agent.fetchRootKey().catch((err) => console.error("Error al obtener la clave raíz", err));
}

// Crear el actor para interactuar con el canister
const actor = Actor.createActor(idlFactory, {
  agent,
  canisterId,
});

const categorys = Actor.review

// Función para obtener el mensaje desde el canister
async function getMessage() {
  try {
    const message = await actor.get_message();
    console.log('Mensaje del canister:', message);
  } catch (error) {
    console.error('Error al obtener el mensaje:', error);
  }
}

// Función para actualizar el mensaje en el canister
async function setMessage(newMessage) {
  try {
    const response = await actor.set_message(newMessage);
    console.log(response);
  } catch (error) {
    console.error('Error al actualizar el mensaje:', error);
  }
}

// Llamadas de ejemplo
document.getElementById("getMessageBtn").addEventListener("click", getMessage);
document.getElementById("setMessageBtn").addEventListener("click", () => {
  const newMessage = document.getElementById("messageInput").value;
  setMessage(newMessage);
});