const markdownpdf = require('markdown-pdf')
const path = require('path')
const fs = require('fs')

const bookPath = path.join(__dirname, 'output/book.pdf')
const markdownPath = path.join(__dirname, 'text')
const mdDocs = fs.readdirSync(markdownPath).filter(file => {
  return path.extname(file) === '.md'
}).map(file => path.join(markdownPath, file))
const paperFormat = 'A6'
markdownpdf({
  paperFormat,
}).concat.from(mdDocs).to(bookPath, function () {
  console.log('Created', paperFormat, bookPath)
})