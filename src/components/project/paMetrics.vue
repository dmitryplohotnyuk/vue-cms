<script>
import { mapState, mapGetters } from 'vuex'
import { update, get, reduce, merge } from 'lodash'
import startOfMonth from 'date-fns/start_of_month'
import differenceInMonths from 'date-fns/difference_in_months'
import formatCurrency from '@/utils/format-currency'
import echartDefaults from '@/constants/echarts'

import ECharts from 'vue-echarts/components/ECharts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'

export default {
    components: { 'v-chart': ECharts },
    data: () => ({
        selected: 0,
        pas: ['planned', 'actual'],
        colors: [
            '#AAE5F3',
            '#76CFE4',
            '#4ebcd4',
            '#2DA6C2',
            '#0C8EAD',
            '#1EC9F1',
            '#1EC9F1',
            '#1EC9F1',
            '#97E3F5',
            '#52A9BD',
            '#338BA0',
            '#A6EEFF',
            '#74E5FF',
            '#07D0FF',
            '#006D86',
            '#447884',
            '#6B949E',
            '#255C69',
        ],
    }),
    computed: {
        ...mapState(['project', 'planned', 'actual', 'categories']),
        ...mapState({
            project: state => state.projects.current,
            planned: state => state.projects.planned,
            actual: state => state.projects.actual,
            categories: state => state.projects.categories,
        }),

        ...mapGetters(['currency']),
        revenue_planned_total() {
            return this.getTotalCosts('revenue', 'planned')
        },
        revenue_actual_total() {
            return this.getTotalCosts('revenue', 'actual')
        },
        cogs_planned_total() {
            return this.getTotalCosts('cogs', 'planned')
        },
        cogs_actual_total() {
            return this.getTotalCosts('cogs', 'actual')
        },
        opex_planned_total() {
            return this.getTotalCosts('opex', 'planned')
        },
        opex_actual_total() {
            return this.getTotalCosts('opex', 'actual')
        },
        hasLaunchPeriod() {
            return this.project.model && this.project.model.launch_period
        },
        isRevenueMode() {
            return this.selected == 0
        },
        revenuePercent() {
            return Math.min(100, (100 * this.revenue_actual_total) / this.revenue_planned_total)
        },
        revenueDelta() {
            return this.revenue_actual_total - this.revenue_planned_total
        },
        costs() {
            const data = {}
            const thisMonth = startOfMonth(new Date())
            const monthsFromStart = differenceInMonths(thisMonth, this.startDate)
            this.pas.forEach(pa => {
                const paData = this[pa]
                Object.keys(paData).forEach(type => {
                    const typeData = paData[type] || []
                    typeData.forEach(item => {
                        // display data untill today
                        if (!Array.isArray(item.monthly) || !item.monthly[monthsFromStart]) {
                            return
                        }
                        const monthlyData = item.monthly[monthsFromStart]
                        const sum = monthlyData.price * monthlyData.quantity
                        let path = [type, pa, item.category]
                        update(data, path, amount => (amount || 0) + sum)
                    })
                })
            })
            return data
        },
        activeType() {
            const types = ['launch', 'cogs', 'opex']
            return this.isRevenueMode ? null : types[this.selected - 1]
        },
        plannedChartOptions() {
            return this.getChartOptions('planned')
        },
        actualChartOptions() {
            return this.getChartOptions('actual')
        },
        startDate() {
            return startOfMonth(this.project.start_date)
        },
    },
    methods: {
        getChartOptions(pa) {
            const typeData = get(this.costs, [this.activeType, pa], {})
            const data = reduce(
                typeData,
                (result, value, cat) => {
                    const category = this.categories[
                        this.activeType == 'launch' ? 'cogs' : this.activeType
                    ][cat]
                    const name = this.$t((category && category.title) || cat)
                    return [...result, { name, value }]
                },
                []
            )
            return merge({}, echartDefaults, {
                color: this.colors,
                legend: {
                    show: false,
                },
                tooltip: {
                    position: 'bottom',
                    extraCssText:
                        'text-transform: capitalize; max-width: 200px; white-space: normal; ',
                    formatter: params => {
                        let marker = `<span style="display: inline-block; width: 10px;height:10px; background-color: ${
                            params.color
                        }"></span>`
                        let value = formatCurrency(Math.abs(params.value), this.currency)
                        const html = `${marker} ${params.name}: <b>${value}</b>`
                        return html
                    },
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['0%', '95%'],
                        avoidLabelOverlap: false,
                        hoverOffset: 0,
                        label: {
                            show: false,
                        },
                        labelLine: {
                            show: false,
                        },
                        itemStyle: {
                            borderWidth: 1,
                            borderColor: '#f9f9f9',
                        },
                        data,
                    },
                ],
            })
        },
        getTotalCosts(type, pa) {
            const data = get(this.costs, [type, pa], {})
            return reduce(data, (total, value) => total + value, 0)
        },
    },
}
</script>

<template>
    <div v-if="project">
        <v-card class="mx-0 mb-2 list">
            <div class="grey lighten-4 charts px-3 pt-2 pb-1">
                <div class="md-layout md-alignment-center-center" style="min-height: 140px;">
                    <div v-if="isRevenueMode">
                        <v-progress-linear v-model="revenuePercent" color="#4ebcd4" />
                        <div class="right">
                            <v-icon v-if="revenueDelta < 0" class="danger--text text-darken-3">
                                arrow_drop_down
                            </v-icon>
                            <v-icon
                                v-else-if="revenueDelta > 0"
                                class="success--text text-darken-2"
                            >
                                arrow_drop_up
                            </v-icon>
                            {{ revenueDelta | currency(currency) }}
                        </div>
                    </div>
                    <div v-if="!isRevenueMode" class="md-layout-item md-size-50">
                        <!-- Change line above colors: [...], -->
                        <v-chart :options="plannedChartOptions" auto-resize />
                        <div
                            class="text-capitalize text-center mt-1 mb-0 caption grey-text text-darken-1"
                        >
                            {{ 'planned' | translate }}
                        </div>
                    </div>
                    <div v-if="!isRevenueMode" class="md-layout-item md-size-50">
                        <v-chart :options="actualChartOptions" auto-resize />
                        <div
                            class="text-capitalize text-center mt-1 mb-0 caption grey-text text-darken-1"
                        >
                            {{ 'actual' | translate }}
                        </div>
                    </div>
                </div>
            </div>
            <table width="100%">
                <tr :class="selected == 0 && 'active'" @click="selected = 0">
                    <td class="caption text-capitalize">{{ 'revenue' | translate }}</td>
                    <td class="caption text-xs-right mono">
                        {{ revenue_planned_total | currency(currency) }}
                    </td>
                    <td class="caption text-xs-right mono">
                        {{ revenue_actual_total | currency(currency) }}
                    </td>
                    <v-tooltip max-width="300">
                        {{ 'revenue planned' | translate }} {{ 'total' | translate }} /
                        {{ 'revenue actual' | translate }} {{ 'total' | translate }}
                    </v-tooltip>
                </tr>
                <tr :class="selected == 2 && 'active'" @click="selected = 2">
                    <td class="caption text-capitalize">{{ 'COGS budget' | translate }}</td>
                    <td class="caption text-xs-right mono">
                        {{ cogs_planned_total | currency(currency) }}
                    </td>
                    <td class="caption text-xs-right mono">
                        {{ cogs_actual_total | currency(currency) }}
                    </td>
                    <v-tooltip max-width="300">
                        {{ 'COGS planned' | translate }} {{ 'total' | translate }} /
                        {{ 'COGS actual' | translate }} {{ 'total' | translate }}
                    </v-tooltip>
                </tr>
                <tr :class="selected == 3 && 'active'" @click="selected = 3">
                    <td class="caption text-capitalize">{{ 'operating costs' | translate }}</td>
                    <td class="caption text-xs-right mono">
                        {{ opex_planned_total | currency(currency) }}
                    </td>
                    <td class="caption text-xs-right mono">
                        {{ opex_actual_total | currency(currency) }}
                    </td>
                    <v-tooltip max-width="300">
                        {{ 'planned operating costs' | translate }} {{ 'total' | translate }} /
                        {{ 'actual operating costs' | translate }} {{ 'total' | translate }}
                    </v-tooltip>
                </tr>
            </table>
        </v-card>
    </div>
</template>

<style lang="scss" scoped>
$border: 1px solid '#0000001e';
.charts {
    border-top: $border;
    border-bottom: $border;
}
.echarts {
    height: 90px;
    width: 100%;
}
.list table {
    border-spacing: 0;
    border-collapse: collapse;
    tr {
        cursor: pointer;
        td {
            padding: 6px 16px;
            border-bottom: $border;
        }
        &:hover,
        &.active {
            background-color: rgba(63, 81, 181, 0.8);
            td {
                color: #fff;
            }
        }
    }
}
</style>
