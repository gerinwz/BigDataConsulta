const puppeteer = require("puppeteer");

const urlAlvo = "https://www.reclameaqui.com.br/detector-site/";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--disable-java"],
  });
  const page = await browser.newPage();

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

  try {
    await page.waitForSelector('[data-testid="input-search-box"]');
    await page.type(
      '[data-testid="input-search-box"]',
      "https://www.mercadolivre.com.br"
    );

    await page.waitForSelector(
      '[aria-label="Analisar site"][data-testid="submit-search-box"]'
    );
    await page.click(
      '[aria-label="Analisar site"][data-testid="submit-search-box"]'
    );

    await page.waitForTimeout(1000);
    await page.waitForSelector(".go4144685700");
    await page.click(".go4144685700");

    // Wait for the element to appear
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
    }
  } catch (error) {
    console.error("Ocorreu um erro durante a execução do código:", error);
  }

  // Feche o navegador no final.
  // await browser.close();
})();
