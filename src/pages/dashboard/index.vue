<script setup lang="ts">
import dayjs from "dayjs"
import { getDashboardOverviewApi } from "@/common/apis/dashboard"

interface MetricCard {
  label: string
  value: string
  hint: string
  tone?: "primary" | "accent"
}

const loading = ref(false)
const refreshedAt = ref("")

const overview = reactive({
  todayOrderCount: 0,
  todayPaidAmount: 0,
  totalUsers: 0,
  todayNewUsers: 0,
  totalModels: 0,
  enabledModels: 0,
  totalCategories: 0,
  totalImages: 0,
  todayGenerationCount: 0,
  todayPointsConsumed: 0
})

const heroStats = computed(() => [
  {
    label: "今日订单",
    value: formatCount(overview.todayOrderCount),
    note: "核心交易活动"
  },
  {
    label: "今日营收",
    value: formatAmount(overview.todayPaidAmount),
    note: "平台实时收入"
  },
  {
    label: "新增用户",
    value: formatCount(overview.todayNewUsers),
    note: "拉新表现"
  },
  {
    label: "生成次数",
    value: formatCount(overview.todayGenerationCount),
    note: "内容生产热度"
  }
])

const metricCards = computed<MetricCard[]>(() => [
  {
    label: "累计用户规模",
    value: formatCount(overview.totalUsers),
    hint: `今日新增 ${formatCount(overview.todayNewUsers)}`,
    tone: "primary"
  },
  {
    label: "模型在线率",
    value: formatPercent(overview.enabledModels, overview.totalModels),
    hint: `${formatCount(overview.enabledModels)} / ${formatCount(overview.totalModels)} 已启用`
  },
  {
    label: "分类资产总量",
    value: formatCount(overview.totalCategories),
    hint: "支持业务内容聚合"
  },
  {
    label: "图库资产总量",
    value: formatCount(overview.totalImages),
    hint: `${formatDensity(overview.totalImages, overview.totalCategories)} 张 / 分类`,
    tone: "accent"
  },
  {
    label: "单次生成消耗",
    value: formatDecimal(safeDivide(overview.todayPointsConsumed, overview.todayGenerationCount)),
    hint: `今日共消耗 ${formatCount(overview.todayPointsConsumed)} 积分`
  },
  {
    label: "平均订单金额",
    value: formatAmount(safeDivide(overview.todayPaidAmount, overview.todayOrderCount)),
    hint: "衡量今日付费质量"
  }
])

const efficiencyPanels = computed(() => {
  const generationLoad = clampPercent(overview.todayGenerationCount, 200)
  const userGrowth = clampPercent(overview.todayNewUsers, 120)
  const paidMomentum = clampPercent(overview.todayPaidAmount, 20000)

  return [
    {
      title: "模型健康度",
      value: formatPercent(overview.enabledModels, overview.totalModels),
      detail: `${formatCount(overview.enabledModels)} 个模型在线`,
      progress: clampPercent(overview.enabledModels, Math.max(overview.totalModels, 1)),
      theme: "blue"
    },
    {
      title: "新增拉新强度",
      value: `${userGrowth}%`,
      detail: `今日新增 ${formatCount(overview.todayNewUsers)} 人`,
      progress: userGrowth,
      theme: "cyan"
    },
    {
      title: "内容生产负载",
      value: `${generationLoad}%`,
      detail: `生成 ${formatCount(overview.todayGenerationCount)} 次`,
      progress: generationLoad,
      theme: "amber"
    },
    {
      title: "营收动能",
      value: `${paidMomentum}%`,
      detail: `累计收入 ${formatAmount(overview.todayPaidAmount)}`,
      progress: paidMomentum,
      theme: "indigo"
    }
  ]
})

const distributionCards = computed(() => {
  const totalAssets = overview.totalModels + overview.totalCategories + overview.totalImages

  return [
    {
      label: "模型资产",
      value: formatCount(overview.totalModels),
      percent: clampPercent(overview.totalModels, Math.max(totalAssets, 1)),
      note: "核心能力供给"
    },
    {
      label: "分类体系",
      value: formatCount(overview.totalCategories),
      percent: clampPercent(overview.totalCategories, Math.max(totalAssets, 1)),
      note: "内容组织骨架"
    },
    {
      label: "图片内容",
      value: formatCount(overview.totalImages),
      percent: clampPercent(overview.totalImages, Math.max(totalAssets, 1)),
      note: "内容资产沉淀"
    }
  ]
})

const operationalSignals = computed(() => [
  {
    label: "付费转化观察",
    value: formatAmount(safeDivide(overview.todayPaidAmount, overview.todayOrderCount)),
    description: "单笔订单收入"
  },
  {
    label: "内容产出效率",
    value: formatDecimal(safeDivide(overview.todayGenerationCount, overview.totalUsers)),
    description: "人均生成次数"
  },
  {
    label: "资产充足度",
    value: formatDensity(overview.totalImages, overview.totalCategories),
    description: "分类平均图片数"
  }
])

function safeDivide(numerator: number, denominator: number) {
  if (!denominator) return 0
  return numerator / denominator
}

function clampPercent(value: number, total: number) {
  if (!total) return 0
  return Math.min(100, Number(((value / total) * 100).toFixed(1)))
}

function formatCount(value: number) {
  return new Intl.NumberFormat("zh-CN").format(Number(value || 0))
}

function formatAmount(value: number) {
  return `¥${Number(value || 0).toFixed(2)}`
}

function formatDecimal(value: number) {
  return Number(value || 0).toFixed(2)
}

function formatPercent(part: number, total: number) {
  if (!total) return "0.00%"
  return `${((part / total) * 100).toFixed(2)}%`
}

function formatDensity(value: number, total: number) {
  return total ? `${(value / total).toFixed(1)}` : "0.0"
}

async function loadOverview() {
  loading.value = true
  try {
    const { data } = await getDashboardOverviewApi()
    Object.assign(overview, data)
    refreshedAt.value = dayjs().format("HH:mm:ss")
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOverview()
})
</script>

<template>
  <div class="app-container dashboard-page" v-loading="loading">
    <section class="dashboard-hero">
      <div class="dashboard-hero__content">
        <p class="dashboard-hero__eyebrow">Operations cockpit</p>
        <div class="dashboard-hero__heading">
          <div>
            <h2 class="dashboard-hero__title">平台运营总览</h2>
            <p class="dashboard-hero__desc">
              聚合订单、用户、模型、分类与内容资产数据，帮助你快速判断平台增长、供给健康度与今日经营表现。
            </p>
          </div>
          <div class="dashboard-hero__meta">
            <span class="dashboard-hero__meta-label">最近刷新</span>
            <strong>{{ refreshedAt || "--:--:--" }}</strong>
          </div>
        </div>

        <div class="dashboard-hero__stats">
          <article v-for="item in heroStats" :key="item.label" class="hero-stat">
            <p class="hero-stat__label">{{ item.label }}</p>
            <p class="hero-stat__value">{{ item.value }}</p>
            <p class="hero-stat__note">{{ item.note }}</p>
          </article>
        </div>
      </div>

      <aside class="dashboard-hero__aside">
        <div class="hero-aside__panel">
          <p class="hero-aside__kicker">今日关注</p>
          <h3>系统在线率稳定，内容产出持续活跃。</h3>
          <p>
            当前启用模型 {{ formatCount(overview.enabledModels) }} 个，累计图片资产
            {{ formatCount(overview.totalImages) }} 张，可支撑持续生成与分发。
          </p>
        </div>
        <el-button type="primary" size="large" class="hero-aside__button" @click="loadOverview">
          刷新数据
        </el-button>
      </aside>
    </section>

    <section class="metrics-grid">
      <article v-for="item in metricCards" :key="item.label" class="metric-card" :class="`is-${item.tone || 'default'}`">
        <div class="metric-card__top">
          <span class="metric-card__label">{{ item.label }}</span>
          <span class="metric-card__dot" />
        </div>
        <p class="metric-card__value">{{ item.value }}</p>
        <p class="metric-card__hint">{{ item.hint }}</p>
      </article>
    </section>

    <section class="dashboard-main">
      <div class="panel panel--efficiency">
        <div class="panel__header">
          <div>
            <p class="panel__eyebrow">Efficiency</p>
            <h3 class="panel__title">运营效率监控</h3>
          </div>
          <span class="panel__hint">基于今日数据生成的即时观察</span>
        </div>
        <div class="efficiency-grid">
          <article v-for="item in efficiencyPanels" :key="item.title" class="efficiency-card">
            <div class="efficiency-card__head">
              <div>
                <p class="efficiency-card__title">{{ item.title }}</p>
                <strong class="efficiency-card__value">{{ item.value }}</strong>
              </div>
              <span class="efficiency-card__badge" :class="`is-${item.theme}`">{{ item.progress }}%</span>
            </div>
            <p class="efficiency-card__detail">{{ item.detail }}</p>
            <el-progress
              :percentage="item.progress"
              :show-text="false"
              :stroke-width="10"
              :color="item.theme === 'amber' ? '#F59E0B' : item.theme === 'cyan' ? '#06B6D4' : item.theme === 'indigo' ? '#4F46E5' : '#2563EB'"
            />
          </article>
        </div>
      </div>

      <div class="panel panel--distribution">
        <div class="panel__header">
          <div>
            <p class="panel__eyebrow">Assets</p>
            <h3 class="panel__title">资源结构分布</h3>
          </div>
          <span class="panel__hint">核心资源池占比</span>
        </div>
        <div class="distribution-list">
          <article v-for="item in distributionCards" :key="item.label" class="distribution-item">
            <div class="distribution-item__top">
              <div>
                <p class="distribution-item__label">{{ item.label }}</p>
                <strong class="distribution-item__value">{{ item.value }}</strong>
              </div>
              <span class="distribution-item__percent">{{ item.percent }}%</span>
            </div>
            <p class="distribution-item__note">{{ item.note }}</p>
            <div class="distribution-item__track">
              <span class="distribution-item__bar" :style="{ width: `${item.percent}%` }" />
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="signal-grid">
      <article v-for="item in operationalSignals" :key="item.label" class="signal-card">
        <p class="signal-card__label">{{ item.label }}</p>
        <strong class="signal-card__value">{{ item.value }}</strong>
        <p class="signal-card__desc">{{ item.description }}</p>
      </article>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-page {
  --dashboard-bg: linear-gradient(180deg, color-mix(in srgb, var(--el-color-primary) 6%, transparent), transparent 28%);
  --dashboard-card-bg: color-mix(in srgb, var(--el-bg-color) 92%, #fff 8%);
  --dashboard-card-border: color-mix(in srgb, var(--el-border-color-lighter) 78%, var(--el-color-primary) 22%);
  --dashboard-muted: var(--el-text-color-secondary);
  display: grid;
  gap: 20px;
  background: var(--dashboard-bg);
}

.dashboard-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.9fr);
  gap: 18px;

  &__content,
  &__aside {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--dashboard-card-border);
    border-radius: 28px;
    box-shadow: 0 20px 45px rgb(15 23 42 / 10%);
  }

  &__content {
    padding: 28px;
    background:
      radial-gradient(circle at top left, rgb(59 130 246 / 0.22), transparent 38%),
      linear-gradient(135deg, #0f2d6b, #1d4ed8 52%, #2563eb);
    color: #eff6ff;
  }

  &__aside {
    padding: 24px;
    background:
      radial-gradient(circle at top right, rgb(245 158 11 / 0.16), transparent 34%),
      linear-gradient(180deg, color-mix(in srgb, var(--el-bg-color) 88%, #0f172a 12%), var(--dashboard-card-bg));
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 20px;
  }

  &__eyebrow {
    margin: 0 0 12px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    opacity: 0.78;
  }

  &__heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
  }

  &__title {
    margin: 0;
    font-size: clamp(28px, 4vw, 40px);
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  &__desc {
    margin: 14px 0 0;
    max-width: 700px;
    color: rgb(239 246 255 / 0.84);
    line-height: 1.75;
  }

  &__meta {
    min-width: 104px;
    padding: 14px 16px;
    border: 1px solid rgb(255 255 255 / 0.16);
    border-radius: 18px;
    background: rgb(255 255 255 / 0.08);
    backdrop-filter: blur(16px);

    strong {
      display: block;
      margin-top: 6px;
      font-size: 20px;
      color: #fff;
    }
  }

  &__meta-label {
    font-size: 12px;
    color: rgb(239 246 255 / 0.72);
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-top: 28px;
  }
}

.hero-stat {
  padding: 18px;
  border: 1px solid rgb(255 255 255 / 0.14);
  border-radius: 20px;
  background: rgb(255 255 255 / 0.08);
  backdrop-filter: blur(10px);

  &__label,
  &__note {
    margin: 0;
    color: rgb(239 246 255 / 0.72);
  }

  &__label {
    font-size: 13px;
  }

  &__value {
    margin: 12px 0 8px;
    font-size: clamp(24px, 3.2vw, 34px);
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.04em;
  }

  &__note {
    font-size: 12px;
  }
}

.hero-aside__panel {
  h3 {
    margin: 10px 0 12px;
    font-size: 24px;
    line-height: 1.3;
    color: var(--el-text-color-primary);
  }

  p {
    margin: 0;
    color: var(--dashboard-muted);
    line-height: 1.75;
  }
}

.hero-aside__kicker {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #d97706;
}

.hero-aside__button {
  width: 100%;
  height: 46px;
  border-radius: 14px;
}

.metrics-grid,
.signal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.metric-card,
.signal-card,
.panel {
  border: 1px solid var(--dashboard-card-border);
  border-radius: 24px;
  background: var(--dashboard-card-bg);
  box-shadow: 0 14px 28px rgb(15 23 42 / 6%);
}

.metric-card {
  padding: 22px;
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    box-shadow 220ms ease;

  &:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--el-color-primary) 32%, var(--dashboard-card-border));
    box-shadow: 0 22px 36px rgb(15 23 42 / 10%);
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__label {
    font-size: 14px;
    color: var(--dashboard-muted);
  }

  &__dot {
    width: 11px;
    height: 11px;
    border-radius: 999px;
    background: linear-gradient(135deg, #93c5fd, #2563eb);
    box-shadow: 0 0 0 5px rgb(37 99 235 / 0.1);
  }

  &__value {
    margin: 18px 0 10px;
    font-size: clamp(30px, 3vw, 38px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.05em;
    color: var(--el-text-color-primary);
  }

  &__hint {
    margin: 0;
    color: var(--dashboard-muted);
    line-height: 1.6;
  }

  &.is-primary {
    background:
      radial-gradient(circle at top right, rgb(37 99 235 / 0.12), transparent 30%),
      var(--dashboard-card-bg);
  }

  &.is-accent {
    background:
      radial-gradient(circle at top right, rgb(245 158 11 / 0.14), transparent 30%),
      var(--dashboard-card-bg);
  }
}

.dashboard-main {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.95fr);
  gap: 16px;
}

.panel {
  padding: 24px;

  &__header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }

  &__eyebrow {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--el-color-primary);
  }

  &__title {
    margin: 0;
    font-size: 22px;
    color: var(--el-text-color-primary);
  }

  &__hint {
    color: var(--dashboard-muted);
    font-size: 13px;
  }
}

.efficiency-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.efficiency-card {
  padding: 18px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--el-fill-color-extra-light) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--dashboard-card-border) 76%, white 24%);

  &__head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }

  &__title {
    margin: 0;
    color: var(--dashboard-muted);
    font-size: 14px;
  }

  &__value {
    display: block;
    margin-top: 10px;
    font-size: 28px;
    line-height: 1;
    color: var(--el-text-color-primary);
    letter-spacing: -0.04em;
  }

  &__detail {
    margin: 14px 0 16px;
    color: var(--dashboard-muted);
    line-height: 1.6;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 62px;
    height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    background: rgb(37 99 235 / 0.1);
    color: #2563eb;
  }
}

.is-cyan {
  background: rgb(6 182 212 / 0.1);
  color: #0891b2;
}

.is-amber {
  background: rgb(245 158 11 / 0.12);
  color: #d97706;
}

.is-indigo {
  background: rgb(79 70 229 / 0.1);
  color: #4338ca;
}

.distribution-list {
  display: grid;
  gap: 14px;
}

.distribution-item {
  padding: 18px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--el-fill-color-extra-light) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--dashboard-card-border) 76%, white 24%);

  &__top {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: center;
  }

  &__label,
  &__note {
    margin: 0;
    color: var(--dashboard-muted);
  }

  &__value {
    display: block;
    margin-top: 8px;
    font-size: 26px;
    color: var(--el-text-color-primary);
    letter-spacing: -0.04em;
  }

  &__percent {
    font-size: 18px;
    font-weight: 700;
    color: var(--el-color-primary);
  }

  &__note {
    margin: 14px 0 14px;
    line-height: 1.6;
  }

  &__track {
    position: relative;
    height: 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--el-fill-color) 55%, transparent);
    overflow: hidden;
  }

  &__bar {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #1d4ed8, #60a5fa);
  }
}

.signal-card {
  padding: 20px 22px;

  &__label,
  &__desc {
    margin: 0;
    color: var(--dashboard-muted);
  }

  &__value {
    display: block;
    margin: 14px 0 10px;
    font-size: 30px;
    line-height: 1;
    color: var(--el-text-color-primary);
    letter-spacing: -0.04em;
  }

  &__desc {
    line-height: 1.6;
  }
}

@media screen and (max-width: 1200px) {
  .dashboard-hero,
  .dashboard-main,
  .metrics-grid,
  .signal-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-hero__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media screen and (max-width: 768px) {
  .dashboard-page {
    gap: 16px;
  }

  .dashboard-hero__content,
  .dashboard-hero__aside,
  .panel,
  .metric-card,
  .signal-card {
    border-radius: 20px;
  }

  .dashboard-hero__content {
    padding: 22px;
  }

  .dashboard-hero__heading,
  .panel__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .dashboard-hero__stats,
  .efficiency-grid,
  .metrics-grid,
  .signal-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-main {
    grid-template-columns: 1fr;
  }
}
</style>
