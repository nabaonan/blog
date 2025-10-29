# react17-19的区别

React 17 到 19 各版本的更新聚焦于开发体验、性能优化、并发渲染能力增强以及生态适配，以下是各版本的核心更新内容：


### **React 17（2020年10月）：过渡版本，聚焦兼容性与升级平滑性**  
React 17 被称为“不引入新特性的版本”，核心目标是简化后续版本的升级难度，同时优化与其他框架的共存能力。  

1. **事件系统重构**  
   - 移除了对 `document` 的事件委托，改为将事件委托到**根容器（root）** 上。这使得 React 应用可以更方便地与 jQuery、Vue 等其他框架共存（避免事件处理冲突）。  
   - 原生事件（如 `addEventListener`）与 React 合成事件的冒泡行为更一致，减少跨框架事件处理的意外。  

2. **对 Concurrent Mode 的准备**  
   - 为后续版本的“并发渲染”（Concurrent Rendering）铺路，调整了内部架构，但未开放相关 API（如 ` Suspense` 数据获取仍处于实验阶段）。  

3. **渐进式升级支持**  
   - 允许应用中同时运行多个 React 版本（如部分页面用 React 17，部分用旧版本），降低大型应用的升级成本。  

4. **移除过时 API**  
   - 废弃 `React.createFactory`、`React.PropTypes`（建议使用 `prop-types` 库）等极少使用的 API；  
   - 不再支持 IE 11（需通过 `react-app-polyfill` 兼容）。  


### **React 18（2022年3月）：并发渲染（Concurrent Rendering）正式落地**  
React 18 是近年来最大的一次更新，核心是引入“并发渲染”机制，允许 UI 渲染被中断、暂停、恢复或放弃，大幅提升复杂应用的响应速度。  

1. **新的根 API 与并发模式启用**  
   - 新增 `createRoot` 替代 `ReactDOM.render`，作为启用并发渲染的入口：  
     ```jsx
     // 旧：ReactDOM.render(<App />, document.getElementById('root'))
     // 新：
     const root = ReactDOM.createRoot(document.getElementById('root'));
     root.render(<App />);
     ```  
   - 并发渲染默认不触发，需通过新 API（如 `useTransition`）主动启用。  

2. **自动批处理更新（Automatic Batching）**  
   - 自动合并多个状态更新（即使在 `setTimeout`、`Promise` 等异步操作中），减少不必要的重渲染：  
     ```jsx
     // React 18 中，以下两次 setState 会合并为一次重渲染
     setTimeout(() => {
       setCount(c => c + 1);
       setFlag(f => !f);
     }, 1000);
     ```  

3. **Transitions API：区分紧急与非紧急更新**  
   - 新增 `useTransition` 和 `startTransition`，用于标记“非紧急更新”（如搜索输入时的列表过滤），避免阻塞用户输入等紧急操作：  
     ```jsx
     const [isPending, startTransition] = useTransition();
     // 紧急：更新输入框内容
     setInputValue(input);
     // 非紧急：根据输入过滤列表（可被中断）
     startTransition(() => {
       setFilteredList(filterList(input));
     });
     ```  

4. **Suspense 增强与 SSR 优化**  
   - `Suspense` 支持在客户端动态加载组件时显示 fallback（之前仅支持 SSR）；  
   - 服务器端渲染（SSR）引入“流式渲染”（Streaming SSR）和“服务器组件”（Server Components）初步支持，减少首屏加载时间。  

5. **新 Hooks 与 API**  
   - `useId`：生成跨服务端和客户端的唯一 ID（解决 SSR  hydration 不匹配问题）；  
   - `useTransition`：如上述，标记非紧急更新；  
   - `useDeferredValue`：为状态创建延迟更新的副本，类似防抖但更智能；  
   - `useSyncExternalStore`：用于订阅外部状态（如 Redux），确保并发模式下的一致性。  


### **React 19（预计2024年，基于公开规划与RC版本）：完善并发生态，强化数据处理**  
React 19 继续深化并发渲染能力，聚焦于简化数据获取、表单处理，并完善服务器组件生态。  

1. **Suspense 原生支持数据获取**  
   - 正式支持用 `Suspense` 包裹数据请求逻辑，无需第三方库（如 React Query）即可实现“加载中显示 fallback”：  
     ```jsx
     // 无需手动管理 loading 状态
     <Suspense fallback={<Spinner />}>
       <UserProfile userId={id} />
     </Suspense>
     
     // UserProfile 组件内部直接请求数据
     function UserProfile({ userId }) {
       const user = fetchUser(userId); // 假设 fetchUser 会暂停渲染（Suspense 感知）
       return <div>{user.name}</div>;
     }
     ```  

2. **服务器组件（Server Components）稳定化**  
   - 服务器组件（无需客户端 JS 即可渲染的组件）正式推出，支持在服务器端直接获取数据并生成 HTML，减少客户端 JS 体积；  
   - 新增 `'use client'` 和 `'use server'` 指令，明确标记客户端/服务器组件边界。  

3. **表单与状态管理增强**  
   - 新增 `useActionState` Hook：简化表单提交逻辑，自动处理“提交中”“错误”状态：  
     ```jsx
     function TodoForm() {
       const [state, formAction] = useActionState(
         async (prevState, formData) => {
           // 处理表单提交（如 API 请求）
           const newTodo = await addTodo(formData.get('text'));
           return { ...prevState, todos: [...prevState.todos, newTodo] };
         },
         { todos: [] } // 初始状态
       );
       return <form action={formAction}>...</form>;
     }
     ```  
   - 原生支持表单重置（`form.reset()`）与状态同步。  

4. **废弃与移除遗留特性**  
   - 移除 `ReactDOM.findDOMNode`（建议用 ref 替代）；  
   - 废弃 `React.StrictMode` 的双重渲染警告（改为更友好的开发提示）；  
   - 彻底移除对旧版上下文（`createContext` 之前的实现）的支持。  

5. **性能与开发者体验优化**  
   - 并发渲染的调度逻辑优化，减少复杂组件的渲染阻塞；  
   - React DevTools 新增“并发更新追踪”功能，可视化渲染优先级；  
   - 更好的 TypeScript 类型支持（如服务器组件的类型自动推断）。  


### 总结  
- React 17：过渡版本，优化兼容性，为并发渲染铺路；  
- React 18：核心是并发渲染，通过 `createRoot`、`useTransition` 等 API 提升响应速度；  
- React 19：完善并发生态，强化 `Suspense` 数据获取、服务器组件和表单处理，进一步降低开发复杂度。