<script>
import { mapActions } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, minValue, maxValue } from 'vuelidate/lib/validators'
import MarketCostSummary from '@/components/project/market-cost-summary'
import MarketCostDetails from '@/components/project/market-cost-details'

export default {
    components: { MarketCostSummary, MarketCostDetails },
    mixins: [validationMixin],
    props: ['project'],
    data() {
        return {
            model: {
                market_share: 20,
                market_size: null,
                mi: 1,
                growth: 'log',
                launch_period: null,
            },
            currencyMap: {
                usd: '＄',
                jpy: '￥',
                eur: '€',
            },
            error: false,
            sending: false,
            projectSaved: false,
            currentStep: 1,
            stepErrors: [],
        }
    },
    computed: {
        currency() {
            return this.currencyMap[this.project.currency]
        },
        marketSizeErrors() {
            const errors = []
            if (!this.$v.model.market_size.$dirty) return errors
            !this.$v.model.market_size.minValue && errors.push(this.$t('Minimum market size is 1'))
            !this.$v.model.market_size.required && errors.push(this.$t('Required Field'))
            return errors
        },
        marketShareErrors() {
            const errors = []
            if (!this.$v.model.market_share.$dirty) return errors
            !this.$v.model.market_share.minValue &&
                errors.push(this.$t('Minimum market share is 0.01%'))
            !this.$v.model.market_share.required && errors.push(this.$t('Required Field'))
            return errors
        },
        avpErrors() {
            const errors = []
            if (!this.$v.model.avp.$dirty) return errors
            !this.$v.model.avp.required && errors.push(this.$t('Required Field'))
            return errors
        },
        apcErrors() {
            const errors = []
            if (!this.$v.model.apc.$dirty) return errors
            !this.$v.model.apc.required &&
                errors.push(this.$t('The average purchase frequency is required'))
            return errors
        },
        miErrors() {
            const errors = []
            if (!this.$v.model.mi.$dirty) return errors
            !this.$v.model.mi.required && errors.push(this.$t('Required Field'))
            return errors
        },
        conversationRateErrors() {
            const errors = []
            if (!this.$v.model.conversion_rate.$dirty) return errors
            !this.$v.model.conversion_rate.maxValue &&
                errors.push(this.$t('Maximum conversion rate is 100%'))
            !this.$v.model.conversion_rate.required && errors.push(this.$t('Required Field'))
            return errors
        },
        cogsErrors() {
            const errors = []
            if (!this.$v.model.cogs.$dirty) return errors
            !this.$v.model.cogs.maxValue && errors.push(this.$t('Maximum cogs is 99%'))
            !this.$v.model.cogs.required && errors.push(this.$t('Required Field'))
            return errors
        },
        launchPeriodErrors() {
            const errors = []
            if (!this.$v.model.launch_period.$dirty) return errors
            !this.$v.model.launch_period.minValue &&
                errors.push(this.$t('Minimum launch period length is 1 months'))
            !this.$v.model.launch_period.maxValue &&
                errors.push(this.$t('Maximum launch period length is 60 months'))
            return errors
        },
        cpmiErrors() {
            const errors = []
            if (!this.$v.model.cpmi.$dirty) return errors
            !this.$v.model.cpmi.required && errors.push(this.$t('Required Field'))
            return errors
        },
        growthErrors() {
            const errors = []
            if (!this.$v.model.growth.$dirty) return errors
            !this.$v.model.growth.required && errors.push(this.$t('Required Field'))
            return errors
        },
        initalCostErrors() {
            const errors = []
            if (!this.$v.model.initial_cost.$dirty) return errors
            return errors
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
    validations: {
        model: {
            market_size: {
                required,
                minValue: minValue(1),
            },
            market_share: {
                required,
                minValue: minValue(0.01),
            },
            avp: {
                required,
            },
            apc: {
                required,
            },
            mi: {
                required,
            },
            conversion_rate: {
                required,
                maxValue: maxValue(100),
            },
            cogs: {
                required,
            },
            initial_cost: {},
            launch_period: {
                minValue: minValue(1),
                maxValue: maxValue(60),
            },
            cpmi: {
                required,
            },
            growth: {
                required,
            },
        },
    },

    watch: {},

    mounted() {},

    methods: {
        ...mapActions(['resetError', 'addModel', 'getProject', 'getProjects']),
        _handleError() {
            this.sending = false
        },
        tryToSave() {
            this.sending = true
            this.validate('1', '5')
            this.validate('2', '5')
            this.validate('3', '5')
            this.resetError()
            this.$v.$touch()

            this.sending = false
            if (this.$v.$invalid) return Promise.resolve(false)
            this.sending = true
            this.model.launch_period = this.model.launch_period || 0
            this.model.initial_cost = this.model.initial_cost || 0
            let project_id = this.project.id
            return this.addModel({ project_id, model: this.model })
                .then(model => {
                    this.project.model = model
                    this.getProject(project_id).then(() => {
                        this.getProjects()
                        this.sending = false
                        this.projectSaved = true
                        this.$router.push({
                            name: 'project',
                            params: { modelCreated: true, id: project_id },
                        })
                        return true
                    })
                })
                .catch(this._handleError)
        },
        validate(step, next) {
            switch (step) {
                case '1':
                    this.$v.model.market_size.$touch()
                    this.$v.model.market_share.$touch()
                    if (this.$v.model.market_size.$invalid || this.$v.model.market_share.$invalid) {
                        this.stepErrors.push('1')
                    } else {
                        this.stepErrors = this.stepErrors.filter(error => {
                            return error !== '1'
                        })
                        if (next !== '5') {
                            this.setDone(step, next)
                        }
                    }
                    break
                case '2':
                    this.$v.model.avp.$touch()
                    this.$v.model.apc.$touch()
                    this.$v.model.conversion_rate.$touch()
                    this.$v.model.cpmi.$touch()
                    if (
                        this.$v.model.avp.$invalid ||
                        this.$v.model.apc.$invalid ||
                        this.$v.model.conversion_rate.$invalid ||
                        this.$v.model.cpmi.$invalid
                    ) {
                        this.stepErrors.push('2')
                    } else {
                        this.stepErrors = this.stepErrors.filter(error => {
                            return error !== '2'
                        })
                        if (next !== '5') {
                            this.setDone(step, next)
                        }
                    }
                    break
                case '3':
                    this.$v.model.initial_cost.$touch()
                    this.$v.model.cogs.$touch()
                    this.$v.model.launch_period.$touch()
                    this.stepErrors.push('3')
                    if (
                        this.$v.model.initial_cost.$invalid ||
                        this.$v.model.cogs.$invalid ||
                        this.$v.model.launch_period.$invalid
                    ) {
                        this.stepErrors.push('3')
                    } else {
                        this.stepErrors = this.stepErrors.filter(error => {
                            return error !== '3'
                        })
                        if (next !== '5') {
                            this.setDone(step, next)
                        }
                    }
                    break
            }
        },
        setDone(id, index) {
            this.currentStep = index
        },
        getStepErrors(step) {
            return !this.stepErrors.includes(step)
        },
    },
}
</script>

<template>
    <div>
        <v-container class="pa-0" fluid grid-list-lg>
            <v-layout row wrap>
                <v-flex xs12 sm7 md8 lg7>
                    <div class="progress-bar ma-0" v-if="sending">
                        <v-progress-linear color="indigo" height="5" class="ma-0" indeterminate />
                    </div>
                    <v-stepper v-model="currentStep" vertical class="py-3">
                        <v-stepper-step
                            :complete="currentStep > 1"
                            color="indigo"
                            step="1"
                            editable
                            :rules="[() => getStepErrors('1')]"
                            edit-icon="check"
                            complete-icon="check_circle"
                            error-icon="cancel"
                            class="title text-capitalize"
                        >
                            {{ 'market parameters' | translate }}
                        </v-stepper-step>
                        <v-stepper-content step="1">
                            <form @submit.prevent="validate('1', '2')">
                                <v-layout row wrap>
                                    <v-flex xs12 md6>
                                        <v-text-field
                                            v-model="model.market_size"
                                            id="market_size"
                                            :label="`total addressable market` | translate"
                                            class="has-suffix text-capitalize"
                                            type="number"
                                            :min="1"
                                            :step="1"
                                            :error-messages="marketSizeErrors"
                                            @blur="$v.model.market_size.$touch()"
                                        >
                                            <v-tooltip max-width="300" slot="append-outer" bottom>
                                                <v-icon slot="activator" size="19" class="mt-1">
                                                    help
                                                </v-icon>
                                                <span v-if="$root.lang == 'en'">
                                                    Enter the total number of potential customers on
                                                    the market your product or service is targeted
                                                    at.
                                                </span>
                                                <span v-else>
                                                    市場で商取引が行われる見込み客の総数を入力してください
                                                </span>
                                            </v-tooltip>
                                        </v-text-field>
                                    </v-flex>
                                    <v-flex xs12 md6>
                                        <v-text-field
                                            v-model="model.market_share"
                                            id="market_share"
                                            :min="0.01"
                                            class="has-suffix text-capitalize"
                                            :step="0.01"
                                            :max="100"
                                            type="number"
                                            :label="'market share' | translate"
                                            :error-messages="marketShareErrors"
                                            @blur="$v.model.market_share.$touch()"
                                        >
                                            <v-tooltip max-width="300" slot="append-outer" bottom>
                                                <v-icon slot="activator" size="19" class="mt-1">
                                                    help
                                                </v-icon>
                                                <span v-if="$root.lang == 'en'">
                                                    Enter the share you want to capture.
                                                </span>
                                                <span v-else>
                                                    獲得したい市場のシェア（%）を入力してください
                                                </span>
                                            </v-tooltip>
                                        </v-text-field>
                                    </v-flex>
                                </v-layout>
                                <v-btn
                                    dense
                                    raised
                                    color="primary"
                                    id="submit-step-1"
                                    class="ml-0 mb-3 mt-2"
                                    type="submit"
                                >
                                    {{ 'next step' | translate }}
                                </v-btn>
                            </form>
                        </v-stepper-content>

                        <v-stepper-step
                            :complete="currentStep > 2"
                            step="2"
                            color="indigo"
                            editable
                            :rules="[() => getStepErrors('2')]"
                            edit-icon="check"
                            complete-icon="check_circle"
                            error-icon="cancel"
                            class="title text-capitalize"
                        >
                            {{ 'price and marketing' | translate }}
                        </v-stepper-step>

                        <v-stepper-content step="2">
                            <form @submit.prevent="validate('2', '3')">
                                <v-layout row wrap>
                                    <v-flex xs12 md6>
                                        <v-text-field
                                            v-model="model.avp"
                                            id="avp"
                                            class="has-suffix text-capitalize"
                                            min="0"
                                            :step="step"
                                            :max="max"
                                            type="number"
                                            :prefix="currency"
                                            :label="'average unit price' | translate"
                                            :error-messages="avpErrors"
                                            @blur="$v.model.avp.$touch()"
                                        >
                                            <v-tooltip max-width="300" slot="append-outer" bottom>
                                                <v-icon slot="activator" size="19" class="mt-1">
                                                    help
                                                </v-icon>
                                                <span v-if="$root.lang == 'en'">
                                                    Average Unit Price is the amount you expect your
                                                    customer pay for a single unit of your product
                                                    or service.
                                                </span>
                                                <span v-else>
                                                    1回の請求（購買）によってユーザー1人当たりが支払う総額を入力してください
                                                </span>
                                            </v-tooltip>
                                        </v-text-field>
                                    </v-flex>
                                    <v-flex xs12 md6>
                                        <v-text-field
                                            v-model="model.apc"
                                            id="apc"
                                            class="has-suffix text-capitalize"
                                            min="0"
                                            step="1"
                                            type="number"
                                            :label="'average purchase frequency' | translate"
                                            :error-messages="apcErrors"
                                            @blur="$v.model.apc.$touch()"
                                        >
                                            <v-tooltip max-width="300" slot="append-outer" bottom>
                                                <v-icon slot="activator" size="19" class="mt-1">
                                                    help
                                                </v-icon>
                                                <span v-if="$root.lang == 'en'">
                                                    Average number of payments made by one customer
                                                    during a period of time. APC by default is
                                                    counted for the whole project active period.
                                                    This value should never be rounded up.
                                                </span>
                                                <span v-else>
                                                    顧客離脱が起きるまでの予測している平均請求回数を入力してください
                                                </span>
                                            </v-tooltip>
                                        </v-text-field>
                                    </v-flex>
                                    <v-flex xs12 md6>
                                        <v-text-field
                                            v-model="model.conversion_rate"
                                            id="conversion_rate"
                                            :label="'conversion rate' | translate"
                                            class="has-suffix text-capitalize"
                                            min="0.01"
                                            step="0.01"
                                            max="100"
                                            type="number"
                                            :error-messages="conversationRateErrors"
                                            @blur="$v.model.conversion_rate.$touch()"
                                        >
                                            <v-tooltip max-width="300" slot="append-outer" bottom>
                                                <v-icon slot="activator" size="19" class="mt-1">
                                                    help
                                                </v-icon>
                                                <span v-if="$root.lang == 'en'">
                                                    (CR) Rate of conversion from User to Customer.
                                                    First purchase separates users who just came to
                                                    the site from users who made a purchase and
                                                    became paying customers.
                                                </span>
                                                <span v-else>
                                                    無料ユーザーが有料ユーザーに変換する比率を入力してください
                                                </span>
                                            </v-tooltip>
                                        </v-text-field>
                                    </v-flex>
                                    <v-flex xs12 md6>
                                        <v-text-field
                                            v-model="model.cpmi"
                                            id="cpmi"
                                            class="has-suffix text-capitalize"
                                            min="0"
                                            :step="step"
                                            :max="max"
                                            type="number"
                                            :prefix="currency"
                                            :label="'cost per acquisition' | translate"
                                            :error-messages="cpmiErrors"
                                            @blur="$v.model.cpmi.$touch()"
                                        >
                                            <v-tooltip max-width="300" slot="append-outer" bottom>
                                                <v-icon slot="activator" size="19" class="mt-1">
                                                    help
                                                </v-icon>
                                                <span v-if="$root.lang == 'en'">
                                                    (CPMI) Cost per market interaction for one user.
                                                    It is determined by dividing the entire
                                                    marketing budget by the number of all users.
                                                </span>
                                                <span v-else>
                                                    ユーザー1人当たりの獲得単価を入力してください
                                                </span>
                                            </v-tooltip>
                                        </v-text-field>
                                    </v-flex>
                                </v-layout>
                                <v-btn
                                    dense
                                    raised
                                    id="submit-step-2"
                                    color="primary"
                                    class="ml-0 mb-3 mt-2"
                                    type="submit"
                                >
                                    {{ 'next step' | translate }}
                                </v-btn>
                            </form>
                        </v-stepper-content>

                        <v-stepper-step
                            :complete="currentStep > 3"
                            step="3"
                            color="indigo"
                            editable
                            :rules="[() => getStepErrors('3')]"
                            edit-icon="check"
                            complete-icon="check_circle"
                            error-icon="cancel"
                            class="title text-capitalize"
                        >
                            {{ 'cost' | translate }}
                        </v-stepper-step>

                        <v-stepper-content step="3">
                            <form @submit.prevent="validate('3', '4')">
                                <v-layout row wrap>
                                    <v-flex xs12 md6>
                                        <v-text-field
                                            v-model="model.cogs"
                                            id="cogs"
                                            class="has-suffix text-capitalize"
                                            min="0.1"
                                            step="0.1"
                                            :max="99"
                                            suffix="%"
                                            type="number"
                                            :label="'cost of goods sold' | translate"
                                            :error-messages="cogsErrors"
                                            @blur="$v.model.cogs.$touch()"
                                        >
                                            <v-tooltip max-width="300" slot="append-outer" bottom>
                                                <v-icon slot="activator" size="19" class="mt-1">
                                                    help
                                                </v-icon>
                                                <span
                                                    v-if="$root.lang == 'en'"
                                                    class="custom-helper-text"
                                                >
                                                    The direct costs attributable to the production
                                                    of the goods sold. This amount includes the cost
                                                    of the materials used in creating the good along
                                                    with the direct labor costs used to produce the
                                                    good. It excludes indirect expenses such as
                                                    distribution costs and sales force costs.
                                                </span>
                                                <span v-else>
                                                    商品をつくるのに使う一切の費用が、製品の単位当たり幾らになるかを、計算した値です。
                                                    SaaSの場合、１アカウント／１ユーザー当たりの費用を入力してください
                                                </span>
                                            </v-tooltip>
                                        </v-text-field>
                                    </v-flex>
                                    <v-flex v-if="project.with_launch" xs12 md6>
                                        <v-text-field
                                            v-model="model.initial_cost"
                                            id="initial_cost"
                                            class="has-suffix text-capitalize"
                                            min="0"
                                            :step="step"
                                            :max="max"
                                            type="number"
                                            :prefix="currency"
                                            :label="'initial cost' | translate"
                                            :error-messages="initalCostErrors"
                                            @blur="$v.model.initial_cost.$touch()"
                                        >
                                            <v-tooltip max-width="300" slot="append-outer" bottom>
                                                <v-icon slot="activator" size="19" class="mt-1">
                                                    help
                                                </v-icon>
                                                <span v-if="$root.lang == 'en'">
                                                    Additional costs for the first sale. The
                                                    additional costs for first sale are, for
                                                    example, expenses for pilot launches, MVP and
                                                    integrations for corporate clients, or an extra
                                                    fee to a sales agent.
                                                </span>
                                                <span v-else>
                                                    新しく事業を始めたり、新しく外部サービスや設備などを導入したり、MVPやパイロットローンチしたりするときなどに、事業が稼働して、初商取引が発生するまでの間に必要となる費用を入力してください。
                                                </span>
                                            </v-tooltip>
                                        </v-text-field>
                                    </v-flex>
                                    <v-flex v-if="project.with_launch" xs12 md6>
                                        <v-text-field
                                            v-model="model.launch_period"
                                            id="launch_period"
                                            class="has-suffix text-capitalize"
                                            min="0"
                                            step="1"
                                            type="number"
                                            :label="'launch period, months' | translate"
                                            :error-messages="launchPeriodErrors"
                                            @blur="$v.model.launch_period.$touch()"
                                        >
                                            <div slot="append-outer" bottom>
                                                <v-icon size="19" class="mt-1">help</v-icon>
                                            </div>
                                        </v-text-field>
                                    </v-flex>
                                </v-layout>
                                <v-btn
                                    dense
                                    raised
                                    id="submit-step-3"
                                    color="primary"
                                    class="ml-0 mb-3 mt-2"
                                    type="submit"
                                >
                                    {{ 'next step' | translate }}
                                </v-btn>
                            </form>
                        </v-stepper-content>

                        <v-stepper-step
                            step="4"
                            color="indigo"
                            editable
                            edit-icon="check"
                            complete-icon="check_circle"
                            error-icon="cancel"
                            class="title text-capitalize"
                        >
                            {{ 'revenue growth pattern' | translate }}
                        </v-stepper-step>

                        <v-stepper-content step="4">
                            <form @submit.prevent="tryToSave">
                                <div class="growth-selector">
                                    <h4 class="caption mb-3">
                                        {{
                                            'Select a pattern that fits your business model:'
                                                | translate
                                        }}
                                    </h4>
                                    <label for="logarithmic" @click="model.growth = 'log'">
                                        <input
                                            id="logarithmic"
                                            type="radio"
                                            name="growth"
                                            class="logarithmic"
                                            value="log"
                                            :checked="model.growth == 'log'"
                                        />
                                        <svg viewBox="0 0 208 208">
                                            <g
                                                transform="translate(6.000000, 0.000000)"
                                                fill="none"
                                                fill-rule="nonzero"
                                            >
                                                <path
                                                    id="Line"
                                                    d="M1.5,0.5 L-5.5,14.5 L8.5,14.5 L1.5,0.5 Z M2.5,200.5 L2.5,13.5 L2.5,12.5 L0.5,12.5 L0.5,13.5 L0.5,200.5 L0.5,201.5 L2.5,201.5 L2.5,200.5 Z"
                                                    fill="#00bcd4"
                                                />
                                                <path
                                                    id="Line"
                                                    d="M201.5,200.5 L187.5,193.5 L187.5,207.5 L201.5,200.5 Z M1.5,201.5 L188.5,201.5 L189.5,201.5 L189.5,199.5 L188.5,199.5 L1.5,199.5 L0.5,199.5 L0.5,201.5 L1.5,201.5 Z"
                                                    fill="#00bcd4"
                                                />
                                                <path
                                                    id="Path-2"
                                                    d="M17.3779749,183.5 C108.052235,183.5 177.377975,126.893761 177.377975,23.5"
                                                    stroke-width="2"
                                                    transform="translate(97.377975, 103.500000) scale(-1, -1) translate(-97.377975, -103.500000) "
                                                />
                                            </g>
                                        </svg>
                                    </label>
                                    <label for="exponential" @click="model.growth = 'exp'">
                                        <input
                                            id="exponential"
                                            class="exponential"
                                            type="radio"
                                            name="growth"
                                            value="exp"
                                            :checked="model.growth == 'exp'"
                                        />
                                        <svg
                                            width="208px"
                                            height="208px"
                                            viewBox="0 0 208 208"
                                            version="1.1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlns:xlink="http://www.w3.org/1999/xlink"
                                        >
                                            <g id="Page-1" stroke-width="1" fill-rule="evenodd">
                                                <g
                                                    transform="translate(6.000000, 0.000000)"
                                                    fill-rule="nonzero"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M1.5,0.5 L-5.5,14.5 L8.5,14.5 L1.5,0.5 Z M2.5,200.5 L2.5,13.5 L2.5,12.5 L0.5,12.5 L0.5,13.5 L0.5,200.5 L0.5,201.5 L2.5,201.5 L2.5,200.5 Z"
                                                        fill="#00bcd4"
                                                    />
                                                    <path
                                                        d="M201.5,200.5 L187.5,193.5 L187.5,207.5 L201.5,200.5 Z M1.5,201.5 L188.5,201.5 L189.5,201.5 L189.5,199.5 L188.5,199.5 L1.5,199.5 L0.5,199.5 L0.5,201.5 L1.5,201.5 Z"
                                                        fill="#00bcd4"
                                                    />
                                                    <path
                                                        d="M18.4902344,182.573936 C114.940438,182.573936 168.273772,129.240603 178.490234,22.5739359"
                                                        stroke-width="2"
                                                    />
                                                </g>
                                            </g>
                                        </svg>
                                    </label>
                                    <label for="linear" @click="model.growth = 'lin'">
                                        <input
                                            id="linear"
                                            class="linear"
                                            type="radio"
                                            name="growth"
                                            value="lin"
                                            :checked="model.growth == 'lin'"
                                        />
                                        <svg
                                            width="208px"
                                            height="208px"
                                            viewBox="0 0 208 208"
                                            version="1.1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlns:xlink="http://www.w3.org/1999/xlink"
                                        >
                                            <g
                                                id="Page-1"
                                                stroke-width="1"
                                                fill="none"
                                                fill-rule="evenodd"
                                            >
                                                <g
                                                    transform="translate(6.000000, 0.000000)"
                                                    fill-rule="nonzero"
                                                    fill="none"
                                                >
                                                    <path
                                                        id="Line"
                                                        d="M1.5,0.5 L-5.5,14.5 L8.5,14.5 L1.5,0.5 Z M2.5,200.5 L2.5,13.5 L2.5,12.5 L0.5,12.5 L0.5,13.5 L0.5,200.5 L0.5,201.5 L2.5,201.5 L2.5,200.5 Z"
                                                        fill="#00bcd4"
                                                    />
                                                    <path
                                                        id="Line"
                                                        d="M201.5,200.5 L187.5,193.5 L187.5,207.5 L201.5,200.5 Z M1.5,201.5 L188.5,201.5 L189.5,201.5 L189.5,199.5 L188.5,199.5 L1.5,199.5 L0.5,199.5 L0.5,201.5 L1.5,201.5 Z"
                                                        fill="#00bcd4"
                                                    />
                                                    <path
                                                        id="Path-2"
                                                        d="M18.4902344,182.573936 L178.490234,22.5739359"
                                                        stroke-width="2"
                                                    />
                                                </g>
                                            </g>
                                        </svg>
                                    </label>
                                </div>
                                <v-tooltip max-width="300" bottom>
                                    <v-btn
                                        slot="activator"
                                        dense
                                        id="submit-step-4"
                                        color="primary"
                                        class="ml-0 mb-0 mt-2"
                                        type="submit"
                                        :disabled="sending"
                                    >
                                        {{ 'save' | translate }}
                                    </v-btn>
                                    {{ 'Save your project details.' | translate }}
                                </v-tooltip>
                            </form>
                        </v-stepper-content>
                    </v-stepper>
                </v-flex>
                <v-flex xs12 sm5 md4 lg3>
                    <market-cost-summary
                        v-if="model.market_size"
                        :model="model"
                        class="mt-0 mb-3"
                    />
                    <market-cost-details :model="model" />
                </v-flex>
            </v-layout>
        </v-container>
        <v-snackbar v-model="projectSaved" bottom>
            {{ 'Model updated successfully!' | translate }}
        </v-snackbar>
    </div>
</template>

<style lang="scss" scoped>
.v-stepper__step__step {
    $size: 20px;
    width: $size;
    height: $size;
    min-width: $size;
}
.v-stepper--vertical {
    .v-stepper__step {
        padding: 5px 16px;
    }
    .v-stepper__content {
        margin-left: 28px;
    }
}

.v-text-field {
    margin-right: 47px;
    .v-input__append-outer {
        .v-icon {
            opacity: 0.55;
        }
    }
}
.growth-selector svg {
    height: 10em;
    width: 10em;
    margin: 0.2rem;
    stroke: #00bcd4;
    padding: 10px;
}

input[type='radio'] {
    position: absolute;
    opacity: 0;
}

input[type='radio'] + svg {
    -webkit-transition: all 0.2s;
    transition: all 0.2s;
}

input + svg {
    cursor: pointer;
}

input[class='logarithmic']:hover + svg,
input[class='logarithmic']:checked + svg,
input[class='logarithmic']:focus + svg {
    fill: rgb(0, 109, 217);
    stroke: #00bcd4;
    padding: 10px;
    border: 0.15em solid #00bcd4;
    border-radius: 10px;
}
input[class='exponential']:hover + svg,
input[class='exponential']:checked + svg,
input[class='exponential']:focus + svg {
    fill: rgb(0, 109, 217);
    stroke: #00bcd4;
    padding: 10px;
    border: 0.15em solid #00bcd4;
    border-radius: 10px;
}
input[class='linear']:hover + svg,
input[class='linear']:checked + svg,
input[class='linear']:focus + svg {
    fill: rgb(0, 109, 217);
    stroke: #00bcd4;
    padding: 10px;
    border: 0.15em solid #00bcd4;
    border-radius: 10px;
}
</style>
