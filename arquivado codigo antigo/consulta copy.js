const puppeteer = require('puppeteer');

const urlAlvo = 'https://www.amazon.com.br/?brref=icp_contry_us';
const consultaProduto = 'gta v xbox';

(async function botAmazon(consulta) {
    const nomeBusca = consulta.replace(/ /g, '-');
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    const page = await browser.newPage();

    await page.goto(urlAlvo);
    await page.waitForSelector('#twotabsearchtextbox');
    await page.type('#twotabsearchtextbox', consulta);
    await page.keyboard.press('Enter');

    await page.waitForTimeout(2000);
    await page.waitForSelector('.a-price-whole');
    await page.screenshot({ path: `${nomeBusca}.png`, fullPage: true });

    let vlrpreco = '';
    const valor = await page.evaluate(() => {
        const centenaElement = document.querySelector('.a-price-whole');
        const centavosElement = document.querySelector('.a-price-fraction');

        if (centenaElement !== null && centavosElement !== null) {
            const centena = centenaElement.textContent;
            const centavos = centavosElement.textContent;
            const valorFormatado = `${centena}.${centavos}`;
            const semVirgula = valorFormatado.replace(',','.');
            return semVirgula;
        } else {
            vlrpreco = 0;
        }

        return vlrpreco;
    });

    await browser.close();
    console.log(valor);
})(consultaProduto);
