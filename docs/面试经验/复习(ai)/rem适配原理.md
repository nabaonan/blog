# Rem适配原理


rem 适配的核心原理是 **以 HTML 根元素（`<html>`）的字体大小（`font-size`）为基准单位，通过动态调整这个基准值，让页面元素大小随屏幕宽度等比例缩放**，最终实现不同尺寸设备的视觉一致性。简单说：`1rem = html 的 font-size 值`，元素尺寸用 `rem` 定义后，会自动跟随根元素字体大小变化，从而适配不同屏幕。


### 一、先明确：rem 单位的本质
`rem`（Root EM）是 CSS 中的相对单位，与 `px`（固定像素）、`em`（相对于父元素字体大小）的核心区别在于：  
- `px`：固定值，屏幕宽度变化时，元素大小不变（易导致小屏溢出、大屏过小）；  
- `em`：相对于**父元素**字体大小（如父元素 `font-size: 16px`，子元素 `1.2em = 19.2px`），易出现嵌套层级混乱；  
- `rem`：相对于**根元素（`<html>`）** 字体大小（如 html `font-size: 50px`，任何元素 `1rem = 50px`），全局只有一个基准，适配更统一。  

举个基础例子：  
```css
/* 1. 设置根元素字体大小为 50px */
html { font-size: 50px; }

/* 2. 元素用 rem 定义尺寸：1rem = 50px */
.box {
  width: 2rem;   /* 实际宽度 = 2 × 50px = 100px */
  height: 1.5rem;/* 实际高度 = 1.5 × 50px = 75px */
  font-size: 0.8rem; /* 实际字体 = 0.8 × 50px = 40px */
}
```  
若后续修改根元素 `font-size: 60px`，则 `.box` 所有尺寸会自动按比例放大（宽度 120px、高度 90px）—— 这就是 rem 适配的“桥梁”：**通过修改根元素基准，联动所有 rem 定义的元素**。


### 二、rem 适配的核心逻辑：动态调整根元素字体大小
rem 本身只是“相对单位”，要实现“适配不同屏幕”，关键是让根元素的 `font-size` **随屏幕宽度等比例变化**。核心逻辑分两步：  

#### 1. 以“设计稿”为参考，确定基准比例
前端开发通常会拿到一份固定宽度的设计稿（如移动端常用 `750px`，PC 常用 `1920px`），我们需要约定：**设计稿宽度的 1/10 作为设计稿中的 1rem 基准**。  
- 例：设计稿宽度 = 750px → 设计稿中 1rem = 750px / 10 = 75px；  
- 设计稿中任何元素的尺寸，都可换算成 `rem 值 = 设计稿像素值 / 75`（如设计稿中按钮宽度 150px → 150/75 = 2rem）。  

这样做的目的是：让设计稿中的尺寸换算成 rem 时更直观（除以 10 简化计算），同时保证“屏幕宽度变化时，rem 基准按比例同步变化”。


#### 2. 用 JS 动态计算根元素 font-size
不同设备的屏幕宽度不同（如手机 375px、平板 768px、电脑 1920px），我们需要通过 JavaScript 实时计算当前屏幕宽度对应的根元素 `font-size`，公式如下：  
```
当前根元素 font-size = (当前屏幕宽度 / 设计稿宽度) × 设计稿中 1rem 的基准值
```  

结合“设计稿宽度 750px、设计稿 1rem = 75px”的例子，公式可简化为：  
```
当前根元素 font-size = 当前屏幕宽度 / (750 / 75) = 当前屏幕宽度 / 10
```  

- 当屏幕宽度 = 750px（与设计稿一致）→ 根元素 `font-size = 750/10 = 75px` → 2rem 按钮实际宽度 = 150px（与设计稿一致）；  
- 当屏幕宽度 = 375px（设计稿的 1/2）→ 根元素 `font-size = 375/10 = 37.5px` → 2rem 按钮实际宽度 = 75px（按比例缩小到 1/2）；  
- 当屏幕宽度 = 1500px（设计稿的 2 倍）→ 根元素 `font-size = 1500/10 = 150px` → 2rem 按钮实际宽度 = 300px（按比例放大到 2 倍）。  

**最终效果**：无论屏幕宽度如何变化，元素尺寸始终与屏幕宽度成固定比例，实现“等比例适配”。


### 三、rem 适配的完整实现步骤（代码示例）
以“750px 设计稿”为例，完整实现分为 3 步：


#### 1. 编写 JS 代码：动态设置根元素 font-size
通过 `window.innerWidth` 获取当前屏幕宽度，计算并设置 `html` 的 `font-size`，同时监听窗口 resize 事件（如用户缩放浏览器、旋转手机屏幕），实时更新基准值。  

```javascript
// rem 适配核心 JS（通常放在 <head> 中，优先执行）
function setRemBase() {
  // 1. 配置设计稿参数
  const designWidth = 750; // 设计稿宽度（必须与 UI 一致）
  const designRemBase = designWidth / 10; // 设计稿中 1rem 的基准值（750px 设计稿 → 75px）

  // 2. 获取当前屏幕宽度（若为移动端，需排除滚动条宽度，这里简化处理）
  const currentScreenWidth = window.innerWidth;

  // 3. 计算当前根元素的 font-size（按比例换算）
  const currentRemBase = (currentScreenWidth / designWidth) * designRemBase;

  // 4. 设置根元素 font-size（添加 !important 避免被其他样式覆盖）
  document.documentElement.style.fontSize = `${currentRemBase}px !important`;
}

// 5. 初始化执行 + 窗口 resize 时更新（防抖处理，避免频繁计算）
let resizeTimer;
setRemBase(); // 页面加载时执行一次
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(setRemBase, 100); // 100ms 防抖，减少性能消耗
});
```


#### 2. 编写 CSS 代码：元素用 rem 定义尺寸
所有元素的尺寸（宽度、高度、字体大小、边距等）都用 `rem` 单位，直接按“设计稿像素值 / 设计稿 1rem 基准值”换算。  

以“设计稿中按钮宽 150px、高 60px、字体 24px、边距 30px”为例：  
```css
/* 设计稿像素值 / 75（设计稿 1rem 基准）= rem 值 */
.btn {
  width: 2rem;    /* 150px / 75 = 2rem */
  height: 0.8rem; /* 60px / 75 = 0.8rem */
  font-size: 0.32rem; /* 24px / 75 = 0.32rem */
  margin: 0.4rem; /* 30px / 75 = 0.4rem */
  padding: 0.2rem 0.6rem; /* 15px/75=0.2rem，45px/75=0.6rem */
}
```


#### 3. 配置视口（Viewport）：保证屏幕宽度正确获取
必须在 HTML 的 `<head>` 中添加视口配置，让浏览器正确识别屏幕宽度，否则 JS 获取的 `window.innerWidth` 会不准确（尤其移动端）：  
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
```  
- `width=device-width`：让页面宽度等于设备物理宽度（移动端关键，避免页面过宽）；  
- `user-scalable=no`：禁止用户缩放（避免缩放后屏幕宽度计算错误，影响适配）。


### 四、rem 适配的优势与注意事项
#### 1. 优势
- **全局统一缩放**：只需修改根元素 `font-size`，所有 rem 元素同步变化，适配逻辑简单；  
- **兼容性好**：支持所有现代浏览器（IE9+），无需担心新特性兼容问题；  
- **与设计稿配合直观**：按“设计稿像素 / 10”换算 rem，降低开发成本。


#### 2. 注意事项
- **设计稿宽度必须固定**：JS 计算依赖“设计稿宽度”，若设计稿宽度不统一（如部分页面 750px、部分 375px），需单独配置；  
- **避免嵌套 rem 计算**：根元素 `font-size` 只由 JS 控制，CSS 中不要用 `rem` 再定义根元素字体大小（如 `html { font-size: 1rem; }`），会导致循环依赖；  
- **大屏适配需限制最大基准**：若屏幕过宽（如 4K 屏），元素可能过大，需给根元素 `font-size` 设置最大值，例：  
  ```javascript
  // 在 setRemBase 函数中添加最大限制
  const maxRemBase = 100; // 最大 1rem = 100px（对应屏幕宽度 1000px，超过后不再放大）
  const currentRemBase = Math.min((currentScreenWidth / designWidth) * designRemBase, maxRemBase);
  ```


### 总结
rem 适配的原理可一句话概括：  
**以 HTML 根元素字体大小为“缩放基准”，通过 JS 让这个基准随屏幕宽度按设计稿比例动态变化，页面元素用 rem 绑定这个基准，最终实现等比例适配**。  

它的核心是“将屏幕宽度与元素尺寸通过 rem 关联”，既解决了 px 固定尺寸的适配问题，又避免了 em 嵌套混乱的问题，是早期移动端适配的主流方案（目前仍广泛用于需兼容低版本浏览器的场景）。

要不要我帮你整理一份**包含防抖、最大基准限制的 rem 适配完整代码模板**，可以直接复制到项目中使用？