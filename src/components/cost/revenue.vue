<script>
import { mapActions, mapState, mapGetters } from 'vuex'

import DraggableMenu from '@/components/draggableMenu'

import EmptyState from '@/components/empty'
import CostTable from '@/components/cost/table'
import CostCompareTable from '@/components/cost/compareTable'
import CostEditor from '@/components/cost/costEditor'
import CsvUpload from '@/components/csv/upload'

const TYPE = 'revenue'

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
        }
    },

    watch: {
        plan(val) {
            if (val == 'compare') return
            this.$emit('edit', { type: TYPE })
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
            records_planned: state => state.projects.planned,
            records_actual: state => state.projects.actual,
            daily: state => state.projects.daily,
        }),
        ...mapGetters([
            'revenue',
            'gross_profit',
            'currency',
            'customer_acquisition_cost',
            'revenue_planned_total',
            'revenue_actual_total',
        ]),
        planned() {
            return this.records_planned[TYPE]
        },
        actual() {
            return this.records_actual[TYPE]
        },
        categories() {
            return this.$store.state.projects.categories.revenue
        },
        records() {
            if (this.date) {
                return this.plan ? this.daily.planned[TYPE] || [] : this.daily.actual[TYPE] || []
            }
            return this.plan ? this.planned : this.actual
        },
        products() {
            let data = {}
            this.records.forEach(record => {
                let title = (record.product && record.product.product_name) || 'Default'
                if (!data[title]) data[title] = { title }
            })
            return data
        },
        category_records() {
            let data = {}

            this.records.forEach(record => {
                let product = (record.product && record.product.product_name) || 'Default'
                if (!data[product]) data[product] = []
                data[product].push(record)
            })

            return data
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
                this.getDailyCosts({
                    project_id: this.project.id,
                    type: TYPE,
                    date: this.date,
                })
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
                    if (this.date) {
                        this.getDailyCosts({
                            project_id: this.project.id,
                            type: TYPE,
                            date: this.date,
                        })
                    }
                })
                .catch(this._handleError)
        },
        reloadRecords() {
            this.getMonthlyCosts({ project_id: this.project.id, type: TYPE })
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
                type: TYPE,
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
                    view: TYPE,
                    entity: date,
                },
            })
        },
        makeURL(view) {
            return `/project/${this.project.id}/revenue/${view}`
        },
    },
}
</script>

<template>
    <v-layout row wrap>
        <v-flex xs12>
            <v-toolbar
                :class="{ 'blue-grey lighten-5': !$root.dark }"
                class="mb-0 v-toolbar__content--nopadding px-3"
                flat
            >
                <v-toolbar-title>
                    <div class="text-capitalize">{{ 'revenue' | translate }}</div>
                </v-toolbar-title>
                <v-btn-toggle
                    v-if="project.duration"
                    v-model="plan"
                    dense
                    class="ma-0 ml-3"
                    mandatory
                >
                    <v-btn :value="false" @click="changePlan('actual')" outline>
                        {{ 'actual' | translate }}
                    </v-btn>
                    <v-btn
                        :value="true"
                        @click="changePlan('budget')"
                        outline
                        class="hidden-sm-and-down"
                    >
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
                <div v-if="plan != 'compare'">
                    <v-tooltip max-width="300" bottom class="hidden-sm-and-down">
                        <v-btn
                            icon
                            dense
                            flat
                            slot="activator"
                            open-delay="300"
                            class="primary my-0 ml-0"
                            @click="csvDialog = true"
                        >
                            <v-icon>file_upload</v-icon>
                        </v-btn>
                        <span class="text-capitalize">{{ 'upload CSV' | translate }}</span>
                    </v-tooltip>
                    <v-tooltip
                        max-width="300"
                        bottom
                        v-if="records && records.length"
                        class="hidden-sm-and-down"
                    >
                        <v-btn
                            icon
                            dense
                            flat
                            slot="activator"
                            open-delay="300"
                            class="primary my-0 ml-0"
                            @click="downloadCSV"
                        >
                            <v-icon>file_download</v-icon>
                        </v-btn>
                        <span class="text-capitalize">{{ 'download CSV' | translate }}</span>
                    </v-tooltip>
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
                </div>
            </v-toolbar>
        </v-flex>
        <v-flex xs12 class="ma-3">
            <table ref="totals" class="right totals hidden-xs-only" v-if="project.duration">
                <thead>
                    <tr>
                        <th class="mb-2 body-1 text-xs-right">
                            <div class="text-capitalize font-weight-regular">
                                {{ 'revenue' | translate }}
                            </div>
                        </th>
                        <th class="mb-2 body-1 text-xs-right">
                            <div class="text-capitalize font-weight-regular">
                                {{ 'planned revenue' | translate }}
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="body-1 text-xs-right">
                            <span class="total-header">
                                {{ revenue_actual_total | currency(currency) }}
                            </span>
                        </td>
                        <td class="body-1 text-xs-right">
                            <span class="total-header">
                                {{ revenue_planned_total | currency(currency) }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </v-flex>
        <v-flex xs12 class="ma-3">
            <v-card>
                <v-container v-if="plan == 'compare' && actual.length" fluid class="pa-0">
                    <cost-compare-table
                        :start-date="project.start_date"
                        :compare="{ planned, actual }"
                        :titles="['planned', 'actual', 'difference']"
                        :categories="categories"
                        :period-length="project.duration"
                        :currency="currency"
                    />
                </v-container>
                <v-container v-else-if="records && records.length" fluid class="pa-0">
                    <cost-table
                        :plan="plan"
                        :edited.sync="edited"
                        :start-date="project.start_date"
                        :records="category_records"
                        :categories="products || categories"
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
        </v-flex>
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
                initialType="revenue"
                :plan="plan"
                :edit.sync="edited"
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
                initialType="revenue"
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
    </v-layout>
</template>
