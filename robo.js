// Importa as bibliotecas necessárias
const wppconnect = require("@wppconnect-team/wppconnect");
const puppeteer = require("puppeteer");

// Função para criar a sessão do WhatsApp
async function createWhatsAppSession() {
  try {
    const client = await wppconnect.create({
      session: "whatsbot", // Nome da sessão do WhatsApp
      autoClose: false, // Mantém a sessão aberta
      puppeteerOptions: { args: ["--no-sandbox"] }, // Opções do Puppeteer
    });

    return client;
  } catch (error) {
    console.error("Erro ao criar a sessão do WhatsApp:", error);
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
      console.log("Mensagem digitada pelo usuário: " + message.body);

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
          // Realiza a análise do site e envia as três imagens separadamente
          const siteImagePath = await analyzeWebsite(siteName, client);
          const figure1ImagePath = "Figure_1.png"; // Caminho para o arquivo Figure_1.png
          const figure2ImagePath = "Figure_2.png"; // Caminho para o arquivo Figure_2.png

          // Envia as três imagens separadamente ao usuário
          await client.sendFile(message.from, siteImagePath, "Site.png");
          await client.sendFile(message.from, "Figure_1.png", "Figure_1.png");
          await client.sendFile(message.from, "Figure_2.png", "Figure_2.png");
          await client.sendFile(message.from, "wordcloud.png", "wordcloud.png");

          waitingForProduct = false; // Retorna ao estado de espera
        }
      }
    });
  } catch (error) {
    console.error("Erro no processo principal:", error);
  }
}

// Função para enviar instruções sobre como usar o bot
async function sendProductInstructions(client, recipient) {
  try {
    // Envia uma mensagem de instruções para o usuário
    await client.sendText(
      recipient,
      "Olá! Eu sou o verificador de sites. \n Por favor escreva o nome do site que deseja analisar. \n  "
    );
    console.log("Mensagem de instruções enviada com sucesso");
  } catch (error) {
    console.error("Erro ao enviar mensagem de instruções: ", error);
  }
}

// Função para enviar informações do site ao usuário
async function sendWebsiteInfo(client, recipient, siteName, info) {
  try {
    // Envia informações do site para o usuário
    await client.sendText(
      recipient,
      `Informações sobre o site solicitado:\n "${siteName}":\n${info}`
    );
    console.log("Mensagem de informações do site enviada com sucesso");
  } catch (error) {
    console.error("Erro ao enviar mensagem de informações do site: ", error);
  }
}

// Função para enviar mensagem de URL inválida
async function sendInvalidURLMessage(client, recipient) {
  try {
    // Envia uma mensagem de URL inválida para o usuário
    await client.sendText(
      recipient,
      "URL inválida. Por favor, insira uma URL válida nos formatos abaixo: \nhttps://www.nomedosite.com.br \nou\nhttp://www.nomedosite.com.br"
    );
    console.log("Mensagem de URL inválida enviada com sucesso");
  } catch (error) {
    console.error("Erro ao enviar mensagem de URL inválida: ", error);
  }
}

// Função para verificar se a URL está em um formato válido
function isValidURL(url) {
  try {
    // Use a classe URL do Node.js para analisar a URL
    const parsedURL = new URL(url);

    // Verifique se o protocolo é 'http' ou 'https'
    if (parsedURL.protocol !== "http:" && parsedURL.protocol !== "https:") {
      return false;
    }

    // Verifique se o hostname (domínio) é válido
    const hostnameParts = parsedURL.hostname.split(".");
    if (hostnameParts.length < 2) {
      return false; // Deve haver pelo menos um domínio e um TLD (com, org, etc.)
    }

    // Verifique se o caminho (path) é válido (opcional)
    // Pode ser personalizado de acordo com seus requisitos

    // Se todas as verificações passarem, a URL é válida
    return true;
  } catch (error) {
    // Se ocorrer um erro ao analisar a URL, ela é considerada inválida
    return false;
  }
}

// Função para analisar um site no Reclame Aqui
async function analyzeWebsite(siteName, client) {
  try {
    const urlAlvo = "https://www.reclameaqui.com.br/detector-site/";
    const browser = await puppeteer.launch({
      headless: false, // Executar o navegador invisível (sem interface gráfica) para testes
      defaultViewport: null,
    });
    const page = await browser.newPage();

    let siteImagePath; // Declare a variável aqui

    // Navega para a página de destino
    try {
      await page.goto(urlAlvo);

      await page.waitForSelector('a[aria-label="allow cookies"].cc-btn');
      await page.click('a[aria-label="allow cookies"].cc-btn');
    } catch (error) {
      console.error(
        'Não foi possível encontrar o botão "Aceitar todos os cookies".',
        error
      );
    }
    // Aguarda até que o seletor '[data-testid="input-search-box"]' seja visível na página
    await page.waitForSelector('[data-testid="input-search-box"]');

    // Insere o nome do site (siteName) no campo de entrada '[data-testid="input-search-box"]'
    await page.type('[data-testid="input-search-box"]', siteName);

    // Aguarda até que o seletor '[aria-label="Analisar site"][data-testid="submit-search-box"]' seja visível na página
    await page.waitForSelector(
      '[aria-label="Analisar site"][data-testid="submit-search-box"]'
    );

    // Clica no botão '[aria-label="Analisar site"][data-testid="submit-search-box"]' para iniciar a análise do site
    await page.click(
      '[aria-label="Analisar site"][data-testid="submit-search-box"]'
    );
    await page.waitForTimeout(1000);
    await page.waitForSelector(".go4144685700");
    await page.click(".go4144685700");

    await page.waitForSelector(".sc-10br7v8-0.ipZBaY");

    // Get the bounding box of the element you want to capture
    const elementHandle = await page.$(".sc-10br7v8-0.ipZBaY");
    const boundingBox = await elementHandle.boundingBox();

    if (boundingBox) {
      // Capture the screenshot of the specified element
      await page.screenshot({
        path: "Site.png",
        clip: {
          x: boundingBox.x,
          y: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      });
      siteImagePath = "Site.png"; // Atribua o valor aqui
    }

    // Fecha o navegador após a consulta
    await browser.close();

    // Retorna o caminho da imagem capturada
    return siteImagePath;
  } catch (error) {
    console.error("Erro ao analisar o site:", error);
    throw error;
  }
}

// Chama a função principal
main();
