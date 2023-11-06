const wppconnect = require('@wppconnect-team/wppconnect');
const puppeteer = require('puppeteer');

wppconnect.create({
    session: 'whatsbot',
    autoClose: false,
    puppeteerOptions: { args: ['--no-sandbox'] }
})
.then((client) => {
    let waitingForProduct = false;

    client.onMessage(async (message) => {
        console.log('Mensagem digitada pelo usuário: ' + message.body);

        if (!waitingForProduct) {
            sendProductInstructions(client, message.from);
            waitingForProduct = true;
        } else {
            const productName = message.body;
            const productValue = await consultProductValue(productName);
            sendProductValue(client, message.from, productName, productValue);
            waitingForProduct = false;
        }
    });
})
.catch((error) => {
    console.log(error);
});

function sendProductInstructions(client, recipient) {
    client.sendText(recipient, 'Olá! Eu sou o verificador de produtos. Escreva o nome do produto que deseja consultar.')
        .then(() => {
            console.log('Mensagem de instruções enviada com sucesso');
        })
        .catch((error) => {
            console.error('Erro ao enviar mensagem de instruções: ', error);
        });
}

function sendProductValue(client, recipient, productName, value) {
    client.sendText(recipient, `O valor do produto "${productName}" é R$ ${value}.`)
        .then(() => {
            console.log('Mensagem de valor do produto enviada com sucesso');
        })
        .catch((error) => {
            console.error('Erro ao enviar mensagem de valor do produto: ', error);
        });
}

async function consultProductValue(productName) {
    const urlAlvo = 'https://www.amazon.com.br';
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    const page = await browser.newPage();

    await page.goto(urlAlvo);
    await page.waitForSelector('#twotabsearchtextbox');
    await page.type('#twotabsearchtextbox', productName);
    await page.keyboard.press('Enter');

    await page.waitForTimeout(2000);
    await page.waitForSelector('.a-price-whole');

    const productValue = await page.evaluate(() => {
        const centenaElement = document.querySelector('.a-price-whole');
        const centavosElement = document.querySelector('.a-price-fraction');

        if (centenaElement !== null && centavosElement !== null) {
            const centena = centenaElement.textContent;
            const centavos = centavosElement.textContent;
            const valorFormatado = `${centena}.${centavos}`;
            const semVirgula = valorFormatado.replace(',', '.');
            return semVirgula;
        } else {
            return 'Valor não disponível';
        }
    });

    await browser.close();
    return productValue;
}
