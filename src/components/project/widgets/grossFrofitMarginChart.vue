<script>
import { mapState, mapGetters } from 'vuex'
import { update, reduce, forEach, merge } from 'lodash'
import startOfMonth from 'date-fns/start_of_month'
import addMonths from 'date-fns/add_months'
import differenceInMonths from 'date-fns/difference_in_months'
import format from 'date-fns/format'
import formatCurrency from '@/utils/format-currency'
import echartDefaults from '@/constants/echarts'

import ECharts from 'vue-echarts/components/ECharts'

// import ECharts modules manually to reduce bundle size
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'

var locales = {
    en: require('date-fns/locale/en'),
    ja: require('date-fns/locale/ja'),
}

export default {
    components: { 'v-chart': ECharts },
    props: {
        widget: {
            type: Object,
        },
    },

    data() {
        return {
            isActual: true,
            pas: ['planned', 'actual'],
        }
    },

    computed: {
        //...mapState(['project', 'planned', 'actual', 'categories']),
        ...mapState({
            project: state => state.projects.current,
            planned: state => state.projects.planned,
            actual: state => state.projects.actual,
            categoried: state => state.projects.categories,
        }),

        ...mapGetters(['currency']),

        // format: { month: {pa: { type }}}
        costs() {
            const data = {}
            this.pas.forEach(pa => {
                const paData = this[pa]
                Object.keys(paData).forEach(type => {
                    const typeData = paData[type] || []
                    typeData.forEach(item => {
                        const startDate = this.startDate
                        if (!Array.isArray(item.monthly)) {
                            return
                        }
                        item.monthly.forEach((montlyData, index) => {
                            let monthStart = addMonths(startDate, index).getTime()
                            // display data untill today + a year
                            if (differenceInMonths(monthStart, Date()) > 0) {
                                return
                            }

                            let sum = montlyData.price * montlyData.quantity
                            let path = [monthStart, pa, type]
                            update(data, path, amount => (amount || 0) + sum)
                        })
                    })
                })
            })
            const sorted = {}
            Object.keys(data)
                .sort()
                .forEach(ts => {
                    sorted[ts] = data[ts]
                })
            return sorted
        },
        chartOptions() {
            const pa = this.pas[this.isActual ? 1 : 0]

            const chartData = { grossProfit: [], grossProfitMargin: [] }
            const months = []
            forEach(this.costs, (monthData, ts) => {
                months.push(
                    format(Number(ts), 'YYYY/MM', {
                        locale: locales[this.$root.lang],
                    })
                )
                const summary = reduce(
                    this.costs[ts][pa],
                    (summary, value, type) => {
                        if (type === 'revenue') {
                            summary.revenue += value || 0
                        } else if (type === 'cogs') {
                            summary.cogs = value || 0
                        }
                        return summary
                    },
                    { cogs: 0, revenue: 0 }
                )
                chartData.grossProfit.push(summary.revenue - summary.cogs)
                chartData.grossProfitMargin.push(
                    summary.revenue
                        ? Math.round((100 * (summary.revenue - summary.cogs)) / summary.revenue)
                        : 0
                )
            })
            const extremeGrossProfit = Math.max(
                Math.abs(Math.max(...chartData.grossProfit)),
                Math.abs(Math.min(...chartData.grossProfit))
            )
            const seriesOptions = {
                // https://ecomfe.github.io/echarts-doc/public/en/option.html#series-line
                type: 'line',
                symbol: 'circle',
                symbolSize: 6,
                smooth: false,
                lineStyle: {
                    width: 3,
                },
            }
            const axisOptions = {
                axisPointer: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                splitLine: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        color: '#979797',
                    },
                },
            }

            return merge({}, echartDefaults, {
                color: ['#5C6CC0', '#B3BCEC'],
                tooltip: {
                    trigger: 'item',
                    formatter: params => {
                        let marker = `<span style="display: inline-block; width: 10px;height:10px; background-color: ${
                            params.color
                        }"></span>`
                        let label = params.seriesName
                        let value = null
                        if (label === this.$t('Gross Profit Actual')) {
                            value = formatCurrency(params.value, this.currency)
                        } else if (label === this.$t('Gross Profit Margin Actual')) {
                            value = params.value + '%'
                        }
                        label = this.$t(label)
                        label = label[0].toUpperCase() + label.slice(1)
                        const html = `${marker} <b>${params.name}</b><br/>${label}: ${value}`
                        return html
                    },
                },
                legend: {
                    data: [
                        { icon: 'roundRect', name: this.$t('Gross Profit Actual') },
                        { icon: 'roundRect', name: this.$t('Gross Profit Margin Actual') },
                    ],
                    top: 10,
                    left: 0,
                },
                grid: {
                    top: 75,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    containLabel: false,
                },
                xAxis: [
                    {
                        ...axisOptions,
                        type: 'category',
                        data: months,
                    },
                ],
                //https://ecomfe.github.io/echarts-doc/public/en/option.html#yAxis
                yAxis: [
                    {
                        ...axisOptions,
                        type: 'value',
                        min: -1.1 * extremeGrossProfit,
                        max: 1.1 * extremeGrossProfit,
                    },
                    {
                        ...axisOptions,
                        type: 'value',
                        min: -110,
                        max: 110,
                    },
                ],
                series: [
                    {
                        ...seriesOptions,
                        name: this.$t('Gross Profit Actual'),
                        yAxisIndex: 0,
                        data: chartData.grossProfit,
                    },
                    {
                        ...seriesOptions,
                        name: this.$t('Gross Profit Margin Actual'),
                        yAxisIndex: 1,
                        data: chartData.grossProfitMargin,
                    },
                ],
            })
        },
        startDate() {
            return startOfMonth(this.project.start_date)
        },
    },

    mounted() {},

    methods: {},
}
</script>

<template>
    <div><v-chart v-if="costs" :options="chartOptions" auto-resize /></div>
</template>

<style lang="scss" scoped>
.controls {
    position: absolute;
    top: 0px;
    right: 0;
    margin-top: 0;
}
.echarts {
    width: 100%;
    height: 200px;
}
</style>
