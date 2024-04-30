function updateGiscus(path) {
  const iframe = document.querySelector('iframe.giscus-frame')
  if (iframe) {
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { term: path } } },
      'https://giscus.app',
    );
  }
}
function addHistoryEvent() {
  const _historyWrap = function(type) {
    const orig = history[type];
    const e = new Event(type);
    return function() {
      const rv = orig.apply(this, arguments);
      e.arguments = arguments;
      window.dispatchEvent(e);
      return rv;
    };
  };
  history.pushState = _historyWrap('pushState');
  history.replaceState = _historyWrap('replaceState');

  window.addEventListener('pushState', function(e) {
    console.log('change pushState', e);
    updateGiscus(e.arguments[2])
  });
  window.addEventListener('replaceState', function(e) {
    console.log('change replaceState', e);
    updateGiscus(e.arguments[2])
  });
}

function addGiscus () {
  const script = document.createElement('script')
  // use local file
  // script.src = 'script.js';
  script.src =
    'https://giscus.app/client.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  /**
   * data-repo="yunnysunny/nodebook"
        data-repo-id="MDEwOlJlcG9zaXRvcnk0MTAyNjM2Ng=="
        data-category="Q&A"
        data-category-id="MDE4OkRpc2N1c3Npb25DYXRlZ29yeTMyMTU4NDA2"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="zh-CN"
   */
  const attrs = {
    'data-repo': 'yunnysunny/nodebook',
    'data-repo-id': 'MDEwOlJlcG9zaXRvcnk0MTAyNjM2Ng==',
    'data-category': 'Q&A',
    'data-category-id': 'MDE4OkRpc2N1c3Npb25DYXRlZ29yeTMyMTU4NDA2',
    'data-mapping': 'pathname',
    'data-strict': '0',
    'data-reactions-enabled': '1',
    'data-emit-metadata': '0',
    'data-input-position': 'bottom',
    'data-theme': 'preferred_color_scheme',
    'data-lang': 'zh-CN',
  }
  for (const key in attrs) {
    script.setAttribute(key, attrs[key])
  }
  script.onload = () => {
    console.log('Script loaded successfuly');
  };
  script.onerror = () => {
    console.log('Error occurred while loading script');
  };
  document.querySelector('.page').appendChild(script)
  addHistoryEvent()
}
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

  const targetNode = document.body

  // 创建一个新的 MutationObserver
  const observer = new MutationObserver(() => {
    if (document.querySelector('.page')) {
      addGiscus();
      observer.disconnect(); // 销毁监视者
    }
  })

  const config = { childList: true, subtree: true } // 对哪些更改做出反应

  // 绑定目标节点并启动监视者
  observer.observe(targetNode, config)
}