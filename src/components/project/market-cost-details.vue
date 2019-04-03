<script>
import { mapGetters } from 'vuex'

export default {
    components: {},
    props: ['model'],
    data: () => ({
        currencyMap: {
            usd: '＄',
            jpy: '￥',
            eur: '€',
        },
    }),
    computed: {
        ...mapGetters(['currency']),
        market_total() {
            return ((this.model.market_size || 0) * this.model.market_share) / 100
        },
        lead_acquisition() {
            // lead acquisition (LA)
            return this.market_total / (this.model.conversion_rate / 100)
        },
        lifetime_value() {
            // lifetime value
            return this.model.avp * this.model.apc
        },
        customer_acquisition_cost() {
            // customer acquisition cost (CAC)
            return this.model.mi * this.model.cpmi * this.lead_acquisition
        },
        revenue() {
            return this.market_total * this.lifetime_value
        },
        gross_profit() {
            return (
                this.revenue -
                this.model.avp * (this.model.cogs / 100) * this.model.apc * this.market_total
            )
        },
        contribution_margin() {
            return this.gross_profit - this.customer_acquisition_cost
        },
        isVisible() {
            return (
                this.market_total &&
                (this.lead_acquisition ||
                    this.lifetime_value ||
                    this.customer_acquisition_cost ||
                    this.revenue ||
                    this.gross_profit ||
                    this.contribution_margin)
            )
        },
    },
    mounted() {},
    methods: {},
}
</script>

<template>
    <v-card v-if="isVisible" class="list py-1">
        <table width="100%">
            <tr v-if="lead_acquisition">
                <td class="caption text-capitalize">
                    <v-tooltip max-width="300" bottom>
                        <span slot="activator">{{ 'lead acquisition' | translate }}</span>
                        {{
                            'Is the total number of leads required to occupy market share and achieve revenue goal defined in the business model.'
                                | translate
                        }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right  font-weight-medium">
                    {{ lead_acquisition | numbro }}
                </td>
            </tr>
            <tr v-if="lifetime_value">
                <td class="caption text-capitalize ">
                    <v-tooltip max-width="300" bottom>
                        <span slot="activator">{{ 'customer lifetime value' | translate }}</span>
                        {{
                            'Profit prediction from a future relationship with a given customer for a project duration.'
                                | translate
                        }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right  font-weight-medium">
                    {{ lifetime_value | currency(currency) }}
                </td>
            </tr>
            <tr v-if="customer_acquisition_cost">
                <td class="caption text-capitalize ">
                    <v-tooltip max-width="300" bottom>
                        <span slot="activator">{{ 'customer acquisition cost' | translate }}</span>
                        {{
                            'Total costs associated with converting leads into paying customers.'
                                | translate
                        }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right  font-weight-medium">
                    {{ customer_acquisition_cost | currency(currency) }}
                </td>
            </tr>
            <tr v-if="revenue">
                <td class="caption text-capitalize ">
                    <v-tooltip max-width="300" bottom>
                        <span slot="activator">{{ 'revenue' | translate }}</span>
                        {{ 'The amount of money earned during a project period.' | translate }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right mono">{{ revenue | currency(currency) }}</td>
            </tr>
            <tr v-if="gross_profit">
                <td class="caption text-capitalize ">
                    <v-tooltip max-width="300" bottom>
                        <span slot="activator">{{ 'gross profit' | translate }}</span>
                        {{
                            'The profit after deducting costs associated with making and selling its products or services.'
                                | translate
                        }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right  font-weight-medium">
                    {{ gross_profit | currency(currency) }}
                </td>
            </tr>
            <tr v-if="gross_profit">
                <td class="caption text-capitalize ">
                    <v-tooltip max-width="300" bottom>
                        <span slot="activator">{{ 'contribution margin' | translate }}</span>
                        {{
                            'Represents the portion of sales revenue that is not consumed by variable costs and so contributes to the coverage of fixed costs.'
                                | translate
                        }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right  font-weight-medium">
                    {{ contribution_margin | currency(currency) }}
                </td>
            </tr>
        </table>
    </v-card>
</template>

<style lang="scss" scoped>
.list table {
    tr {
        td {
            padding: 12px 16px;
            border-bottom: 1px solid #0000001e;
            &:last-of-type {
                font-weight: 500;
            }
        }
        &:last-child {
            td {
                border-bottom: none;
            }
        }
    }
}
</style>
