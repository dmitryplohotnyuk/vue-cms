<script>
import appConfig from '@/app.config'
// import PlanCard from '@/components/billing/plan'

import { mapState, mapActions, mapGetters } from 'vuex'
import formatDate from '@/utils/format-date'
import formatCurrency from '@/utils/format-currency'

import { Card, createToken } from 'vue-stripe-elements-plus'
import stripe_errors from '@/stripe_errors.json'

const stripeKey = process.env.VUE_APP_STRIPE_KEY ? process.env.VUE_APP_STRIPE_KEY : ''

export default {
    components: { Card },

    props: {
        newPlan: {
            type: Object,
        },
    },

    page() {
        return this.$root.lang == 'ja' ? this.metaJA : this.metaEN
    },

    data() {
        return {
            metaJA: {
                title: '課金',
                meta: [{ name: 'description', content: appConfig.descriptionJA }],
            },
            metaEN: {
                title: 'Billing',
                meta: [{ name: 'description', content: appConfig.description }],
            },
            sending: false,
            showForm: false,
            showSuccess: false,
            card: {},
            coupon: null,
            complete: false,
            stripeKey,
            error: false,
            stripeOptions: {
                hidePostalCode: true,
                classes: { base: '' },
                style: {
                    base: {
                        fontSize: '16px',
                        fontFamily: 'Roboto,Noto Sans,-apple-system,BlinkMacSystemFont,sans-serif',
                        color: 'rgba(33, 33, 33, 0.7)',
                        '::placeholder': {
                            color: 'rgba(0, 0, 0, 0.54)',
                        },
                        padding: '8px 0',
                    },
                    invalid: {
                        color: 'rgb(245, 94, 83)',
                    },
                },
            },
            nameRules: [v => !!v || this.$t('Name is required')],
        }
    },

    computed: {
        ...mapState({
            user: state => state.account.user,
            invoices: state => state.subscriptions.invoices,
            plans: state => state.subscriptions.plans,
        }),

        ...mapGetters([]),

        cardIcon() {
            return 'credit_card'
            // if (!this.user.card_brand) {
            //     return 'credit_card'
            // }
            //
            // switch (this.user.card_brand) {
            //     case 'American Express':
            //         return 'fa-cc-amex'
            //     case 'Diners Club':
            //         return 'fa-cc-diners-club'
            //     case 'Discover':
            //         return 'fa-cc-discover'
            //     case 'JCB':
            //         return 'fa-cc-jcb'
            //     case 'MasterCard':
            //         return 'fa-cc-mastercard'
            //     case 'Visa':
            //         return 'fa-cc-visa'
            //     default:
            //         return 'fa-cc-stripe'
            // }
        },

        card_last_four() {
            if (this.user.card_last_four) {
                return `************${this.user.card_last_four}`
            }
            return ''
        },
    },

    mounted() {
        if (!this.plans.length) {
            this.getPlans().catch(this._handleError)
        }
        if (!this.invoices.length) {
            this.getInvoices().catch(this._handleError)
        }
    },

    methods: {
        ...mapActions([
            'handleError',
            'resetError',
            'addCard',
            'getUser',
            'getInvoices',
            'getPlans',
        ]),

        _handleError(error) {
            if (error && error.error && error.error.code) {
                this.error =
                    this.$root.lang == 'ja' ? stripe_errors[event.error.code] : event.error.message
            }
            this.sending = false
        },

        tryToSave() {
            if (!this.card.name) return
            this.sending = true
            this.resetError()

            return createToken({ name: this.card.name })
                .then(event => {
                    if (!event.token) {
                        this.error =
                            this.$root.lang == 'ja'
                                ? stripe_errors[event.error.code]
                                : event.error.message
                        this.sending = false
                        return
                    }
                    this.error = false
                    this.card.token = event.token.id
                    return this.addCard(this.card)
                        .then(() => {
                            this.getUser().then(() => {
                                this.getSubscription().catch(this._handleError)
                            })
                            this.sending = false
                            this.showSuccess = true
                            this.showForm = false
                            this.$refs.card.clear()
                        })
                        .catch(this._handleError)
                })
                .catch(this._handleError)
        },

        formatDate(date, format) {
            return formatDate(date, format)
        },

        formatCurrency(value, currency, option) {
            return formatCurrency(value, currency, option)
        },

        handleCardChange(event) {
            if (event.error) {
                this.sending = false
                this.resetError()
                this.error =
                    this.$root.lang == 'ja' ? stripe_errors[event.error.code] : event.error.message
            } else {
                this.error = false
            }
            this.complete = event.complete
        },
    },
}
</script>

<template>
    <Layout>
        <div transition="fadeIn">
            <v-toolbar
                :class="{ 'blue-grey lighten-5': !$root.dark }"
                class="mb-0 v-toolbar__content--nopadding px-3"
                flat
            >
                <v-toolbar-title class="text-capitalize">
                    {{ 'billing' | translate }}
                </v-toolbar-title>
                <v-spacer />
            </v-toolbar>

            <transition name="fade" appear>
                <v-container class="pa-0 mt-3 center-block">
                    <v-layout wrap align-start justify-center>
                        <v-flex xs12 md7 lg7 xl5 class="px-2">
                            <div v-if="sending" class="progress-bar">
                                <v-progress-linear
                                    color="indigo"
                                    height="4"
                                    class="ma-0"
                                    indeterminate
                                />
                            </div>

                            <v-card class="mb-3">
                                <div class="pa-3">
                                    <h2 class="title font-weight-regular text-capitalize">
                                        <span v-if="!showForm">
                                            {{ 'payment method' | translate }}
                                        </span>
                                        <span v-if="showForm && card_last_four">
                                            {{ 'Update payment method' | translate }}
                                        </span>
                                        <span v-if="showForm && !card_last_four">
                                            {{ 'Add payment method' | translate }}
                                        </span>
                                    </h2>
                                </div>

                                <v-layout v-if="!showForm && card_last_four" class="pb-3 px-3">
                                    <div class="pt-2">
                                        <v-icon>{{ cardIcon }}</v-icon>
                                        {{ card_last_four }}
                                    </div>
                                    <v-spacer />
                                    <v-tooltip max-width="300" bottom>
                                        <v-btn icon @click="showForm = true" slot="activator">
                                            <v-icon>edit</v-icon>
                                        </v-btn>
                                        {{ 'Update payment method' | translate }}
                                    </v-tooltip>
                                </v-layout>

                                <div v-if="showForm || !card_last_four" class="pa-3">
                                    <div v-if="showForm">
                                        <card
                                            ref="card"
                                            :stripe="stripeKey"
                                            class="input-stripe-form"
                                            :options="stripeOptions"
                                            @change="handleCardChange($event)"
                                        />
                                        <div
                                            v-if="error"
                                            class="v-text-field__details"
                                            style="border-top: solid red thin"
                                        >
                                            <div class="v-messages theme--light error--text">
                                                <div class="v-messages__wrapper">
                                                    <div class="v-messages__message mt-1">
                                                        {{ error }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <v-text-field
                                            required
                                            :rules="nameRules"
                                            v-model="card.name"
                                            :label="`Cardholder's name` | translate"
                                        />
                                    </div>
                                    <div v-else-if="!card_last_four">
                                        <v-btn class="mx-0 primary" dark @click="showForm = true">
                                            {{ 'Add payment method' | translate }}
                                        </v-btn>
                                    </div>
                                </div>

                                <v-card-actions v-if="showForm" class="px-3 pb-3 pt-0">
                                    <v-spacer />
                                    <v-btn flat @click="showForm = false">
                                        {{ 'cancel' | translate }}
                                    </v-btn>
                                    <v-btn
                                        class="pay-with-stripe"
                                        id="btn-subscribe"
                                        color="primary"
                                        type="submit"
                                        :disabled="!complete || sending"
                                        @click="tryToSave"
                                    >
                                        {{ 'save' | translate }}
                                    </v-btn>
                                </v-card-actions>
                            </v-card>

                            <v-alert
                                v-if="user.on_trial"
                                color="success"
                                :value="true"
                                class="mt-3 text-center"
                            >
                                {{
                                    'You are currently within your free trial period. Your trial will expire on {date}.'
                                        | translate({
                                            date: formatDate(user.trial_ends_at, 'YYYY/MM/DD'),
                                        })
                                }}
                            </v-alert>

                            <v-card v-if="invoices.length" class="mb-3">
                                <div class="pa-3">
                                    <h2 class="title mb-1 font-weight-regular">
                                        {{ 'Payment history' | translate }}
                                    </h2>
                                </div>
                                <v-list two-line class="py-0">
                                    <v-list-tile
                                        v-for="(invoice, index) in invoices"
                                        :key="index"
                                        :class="{ 'with-border': index < invoices.length - 1 }"
                                    >
                                        <v-list-tile-content>
                                            <v-list-tile-title>
                                                {{
                                                    invoice.amount_paid | currency(invoice.currency)
                                                }}
                                            </v-list-tile-title>
                                            <v-list-tile-sub-title>
                                                {{ (invoice.date * 1000) | format('YYYY/MM/DD') }}
                                            </v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-btn
                                                target="_blank"
                                                flat
                                                dense
                                                :href="invoice.hosted_invoice_url"
                                                class="accent--text text-capitalize"
                                            >
                                                <v-icon>picture_as_pdf</v-icon>
                                                &nbsp; {{ 'view' | translate }}
                                            </v-btn>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                </v-list>
                            </v-card>
                        </v-flex>
                    </v-layout>
                </v-container>
            </transition>
        </div>

        <v-snackbar v-model="showSuccess" bottom :timeout="4000">
            <span>{{ 'Payment details saved successfully' | translate }}</span>
        </v-snackbar>

        <script2 src="https://js.stripe.com/v3/" />
    </Layout>
</template>

<style lang="scss" scoped>
.stripe-form .StripeElement {
    min-width: 580px;
    margin-left: 7px;
}

.input-stripe-form {
    padding: 6px 0;
}
.StripeElement {
    border-bottom: solid thin rgba(0, 0, 0, 0.42) !important;
    padding-bottom: 8px !important;
}
</style>
