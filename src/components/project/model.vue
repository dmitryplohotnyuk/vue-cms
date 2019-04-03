<script>
import { mapGetters, mapActions } from 'vuex'

import VueEditable from '../editable'
import ModelSimulation from '@/components/project/modelSimulation'
import MarketCostSummary from '@/components/project/market-cost-summary'

export default {
    components: { VueEditable, MarketCostSummary, ModelSimulation },

    data: () => ({
        model: {},
        modelSaved: false,
        sending: false,
    }),

    computed: {
        ...mapGetters(['market_total', 'currency']),
        project() {
            return this.$store.state.projects.current
        },
        step() {
            if (this.currency == '￥') {
                return 1
            }
            return 0.01
        },
        max() {
            if (this.currency == '￥') {
                return 999999999999
            }
            return 999999999999.99
        },
    },

    mounted() {
        this.model = this.project.model
    },
    methods: {
        ...mapActions(['resetError', 'updateModel']),
        _handleError() {
            this.sending = false
        },
        tryToSave() {
            if (!this.model.market_size) return
            this.$root.$emit('update-revenue')
            this.sending = true
            this.resetError()

            return this.updateModel(this.model)
                .then(() => {
                    this.sending = false
                    this.modelSaved = true
                })
                .catch(this._handleError)
        },
    },
}
</script>

<template>
    <v-container v-if="model.id" fluid grid-list-lg class="pa-0">
        <v-layout row wrap>
            <v-flex xs12 sm5 md4 lg3>
                <market-cost-summary :model="model" style="min-height: 190px">
                    <vue-editable
                        format
                        slot="market-size"
                        v-model="model.market_size"
                        min="1"
                        step="1"
                        type="number"
                        class="subheading mt-0"
                        @stop-editing="tryToSave"
                    />
                    <vue-editable
                        slot="market-share"
                        v-model="model.market_share"
                        suffix="%"
                        min="1"
                        max="100"
                        type="number"
                        class="subheading mt-0"
                        @stop-editing="tryToSave"
                    />
                </market-cost-summary>
            </v-flex>
            <v-flex xs12 sm7 md8 lg9>
                <v-card class="card-top" style="min-height: 190px">
                    <div class="v-tooltip__content" style="right: 1px; top: 1px">
                        <span>{{ 'Click on any parameter to edit it.' | translate }}</span>
                    </div>
                    <div class="pa-3">
                        <v-layout row wrap justify-space-between class="pa-0">
                            <v-flex xs12 class="title text-capitalize">
                                {{ 'price and marketing' | translate }}
                            </v-flex>
                            <v-flex xs6 md4 lg3>
                                <div
                                    class="caption grey-text text-darken-1 font-weight-medium text-uppercase mb-2"
                                >
                                    {{ 'average unit price' | translate }}
                                </div>
                                <div class="subheading grey-text text-darken-4">
                                    <vue-editable
                                        format
                                        v-model="model.avp"
                                        min="0"
                                        :step="step"
                                        :max="max"
                                        type="number"
                                        :currency="currency"
                                        @stop-editing="tryToSave"
                                    />
                                </div>
                            </v-flex>
                            <v-flex xs6 md4 lg3>
                                <div
                                    class="caption grey-text text-darken-1 font-weight-medium text-uppercase mb-2"
                                >
                                    {{ 'average purchase frequency' | translate }}
                                </div>
                                <div class="subheading grey-text text-darken-4">
                                    <vue-editable
                                        v-model="model.apc"
                                        min="0"
                                        step="1"
                                        type="number"
                                        @stop-editing="tryToSave"
                                    />
                                </div>
                            </v-flex>
                            <v-flex xs6 md4 lg3>
                                <div
                                    class="caption grey-text text-darken-1 font-weight-medium text-uppercase mb-2"
                                >
                                    {{ 'conversion rate' | translate }}
                                </div>
                                <div class="subheading grey-text text-darken-4">
                                    <vue-editable
                                        v-model="model.conversion_rate"
                                        min="0.1"
                                        :max="100"
                                        step="0.1"
                                        type="number"
                                        @stop-editing="tryToSave"
                                    />
                                </div>
                            </v-flex>
                            <v-flex xs6 md4 lg3>
                                <div
                                    class="caption grey-text text-darken-1 font-weight-medium text-uppercase mb-2"
                                >
                                    {{ 'cost of goods sold' | translate }}
                                </div>
                                <div class="subheading grey-text text-darken-4">
                                    <vue-editable
                                        v-model="model.cogs"
                                        step="0.1"
                                        max="100"
                                        type="number"
                                        suffix="%"
                                        @stop-editing="tryToSave"
                                    />
                                </div>
                            </v-flex>
                            <v-flex xs6 md4 lg3>
                                <div
                                    class="caption grey-text text-darken-1 font-weight-medium text-uppercase mb-2"
                                >
                                    {{ 'cost per acquisition' | translate }}
                                </div>
                                <div class="subheading grey-text text-darken-4">
                                    <vue-editable
                                        format
                                        v-model="model.cpmi"
                                        min="0"
                                        :step="step"
                                        :max="max"
                                        type="number"
                                        :currency="currency"
                                        @stop-editing="tryToSave"
                                    />
                                </div>
                            </v-flex>
                            <v-flex xs6 md4 lg3>
                                <div
                                    class="caption grey-text text-darken-1 font-weight-medium text-uppercase mb-2"
                                >
                                    {{ 'initial cost' | translate }}
                                </div>
                                <div class="subheading grey-text text-darken-4">
                                    <vue-editable
                                        format
                                        v-model="model.initial_cost"
                                        min="0"
                                        :step="step"
                                        :max="max"
                                        type="number"
                                        :currency="currency"
                                        @stop-editing="tryToSave"
                                    />
                                </div>
                            </v-flex>
                            <v-flex xs6 md4 lg6>
                                <div
                                    class="caption grey-text text-darken-1 font-weight-medium text-uppercase mb-2"
                                >
                                    {{ 'launch period' | translate }}
                                </div>
                                <div class="subheading grey-text text-darken-4">
                                    <vue-editable
                                        v-model="model.launch_period"
                                        min="0"
                                        step="1"
                                        type="number"
                                        @stop-editing="tryToSave"
                                    />
                                </div>
                            </v-flex>
                        </v-layout>
                    </div>
                </v-card>
            </v-flex>

            <model-simulation class="pt-2" />

            <v-snackbar v-model="modelSaved" bottom>
                {{ 'Model updated successfully!' | translate }}
            </v-snackbar>
        </v-layout>
    </v-container>
</template>

<style>
/*.vue-easy-pie-chart .inner-text {
    color: #00bcd4;
}
*/
.model-tooltip {
    position: absolute;
    height: 22px;
    padding: 6px;
    margin: 0;
    position: relative;
    top: -10px;
    z-index: 12;
    pointer-events: none;
    border-radius: 2px;
    font-size: 12px;
    line-height: 22px;
    text-transform: none;
    white-space: nowrap;
}

input[type='number'] {
    width: 100% !important;
}
</style>
