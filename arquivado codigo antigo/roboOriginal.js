const wppconnect = require('@wppconnect-team/wppconnect');
const puppeteer = require('puppeteer');

// Criando uma sessão no WhatsApp e configurando o Puppeteer
wppconnect.create({
    session: 'whatsbot',                // Nome da sessão no WhatsApp
    autoClose: false,                  // Manter a sessão aberta indefinidamente
    puppeteerOptions: { args: ['--no-sandbox'] }  // Opções do Puppeteer
})
.then((client) => {
    let waitingForProduct = false;     // Flag para controlar se estamos esperando o nome do produto

    // Evento que é acionado quando uma mensagem é recebida
    client.onMessage(async (message) => {
        console.log('Mensagem digitada pelo usuário: ' + message.body);

        // Verifica se estamos esperando o nome do produto
        if (!waitingForProduct) {
            sendProductInstructions(client, message.from);
            waitingForProduct = true;
        } else {
            const siteName = message.body;
            const siteInfo = await analyzeWebsite(siteName);
            sendWebsiteInfo(client, message.from, siteName, siteInfo);
            waitingForProduct = false;
        }
    });
})
.catch((error) => {
    console.log(error);
});

// Função para enviar instruções sobre como usar o bot
function sendProductInstructions(client, recipient) {
    client.sendText(recipient, 'Olá! Eu sou o verificador de sites. Escreva o nome do site que deseja analisar.')
        .then(() => {
            console.log('Mensagem de instruções enviada com sucesso');
        })
        .catch((error) => {
            console.error('Erro ao enviar mensagem de instruções: ', error);
        });
}

// Função para enviar informações do site ao usuário
function sendWebsiteInfo(client, recipient, siteName, info) {
    client.sendText(recipient, `Informações sobre o site solicitado:\n "${siteName}":\n${info}`)
        .then(() => {
            console.log('Mensagem de informações do site enviada com sucesso');
        })
        .catch((error) => {
            console.error('Erro ao enviar mensagem de informações do site: ', error);
        });
}

// Função para analisar um site no Reclame Aqui
async function analyzeWebsite(siteName) {
    const urlAlvo = 'https://www.reclameaqui.com.br/detector-site/';

    // Inicializa um navegador Puppeteer
    const browser = await puppeteer.launch({
        headless: false,               // Executa o navegador visível para testes
        defaultViewport: null,
    });
    
    // Abre uma nova página no navegador
    const page = await browser.newPage();

    // Acessa a página de destino
    await page.goto(urlAlvo);
    
    // Aguarda o elemento de busca aparecer na página
    await page.waitForSelector('[data-testid="input-search-box"]');
    
    // Digita o nome do site no campo de busca
    await page.type('[data-testid="input-search-box"]', siteName);
    
    // Clica no botão para analisar o site
    await page.waitForSelector('[aria-label="Analisar site"][data-testid="submit-search-box"]');
    await page.click('[aria-label="Analisar site"][data-testid="submit-search-box"]');
    
    // Aguarda um tempo para a página carregar
    await page.waitForTimeout(3000);

    // Substitua este seletor pelo seletor correto da nota do site
    const notaDoSite = await page.evaluate(() => {
        const notaElement = document.querySelector('span.go335529218');
        if (notaElement) {
            return notaElement.textContent;
        } else {
            return 'Nota não encontrada';
        }
    });

    // Captura as informações sobre o site
    const siteInfo = await page.evaluate(() => {
        const infoElement = document.querySelector('.go2800650232');
        if (infoElement) {
            return infoElement.textContent;
        } else {
            return 'Informações não encontradas';
        }
    });

    // Fecha o navegador após a consulta
    await browser.close();

    // Retorna a nota do site e as informações
    return `Nota do site: ${notaDoSite}\n${siteInfo}`;
}
