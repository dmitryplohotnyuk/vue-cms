<script>
import { mapState, mapActions } from 'vuex'
import PlanForm from '@/components/product/plan/form'
import KConfirm from '@/components/confirm'

export default {
    props: ['id'],
    components: {
        PlanForm,
        KConfirm,
    },
    data() {
        return {
            plan: null,
            showPlanForm: false,
            showPlanSaved: false,
            currencyMap: {
                usd: '＄',
                jpy: '￥',
                eur: '€',
            },
            // TODO render this in the card details. Reason: To avoid trasnlation error. In Japanese "per week" and "week" are different words.
            planInterval: {
                day: this.$t('Daily'),
                week: this.$t('Weekly'),
                quarter: this.$t('Every 3 months'),
                semiannual: this.$t('Every 6 months'),
                year: this.$t('Yearly'),
            },
        }
    },
    computed: {
        ...mapState({}),
        product() {
            return this.plan.product
        },
    },
    mounted() {
        this.load.run()
    },
    tasks(t) {
        return {
            load: t(async function() {
                try {
                    this.startLoading()
                    this.plan = await this.getPlan(this.id)
                } catch (e) {
                    this.handleError(e)
                } finally {
                    this.finishLoading()
                }
            }).flow('drop'),
            remove: t(async function() {
                try {
                    await this.deletePlan(this.id)
                    this.$router.push({
                        name: 'products',
                        params: {
                            id: this.product.id,
                        },
                    })
                } catch (e) {
                    this.handleError(e)
                }
            }).flow('drop'),
        }
    },
    methods: {
        ...mapActions([
            'resetError',
            'handleError',
            'startLoading',
            'finishLoading',
            'getPlan',
            'deletePlan',
        ]),

        currency(code) {
            return this.currencyMap[code]
        },

        onPlanSaved() {
            this.showPlanSaved = true
            this.showPlanForm = false
            this.load.run()
        },
    },
}
</script>

<template>
    <div v-if="load.lastResolved">
        <v-layout row wrap>
            <v-flex xs12 md12>
                <v-toolbar class="mb-0 v-toolbar__content--nopadding px-3" flat>
                    <v-tooltip max-width="300" bottom>
                        <v-btn
                            icon
                            slot="activator"
                            :to="{
                                name: 'products',
                                params: {
                                    id: product.id,
                                },
                            }"
                        >
                            <v-icon>arrow_back</v-icon>
                        </v-btn>
                        <span class="text-capitalize">{{ 'product details' | translate }}</span>
                    </v-tooltip>
                    <v-toolbar-title class="text-capitalize">
                        {{ 'plan details' | translate }}
                    </v-toolbar-title>
                    <v-spacer />
                </v-toolbar>
            </v-flex>
        </v-layout>
        <v-container grid-list-lg fill-height fluid class="pa-3">
            <v-layout row wrap>
                <v-flex xs12 sm12 md6 offset-md3>
                    <v-toolbar color="indigo" dark>
                        <v-toolbar-title>
                            <span v-if="product.name" class="title text-capitalize">
                                {{ plan.name }}
                            </span>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn icon @click="showPlanForm = true"> <v-icon>edit</v-icon> </v-btn>
                    </v-toolbar>
                    <v-card class="mb-3">
                        <v-card-text class="pa-0">
                            <v-list two-line dense class="py-0">
                                <v-list-tile v-if="plan.id">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="grey--text text-capitalize">
                                            ID
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>{{ plan.id }}</v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-divider v-if="plan.id" />
                                <v-list-tile v-if="plan.amount">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="grey--text text-capitalize">
                                            {{ 'price' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            {{ currency(plan.currency) }} {{ plan.amount }} /
                                            <span v-if="plan.interval_count > 1">
                                                {{ plan.interval_count }}
                                            </span>
                                            {{ plan.interval }}
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-divider v-if="plan.amount" />
                                <v-list-tile>
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="grey--text text-capitalize">
                                            {{ 'trial period' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            <span v-if="plan.trial_days">
                                                {{
                                                    '|one day|{count} days'
                                                        | translate({
                                                            count: plan.trial_days,
                                                        })
                                                }}
                                            </span>
                                            <span v-else class="font-italic font-weight-light">
                                                {{ 'none' | translate }}
                                            </span>
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-divider />
                                <v-list-tile v-if="plan.payment_id">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="grey--text text-capitalize">
                                            {{ 'payment system' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            {{ plan.payment_type }}
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-divider v-if="plan.payment_id" />
                                <v-list-tile v-if="product.name">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="grey--text text-capitalize">
                                            {{ 'product' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>{{ product.name }}</v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-divider v-if="product.name" />
                                <v-list-tile v-if="plan.created_at">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="grey--text text-capitalize">
                                            {{ 'created at' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>{{ plan.created_at }}</v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-divider v-if="plan.created_at" />
                                <v-list-tile v-if="plan.updated_at">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="grey--text text-capitalize">
                                            {{ 'updated at' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>{{ plan.updated_at }}</v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                            </v-list>
                        </v-card-text>
                        <v-card-actions class="grey lighten-5 pa-3">
                            <k-confirm
                                title="Delete this record?"
                                question="Are you sure?"
                                :max-width="600"
                                @confirm="remove.run()"
                            >
                                <v-btn
                                    flat
                                    icon
                                    small
                                    slot="button"
                                    color="danger"
                                    class="ma-0"
                                    :loading="remove.isActive"
                                    :disabled="remove.isActive"
                                >
                                    <v-icon>delete</v-icon>
                                </v-btn>
                            </k-confirm>
                        </v-card-actions>
                    </v-card>
                </v-flex>
                <k-dialog v-model="showPlanForm" persistent max-width="900px" lazy>
                    <plan-form
                        :product="product"
                        :plan="plan"
                        @saved="onPlanSaved"
                        @close="showPlanForm = false"
                    />
                </k-dialog>

                <v-snackbar v-model="showPlanSaved" bottom>
                    {{ 'Plan saved successfully!' | translate }}
                </v-snackbar>
            </v-layout>
        </v-container>
    </div>
</template>

<style lang="scss" scoped></style>
