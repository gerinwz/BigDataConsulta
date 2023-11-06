const puppeteer = require('puppeteer');

const urlAlvo = 'https://www.reclameaqui.com.br/detector-site/';

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    const page = await browser.newPage();

    await page.goto(urlAlvo);
    await page.waitForSelector('[data-testid="input-search-box"]');
    await page.type('[data-testid="input-search-box"]', 'https://www.netshoes.com.br');
    await page.waitForSelector('[aria-label="Analisar site"][data-testid="submit-search-box"]');
    await page.click('[aria-label="Analisar site"][data-testid="submit-search-box"]');

    await page.waitForTimeout(10000);

    
    // Use page.evaluate para extrair os valores do site
    const notaDoSite = await page.evaluate(() => {
        const notaElement = document.querySelector('.go2353225771'); // Seletor da nota do site
        if (notaElement) {
            return notaElement.textContent;
        } else {
            return 'Nota não encontrada';
        }
    });

    const siteInfoElement = await page.$('.go2800650232'); // Seletor das informações do site
    let siteInfo = 'Informações não encontradas';

    if (siteInfoElement) {
        const innerHTML = await siteInfoElement.evaluate((element) => element.innerHTML);

        // Mapeie as diferentes opções e retorne uma resposta com base na opção encontrada
        if (innerHTML.includes('alt="GOOD"')) {
            siteInfo = 'O site é bom.';
        } else if (innerHTML.includes('alt="GreatIcon"')) {
            siteInfo = 'O site é ótimo.';
        } else if (innerHTML.includes('alt="NotRecommendedIcon"')) {
            siteInfo = 'O site não é recomendado.';
        } // E assim por diante, adicione mais condições conforme necessário
    }

    // Imprime os valores no console
    console.log('Nota do site:', notaDoSite);
    console.log('Informações do site:', siteInfo);

  //  await browser.close();
})();
