<script>
import { mapState, mapActions, mapGetters } from 'vuex'

import FormatMixin from '@/mixins/formatMixin'
import PaymentForm from '@/components/billing/paymentForm'
import formatCurrency from '@/utils/format-currency'

export default {
    mixins: [FormatMixin],
    components: {
        PaymentForm,
    },
    props: ['data'],
    data() {
        return {
            // credit card error
            paymentFormError: false,
            coupon: null,
            project: {
                title: '',
                currency: 'jpy',
                start_date: new Date().toISOString().substr(0, 7),
                business_model: 'subscription',
                coupon: null,
                with_cost_manager: false,
            },
            currencyMap: {
                usd: '＄',
                jpy: '￥',
                eur: '€',
            },
            currencyItems: [
                { text: 'Japanese Yen', value: 'jpy' },
                { text: 'US Dollar', value: 'usd' },
                { text: 'Euro', value: 'eur' },
            ],
            sending: false,
            dateDialog: false,
            valid: false,
            rules: {
                title: [
                    v => !!v || this.$t('Required Field'),
                    v =>
                        (v && v.length <= 30) ||
                        this.$t('Title must be at most 30 characters long'),
                    v =>
                        (v && v.length >= 2) || this.$t('Title must be at least 2 characters long'),
                ],
            },
            expanded: false,
            kickstartExpanded: false,
            costManagerExpanded: false,
            newPlanNickname: 'Yearly',
            // one of: 'saveProject', 'resumeSubscription', 'cancelSubscription'
            confirmation: null,
            showCardForm: false,
        }
    },

    computed: {
        ...mapState({
            user: state => state.account.user,
            projects: state => state.projects.list,
            plans: state => state.subscriptions.plans,
            stripeSubscription: state => state.projects.subscription,
        }),
        ...mapGetters(['currency']),
        locale() {
            return this.$root.lang == 'en' ? 'en-us' : 'ja-jp'
        },
        card_last_four() {
            if (this.user.card_last_four) {
                return `************${this.user.card_last_four}`
            }
            return ''
        },
        step() {
            if (this.project.currency == 'jpy') {
                return 1
            }
            return 0.01
        },
        max() {
            if (this.project.currency == 'jpy') {
                return 999999999999
            }
            return 999999999999.99
        },
        trial_available() {
            return !this.user.on_trial && !this.user.trial_ended && this.projects.length == 0
        },
        trial_project() {
            return (
                (this.user.on_trial &&
                    this.project.id &&
                    this.projects.length == 1 &&
                    !this.current_plan) ||
                (this.current_plan && this.project.subscription.trial_ends_at)
            )
        },
        trial_ends_at() {
            return this.user.on_trial
                ? this.user.trial_ends_at
                : this.current_plan
                ? this.project.subscription.trial_ends_at
                : false
        },
        show_subscribe() {
            return (
                (!this.trial_available && (!this.trial_project || this.current_plan)) ||
                this.expanded
            )
        },
        monthly_active() {
            return this.monthly_plan && this.newPlan && this.monthly_plan.id === this.newPlan.id
        },
        yearly_active() {
            return this.yearly_plan && this.newPlan && this.yearly_plan.id === this.newPlan.id
        },
        monthly_plan() {
            return this.plans.find(p => {
                return p.nickname == 'Monthly'
            })
        },
        yearly_plan() {
            return this.plans.find(p => {
                return p.nickname == 'Yearly'
            })
        },
        newPlan() {
            return this.plans
                ? this.plans.find(p => {
                      return p.nickname == this.newPlanNickname
                  })
                : null
        },
        on_grace_period() {
            return this.project.subscription && this.project.subscription.on_grace_period
        },
        current_plan() {
            return (
                this.project.subscription &&
                this.plans.find(p => {
                    return p.id == this.project.subscription.stripe_plan
                })
            )
        },
        is_plan_changed() {
            return (
                !this.project.subscription ||
                (this.project.subscription.stripe_plan &&
                    this.newPlan.id !== this.project.subscription.stripe_plan)
            )
        },
        confirmation_data() {
            let result = {}
            if (!this.confirmation) {
                return result
            }
            result.plan = this.newPlan
            if (this.confirmation === 'saveProject') {
                if (
                    this.project.subscription &&
                    this.project.subscription.stripe_plan &&
                    this.newPlan.id &&
                    this.project.subscription.stripe_plan !== this.newPlan.id
                ) {
                    result.direction = 'change'
                } else {
                    result.direction = 'activate'
                }
            }

            if (this.stripeSubscription && this.stripeSubscription.id) {
                if (this.confirmation == 'cancelSubscription') {
                    result.currentPlanName = this.current_plan.nickname
                    result.currentPlanExpirationDate =
                        this.stripeSubscription.current_period_end * 1000
                } else if (this.confirmation == 'resumeSubscription') {
                    result.cancelDate = this.stripeSubscription.canceled_at * 1000
                    result.expiryDate = this.stripeSubscription.current_period_end * 1000
                }
                if (result.direction == 'change') {
                    result.expiryDate = this.stripeSubscription.current_period_end * 1000
                }
            } else if (result.direction !== 'activate') {
                result.loading = true
            }

            return result
        },
        is_kickstart() {
            return this.project.business_model == 'kickstart'
        },
    },

    created() {
        if (this.data && this.data.id) {
            this.project = Object.assign({}, this.data)
        }
    },

    mounted() {
        // load plans and set newPlanNickname to current plan nickname
        if (!this.plans.length) {
            this.getPlans().then(() => this.initNewPlan())
        } else {
            this.initNewPlan()
        }
    },

    watch: {
        confirmation() {
            // load stripe subscription when confirmation is enabled
            this.loadConfirmationData()
        },
    },

    methods: {
        ...mapActions([
            'resetError',
            'createProject',
            'updateProject',
            'getProject',
            'getProjects',
            'getPlans',
            'getUser',
            'resumeSubscription',
            'cancelSubscription',
            'getSubscription',
        ]),
        formatCurrency,
        _handleError() {
            this.sending = false
        },
        // set `newPlanNickname` from `project.subscription`
        initNewPlan() {
            if (this.current_plan) {
                this.newPlanNickname = this.current_plan.nickname
            }
        },
        tryToSave: function() {
            if (this.project.id) {
                return this.tryToUpdate()
            }
            return this.tryToCreate()
        },
        tryToCreate() {
            this.resetError()
            this.sending = false
            this.project.duration = 24

            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.sending = true

            return this.createProject(this.project)
                .then(project => {
                    this.sending = false
                    this.getProjects()
                    this.getUser()
                    if (this.is_kickstart) {
                        this.$router.push({
                            name: 'project',
                            params: { projectCreated: true, id: project.id, view: 'wizard' },
                        })
                    } else {
                        this.$router.push({
                            name: 'project',
                            params: { projectCreated: true, id: project.id },
                        })
                    }
                    return true
                })
                .catch(this._handleError)
        },
        tryToUpdate() {
            this.resetError()
            this.sending = false

            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.sending = true

            return this.updateProject(this.project)
                .then(() => {
                    this.sending = false
                    this.$emit('saved', true)
                    this.getProjects()
                    this.getUser()
                })
                .catch(this._handleError)
        },
        /* get token from stripe before submit */
        tryToSubmit() {
            this.sending = false
            this.resetError()
            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.sending = true
            // send request to stripe for a token only if we have stripe form visible
            let stripePromise =
                this.show_subscribe && (this.showCardForm || !this.card_last_four)
                    ? this.$refs.paymentForm.tryToSaveCard()
                    : Promise.resolve('')
            return stripePromise
                .then(token => {
                    if (this.show_subscribe && this.showCardForm && !token) {
                        // an error occured - no token
                        this.sending = false
                        return Promise.resolve(false)
                    }
                    this.project.plan = {}
                    this.project.plan.trial = this.trial_available
                    if (this.show_subscribe) {
                        this.project.plan.id = this.newPlan.id
                        this.project.plan.name = this.newPlanNickname
                        this.project.plan.token = token
                    }
                    return this.tryToSave()
                })
                .catch(this._handleError)
        },
        tryToResume() {
            this.sending = true
            this.resumeSubscription(this.project.id)
                .then(() => {
                    this.sending = false
                    this.getProject(this.project.id)
                })
                .catch(this._handleError)
        },
        tryToCancel() {
            this.sending = true
            this.cancelSubscription(this.project.id)
                .then(() => {
                    this.sending = false
                    this.getProject(this.project.id)
                })
                .catch(this._handleError)
        },
        allowedDates(val) {
            let date = new Date(val)
            let el = ['2010-01-01', '2038-12-31']
            let minDate = new Date(el[0])
            let maxDate = new Date(el[1])

            if (date.getTime() >= minDate.getTime() && date.getTime() <= maxDate.getTime()) {
                return true
            }
            return false
        },
        // handler for `switch` control
        toggleNewPlan(isYearly) {
            this.newPlanNickname = isYearly ? 'Yearly' : 'Monthly'
        },
        // handler for confirmation dialog
        handleConfirmation() {
            const { confirmation } = this
            this.confirmation = null
            switch (confirmation) {
                case 'cancelSubscription':
                    return this.tryToCancel()
                case 'resumeSubscription':
                    return this.tryToResume()
                default:
                    return this.tryToSubmit()
            }
        },
        handleFormSubmit() {
            // if projet is new or existing project's plan has been changed then show confirmation dialog
            if (this.show_subscribe && this.is_plan_changed) {
                this.confirmation = 'saveProject'
                return
            }

            // create/save a project without confirmation otherwise
            this.tryToSubmit()
        },
        loadConfirmationData() {
            if (this.confirmation && this.confirmation_data.direction !== 'activate') {
                this.getSubscription(this.project.id).catch(this._handleError)
            }
        },
        translate(str) {
            return this.$t(str)
        },
    },
}
</script>

<template>
    <div>
        <v-card>
            <div class="progress-bar">
                <v-progress-linear
                    v-if="sending"
                    color="indigo"
                    height="5"
                    class="ma-0"
                    indeterminate
                />
            </div>
            <v-card-title class="title font-weight-regular text-capitalize pb-0">
                <span v-if="!project.id">{{ 'create project' | translate }}</span>
                <span v-else>{{ 'update project' | translate }}</span>
            </v-card-title>

            <v-alert
                color="#71C9CD"
                :value="true"
                v-if="trial_project && trial_ends_at"
                class="mt-3 mx-3"
            >
                {{
                    'Free Trial will expire on {date}.'
                        | translate({
                            date: formatDate(trial_ends_at, 'YYYY/MM/DD'),
                        })
                }}
            </v-alert>

            <v-form v-model="valid" @submit.prevent="handleFormSubmit" ref="form" lazy-validation>
                <v-container fluid class="pa-0 mt-2">
                    <v-layout row wrap class="px-3">
                        <v-flex xs12 sm6 md6>
                            <v-text-field
                                id="title"
                                :label="'title' | translate"
                                :maxlength="50"
                                :rules="rules.title"
                                required
                                v-model="project.title"
                                class="text-capitalize"
                                clearable
                            />
                        </v-flex>
                        <v-flex xs12 sm6 md6>
                            <v-dialog
                                ref="dateDialog"
                                v-model="dateDialog"
                                :return-value.sync="project.start_date"
                                persistent
                                lazy
                                full-width
                                width="290px"
                            >
                                <v-text-field
                                    slot="activator"
                                    v-model="project.start_date"
                                    class="text-capitalize"
                                    :label="'start date' | translate"
                                    readonly
                                    clearable
                                />
                                <v-date-picker
                                    v-model="project.start_date"
                                    type="month"
                                    scrollable
                                    :locale="locale"
                                    :allowed-dates="allowedDates"
                                >
                                    <v-spacer />
                                    <v-btn flat color="primary" @click="dateDialog = false">
                                        {{ 'cancel' | translate }}
                                    </v-btn>
                                    <v-btn
                                        flat
                                        class="primary"
                                        @click="$refs.dateDialog.save(project.start_date)"
                                    >
                                        OK
                                    </v-btn>
                                </v-date-picker>
                            </v-dialog>
                        </v-flex>
                        <v-flex xs12 sm4 lg6>
                            <label
                                class="v-label v-label--active
                                theme--light text-capitalize"
                            >
                                {{ 'display currency' | translate }}
                            </label>
                            <br />
                            <v-btn-toggle mandatory v-model="project.currency" class="mt-2">
                                <v-btn
                                    flat
                                    :value="item.value"
                                    v-for="item in currencyItems"
                                    :key="item.key"
                                >
                                    <span class="text-uppercase">{{ item.value }}</span>
                                </v-btn>
                            </v-btn-toggle>
                        </v-flex>
                    </v-layout>
                    <v-layout row fill-height v-if="$root.dev">
                        <v-flex xs12 shrink>
                            <v-list class="indigo lighten-5 mt-3">
                                <v-list-tile two-line>
                                    <v-list-tile-action>
                                        <v-switch
                                            color="primary"
                                            hide-details
                                            :input-value="project.business_model == 'kickstart'"
                                            @change="
                                                project.business_model = is_kickstart
                                                    ? 'subscription'
                                                    : 'kickstart'
                                            "
                                        ></v-switch>
                                    </v-list-tile-action>
                                    <v-list-tile-content>
                                        <v-list-tile-title class="title indigo--text">
                                            KICKSTART
                                        </v-list-tile-title>
                                        <v-list-tile-sub-title
                                            class="black--text"
                                            v-if="$root.lang == 'en'"
                                        >
                                            CMS for automation of your subscription business.
                                        </v-list-tile-sub-title>
                                        <v-list-tile-sub-title class="black--text" v-else>
                                            KICKSTARTはサブスクリプション型ビジネスの運営を自動化するサービスです。
                                        </v-list-tile-sub-title>
                                    </v-list-tile-content>
                                    <v-list-tile-action>
                                        <v-btn icon @click="kickstartExpanded = !kickstartExpanded">
                                            <v-icon>help_outline</v-icon>
                                        </v-btn>
                                    </v-list-tile-action>
                                </v-list-tile>
                            </v-list>
                            <v-expand-transition mode="in-out">
                                <v-card flat v-show="kickstartExpanded">
                                    <v-card-text v-if="$root.lang == 'en'">
                                        <p>
                                            KICKSTART is a service which automates your subscription
                                            business and takes of recurring billing, customer and
                                            revenue management for businesses big and small.
                                        </p>
                                        <p class="mb-0">
                                            KICKSTART is integrated with KINCHAKU CORE platform so
                                            you can expedite your time-to-value without requiring
                                            massive integration effort and expense.
                                        </p>
                                    </v-card-text>
                                    <v-card-text v-else>
                                        <p>
                                            KICKSTARTはサブスクリプション型ビジネス自動化するサービスです。企業の規模を問わず、定期的な請求、顧客や収益管理を行うことができます。
                                        </p>
                                        <p class="mb-0">
                                            KICKSTARTはKINCHAKUのコアプラットフォームと連携していますので、連携のために無駄工数をかける必要がありません。
                                        </p>
                                    </v-card-text>
                                </v-card>
                            </v-expand-transition>
                        </v-flex>
                    </v-layout>
                    <v-layout row fill-height>
                        <v-flex xs12 shrink>
                            <v-list class="indigo lighten-5">
                                <v-list-tile two-line>
                                    <v-list-tile-action>
                                        <v-switch
                                            color="primary"
                                            hide-details
                                            v-model="project.with_cost_manager"
                                        ></v-switch>
                                    </v-list-tile-action>
                                    <v-list-tile-content>
                                        <v-list-tile-title
                                            class="title indigo--text text-capitalize"
                                        >
                                            {{ 'cost manager' | translate }}
                                        </v-list-tile-title>
                                        <v-list-tile-sub-title
                                            class="black--text"
                                            v-if="$root.lang == 'en'"
                                        >
                                            Service for costs planning and management.
                                        </v-list-tile-sub-title>
                                        <v-list-tile-sub-title class="black--text" v-else>
                                            事業の費用管理＆費用の予実分析サービスです。
                                        </v-list-tile-sub-title>
                                    </v-list-tile-content>
                                    <v-list-tile-action>
                                        <v-btn
                                            icon
                                            @click="costManagerExpanded = !costManagerExpanded"
                                        >
                                            <v-icon>help_outline</v-icon>
                                        </v-btn>
                                    </v-list-tile-action>
                                </v-list-tile>
                            </v-list>
                            <v-expand-transition mode="out-in">
                                <v-card flat v-show="costManagerExpanded">
                                    <v-card-text v-if="$root.lang == 'en'">
                                        <p>
                                            You spend a lot of time focusing on the core metrics
                                            surrounding their business growth: monthly recurring
                                            revenue, churn rate, ARPA, etc. These are definitely
                                            useful metrics. However, it’s important to not overlook
                                            the cash flow aspect of your business. Costs are one of
                                            the two factors that impact your cash flow.
                                        </p>
                                        <p class="mb-0">
                                            Cash flow requires a lot of planning and analysis.
                                            Ideally you have — or are planning to have — a CFO or
                                            finance manager who can help create a budget plan, track
                                            and manage cash flow. But if it’s still early days for
                                            your company, that might not be practical or realistic.
                                        </p>
                                    </v-card-text>
                                    <v-card-text v-else>
                                        <p class="mb-0">
                                            MRRやチャーンレート、ARPAといった、ビジネスを成長させるために必要な指標に
                                            漠然と注目するだけでなく、キャッシュフローに影響を与えるコストについても注意を払う必要があります。
                                            キャッシュフローには、多くの計画と分析が必要です。費用予算計画の作成や費用を管理する
                                            CFOや財務マネージャーの肩代わりになるサービスです。
                                        </p>
                                    </v-card-text>
                                </v-card>
                            </v-expand-transition>
                        </v-flex>
                    </v-layout>
                    <v-layout
                        row
                        wrap
                        class="px-3"
                        v-if="trial_available || (trial_project && !current_plan)"
                    >
                        <v-flex xs12 class="pt-0 mt-3">
                            <v-layout row wrap align-center>
                                <v-flex xs12 sm12 md12 class="subheading">
                                    <p class="mb-1">
                                        {{
                                            'You can save your time by selecting a Subscription Plan and adding a Payment Info below. We will automatically activate your Subscription after the Free Trial period ends.'
                                                | translate
                                        }}
                                    </p>
                                    <v-btn
                                        flat
                                        outline
                                        small
                                        color="primary"
                                        @click="expanded = !expanded"
                                        class="my-1 ml-0"
                                    >
                                        <span v-if="expanded">{{ 'close' | translate }}</span>
                                        <span v-else>{{ 'subscription details' | translate }}</span>
                                    </v-btn>
                                </v-flex>
                            </v-layout>
                        </v-flex>
                    </v-layout>
                </v-container>
                <v-expand-transition>
                    <v-container fluid v-if="show_subscribe" class="px-3">
                        <v-divider />
                        <v-layout
                            row
                            wrap
                            v-if="newPlan && newPlan.id && plans.length"
                            class="mt-2"
                        >
                            <v-flex xs12 md6>
                                <h3 class="subheading font-weight-bold text-capitalize px-0">
                                    {{ 'subscription' | translate }}
                                </h3>
                                <div class="mt-2 mb-3">
                                    <label
                                        v-if="!project.subscription"
                                        class="v-label v-label--active
                                        theme--light text-capitalize mr-2"
                                    >
                                        {{ 'choose plan' | translate }}
                                    </label>
                                    <label
                                        v-else
                                        class="v-label v-label--active
                                        theme--light text-capitalize mr-2"
                                    >
                                        {{ 'change plan' | translate }}
                                    </label>
                                    <v-btn-toggle mandatory v-model="newPlanNickname">
                                        <v-btn flat value="Monthly">
                                            {{ 'Monthly' | translate }}
                                        </v-btn>
                                        <v-btn flat value="Yearly">
                                            {{ 'Annual (Save 50%)' | translate }}
                                        </v-btn>
                                    </v-btn-toggle>
                                </div>
                                <div class="teal lighten-5 py-2">
                                    <v-layout align-center justify-center>
                                        <v-flex xs12 class="mb-0">
                                            <p
                                                v-if="monthly_active"
                                                class="text-xs-center headline teal--text my-0 pt-2"
                                            >
                                                {{ monthly_plan.amount | currency('jpy') }} /
                                                {{ 'per month' | translate }}
                                            </p>
                                            <p
                                                v-else
                                                class="text-xs-center headline teal--text my-0 pt-2"
                                            >
                                                {{ yearly_plan.amount | currency('jpy') }} /
                                                {{ 'per year' | translate }}
                                            </p>
                                        </v-flex>
                                    </v-layout>
                                    <v-layout align-center justify-end column>
                                        <v-flex xs12 class="mt-0 mb-2">
                                            <ul style="list-style: none; padding-left: 0;">
                                                <li>
                                                    <v-icon small color="teal">check</v-icon>
                                                    <span class="ml-1">
                                                        {{ 'contact management (CRM)' | translate }}
                                                    </span>
                                                </li>
                                                <li>
                                                    <v-icon small color="teal">check</v-icon>
                                                    <span class="ml-1">
                                                        {{ 'cost management' | translate }}
                                                    </span>
                                                </li>
                                                <li>
                                                    <v-icon small color="teal">check</v-icon>
                                                    <span class="ml-1">
                                                        {{ 'revenue management' | translate }}
                                                    </span>
                                                </li>
                                                <li>
                                                    <v-icon small color="teal">check</v-icon>
                                                    <span class="ml-1">
                                                        {{ 'team collaboration' | translate }}
                                                    </span>
                                                </li>
                                                <li>
                                                    <v-icon small color="teal">check</v-icon>
                                                    <span class="ml-1">
                                                        {{ 'integrations' | translate }}
                                                    </span>
                                                </li>
                                            </ul>
                                        </v-flex>
                                    </v-layout>
                                </div>
                                <v-layout align-space-around justify-space-around column>
                                    <v-flex xs12 class="mt-3">
                                        <h3
                                            class="subheading font-weight-bold text-capitalize my-3 px-0"
                                        >
                                            {{ 'payment method' | translate }}
                                        </h3>
                                        <div v-if="!showCardForm && card_last_four">
                                            <div class="pt-2 left">
                                                <v-icon>credit_card</v-icon>
                                                {{ card_last_four }}
                                            </div>
                                            <v-tooltip max-width="300" bottom>
                                                <v-btn
                                                    class="ma-0 right"
                                                    small
                                                    icon
                                                    @click="showCardForm = true"
                                                    slot="activator"
                                                >
                                                    <v-icon>edit</v-icon>
                                                </v-btn>
                                                <span class="text-capitalize">
                                                    {{ 'update payment method' | translate }}
                                                </span>
                                            </v-tooltip>
                                        </div>
                                        <payment-form
                                            v-else-if="showCardForm || !card_last_four"
                                            ref="paymentForm"
                                            :serverError="paymentFormError"
                                        />
                                    </v-flex>
                                    <v-flex xs12 class="mt-3">
                                        <div class="blue-grey lighten-5 py-1 px-3 my-3">
                                            <v-text-field
                                                v-model="project.coupon"
                                                clearable
                                                class="text-capitalize"
                                                :label="`Enter coupon code` | translate"
                                            />
                                        </div>
                                    </v-flex>
                                </v-layout>
                            </v-flex>
                            <v-flex xs12 md6>
                                <div v-if="!on_grace_period">
                                    <h3
                                        class="subheading font-weight-bold text-capitalize px-0 mb-3 align-center"
                                    >
                                        {{ 'order summary' | translate }}
                                    </h3>
                                    <v-layout row wrap class="primary--text white-in-darkness mt-3">
                                        <v-flex
                                            xs6
                                            md7
                                            class="mb-2 subheading text-uppercase text-xs-right py-0"
                                        >
                                            <span v-if="$root.lang == 'en'">kinchaku core</span>
                                            <span v-else-if="newPlanNickname == 'Monthly'">
                                                料金
                                            </span>
                                            <span v-else-if="newPlanNickname == 'Yearly'">
                                                年額
                                            </span>
                                        </v-flex>
                                        <v-flex
                                            xs6
                                            md5
                                            class="mb-2 subheading text-md-right
                                            py-0"
                                        >
                                            {{ newPlan.amount | currency(newPlan.currency) }}
                                        </v-flex>
                                        <v-flex
                                            xs6
                                            md7
                                            class="mb-2 subheading text-capitalize text-xs-right py-0"
                                        >
                                            {{ 'tax (8%)' | translate }}
                                        </v-flex>
                                        <v-flex xs6 md5 class="mb-2 subheading text-md-right py-0">
                                            {{
                                                (newPlan.amount * 0.08) | currency(newPlan.currency)
                                            }}
                                        </v-flex>
                                        <v-flex
                                            xs6
                                            md7
                                            class="mb-2 subheading font-weight-medium text-xs-right text-uppercase py-0"
                                        >
                                            {{ 'total' | translate }}
                                        </v-flex>
                                        <v-flex
                                            md5
                                            class="mb-2 subheading font-weight-medium text-md-right py-0"
                                        >
                                            {{
                                                (newPlan.amount * 1.08) | currency(newPlan.currency)
                                            }}
                                        </v-flex>
                                    </v-layout>
                                </div>

                                <v-layout column>
                                    <v-flex xs12 v-if="project.subscription">
                                        <div class="progress-bar">
                                            <v-progress-linear
                                                v-if="sending"
                                                color="indigo"
                                                height="5"
                                                class="ma-0"
                                                indeterminate
                                            />
                                        </div>
                                        <div
                                            v-if="newPlan && newPlan.id && plans.length"
                                            class="mt-2"
                                        >
                                            <v-layout align-center justify-center column>
                                                <v-flex xs12>
                                                    <p v-if="!on_grace_period">
                                                        {{
                                                            'Once you cancel your subscription, you will loose access to your projects and their data. You will have three months to reconsider, after that your account will be suspended.'
                                                                | translate
                                                        }}
                                                    </p>
                                                    <div
                                                        v-if="on_grace_period"
                                                        class="pa-0 caption mb-3"
                                                    >
                                                        <p
                                                            class="mb-3 danger--text font-weight-bold"
                                                            v-if="current_plan"
                                                        >
                                                            {{
                                                                'You have cancelled your subscription to the {plan} plan.'
                                                                    | translate({
                                                                        plan: translate(
                                                                            current_plan.nickname
                                                                        ),
                                                                    })
                                                            }}
                                                        </p>
                                                        <p class="mb-1">
                                                            {{
                                                                'The benefits of your subscription will continue until your current billing period ends on {date}. You may resume your subscription at no extra cost until the end of the billing period.'
                                                                    | translate({
                                                                        date: formatDate(
                                                                            project.subscription
                                                                                .ends_at
                                                                        ),
                                                                    })
                                                            }}
                                                        </p>
                                                    </div>
                                                </v-flex>
                                            </v-layout>
                                        </div>
                                        <v-spacer />
                                        <v-tooltip
                                            v-if="on_grace_period"
                                            debounce="300"
                                            max-width="300"
                                            bottom
                                        >
                                            <v-btn
                                                slot="activator"
                                                :disabled="sending"
                                                color="accent"
                                                outline
                                                small
                                                dark
                                                @click="confirmation = 'resumeSubscription'"
                                            >
                                                {{ 'resume' | translate }}
                                            </v-btn>
                                            {{
                                                'Clicking this button will resume your canceled subscription at no cost.'
                                                    | translate
                                            }}
                                        </v-tooltip>
                                        <v-tooltip v-else max-width="200" debounce="300" bottom>
                                            <v-btn
                                                id="btn-cancel-subscription"
                                                slot="activator"
                                                outline
                                                small
                                                :disabled="sending"
                                                color="error"
                                                @click="confirmation = 'cancelSubscription'"
                                                class="ml-0"
                                            >
                                                {{ 'cancel subscription' | translate }}
                                            </v-btn>
                                            {{
                                                'Clicking this button will cancel your current subscription.'
                                                    | translate
                                            }}
                                        </v-tooltip>
                                    </v-flex>
                                </v-layout>
                            </v-flex>
                        </v-layout>

                        <v-layout row wrap v-else-if="project.subscription">
                            <v-flex xs12 md6>
                                <h2 class="subheading font-weight-bold text-capitalize px-0">
                                    {{ 'subscription' | translate }}
                                </h2>
                                <p v-if="!on_grace_period">
                                    {{
                                        'Once you cancel your subscription, you will loose access to your projects and their data. You will have three months to reconsider, after that your account will be suspended.'
                                            | translate
                                    }}
                                </p>
                            </v-flex>
                            <v-flex xs12 md6 class="pa-0">
                                <v-container v-if="on_grace_period" class="pa-3 caption">
                                    <div class="mb-1" v-if="current_plan">
                                        {{
                                            'You have cancelled your subscription to the {plan} plan.'
                                                | translate({
                                                    plan: translate(current_plan.nickname),
                                                })
                                        }}
                                    </div>
                                    <div class="mb-1">
                                        {{
                                            'The benefits of your subscription will continue until your current billing period ends on {date}. You may resume your subscription at no extra cost until the end of the billing period.'
                                                | translate({
                                                    date: formatDate(project.subscription.ends_at),
                                                })
                                        }}
                                    </div>
                                </v-container>
                                <v-card-actions class="ma-0">
                                    <v-tooltip max-width="300" v-if="on_grace_period" bottom>
                                        <v-btn
                                            slot="activator"
                                            :disabled="sending"
                                            color="accent"
                                            dark
                                            @click="confirmation = 'resumeSubscription'"
                                        >
                                            {{ 'resume' | translate }}
                                        </v-btn>
                                        {{
                                            'Clicking this button will resume your canceled subscription at no cost.'
                                                | translate
                                        }}
                                    </v-tooltip>
                                    <v-tooltip max-width="300" v-else bottom>
                                        <v-btn
                                            slot="activator"
                                            id="btn-cancel-subscription"
                                            dark
                                            :disabled="sending"
                                            color="danger"
                                            @click="confirmation = 'cancelSubscription'"
                                        >
                                            {{ 'cancel subscription' | translate }}
                                        </v-btn>
                                        {{
                                            'Clicking this button will cancel your current subscription.'
                                                | translate
                                        }}
                                    </v-tooltip>
                                </v-card-actions>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-expand-transition>
                <v-divider class="mt-2 mx-3" />
                <v-card-actions class="pa-3">
                    <v-spacer />
                    <v-tooltip max-width="300" bottom class="mb-0">
                        <v-btn slot="activator" :disabled="sending" type="submit" color="primary">
                            <span v-if="project.id">{{ 'save' | translate }}</span>
                            <span v-else-if="show_subscribe"> {{ 'submit' | translate }} </span>
                            <span v-else>{{ 'create' | translate }}</span>
                        </v-btn>
                        <span>{{ 'Save your project details.' | translate }}</span>
                    </v-tooltip>
                </v-card-actions>
            </v-form>
            <v-dialog v-if="confirmation" :value="confirmation" persistent max-width="450">
                <v-card>
                    <v-card-title class="headline text-capitalize pt-3 pb-0">
                        <span v-if="confirmation == 'cancelSubscription'">
                            {{ 'Cancel Subscription' | translate }}
                        </span>
                        <span v-else-if="confirmation == 'resumeSubscription'">
                            {{ 'Resume Subscription' | translate }}
                        </span>
                        <span v-else-if="confirmation == 'saveProject'">
                            <span v-if="confirmation_data.direction == 'activate'">
                                {{ 'Create Subscription' | translate }}
                            </span>
                            <span v-else-if="confirmation_data.direction == 'downgrade'">
                                {{ 'Downgrade Subscription' | translate }}
                            </span>
                            <span v-if="confirmation_data.direction == 'upgrade'">
                                {{ 'Update Subscription' | translate }}
                            </span>
                        </span>
                    </v-card-title>
                    <v-card-text v-if="confirmation_data.loading" class="text-center">
                        <spinner />
                    </v-card-text>
                    <v-card-text v-else-if="confirmation == 'cancelSubscription'">
                        {{
                            '{current_plan_name} Plan is non-refundable and can be resumed for free until {current_plan_expiration_date}.'
                                | translate({
                                    current_plan_name: confirmation_data.currentPlanName,
                                    current_plan_expiration_date: formatDate(
                                        confirmation_data.currentPlanExpirationDate,
                                        'YYYY/MM/DD'
                                    ),
                                })
                        }}
                    </v-card-text>
                    <v-card-text v-else-if="confirmation == 'resumeSubscription'">
                        {{
                            'This plan has been canceled on {plan_cancelation_date} but you can resume it until {project_expiry_date}. By doing so the recurring payment as well as the full access to the project will be restored.'
                                | translate({
                                    plan_cancelation_date: formatDate(
                                        confirmation_data.cancelDate,
                                        'YYYY/MM/DD'
                                    ),
                                    project_expiry_date: formatDate(
                                        confirmation_data.expiryDate,
                                        'YYYY/MM/DD'
                                    ),
                                })
                        }}
                    </v-card-text>
                    <v-card-text v-else-if="confirmation == 'saveProject'">
                        <div v-if="confirmation_data.direction == 'activate'">
                            {{
                                '{plan_name} Plan for {price} billed per {billing_cycle}.'
                                    | translate({
                                        plan_name: translate(confirmation_data.plan.nickname),
                                        price: formatCurrency(confirmation_data.plan.amount, 'jpy'),
                                        billing_cycle: translate(confirmation_data.plan.interval),
                                    })
                            }}
                        </div>
                        <div v-else-if="confirmation_data.direction == 'change'">
                            {{
                                '{new_plan_name} plan will be changed on {old_plan_paid_till_date}. Until then your already paid {old_plan_name} plan will remain active. We will change the plan automatically and without any interruption to your work.'
                                    | translate({
                                        new_plan_name: translate(confirmation_data.plan.nickname),
                                        old_plan_paid_till_date: formatDate(
                                            confirmation_data.expiryDate,
                                            'YYYY/MM/DD'
                                        ),
                                        old_plan_name: translate(current_plan.nickname),
                                    })
                            }}
                        </div>
                    </v-card-text>
                    <v-card-actions class="pt-0 pb-3 px-3">
                        <v-spacer />
                        <v-btn flat @click="confirmation = null">
                            {{ 'cancel' | translate }}
                        </v-btn>
                        <v-btn
                            :class="'primary--text'"
                            flat
                            :disabled="confirmation_data.loading"
                            @click="handleConfirmation"
                        >
                            {{ 'confirm' | translate }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-card>
    </div>
</template>
<style lang="scss" scoped>
.align-end-sm-down {
    @media (max-width: 959px) {
        justify-content: center;
    }
}
.theme--dark .white-in-darkness {
    color: #fff !important;
}
</style>
