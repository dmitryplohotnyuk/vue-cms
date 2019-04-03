<script>
/*global Beacon:true*/
import { mapState } from 'vuex'
export default {
    data() {
        return {
            beaconIntervalId: null,
        }
    },
    computed: {
        ...mapState({
            user: state => state.account.user,
            own_projects: state => state.projects.list,
            team_projects: state => state.projects.team_projects,
            current_project: state => state.projects.current,
        }),
        projects() {
            return this.team_projects.length
                ? [
                      { header: this.$t('Own Projects') },
                      ...this.own_projects,
                      { divider: true },
                      { header: this.$t('Team Projects') },
                      ...this.team_projects,
                  ]
                : this.own_projects
        },
        signedIn() {
            return this.user && this.user.email
        },
        languageClass() {
            return this.$root.lang === 'en' ? 'flag-icon-jp' : 'flag-icon-gb'
        },
        showMenu() {
            return this.$vuetify.breakpoint.smAndDown && this.$router.currentRoute.name == 'project'
        },
        project: {
            set(value) {
                this.$nextTick(() => {
                    if (!value) {
                        return this.$router.push('/')
                    }
                    this.$router.push({
                        name: 'project',
                        params: {
                            id: value,
                        },
                    })
                })
            },
            get() {
                return this.current_project ? this.current_project.id : null
            },
        },
        isProjectsSelectorVisible() {
            return this.$route.name !== 'dashboard'
        },
    },
    mounted() {
        if (this.signedIn && !this.team_projects.length) {
            this.$store.dispatch('getTeamProjects')
        }
        if (typeof window == 'undefined' || this.$root.dev) {
            return
        }
        // restore link to beacon trigger from global variable if present
        if (!window.___isBeaconCustomized) {
            this.beaconIntervalId = setInterval(() => this.initBeacon(), 300)
        }
    },
    methods: {
        // Hides Beacon button
        initBeacon() {
            if (this.$root.dev) {
                return
            }
            // init only once
            if (window.___isBeaconCustomized) {
                return
            }
            const containerEl = document.querySelector('#beacon-container')
            if (!containerEl) {
                return
            }
            const btnEl = containerEl.querySelector('#HSBeaconFabButton')
            if (!btnEl) {
                return
            }
            btnEl.style.visibility = 'hidden'
            if (typeof window !== 'undefined') {
                window.___isBeaconCustomized = true
            }
            clearInterval(this.beaconIntervalId)
            this.beaconIntervalId = null
        },
        toggleBeacon() {
            if (typeof Beacon !== 'undefined') {
                const { user } = this
                if (user && user.email) {
                    Beacon('identify', {
                        name: user.name,
                        email: user.email,
                    })
                } else {
                    Beacon('logout')
                }
                Beacon('toggle')
            }
        },
        showDrawer() {
            this.$store.commit('SET_PROJECT_DRAWER', true)
        },
    },
}
</script>

<template>
    <v-toolbar
        :extended="user.trial_ended"
        color="primary"
        dark
        :clipped-left="$vuetify.breakpoint.mdAndUp"
        height="50"
        extension-height="28"
    >
        <v-toolbar-side-icon @click.stop="showDrawer" v-if="showMenu" />
        <!-- <v-toolbar-title class="ml-0 pl-0" min-width="300"> -->
        <router-link
            to="/"
            class="mr-3 display-1 font-weight-medium logo"
            :class="[$vuetify.breakpoint.mdAndUp ? 'display-1' : 'headline']"
        >
            KINCHAKU
        </router-link>
        <v-flex v-if="isProjectsSelectorVisible" shrink>
            <v-autocomplete
                v-if="signedIn"
                v-model="project"
                dense
                single-line
                class="text-capitalize hidden-sm-and-down project-selector"
                :items="projects"
                :label="'Select project' | translate"
                :menu-props="{ auto: true, overflowX: true, maxWidth: 500 }"
                item-text="title"
                item-value="id"
                full-width
                height="50px"
                style="max-width: 400px"
            />
        </v-flex>
        <!-- <template
              slot="item"
              slot-scope="data"
            >
              <template v-if="typeof data.item !== 'object'">
                <v-list-tile-content v-text="data.item"></v-list-tile-content>
              </template>
              <template v-else>
                <v-list-tile-avatar>
                  <img :src="data.item.avatar">
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                  <v-list-tile-sub-title v-html="data.item.group"></v-list-tile-sub-title>
                </v-list-tile-content>
              </template>
            </template>
        </v-autocomplete> -->
        <!-- </v-toolbar-title> -->

        <v-spacer />

        <v-toolbar-items v-if="signedIn">
            <v-tooltip max-width="300" bottom class="hidden-xs-only">
                <v-btn slot="activator" flat to="/contacts"><v-icon>import_contacts</v-icon></v-btn>
                <span class="text-capitalize">{{ 'contacts' | translate }}</span>
            </v-tooltip>
            <v-tooltip max-width="300" bottom class="hidden-xs-only">
                <v-btn slot="activator" flat to="/products"><v-icon>blur_linear</v-icon></v-btn>
                <span class="text-capitalize">{{ 'products' | translate }}</span>
            </v-tooltip>

            <v-tooltip max-width="300" bottom>
                <v-btn slot="activator" flat @click="toggleBeacon">
                    <v-icon>live_help</v-icon>
                </v-btn>
                <span class="text-capitalize">{{ 'help' | translate }}</span>
            </v-tooltip>

            <!--
                <v-btn dense class="hidden-xs-only" flat :to="$root.localeLink('/')">
                    <v-tooltip max-width="300" bottom>
                        <v-icon slot="activator">dashboard</v-icon>
                        <span>{{ 'List of all projects in Dashboard view.' | translate }}</span>
                    </v-tooltip>
                </v-btn>
            -->
            <v-menu :dark="$root.dark" lazy offset-y v-if="$root.dev">
                <v-btn slot="activator" flat><v-icon>language</v-icon></v-btn>

                <v-list class="py-0">
                    <v-list-tile
                        slot="default"
                        @click="$emit('language', 'en')"
                        :inactive="$root.lang == 'en'"
                        :class="{ 'language--active': $root.lang == 'en' }"
                    >
                        <v-list-tile-avatar><i class="flag-icon flag-icon-gb"/></v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-title>English</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile
                        @click="$emit('language', 'ja')"
                        :inactive="$root.lang == 'ja'"
                        :class="{ 'language--active': $root.lang == 'ja' }"
                    >
                        <v-list-tile-avatar><i class="flag-icon flag-icon-jp"/></v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-title>日本語</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-menu>
            <v-menu :dark="$root.dark" offset-y offset-x min-width="170" max-height="300">
                <v-btn slot="activator" flat>
                    <span>{{ user.name || user.email }}</span>
                    <v-icon class="rot-90">chevron_right</v-icon>
                </v-btn>
                <v-list>
                    <v-list-tile to="/account">
                        <v-icon>account_box</v-icon>
                        &nbsp;&nbsp;
                        <span class="text-capitalize">{{ 'account' | translate }}</span>
                    </v-list-tile>
                    <v-list-tile to="/billing">
                        <v-icon>account_balance_wallet</v-icon>
                        &nbsp;&nbsp;
                        <span class="text-capitalize">{{ 'billing' | translate }}</span>
                    </v-list-tile>
                    <v-list-tile to="/teams">
                        <v-icon>supervisor_account</v-icon>
                        &nbsp;&nbsp; <span class="text-capitalize">{{ 'teams' | translate }}</span>
                    </v-list-tile>
                    <v-list-tile to="/integrations">
                        <v-icon>import_export</v-icon>
                        &nbsp;&nbsp;
                        <span class="text-capitalize">{{ 'integrations' | translate }}</span>
                    </v-list-tile>
                    <v-list-tile to="/products" class="hidden-sm-and-up">
                        <v-icon>blur_linear</v-icon>
                        &nbsp;&nbsp; <span>{{ 'Products Manager' | translate }}</span>
                    </v-list-tile>
                    <v-list-tile to="/contacts" class="hidden-sm-and-up">
                        <v-icon>perm_identity</v-icon>
                        &nbsp;&nbsp;
                        <span class="text-capitalize">{{ 'contacts' | translate }}</span>
                    </v-list-tile>
                    <v-list-tile to="/signout">
                        <v-icon>exit_to_app</v-icon>
                        &nbsp;&nbsp;
                        <span class="text-capitalize">{{ 'sign out' | translate }}</span>
                    </v-list-tile>
                </v-list>
            </v-menu>
        </v-toolbar-items>
        <v-toolbar-items v-else>
            <v-tooltip max-width="300" bottom>
                <v-btn slot="activator" flat @click="toggleBeacon">
                    <v-icon>live_help</v-icon>
                </v-btn>
                <span>{{ 'help' | translate }}</span>
            </v-tooltip>
            <v-btn :to="$root.localeLink('/signin')" flat>
                <v-icon>lock_outline</v-icon>
                {{ 'sign in' | translate }}
            </v-btn>
        </v-toolbar-items>
        <v-alert
            v-if="user.trial_ended"
            slot="extension"
            class="pa-0 px-3 mt-2 text-center"
            :value="true"
            color="warning"
        >
            <router-link to="/billing">{{
                'Your free Trial has ended. To keep working on your project please choose one of our Plans.'
                    | translate
            }}</router-link>
        </v-alert>
    </v-toolbar>
</template>

<style type="text/css" scoped>
.v-toolbar__extension .v-alert {
    width: 100%;
    position: inherit;
}
.v-alert a {
    color: white;
    text-decoration: underline;
}
.logo {
    color: white !important;
}
</style>
