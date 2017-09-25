const amazon = require('amazon-affiliate-api')
const asinMatcher = require('asin-matcher')
const parsePrice = require('parse-price')

const config = require('../../config')

let affiliate = null

if (config.aws.tag !== null)
  affiliate = amazon.createClient({
    awsId: config.aws.id,
    awsSecret: config.aws.secret,
    awsTag: config.aws.tag
  })

const selectors = {
  title: [
    '#btAsinTitle',
    '#productTitle',
    '#title',
  ].join(),
  price: [
    '#priceblock_saleprice',
    '#priceblock_dealprice',
    '#priceblock_ourprice',
  ].join(),
  suggested: [
    '#price > table > tbody > tr:nth-child(1) > td.a-span12.a-color-secondary.a-size-base > span'
  ].join(),
  prime: [
    '#priceBadging_feature_div .a-icon-prime',
    '#bbop-title',
  ].join()
}

// Process scraping
const processor = async window => {
  const document = window.document
  const $ = s => document.querySelector(s)

  // Select and clean product data
  let asin = asinMatcher.match(window.location.href)
  let title = $(selectors.title).textContent.trim()
  let price = parsePrice($(selectors.price).textContent)
  let suggested = parsePrice($(selectors.suggested).textContent)
  let prime = $(selectors.prime) ? true : false

  let response = {
    success: true,
    error: null,
    asin: asin.asin,
    url: window.location.href,
    item: {
      title,
      price,
      suggested,
      prime
    }
  }

  if (affiliate !== null) {
    let lookup = await affiliate.itemLookup({
      idType: asin.idType,
      itemId: asin.asin,
      responseGroup: 'ItemAttributes,Offers',
      domain: config.aws.domain
    })

    if (lookup.Items.Request.IsValid === 'True') {
      let item = lookup.Items.Item[0]
      console.log(item.Offers.Offer[0])
      console.log(item.Offers.Offer[0].OfferListing)
      console.log(item.Offers.Offer[0].OfferListing.IsEligibleForPrime)
      response.url = item.DetailPageURL
      response.item.prime = item.Offers.Offer[0].OfferListing.IsEligibleForPrime === '1'
    }

    let cart = await affiliate.cartCreate({
      items: [{
        ASIN: asin.asin,
        Quantity: 1
      }],
      domain: config.aws.domain
    })

    if (cart.Cart.Request.IsValid === 'True') {
      response.purchaseURL = cart.Cart.PurchaseURL
    }
  }

  return response
}

module.exports = processor
