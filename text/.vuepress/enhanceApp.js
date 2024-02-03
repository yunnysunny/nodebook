export default ({
  Vue, // VuePress 正在使用的 Vue 构造函数
  options, // 附加到根实例的一些选项
  router, // 当前应用的路由实例
  siteData, // 站点元数据
  isServer
}) => {
  if (isServer) {
    return
  }
  console.log(siteData)
  const hash = location.hash
  const pages = siteData.pages
  if (hash) {
    let pathFromHash = hash
    let hashFromHash = ''
    if (hash.indexOf('?') !== -1) {
      const hashData = hash.split('?')
      pathFromHash = hashData[0]
      const realHashData = hashData[1]

      realHashData.split('&').forEach(item => {
        const pair = item.split('=')
        if (pair[0] === 'id') {
          const id = pair[1]
          const re = /_(\d+)\-(.*)/
          const result = re.exec(id)
          const index = result[1].split('').join('-')
          hashFromHash = `#_${index}-${result[2]}`
        }
      })
    }
    for (let i = 0, len = pages.length; i < len; i++) {
      const path = pages[i].regularPath
      const name = path.slice(0, -'.html'.length)
      if ('#' + name === pathFromHash) {
        let url = siteData.base + path.substring(1)
        if (hashFromHash) {
          url += hashFromHash
        }
        console.log('navigate to ', url)
        location.href = url
        break
      }
    }
  }
}