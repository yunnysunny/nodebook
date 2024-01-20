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
  console.log('test==',location.href)
  const hash = location.hash
  const pages = siteData.pages
  if (hash) {
    for (let i = 0, len = pages.length; i < len; i++) {
      const path = pages[i].regularPath
      if ('#' + path === hash) {
        location.href = siteData.base + path
        break
      }
    }
  }
}