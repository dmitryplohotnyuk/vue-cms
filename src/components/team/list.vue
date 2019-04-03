<script>
import { mapState, mapActions } from 'vuex'
import formatDateRelative from '@/utils/format-date-relative'

import KConfirm from '@/components/confirm'

export default {
    name: 'TeamsList',
    components: { KConfirm },
    data() {
        return {
            valid: false,
            showConfirm: false,
            showSuccess: false,
            showDeleteSuccess: false,
            showLeftSuccess: false,
            team: {},
            deleteId: false,
            rules: {
                name: [
                    v => !!v || this.$t('Name is required'),
                    v =>
                        (v && v.length <= 16) ||
                        this.$t('The value must be less than or equal {count} characters.', {
                            count: 16,
                        }),
                    v =>
                        (v && v.length >= 2) ||
                        this.$t('The value must be greater than or equal {count} characters.', {
                            count: 2,
                        }),
                ],
            },
        }
    },
    computed: {
        ...mapState({
            user: state => state.account.user,
            teams: state => state.teams.teams,
            joined_teams: state => state.teams.joined_teams,
        }),
    },

    watch: {
        deleteId: function(val) {
            this.showConfirm = !!val
        },
        showConfirm: function(val) {
            if (!val && this.deleteId) {
                this.deleteId = null
            }
        },
    },

    mounted() {
        if (!this.teams.length) {
            this.startLoading()
            this.getTeams()
                .then(() => {
                    this.finishLoading()
                })
                .catch(this._handleError)
        }
        if (!this.joined_teams.length) {
            this.getJoinedTeams().catch(this._handleError)
        }
    },

    tasks(t) {
        return {
            add: t(async function() {
                this.resetError()
                if (!this.$refs.form.validate()) return Promise.resolve(false)
                await this.createTeam(this.team).then(() => {
                    this.getTeams()
                    this.team = {}
                    this.showSuccess = true
                    this.resetValidation()
                })
            }).flow('drop'),
            remove: t(async function() {
                this.resetError()
                if (!this.deleteId) return Promise.resolve(true)
                await this.deleteTeam(this.deleteId).then(() => {
                    this.showConfirm = false
                    this.getTeams()
                    this.showDeleteSuccess = true
                })
            }).flow('drop'),
            leave: t(async function(id) {
                this.resetError()
                if (!id) return Promise.resolve(true)
                await this.teamRemoveMember({ id, member_id: this.user.id }).then(() => {
                    this.getJoinedTeams()
                    this.showLeftSuccess = true
                })
            }).flow('drop'),
        }
    },

    methods: {
        ...mapActions([
            'resetError',
            'createTeam',
            'deleteTeam',
            'getTeams',
            'getJoinedTeams',
            'teamRemoveMember',
            'startLoading',
            'finishLoading',
        ]),
        resetValidation() {
            this.$nextTick(() => {
                this.$refs.form && this.$refs.form.resetValidation()
            })
        },
        _handleError() {
            this.finishLoading()
        },
        relative(date) {
            return formatDateRelative(date, this.$root.lang)
        },
    },
}
</script>

<template>
    <v-container fluid grid-list-lg fill-height class="pa-0">
        <v-layout row wrap>
            <v-flex xs12 md6 offset-md3>
                <v-form novalidate @submit.prevent="add.run()" ref="form">
                    <v-card>
                        <v-card-title primary-title class="px-3 pt-3 pb-0">
                            <h2 class="title font-weight-regular text-capitalize">
                                {{ 'create new team' | translate }}
                            </h2>
                        </v-card-title>
                        <v-container fill-height fluid class="pa-3">
                            <v-layout fill-height>
                                <v-flex xs12 align-end flexbox>
                                    <v-text-field
                                        v-model="team.name"
                                        id="input-team-name"
                                        class="text-capitalize"
                                        :label="'team name' | translate"
                                        :disabled="add.isActive"
                                        :rules="rules.name"
                                    />
                                </v-flex>
                            </v-layout>
                        </v-container>
                        <v-card-actions class="pb-3 px-3 pt-0">
                            <v-spacer />
                            <v-btn
                                flat
                                class="primary"
                                type="submit"
                                :disabled="add.isActive"
                                :loading="add.isActive"
                            >
                                {{ 'create' | translate }}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-form>
                <v-card v-if="teams" class="mt-3">
                    <v-card-title primary-title class="px-3 pt-3 pb-0">
                        <h2 class="title font-weight-regular text-capitalize">
                            {{ 'your teams' | translate }}
                        </h2>
                    </v-card-title>
                    <v-container fill-height fluid class="pa-3">
                        <v-layout fill-height>
                            <v-flex xs12 align-end flexbox>
                                <v-list v-if="teams.length" two-line subheader>
                                    <v-list-tile v-for="team in teams" :key="team.id">
                                        <v-list-tile-avatar>
                                            <v-icon>supervisor_account</v-icon>
                                        </v-list-tile-avatar>
                                        <v-list-tile-content>
                                            <v-list-tile-title>
                                                <router-link :to="`/teams/${team.id}`">
                                                    {{ team.name }}
                                                </router-link>
                                            </v-list-tile-title>
                                            <v-list-tile-sub-title>
                                                {{
                                                    'no members.|{count} member with full access.|{count} members with full access.'
                                                        | translate({ count: team.members_count })
                                                }}
                                                {{
                                                    'no projects, created {daterel}.|{count} project, created {daterel}.|{count} projects, created {daterel}.'
                                                        | translate({
                                                            count: team.projects_count,
                                                            daterel: relative(team.created_at),
                                                        })
                                                }}
                                            </v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <k-confirm
                                                title="Are you sure you want to delete this team?"
                                                question="Members of this team will no longer be able to access any associated projects."
                                                :max-width="500"
                                                @confirm="remove.run()"
                                            >
                                                <v-tooltip slot="button" max-width="300" bottom>
                                                    <v-btn
                                                        flat
                                                        icon
                                                        color="danger"
                                                        :disabled="remove.isActive"
                                                        :loading="
                                                            deleteId == team.id && remove.isActive
                                                        "
                                                        @click="deleteId = team.id"
                                                        id="btn-delete-team"
                                                        slot="activator"
                                                    >
                                                        <v-icon>delete</v-icon>
                                                    </v-btn>
                                                    <span class="text-capitalize">
                                                        {{ 'delete' | translate }}
                                                    </span>
                                                </v-tooltip>
                                            </k-confirm>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                </v-list>
                                <div v-else>
                                    <v-list two-line subheader>
                                        <v-list-tile>
                                            <v-list-tile-content class="py-3">
                                                <p class="grey--text">
                                                    {{
                                                        "You didn't create any team yet" | translate
                                                    }}
                                                </p>
                                            </v-list-tile-content>
                                        </v-list-tile>
                                    </v-list>
                                </div>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card>
                <v-card v-if="joined_teams.length" class="mt-3">
                    <v-card-title primary-title class="px-3 pt-3 pb-0">
                        <h2 class="title font-weight-regular text-capitalize">
                            {{ 'joined teams' | translate }}
                        </h2>
                    </v-card-title>
                    <v-container fill-height fluid class="pa-3">
                        <v-layout fill-height>
                            <v-flex xs12 align-end flexbox>
                                <v-list v-if="joined_teams.length" two-line subheader>
                                    <v-list-tile v-for="team in joined_teams" :key="team.id">
                                        <v-list-tile-avatar>
                                            <v-icon>supervisor_account</v-icon>
                                        </v-list-tile-avatar>
                                        <v-list-tile-content>
                                            <v-list-tile-title>
                                                <router-link :to="`/teams/${team.id}`">
                                                    {{ team.name }}
                                                </router-link>
                                            </v-list-tile-title>
                                            <v-list-tile-sub-title>
                                                {{
                                                    'no members.|{count} member with full access.|{count} members with full access.'
                                                        | translate({ count: team.members_count })
                                                }}
                                                {{
                                                    'no projects, created {daterel}.|{count} project, created {daterel}.|{count} projects, created {daterel}.'
                                                        | translate({
                                                            count: team.projects_count,
                                                            daterel: relative(team.created_at),
                                                        })
                                                }}
                                            </v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <k-confirm
                                                title="Leave the team?"
                                                question="You will no longer have access to teams projects."
                                                :max-width="500"
                                                :danger="false"
                                                @confirm="leave.run(team.id)"
                                            >
                                                <v-tooltip slot="button" max-width="300" bottom>
                                                    <v-btn
                                                        flat
                                                        icon
                                                        slot="activator"
                                                        color="danger"
                                                        :disabled="leave.isActive"
                                                        :loading="leave.isActive"
                                                    >
                                                        <v-icon>exit_to_app</v-icon>
                                                    </v-btn>
                                                    <span class="text-capitalize">
                                                        {{ 'leave the team' | translate }}
                                                    </span>
                                                </v-tooltip>
                                            </k-confirm>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                </v-list>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card>
            </v-flex>
        </v-layout>
        <v-snackbar v-model="showSuccess">
            <span>{{ 'Team created successfully' | translate }}</span>
        </v-snackbar>
        <v-snackbar v-model="showDeleteSuccess">
            <span>{{ 'Team deleted successfully' | translate }}</span>
        </v-snackbar>
        <v-snackbar v-model="showLeftSuccess">
            <span>{{ 'Team left successfully' | translate }}</span>
        </v-snackbar>
    </v-container>
</template>
