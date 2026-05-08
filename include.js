async function incluir(id, arquivo) {
    const response = await fetch(arquivo);
    const html = await response.text();

    document.getElementById(id).innerHTML = html;
}

incluir("header", "/header.html");
incluir("footer", "/footer.html");