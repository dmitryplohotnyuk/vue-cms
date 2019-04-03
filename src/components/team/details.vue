<script>
import { mapState, mapActions } from 'vuex'

export default {
    name: 'TeamDetails',

    props: {
        id: {
            type: String,
        },
    },

    data() {
        return {
            sending: false,
            project: null,
            email: null,
            searchTerm: null,
            showProjectAddSuccess: false,
            showProjectRemoveSuccess: false,
            showMemberAddSuccess: false,
            showMemberRemoveSuccess: false,
        }
    },

    computed: {
        ...mapState({
            user: state => state.account.user,
            team: state => state.teams.team,
            projects: state => state.projects.list,
        }),
        isOwner() {
            return this.team.user_id == this.user.id
        },
    },

    watch: {
        searchTerm(val) {
            if (!val) {
                this.project = null
            } else {
                this.project = this.projects.find(p => {
                    return p.title == val
                })
            }
        },
    },

    mounted() {
        if (!this.id) return this.$router.push({ name: 404 })
        if (this.id != this.team.id) {
            this.startLoading()
            this.getTeam(this.id)
                .then(() => {
                    this.finishLoading()
                })
                .catch(this._handleError)
        }
        if (!this.projects.length) {
            this.getProjects().catch(this._handleError)
        }
    },

    methods: {
        ...mapActions([
            'resetError',
            'getTeams',
            'getTeam',
            'getProjects',
            'teamAddProject',
            'teamRemoveProject',
            'teamAddMember',
            'teamRemoveMember',
            'startLoading',
            'finishLoading',
        ]),
        _handleError() {
            this.sending = false
            this.finishLoading()
        },

        tryToAddProject() {
            if (!this.project || !this.project.id) return
            this.sending = true
            this.resetError()

            return this.teamAddProject({ id: this.id, project_id: this.project.id })
                .then(() => {
                    this.getTeams()
                    this.getTeam(this.id)
                    this.project = null
                    this.searchTerm = ''
                    this.sending = false
                    this.showProjectAddSuccess = true
                })
                .catch(this._handleError)
        },
        removeProject(id) {
            this.sending = true
            this.resetError()

            return this.teamRemoveProject({ id: this.id, project_id: id })
                .then(() => {
                    this.sending = false
                    this.getTeams()
                    this.getTeam(this.id)
                    this.showProjectRemoveSuccess = true
                })
                .catch(this._handleError)
        },

        tryToAddMember() {
            if (!this.email) return
            this.sending = true
            this.resetError()

            return this.teamAddMember({ id: this.id, email: this.email })
                .then(() => {
                    this.getTeams()
                    this.getTeam(this.id)
                    this.email = null
                    this.sending = false
                    this.showMemberAddSuccess = true
                })
                .catch(this._handleError)
        },
        removeMember(id) {
            this.sending = true
            this.resetError()

            return this.teamRemoveMember({ id: this.id, member_id: id })
                .then(() => {
                    this.sending = false
                    this.getTeams()
                    this.getTeam(this.id)
                    this.showMemberRemoveSuccess = true
                })
                .catch(this._handleError)
        },

        noop() {},
    },
}
</script>

<template>
    <v-layout row wrap align-start justify-center>
        <v-flex xs12 sm10 md8>
            <v-card v-if="team.id">
                <div class="progress-bar">
                    <v-progress-linear
                        v-if="sending"
                        color="indigo"
                        height="5"
                        class="ma-0"
                        indeterminate
                    />
                </div>
                <v-card-title primary-title class="px-3 pt-3 pb-0">
                    <h2 class="title font-weight-regular text-capitalize">
                        {{ team.name }} {{ 'team' | translate }}
                        <v-icon v-if="team.user_id != user.id" class="ml-2 primary--text">
                            supervisor_account
                        </v-icon>
                    </h2>
                </v-card-title>
                <v-container class="pa-3">
                    <v-layout row wrap>
                        <v-flex md12 lg6>
                            <v-list v-if="team.members.length" subheader dense>
                                <v-subheader class="text-capitalize">
                                    {{ 'members' | translate }}
                                </v-subheader>

                                <v-list-tile v-for="member in team.members" :key="member.id">
                                    <v-list-tile-avatar>
                                        <v-icon>account_circle</v-icon>
                                    </v-list-tile-avatar>

                                    <v-list-tile-content>
                                        <v-list-tile-title>{{ member.name }}</v-list-tile-title>
                                    </v-list-tile-content>

                                    <v-btn
                                        v-if="isOwner"
                                        class="secondary--text hover-show"
                                        id="btn-revoke-member"
                                        icon
                                        flat
                                        small
                                        :disabled="sending"
                                        @click="removeMember(member.id)"
                                    >
                                        <v-tooltip max-width="300" bottom>
                                            <v-icon slot="activator">delete</v-icon>
                                            <span class="text-capitalize">
                                                {{ 'revoke member access' | translate }}
                                            </span>
                                        </v-tooltip>
                                    </v-btn>
                                </v-list-tile>
                            </v-list>
                            <div v-else>
                                <div class="note-block tip">
                                    {{ 'No members in this team.' | translate }}
                                </div>
                            </div>
                            <form novalidate @submit.prevent="tryToAddMember">
                                <v-container fluid class="pa-0">
                                    <v-layout row wrap>
                                        <v-flex md12 lg6 xl6>
                                            <v-text-field
                                                v-model="email"
                                                id="input-email"
                                                class="text-capitalize"
                                                :label="'email' | translate"
                                                type="email"
                                                :disabled="sending"
                                            />
                                        </v-flex>
                                        <v-flex md12 lg6 xl6>
                                            <v-btn
                                                flat
                                                id="btn-add-email"
                                                class="primary mt-3"
                                                type="submit"
                                                :disabled="sending"
                                            >
                                                {{ 'invite member' | translate }}
                                            </v-btn>
                                        </v-flex>
                                    </v-layout>
                                </v-container>
                            </form>
                        </v-flex>
                        <v-flex md12 lg6>
                            <v-list v-if="team.projects.length" subheader dense>
                                <v-subheader class="text-capitalize">
                                    {{ 'projects' | translate }}
                                </v-subheader>

                                <v-list-tile v-for="project in team.projects" :key="project.id">
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
                                    </v-list-tile-content>

                                    <v-btn
                                        v-if="isOwner"
                                        class="secondary--text hover-show"
                                        id="btn-remove-project"
                                        icon
                                        flat
                                        small
                                        :disabled="sending"
                                        @click="removeProject(project.id)"
                                    >
                                        <v-tooltip max-width="300" bottom>
                                            <v-icon slot="activator">delete</v-icon>
                                            <span class="text-capitalize">
                                                {{ 'remove project from this team' | translate }}
                                            </span>
                                        </v-tooltip>
                                    </v-btn>
                                </v-list-tile>
                            </v-list>
                            <div v-else>
                                <div class="note-block tip">
                                    {{ 'This team is not assigned to any projects.' | translate }}
                                </div>
                            </div>
                            <form v-if="isOwner" novalidate @submit.prevent="noop">
                                <v-container fluid class="pa-0">
                                    <v-layout row wrap>
                                        <v-flex xs12 sm8 lg8>
                                            <v-autocomplete
                                                v-model="searchTerm"
                                                dense
                                                id="input-team-project-name"
                                                class="text-capitalize"
                                                :label="'project' | translate"
                                                :items="projects"
                                                item-text="title"
                                            />
                                        </v-flex>
                                        <v-flex xs12 sm4 lg4>
                                            <v-btn
                                                flat
                                                id="btn-add-project"
                                                class="primary mt-3"
                                                :disabled="sending"
                                                @click="tryToAddProject"
                                            >
                                                {{ 'add' | translate }}
                                            </v-btn>
                                        </v-flex>
                                    </v-layout>
                                </v-container>
                            </form>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card>
        </v-flex>
        <v-snackbar v-model="showProjectAddSuccess">
            <span>{{ 'Project added successfully' | translate }}</span>
        </v-snackbar>
        <v-snackbar v-model="showProjectRemoveSuccess">
            <span>{{ 'Project removed successfully' | translate }}</span>
        </v-snackbar>
        <v-snackbar v-model="showMemberAddSuccess">
            <span>{{ 'Member added successfully' | translate }}</span>
        </v-snackbar>
        <v-snackbar v-model="showMemberRemoveSuccess">
            <span>{{ 'Member removed successfully' | translate }}</span>
        </v-snackbar>
    </v-layout>
</template>
