<script>
import appConfig from '@/app.config'
import TeamsList from '@/components/team/list'
import TeamDetails from '@/components/team/details'

export default {
    components: { TeamsList, TeamDetails },
    props: {
        teamDeleted: {
            type: Boolean,
            required: false,
            default: false,
        },
        id: {
            type: String,
        },
    },
    page() {
        return this.$root.lang == 'ja' ? this.metaJA : this.metaEN
    },
    data() {
        return {
            metaJA: {
                title: 'チーム',
                meta: [{ name: 'description', content: appConfig.descriptionJA }],
            },
            metaEN: {
                title: 'Teams',
                meta: [{ name: 'description', content: appConfig.description }],
            },
            showTeamDeleted: false,
        }
    },
    computed: {
        user() {
            return this.$store.state.account.user
        },
    },
    mounted() {
        this.showTeamDeleted = this.teamDeleted
    },
    methods: {},
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
                <router-link v-if="id" to="/teams" class="hidden-xs-only">
                    <v-tooltip max-width="300" bottom v-if="id">
                        <v-btn icon slot="activator">
                            <v-icon>arrow_back</v-icon>
                        </v-btn>
                        <span class="text-capitalize">{{ 'contact list' | translate }}</span>
                    </v-tooltip>
                </router-link>
                <v-toolbar-title class="text-capitalize">
                    {{ 'teams' | translate }}
                </v-toolbar-title>
                <v-spacer />
            </v-toolbar>
            <transition name="fade" appear>
                <div class="mt-3">
                    <teams-list v-if="!id" />
                    <team-details v-else :id="id" />
                </div>
            </transition>
        </div>

        <v-snackbar v-model="showTeamDeleted">
            <span>{{ 'Team deleted successfully' | translate }}</span>
        </v-snackbar>
    </Layout>
</template>
