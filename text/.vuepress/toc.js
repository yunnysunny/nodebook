const fs = require('fs')
const path = require('path')
const toc = []
const mks = fs.readdirSync(path.join(__dirname, '../')).forEach((file) => {
  if (file === 'README.md' || file === 'SUMMARY.md') {
    return
  }
  if (file.endsWith('.md')) {
    toc.push(file.slice(0, -3))
  }
})
console.log(toc)
module.exports = toc