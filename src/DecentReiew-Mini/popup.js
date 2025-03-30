const ICP_MAIN_PAGE = "ingresar el link de la pagina";  //INGRESAR EL LINK O DIRECCION DE LA PAGINA PRINCIPAL (O DE LA PAGINA DEL RATING DE LA PAGINA ACTUAL)
const ICP_CANISTER_URL = "https://xxxxxxxx.ic0.app"; //PONER URL DEL CANISTER

async function obtenerLikes(url) {
    try {
        const response = await fetch(`${ICP_CANISTER_URL}/getLikes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
        });

        const data = await response.json();
        return [data[0], data[1]]; 
    } catch (error) {
        console.error("Error al obtener likes de ICP:", error);
        return null;
    }
}


function actualizarIndicador(likes, dislikes) {
    const total = likes + dislikes;
    let estado = "Desconocido";
    let color = "gray";

    if (total > 0) {
        const ratio = likes / total;

        if (ratio > 0.7) {
            estado = "✅ Confiada por muchos usuarios.";
            color = "green";
        } else if (ratio >= 0.4) {
            estado = "⚠ Advertencias de información engañosa o alterada.";
            color = "yellow";
        } else {
            estado = "🚨 Página con advertencias negativas.";
            color = "red";
        }

        document.getElementById("detailsSection").style.display = "block"; 
    } else {
        document.getElementById("detailsSection").style.display = "none"; 
    }

    const messageStatus = document.getElementById("messageStatus");
    messageStatus.textContent = estado;
    messageStatus.style.color = color;
}

document.addEventListener("DOMContentLoaded", function () {
    const recargaBtn = document.querySelector("#recargaBtn");
    const openRatingPageBtn = document.querySelector("#openRatingPage");
    const viewDetailsPageBtn = document.querySelector("#viewDetailsPage");
    const titleInput = document.querySelector("#titleInput");
    const urlInput = document.querySelector("#urlInput");
    const likeIcon = document.getElementById("like");
    const dislikeIcon = document.getElementById("dislike");
    let userReaction = null; 
    let currentUrl = "";

    recargaBtn.addEventListener("click", async function () {
        chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            if (tabs.length > 0) {
                currentUrl = tabs[0].url;
                titleInput.value = tabs[0].title;
                urlInput.value = currentUrl;

                const likesData = await obtenerLikes(currentUrl);

                if (!likesData || (likesData[0] === 0 && likesData[1] === 0)) {
                    document.getElementById("messageStatus").textContent = "No encontrado";
                    document.getElementById("messageStatus").style.color = "gray";
                    document.getElementById("ratingSection").style.display = "block"; 
                    document.getElementById("detailsSection").style.display = "none";  
                } else {
                    actualizarIndicador(likesData[0], likesData[1]);
                    document.getElementById("ratingSection").style.display = "none";  
                }
            } else {
                titleInput.value = "No encontrado";
                urlInput.value = "";
            }
        });
    });

    openRatingPageBtn.addEventListener("click", function () {
        window.open(`${ICP_MAIN_PAGE}/add?url=${encodeURIComponent(currentUrl)}`, "_blank");
    });

    viewDetailsPageBtn.addEventListener("click", function () {
        window.open(`${ICP_MAIN_PAGE}/details?url=${encodeURIComponent(currentUrl)}`, "_blank");
    });

    likeIcon.addEventListener("click", function () {
        if (userReaction === "like") {
            likeIcon.style.color = ""; 
            userReaction = null;
        } else {
            likeIcon.style.color = "#00b300"; 
            dislikeIcon.style.color = ""; 
            userReaction = "like";
        }
    });

    dislikeIcon.addEventListener("click", function () {
        if (userReaction === "dislike") {
            dislikeIcon.style.color = ""; 
            userReaction = null;
        } else {
            dislikeIcon.style.color = "#b30000"; 
            likeIcon.style.color = ""; 
            userReaction = "dislike";
        }
    });
});
