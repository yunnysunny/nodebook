const fs = require('fs')
const path = require('path')
const toc = []
const mks = fs.readdirSync(path.join(__dirname, '../')).forEach((file) => {
  if (file === 'README.md'
    || file === 'SUMMARY.md'
    || file === '15_micro_service.md'
    || file === '16_openapi_doc.md') {
    return
  }
  if (file.endsWith('.md')) {
    toc.push(file.slice(0, -3))
  }
})
console.log(toc)
module.exports = toc