const {send} = require('micro')

// Handle errors or exceptional paths
const handleErrors = fn => async (req, res) => {
  // Ignore Favicon
  if (req.url === '/favicon.ico')
    return

  try {
    return await fn(req, res)
  } catch (err) {
    console.log(err.stack)
    send(res, 500, 'Something went wrong!')
  }
}

module.exports = handleErrors
