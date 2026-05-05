# arch-insight 多平台安装手工 Smoke Test

本文档用于在更贴近真实用户目录的环境里，手工确认 `arch-insight` 的三平台安装链路可用，重点验证：

- 权威源生成的 bundle 能被 `Claude`、`Codex`、`Gemini` 正常消费
- npm CLI 安装链路与 `curl | sh` 安装链路都能落到真实平台目录
- 安装后不仅有 `SKILL.md`，也有运行时需要的 `RUNNER.md`、`templates/`、`prompts/`

## 预备条件

- 当前仓库已经执行过：

```bash
npm test
node ./bin/arch-insight.js release --output-dir dist/release --base-url https://example.com/arch-insight
```

- 本机可用：
  - `node >= 20`
  - `bash`
  - `tar`
  - `python3`

## 目录基线

三平台真实安装目标按当前实现约定分别为：

- Claude: `~/.claude/plugins/local/arch-insight`
- Codex: `~/.codex/skills/arch-insight` 与 `~/.codex/prompts`
- Gemini: `~/.gemini/skills/arch-insight` 与 `~/.gemini/arch-insight-prompts`

## Smoke Test A: npm CLI 安装链路

先构建 bundle：

```bash
node ./bin/arch-insight.js build --output-dir dist
```

### A1. Claude

```bash
node ./bin/arch-insight.js install --platform claude --bundle-dir dist
```

检查：

```bash
test -f ~/.claude/plugins/local/arch-insight/.claude-plugin/plugin.json
test -f ~/.claude/plugins/local/arch-insight/skills/arch-insight/SKILL.md
test -f ~/.claude/plugins/local/arch-insight/RUNNER.md
test -f ~/.claude/plugins/local/arch-insight/templates/ARCHITECTURE_REPORT.md
```

### A2. Codex

```bash
node ./bin/arch-insight.js install --platform codex --bundle-dir dist
```

检查：

```bash
test -f ~/.codex/skills/arch-insight/arch-insight/SKILL.md
test -f ~/.codex/skills/arch-insight/RUNNER.md
test -f ~/.codex/skills/arch-insight/templates/ARCHITECTURE_REPORT.md
test -f ~/.codex/prompts/arch-insight-01_repo_intake.md
```

### A3. Gemini

```bash
node ./bin/arch-insight.js install --platform gemini --bundle-dir dist
```

检查：

```bash
test -f ~/.gemini/skills/arch-insight/SKILL.md
test -f ~/.gemini/skills/arch-insight/RUNNER.md
test -f ~/.gemini/skills/arch-insight/templates/ARCHITECTURE_REPORT.md
test -f ~/.gemini/arch-insight-prompts/01_repo_intake.md
```

## Smoke Test B: curl | sh 安装链路

先生成正式 release 产物：

```bash
node ./bin/arch-insight.js release --output-dir dist/release --base-url file://$(pwd)/dist/release
```

### B1. Claude

```bash
ARCH_INSIGHT_PLATFORM=claude \
ARCH_INSIGHT_RELEASE_BASE_URL=file://$(pwd)/dist/release \
bash ./scripts/install.sh
```

检查：

```bash
test -f ~/.claude/plugins/local/arch-insight/.claude-plugin/plugin.json
```

### B2. Codex

```bash
ARCH_INSIGHT_PLATFORM=codex \
ARCH_INSIGHT_RELEASE_BASE_URL=file://$(pwd)/dist/release \
bash ./scripts/install.sh
```

检查：

```bash
test -f ~/.codex/skills/arch-insight/arch-insight/SKILL.md
test -f ~/.codex/skills/arch-insight/RUNNER.md
```

### B3. Gemini

```bash
ARCH_INSIGHT_PLATFORM=gemini \
ARCH_INSIGHT_RELEASE_BASE_URL=file://$(pwd)/dist/release \
bash ./scripts/install.sh
```

检查：

```bash
test -f ~/.gemini/skills/arch-insight/SKILL.md
test -f ~/.gemini/skills/arch-insight/RUNNER.md
```

## 功能级最小人工验收

目录检查通过后，分别在三平台确认：

- 能看到 `arch-insight` 入口
- 读取 skill 时不会因缺少 `RUNNER.md` 或模板文件而失效
- 默认分析路径还能引用到 `01_repo_intake.md` 与 `ARCHITECTURE_REPORT.md`

最小验收提示词建议：

```text
请使用 arch-insight 分析当前仓库，先说明它的默认交付形态判定规则，再列出你会读取的第一个 prompt 和最终主报告模板。
```

期望：

- 明确提到交付形态判定
- 能引用 `01_repo_intake.md`
- 能引用 `ARCHITECTURE_REPORT.md` 或文章模式模板

## 常见失败信号

- 只有 `SKILL.md`，但没有 `RUNNER.md` 或 `templates/`
- Codex / Gemini 安装后找不到 prompt 目录
- shell 链路报 `install-manifest.json` 或 tarball 缺失
- shell 链路实际依赖 `npm` / `npx`
- 根目录兼容入口与 `plugins/arch-insight` 内容漂移

## 记录建议

每次 smoke test 建议至少记录：

- 安装入口：npm CLI 还是 shell
- 平台：Claude / Codex / Gemini
- 实际检查过的目标目录
- 是否能成功读取 `SKILL.md`、`RUNNER.md`、模板、prompt
- 是否完成一条最小提示词验收
