<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'

import DraggableMenu from '@/components/draggableMenu'

import EmptyState from '@/components/empty'
import CostTable from '@/components/cost/table'
import CostCompareTable from '@/components/cost/compareTable'
import CostEditor from '@/components/cost/costEditor'
import CsvUpload from '@/components/csv/upload'

export default {
    components: {
        EmptyState,
        CostTable,
        CostEditor,
        CostCompareTable,
        CsvUpload,
        DraggableMenu,
    },
    props: {
        subview: {
            type: String,
            required: false,
            default: 'actual',
        },
        date: {
            type: String,
            required: false,
            default: '',
        },
    },

    data() {
        return {
            view: 'actual',
            edited: {},
            sending: false,
            plan: false,
            csvDialog: false,
            fileUploaded: false,
            error: false,
            showEditor: false,
            recordAdded: false,
            recordUpdated: false,
            recordDeleted: false,
            allTypes: ['cogs', 'opex'],
            selectedType: null,
        }
    },

    watch: {
        plan(val) {
            if (val == 'compare') return
            this.$emit('edit', { type: this.selectedType || this.allTypes[0] })
        },
        $route: 'checkRoute',
        showEditor(val) {
            if (val) return
            // to prevent empty editor artifact
            setTimeout(() => {
                this.edited = {}
            }, 300)
        },
    },

    computed: {
        ...mapState({
            user: state => state.account.user,
            project: state => state.projects.current,
            planned: state => state.projects.planned,
            actual: state => state.projects.actual,
            daily: state => state.projects.daily,
        }),

        ...mapGetters([
            'revenue',
            'gross_profit',
            'currency',
            'customer_acquisition_cost',
            'cogs_planned_total',
            'cogs_actual_total',
            'opex_planned_total',
            'opex_actual_total',
            'revenue_planned_total',
            'revenue_actual_total',
        ]),
        selectedTypes() {
            return this.selectedType ? [this.selectedType] : this.allTypes
        },
        total_simulated() {
            const totals = {
                cogs: this.revenue - this.gross_profit,
                opex: this.customer_acquisition_cost,
            }
            if (this.selectedType) {
                return totals[this.selectedType]
            }
            return totals.cogs + totals.opex
        },
        total_planned() {
            const totals = {
                cogs: this.cogs_planned_total,
                opex: this.opex_planned_total,
            }
            if (this.selectedType) {
                return totals[this.selectedType]
            }
            return totals.cogs + totals.opex
        },
        total_actual() {
            const totals = {
                cogs: this.cogs_actual_total,
                opex: this.opex_actual_total,
            }
            if (this.selectedType) {
                return totals[this.selectedType]
            }
            return totals.cogs + totals.opex
        },
        categories() {
            const totals = {
                cogs: this.$store.state.projects.categories.cogs,
                opex: this.$store.state.projects.categories.opex,
            }
            if (this.selectedType) {
                return totals[this.selectedType]
            }
            const data = cloneDeep({ ...totals.cogs, ...totals.opex })
            Object.keys(data).forEach(c => {
                data[c].title = this.$t(data[c].title)
            })
            return data
        },
        records() {
            let pa = null
            if (this.date) {
                pa = this.plan ? this.daily.planned : this.daily.actual
            } else {
                pa = this.plan ? this.planned : this.actual
            }
            const totals = {
                cogs: pa['cogs'] || [],
                opex: pa['opex'] || [],
            }
            if (this.selectedType) {
                return totals[this.selectedType]
            }
            return [...totals.cogs, ...totals.opex]
        },
        category_records() {
            let data = {}
            this.records.forEach(record => {
                if (!data[record.category]) data[record.category] = []
                data[record.category].push(record)
            })
            return data
        },
        compared() {
            const { actual, planned } = this
            if (!(actual && planned)) return
            if (this.selectedType) {
                return {
                    actual: actual[this.selectedType],
                    planned: planned[this.selectedType],
                }
            }
            if (!(actual.cogs && planned.cogs && actual.opex && planned.opex)) return
            return {
                actual: [...actual.cogs, ...actual.opex],
                planned: [...planned.cogs, ...planned.opex],
            }
        },
    },

    mounted() {
        this.$nextTick().then(() => {
            if (!this.records || this.records.length == 0) {
                this.reloadRecords()
            }
        })
        this.checkRoute()
    },

    methods: {
        ...mapActions([
            'resetError',
            'getCSVLink',
            'getMonthlyCosts',
            'saveMonthlyCost',
            'saveDailyCost',
            'getDailyCosts',
        ]),
        checkRoute() {
            this.view = this.subview ? this.subview : 'actual'
            switch (this.subview) {
                case 'compare':
                    this.plan = 'compare'
                    break
                case 'actual':
                    this.plan = false
                    break
                default:
                    this.plan = false
            }
            window.onpopstate = event => {
                this.plan = event.state.plan
                this.view = this.subview
            }
            if (this.date) {
                this.allTypes.forEach(type =>
                    this.getDailyCosts({
                        project_id: this.project.id,
                        type: type,
                        date: this.date,
                    })
                )
            }
        },
        _handleError() {
            this.sending = false
        },
        tryToSaveDetailed(cost) {
            this.resetError()
            this.sending = true
            let result = cost.monthly ? this.saveMonthlyCost(cost) : this.saveDailyCost(cost)
            return result
                .then(() => {
                    this.sending = false
                    this.reloadRecords()
                })
                .catch(this._handleError)
        },
        reloadRecords() {
            this.allTypes.forEach(type =>
                this.getMonthlyCosts({ project_id: this.project.id, type: type }).then(costs => {
                    switch (type) {
                        case 'cogs':
                        case 'opex':
                            if (this.firstTime) {
                                this.showEditor = !costs.length
                            }
                            this.firstTime = false
                            break
                    }
                })
            )
        },
        changePlan(view) {
            history.pushState({ plan: this.plan }, {}, this.makeURL(view))
            this.view = view
        },
        editRecord(record) {
            this.edited = record
            this.showEditor = !!record.id
        },
        newRecord() {
            this.showEditor = this.edited.id ? true : !this.showEditor
            this.edited = {}
        },
        onUploadClose() {
            this.csvDialog = false
        },
        onUploadSuccess() {
            this.reloadRecords()
            this.fileUploaded = true
        },
        onUploadError(error) {
            this.error = error
        },
        downloadCSV() {
            this.getCSVLink({
                project_id: this.project.id,
                type: this.selectedType,
                planned: this.plan,
            }).then(url => {
                window.location = url
            })
        },
        showDaily(date) {
            this.$router.push({
                name: 'project',
                params: {
                    id: this.project.id,
                    subview: this.view,
                    view: this.type == 'revenue' ? this.type : 'expenses',
                    entity: date,
                },
            })
        },
        makeURL(view) {
            return `/project/${this.project.id}/expenses/${view}`
        },
        changeSelectedType(type) {
            this.selectedType = type
        },
    },
}
</script>

<template>
    <v-flex>
        <v-layout row wrap>
            <v-flex>
                <v-toolbar
                    :class="{ 'blue-grey lighten-5': !$root.dark }"
                    class="mb-0 v-toolbar__content--nopadding px-3"
                    flat
                >
                    <v-toolbar-title class="text-capitalize mr-3">
                        {{ 'cost manager' | translate }}
                    </v-toolbar-title>
                    <div class="hidden-sm-and-down ml-3">
                        <v-menu :nudge-width="100">
                            <template v-slot:activator="{ on }">
                                <v-toolbar-title v-on="on" class="pointer">
                                    <span v-if="!selectedType" class="text-capitalize">{{
                                        'all' | translate
                                    }}</span>
                                    <span v-else class="text-uppercase">{{ selectedType }}</span>
                                    <v-icon>arrow_drop_down</v-icon>
                                </v-toolbar-title>
                            </template>
                            <v-list>
                                <v-list-tile @click="changeSelectedType()">
                                    <v-list-tile-title class="text-capitalize">
                                        <span class="text-capitalize">{{ 'all' | translate }}</span>
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile
                                    v-for="item in allTypes"
                                    :key="item"
                                    @click="changeSelectedType(item)"
                                >
                                    <v-list-tile-title v-text="item" class="text-uppercase" />
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </div>
                    <v-btn-toggle
                        v-if="project.duration"
                        v-model="plan"
                        dense
                        class="ma-0 ml-3 hidden-sm-and-down"
                        mandatory
                    >
                        <v-btn :value="false" @click="changePlan('actual')" outline>
                            {{ 'actual' | translate }}
                        </v-btn>
                        <v-btn :value="true" @click="changePlan('budget')" outline>
                            {{ 'budget' | translate }}
                        </v-btn>
                        <v-btn
                            v-if="(records && records.length) || plan == 'compare'"
                            value="compare"
                            @click="changePlan('compare')"
                            outline
                        >
                            {{ 'compare' | translate }}
                        </v-btn>
                    </v-btn-toggle>
                    <v-spacer />
                    <div v-if="plan != 'compare'" class="pa-0 ma-0">
                        <v-tooltip max-width="300" bottom>
                            <v-btn
                                icon
                                dense
                                flat
                                slot="activator"
                                open-delay="300"
                                class="primary ma-0"
                                @click="newRecord"
                            >
                                <v-icon>add</v-icon>
                            </v-btn>
                            <span class="text-capitalize">{{ 'add new record' | translate }}</span>
                        </v-tooltip>
                        <v-tooltip max-width="300" bottom>
                            <v-btn
                                icon
                                dense
                                flat
                                slot="activator"
                                open-delay="300"
                                class="primary ma-0 ml-3"
                                @click="csvDialog = true"
                            >
                                <v-icon>file_upload</v-icon>
                            </v-btn>
                            <span class="text-capitalize">{{ 'upload CSV' | translate }}</span>
                        </v-tooltip>
                        <v-tooltip max-width="300" bottom v-if="records && records.length">
                            <v-btn
                                v-if="selectedType"
                                icon
                                dense
                                flat
                                slot="activator"
                                open-delay="300"
                                class="primary ma-0 ml-3"
                                @click="downloadCSV"
                            >
                                <v-icon>file_download</v-icon>
                            </v-btn>
                            <span class="text-capitalize">{{ 'download CSV' | translate }}</span>
                        </v-tooltip>
                    </div>
                </v-toolbar>
            </v-flex>
            <v-flex xs12 class="pa-3" v-if="selectedType">
                <table ref="totals" class="right totals hidden-xs-only" v-if="project.duration">
                    <thead>
                        <tr>
                            <th class="mb-2 body-1 text-xs-right">
                                <div
                                    v-if="selectedType == 'cogs'"
                                    class="text-capitalize font-weight-regular"
                                >
                                    {{ 'COGS total' | translate }}
                                </div>
                                <div
                                    v-else-if="selectedType == 'opex'"
                                    class="text-capitalize font-weight-regular"
                                >
                                    {{ 'operating costs total' | translate }}
                                </div>
                                <div
                                    v-else-if="selectedType == 'revenue'"
                                    class="text-capitalize font-weight-regular"
                                >
                                    {{ 'revenue' | translate }}
                                </div>
                            </th>
                            <th class="mb-2 body-1 text-xs-right">
                                <div
                                    v-if="selectedType == 'cogs'"
                                    class="text-capitalize font-weight-regular"
                                >
                                    {{ 'planned COGS total' | translate }}
                                </div>
                                <div
                                    v-else-if="selectedType == 'opex'"
                                    class="text-capitalize font-weight-regular"
                                >
                                    {{ 'planned OpEx total' | translate }}
                                </div>
                                <div
                                    v-else-if="selectedType == 'revenue'"
                                    class="text-capitalize font-weight-regular"
                                >
                                    {{ 'planned revenue' | translate }}
                                </div>
                            </th>
                            <th v-if="project.has_model" class="mb-2 body-1 text-xs-right">
                                <div
                                    v-if="selectedType == 'cogs'"
                                    class="text-capitalize font-weight-regular"
                                >
                                    {{ 'simulated COGS total' | translate }}
                                </div>
                                <div
                                    v-else-if="selectedType == 'opex'"
                                    class="text-capitalize font-weight-regular"
                                >
                                    {{ 'simulated OpEx total' | translate }}
                                </div>
                                <div
                                    v-else-if="selectedType == 'revenue'"
                                    class="text-capitalize font-weight-regular"
                                >
                                    {{ 'simulated revenue' | translate }}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="body-1 text-xs-right">
                                <span class="total-header">
                                    {{ total_actual | currency(currency) }}
                                </span>
                            </td>
                            <td class="body-1 text-xs-right">
                                <span class="total-header">
                                    {{ total_planned | currency(currency) }}
                                </span>
                            </td>
                            <td v-if="project.has_model" class="body-1 text-xs-right">
                                <span class="total-header">
                                    {{ total_simulated | currency(currency) }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </v-flex>
        </v-layout>
        <v-container class="pa-3" fluid>
            <v-card>
                <v-container
                    v-if="
                        plan === 'compare' && compared && compared.actual && compared.actual.length
                    "
                    fluid
                    class="pa-0"
                >
                    <cost-compare-table
                        :start-date="project.start_date"
                        :compare="compared"
                        :titles="['planned', 'actual', 'difference']"
                        :categories="categories"
                        :period-length="project.duration"
                        :currency="currency"
                    />
                </v-container>
                <v-container
                    v-else-if="plan != 'compare' && records && records.length"
                    fluid
                    class="pa-0"
                >
                    <cost-table
                        :plan="plan"
                        :edited.sync="edited"
                        :start-date="project.start_date"
                        :records="category_records"
                        :categories="categories"
                        :period-length="project.duration"
                        :currency="currency"
                        :date="date"
                        @edit="editRecord"
                        @save="tryToSaveDetailed"
                        @showDaily="showDaily"
                    />
                </v-container>
                <v-container v-else fluid fill-height style="max-width: 700px">
                    <v-layout row align-start justify-center>
                        <v-flex sm12 md8> <empty-state class="mt-3" title="no records" /> </v-flex>
                    </v-layout>
                </v-container>
            </v-card>
        </v-container>

        <draggable-menu
            v-model="showEditor"
            v-if="plan != 'compare'"
            :max-width="380"
            transition="slide-x-transition"
            origin="top right"
            z-index="7"
            @close="showEditor = false"
        >
            <cost-editor
                class="fill-height"
                :plan="plan"
                :edit.sync="edited"
                expenses
                @deleted="recordDeleted = true"
                @updated="recordUpdated = true"
                @added="recordAdded = true"
                @reload="reloadRecords"
                @edit="editRecord"
                @close="showEditor = false"
            />
        </draggable-menu>

        <k-dialog v-if="csvDialog" v-model="csvDialog" width="700" lazy>
            <csv-upload
                :initialType="selectedType || allTypes[0]"
                :types="allTypes"
                :plan="plan"
                @success="onUploadSuccess"
                @error="onUploadError"
                @close="onUploadClose"
            />
        </k-dialog>
        <v-snackbar v-if="fileUploaded" v-model="fileUploaded">
            {{ 'File uploaded successfully!' | translate }}
            <!-- <v-btn dark flat color="accent"> {{ 'go to uploads' | translate }} </v-btn> -->
        </v-snackbar>
        <v-snackbar :value="error">
            <span class="first-capitalize">{{ error | translate }}</span>
        </v-snackbar>

        <v-snackbar v-model="recordAdded">
            {{ 'Record added successfully!' | translate }}
        </v-snackbar>
        <v-snackbar v-model="recordUpdated">
            {{ 'Changes saved successfully!' | translate }}
        </v-snackbar>
        <v-snackbar v-model="recordDeleted">
            {{ 'Record deleted successfully!' | translate }}
        </v-snackbar>
    </v-flex>
</template>
