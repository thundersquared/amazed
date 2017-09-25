const {send} = require('micro')
const {JSDOM} = require('jsdom')
const parsePrice = require('parse-price')
const regex = /https?:\/\/(.*amazon\..*\/|.*amazon\..*\/gp\/product\/.*|.*amazon\..*\/.*\/dp\/.*|.*amazon\..*\/dp\/.*|.*amazon\..*\/o\/ASIN\/.*|.*amazon\..*\/gp\/offer-listing\/.*|.*amazon\..*\/.*\/ASIN\/.*|.*amazon\..*\/gp\/product\/images\/.*|.*amazon\..*\/gp\/aw\/d\/.*|.*amazon\..*\/s\/.*|.*amazon\..*\/gp\/redirect.html.*|www\.amzn\.com\/.*|amzn\.com\/.*)/

const handleErrors = fn => async (req, res) => {
  // Ignore Favicon
  if (req.url === '/favicon.ico')
    return ''

  try {
    return await fn(req, res)
  } catch (err) {
    console.log(err.stack)
    send(res, 500, 'My custom error!')
  }
}

const processProduct = async window => {
  const document = window.document
  const $ = s => document.querySelector(s)

  // Select and clean product data
  let title = $('#productTitle').textContent.trim()
  let price = parsePrice($('#priceblock_ourprice,#priceblock_dealprice').textContent)
  let suggested = parsePrice($('#price > table > tbody > tr:nth-child(1) > td.a-span12.a-color-secondary.a-size-base > span').textContent)
  let prime = $('#bbopCheckboxSection > span') ? true : false

  return {
    success: true,
    error: null,
    url: window.location.href,
    item: {
      title,
      price,
      suggested,
      prime
    }
  }
}

module.exports = handleErrors(async (req, res) => {
  // Remove initial slash
  let url = req.url.substr(1).trim()

  // Load URL
  let { window } = await JSDOM.fromURL(url)

  let response

  // Check if is Amazon Product Page
  if (regex.test(window.location.href)) {
    response = await processProduct(window)
  } else {
    response = {
      success: false,
      error: "URL doesn't match Amazon Product page links",
      url
    }
  }

  return send(res, 200, response)
})