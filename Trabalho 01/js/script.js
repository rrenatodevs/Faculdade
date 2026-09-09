// Livraria Página Viva — script.js
// 1) Destaca no menu o link da página atual.
// 2) Dá um retorno visual ao enviar o formulário de contato.

document.addEventListener("DOMContentLoaded", function () {
    var linksMenu = document.querySelectorAll("nav a");
    var paginaAtual = window.location.pathname.split("/").pop() || "index.html";

    linksMenu.forEach(function (link) {
        var destino = link.getAttribute("href");
        if (destino === paginaAtual) {
            link.setAttribute("aria-current", "page");
        }
    });

    var formulario = document.querySelector("#formulario-contato");
    if (formulario) {
        formulario.addEventListener("submit", function (evento) {
            evento.preventDefault();
            var aviso = document.querySelector("#aviso-envio");
            if (aviso) {
                aviso.textContent = "Mensagem enviada! Responderemos em breve, obrigado por escrever para a Página Viva.";
            }
            formulario.reset();
        });
    }
});
