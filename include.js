async function incluir(id, arquivo) {
    const isGithub = window.location.hostname.includes('github.io');
    const basePath = isGithub ? '/projeto_unip/' : '/';
    
    const url = arquivo.startsWith('/') ? basePath + arquivo.substring(1) : basePath + arquivo;
    
    const response = await fetch(url);
    const html = await response.text();

    const container = document.getElementById(id);
    container.innerHTML = html;

    if (isGithub && window.location.pathname.includes('/', 1) && !window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('Index.html')) {
        const links = container.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('/')) {
                link.href = window.location.origin + basePath + href;
            }
        });
    }
}

incluir("header", "/header.html");
incluir("footer", "/footer.html");