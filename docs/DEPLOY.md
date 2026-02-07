# MBTI V2 部署文档

## 快速部署

```bash
cd mbti-v2

# 1. 构建
npm run build

# 2. 部署到 Cloudflare Pages
# 主站（lizehao.asia）
npx wrangler pages deploy dist --project-name=lzhnew --commit-dirty=true

# MBTI 站（mbti.lizehao.asia）
# npx wrangler pages deploy dist --project-name=mbti-test --commit-dirty=true

# 3. 提交到 GitHub
git add -A
git commit -m "描述"
git push
```

**注意**：当前 `lizehao.asia` 绑定在项目 `lzhnew`，MBTI 站点绑定在 `mbti-test`（子域名 `mbti.lizehao.asia`）。

## 环境配置

### Cloudflare Pages 环境变量

在 Cloudflare Dashboard → Pages → 对应项目 → Settings → Environment variables 中配置：

| 变量名 | 说明 |
|--------|------|
| ZY_PID | 志云付商户ID |
| ZY_PRIVATE_KEY | 志云付私钥（RSA） |
| ZY_PUBLIC_KEY | 志云付公钥（用于验签） |
| ZY_API_BASE | 志云付API地址，默认 `http://pay.zy520888.com` |
| ADMIN_KEY | 管理员密钥（用于手动添加积分，必须配置） |

### KV 命名空间

KV 命名空间 ID: `0272b12877264d808bec5fbee5f4db93`

绑定名称: `MBTI_USERS`

## 常用 Key / ID / Skills

### Key / Env

- `ZY_PID`：志云付商户 ID
- `ZY_PRIVATE_KEY`：志云付私钥
- `ZY_PUBLIC_KEY`：志云付公钥
- `ZY_API_BASE`：志云付 API Base
- `ADMIN_KEY`：管理员密钥

### ID / 绑定

- Pages 项目名：`lzhnew`（主站）、`mbti-test`（MBTI）
- 主域名：`lizehao.asia`
- MBTI 子域名：`mbti.lizehao.asia`
- Pages 域名：`lzhnew.pages.dev`、`mbti-test-a06.pages.dev`
- KV 命名空间 ID：`0272b12877264d808bec5fbee5f4db93`
- KV 绑定名：`MBTI_USERS`
- D1 数据库名：`mbti`
- D1 绑定名：`MBTI_DB`

### Skills（常用操作）

- Pages 部署：`wrangler pages deploy`
- D1 管理：`wrangler d1 execute`
- Admin API 加积分：`/api/admin/add-credits`
- 用户查询：`/api/user/query`
- 支付回调联调：`/api/zy/notify`

## 管理命令

### 给用户添加积分

```powershell
# adminKey 需要与 Cloudflare 环境变量中配置的 ADMIN_KEY 一致
Invoke-RestMethod -Uri "https://mbti.lizehao.asia/api/admin/add-credits" -Method POST -ContentType "application/json" -Body '{"phone":"手机号","credits":积分数量,"adminKey":"你的管理员密钥"}'
```

### 查询用户数据

```powershell
Invoke-RestMethod -Uri "https://mbti.lizehao.asia/api/user/query?phone=手机号&pin=密码" -Method GET
```

## 项目结构

```
mbti-v2/
├── src/                    # 前端源码
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx        # 首页
│   │   ├── Test.tsx        # 测试页
│   │   ├── Payment.tsx     # 支付页
│   │   ├── Result.tsx      # 结果页
│   │   ├── History.tsx     # 历史记录
│   │   └── Recharge.tsx    # 充值页
│   ├── components/         # 公共组件
│   └── data/               # 数据文件
├── functions/              # Cloudflare Functions (后端API)
│   └── api/
│       ├── zy/             # 支付相关
│       │   ├── create-order.js
│       │   ├── notify.js
│       │   └── query-order.js
│       ├── user/           # 用户相关
│       │   ├── save.js
│       │   ├── query.js
│       │   └── use-credit.js
│       └── admin/          # 管理接口
│           └── add-credits.js
├── dist/                   # 构建输出
└── public/                 # 静态资源
```

## 支付流程

1. 用户点击支付 → `create-order.js` 创建订单
2. 用户扫码/跳转支付
3. 支付成功 → 志云付调用 `notify.js` 回调 → 增加用户积分
4. 前端轮询 `query-order.js` 检测支付状态
5. 检测到支付成功 → 等待3秒 → 使用积分 → 跳转结果页

## 积分系统

| 套餐 | 价格 | 积分 |
|------|------|------|
| 默认 | ¥1 | 3次 |
| RECHARGE_3 | ¥1 | 3次 |
| RECHARGE_10 | ¥3 | 10次 |
| RECHARGE_30 | ¥8 | 30次 |

## 成功经验 / 乱码排查总结

1. 乱码的本质是编码错误，常见是文件被保存成 UTF-16 或错误 ANSI。
2. 修复方法：用支持编码的编辑器“另存为 UTF-8（建议带 BOM）”，再重新打开确认。
3. 验证方法：文件头应为 `EF BB BF`（UTF-8 BOM），不要出现 `FF FE`（UTF-16）。
4. 避免问题：统一使用 UTF-8 保存所有 Markdown/TS/JSON 文件，不要用会默认改编码的工具保存。

## Git 配置

代理设置（如需）：
```bash
git config --global http.proxy socks5://127.0.0.1:10808
git config --global https.proxy socks5://127.0.0.1:10808
```

GitHub 仓库: `lizehao-1/mbti-v2`

## 域名

- 主域名: `lizehao.asia` → Pages 项目 `lzhnew`
- MBTI 子域名: `mbti.lizehao.asia` → Pages 项目 `mbti-test`
- Pages 域名: `lzhnew.pages.dev`、`mbti-test-a06.pages.dev`
