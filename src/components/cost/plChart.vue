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
    props: {},

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
                            if (differenceInMonths(monthStart, Date()) > 11) {
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

            const chartData = { expenses: [], revenue: [], total: [] }
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
                        } else {
                            summary.expenses -= value || 0
                        }
                        return summary
                    },
                    { expenses: 0, revenue: 0 }
                )
                chartData.expenses.push(summary.expenses)
                chartData.revenue.push(summary.revenue)
                chartData.total.push(summary.revenue + summary.expenses)
            })

            return merge({}, echartDefaults, {
                color: ['#ffad67', '#5c6cc0', '#48abb0'],
                tooltip: {
                    trigger: 'item',
                    formatter: params => {
                        let marker = `<span style="display: inline-block; width: 10px;height:10px; background-color: ${
                            params.color
                        }"></span>`
                        let label = params.seriesName
                        label = this.$t(label)
                        label = label[0].toUpperCase() + label.slice(1)
                        let value = formatCurrency(Math.abs(params.value), this.currency)
                        const html = `${marker} <b>${params.name}</b><br/>${label}: ${value}`
                        return html
                    },
                },
                legend: {
                    data: [
                        this.$t('Revenue'),
                        this.$t('Expenses'),
                        { icon: 'roundRect', name: this.$t('Operating Profit') },
                    ],
                    top: 20,
                    left: 0,
                },
                grid: {
                    left: 100,
                    right: 0,
                    bottom: 24,
                },
                xAxis: [
                    {
                        type: 'category',
                        data: months,
                        axisPointer: {
                            type: 'shadow',
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#979797',
                            },
                        },
                    },
                ],
                //https://ecomfe.github.io/echarts-doc/public/en/option.html#yAxis
                yAxis: [
                    {
                        type: 'value',
                        boundaryGap: [0.01, 0.01],
                        axisLabel: {
                            formatter: value => formatCurrency(Math.abs(value), this.currency),
                        },
                        axisPointer: {
                            label: {
                                formatter: ({ value }) =>
                                    formatCurrency(Math.abs(value), this.currency),
                            },
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#979797',
                            },
                        },
                    },
                ],
                series: [
                    {
                        // https://ecomfe.github.io/echarts-doc/public/en/option.html#series-bar
                        name: this.$t('Expenses'),
                        type: 'bar',
                        data: chartData.expenses,
                        stack: 'costs',
                        barCategoryGap: '40%',
                    },
                    {
                        name: this.$t('Revenue'),
                        type: 'bar',
                        data: chartData.revenue,
                        stack: 'costs',
                        barCategoryGap: '40%',
                    },
                    {
                        // https://ecomfe.github.io/echarts-doc/public/en/option.html#series-line
                        name: this.$t('Operating Profit'),
                        type: 'line',
                        symbol: 'circle',
                        symbolSize: 3,
                        smooth: false,
                        data: chartData.total,
                        lineStyle: {
                            width: 3,
                        },
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
    <v-card v-if="costs" class="mx-0 pa-3">
        <div class="grey-text text-darken-1">
            <v-layout row align-center>
                <v-flex class="title"> {{ 'Monthly Revenue vs Expenditure' | translate }} </v-flex>
                <!-- <v-menu left>
                    <v-btn icon small slot="activator" class="ma-0">
                        <v-icon>more_vert</v-icon>
                    </v-btn>
                    <v-list class="text-capitalize">
                        <v-list-tile @click="$emit('remove')">
                            <v-list-tile-title>{{ 'remove' | translate }}</v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                </v-menu> -->
            </v-layout>
        </div>
        <v-content class="mt-3 pa-0">
            <v-chart :options="chartOptions" auto-resize />
            <v-btn-toggle v-model="isActual" dense class="controls" mandatory>
                <v-btn :value="true" outline>{{ 'actual' | translate }}</v-btn>
                <v-btn :value="false" outline>{{ 'planned' | translate }}</v-btn>
            </v-btn-toggle>
        </v-content>
    </v-card>
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
}
</style>
