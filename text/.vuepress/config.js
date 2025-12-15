const toc = require('./toc')
const base = process.env.CI === 'github' ? '/nodebook/' : '/'
const baseUrl = 'https://node.whyun.com'
module.exports = {
  title: 'nodebook',
  description: 'Node 基础教程',
 host: '127.0.0.1',
  base,
  locales: {
    '/': {
      lang: 'zh-CN',
    },
  },
  dest: 'output',
  head: [
    [
      'script', // js 文件
      {
        src: '/js/seo.js',
        async: 'async',
        defer: 'defer'
      }
    ],
    [
      'meta', // baidu meta 标签
      {
        name: 'baidu-site-verification',
        content: 'codeva-8JR4taecPh'
      }
    ]

  ],
  chainWebpack(config) {
    // 修改图片规则
    const imagesRule = config.module.rule('images')

    imagesRule.uses.clear()

    imagesRule
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/img/[name].[ext]' // ❌ 不要 hash
      })
  },
  markdown: {
    lineNumbers: true,
    externalLinks: { target: '_blank', rel: 'nofollow noopener noreferrer' },
    extendMarkdown: md => {
      md.use(require('markdown-it-disable-url-encode'));
    },
    headers: {
      // 用到哪一级就提取哪一级
      level: [2, 3, 4, 5, 6],
    },
  },
  themeConfig: {
    sidebar: [
      {
        title: '基础教程',   // 必要的
        // path: '/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
        collapsable: false, // 可选的, 默认值是 true,
        sidebarDepth: 4,    // 可选的, 默认值是 1
        children: toc
      }
    ],
	  sidebarDepth: 4,
    logo: '/images/logo.png',
    nav: [
      { text: '首页', link: '/' },
      { text: 'github', link: 'https://github.com/yunnysunny/nodebook' },
      { text: '博客', link: 'https://blog.whyun.com' },
    ]
  },
  plugins:{
    autometa: {
      site: {
        name: 'nodebook',
        twitter: 'yunnysunny',
      },
      canonical_base: baseUrl,
    },
    'sitemap': {
      hostname: baseUrl,
      // 排除无实际内容的页面
      exclude: ["/404.html"]
    },
    '@vuepress/google-analytics': {
      ga: 'G-33K8GJ2J4R', 
    },
    '@vuepress/active-header-links': {},
    '@vuepress/back-to-top': {},
    '@vuepress/nprogress': {},
    'vuepress-plugin-code-copy': {
      align: 'bottom',
    },
    // 'vuepress-plugin-nuggets-style-copy': {},
    '@whyun/vuepress-plugin-pdf-export': {
      puppeteerLaunchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      },
      filter: function(page) {
        return !(['/SUMMARY.html'].includes(page.path))
      },
      sorter: function(a, b) {
        const pathA = a.path
        const pathB = b.path
        if (pathA < pathB) {
          return -1
        }
        if (pathA > pathB) {
          return 1
        }
        return 0
      }
    },
    'vuepress-plugin-clean-urls': {
      normalSuffix: '/',
      indexSuffix: '/',
      notFoundPath: '/404.html'
    }
  }

}
