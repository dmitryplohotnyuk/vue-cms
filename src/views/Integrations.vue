<script>
import appConfig from '@/app.config'
import { mapState, mapActions } from 'vuex'
import { sortBy } from 'lodash'

// import IntegrationWebhook from '@/components/integration/webhook'
import IntegrationStripe from '@/components/integration/stripe'
import IntegrationMailchimp from '@/components/integration/mailchimp'
import KDialog from '@/components/dialog'
import KConfirm from '@/components/confirm'

export default {
    components: { KDialog, KConfirm, IntegrationStripe, IntegrationMailchimp },
    props: {
        service: {
            type: String,
        },
        op: {
            type: String,
        },
    },
    page() {
        return this.$root.lang == 'ja' ? this.metaJA : this.metaEN
    },
    data() {
        return {
            metaJA: {
                title: 'インテグレーション',
                meta: [{ name: 'description', content: appConfig.descriptionJA }],
            },
            metaEN: {
                title: 'Integrations',
                meta: [{ name: 'description', content: appConfig.description }],
            },
            showWebhook: false,
            showStripe: false,
            showMailchimp: false,
            generateConfirm: false,
            sending: false,
            showIntegrationSaved: false,
            showIntegrationDisabled: false,
            showIntegrationDeleted: false,
            showMailchimpSuccess: false,
            showFreeeCode: false,
            freeeAuthCode: null,
            showFreeeBalance: false,
        }
    },
    computed: {
        ...mapState({
            user: state => state.account.user,
            integrations: state => state.integrations.list,
            projects: state => state.projects.list,
        }),
        webhook() {
            return this.integrations.find(i => i.service == 'webhook')
        },
        api_enabled() {
            return this.integrations.find(i => i.service == 'api')
        },
        incoming_url() {
            return window.location.host + '/webhook/incoming'
        },
        social() {
            return this.integrations.filter(i => i.service == 'google' || i.service == 'microsoft')
        },
        stripe() {
            return this.integrations.find(i => i.service == 'stripe')
        },
        stripe_project() {
            return this.projects.find(p => p.id == this.stripe.project)
        },
        stripe_incoming_url() {
            return 'https://' + window.location.host + '/api/webhook/stripe/' + this.stripe.key
        },
        mailchimp() {
            return this.integrations.find(i => i.service == 'mailchimp')
        },
        freee() {
            return this.integrations.find(i => i.service == 'freee')
        },
        freee_user_balance() {
            return sortBy(this.freee.user.balance, 'walletable_balance').reverse()
        },
        failed_integrations() {
            return this.integrations.filter(i => i.status != 'success')
        },
    },

    watch: {
        $route: 'checkRoute',
        showFreeeCode: function(val) {
            if (!val) {
                this.freeeAuthCode = null
            }
        },
    },

    created() {
        this.checkRoute()
    },

    mounted() {
        if (!this.integrations.length) {
            this.startLoading()
            this.getIntegrations()
                .then(this.finishLoading)
                .catch(this._handleError)
        }
    },
    methods: {
        ...mapActions([
            'resetError',
            'getIntegrations',
            'sendTestWebhook',
            'disableWebhook',
            'startLoading',
            'finishLoading',
            'removeIntegration',
            'generateAPIKey',
            'importMailchimp',
            'updateFreee',
            'oauthGet',
            'oauthPost',
            'synchronizeGoogleContacts',
        ]),

        checkRoute() {
            //     this.resetError()
            //     switch (this.service) {
            //         case 'freee':
            //             if (!this.op) {
            //                 this.sending = true
            //                 this.oauthGet(this.service)
            //                     .then(({ url }) => {
            //                         var win = window.open(url, '_blank')
            //                         win.focus()
            //                         this.showFreeeCode = true
            //                         // window.setTimeout(() => {
            //                         //     this.redirect = url
            //                         // }, 5000)
            //                         // window.location = url
            //                     })
            //                     .catch(this._handleError)
            //             } else if (this.op == 'callback') {
            //                 this.sending = true
            //                 var params = this.$route.query
            //                 this.oauthPost({ params, service: this.service })
            //                     .then(result => {
            //                         console.log('oauthPost result', result)
            //                     })
            //                     .catch(this._handleError)
            //             }
            //             break
            //     }
        },

        _handleError() {
            this.sending = false
            this.finishLoading()
        },
        onStripeSave() {
            this.showStripe = false
            this.getIntegrations()
            this.showIntegrationSaved = true
        },
        onDeleteIntegration(id) {
            this.removeIntegration(id)
                .then(this.getIntegrations)
                .catch(this._handleError)
            this.showIntegrationDeleted = true
        },
        onDisableWebhook() {
            this.disableWebhook()
            this.webhook.enabled = false
            this.showIntegrationDisabled = true
        },
        onMailchimpImport() {
            this.importMailchimp().then(() => {
                this.showMailchimpSuccess = true
            })
        },
        getCode() {
            var win = window.open()
            this.oauthGet('freee')
                .then(({ url }) => {
                    win.location = url
                    try {
                        win.focus()
                        this.showFreeeCode = true
                    } catch (e) {
                        alert(
                            this.$t(
                                'Pop-up Blocker is enabled! Please add this site to your exception list.'
                            )
                        )
                    }
                })
                .catch(this._handleError)
        },
        sendCode() {
            this.oauthPost({ params: { code: this.freeeAuthCode }, service: 'freee' })
                .then(() => {
                    this.showFreeeCode = false
                    this.startLoading()
                    this.getIntegrations()
                        .then(this.finishLoading)
                        .catch(this._handleError)
                })
                .catch(this._handleError)
        },
    },
}
</script>

<template>
    <Layout>
        <div transition="fadeIn">
            <v-toolbar
                class="mb-3 v-toolbar__content--nopadding px-3"
                :class="{ 'blue-grey lighten-5': !$root.dark }"
                flat
            >
                <v-toolbar-title>
                    <div class="text-capitalize">
                        <span>{{ 'integrations' | translate }}</span>
                    </div>
                </v-toolbar-title>
            </v-toolbar>

            <transition name="fade" appear>
                <v-container grid-list-lg fill-height class="pa-0">
                    <v-layout row wrap align-start justify-center>
                        <v-flex v-if="failed_integrations.length" xs12 sm10 md11 lg10>
                            <v-alert
                                dismissible
                                outline
                                dense
                                small
                                class="pa-1"
                                :value="true"
                                type="warning"
                                v-for="failed in failed_integrations"
                                :key="failed.id"
                            >
                                <span class="text-capitalize">{{ failed.service }}</span
                                >: {{ failed.error || 'last import was unsuccessful.' | translate }}
                            </v-alert>
                        </v-flex>

                        <v-flex xs12 sm10 md11 lg10>
                            <v-card>
                                <v-list two-line class="pa-0 integrations_list">
                                    <v-list-group>
                                        <v-list-tile slot="activator">
                                            <v-list-tile-action>
                                                <v-icon
                                                    size="30"
                                                    class="ml-1"
                                                    :color="api_enabled ? 'success' : 'gray'"
                                                >
                                                    power_settings_new
                                                </v-icon>
                                            </v-list-tile-action>
                                            <v-list-tile-content>
                                                <v-list-tile-title
                                                    class="subheading font-weight-medium text-capitalize"
                                                >
                                                    {{ 'incoming webhook' | translate }}
                                                </v-list-tile-title>
                                                <v-list-tile-sub-title class="hidden-sm-and-down">
                                                    <div v-if="$root.lang == 'en'">
                                                        <p class="mb-0">
                                                            Incoming webhook lets you receive data
                                                            when an event occurs in another service
                                                            that supports webhooks.
                                                        </p>
                                                    </div>
                                                    <div v-else>
                                                        <p class="mb-0">
                                                            受信用ウェブフックは外部サービスからKINCHAKUにデータを送信するための機能です。
                                                        </p>
                                                    </div>
                                                </v-list-tile-sub-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-chip
                                                    v-if="api_enabled"
                                                    small
                                                    outline
                                                    :color="
                                                        api_enabled.status == 'success'
                                                            ? 'success'
                                                            : 'danger'
                                                    "
                                                    :title="api_enabled.last_updated_at"
                                                >
                                                    <span v-if="api_enabled.last_updated_at">
                                                        {{ api_enabled.last_updated_at | relative }}
                                                    </span>
                                                    <span v-else>{{ 'N/A' | translate }}</span>
                                                </v-chip>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <div class="pa-4">
                                            <div v-if="$root.lang == 'en'" class="mb-3">
                                                Currently <em>Incoming Webhook</em> accepts only
                                                <em>Contact</em> data which is stored in your
                                                account's CRM.<br />
                                                Please refer to
                                                <a
                                                    href="https://manual.kinchaku.com/article/38-incoming-webhook"
                                                    target="_blank"
                                                    title="Incoming webhook"
                                                >
                                                    manual page</a
                                                >
                                                to see what data <em>Incoming Webhook</em> can
                                                accept.
                                            </div>
                                            <div v-else class="mb-3">
                                                現在は、連絡先データのみを受信するように設計されています。
                                                ウェブフック仕様については
                                                <a
                                                    href="https://manual.kinchaku.com/article/38-incoming-webhook"
                                                    target="_blank"
                                                    title="受信ウェブフック"
                                                >
                                                    マニュアル</a
                                                >を参考にしてください。
                                            </div>
                                            <v-layout
                                                row
                                                wrap
                                                align-start
                                                justify-center
                                                class="mb-3"
                                                v-if="api_enabled"
                                            >
                                                <v-flex xs12 sm10 md7 lg5>
                                                    <v-text-field
                                                        prepend-icon="vpn_key"
                                                        single-line
                                                        readonly
                                                        hide-details
                                                        outline
                                                        :value="api_enabled.key"
                                                    />
                                                </v-flex>
                                            </v-layout>
                                            <div>
                                                <v-btn
                                                    v-if="!api_enabled"
                                                    color="primary"
                                                    outline
                                                    flat
                                                    small
                                                    @click="generateAPIKey"
                                                    class="ml-0"
                                                >
                                                    <v-icon small class="mr-1">power</v-icon>
                                                    {{ 'enable' | translate }}
                                                </v-btn>
                                                <k-confirm
                                                    v-else
                                                    title="Disable integration"
                                                    question="Are you sure?"
                                                    :max-width="500"
                                                    @confirm="onDeleteIntegration(api_enabled.id)"
                                                >
                                                    <v-btn
                                                        slot="button"
                                                        flat
                                                        outline
                                                        small
                                                        color="danger"
                                                        class="ml-0"
                                                    >
                                                        <v-icon small class="mr-1"
                                                            >delete_forever</v-icon
                                                        >
                                                        {{ 'disable' | translate }}
                                                    </v-btn>
                                                </k-confirm>
                                                <k-confirm
                                                    v-if="api_enabled"
                                                    title="Re-generate API key?"
                                                    question="Generating new API key will disable previously generated Key. Are you sure?"
                                                    :max-width="500"
                                                    @confirm="generateAPIKey"
                                                    :danger="false"
                                                >
                                                    <v-btn
                                                        slot="button"
                                                        color="primary"
                                                        outline
                                                        small
                                                        class="white-text ml-0"
                                                    >
                                                        <v-icon small class="mr-1">refresh</v-icon>
                                                        {{ 'regenerate' | translate }}
                                                    </v-btn>
                                                </k-confirm>
                                            </div>
                                        </div>
                                    </v-list-group>
                                    <v-list-group>
                                        <v-list-tile slot="activator">
                                            <v-list-tile-action>
                                                <v-icon
                                                    size="30"
                                                    class="ml-1"
                                                    :color="stripe ? 'success' : 'gray'"
                                                >
                                                    power_settings_new
                                                </v-icon>
                                            </v-list-tile-action>
                                            <v-list-tile-content>
                                                <v-list-tile-title
                                                    class="subheading font-weight-medium"
                                                >
                                                    Stripe
                                                </v-list-tile-title>
                                                <v-list-tile-sub-title class="hidden-sm-and-down">
                                                    <div v-if="$root.lang == 'en'">
                                                        <p class="mb-0">
                                                            Stripe integration syncronizes your
                                                            billing and customer data with records
                                                            in KINCHAKU.
                                                        </p>
                                                    </div>
                                                    <div v-else>
                                                        <p class="mb-0">
                                                            Stripeで回収した売上や顧客のサブスクリプション情報を自動でKINCHAKUに取り込むことができます。
                                                        </p>
                                                    </div>
                                                </v-list-tile-sub-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-chip
                                                    v-if="stripe"
                                                    class="mr-1"
                                                    small
                                                    outline
                                                    :color="stripe ? 'success' : 'gray'"
                                                    :title="stripe.last_updated_at"
                                                    ><span v-if="stripe.last_updated_at">{{
                                                        stripe.last_updated_at | relative
                                                    }}</span
                                                    ><span v-else>{{
                                                        'N/A' | translate
                                                    }}</span></v-chip
                                                >
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <v-container grid-list-l fluid class="pa-4">
                                            <v-layout row>
                                                <v-flex hidden-sm-and-down md2>
                                                    <a href="https://stripe.com" target="_blank">
                                                        <img
                                                            src="@/assets/images/stripe_logo.svg"
                                                            alt="Stripe"
                                                            style="height: 40px"
                                                        />
                                                    </a>
                                                </v-flex>
                                                <v-flex xs12 md10 class="pl-2 pa-0">
                                                    <div v-if="!stripe">
                                                        <div v-if="$root.lang == 'en'">
                                                            <p>
                                                                Stripe is a full online payment
                                                                infrastructure that makes it easy to
                                                                start accepting payments online.
                                                            </p>
                                                            <p>
                                                                This integration will automate
                                                                Stripe event data processing, to
                                                                make sure your
                                                                <em>Project Revenue</em> and
                                                                customer records are always up to
                                                                date.
                                                            </p>
                                                        </div>
                                                        <div v-else>
                                                            <p class="mb-3">
                                                                Stripeはインターネットビジネスのためのソフトウェアプラットフォームです。
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div v-else>
                                                        URL: {{ stripe_incoming_url }}
                                                        <p
                                                            class="mb-0"
                                                            v-html="
                                                                $t(
                                                                    'Data will be imported into <strong>{project}</strong> project.',
                                                                    {
                                                                        project:
                                                                            stripe_project.title,
                                                                    }
                                                                )
                                                            "
                                                        ></p>
                                                    </div>
                                                    <div>
                                                        <k-confirm
                                                            v-if="stripe"
                                                            title="Disable integration"
                                                            question="Are you sure?"
                                                            :max-width="500"
                                                            @confirm="
                                                                onDeleteIntegration(stripe.id)
                                                            "
                                                        >
                                                            <v-btn
                                                                slot="button"
                                                                flat
                                                                outline
                                                                small
                                                                color="danger"
                                                                class="ml-0"
                                                            >
                                                                <v-icon small class="mr-1"
                                                                    >delete_forever</v-icon
                                                                >
                                                                {{ 'disable' | translate }}
                                                            </v-btn>
                                                        </k-confirm>
                                                        <v-btn
                                                            v-if="stripe"
                                                            flat
                                                            outline
                                                            small
                                                            @click="showStripe = true"
                                                            color="primary"
                                                            class="ml-0"
                                                        >
                                                            <v-icon small class="mr-1"
                                                                >settings</v-icon
                                                            >
                                                            {{ 'settings' | translate }}
                                                        </v-btn>
                                                        <v-btn
                                                            v-else
                                                            @click="showStripe = true"
                                                            outline
                                                            small
                                                            color="indigo"
                                                            class="ml-0"
                                                        >
                                                            <v-icon small class="mr-1"
                                                                >power</v-icon
                                                            >
                                                            {{ 'enable' | translate }}
                                                        </v-btn>
                                                    </div>
                                                </v-flex>
                                            </v-layout>
                                        </v-container>

                                        <k-dialog lazy persistent v-model="showStripe" width="600">
                                            <integration-stripe
                                                v-if="showStripe"
                                                :data="stripe"
                                                @close="showStripe = false"
                                                @saved="onStripeSave"
                                            />
                                        </k-dialog>
                                    </v-list-group>
                                    <v-list-group>
                                        <v-list-tile slot="activator">
                                            <v-list-tile-action>
                                                <v-icon
                                                    size="30"
                                                    class="ml-1"
                                                    :color="freee ? 'success' : 'gray'"
                                                >
                                                    power_settings_new
                                                </v-icon>
                                            </v-list-tile-action>
                                            <v-list-tile-content>
                                                <v-list-tile-title
                                                    class="subheading font-weight-medium"
                                                >
                                                    Freee
                                                </v-list-tile-title>
                                                <v-list-tile-sub-title class="hidden-sm-and-down">
                                                    <div v-if="$root.lang == 'en'">
                                                        <p class="mb-0">
                                                            Freee integration automates processing
                                                            of costs and revenue related accounting
                                                            data.
                                                        </p>
                                                    </div>
                                                    <div v-else>
                                                        <p class="mb-0">
                                                            このインテグレーションにより、事業の売上や費用データの処理を自動化ができます。
                                                        </p>
                                                    </div>
                                                </v-list-tile-sub-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-chip
                                                    v-if="freee"
                                                    class="mr-1"
                                                    small
                                                    outline
                                                    :color="
                                                        freee.status == 'success'
                                                            ? 'success'
                                                            : 'danger'
                                                    "
                                                    :title="freee.last_updated_at"
                                                >
                                                    <span v-if="freee.last_updated_at">
                                                        {{ freee.last_updated_at | relative }}
                                                    </span>
                                                    <span v-else>{{ 'N/A' | translate }}</span>
                                                </v-chip>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <v-container fluid class="pa-4">
                                            <v-layout row>
                                                <v-flex hidden-sm-and-down md2>
                                                    <a
                                                        href="https://www.freee.co.jp"
                                                        target="_blank"
                                                    >
                                                        <img
                                                            src="@/assets/images/freee_logo.svg"
                                                            alt="Freee"
                                                            style="height: 40px;"
                                                        />
                                                    </a>
                                                </v-flex>
                                                <v-flex xs12 md10 class="pl-2 pa-0">
                                                    <div v-if="$root.lang == 'en'">
                                                        <p>
                                                            Freee is a popular cloud accounting
                                                            service in Japan.
                                                        </p>
                                                    </div>
                                                    <div v-else>
                                                        <p class="mb-3">
                                                            Freeeは、中小企業の会計を自動化と経理業務の時間を削減するクラウド会計ソフトです。
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <k-confirm
                                                            v-if="freee"
                                                            title="Disable Freee integration?"
                                                            question="Are you sure?"
                                                            :max-width="500"
                                                            @confirm="onDeleteIntegration(freee.id)"
                                                        >
                                                            <v-btn
                                                                slot="button"
                                                                flat
                                                                outline
                                                                small
                                                                color="danger"
                                                                class="ml-0"
                                                            >
                                                                <v-icon small class="mr-1"
                                                                    >delete_forever</v-icon
                                                                >
                                                                {{ 'disable' | translate }}
                                                            </v-btn>
                                                        </k-confirm>
                                                        <v-btn
                                                            v-if="!freee"
                                                            flat
                                                            outline
                                                            small
                                                            color="primary"
                                                            class="ml-0"
                                                            @click="getCode"
                                                            :disabled="sending"
                                                        >
                                                            <v-icon small class="mr-1"
                                                                >power</v-icon
                                                            >
                                                            <span>{{ 'enable' | translate }}</span>
                                                        </v-btn>
                                                        <v-btn
                                                            v-if="freee"
                                                            flat
                                                            outline
                                                            small
                                                            color="teal"
                                                            class="ml-0"
                                                            @click="updateFreee"
                                                        >
                                                            <v-icon small class="mr-1">sync</v-icon>
                                                            {{ 'import' | translate }}
                                                        </v-btn>
                                                    </div>
                                                </v-flex>
                                            </v-layout>
                                        </v-container>
                                    </v-list-group>
                                    <v-list-group>
                                        <v-list-tile slot="activator">
                                            <v-list-tile-action>
                                                <v-icon
                                                    size="30"
                                                    class="ml-1"
                                                    :color="mailchimp ? 'success' : 'gray'"
                                                >
                                                    power_settings_new
                                                </v-icon>
                                            </v-list-tile-action>
                                            <v-list-tile-content>
                                                <v-list-tile-title
                                                    class="subheading font-weight-medium"
                                                >
                                                    Mailchimp
                                                </v-list-tile-title>
                                                <v-list-tile-sub-title class="hidden-sm-and-down">
                                                    <div v-if="$root.lang == 'en'">
                                                        <p class="mb-0">
                                                            Mailchimp integration automates import
                                                            of list contacts into KINCHAKU CRM.
                                                        </p>
                                                    </div>
                                                    <div v-else>
                                                        <p class="mb-0">
                                                            このインテグレーションにより、MailChimpの連絡先リストからKINCHAKU
                                                            CRMへのインポートを自動化します。
                                                        </p>
                                                    </div>
                                                </v-list-tile-sub-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-chip
                                                    v-if="mailchimp"
                                                    class="mr-1"
                                                    small
                                                    outline
                                                    :color="
                                                        mailchimp.status == 'success'
                                                            ? 'success'
                                                            : 'danger'
                                                    "
                                                    :title="mailchimp.last_updated_at"
                                                    ><span v-if="mailchimp.last_updated_at">{{
                                                        mailchimp.last_updated_at | relative
                                                    }}</span
                                                    ><span v-else>{{
                                                        'N/A' | translate
                                                    }}</span></v-chip
                                                >
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <v-container fluid class="pa-4">
                                            <v-layout row>
                                                <v-flex hidden-sm-and-down md2>
                                                    <a href="https://mailchimp.com" target="_blank">
                                                        <img
                                                            v-if="$vuetify.breakpoint.smAndUp"
                                                            src="@/assets/images/mailchimp_logo.svg"
                                                            alt="Mailchimp"
                                                            style="height: 28px;"
                                                        />
                                                    </a>
                                                </v-flex>
                                                <v-flex xs12 md10 class="pl-2 pa-0">
                                                    <div v-if="$root.lang == 'en'">
                                                        <p>
                                                            MailChimp is an online email marketing
                                                            service for managing contacts, sending
                                                            emails, and tracking results of your
                                                            email campaigns.
                                                        </p>
                                                    </div>
                                                    <div v-else>
                                                        <p class="mb-3">
                                                            MailChimpは連絡先の管理、Eメールの送信、メルマガキャンペーンを行うためのクラウドマーケティングサービスです。
                                                        </p>
                                                    </div>
                                                    <div class="grow">
                                                        <k-confirm
                                                            v-if="mailchimp"
                                                            title="Disable integration"
                                                            question="Are you sure?"
                                                            :max-width="500"
                                                            @confirm="
                                                                onDeleteIntegration(mailchimp.id)
                                                            "
                                                        >
                                                            <v-btn
                                                                slot="button"
                                                                flat
                                                                outline
                                                                small
                                                                color="danger"
                                                                class="ml-0"
                                                            >
                                                                <v-icon small class="mr-1"
                                                                    >delete_forever</v-icon
                                                                >
                                                                <span>
                                                                    {{ 'disable' | translate }}
                                                                </span>
                                                            </v-btn>
                                                        </k-confirm>
                                                        <v-tooltip
                                                            v-if="mailchimp"
                                                            max-width="300"
                                                            bottom
                                                        >
                                                            <v-btn
                                                                slot="activator"
                                                                flat
                                                                outline
                                                                small
                                                                color="teal"
                                                                @click="onMailchimpImport"
                                                            >
                                                                <v-icon small class="mr-1"
                                                                    >sync</v-icon
                                                                >
                                                                {{ 'import' | translate }}
                                                            </v-btn>
                                                            <span class="text-capitalize">
                                                                {{ 'import contacts' | translate }}
                                                            </span>
                                                        </v-tooltip>
                                                        <v-btn
                                                            v-if="mailchimp"
                                                            flat
                                                            outline
                                                            small
                                                            @click="showMailchimp = true"
                                                            color="primary"
                                                        >
                                                            <v-icon small class="mr-1"
                                                                >settings</v-icon
                                                            >
                                                            {{ 'settings' | translate }}
                                                        </v-btn>
                                                        <v-btn
                                                            v-else
                                                            @click="showMailchimp = true"
                                                            flat
                                                            small
                                                            outline
                                                            color="primary"
                                                            class="ml-0"
                                                        >
                                                            <v-icon small class="mr-1"
                                                                >power</v-icon
                                                            >
                                                            {{ 'enable' | translate }}
                                                        </v-btn>
                                                    </div>
                                                </v-flex>
                                            </v-layout>
                                        </v-container>
                                        <v-snackbar
                                            v-if="showMailchimpSuccess"
                                            v-model="showMailchimpSuccess"
                                        >
                                            {{
                                                'Mailchimp contacts import is in progress.'
                                                    | translate
                                            }}
                                        </v-snackbar>
                                        <k-dialog
                                            lazy
                                            persistent
                                            v-model="showMailchimp"
                                            width="600"
                                        >
                                            <integration-mailchimp
                                                v-if="showMailchimp"
                                                :data="mailchimp"
                                                @close="showMailchimp = false"
                                                @saved="showMailchimp = false"
                                            />
                                        </k-dialog>
                                    </v-list-group>

                                    <v-list-group v-for="service in social" :key="service.id">
                                        <v-list-tile slot="activator">
                                            <v-list-tile-action>
                                                <v-icon
                                                    size="30"
                                                    class="ml-1"
                                                    :color="service ? 'success' : 'gray'"
                                                >
                                                    power_settings_new
                                                </v-icon>
                                            </v-list-tile-action>
                                            <v-list-tile-content>
                                                <v-list-tile-title
                                                    class="subheading font-weight-medium text-capitalize"
                                                >
                                                    {{ service.service }}
                                                </v-list-tile-title>
                                                <v-list-tile-sub-title class="hidden-sm-and-down">
                                                    <div v-if="$root.lang == 'en'">
                                                        <p class="mb-0">
                                                            This integration imports contacts into
                                                            KINCHAKU CRM.
                                                        </p>
                                                    </div>
                                                    <div v-else>
                                                        <p class="mb-0">
                                                            連絡先情報をKINCHAKU
                                                            CRMにインポートするためのインテグレーションです。
                                                        </p>
                                                    </div>
                                                </v-list-tile-sub-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-chip
                                                    v-if="mailchimp"
                                                    class="mr-1"
                                                    small
                                                    outline
                                                    :color="
                                                        mailchimp.status == 'success'
                                                            ? 'success'
                                                            : 'danger'
                                                    "
                                                    :title="mailchimp.last_updated_at"
                                                    ><span v-if="mailchimp.last_updated_at">{{
                                                        mailchimp.last_updated_at | relative
                                                    }}</span
                                                    ><span v-else>{{
                                                        'N/A' | translate
                                                    }}</span></v-chip
                                                >
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <v-container grid-list-l fluid class="pa-4">
                                            <v-layout row>
                                                <v-flex hidden-sm-and-down md2>
                                                    <div v-if="service.service == 'microsoft'">
                                                        <a
                                                            href="https://login.live.com"
                                                            target="_blank"
                                                            title="Microsoft"
                                                        >
                                                            <img
                                                                src="@/assets/images/microsoft_full_logo.svg"
                                                                alt="Microsoft"
                                                                style="height: 24px"
                                                            />
                                                        </a>
                                                    </div>
                                                    <div v-else-if="service.service == 'google'">
                                                        <a
                                                            href="https://accounts.google.com"
                                                            target="_blank"
                                                            title="Google"
                                                        >
                                                            <img
                                                                src="@/assets/images/google_full_logo.svg"
                                                                alt="Google"
                                                                style="height: 24px"
                                                            />
                                                        </a>
                                                    </div>
                                                </v-flex>
                                                <v-flex xs12 md10 class="pl-2 pa-0">
                                                    <div class="grow">
                                                        <v-img
                                                            v-if="service.user.avatar"
                                                            :src="service.user.avatar"
                                                            height="80px"
                                                            contain
                                                        />
                                                        <p class="title">{{ service.user.name }}</p>
                                                        <p>{{ service.user.email }}</p>

                                                        <v-btn
                                                            @click="onDeleteIntegration(service.id)"
                                                            flat
                                                            outline
                                                            small
                                                            color="danger"
                                                            class="ml-0"
                                                        >
                                                            <v-icon small class="mr-1"
                                                                >delete_forever</v-icon
                                                            >
                                                            <span>
                                                                {{ 'disable' | translate }}
                                                            </span>
                                                        </v-btn>

                                                        <v-btn
                                                            v-if="service.service == 'google'"
                                                            flat
                                                            outline
                                                            small
                                                            color="danger"
                                                            class="ml-0"
                                                            @click="synchronizeGoogleContacts"
                                                        >
                                                            <v-icon small class="mr-1">sync</v-icon>
                                                            <span>{{ 'Synchronize contacts' }}</span>
                                                        </v-btn>
                                                    </div>
                                                </v-flex>
                                            </v-layout>
                                        </v-container>
                                    </v-list-group>
                                </v-list>
                            </v-card>
                        </v-flex>

                        <!--v-flex xs12 md6>
                            <k-dialog lazy persistent v-model="showWebhook" width="600">
                                <integration-webhook
                                    v-if="showWebhook"
                                    :data="webhook"
                                    @close="showWebhook = false"
                                    @saved="showWebhook = false"
                                />
                            </k-dialog>
                            <v-card height="100%" class="flexcard">
                                <v-card-title>
                                    <span class="title font-weight-regular text-capitalize pb-0">
                                        {{ 'outgoing webhook details' | translate }}
                                    </span>
                                    <v-spacer />
                                    <v-menu open-on-hover max-width="300">
                                        <v-btn slot="activator" flat small icon class="ma-0">
                                            <v-icon>help</v-icon>
                                        </v-btn>
                                        <v-card>
                                            <v-card-text>
                                                {{
                                                    'We will notify your application about changes on our side.'
                                                        | translate
                                                }}
                                            </v-card-text>
                                        </v-card>
                                    </v-menu>
                                </v-card-title>
                                <v-card-text v-if="webhook" class="grow">
                                    URL: <strong>{{ webhook.url }}</strong
                                    ><br />
                                    {{ 'Events' | translate }}:
                                    <strong class="text-capitalize">{{ 'all' | translate }}</strong>
                                </v-card-text>
                                <v-card-text v-else class="grow"></v-card-text>
                                <v-divider />
                                <v-card-actions class="pa-2 px-3">
                                    <v-spacer />
                                    <v-btn
                                        v-if="webhook && webhook.enabled"
                                        flat
                                        @click="sendTestWebhook"
                                        >{{ 'send test webhook' | translate }}</v-btn
                                    >
                                    <v-btn
                                        v-if="webhook && webhook.enabled"
                                        flat
                                        @click="onDisableWebhook"
                                        >{{ 'disable' | translate }}</v-btn
                                    >
                                    <v-btn
                                        v-else-if="webhook && !webhook.enabled"
                                        flat
                                        @click="
                                            disableWebhook(false)
                                            webhook.enabled = true
                                        "
                                        >{{ 'enable' | translate }}</v-btn
                                    >
                                    <v-btn v-if="webhook" flat @click="showWebhook = true">
                                        {{ 'update' | translate }}
                                    </v-btn>
                                    <v-btn v-else @click="showWebhook = true" flat>
                                        {{ 'enable' | translate }}
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-flex-->
                    </v-layout>
                </v-container>
            </transition>
            <v-snackbar v-model="showIntegrationSaved">
                {{ 'Integration details saved successfully!' | translate }}
            </v-snackbar>
            <v-snackbar v-model="showIntegrationDisabled">
                {{ 'Integration disabled!' | translate }}
            </v-snackbar>
            <v-snackbar v-model="showIntegrationDeleted">
                {{ 'Integration was disabled.' | translate }}
            </v-snackbar>
            <k-dialog v-model="showFreeeCode" persistent lazy max-width="600">
                <v-card>
                    <v-card-title class="title font-weight-regular pb-0">
                        <span>{{ 'Enter authorization code' | translate }}</span>
                        <v-spacer />
                        <v-btn flat small icon @click="showFreeeCode = false" class="ma-0">
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-card-text>
                        <v-text-field
                            :label="'authorization code' | translate"
                            required
                            v-model="freeeAuthCode"
                            append-icon="lock"
                            class="text-capitalize"
                        />
                    </v-card-text>
                    <v-card-actions class="px-3 pt-0 pb-3">
                        <v-spacer />
                        <v-btn @click="sendCode" color="primary" flat>
                            {{ 'save' | translate }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </k-dialog>
        </div>
    </Layout>
</template>

<style type="text/css">
.integrations_list .v-list__tile {
    padding-right: 0;
}
</style>
