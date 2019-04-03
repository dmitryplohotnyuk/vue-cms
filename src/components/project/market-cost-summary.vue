<script>
import { merge } from 'lodash'
import echartDefaults from '@/constants/echarts'

import ECharts from 'vue-echarts/components/ECharts'
import 'echarts/lib/chart/pie'

export default {
    components: { 'v-chart': ECharts },
    props: ['model'],
    data: () => ({}),
    computed: {
        market_total() {
            return ((this.model.market_size || 0) * this.model.market_share) / 100
        },
        chartOptions() {
            return merge({}, echartDefaults, {
                color: ['rgba(78, 188, 212, 0.2)', '#4ebcd4'],
                legend: {
                    show: false,
                },
                tooltip: {
                    extraCssText: 'text-transform: capitalize',
                },
                series: [
                    {
                        //name: percent,
                        type: 'pie',
                        radius: ['50%', '90%'],
                        avoidLabelOverlap: false,
                        hoverOffset: 3,
                        label: {
                            show: true,
                            position: 'center',
                            formatter: `${this.model.market_share}%`,
                            textStyle: {
                                fontSize: '16',
                                fontWeight: 'bold',
                            },
                        },
                        labelLine: {
                            normal: {
                                show: false,
                            },
                        },
                        data: [
                            {
                                value: this.model.market_size - this.market_total,
                                name: this.$t('market size'),
                            },
                            { value: this.market_total, name: this.$t('market share') },
                        ],
                    },
                ],
            })
        },
    },
    mounted() {},
    methods: {},
}
</script>

<template>
    <v-card class="card-top pa-3">
        <v-layout row wrap fill-height align-center justify-center>
            <v-flex xs12 class="title text-capitalize">
                {{ 'total addressable market' | translate }}
            </v-flex>
            <v-flex xs4 md3 class="">
                <p class="caption text-uppercase mb-2">{{ 'total' | translate }}</p>
                <!-- TODO format returned value for `model.market_size` -->
                <slot name="market-size">
                    <div v-if="model.market_size" class="subheading mt-0">
                        {{ model.market_size | numbro }}
                    </div>
                </slot>
            </v-flex>
            <v-flex xs4 md6 v-if="market_total">
                <v-chart :options="chartOptions" auto-resize />
            </v-flex>
            <v-flex xs4 s4 md3 class="text-xs-right">
                <p class="nowrap caption text-uppercase mb-2">{{ 'serviced' | translate }}</p>
                <slot name="market-share">
                    <div v-if="market_total" class="subheading mt-0">
                        {{ market_total | numbro }}
                    </div>
                </slot>
            </v-flex>
        </v-layout>
    </v-card>
</template>

<style lang="scss" scoped>
.echarts {
    height: 110px;
    width: 100%;
}

.nowrap {
    white-space: nowrap;
}
</style>
