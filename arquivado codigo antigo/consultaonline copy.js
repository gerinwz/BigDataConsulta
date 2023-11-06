const puppeteer = require("puppeteer");

const urlAlvo = "https://www.reclameaqui.com.br/detector-site/";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  await page.goto(urlAlvo);
  await page.waitForSelector("#site"); // Esperar a página carregar
  await page.type("#site", "https://www.mercadolivre.com.br"); // Quando o campo estiver carregado, digitar a URL
  await page.keyboard.press("Enter"); // Pressionar a tecla "Enter"

  await page.waitForTimeout(3000);

  await page.waitForSelector(".col-cell");
  await page.screenshot({ path: "foradoar.png", fullPage: true });

  await browser.close();
})();
