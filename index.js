const puppeteer = require("puppeteer")
const fs = require("fs")


const URL = "https://www.panini.es/shp_esp_es/comics.html"



//SCRAPER
const scrap = async (url) => {
  try {
    //navegador
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
    await page.goto(url)


    //cookies
    await page.waitForSelector("#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll")

    const acceptCookiesButton = await page.$("#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll")
    if (acceptCookiesButton) {
      await acceptCookiesButton.click()
    }


    //raspado
    await page.waitForSelector("li.item.product.product-item")

    const productArray = []
    await repeat(page, productArray)

    //volcado datos
    //console.log(productArray);
    fs.writeFile("./products.json", JSON.stringify(productArray), () => {
      console.log("✔ Escribiendose los datos");
    })


    //cerrar
    await browser.close()

  } catch (error) {
    console.error("❌ No funcionó el scraper:", error);
  }
}


//HELPER
const repeat = async (page, productsArray) => {

  try {
    // esperamos a cargar la página al completo antes de recoger datos
    await page.waitForSelector("li.item.product.product-item")

    // seleccionamos todos los productos
    const products = await page.$$("li.item.product.product-item")


    // recorremos el array de objetos
    for (const product of products) {
      const img = await product.$eval("img.product-image-photo", (el) => el.src)
      const name = await product.$eval("h3.product.name.product-item-name", (el) => el.textContent.trim())
      const price = await product.$eval("span.price", (el) => el.textContent)

      const productData = {
        img,
        name,
        price
      }

      productsArray.push(productData)
    }

    const nextPageButton = await page.$("li.item.pages-item-next > a.action.next");

    if (nextPageButton) {
      await nextPageButton.click()
      await repeat(page, productsArray)
    } else {
      return
    }


  } catch (error) {
    console.error("❌ Error en función repeat:", error);
  }
}




scrap(URL)