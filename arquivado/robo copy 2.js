// Importa as bibliotecas necessárias
const wppconnect = require('@wppconnect-team/wppconnect');
const puppeteer = require('puppeteer');

// Função para criar a sessão do WhatsApp
async function createWhatsAppSession() {
    try {
        const client = await wppconnect.create({
            session: 'whatsbot', // Nome da sessão do WhatsApp
            autoClose: false, // Mantém a sessão aberta
            puppeteerOptions: { args: ['--no-sandbox'] }, // Opções do Puppeteer
        });

        return client;
    } catch (error) {
        console.error('Erro ao criar a sessão do WhatsApp:', error);
        throw error; // Rejeita a promessa para indicar um erro
    }
}

// Função principal assíncrona
async function main() {
    try {
        const client = await createWhatsAppSession();

        let waitingForProduct = false; // Flag para controlar se estamos esperando o nome do produto

        // Evento que é acionado quando uma mensagem é recebida
        client.onMessage(async (message) => {
            console.log('Mensagem digitada pelo usuário: ' + message.body);

            // Verifica se estamos aguardando o nome do produto
            if (!waitingForProduct) {
                // Envia instruções sobre como usar o bot
                await sendProductInstructions(client, message.from);
                waitingForProduct = true;
            } else {
                // Extrai o nome do site da mensagem recebida
                const siteName = message.body;

                // Verifica se o siteName é uma URL válida
                if (!isValidURL(siteName)) {
                    // Se não for uma URL válida, envia uma mensagem de URL inválida
                    await sendInvalidURLMessage(client, message.from);
                } else {
                    // Se for uma URL válida, realiza a análise do site
                    const siteInfo = await analyzeWebsite(siteName, client);
                    // Envia informações do site ao usuário
                    await sendWebsiteInfo(client, message.from, siteName, siteInfo);
                    waitingForProduct = false; // Retorna ao estado de espera
                }
            }
        });
    } catch (error) {
        console.error('Erro no processo principal:', error);
    }
}

// Função para enviar instruções sobre como usar o bot
async function sendProductInstructions(client, recipient) {
    try {
        // Envia uma mensagem de instruções para o usuário
        await client.sendText(recipient, 'Olá! Eu sou o verificador de sites. \n Por favor escreva o nome do site que deseja analisar. ');
        console.log('Mensagem de instruções enviada com sucesso');
    } catch (error) {
        console.error('Erro ao enviar mensagem de instruções: ', error);
    }
}

// Função para enviar informações do site ao usuário
async function sendWebsiteInfo(client, recipient, siteName, info) {
    try {
        // Envia informações do site para o usuário
        await client.sendText(recipient, `Informações sobre o site solicitado:\n "${siteName}":\n${info}`);
        console.log('Mensagem de informações do site enviada com sucesso');
    } catch (error) {
        console.error('Erro ao enviar mensagem de informações do site: ', error);
    }
}

// Função para enviar mensagem de URL inválida
async function sendInvalidURLMessage(client, recipient) {
    try {
        // Envia uma mensagem de URL inválida para o usuário
        await client.sendText(recipient, 'URL inválida. Por favor, insira uma URL válida no formato: www.nomedosite.com.br');
        console.log('Mensagem de URL inválida enviada com sucesso');
    } catch (error) {
        console.error('Erro ao enviar mensagem de URL inválida: ', error);
    }
}

// Função para verificar se a URL está em um formato válido
function isValidURL(url) {
    // Define um padrão de expressão regular para verificar o formato da URL
    const urlFormat = /^(https?:\/\/)?([\w\d]+\.)+\w{2,}(\/.*)?$/;
    // Testa se a URL corresponde ao padrão e retorna verdadeiro ou falso
    return urlFormat.test(url);
}

// Função para analisar um site no Reclame Aqui
async function analyzeWebsite(siteName, client) {
    try {
        const urlAlvo = 'https://www.reclameaqui.com.br/detector-site/';
        const browser = await puppeteer.launch({
            headless: false, // Executar o navegador invisível (sem interface gráfica) para testes
            defaultViewport: null,
        });
        const page = await browser.newPage();

        // Navega para a página de destino
        await page.goto(urlAlvo);

        // Aguarda até que o seletor '[data-testid="input-search-box"]' seja visível na página
        await page.waitForSelector('[data-testid="input-search-box"]');

        // Insere o nome do site (siteName) no campo de entrada '[data-testid="input-search-box"]'
        await page.type('[data-testid="input-search-box"]', siteName);

        // Aguarda até que o seletor '[aria-label="Analisar site"][data-testid="submit-search-box"]' seja visível na página
        await page.waitForSelector('[aria-label="Analisar site"][data-testid="submit-search-box"]');

        // Clica no botão '[aria-label="Analisar site"][data-testid="submit-search-box"]' para iniciar a análise do site
        await page.click('[aria-label="Analisar site"][data-testid="submit-search-box"]');
        
        // Aguarda até que um dos seletores seja visível na página
        const selectors = ['span.go335529218', 'span.go2353225771'];
        let notaDoSite = '';

        for (const selector of selectors) {
            try {
                await page.waitForSelector(selector, { timeout: 10000 }); // Espera por até 10 segundos
                const element = await page.$(selector);
                if (element) {
                    notaDoSite = await element.evaluate(el => el.textContent);
                    break; // Sai do loop se encontrar um elemento
                }
            } catch (error) {
                // Ignora erros de seleção e continua verificando outros seletores
            }
        }

        if (!notaDoSite) {
            // Se nenhum dos seletores foi encontrado, retorna o valor de span.go2308599948
            const element = await page.waitForSelector('span.go2308599948', { timeout: 10000 }); // Espera por até 10 segundos
            if (element) {
                notaDoSite = await element.evaluate(el => el.textContent);
            }
        }

        // Captura as informações sobre o site
        // Usa a função 'page.evaluate()' para executar código JavaScript dentro do contexto da página do Puppeteer.
        const siteInfo = await page.evaluate(() => {
            // Procura um elemento HTML que corresponda ao seletor '.go2353225771' na página.
            const infoElement = document.querySelector('.go2353225771');

            // Verifica se o elemento foi encontrado.
            if (infoElement) {
                // Se o elemento foi encontrado, retorna o
                // conteúdo de texto desse elemento.
                return infoElement.textContent;
            } else {
                // Se o elemento não foi encontrado, retorna uma mensagem indicando que as informações não foram encontradas.
                return 'Informações não encontradas';
            }
        });

        // Fecha o navegador após a consulta
        await browser.close();

        // Retorna a nota do site e as informações
        return `Nota do site: ${notaDoSite}\n${siteInfo}`;
    } catch (error) {
        console.error('Erro ao analisar o site:', error);
        throw error;
    }
}

// Chama a função principal
main();
