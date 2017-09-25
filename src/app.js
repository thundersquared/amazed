const asinMatcher = require('asin-matcher')
const {JSDOM} = require('jsdom')

const handleErrors = require('./helpers/errorHandler')
const cleanURL = require('./helpers/cleanURL')
const processor = require('./helpers/processor')

module.exports = handleErrors(async (req, res) => {
  let response
  let url = await cleanURL(req.url)

  // Load URL
  let { window } = await JSDOM.fromURL(url)

  // Check if is Amazon Product Page
  if (asinMatcher.isProductLink(window.location.href)) {
    response = await processor(window)
  } else {
    response = {
      success: false,
      error: "URL doesn't match Amazon Product page links",
      asin: asinMatcher.getAsin(window.location.href),
      url
    }
  }

  return response
})
