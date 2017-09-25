const config = require('../../config')

// Remove initial slash or remove base URL
const cleanURL = async url => {
  if (config.BASE_URL)
    return url.replace(config.BASE_URL, '').trim()
  else
    return url.substr(1).trim()
}

module.exports = cleanURL
