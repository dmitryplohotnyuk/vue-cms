<script>
import { mapState, mapGetters } from 'vuex'
import { update, reduce, forEach, merge } from 'lodash'
import isFuture from 'date-fns/is_future'
import startOfMonth from 'date-fns/start_of_month'
import addMonths from 'date-fns/add_months'
import echartDefaults from '@/constants/echarts'

// import ECharts from 'vue-echarts/components/ECharts'

// import ECharts modules manually to reduce bundle size
// import 'echarts/lib/chart/line'
// import 'echarts/lib/component/tooltip'

export default {
    components: {},
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
            categories: state => state.projects.categories,
        }),

        ...mapGetters(['currency', 'revenue_actual_total', 'revenue_planned_total']),

        difference() {
            return this.revenue_actual_total - this.revenue_planned_total
        },

        differenceClass() {
            return this.difference < 0 ? 'danger--text' : 'success--text'
        },

        // format: { month: {pa: { type }}}
        costs() {
            const data = {}
            this.pas.forEach(pa => {
                const paData = this[pa]
                Object.keys(paData).forEach(type => {
                    if (type !== 'revenue') {
                        return
                    }
                    const typeData = paData[type] || []
                    typeData.forEach(item => {
                        const startDate = this.startDate
                        // display data untill today
                        if (!Array.isArray(item.monthly)) {
                            return
                        }
                        item.monthly.forEach((montlyData, index) => {
                            let monthStart = addMonths(startDate, index).getTime()
                            if (isFuture(monthStart)) {
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
            const chartData = { actual: [], planned: [] }
            forEach(this.costs, (monthData, ts) => {
                forEach(chartData, (data, pa) => {
                    const summary = reduce(
                        this.costs[ts][pa],
                        (summary, value, type) => {
                            if (type === 'revenue') {
                                summary += value || 0
                            }
                            return summary
                        },
                        0
                    )
                    chartData[pa].push(summary)
                })
            })

            chartData.difference = chartData.actual.map((num, index) => {
                return num - chartData.planned[index]
            })

            return merge({}, echartDefaults, {
                color: ['#4ebcd4', '#ff9900', 'red'],
                grid: {
                    left: 0,
                    top: 10,
                    bottom: 10,
                    right: 0,
                },
                tooltip: {
                    show: false,
                },
                legend: {
                    show: false,
                    data: Object.keys(this.costs),
                },
                xAxis: [
                    {
                        type: 'category',
                        show: false,
                        boundaryGap: false,
                    },
                ],
                //https://ecomfe.github.io/echarts-doc/public/en/option.html#yAxis
                yAxis: [
                    {
                        show: false,
                        type: 'value',
                        boundaryGap: false,
                    },
                ],
                series: [
                    {
                        // https://ecomfe.github.io/echarts-doc/public/en/option.html#series-line
                        type: 'line',
                        symbol: 'circle',
                        symbolSize: 2,
                        smooth: false,
                        data: chartData.planned,
                        lineStyle: {
                            width: 2,
                        },
                    },
                    {
                        // https://ecomfe.github.io/echarts-doc/public/en/option.html#series-line
                        type: 'line',
                        symbol: 'circle',
                        symbolSize: 2,
                        smooth: false,
                        data: chartData.actual,
                        lineStyle: {
                            width: 2,
                        },
                    },
                    {
                        // https://ecomfe.github.io/echarts-doc/public/en/option.html#series-line
                        type: 'line',
                        symbol: 'circle',
                        symbolSize: 2,
                        smooth: false,
                        data: chartData.difference,
                        lineStyle: {
                            width: 2,
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
    <div>
        <v-card v-if="costs" class="mx-0 pa-3">
            <div class="mb-2 blue-grey-text darken-2">
                <span class="subheading text-capitalize">{{ 'revenue' | translate }}</span>
            </div>
            <v-list dense>
                <v-list-tile>
                    <v-list-tile-content class="text-capitalize darkgrey--text subheading">
                        {{ 'actual' | translate }}:
                    </v-list-tile-content>
                    <v-list-tile-content class="align-end black-text subheading">
                        {{ revenue_actual_total | currency(currency) }}
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile>
                    <v-list-tile-content class="text-capitalize darkgrey--text subheading">
                        {{ 'planned' | translate }}:
                    </v-list-tile-content>
                    <v-list-tile-content class="align-end black-text subheading">
                        {{ revenue_planned_total | currency(currency) }}
                    </v-list-tile-content>
                </v-list-tile>
                <v-tooltip max-width="300" bottom>
                    <v-list-tile slot="activator">
                        <v-list-tile-content class="text-capitalize darkgrey--text subheading">
                            {{ 'difference' | translate }}:
                        </v-list-tile-content>
                        <v-list-tile-content class="align-end black-text subheading">
                            <span :class="differenceClass">
                                {{ difference | currency(currency) }}
                            </span>
                        </v-list-tile-content>
                    </v-list-tile>
                    {{ 'Actual Revenue minus Planned Revenue' | translate }}
                </v-tooltip>
            </v-list>
            <!-- <v-chart :options="chartOptions" auto-resize/> -->
        </v-card>
    </div>
</template>

<style lang="scss" scoped>
.theme--dark .header {
    color: #fff;
}
.echarts {
    height: 80px;
    width: 100%;
}
</style>
