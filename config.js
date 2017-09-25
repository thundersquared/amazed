const path = require('path')
const fsp = require('fs-promise')

const config = {
  port: process.env.PORT || 3000,
  baseURL: process.env.BASE_URL || '/',
  aws: {
    id: process.env.AWS_ID || null,
    secret: process.env.AWS_SECRET || null,
    tag: process.env.AWS_TAG || null,
    country: process.env.AWS_COUNTRY || 'com'
  }
}

const envConfFile = path.resolve(__dirname, `config.${process.env.NODE_ENV}.js`)
if (process.env.NODE_ENV && fsp.existsSync(envConfFile)) {
  Object.assign(config, require(envConfFile))
}

config.aws.domain = `webservices.amazon.${config.aws.country}`

module.exports = config
