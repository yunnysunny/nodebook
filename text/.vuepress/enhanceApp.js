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
    for (let i = 0, len = pages.length; i < len; i++) {
      const path = pages[i].regularPath
      const name = path.slice(0, -'.html'.length)
      if ('#' + name === hash) {
        const url = siteData.base + path.substring(1)
        console.log('navigate to ', url)
        location.href = url
        break
      }
    }
  }
}