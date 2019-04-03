<script>
import parse from 'date-fns/parse'
import format from 'date-fns/format'
import addMonths from 'date-fns/add_months'
import addDays from 'date-fns/add_days'
import setDate from 'date-fns/set_date'
import getDaysInMonth from 'date-fns/get_days_in_month'

import CostField from '@/components/cost/field'

import { toArray, pick } from 'lodash'
import Sticky from 'vue-sticky-directive'

import VDataTable from '@/components/VDataTable'

var locales = {
    en: require('date-fns/locale/en'),
    ja: require('date-fns/locale/ja'),
}

export default {
    name: 'CostTable',
    components: { CostField, VDataTable },
    directives: {
        Sticky,
        resize: {
            componentUpdated: function(el, binding, vnode) {
                if (binding.value == 'name') {
                    el.parentNode.style.width =
                        vnode.context.$refs['filtercell'].$el.parentNode.clientWidth + 'px'
                } else if (binding.value == 'total') {
                    el.parentNode.style.width =
                        vnode.context.$refs['totalcell'].parentNode.clientWidth + 'px'
                }
            },
        },
    },
    props: {
        records: {
            type: Object,
            required: true,
        },
        categories: {
            required: true,
        },
        periodLength: {
            type: [String, Number],
            required: true,
        },
        startDate: {
            required: true,
        },
        currency: {
            type: String,
        },
        edited: {
            type: Object,
            required: false,
        },
        plan: {
            type: Boolean,
            default: true,
        },
        date: {
            type: String,
        },
    },

    data() {
        return {
            showPopover: false,
            editedCost: {},
            backupCost: {},
            quarterly: false,
            loading: true,
            search: null,
            pagination: {
                limit: 6,
                offset: 0,
            },
            pagination2: {
                // to sync with sticky header table
                page: 1,
                rowsPerPage: -1,
                sortBy: '',
            },
            offset: {
                top: -10,
                bottom: 0,
            },
        }
    },

    computed: {
        period_length() {
            // FIXME: local period length, to shadow budget
            return this.date ? this.days_in_month : this.periodLength
        },

        per_page() {
            let perPage = [3, 6, 12, 24, -1]
            if (this.date) {
                perPage = [3, 7, 14, -1]
            }
            return perPage
                .filter(i => i < this.period_length)
                .map(item => {
                    item = item == -1 ? this.period_length : item
                    return { value: item, text: Number(item).toLocaleString(this.$root.lang) }
                })
        },

        months() {
            let data = []
            if (this.quarterly) {
                let q = 1
                for (var i = 0; i < Number(this.period_length); i++) {
                    if (i % 3 !== 0) continue
                    data.push(`Q${q}`)
                    q++
                }
                return data
            }
            let max =
                this.pagination.offset + this.pagination.limit > this.period_length
                    ? this.period_length
                    : this.pagination.offset + this.pagination.limit

            for (var j = this.pagination.offset; j < Number(max); j++) {
                data.push(
                    format(addMonths(this.startDate, j), 'YYYY/MM', {
                        locale: locales[this.$root.lang],
                    })
                )
            }
            return data
        },

        date_d() {
            return parse(this.date.replace('-', '/') + '/01')
        },

        days_in_month() {
            return getDaysInMonth(this.date_d)
        },

        days() {
            let data = []
            if (!this.date) {
                return data
            }

            let max =
                this.pagination.offset + this.pagination.limit > this.period_length
                    ? this.period_length
                    : this.pagination.offset + this.pagination.limit
            for (var j = this.pagination.offset; j < Number(max); j++) {
                data.push(
                    format(addDays(this.date_d, j), 'MM/DD', {
                        locale: locales[this.$root.lang],
                    })
                )
            }
            return data
        },

        columns() {
            let headers = [
                {
                    text: '',
                    sortable: false,
                    align: 'left',
                    value: 'name',
                    name: 'name',
                    class: 'pl-3 pr-0',
                    style: {
                        width: 'auto',
                    },
                },
                {
                    text: this.$t('Total'),
                    align: 'right',
                    value: 'total',
                    name: 'total',
                    style: {
                        width: 'auto',
                    },
                },
            ]
            if (this.date) {
                this.days.map(h => {
                    headers.push({
                        text: h,
                        sortable: false,
                        align: 'right',
                        value: 'price',
                    })
                })
                return headers
            }
            this.months.map(h => {
                headers.push({
                    text: h,
                    sortable: false,
                    align: 'right',
                    value: 'price',
                })
            })
            return headers
        },

        rows() {
            let rows = []
            Object.keys(this.records).forEach(c => {
                // group label
                const name = (this.categories[c] && this.categories[c].title) || 'Initial Cost'
                let categoryRow = {
                    name,
                    category: c,
                    total: 0,
                    totals: {},
                    children: [],
                    expandable: true,
                }

                this.records[c].forEach(record => {
                    let all = toArray(this.date ? record.daily : record.monthly).slice(
                        0,
                        Number(this.period_length)
                    )
                    let rowTotal = all.reduce((total, cost) => {
                        return total + (cost.total ? cost.total : cost.price * cost.quantity * 1)
                    }, 0)
                    let detailed = all.slice(
                        this.pagination.offset,
                        this.pagination.offset + this.pagination.limit
                    )

                    let row = {
                        id: record.id,
                        name: record.name,
                        total: rowTotal,
                        cost: record,
                        detailed,
                        category: c,
                        monthly: !this.date,
                    }

                    for (var i = 0; i < detailed.length; i++) {
                        if (!categoryRow.totals[this.months[i]]) {
                            categoryRow.totals[this.months[i]] = 0
                        }
                        categoryRow.totals[this.months[i]] += detailed[i].total
                            ? detailed[i].total
                            : detailed[i].price * detailed[i].quantity
                    }
                    categoryRow.children.push(row)
                })

                categoryRow.total = toArray(categoryRow.children).reduce((total, r) => {
                    return total + r.total
                }, 0)

                rows.push(categoryRow)
            })
            // eslint-disable-next-line
            this.loading = false
            return rows
        },

        color() {
            return this.plan ? 'indigo' : 'teal'
        },

        cost_field() {
            let field = { type: 'cost', title: 'price', title2: 'quantity' }
            if (this.editedCost.cat != 'labor') {
                return field
            }
            field.type = 'labor'
            field.title = 'base salary'
            return field
        },
    },

    watch: {
        showPopover: function(val) {
            if (!val) {
                this.hideEdit()
            }
        },
    },

    mounted() {
        if (this.date) {
            this.pagination.limit = 7
        }
        if (this.$vuetify.breakpoint.mdAndDown) {
            this.pagination.limit = 3
        }
    },

    created() {
        this.$bus.$on('expandCategory', this.expandCategory)
    },

    beforeDestroy: function() {
        this.$bus.$off('expandCategory', this.expandCategory)
    },

    methods: {
        editRow(cost) {
            if (cost == undefined) {
                cost = this.records[this.editedCost.cat].find(c => c.id == this.editedCost.id)
            }
            if (cost.id == '') return
            this.$emit('edit', cost)
            this.$emit('update:edited', cost)
            this.hideEdit()
        },
        getRowClass(cost) {
            if (!cost) return null
            return cost.id == this.edited.id ? 'editing-row editable-row' : 'editable-row'
        },
        editCol(col, cost) {
            this.$emit('edit', {})
            let ref = `cell${cost.category}${cost.id}${col}`
            col = col + this.pagination.offset
            let row = this.records[cost.category].findIndex(c => {
                return c.id === cost.id
            })
            let detailed = this.date
                ? this.records[cost.category][row].daily[col]
                : this.records[cost.category][row].monthly[col]
            this.backupCost = { ...detailed }
            this.editedCost = detailed
            if (this.editedCost.price == 0) {
                this.editedCost.price = null
                this.editedCost.quantity = null
            }
            this.editedCost.ref = this.$refs[ref][0]
            this.editedCost.row = row
            this.editedCost.col = col
            this.editedCost.cat = cost.category
            this.editedCost.id = cost.id
            this.editedCost.name = cost.name
            this.showPopover = true
        },
        hideEdit() {
            if (!this.editedCost.id) return

            let row = this.editedCost.row
            let col = this.editedCost.col
            let cat = this.editedCost.cat
            this.editedCost = {}
            this.showPopover = false
            if (this.date) {
                this.$set(this.records[cat][row].daily, col, this.backupCost)
            } else {
                this.$set(this.records[cat][row].monthly, col, this.backupCost)
            }
        },
        saveCost() {
            let row = this.editedCost.row
            let col = this.editedCost.col
            let cat = this.editedCost.cat
            this.editedCost.total = this.getTotal()
            this.$set(this.records[cat][row], 'auto', false)
            let detailed = this.date ? this.records[cat][row].daily : this.records[cat][row].monthly
            let record = pick(this.editedCost, ['price', 'quantity', 'meta', 'total', 'date'])
            // set date to day + 1 to account for 0 day
            this.$set(detailed, col, record)
            record.date = this.date ? format(setDate(this.date_d, col + 1), 'YYYY/MM/DD') : col
            this.editedCost = {}
            this.showPopover = false // TODO: dim popover until success? hide after

            return this.$emit('save', {
                project_id: this.records[cat][row].project_id,
                record_id: this.records[cat][row].id,
                record,
                monthly: !this.date,
            })
        },
        expand(props) {
            if (!props.item.expandable) return
            props.expanded = !props.expanded
        },
        expandCategory() {
            // let item = this.rows.find(r => r.category == cat)
            // if (item) {
            // }
        },
        filterRows(items, search) {
            search = search.toString().toLowerCase()
            if (search.trim() === '') return items

            items = JSON.parse(JSON.stringify(items)) //deep clone
            return items.filter(item => {
                let children = item.children.filter(
                    m =>
                        m.name
                            .toString()
                            .toLowerCase()
                            .indexOf(search) > -1
                )
                let parent =
                    item.name
                        .toString()
                        .toLowerCase()
                        .indexOf(search) > -1
                if (parent) {
                    item.expanded = true
                    item.expandable = false
                    return true
                } else if (children.length) {
                    item.children = children
                    item.expanded = true
                    item.expandable = false
                    return true
                }
                return false
            })
        },
        getTotal() {
            let total = Number(this.editedCost.price * this.editedCost.quantity)
            total += this.editedCost.meta.overtime * 1 || 0
            total += this.editedCost.meta.commuting * 1 || 0
            total += this.editedCost.meta.welfare * 1 || 0
            total += this.editedCost.meta.bonus * 1 || 0
            total += this.editedCost.meta.retirement * 1 || 0
            return total
        },
        prevPage() {
            this.pagination.offset -= this.pagination.limit
            this.pagination.offset = this.pagination.offset < 0 ? 0 : this.pagination.offset
        },
        nextPage() {
            this.pagination.offset += this.pagination.limit
        },
    },
}
</script>

<template>
    <div v-if="rows.length" class="pa-0" sticky-container>
        <div class="v-datatable__actions pl-1" v-if="pagination.limit <= period_length">
            <v-btn flat small primary v-if="date" @click="$router.back()">
                <v-icon flat>arrow_back</v-icon>
                {{ 'back' | translate }}
            </v-btn>
            <v-spacer />
            <div class="v-datatable__actions__select">
                <span class="first-capitalize grey--text" v-if="date">
                    {{ 'days per page' | translate }}:
                </span>
                <span class="first-capitalize grey--text" v-else>
                    {{ 'months per page' | translate }}:
                </span>
                <v-select
                    v-model="pagination.limit"
                    hideDetails
                    :items="per_page"
                    class="v-data-iterator__actions__select grey--text my-0"
                    :menuProps="{ minWidth: '75px' }"
                />
            </div>
            <v-btn icon primary @click="prevPage" :disabled="pagination.offset === 0">
                <v-icon>chevron_left</v-icon>
            </v-btn>
            <v-btn
                icon
                primary
                @click="nextPage"
                :disabled="pagination.offset + pagination.limit >= period_length"
            >
                <v-icon>chevron_right</v-icon>
            </v-btn>
        </div>

        <div v-sticky sticky-offset="offset" class="cost-table-sticky-header">
            <v-data-table
                :headers="columns"
                hide-actions
                :custom-filter="filterRows"
                :items="[]"
                :search="search"
                :pagination.sync="pagination2"
            >
                <template slot="headerCell" slot-scope="props">
                    <v-text-field
                        v-resize="'name'"
                        v-if="props.header.name == 'name'"
                        v-model="search"
                        :label="'filter' | translate"
                        append-icon="search"
                        single-line
                        clearable
                        hide-details
                        style="min-width: 150px"
                        class="text-capitalize search-cell pa-0 ma-0"
                    />
                    <span v-else v-resize="props.header.name">{{ props.header.text }}</span>
                </template>
            </v-data-table>
        </div>

        <v-data-table
            :headers="columns"
            :items="rows"
            expand
            :search="search"
            hide-actions
            item-key="name"
            :loading="loading"
            :custom-filter="filterRows"
            :pagination.sync="pagination2"
            :class="{ 'inset-shadows': pagination.limit > 6 }"
        >
            <template slot="headerCell" slot-scope="props">
                <v-text-field
                    v-if="props.header.name == 'name'"
                    v-model="search"
                    ref="filtercell"
                    :label="'filter' | translate"
                    append-icon="search"
                    single-line
                    clearable
                    hide-details
                    style="min-width: 150px"
                    class="text-capitalize search-cell pa-0 ma-0"
                />
                <span v-else-if="props.header.name == 'total'" ref="totalcell">
                    {{ props.header.text }}
                </span>
                <span v-else-if="!date">
                    <v-tooltip max-width="300" bottom>
                        <a
                            slot="activator"
                            @click="$emit('showDaily', props.header.text.replace('/', '-'))"
                        >
                            {{ props.header.text }}
                        </a>
                        {{ 'Click here to see the daily data' | translate }}
                    </v-tooltip>
                </span>
                <span v-else>{{ props.header.text }}</span>
            </template>

            <template slot="items" slot-scope="props">
                <tr @click="expand(props)" :class="{ pointer: props.item.expandable }">
                    <td class="name-cell body-2">
                        {{ props.item.name }}
                        <span class="right" v-if="props.item.expandable">
                            <transition name="fade" mode="out-in">
                                <v-icon :v-key="'down'" v-if="props.expanded">
                                    keyboard_arrow_down
                                </v-icon>
                                <v-icon :v-key="'right'" v-else>keyboard_arrow_right</v-icon>
                            </transition>
                        </span>
                    </td>
                    <td class="text-xs-right body-2 mono">
                        <strong>{{ props.item.total | currency(currency) }}</strong>
                    </td>
                    <td
                        v-for="(total, i) in props.item.totals"
                        :key="i"
                        class="text-xs-right body-2 mono"
                    >
                        {{ total | currency(currency) }}
                    </td>
                </tr>
            </template>

            <template slot="expand" slot-scope="props">
                <tr
                    v-for="(row, i) in props.item.children"
                    :key="`${row.cost.id}${i}`"
                    class="expanded-row"
                >
                    <td
                        :class="getRowClass(row.cost)"
                        class="primary--text pointer name-cell pl-4 el-clickable"
                        @click="editRow(row.cost)"
                    >
                        {{ row.name }}
                    </td>
                    <td class="text-xs-right font-weight-medium mono">
                        <strong>{{ row.total | currency(currency) }}</strong>
                    </td>
                    <td
                        v-for="(m, i) in row.detailed"
                        :key="i"
                        class="price-cell mono"
                        :class="{
                            'active-popover': editedCost.col == i && editedCost.id == row.id,
                        }"
                    >
                        <span
                            :ref="`cell${row.category}${row.id}${i}`"
                            class="text-xs-right editable-cell"
                            @click="editCol(i, row)"
                        >
                            <span v-if="m.total"> {{ m.total | currency(currency) }} </span>
                            <span v-else-if="m.quantity && m.price != 0">
                                {{ (m.price * m.quantity) | currency(currency) }}
                            </span>
                            <span v-else>-</span>
                        </span>
                    </td>
                </tr>
            </template>
            <template slot="no-results" :value="true">
                <div class="text-center">{{ 'No matching records found' | translate }}</div>
            </template>
        </v-data-table>

        <v-menu
            v-model="showPopover"
            :content-class="$vuetify.breakpoint.xs ? 'popover-fullscreen' : ''"
            :activator="editedCost.ref"
            :close-on-content-click="false"
            :nudge-width="200"
            :open-on-click="false"
            offset-x
            left
        >
            <form @submit.prevent="saveCost" @keydown.esc="hideEdit">
                <v-card class="popover-card">
                    <v-toolbar flat dark :color="color" dense class="pt-2">
                        <v-toolbar-title slot="extension">
                            {{ editedCost.name }}
                            <v-icon v-if="editedCost.icon"> {{ editedCost.icon }} </v-icon>
                        </v-toolbar-title>

                        <v-btn
                            @click="editRow()"
                            color="#424242"
                            small
                            absolute
                            bottom
                            left
                            fab
                            icon
                        >
                            <v-icon>edit</v-icon>
                        </v-btn>
                        <v-spacer />
                        <v-tooltip max-width="300" bottom v-if="false">
                            <v-btn icon dark slot="activator"><v-icon>more_vert</v-icon></v-btn>
                            <span class="text-capitalize">{{ 'options' | translate }}</span>
                        </v-tooltip>
                        <v-btn dark icon @click="showPopover = false"><v-icon>close</v-icon></v-btn>
                    </v-toolbar>
                    <v-card-text class="pa-3">
                        <cost-field
                            v-if="editedCost.id"
                            v-model="editedCost"
                            :project-length="period_length"
                            :project-start="startDate"
                            :field="cost_field"
                            :currency="currency"
                            style="width: 350px"
                            autofocus="currency"
                        />
                    </v-card-text>
                    <v-card-actions class="px-3 pb-3 pt-0">
                        <v-spacer />
                        <v-btn class="my-0" flat dense @click="showPopover = false">
                            {{ 'cancel' | translate }}
                        </v-btn>
                        <v-btn class="my-0" dense type="submit" color="primary">
                            {{ 'save' | translate }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </form>
        </v-menu>
    </div>
</template>

<style scoped lang="css">
.editable-cell {
    cursor: pointer;
    display: inline-block;
    min-width: 100%;
}
.vue-sticky-el.top-sticky {
    display: block;
    z-index: 2 !important;
    box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14),
        0px 1px 3px 0px rgba(0, 0, 0, 0.12);
}
</style>
