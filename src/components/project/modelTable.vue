<script>
import { mapGetters } from 'vuex'

export default {
    components: {},
    data: () => ({}),
    computed: {
        project() {
            return this.$store.state.projects.current
        },

        ...mapGetters([
            'lifetime_value',
            'lead_acquisition',
            'customer_acquisition_cost',
            'gross_profit',
            'revenue',
            'currency',
            'cogs_planned_total',
            'cogs_actual_total',
            'opex_planned_total',
            'opex_actual_total',
            'launch_planned_total',
            'launch_actual_total',
            'revenue_planned_total',
            'revenue_actual_total',
            'contribution_margin',
        ]),
    },
}
</script>

<template>
    <v-card v-if="project.model" class="mx-0 pa-3">
        <div class="grey-text text-darken-1 mb-3">
            <span class="title text-capitalize">{{ 'business model' | translate }}</span>
        </div>

        <div
            class="subheading grey-text text-darken-1 font-weight-medium text-capitalize mx-3 mb-3"
        >
            {{ 'business model parameters' | translate }}
        </div>

        <table width="100%" class="list">
            <tr v-if="project.with_launch">
                <td class="caption text-capitalize">{{ 'initial cost' | translate }}</td>
                <td class="caption text-xs-right mono">
                    {{ project.model.initial_cost | currency(currency) }}
                </td>
            </tr>
            <tr v-if="project.with_launch">
                <td class="caption text-capitalize">{{ 'launch period, months' | translate }}</td>
                <td class="caption text-xs-right mono">{{ project.model.launch_period }}</td>
            </tr>
            <tr v-if="project.model.market_size">
                <td class="caption text-capitalize">
                    <v-tooltip max-width="300" bottom>
                        <span slot="activator"> {{ 'market size' | translate }} </span>
                        {{
                            'Refers to the total number of potential customers on the market your product or service is targeted at, units.'
                                | translate
                        }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right mono">{{ project.model.market_size | numbro }}</td>
            </tr>
            <tr v-if="project.model.market_share">
                <td>
                    <v-tooltip max-width="300" bottom>
                        <span slot="activator" class="caption text-capitalize">
                            {{ 'market share' | translate }}
                        </span>
                        {{
                            'Share of a Market earned by the business during a project period.'
                                | translate
                        }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right mono">
                    {{
                        (project.model.market_share / 100)
                            | numbro({ output: 'percent', mantissa: 0 })
                    }}
                </td>
            </tr>
            <tr v-if="project.model.avp">
                <td class="caption text-capitalize">
                    <v-tooltip max-width="300" bottom>
                        <span slot="activator"> {{ 'AVG unit price' | translate }} </span>
                        {{
                            'This is the amount you expect your customer pay for a single unit of your product or service.'
                                | translate
                        }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right mono">
                    {{ project.model.avp | currency(currency) }}
                </td>
            </tr>
            <tr v-if="project.model.apc">
                <td class="caption text-capitalize">
                    <v-tooltip max-width="300" bottom>
                        <span slot="activator"> {{ 'AVG purchase frequency' | translate }} </span>
                        {{
                            'An average number of occasions that consumers make a purchase, during a project period'
                                | translate
                        }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right mono">{{ project.model.apc | numbro }}</td>
            </tr>
            <tr v-if="project.model.apc">
                <td class="caption text-capitalize">
                    <v-tooltip max-width="300" bottom>
                        <span slot="activator"> {{ 'conversion rate' | translate }} </span>
                        {{
                            'The number of customers who have completed a transaction divided by the total number of visitors. E.g. across industries, the average landing page conversion rate is about 3%'
                                | translate
                        }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right mono">
                    {{
                        (project.model.conversion_rate / 100)
                            | numbro({ output: 'percent', mantissa: 0 })
                    }}
                </td>
            </tr>
            <tr v-if="project.model.cpmi">
                <td class="caption text-capitalize">
                    <v-tooltip max-width="300" bottom>
                        <span slot="activator"> {{ 'cost per acquisition' | translate }} </span>
                        {{
                            'Represents how much it costs in advertising to convert one person from a visitor into a client. E.g. across industries in Google Ads the average Cost Per Acquisition is $80.'
                                | translate
                        }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right mono">
                    {{ project.model.cpmi | currency(currency) }}
                </td>
            </tr>
        </table>

        <div
            class="subheading grey-text text-darken-1 font-weight-medium text-capitalize mx-3 mt-3 mb-3"
        >
            {{ 'calculation results' | translate }}
        </div>
        <table width="100%" class="list">
            <!--
                <tr>
                    <td colspan="2" class="text-left pb-2">
                        <span
                            class="subheading grey-text text-darken-1 font-weight-medium text-capitalize"
                        >
                            {{ 'calculation results' | translate }}
                        </span>
                    </td>
                </tr>
            -->
            <tr v-if="lead_acquisition">
                <td class="caption text-capitalize ">
                    <v-tooltip max-width="300" bottom>
                        <span slot="activator"> {{ 'lead acquisition' | translate }} </span>
                        {{
                            'Is the total number of leads required to occupy market share and achieve revenue goal defined in the business model.'
                                | translate
                        }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right mono">{{ lead_acquisition | numbro }}</td>
            </tr>
            <tr v-if="lifetime_value">
                <td class="caption text-capitalize ">
                    <v-tooltip max-width="300" bottom>
                        <span slot="activator"> {{ 'customer lifetime value' | translate }} </span>
                        {{
                            'Profit prediction from a future relationship with a given customer for a project duration.'
                                | translate
                        }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right mono">
                    {{ lifetime_value | currency(currency) }}
                </td>
            </tr>
            <tr v-if="customer_acquisition_cost">
                <td class="caption text-capitalize ">
                    <v-tooltip max-width="300" bottom>
                        <span slot="activator">
                            {{ 'customer acquisition cost' | translate }}
                        </span>
                        {{
                            'Total costs associated with converting leads into paying customers.'
                                | translate
                        }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right mono">
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
                        <span slot="activator"> {{ 'gross profit' | translate }} </span>
                        {{
                            'The profit after deducting costs associated with making and selling its products or services.'
                                | translate
                        }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right mono">{{ gross_profit | currency(currency) }}</td>
            </tr>
            <tr v-if="contribution_margin">
                <td class="caption text-capitalize ">
                    <v-tooltip max-width="300" bottom>
                        <span slot="activator"> {{ 'contribution margin' | translate }} </span>
                        {{
                            'Represents the portion of sales revenue that is not consumed by variable costs and so contributes to the coverage of fixed costs.'
                                | translate
                        }}
                    </v-tooltip>
                </td>
                <td class="caption text-xs-right mono">
                    {{ contribution_margin | currency(currency) }}
                </td>
            </tr>
        </table>
    </v-card>
</template>

<style lang="scss" scoped>
.list {
    tr {
        td {
            padding: 5px 16px;
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
