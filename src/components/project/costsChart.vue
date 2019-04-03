<script>
import { mapState, mapGetters } from 'vuex'
import { update, get, reduce, merge, truncate } from 'lodash'
import startOfMonth from 'date-fns/start_of_month'
import differenceInMonths from 'date-fns/difference_in_months'
import format from 'date-fns/format'
import formatCurrency from '@/utils/format-currency'
import echartDefaults from '@/constants/echarts'

import ECharts from 'vue-echarts/components/ECharts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legendScroll'

var locales = {
    en: require('date-fns/locale/en'),
    ja: require('date-fns/locale/ja'),
}

export default {
    components: { 'v-chart': ECharts },
    data: () => ({
        accordeonState: 1,
        pas: ['planned', 'actual'],
        colors: [
            '#a2d3a4',
            '#f69e97',
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
        numbroFormat: {
            average: true,
            totalLength: 2,
            spaceSeparated: false,
        },
    }),
    computed: {
        ...mapState(['project', 'planned', 'actual', 'categories']),

        ...mapGetters(['currency']),
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
        launch_planned_total() {
            return this.getTotalCosts('launch', 'planned')
        },
        launch_actual_total() {
            return this.getTotalCosts('launch', 'actual')
        },
        hasLaunchPeriod() {
            return this.project.model && this.project.model.launch_period
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
                        if (sum) {
                            let path = [type, pa, item.category]
                            update(data, path, amount => (amount || 0) + sum)
                        }
                    })
                })
            })
            return data
        },
        chartOptionsCogs() {
            return this.getChartOptions('cogs')
        },
        chartOptionsOpex() {
            return this.getChartOptions('opex')
        },
        chartOptionsLaunch() {
            return this.getChartOptions('launch')
        },
        activeType() {
            return ['launch', 'cogs', 'opex'][this.selected]
        },
        startDate() {
            return startOfMonth(this.project.start_date)
        },
        currentMonthCaption() {
            return format(Number(startOfMonth(new Date())), 'YYYY/MM', {
                locale: locales[this.$root.lang],
            })
        },
    },
    methods: {
        getChartOptions(type) {
            const pa = 'actual'
            const typeData = get(this.costs, [type, pa], {})
            const data = reduce(
                typeData,
                (result, value, cat) => {
                    const category = this.categories[type == 'launch' ? 'cogs' : type][cat]
                    const name = this.$t((category && category.title) || cat)
                    return [...result, { name, value }]
                },
                []
            )
            return merge({}, echartDefaults, {
                color: this.colors,
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
                legend: {
                    type: 'scroll',
                    show: true,
                    top: '10%',
                    left: '7px',
                    right: '50%',
                    orient: 'vertical',
                    itemWidth: 0,
                    itemHeight: 0,
                    itemGap: 10,
                    data: data.map((item, index) => ({
                        name: item.name,
                        icon: 'none',
                        textStyle: {
                            color: this.colors[index],
                        },
                    })),
                    formatter: name => truncate(name, { length: 21 }),
                    tooltip: {
                        show: true,
                    },
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['40%', '65%'],
                        center: ['73%', '45%'],
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
        <v-card class="list mx-0 pa-3">
            <div class="mb-2 blue-grey-text darken-2">
                <span class="subheading text-capitalize">{{ 'costs' | translate }}</span>
            </div>
            <v-container class="pa-0 flex-paddings-0">
                <v-expansion-panel v-model="accordeonState" class="dense py-1">
                    <v-expansion-panel-content hide-actions disabled>
                        <div slot="header">
                            <v-layout class="text-capitalize subheading font-weight-medium mx-0">
                                <v-flex xs4>{{ currentMonthCaption }}</v-flex>
                                <v-flex xs4 class="text-xs-right">
                                    {{ 'budget' | translate }}
                                </v-flex>
                                <v-flex xs4 class="text-xs-right">{{ 'delta' | translate }}</v-flex>
                            </v-layout>
                        </div>
                        <div><v-chart :options="chartOptionsCogs" auto-resize /></div>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content hide-actions lazy :disabled="!opex_actual_total">
                        <div slot="header">
                            <v-layout class="text-capitalize caption mx-0">
                                <v-flex xs4>{{ 'COGS' | translate }}</v-flex>
                                <v-flex xs4 class="text-xs-right mono">
                                    {{
                                        cogs_planned_total
                                            | numbro(numbroFormat)
                                            | currency(currency, { parse: false })
                                    }}
                                </v-flex>
                                <v-flex xs4 class="text-xs-right mono">
                                    {{
                                        cogs_actual_total
                                            | numbro(numbroFormat)
                                            | currency(currency, { parse: false })
                                    }}
                                </v-flex>
                            </v-layout>
                        </div>
                        <div><v-chart :options="chartOptionsCogs" auto-resize /></div>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content hide-actions lazy :disabled="!opex_actual_total">
                        <div slot="header">
                            <v-layout class="text-capitalize caption mx-0">
                                <v-flex xs4>{{ 'operating costs' | translate }}</v-flex>
                                <v-flex xs4 class="text-xs-right mono">
                                    {{
                                        opex_planned_total
                                            | numbro(numbroFormat)
                                            | currency(currency, { parse: false })
                                    }}
                                </v-flex>
                                <v-flex xs4 class="text-xs-right mono">
                                    {{
                                        opex_actual_total
                                            | numbro(numbroFormat)
                                            | currency(currency, { parse: false })
                                    }}
                                </v-flex>
                            </v-layout>
                        </div>
                        <div><v-chart :options="chartOptionsOpex" auto-resize /></div>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content
                        v-if="project.with_launch"
                        hide-actions
                        lazy
                        :disabled="!launch_actual_total"
                    >
                        <div slot="header">
                            <v-layout class="text-capitalize caption mx-0">
                                <v-flex xs4>{{ 'initial costs' | translate }}</v-flex>
                                <v-flex xs4 class="text-xs-right mono">
                                    {{
                                        launch_planned_total
                                            | numbro(numbroFormat)
                                            | currency(currency, { parse: false })
                                    }}
                                </v-flex>
                                <v-flex xs4 class="text-xs-right mono">
                                    {{
                                        launch_actual_total
                                            | numbro(numbroFormat)
                                            | currency(currency, { parse: false })
                                    }}
                                </v-flex>
                            </v-layout>
                        </div>
                        <div><v-chart :options="chartOptionsLaunch" auto-resize /></div>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-container>
        </v-card>
    </div>
</template>

<style lang="scss" scoped>
.v-card .container.flex-paddings-0 .layout .flex {
    padding: 0;
}
.echarts {
    height: 160px;
    width: 100%;
}
</style>
