# MBTI V2 / LZHNEW 部署与运维文档

这份文档覆盖两件事：

- `mbti.lizehao.asia` 的 MBTI 站点（历史遗留，不要随便动）
- `lizehao.asia` 的主站（`lzhnew` 项目，当前主要开发目标）

## TL;DR (最重要的几件事)

- **主站 (main domain)**: `lizehao.asia` 绑定在 Cloudflare Pages 项目 `lzhnew`
- **MBTI 子域名**: `mbti.lizehao.asia` 绑定在 Cloudflare Pages 项目 `mbti-test`（暂时不要动它）
- **发布主站**: `npm run build` 后执行 `npx wrangler pages deploy dist --project-name=lzhnew --commit-dirty=true`
- **Git 同步**: 主站对外仓库 remote 是 `lzhnew`（`lizehao-1/lzhnew`）
- **中文“乱码/???”** 多数不是编码，是字体不支持中文；PowerShell 写文件也可能把编码写坏（见“编码与中文”）

## 快速发布（主站）

在 `mbti-v2/` 目录：

```bash
npm run build
npx wrangler pages deploy dist --project-name=lzhnew --commit-dirty=true
```

## 快速发布（MBTI 子站，默认不要动）

```bash
npm run build
npx wrangler pages deploy dist --project-name=mbti-test --commit-dirty=true
```

## 常用 ID / Key / 项目名（别搞混）

### Cloudflare Pages 项目名

- `lzhnew`: 主站（`lizehao.asia`）
- `mbti-test`: MBTI 子域名（`mbti.lizehao.asia`）

### GitHub 仓库 remote

这台机器上常见的 remote：

- `origin`: `lizehao-1/mbti-v2`（老仓库）
- `lzhnew`: `lizehao-1/lzhnew`（主站对外仓库）
- `apple2`: `lizehao-1/v2-apple2`（开发分支仓库）

查看方式：

```bash
git remote -v
```

### Cloudflare 环境变量（Pages）

在 Cloudflare Dashboard → Pages → 对应项目 → Settings → Environment variables 中配置。

- `ADMIN_KEY`: 管理后台/管理接口使用的管理员密钥
- `ZY_PID`: 志云付商户 ID
- `ZY_PRIVATE_KEY`: 志云付私钥（RSA）
- `ZY_PUBLIC_KEY`: 志云付公钥（用于验签）
- `ZY_API_BASE`: 志云付 API base（默认 `http://pay.zy520888.com`）

### 常见 KV/D1 资源（历史遗留）

- KV namespace id: `0272b12877264d808bec5fbee5f4db93`
- KV binding name: `MBTI_USERS`
- D1 db name: `mbti`
- D1 binding name: `MBTI_DB`

说明：现在主站在做“测试入口 + 报告展示”，支付/积分等仍属于 MBTI 项目的能力，后续是否迁移到主站再决定。

### 常见 localStorage key（前端缓存用）

- `lzh_locale`: 语言选择（`zh`/`en`）
- `lzh_<test>_<len>_answers`: 各测试答题缓存（例如 `lzh_sjt_standard_answers`）

说明：localStorage 用来做“刷新不丢进度”和“弱网继续做题”，不用于计费或权限。

## 管理接口（MBTI 子站）

### 给用户添加积分

```powershell
# adminKey 需要与 Cloudflare 环境变量中配置的 ADMIN_KEY 一致
Invoke-RestMethod -Uri "https://mbti.lizehao.asia/api/admin/add-credits" -Method POST -ContentType "application/json" -Body '{"phone":"手机号","credits":积分数量,"adminKey":"你的管理员密钥"}'
```

### 查询用户数据

```powershell
Invoke-RestMethod -Uri "https://mbti.lizehao.asia/api/user/query?phone=手机号&pin=密码" -Method GET
```

## 编码与中文（非常关键）

你看到的“中文变成 `????` / 菱形问号”主要有两类原因。

### 1) 字体不支持中文（网页里最常见）

现象：英文正常、中文全部变成 `????` 或方框；刷新很多次也不变。

原因：页面用了某个装饰字体/展示字体，但这个字体不包含 CJK 字形，浏览器没能正确回退到系统中文字体。

处理：

- 在 CSS `font-family` 里加中文字体回退：`PingFang SC` / `Microsoft YaHei` / `Noto Sans SC` 等。
- 保证关键文本区域不要强制用只含拉丁字形的 display font。

### 2) 文件被错误编码写入（本地编辑/脚本最常见）

现象：代码/文档里本来中文正常，改完后 Git diff 里出现乱码，或者线上显示奇怪字符。

常见坑：

- PowerShell 的 `Out-File` 默认会写成 UTF-16LE，写到 `.ts/.md` 后工具链可能异常。
- 有些编辑器用“ANSI/GBK”保存，导致 UTF-8 内容被破坏。

建议规则：

- 优先用 VSCode，确保文件以 UTF-8 保存。
- PowerShell 写文件时显式指定编码：

```powershell
Set-Content -Encoding utf8 -Path .\docs\DEPLOY.md -Value $text
# 或
Out-File -Encoding utf8 -FilePath .\docs\DEPLOY.md -InputObject $text
```

如果必须在代码里放大量中文但担心写坏：可以用 `\uXXXX` 转义作为兜底（可读性差但稳定）。

## 性能与技术选型（题量/图片为什么可选）

### 题目数量是否影响性能？

会影响，但主要影响在：

- 首屏加载体积：题库如果全部打进主 bundle，会让页面打开慢。
- 交互时延：题目过多会让渲染、滚动、状态更新更重。

当前方案：

- 题库按测试/长度拆分，用户选择后动态 `import()` 加载（只下载用到的那份）。
- 答题过程中只渲染当前题（减少 DOM 压力）。

结论：即使“完整报告/长题库”存在，也不会拖慢没选它的人。

### 图片多会不会拖慢？

会拖慢，尤其外链大图。

当前策略：

- 优先使用 `public/` 下的本地小图（可控大小、走 CDN 缓存）。
- 把报告页的大图延迟到结果页再加载（避免首屏变慢）。

### 子域名变慢的常见原因

- 浏览器缓存：Pages 新版本已上线，但本地仍用旧 JS/CSS（`Ctrl+F5` 或无痕窗口）。
- DNS 刚改/刚绑定：传播需要时间，部分地区走旧记录。
- 资源没命中缓存：图片太大，首次访问确实慢。

## 故障排查（最快）

- 访问 `lizehao.asia` 仍是旧页面：`Ctrl+F5`，再无痕窗口；还不行就看 `View Source` 判断是否更新。
- 中文全是 `????`：优先检查 CSS 字体回退；其次检查文件是否被写成 UTF-16/ANSI。
- Pages 部署后访问 404：确认 `--project-name` 是否正确（主站 `lzhnew`）。

