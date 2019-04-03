<script>
import appConfig from '@/app.config'
import { mapState, mapActions } from 'vuex'
import { sortBy } from 'lodash'

import EmptyState from '@/components/empty'
import Notifications from '@/components/notifications'

export default {
    components: {
        EmptyState,
        Notifications,
    },
    props: {
        projectCreated: {
            type: Boolean,
            required: false,
            default: false,
        },
        projectDeleted: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    page() {
        return this.$root.lang == 'ja' ? this.metaJA : this.metaEN
    },
    data: function() {
        return {
            metaJA: {
                title: 'ダッシュボード',
                meta: [{ name: 'description', content: appConfig.descriptionJA }],
            },
            metaEN: {
                title: 'Dashboard',
                meta: [{ name: 'description', content: appConfig.description }],
            },
            showDialog: false,
            showNotification: false,
            showDeleted: false,
        }
    },
    computed: {
        ...mapState({
            user: state => state.account.user,
            projects: state => state.projects.list,
            team_projects: state => state.projects.team_projects,
            integrations: state => state.integrations.list,
        }),
        hasPayment() {
            return this.user.card_last_four
        },
        showTrialMessage() {
            return !this.user.on_trial && !this.projects.length
        },

        freee() {
            return this.integrations.find(i => i.service == 'freee')
        },

        freee_user_balance() {
            return sortBy(this.freee.user.balance, 'walletable_balance').reverse()
        },
    },
    mounted() {
        this.showNotification = this.projectCreated
        this.showDeleted = this.projectDeleted
        if (!this.projects.length) {
            this.startLoading()
            this.getProjects().then(() => {
                this.finishLoading()
            })
        }
        if (!this.integrations.length) {
            this.getIntegrations()
        }
        this.$store.commit('SET_CURRENT_PROJECT', null)
    },
    methods: {
        ...mapActions(['startLoading', 'finishLoading', 'getProjects', 'getIntegrations']),
    },
}
</script>

<template>
    <Layout>
        <v-container v-if="projects.length || team_projects.length" fluid class="pa-3" grid-list-lg>
            <v-layout row wrap align-start justify-center>
                <v-flex xs12 sm12 md6 lg6 xl6>
                    <v-list two-line subheader class="elevation-1 pt-2" style="position: relative">
                        <v-subheader class="headline text-capitalize mt-1">
                            {{ 'projects' | translate }}
                        </v-subheader>
                        <div class="list-buttons">
                            <v-btn to="/project/create" color="primary" class="right ma-0">
                                {{ 'create project' | translate }}
                            </v-btn>
                        </div>
                        <v-list-tile v-for="project in projects" :key="project.id">
                            <v-list-tile-avatar><v-icon>inbox</v-icon></v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title>
                                    <router-link
                                        :to="{
                                            name: 'project',
                                            params: { id: project.id },
                                        }"
                                    >
                                        {{ project.title }}
                                    </router-link>
                                </v-list-tile-title>
                                <v-list-tile-sub-title>
                                    {{ project.start_date | format('YYYY/MM') }}
                                </v-list-tile-sub-title>
                            </v-list-tile-content>
                            <v-btn
                                class="secondary--text hover-show mx-0"
                                flat
                                icon
                                :to="{
                                    name: 'project',
                                    params: { id: project.id, view: 'settings' },
                                }"
                            >
                                <v-tooltip max-width="300" bottom>
                                    <v-icon slot="activator">settings</v-icon>
                                    <span class="text-capitalize">
                                        {{ 'project settings' | translate }}
                                    </span>
                                </v-tooltip>
                            </v-btn>
                        </v-list-tile>
                        <v-list-tile v-if="!projects.length">
                            <v-list-tile-avatar><v-icon>inbox</v-icon></v-list-tile-avatar>
                            <v-list-tile-title>
                                {{ "You don't have any projects yet" | translate }}
                            </v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                    <v-list
                        v-if="team_projects.length"
                        two-line
                        subheader
                        class="elevation-1 mt-3 pt-2"
                    >
                        <v-subheader class="headline text-capitalize mt-1">
                            {{ 'team projects' | translate }}
                        </v-subheader>
                        <v-list-tile v-for="project in team_projects" :key="project.id">
                            <v-list-tile-avatar><v-icon>inbox</v-icon></v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title>
                                    <router-link
                                        :to="{
                                            name: 'project',
                                            params: { id: project.id },
                                        }"
                                    >
                                        {{ project.title }}
                                    </router-link>
                                </v-list-tile-title>
                                <v-list-tile-sub-title>
                                    {{ project.start_date | format('YYYY/MM') }}
                                </v-list-tile-sub-title>
                            </v-list-tile-content>
                            <v-btn
                                flat
                                icon
                                class="secondary--text hover-show mx-0"
                                :to="{
                                    name: 'project',
                                    params: { id: project.id, view: 'settings' },
                                }"
                            >
                                <v-tooltip max-width="300" bottom>
                                    <v-icon slot="activator">settings</v-icon>
                                    <span class="text-capitalize">
                                        {{ 'project settings' | translate }}
                                    </span>
                                </v-tooltip>
                            </v-btn>
                        </v-list-tile>
                    </v-list>
                </v-flex>
                <v-flex xs12 md6 lg4 xl4 align-end>
                    <notifications />
                    <v-card v-if="freee" class="mt-3">
                        <v-subheader class="headline text-capitalize mt-1">
                            {{ 'Freee account balance' | translate }}
                            <v-chip
                                small
                                outline
                                :color="freee.status == 'success' ? 'success' : 'danger'"
                                :title="freee.last_updated_at"
                            >
                                <span v-if="freee.last_updated_at">
                                    {{ freee.last_updated_at | relative }}
                                </span>
                                <span v-else>{{ 'N/A' | translate }}</span>
                            </v-chip>
                        </v-subheader>
                        <v-card-text>
                            <ul>
                                <li v-for="company in freee.user.companies" :key="company.id">
                                    {{ company.name }}
                                    <ul v-if="freee.user.balance">
                                        <li v-for="balance in freee_user_balance" :key="balance.id">
                                            {{ balance.name }}:
                                            {{ balance.walletable_balance | currency('jpy') }}
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
        <div v-else>
            <v-container v-if="showTrialMessage" fluid class="px-0 py-3">
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-card color="accent" class="white--text text-xs-left mx-3">
                            <v-card-text class="pa-2">
                                <v-layout row class="pa-0 direction-column-xs">
                                    <v-flex shrink class="pa-2">
                                        <div v-if="$root.lang == 'en'">
                                            <p>
                                                Start your 30days FREE TRIAL to drive online
                                                business growth and create more profitable customer
                                                relationships.
                                            </p>
                                            <p class="mb-0">
                                                Maximize your project revenue with a smarter cost
                                                management
                                            </p>
                                        </div>
                                        <div v-else>
                                            <p>
                                                オンラインビジネスの成長を促進し、より収益性の高い顧客との関係を築くために、30日間の無料トライアルを始めよう
                                            </p>
                                            <p class="mb-0">
                                                よりスマートなコスト管理でプロジェクトの収益を最大化します。
                                            </p>
                                        </div>
                                    </v-flex>
                                    <v-flex shrink class="pa-2">
                                        <div v-if="$root.lang == 'en'">
                                            <p>
                                                Power up your business intelligence with metrics,
                                                forecasting, and engagement tools without custom
                                                code or professional services.
                                            </p>
                                        </div>
                                        <div v-else>
                                            <p>
                                                カスタムコードや専門的なサービスなしで、メトリクス、予測、およびエンゲージメントツールを使用してビジネスインテリジェンスを強化しましょう。
                                            </p>
                                        </div>
                                    </v-flex>
                                    <v-flex
                                        class="pa-2 text-xs-center text-sm-right"
                                        align-self-center
                                    >
                                        <v-btn
                                            id="btn-create-project"
                                            to="/project/create"
                                            color="white"
                                            class="accent--text ma-0"
                                            dark
                                        >
                                            {{ 'start free trial' | translate }}
                                        </v-btn>
                                    </v-flex>
                                </v-layout>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
            <v-container text-xs-center class="pa-3">
                <v-layout row wrap align-start justify-center>
                    <v-flex xs12 sm8 md5>
                        <empty-state title="start a project">
                            <p v-if="$root.lang == 'en'" class="text-left">
                                Project is a container of several analytical and intelligence tools
                                focusing on the same business model. <br />
                                Use projects to forecast and calculate the impact of your online
                                business decisions and whether your business is growing or shrinking
                                and how quickly it does it.
                            </p>
                            <p v-else class="text-left">
                                プロジェクトは事業、あるいはサービスごとに作成が可能です。
                            </p>
                            <div slot="action" v-if="!showTrialMessage">
                                <v-btn
                                    id="btn-create-project"
                                    to="/project/create"
                                    color="primary"
                                    dark
                                    class="text-capitalize"
                                >
                                    {{ 'create project' | translate }}
                                </v-btn>
                            </div>
                        </empty-state>
                    </v-flex>
                </v-layout>
            </v-container>
        </div>

        <v-snackbar v-model="showNotification" :timeout="4000">
            {{ 'Project created successfully!' | translate }}
        </v-snackbar>
        <v-snackbar v-model="showDeleted" :timeout="4000">
            {{ 'Project deleted!' | translate }}
        </v-snackbar>
    </Layout>
</template>

<style lang="scss" scoped>
.list-buttons {
    position: absolute;
    top: 16px;
    right: 16px;
}
.direction-column-xs {
    @media (max-width: 599px) {
        flex-direction: column;
    }
}
</style>
