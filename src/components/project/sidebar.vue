<script>
export default {
    props: ['project'],
    data() {
        return {}
    },
    computed: {
        show_left_drawer: {
            set(val) {
                this.$store.commit('SET_PROJECT_DRAWER', val)
            },
            get() {
                return this.$store.state.projects.drawer
            },
        },
    },
    mounted() {},
    methods: {
        onLeftDrawerClick(evt) {
            evt.preventLeftDraverFold = true
            return evt
        },
    },
}
</script>
<template>
    <div @click="onLeftDrawerClick">
        <v-navigation-drawer
            v-if="project.id"
            mini-variant
            v-model="show_left_drawer"
            mini-variant-width="48"
            width="240"
            absolute
            disable-route-watcher
            :clipped="$vuetify.breakpoint.mdAndUp"
            mobile-break-point="960"
            class="left-drawer"
        >
            <v-list class="pt-0 condenced">
                <v-tooltip max-width="300" right :open-delay="10" :close-delay="100">
                    <v-list-tile
                        slot="activator"
                        exact
                        :to="{ name: 'project', params: { id: project.id } }"
                    >
                        <v-list-tile-action>
                            <v-icon>dashboard</v-icon>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title class="text-capitalize">
                                {{ 'dashboard' | translate }}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <span class="text-capitalize">{{ 'dashboard' | translate }}</span>
                </v-tooltip>

                <v-tooltip
                    v-if="project.with_cost_manager"
                    max-width="300"
                    right
                    :open-delay="10"
                    :close-delay="100"
                >
                    <v-list-tile
                        slot="activator"
                        :to="{
                            name: 'project',
                            params: { id: project.id, view: 'expenses' },
                        }"
                    >
                        <v-list-tile-action>
                            <v-icon>donut_small</v-icon>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title class="text-capitalize">
                                {{ 'expenses' | translate }}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <span class="text-capitalize"> {{ 'cost manager' | translate }} </span>
                </v-tooltip>

                <v-tooltip max-width="300" right :open-delay="10" :close-delay="100">
                    <v-list-tile
                        slot="activator"
                        :to="{
                            name: 'project',
                            params: { id: project.id, view: 'revenue' },
                        }"
                    >
                        <v-list-tile-action>
                            <v-icon>graphic_eq</v-icon>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title class="text-capitalize">
                                {{ 'revenue' | translate }}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <span class="text-capitalize">{{ 'revenue' | translate }}</span>
                </v-tooltip>

                <v-tooltip
                    max-width="300"
                    v-if="$root.dev && project.business_model == 'kickstart'"
                    right
                    :open-delay="10"
                    :close-delay="100"
                >
                    <v-list-tile
                        slot="activator"
                        :to="{
                            name: 'project',
                            params: { id: project.id, view: 'kickstart' },
                        }"
                    >
                        <v-list-tile-action>
                            <div class="center-block" width="28px"><v-icon>pages</v-icon></div>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>KICKSTART</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <span>KICKSTART!</span>
                </v-tooltip>

                <hr class="sidebar-divider" />
                <v-tooltip max-width="300" right :open-delay="10" :close-delay="100">
                    <v-list-tile
                        slot="activator"
                        :to="{
                            name: 'project',
                            params: { id: project.id, view: 'settings' },
                        }"
                    >
                        <v-list-tile-action>
                            <div class="center-block" width="28px"><v-icon>settings</v-icon></div>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title class="text-capitalize">
                                {{ 'settings' | translate }}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <span class="text-capitalize"> {{ 'project settings' | translate }} </span>
                </v-tooltip>
            </v-list>
        </v-navigation-drawer>
    </div>
</template>

<style lang="scss">
.v-list .sidebar-picto {
    display: flex;
    line-height: 28px;
    height: 28px;
    border-radius: 0;
}
.sidebar-divider {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid #d7d8de;
    margin: 0 0;
    padding: 0;
}
.left-drawer .v-list__tile--active {
    background-color: #f5f5f5;
}
</style>
