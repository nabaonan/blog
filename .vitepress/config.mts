import { defineConfig } from 'vitepress'

import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar';


// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "我的博客",
  // titleTemplate: 'hero',
  description: "记录日常",
  base: '/blog/',
  vite: {
    plugins: [
      AutoSidebar({
        path: '',
      })
    ],
  },
  
  
  themeConfig: {
    
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      {
        text: '黑苹果', link: '/hackintosh/概述'
      },
      {
        text: '面试', link: '/interview/概述',
      },
      {
        text: '读书笔记', link: '/book/概述',
      }
    ],
    

   

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nabaonan/blog' }
    ]
  }
})
