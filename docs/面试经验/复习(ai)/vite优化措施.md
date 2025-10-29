# Vite优化措施


Vite 作为基于原生 ES 模块（ESM）的前端构建工具，本身已具备出色的开发体验和构建性能，但在大型项目或复杂场景中，仍可通过针对性优化进一步提升效率。以下是 Vite 常用的性能优化措施，涵盖开发环境和生产环境：


### **一、开发环境优化（提升开发体验与热更新速度）**  
开发环境中，Vite 依赖原生 ESM 实现无打包开发，核心优化方向是**减少模块解析开销、加速热更新、降低资源加载耗时**。

#### 1. 优化依赖预构建（`optimizeDeps`）  
Vite 会在首次启动时预构建第三方依赖（将 CommonJS/UMD 转为 ESM，合并重复依赖），避免浏览器频繁请求零散模块。可通过以下配置优化：  
- **明确指定需要预构建的依赖**：通过 `optimizeDeps.include` 强制预构建未被自动检测到的依赖（如动态导入的包）。  
- **排除无需预构建的依赖**：通过 `optimizeDeps.exclude` 排除已为 ESM 格式的依赖（避免重复构建）。  
- **缓存预构建结果**：默认缓存到 `node_modules/.vite`，可通过 `optimizeDeps.cacheDir` 自定义缓存目录，避免每次启动重新构建。  

  示例：  
  ```javascript
  // vite.config.js
  export default defineConfig({
    optimizeDeps: {
      include: ['lodash-es', 'date-fns'], // 强制预构建这些依赖
      exclude: ['vue'], // 排除已为 ESM 的依赖
      cacheDir: '.vite/deps' // 自定义缓存目录
    }
  });
  ```


#### 2. 减少文件监听范围（`server.watch`）  
Vite 开发服务器通过 `chokidar` 监听文件变化触发热更新，大型项目中过多文件会导致监听开销增大。可通过 `server.watch.ignored` 排除无需监听的文件：  

```javascript
export default defineConfig({
  server: {
    watch: {
      ignored: [
        '**/node_modules/**', // 排除 node_modules（默认已排除，但可强化）
        '**/.git/**',
        '**/dist/**', // 排除构建产物
        '**/tests/**' // 排除测试文件（如无需实时更新）
      ]
    }
  }
});
```


#### 3. 限制热更新范围（`server.hmr`）  
热更新（HMR）时，Vite 默认更新所有关联模块，大型项目可通过 `server.hmr` 配置缩小范围：  
- 禁用不必要的 HMR 路径：`server.hmr.ignored` 排除无需热更新的文件（如静态资源）。  
- 启用 HMR 客户端日志：`server.hmr.logLevel: 'warn'` 减少冗余日志，提升控制台响应速度。  

```javascript
export default defineConfig({
  server: {
    hmr: {
      ignored: ['**/*.svg', '**/*.png'], // 静态资源不触发 HMR
      logLevel: 'warn'
    }
  }
});
```


#### 4. 优化静态资源处理  
- **图片等资源预加载**：通过 `import` 导入图片时，Vite 会自动处理为 ESM 模块，可配合 `?url` 或 `?raw` 后缀按需加载（避免一次性加载所有资源）。  
  ```javascript
  // 按需加载图片（开发时不提前解析）
  import imgUrl from './image.png?url'; 
  ```  
- **禁用不必要的资源转换**：如无需处理 `wasm` 或 `worker`，可通过 `assetsInclude` 限制资源类型：  
  ```javascript
  export default defineConfig({
    assetsInclude: ['**/*.png', '**/*.svg'] // 仅处理指定类型资源
  });
  ```


### **二、生产环境优化（减小包体积、提升加载速度）**  
生产环境中，Vite 基于 Rollup 打包，核心优化方向是**减小 bundle 体积、提升代码执行效率、优化资源加载策略**。

#### 1. 代码分割（Code Splitting）  
通过 Rollup 的代码分割功能，将代码拆分为更小的 chunk，实现按需加载：  
- **自动分割公共代码**：`build.rollupOptions.output.splitChunks` 提取多页面共享的依赖（如 `vue`、`lodash`）。  
- **按路由分割**：结合路由懒加载（如 Vue 的 `() => import('./page.vue')`），Vite 会自动将路由组件拆分为独立 chunk。  

  示例：  
  ```javascript
  export default defineConfig({
    build: {
      rollupOptions: {
        output: {
          // 分割公共依赖（如 node_modules 中的包）
          splitChunks: {
            chunks: 'all', // 对所有类型的 chunk（入口、异步）生效
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/, // 匹配 node_modules 中的依赖
                name: 'vendors', // chunk 名称
                chunks: 'all'
              }
            }
          }
        }
      }
    }
  });
  ```


#### 2. 启用 Tree-shaking 与死代码消除  
Vite 基于 Rollup 天然支持 Tree-shaking，但需确保：  
- 代码使用 ESM 格式（避免 CommonJS，因其无法被 Tree-shaking）。  
- `package.json` 中正确设置 `sideEffects`（标记无副作用的文件，允许 Rollup 安全删除）。  
  ```json
  // package.json
  {
    "sideEffects": [
      "*.css", // CSS 文件有副作用（不能删除）
      "*.vue" // Vue 单文件组件有副作用
    ]
  }
  ```  
- 生产环境默认启用 `build.minify`（默认 `'esbuild'`），可进一步压缩代码，删除死代码。  


#### 3. 压缩资源（JS/CSS/图片）  
- **JS 压缩**：Vite 默认用 `esbuild` 压缩 JS（速度快），如需更高压缩率，可改用 `terser`：  
  ```javascript
  import { defineConfig } from 'vite';
  import terser from '@rollup/plugin-terser';

  export default defineConfig({
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // 移除 console
          drop_debugger: true // 移除 debugger
        }
      }
    }
  });
  ```  

- **CSS 压缩**：使用 `css-minimizer-plugin` 压缩 CSS（需安装插件）：  
  ```javascript
  import { defineConfig } from 'vite';
  import cssMinimizer from 'css-minimizer-webpack-plugin'; // 注意：Vite 兼容部分 Webpack 插件

  export default defineConfig({
    build: {
      cssCodeSplit: true, // 拆分 CSS 为单独文件（默认 true）
      minify: 'esbuild',
      cssMinimizer: {
        implementation: cssMinimizer
      }
    }
  });
  ```  

- **图片压缩**：使用 `vite-plugin-imagemin` 压缩图片（支持 png、jpeg、svg 等）：  
  ```javascript
  import { defineConfig } from 'vite';
  import imagemin from 'vite-plugin-imagemin';

  export default defineConfig({
    plugins: [
      imagemin({
        gifsicle: { optimizationLevel: 7 }, // gif 压缩
        optipng: { optimizationLevel: 7 }, // png 压缩
        mozjpeg: { quality: 80 } // jpeg 压缩
      })
    ]
  });
  ```


#### 4. 静态资源 CDN 托管  
将静态资源（JS、CSS、图片）部署到 CDN，通过 `base` 配置设置公共路径，减少服务器压力并利用 CDN 缓存：  

```javascript
export default defineConfig({
  base: 'https://cdn.example.com/my-app/', // 生产环境资源的基础路径
  build: {
    assetsDir: 'assets', // 静态资源输出目录（默认 'assets'）
    assetsInlineLimit: 4096 // 小于 4kb 的资源内联为 base64（减少请求）
  }
});
```


#### 5. 排除外部依赖（`external`）  
对于通过 CDN 加载的依赖（如 `vue`、`react`），可通过 `build.rollupOptions.external` 排除，避免打包到 bundle 中：  

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['vue'], // 排除 vue
      output: {
        // 全局变量映射（CDN 引入的变量名）
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});
```  
需在 HTML 中手动引入 CDN 链接：  
```html
<script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></script>
```


#### 6. 优化构建目标（`build.target`）  
根据目标浏览器设置 `build.target`，避免生成不必要的 polyfill（减少代码体积）：  

```javascript
export default defineConfig({
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87'] // 针对现代浏览器
  }
});
```


#### 7. 生成压缩包（gzip/brotli）  
使用 `vite-plugin-compression` 生成 gzip 或 brotli 压缩文件，配合服务器（如 Nginx）启用压缩传输：  

```javascript
import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    compression({
      algorithm: 'gzip', // 压缩算法
      threshold: 10240, // 大于 10kb 的文件才压缩
      ext: '.gz'
    }),
    compression({
      algorithm: 'brotliCompress', // brotli 压缩（比 gzip 效率更高）
      threshold: 10240,
      ext: '.br'
    })
  ]
});
```


### **三、通用优化（开发/生产环境均适用）**  

#### 1. 合理使用别名（`resolve.alias`）  
通过别名简化模块路径，减少 Vite 解析模块时的查找开销：  

```javascript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 用 @ 代替 src 目录
      'components': path.resolve(__dirname, 'src/components')
    }
  }
});
```


#### 2. 减少插件数量  
Vite 插件会在构建流程中执行额外逻辑，过多插件会增加开销。仅保留必要插件，禁用开发/生产环境中无用的插件（如生产环境禁用 `vite-plugin-inspect`）。  

```javascript
export default defineConfig(({ mode }) => ({
  plugins: [
    mode === 'development' && inspect() // 仅开发环境启用 inspect 插件
  ].filter(Boolean)
}));
```


#### 3. 多页面应用（MPA）拆分  
对于大型应用，将单页应用（SPA）拆分为多页面应用，通过 `build.rollupOptions.input` 配置多个入口，避免单个 bundle 过大：  

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin.html') // 第二个页面入口
      }
    }
  }
});
```


### **总结**  
Vite 的性能优化需结合场景针对性处理：  
- **开发环境**：重点优化依赖预构建、文件监听和热更新，减少启动和更新耗时；  
- **生产环境**：聚焦代码分割、资源压缩、Tree-shaking 和 CDN 托管，减小包体积并提升加载速度。  

通过上述措施，可充分发挥 Vite 的性能优势，即使在大型项目中也能保持高效的开发体验和优秀的线上性能。