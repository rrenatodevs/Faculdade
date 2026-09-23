/*
Função do exemplo1.html
troca de parágrafos atráves de botão
*/
function myButton() {
    document.getElementById('frase').innerHTML = 'Aula de JavaScript';
    }
/*
Função do exemplo2.html
troca de imagens atráves de cliques
*/
function capturarPokemon() {
   var img = document.getElementById('pokemon');
    // já está na imagem que queremos
   if(img.src.match("avatar")){
       img.src = "image/arrowup.png";
   }
   // Muda para a imagem que queremos
   else {
       img.src = "image/avatar.png";
   }
}
/*
Função do exemplo3.html
*/
function mudarEstilo() {
    var paragrafo = document.getElementById('mensagem');
    if(paragrafo.style.color === "red") {
        // já está no estilo "mudado" -> volta ao original
        paragrafo.style.fontSize = "";
        paragrafo.style.color = "";
        paragrafo.style.border = "";
        paragrafo.style.padding = "";
    } else {
        // está no estilo original -> aplica o estilo novo
        paragrafo.style.fontSize = "30px";
        paragrafo.style.color = "red";
        paragrafo.style.border = "solid 1px";
        paragrafo.style.padding = "30px";
    }
}
/*
Função do exemplo4.html
*/
function verificar() {
    var num, texto;
    num = document.getElementById("numero").value;
    if(isNaN(num) || num < 1 || num > 10) {
        texto = "Entrada Inválida";
    }
    else {
        texto = "Entrada OK";
    }
    document.getElementById('mensagem').innerHTML = texto;
}