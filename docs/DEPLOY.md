# MBTI V2 部署文档

## 快速部署

```bash
cd mbti-v2

# 1. 构建
npm run build

# 2. 部署到 Cloudflare Pages（自动同步到 lizehao.asia）
npx wrangler pages deploy dist --project-name=mbti-test --commit-dirty=true

# 3. 提交到 GitHub（可选，仅用于代码备份）
git add -A
git commit -m "描述"
git push
```

说明：执行 `wrangler pages deploy` 后，会部署到 Pages 项目 `mbti-test-a06`，并自动同步到自定义域名 `lizehao.asia`（无需额外配置）。

## 环境配置

### Cloudflare Pages 环境变量

在 Cloudflare Dashboard -> Pages -> mbti-test -> Settings -> Environment variables 中配置：

| 变量名 | 说明 |
| --- | --- |
| ZY_PID | 志云付商户 ID |
| ZY_PRIVATE_KEY | 志云付私钥（RSA） |
| ZY_PUBLIC_KEY | 志云付公钥（用于验签） |
| ZY_API_BASE | 志云付 API 地址，默认 `http://pay.zy520888.com` |
| ADMIN_KEY | 管理员密钥（用于手动添加积分） |

### KV 命名空间

KV 命名空间 ID: `0272b12877264d808bec5fbee5f4db93`

绑定名称: `MBTI_USERS`

## 管理命令

### 给用户添加积分

```powershell
# adminKey 需与 Cloudflare 环境变量中的 ADMIN_KEY 一致
Invoke-RestMethod -Uri "https://mbti-test-a06.pages.dev/api/admin/add-credits" -Method POST -ContentType "application/json" -Body '{"phone":"手机号","credits":积分数量,"adminKey":"你的管理员密钥"}'
```

### 查询用户数据

```powershell
Invoke-RestMethod -Uri "https://mbti-test-a06.pages.dev/api/user/query?phone=手机号&pin=密码" -Method GET
```

## 项目结构

```
mbti-v2/
  src/                    # 前端源码
    pages/                # 页面组件
      Home.tsx            # 首页
      Test.tsx            # 测试页
      Payment.tsx         # 支付页
      Result.tsx          # 结果页
      History.tsx         # 历史记录
      Recharge.tsx        # 充值页
    components/           # 公共组件
    data/                 # 数据文件
  functions/              # Cloudflare Functions (后端 API)
    api/
      zy/                 # 支付相关
        create-order.js
        notify.js
        query-order.js
      user/               # 用户相关
        save.js
        query.js
        use-credit.js
      admin/              # 管理接口
        add-credits.js
  dist/                   # 构建输出
  public/                 # 静态资源
```

## 支付流程

1. 用户点击支付 -> `create-order.js` 创建订单
2. 用户扫码/跳转支付
3. 支付成功 -> 志云付回调 `notify.js` -> 增加用户积分
4. 前端轮询 `query-order.js` 检测支付状态
5. 检测到支付成功 -> 等待 3 秒 -> 使用积分 -> 跳转结果页

## 积分系统

| 套餐 | 价格 | 积分 |
| --- | --- | --- |
| 默认 | ¥1 | 3 次 |
| RECHARGE_3 | ¥1 | 3 次 |
| RECHARGE_10 | ¥3 | 10 次 |
| RECHARGE_30 | ¥8 | 30 次 |

## Git 配置

代理设置（如需）：

```bash
git config --global http.proxy socks5://127.0.0.1:10808
git config --global https.proxy socks5://127.0.0.1:10808
```

GitHub 仓库: `lizehao-1/mbti-v2`

## 域名

- 主域名：`lizehao.asia`（由 Cloudflare Pages 自动同步）
- Cloudflare Pages：`mbti-test-a06.pages.dev`

部署到 Cloudflare Pages 后会自动同步到 `lizehao.asia`，无需手动配置。
