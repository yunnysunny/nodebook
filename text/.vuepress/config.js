const toc = require('./toc')
const base = process.env.CI ? '/nodebook/' : '/'
const baseUrl = 'https://blog.whyun.com/nodebook'
module.exports = {
  title: 'nodebook',
  description: 'Node 基础教程',
  base,
  dest: 'output',
  head: [
    [
      'script', // js 文件
      {
        src: '/js/seo.js',
        async: true,
        defer: true
      }
    ]

  ],
  markdown: {
    lineNumbers: true,
    externalLinks: { target: '_blank', rel: 'nofollow noopener noreferrer' },
    extendMarkdown: md => {
      md.use(require('markdown-it-disable-url-encode'));
    }
  },
  themeConfig: {
    sidebar: [
      {
        title: '基础教程',   // 必要的
        // path: '/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
        collapsable: false, // 可选的, 默认值是 true,
        sidebarDepth: 3,    // 可选的, 默认值是 1
        children: toc
      }
    ],
	  sidebarDepth: 3,
    logo: 'https://excalidraw.com/apple-touch-icon.png',
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
    }
  }

}
