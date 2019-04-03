<script>
import VueScript2 from 'vue-script2'
import { Card, createToken } from 'vue-stripe-elements-plus'
import stripe_errors from '@/stripe_errors.json'

const stripeKey = process.env.VUE_APP_STRIPE_KEY ? process.env.VUE_APP_STRIPE_KEY : ''

export default {
    components: { Card },
    data() {
        return {
            card: {},
            stripeKey,
            stripeLoaded: typeof Stripe !== 'undefined',
            error: false,
            stripeOptions: {
                hidePostalCode: true,
                classes: { base: '' },
                style: {
                    base: {
                        fontSize: '16px',
                        fontFamily: 'Roboto,Noto Sans,-apple-system,BlinkMacSystemFont,sans-serif',
                        color: this.$root.dark ? '#fff' : 'rgba(33, 33, 33, 0.7)',
                        '::placeholder': {
                            color: this.$root.dark
                                ? 'rgba(255,255,255,0.7)'
                                : 'rgba(0, 0, 0, 0.54)',
                        },
                    },
                    invalid: {
                        color: 'rgb(245, 94, 83)',
                    },
                },
            },
            nameRules: [v => !!v || this.$t('Name is required')],
        }
    },
    mounted() {
        // wait for strupe script before render Card
        if (!this.stripeLoaded) {
            VueScript2.load('https://js.stripe.com/v3/').then(() => {
                this.stripeLoaded = true
            })
        }
    },
    methods: {
        _handleError(error) {
            if (error && error.error && error.error.code) {
                this.error =
                    this.$root.lang == 'ja' ? stripe_errors[event.error.code] : event.error.message
            }
        },
        handleCardChange(event) {
            if (event.error) {
                this.error =
                    this.$root.lang == 'ja' ? stripe_errors[event.error.code] : event.error.message
            } else {
                this.error = false
            }
            this.complete = event.complete
        },
        tryToSaveCard() {
            if (!this.card.name) return
            return createToken({ name: this.card.name })
                .then(event => {
                    if (this.is_billing_required && !event.token) {
                        this.error =
                            this.$root.lang == 'ja'
                                ? stripe_errors[event.error.code]
                                : event.error.message
                        return
                    }
                    this.error = false
                    this.card.token = event.token.id
                    return event.token.id
                })
                .catch(this._handleError)
        },
    },
}
</script>
<template>
    <div>
        <card
            v-if="stripeLoaded"
            ref="card"
            :stripe="stripeKey"
            class="input-stripe-form"
            :options="stripeOptions"
            @change="handleCardChange($event)"
        />
        <div v-if="error" class="v-text-field__details">
            <div class="v-messages theme--light error--text">
                <div class="v-messages__wrapper">
                    <div class="v-messages__message mt-1">{{ error }}</div>
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
</template>

<style lang="scss">
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

.StripeElement--invalid {
    border-bottom: solid thin #d65249 !important;
    padding-bottom: 8px !important;
}
</style>
