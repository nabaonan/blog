import { defineConfig } from 'vitepress'


import AutoNav from "vite-plugin-vitepress-auto-nav";


// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "nabaonan的博客",
  // titleTemplate: 'hero',
  description: "记录日常",
  base: '/blog/', 
  
  
  srcDir: 'docs',
  vite: {
  
      assetsInclude: ['**/*.PNG', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.BMP'],

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
