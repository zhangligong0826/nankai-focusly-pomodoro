# TypeScript 迁移说明

> 状态：**基础设施已就绪，全量迁移为后续独立任务**

## 一、已完成的迁移基础设施

| 项 | 文件 | 说明 |
|----|------|------|
| TS 配置 | `tsconfig.json` | strict 模式 + `allowJs` 渐进共存 + 路径别名 `@/*` |
| 类型定义 | `src/types/index.ts` | 完整类型（枚举 + 实体 + API + 统计 + 导出载荷），与 `constants.js` 运行时枚举一一对应 |
| 工具链 | `typescript@5.7.3` + `vue-tsc@3.3.10` | 类型检查工具链（TS 7.x 与 vue-tsc 不兼容，已锁定 5.7.3） |
| 脚本 | `package.json` → `"type-check": "vue-tsc --noEmit"` | 类型检查命令 |

验证：`npm run type-check` 当前通过（无错误）。

## 二、为什么采用渐进策略而非一次性全量迁移

全量迁移（67 个源文件 `.js → .ts`）存在两个真实的架构摩擦：

### 1. `node --test` 运行时与 Vite/tsc 的 import 扩展名冲突

项目单元测试用 Node 22 内置 `node --test`（零依赖）。实测结论：

- ✅ Node 22.22 支持直接 import `.ts`（type stripping 默认启用）
- ❌ Node 22.22 **不支持** `.js` → `.ts` 扩展名映射（`import './date.js'` 找不到 `date.ts`）
- 因此 `.ts` 文件内部互引、测试文件 import 都必须用**显式 `.ts` 扩展名**
- 而 TypeScript 官方惯例是无扩展名 / `.js` 扩展名；`.ts` 扩展名 import 需开启非标准的 `allowImportingTsExtensions`

这会让代码库引入 `.ts` 扩展名 import 的技术债，且与 Vite 的「无扩展名」惯例相悖。

### 2. strict 模式逐文件类型注解成本高

`tsconfig` 开启 strict，迁移后 `stores/api/composables/components` 均需补类型注解（参数、返回值、泛型），vue-tsc 才能全量通过。这是 8-12h 的独立工程量。

## 三、后续完整迁移路径（按依赖顺序）

若决定推进，建议按以下顺序逐批迁移，每批跑 `npm run type-check` + `npm test` + `npm run build`：

1. `tsconfig.json` 开启 `allowImportingTsExtensions: true`（配合已有 `noEmit`）
2. `src/utils/` 8 个纯函数文件 → `.ts`（有测试覆盖，风险最低）
   - 内部互引从 `.js` 改为 `.ts` 扩展名
   - `test/*.test.mjs` 的 import 同步改为 `.ts`
3. `src/composables/` → `.ts`
4. `src/api/` → `.ts`（`AxiosResponse<T>` 泛型）
5. `src/stores/` → `.ts`（`defineStore` 泛型 + `ref<T>()`）
6. `src/components/**/*.vue` + `src/views/*.vue` → `<script setup lang="ts">`
7. `mock/` → `.ts`
8. `index.html` 入口 `src/main.js` → `src/main.ts`

## 四、迁移前的质量保障

当前代码已有完整 JSDoc 类型注释（`@param` / `@returns` / `@type`），IDE 已能提供类型提示。迁移到 `.ts` 的主要增益是**编译时（CI 阶段）类型安全**，而非开发期提示。

建议配合 GitHub Actions 的 `deploy.yml` 增加 `npm run type-check` 步骤，作为类型门禁。
