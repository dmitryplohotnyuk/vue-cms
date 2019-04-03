<script>
import appConfig from '@/app.config'
import { mapState, mapActions, mapGetters } from 'vuex'

import Revenue from '@/components/cost/revenue'
import Expenses from '@/components/cost/expenses'

import ProjectDetails from '@/components/project/details'
import ProjectSettings from '@/components/project/settings'
import ProjectSidebar from '@/components/project/sidebar'

import Cms from '@/components/cms/home'

import GrossProfitWidgetEditor from '@/components/project/widgets/grossProfitWidgetEditor'
import ProjectWidget from '@/components/project/widgets/widget'
import { getWidget, deleteWidget, saveWidget } from '@/utils/widgets'

export default {
    components: {
        ProjectDetails,
        ProjectSettings,
        ProjectSidebar,
        Revenue,
        Expenses,
        Cms,
        GrossProfitWidgetEditor,
        ProjectWidget,
    },
    name: 'project',
    props: {
        id: {
            type: String,
        },
        view: {
            type: String,
            default: 'details',
        },
        subview: {
            type: String,
            default: '',
        },
        projectCreated: {
            type: Boolean,
            required: false,
            default: false,
        },
        entity: {
            required: false,
        },
    },
    page() {
        return this.$root.lang == 'ja' ? this.metaJA : this.metaEN
    },
    data() {
        return {
            metaJA: {
                title: 'プロジェクト概要',
                meta: [{ name: 'description', content: appConfig.descriptionJA }],
            },
            metaEN: {
                title: 'Project Details',
                meta: [{ name: 'description', content: appConfig.description }],
            },
            showProjectCreated: false,
            showModelCreated: false,
            cost: null,
            firstTime: true,
            scrollOffset: 0,
            isLeftDrawerMini: true,
            widgetEditorModalMode: null,
            widget: null,
            widgetInitialCosts: null,
        }
    },
    watch: {
        $route: 'checkRoute',
    },
    computed: {
        ...mapState({
            user: state => state.account.user,
            project: state => state.projects.current,
            widgetsSettings: state => state.projects.widgetsSettings,
        }),
        ...mapGetters(['is_widget_enabled']),
        project_length() {
            return this.$t('|one month|{count} months', { count: this.project.duration })
        },
    },
    mounted() {
        if (!this.id) return this.$router.push({ name: 404 })
        if (this.id != this.project.id) {
            this.startLoading()
            this.getProject(this.id)
                .then(() => {
                    this.finishLoading()
                })
                .catch(this._handleError)
        } else {
            this.finishLoading()
        }
        this.checkRoute()
        this.showProjectCreated = this.projectCreated
        this.widget = getWidget('gross-profit-margin', this.id)
        this.getWidgetsSettings(this.id)
    },

    methods: {
        ...mapActions([
            'resetError',
            'getProject',
            'startLoading',
            'finishLoading',
            'setWidgetsSettings',
            'getWidgetsSettings',
        ]),
        _handleError(error) {
            this.finishLoading()
            if (error == 404) {
                return this.$router.push({ name: 404 })
            }
        },
        checkRoute() {},
        onScroll() {
            this.scrollOffset = window.pageYOffset || document.documentElement.scrollTop
        },
        handleWidgetChange(widget, widgetName) {
            this.widgetEditorModalMode = null
            if (widgetName === 'gross-profit-margin') {
                this.widget = widget
            }
        },
        deleteWidget(name) {
            deleteWidget(name, this.id)
            this.widget = getWidget('gross-profit-margin', this.id)
        },
        toggleWidget(name) {
            if (getWidget(name, this.id)) {
                saveWidget({
                    ...this.widget,
                    enabled: !this.widget.enabled,
                })
                this.widget = getWidget(name, this.id)
            } else {
                this.widgetEditorModalMode = name
            }
        },
        toggleProjectWidget(name) {
            const widget = this.widgetsSettings[name] || {}
            const widgetsSettings = {
                [name]: {
                    ...widget,
                    enabled: !widget.enabled,
                },
            }
            this.setWidgetsSettings({ widgetsSettings, projectId: this.id })
        },
    },
}
</script>

<template>
    <Layout v-scroll="onScroll">
        <v-layout fill-height>
            <project-sidebar :project="project" />

            <v-flex v-if="project.id">
                <div :class="{ lgMargin: $vuetify.breakpoint.mdAndUp }">
                    <div v-if="view == 'details' || !view" transition="fadeIn" class="pa-0">
                        <div v-if="project.id">
                            <v-layout row wrap align-center>
                                <v-flex>
                                    <v-toolbar
                                        :class="{ 'blue-grey lighten-5': !$root.dark }"
                                        class="mb-0 v-toolbar__content--nopadding px-3"
                                        flat
                                    >
                                        <v-toolbar-title class="text-capitalize">
                                            {{ 'project dashboard' | translate }}
                                        </v-toolbar-title>
                                        <v-spacer />
                                        <v-tooltip bottom>
                                            <v-menu
                                                :dark="$root.dark"
                                                lazy
                                                nudge-left="250"
                                                offset-x
                                                offset-y
                                                slot="activator"
                                            >
                                                <v-btn
                                                    icon
                                                    dense
                                                    flat
                                                    outline
                                                    ripple
                                                    slot="activator"
                                                    class="my-0 ml-0"
                                                >
                                                    <v-icon>widgets</v-icon>
                                                </v-btn>

                                                <v-card>
                                                    <v-list class="widget-menu py-0">
                                                        <v-list-tile
                                                            @click="
                                                                toggleWidget('gross-profit-margin')
                                                            "
                                                        >
                                                            <v-list-tile-action>
                                                                <v-checkbox
                                                                    :input-value="
                                                                        widget && widget.enabled
                                                                    "
                                                                    hide-details
                                                                    color="accent"
                                                                />
                                                            </v-list-tile-action>
                                                            <v-list-tile-title
                                                                class="text-capitalize"
                                                            >
                                                                {{ 'gross profit' | translate }}
                                                            </v-list-tile-title>
                                                        </v-list-tile>
                                                        <v-list-tile
                                                            @click="toggleProjectWidget('pl-chart')"
                                                        >
                                                            <v-list-tile-action>
                                                                <v-checkbox
                                                                    :input-value="
                                                                        is_widget_enabled(
                                                                            'pl-chart'
                                                                        )
                                                                    "
                                                                    hide-details
                                                                    color="accent"
                                                                />
                                                            </v-list-tile-action>
                                                            <v-list-tile-title>
                                                                {{
                                                                    'Monthly Revenue vs Expenditure'
                                                                        | translate
                                                                }}
                                                            </v-list-tile-title>
                                                        </v-list-tile>
                                                        <v-list-tile
                                                            @click="toggleProjectWidget('pl-table')"
                                                        >
                                                            <v-list-tile-action>
                                                                <v-checkbox
                                                                    :input-value="
                                                                        is_widget_enabled(
                                                                            'pl-table'
                                                                        )
                                                                    "
                                                                    hide-details
                                                                    color="accent"
                                                                />
                                                            </v-list-tile-action>
                                                            <v-list-tile-title>
                                                                {{ 'Profit and Loss' | translate }}
                                                            </v-list-tile-title>
                                                        </v-list-tile>
                                                    </v-list>
                                                </v-card>
                                            </v-menu>
                                            <span class="text-capitalize">{{
                                                'widgets' | translate
                                            }}</span>
                                        </v-tooltip>
                                    </v-toolbar>
                                </v-flex>
                            </v-layout>
                        </div>
                        <project-details class="pa-3" @remove="toggleProjectWidget">
                            <project-widget
                                :title="'gross profit / gross margin' | translate"
                                name="gross-profit-margin"
                                @edit="widgetEditorModalMode = 'gross-profit-margin'"
                                @delete="deleteWidget('gross-profit-margin')"
                                :widget="widget"
                                class="mb-3"
                            />
                        </project-details>
                    </div>

                    <div v-else-if="view == 'revenue'" transition="fadeIn">
                        <transition name="fade" appear>
                            <revenue :subview="subview" :date="entity" />
                        </transition>
                    </div>

                    <div v-else-if="view == 'expenses'" transition="fadeIn">
                        <transition name="fade" appear>
                            <expenses :projectId="project.id" :subview="subview" :date="entity" />
                        </transition>
                    </div>

                    <div v-else-if="view == 'settings'" transition="fadeIn">
                        <transition name="fade" appear>
                            <project-settings v-if="project" />
                        </transition>
                    </div>

                    <div v-else-if="view == 'kickstart'" transition="fadeIn" class="pa-3">
                        <transition name="fade" appear>
                            <cms v-if="project" :subview="subview" :entity="entity" />
                        </transition>
                    </div>
                </div>
            </v-flex>
        </v-layout>

        <v-snackbar v-model="showProjectCreated" :timeout="4000">
            {{ 'Project created successfully!' | translate }}
        </v-snackbar>

        <k-dialog
            :value="widgetEditorModalMode"
            @input="v => v || (widgetEditorModalMode = null)"
            max-width="760px"
            transition="dialog-transition"
            persistent
            lazy
        >
            <gross-profit-widget-editor
                v-if="widgetEditorModalMode === 'gross-profit-margin'"
                :projectId="project.id"
                @submit="handleWidgetChange"
                @close="widgetEditorModalMode = null"
            />
        </k-dialog>
    </Layout>
</template>

<style lang="scss">
.lgMargin {
    margin-left: 48px;
}
</style>
