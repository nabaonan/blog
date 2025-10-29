# Vue2和vue3区别


Vue2 和 Vue3 是 Vue 框架的两个主要版本，Vue3 基于 Vue2 的经验进行了全面重构，在核心架构、响应式系统、API 设计、性能等方面有显著升级。以下是两者的核心区别：


### 一、核心架构与开发语言
- **Vue2**：  
  核心代码基于 JavaScript 编写，架构相对集中，未做模块化拆分，对 TypeScript 的支持需要额外配置（如 `vue-class-component`），不够原生。  

- **Vue3**：  
  核心代码用 **TypeScript** 重写，架构采用 **模块化设计**（将核心功能拆分为 `@vue/reactivity`、`@vue/runtime-core` 等独立包），天然支持 TypeScript，类型推断更友好。同时支持「树摇（Tree-shaking）」，未使用的 API 会被打包工具剔除，减小最终 bundle 体积。  


### 二、响应式系统
响应式系统是 Vue 的核心，负责追踪数据变化并自动更新 DOM，两者实现方式差异巨大：  

- **Vue2**：  
  基于 `Object.defineProperty` 实现响应式，通过遍历对象的 **已有属性** 定义 getter/setter 来追踪变化。  
  **局限**：  
  - 无法直接监听 **对象新增/删除属性**（需用 `this.$set` 或 `this.$delete` 手动触发更新）；  
  - 无法监听 **数组索引变化**（如 `arr[0] = 1`）和 **数组长度修改**（如 `arr.length = 0`），需通过数组变异方法（`push`、`splice` 等）触发更新。  

- **Vue3**：  
  基于 **Proxy** 实现响应式，直接代理整个对象（而非属性），能原生支持：  
  - 监听对象新增/删除属性（无需 `$set`）；  
  - 监听数组索引变化、长度修改；  
  - 支持 Map、Set 等复杂数据结构的响应式。  
  同时，Vue3 的响应式系统与渲染层解耦，可单独作为库（`@vue/reactivity`）使用。  


### 三、API 风格
- **Vue2**：以 **Options API** 为主  
  组件逻辑按 `data`、`methods`、`computed`、`watch`、`生命周期钩子` 等「选项」分类，代码结构清晰，但复杂组件中，相关逻辑可能分散在不同选项中（如一个表单的校验、提交、重置逻辑可能分属 `methods`、`watch`、`mounted`），维护成本高。  

  示例（Vue2 组件）：  
  ```javascript
  export default {
    data() {
      return { count: 0 };
    },
    methods: {
      increment() { this.count++; }
    },
    mounted() {
      console.log('组件挂载完成');
    }
  };
  ```

- **Vue3**：新增 **Composition API**，兼容 Options API  
  Composition API 基于 `setup` 函数（或 `<script setup>` 语法糖），允许将 **相关逻辑聚合** 到一起（如把表单的校验、提交、重置逻辑封装在一个函数中），更适合大型组件和逻辑复用。  

  示例（Vue3 组件，`<script setup>` 语法）：  
  ```javascript
  <script setup>
  import { ref, onMounted } from 'vue';
  // 状态
  const count = ref(0);
  // 方法
  const increment = () => { count.value++; };
  // 生命周期
  onMounted(() => {
    console.log('组件挂载完成');
  });
  </script>
  ```

  此外，Vue3 还支持「组合式函数（Composables）」，类似 React Hooks，可将逻辑抽离为独立函数复用（替代 Vue2 的 mixins，避免命名冲突）。  


### 四、性能优化
Vue3 在渲染和更新效率上做了多项优化，性能比 Vue2 提升约 55%：  

1. **虚拟 DOM 优化**：  
   Vue2 的虚拟 DOM 是全量 Diff（无论节点是否静态，都会对比）；  
   Vue3 对虚拟 DOM 进行了「静态标记」：编译时识别静态节点（如纯文本、无动态绑定的元素），Diff 时直接跳过，减少比对开销。  

2. **编译时优化**：  
   - Vue2 中 `v-for` 优先级高于 `v-if`，可能导致不必要的循环；  
   - Vue3 调整为 `v-if` 优先级高于 `v-for`，避免无效循环；  
   - 支持 `v-memo` 指令：缓存模板片段，仅当依赖数据变化时才重新渲染。  

3. **更小的运行时体积**：  
   由于模块化设计和树摇支持，Vue3 运行时核心体积比 Vue2 小约 40%（Vue3 约 10kb，Vue2 约 33kb）。  


### 五、生命周期钩子
Vue3 的生命周期钩子名称和使用方式有调整，且需从 `vue` 中导入（Composition API 中）：  

| Vue2 生命周期       | Vue3 生命周期（Composition API） | 说明                     |
|---------------------|----------------------------------|--------------------------|
| `beforeCreate`      | 被 `setup` 替代                  | 组件初始化前             |
| `created`           | 被 `setup` 替代                  | 组件初始化完成           |
| `beforeMount`       | `onBeforeMount`                  | 组件挂载前               |
| `mounted`           | `onMounted`                      | 组件挂载完成             |
| `beforeUpdate`      | `onBeforeUpdate`                 | 组件更新前               |
| `updated`           | `onUpdated`                      | 组件更新完成             |
| `beforeDestroy`     | `onBeforeUnmount`                | 组件卸载前               |
| `destroyed`         | `onUnmounted`                    | 组件卸载完成             |
| `errorCaptured`     | `onErrorCaptured`                | 捕获子组件错误           |

（Vue3 仍支持 Options API 的生命周期，名称不变，兼容 Vue2 写法）  


### 六、模板语法扩展
Vue3 对模板语法做了增强，解决了 Vue2 的一些限制：  

1. **多根节点（Fragment）**：  
   Vue2 模板要求唯一根节点（否则报错）；  
   Vue3 支持多根节点，无需用 `<div>` 包裹：  
   ```html
   <!-- Vue3 合法 -->
   <template>
     <p>节点1</p>
     <p>节点2</p>
   </template>
   ```

2. **更灵活的 `v-model`**：  
   Vue2 中 `v-model` 本质是 `value` 属性 + `input` 事件的语法糖，一个组件只能有一个 `v-model`；  
   Vue3 中 `v-model` 支持自定义属性和事件（如 `v-model:title`），一个组件可绑定多个 `v-model`：  
   ```html
   <!-- 父组件 -->
   <ChildComponent v-model:name="name" v-model:age="age" />
   ```

3. **移除 `v-on.native` 修饰符**：  
   Vue2 中用 `@click.native` 监听组件的原生事件；  
   Vue3 中组件需显式通过 `emits` 选项声明自定义事件，未声明的事件会被视为原生事件，直接监听即可：  
   ```javascript
   // 子组件
   export default {
     emits: ['custom-event'] // 声明自定义事件
   };
   ```


### 七、状态管理
- **Vue2**：官方推荐 **Vuex**，核心概念包括 `state`、`mutations`（同步）、`actions`（异步）、`getters`，写法较繁琐（如必须通过 `mutations` 修改状态）。  

- **Vue3**：官方推荐 **Pinia**（Vuex 团队的继任者），简化了状态管理：  
  - 移除 `mutations`，直接通过 `actions` 处理同步/异步逻辑；  
  - 天然支持 TypeScript，无需额外类型声明；  
  - 更轻量，API 更简洁，与 Composition API 无缝配合。  


### 八、工具链
- **Vue2**：主要使用 **Vue CLI**（基于 Webpack），开发时启动和热更新速度较慢。  
- **Vue3**：推荐使用 **Vite**（基于 ES 模块原生支持），开发时无需打包，启动速度极快（毫秒级），热更新效率更高，大幅提升开发体验。  


### 总结：Vue3 核心优势
1. 响应式系统更强大（基于 Proxy，支持更多数据类型）；  
2. Composition API 解决复杂组件的逻辑聚合问题；  
3. 性能显著提升（虚拟 DOM 优化、编译时优化）；  
4. 更好的 TypeScript 支持和模块化设计；  
5. 更灵活的模板语法（多根节点、多 v-model 等）；  
6. 配套工具链（Vite、Pinia）更高效。  

Vue3 保持了对 Vue2 Options API 的兼容，迁移成本较低，新项目推荐直接使用 Vue3，复杂旧项目可逐步迁移。