import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "我的博客",
  description: "记录日常",
  base: '/blog/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      {
        text: '黑苹果', link: '/hackintosh/index'
     
      },
      {
        text: '面试', link: '/interview/index',
      },
      {
        text: '读书笔记', link: '/book/index',
      }
    ],

    sidebar: [
    
      {
        text: '黑苹果',
        items: [
          { text: '定制音频', link: '/hackintosh/定制音频' }
        ]
      },
      {
        text: '面试',
        items: [
          { text: '教育公司', link: '/interview/教育面试' }
        ]
      }, {
        text: '读书笔记',
        items: [
          { text: 'xx读后感', link: '/book/某书读后感' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
