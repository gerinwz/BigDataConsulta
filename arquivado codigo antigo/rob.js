const puppeteer = require('puppeteer');
const wppconnect = require('@wppconnect-team/wppconnect');

// Função para capturar um screenshot da página da web
async function captureScreenshot(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Defina as opções do screenshot
    const screenshotOptions = {
        path: 'screenshot.png', // Caminho onde o screenshot será salvo
        fullPage: true, // Captura a página inteira
    };

    // Capture o screenshot
    await page.screenshot(screenshotOptions);

    // Feche o navegador
    await browser.close();

    return 'screenshot.png'; // Retorna o nome do arquivo de screenshot
}

// Inicialize o wppconnect
wppconnect.create({
    session: 'whatsbot', // Nome da sessão do WhatsApp
    autoClose: false, // Mantém a sessão aberta
    puppeteerOptions: { args: ['--no-sandbox'] }, // Opções do Puppeteer
})
.then((client) => {
    client.onMessage(async (message) => {
        // Verifique se a mensagem é uma pergunta sobre um site
        if (message.body.toLowerCase().includes('site')) {
            const url = 'https://www.example.com'; // Substitua pela URL que deseja capturar

            try {
                const screenshotFileName = await captureScreenshot(url);
                await client.sendImage(message.from, screenshotFileName, 'Screenshot'); // Envie o screenshot como imagem
            } catch (error) {
                console.error('Erro ao capturar o screenshot:', error);
                await client.sendText(message.from, 'Ocorreu um erro ao capturar o screenshot.');
            }
        }
    });
})
.catch((error) => {
    console.error('Erro ao iniciar o wppconnect:', error);
});
