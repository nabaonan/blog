import { defineConfig } from 'vitepress'


import AutoNav from "vite-plugin-vitepress-auto-nav";


// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "我的博客",
  // titleTemplate: 'hero',
  description: "记录日常",
  base: '/blog/', 
  
  srcDir: 'docs',
  vite: {
  
    plugins: [
      AutoNav({
        
        // Custom configurations
      }),
      // AutoSidebar({
      //   path: '',
      // })
    ],
  },
  
  
  themeConfig: {
    

  
    

   

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nabaonan/blog' }
    ]
  }
})
