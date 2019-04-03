<script>
import { mapGetters } from 'vuex'

import { merge, uniq } from 'lodash'
import format from 'date-fns/format'
import addMonths from 'date-fns/add_months'
import MarketCostDetails from '@/components/project/market-cost-details'
import echartDefaults from '@/constants/echarts'

import numbro from 'numbro'

import ECharts from 'vue-echarts/components/ECharts'

// import ECharts modules manually to reduce bundle size
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'

var locales = {
    en: require('date-fns/locale/en'),
    ja: require('date-fns/locale/ja'),
}

export default {
    components: { MarketCostDetails, 'v-chart': ECharts },
    data: () => ({
        lin_revenue: [],
        log_revenue: [],
        exp_revenue: [],
    }),

    computed: {
        project() {
            return this.$store.state.projects.current
        },

        ...mapGetters([
            'market_total',
            'lead_acquisition',
            'lifetime_value',
            'customer_acquisition_cost',
            'revenue',
            'gross_profit',
            'contribution_margin',
            'currency',
        ]),

        model() {
            return this.project.model
        },

        rows() {
            var data = []

            data.push({
                name: this.$t('lead acquisition'),
                value: numbro(this.lead_acquisition).format({
                    thousandSeparated: true,
                    mantissa: 0,
                }),
            })

            data.push({
                name: this.$t('lifetime value'),
                value:
                    this.currency +
                    numbro(this.lifetime_value).format({
                        thousandSeparated: true,
                        mantissa: 0,
                    }),
            })

            data.push({
                name: this.$t('customer acquisition cost'),
                value:
                    this.currency +
                    numbro(this.customer_acquisition_cost).format({
                        thousandSeparated: true,
                        mantissa: 0,
                    }),
            })

            data.push({
                name: this.$t('revenue'),
                value:
                    this.currency +
                    numbro(this.revenue).format({
                        thousandSeparated: true,
                        mantissa: 0,
                    }),
            })

            data.push({
                name: this.$t('gross profit'),
                value:
                    this.currency +
                    numbro(this.gross_profit).format({
                        thousandSeparated: true,
                        mantissa: 0,
                    }),
            })

            data.push({
                name: this.$t('contribution margin'),
                value:
                    this.currency +
                    numbro(this.contribution_margin).format({
                        thousandSeparated: true,
                        mantissa: 0,
                    }),
            })

            return data
        },

        chartOptions() {
            const seriesOptions = {
                type: 'line',
                symbol: 'circle',
                symbolSize: 5,
                smooth: true,
                lineStyle: {
                    width: 2,
                },
                hoverAnimation: true,
            }
            const yFormatter = value =>
                numbro(value).format({
                    average: true,
                    mantissa: this.currency == '￥' ? 0 : 2,
                })
            let months = [...this.lin_revenue, ...this.log_revenue, ...this.exp_revenue].map(
                data => data[0] && new Date(data[0]).getTime()
            )
            months = uniq(months)
                .sort()
                .map(ts =>
                    format(Number(ts), 'YYYY/MM', {
                        locale: locales[this.$root.lang],
                    })
                )
            return merge({}, echartDefaults, {
                grid: {
                    left: '50',
                    right: 1,
                    bottom: 21,
                },
                color: ['#3366cc', '#dc3912', '#f29818'],
                tooltip: {
                    trigger: 'item',
                    transitionDuration: 0,
                    formatter: params => {
                        let marker = `<span style="display: inline-block; width: 10px;height:10px; background-color: ${
                            params.color
                        }"></span>`
                        let value = numbro(params.value).format({
                            average: true,
                            thousandSeparated: true,
                            mantissa: this.currency == '￥' ? 0 : 2,
                        })
                        const html = `${marker} <b>${params.name}</b><br/>${value}`
                        return html
                    },
                },
                legend: {
                    data: [
                        { icon: 'roundRect', name: this.$t('Linear') },
                        { icon: 'roundRect', name: this.$t('Logarithmic') },
                        { icon: 'roundRect', name: this.$t('Exponential') },
                    ],
                    top: 0,
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
                        min: 'dataMin',
                        max: 'dataMax',
                        boundaryGap: [0.01, 0.01],
                        axisLabel: {
                            formatter: yFormatter,
                        },
                        axisPointer: {
                            label: {
                                formatter: ({ value }) => yFormatter(value),
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
                        ...seriesOptions,
                        name: this.$t('Linear'),
                        data: this.lin_revenue.map(data => data[1]),
                    },
                    {
                        ...seriesOptions,
                        name: this.$t('Logarithmic'),
                        data: this.log_revenue.map(data => data[1]),
                    },
                    {
                        // https://ecomfe.github.io/echarts-doc/public/en/option.html#series-line
                        ...seriesOptions,
                        name: this.$t('Exponential'),
                        data: this.exp_revenue.map(data => data[1]),
                    },
                ],
            })
        },
    },

    mounted() {
        this.calculateRevenue()
        this.$root.$on('update-revenue', () => {
            this.calculateRevenue()
        })
    },

    methods: {
        formatColMonth(i) {
            return format(addMonths(this.project.start_date, i), 'YYYY/MM', {
                locale: locales[this.$root.lang],
            })
        },
        calculateRevenue() {
            // linear
            this.$store.dispatch('getLinRevenue').then(points => {
                this.lin_revenue = points
            })
            // logarithmic
            this.$store.dispatch('getLogRevenue').then(points => {
                this.log_revenue = points
            })
            // exponential
            this.$store.dispatch('getExpRevenue').then(points => {
                this.exp_revenue = points
            })
        },
    },
}
</script>

<template>
    <v-flex>
        <v-layout row wrap>
            <v-flex xs12 sm5 md4 lg3>
                <market-cost-details :model="model" style="min-height: 320px" />
            </v-flex>
            <v-flex xs12 sm7 md8 lg9>
                <v-card style="min-height: 320px" class="pa-3">
                    <div v-if="chartOptions"><v-chart :options="chartOptions" auto-resize /></div>
                </v-card>
            </v-flex>
        </v-layout>
    </v-flex>
</template>

<style>
.corner-col {
    text-align: right !important;
    width: 150px;
    min-width: 150px;
    background-color: rgba(0, 0, 0, 0.08);
}
.md-table-head-label {
    line-height: 36px;
    height: 36px;
}
.corner-col .md-table-head-label {
    padding-right: 0;
}
.gray-cell {
    background-color: rgba(0, 0, 0, 0.08);
}
.vue-easy-pie-chart .inner-text {
    color: #00bcd4;
}
.md-accent {
    color: #00bcd4;
}
.echarts {
    height: 288px;
    width: 100%;
}
</style>
