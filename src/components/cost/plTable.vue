<script>
import { mapState, mapGetters } from 'vuex'

import VDataTable from '@/components/VDataTable'

import { update } from 'lodash'
import isFuture from 'date-fns/is_future'
import startOfMonth from 'date-fns/start_of_month'
import addMonths from 'date-fns/add_months'
import format from 'date-fns/format'

var locales = {
    en: require('date-fns/locale/en'),
    ja: require('date-fns/locale/ja'),
}

export default {
    components: { VDataTable },
    props: {},

    data() {
        return {
            types: ['opex', 'cogs', 'revenue'],
            expanded: {},
            labels: {
                opex: 'Operating Costs',
                cogs: 'Cost of Goods Sold',
            },
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
            loading: true,
        }
    },

    computed: {
        ...mapState({
            project: state => state.projects.current,
            planned: state => state.projects.planned,
            actual: state => state.projects.actual,
            categories: state => state.projects.categories,
        }),

        ...mapGetters(['currency']),

        per_page() {
            const perPage = [3, 6, 12, 24, -1]
            return perPage
                .filter(i => i < this.project.duration)
                .map(item => {
                    item = item == -1 ? this.project.duration : item
                    return { value: item, text: Number(item).toLocaleString(this.$root.lang) }
                })
        },

        columns() {
            return ['name', 'planned', 'actual', 'gain/loss', 'Δ'].map(h => ({
                name: h,
                text: h,
                sortable: false,
                align: 'right',
                class: 'px-2',
                value: h,
                type: ['name'].includes(h) ? 'text' : 'number',
            }))
        },

        rows() {
            let rows = []
            // let max =
            //     this.pagination.offset + this.pagination.limit > this.project.duration
            //         ? this.project.duration
            //         : this.pagination.offset + this.pagination.limit

            Object.keys(this.costs).forEach(ts => {
                // group label
                const name = format(Number(ts), 'YYYY/MM', {
                    locale: locales[this.$root.lang],
                })
                let monthRow = {
                    ts,
                    name,
                    planned: 0,
                    actual: 0,
                    percent: 0,
                    delta: 0,
                    expandable: false,
                    month: true,
                }
                this.types.forEach(type => {
                    let categoryRow = {
                        ts,
                        name: this.labels[type] || type,
                        planned: 0,
                        actual: 0,
                        percent: 0,
                        delta: 0,
                        expandable: false,
                        children: [],
                    }

                    let typeData = this.costs[ts][type]
                    if (!typeData) {
                        return
                    }
                    if (!['launch', 'revenue'].includes(type)) {
                        let typeRows = []
                        let summary = { planned: 0, actual: 0 }
                        Object.keys(typeData).forEach(cat => {
                            let catData = typeData[cat]
                            let category = this.categories[type][cat]
                            let title = category && category.title
                            typeRows.push(this.getRow(title || cat, catData))
                            summary.actual += catData.actual || 0
                            summary.planned += catData.planned || 0
                        })
                        monthRow.actual -= categoryRow.actual
                        monthRow.planned -= categoryRow.planned
                        categoryRow = this.getRow(type, summary)
                        categoryRow.expandable = true
                        categoryRow.children = typeRows
                        categoryRow.ts = ts
                        categoryRow.type = type
                    } else if (type == 'launch') {
                        monthRow.actual -= typeData.actual || 0
                        monthRow.planned -= typeData.planned || 0
                        categoryRow = this.getRow(type, typeData)
                    } else {
                        monthRow.actual += typeData.actual || 0
                        monthRow.planned += typeData.planned || 0
                        categoryRow = this.getRow(type, typeData)
                    }
                    rows.push(categoryRow)
                })
                monthRow.delta = monthRow.actual - monthRow.planned
                rows.push(monthRow)
            })
            // eslint-disable-next-line
            this.loading = false
            return rows.reverse()
        },

        costs() {
            // calculate costs totals for each category for each month until current month
            let data = {}
            const pas = ['planned', 'actual']
            pas.forEach(pa => {
                const paData = this[pa]
                Object.keys(paData).forEach(type => {
                    const typeData = paData[type] || []

                    typeData.forEach(item => {
                        const startDate = this.start_date
                        if (!Array.isArray(item.monthly)) {
                            return
                        }
                        item.monthly.forEach((cost, index) => {
                            let monthStart = addMonths(startDate, index).getTime()
                            // display data until today
                            if (isFuture(monthStart)) {
                                return
                            }

                            let total = cost.total ? cost.total : cost.price * cost.quantity * 1
                            let path = ['launch', 'revenue'].includes(type)
                                ? [monthStart, type, pa]
                                : [monthStart, type, item.category, pa]
                            update(data, path, amount => (amount || 0) + total)
                        })
                    })
                })
            })
            let sorted = {}
            Object.keys(data)
                .sort()
                .forEach(category => {
                    let sortedCategoryData = {}
                    const categoryData = data[category]
                    Object.keys(categoryData)
                        .sort((a, b) => (this.types.indexOf(a) < this.types.indexOf(b) ? -1 : 1))
                        .forEach(ts => {
                            sortedCategoryData[ts] = categoryData[ts]
                        })
                    sorted[category] = sortedCategoryData
                })
            return sorted
        },

        start_date() {
            return startOfMonth(this.project.start_date)
        },
    },

    mounted() {},

    methods: {
        getRow(label, data) {
            const record = {
                actual: 0,
                planned: 0,
                ...data,
            }
            const delta = record.actual - record.planned
            let percent = '-'

            if (record.planned) {
                if (!record.actual) {
                    percent = '100%'
                } else if (record.planned === record.actual) {
                    percent = '0%'
                } else {
                    percent =
                        Number(
                            (100 * Math.abs(record.actual - record.planned)) / record.planned
                        ).toFixed(0) + '%'
                }
            }
            return {
                name: this.labels[label] || label,
                planned: record.planned,
                actual: record.actual,
                percent,
                delta,
            }
        },
        expand(props) {
            if (!props.item.expandable) return
            props.expanded = !props.expanded
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
    <v-card v-if="rows.length">
        <v-card-title primary-title class="pa-0">
            <v-layout row align-center>
                <v-flex class="title grey-text text-darken-1">
                    {{ 'Profit and Loss' | translate }}
                </v-flex>
                <!-- <v-menu left>
                    <v-btn icon small slot="activator" class="ma-0">
                        <v-icon>more_vert</v-icon>
                    </v-btn>
                    <v-list class="text-capitalize">
                        <v-list-tile @click="$emit('remove')">
                            <v-list-tile-title>{{ 'remove' | translate }}</v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                </v-menu> -->
            </v-layout>
        </v-card-title>
        <v-data-table
            :headers="columns"
            :items="rows"
            :loading="loading"
            :pagination.sync="pagination2"
            expand
            hide-actions
            item-key="name"
            class="vgt-table"
        >
            <template slot="headerCell" slot-scope="props">
                <span
                    v-if="props.header.name !== 'name'"
                    class="caption font-weight-medium grey-text text-capitalize"
                >
                    {{ props.header.text | translate }}
                </span>
            </template>

            <template slot="items" slot-scope="props">
                <tr class="month-row" v-if="props.item.month">
                    <th class="text-xs-left pl-3">
                        <span class="grey-text text-darken-4 caption"
                            ><strong>{{ props.item.name }}</strong></span
                        >
                    </th>
                    <th class="text-xs-right">
                        <span
                            class="caption font-weight-medium mono"
                            :class="[
                                props.item.planned > 0
                                    ? 'teal-text darken-1'
                                    : 'pink-text darken-1',
                            ]"
                        >
                            <strong>{{ props.item.planned | currency(currency) }}</strong>
                        </span>
                    </th>
                    <th class="text-xs-right">
                        <span
                            class="caption font-weight-medium mono"
                            :class="[
                                props.item.actual > 0 ? 'teal-text darken-1' : 'pink-text darken-1',
                            ]"
                        >
                            <strong>{{ props.item.actual | currency(currency) }}</strong>
                        </span>
                    </th>
                    <th class="text-xs-right"></th>
                    <th class="text-xs-right">
                        <span
                            class="caption font-weight-medium mono"
                            :class="[props.item.delta > 0 ? 'teal-text' : 'pink-text']"
                        >
                            <strong>{{ props.item.delta | currency(currency) }}</strong>
                        </span>
                    </th>
                </tr>
                <tr v-else @click="expand(props)" :class="{ pointer: props.item.expandable }">
                    <td class="name-cell body-2 text-capitalize">
                        <span class="left">{{ props.item.name | translate }}</span>
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
                        <strong>{{ props.item.planned | currency(currency) }}</strong>
                    </td>
                    <td class="text-xs-right body-2 mono">
                        <strong>{{ props.item.actual | currency(currency) }}</strong>
                    </td>
                    <td class="text-xs-right percent mono">
                        <span v-if="props.item.percent == '-'">-</span>
                        <span
                            v-else-if="props.item.delta < 0"
                            :class="[
                                props.item.name == 'revenue'
                                    ? 'pink-text darken-1'
                                    : 'teal-text darken-1',
                            ]"
                        >
                            {{ props.item.percent }}
                            <v-icon
                                class="text-darken-3"
                                :class="[
                                    props.item.name == 'revenue'
                                        ? 'pink-text darken-1'
                                        : 'teal-text darken-1',
                                ]"
                            >
                                arrow_drop_down
                            </v-icon>
                        </span>
                        <span
                            v-else-if="props.item.delta > 0"
                            :class="[
                                props.item.name == 'revenue'
                                    ? 'teal-text darken-1'
                                    : 'pink-text darken-1',
                            ]"
                        >
                            {{ props.item.percent }}
                            <v-icon
                                :class="[
                                    props.item.name == 'revenue'
                                        ? 'teal-text darken-1'
                                        : 'pink-text darken-1 subheading',
                                ]"
                                class="text-darken-2"
                            >
                                arrow_drop_up
                            </v-icon>
                        </span>
                    </td>
                    <td class="text-xs-right mono">
                        <span
                            v-if="props.item.delta < 0"
                            :class="[
                                props.item.name == 'revenue'
                                    ? 'pink-text darken-1'
                                    : 'teal-text darken-1',
                            ]"
                        >
                            <strong>{{ props.item.delta | currency(currency) }}</strong>
                        </span>
                        <span
                            v-else-if="props.item.delta > 0"
                            :class="[
                                props.item.name == 'revenue'
                                    ? 'teal-text darken-1'
                                    : 'pink-text darken-1',
                            ]"
                        >
                            <strong>{{ props.item.delta | currency(currency) }}</strong>
                        </span>
                    </td>
                </tr>
            </template>

            <template slot="expand" slot-scope="props">
                <tr
                    v-for="(row, i) in props.item.children"
                    :key="`${i}-${props.item.ts}-{${props.item.type}}`"
                    class="expanded-row"
                >
                    <td class="name-cell body-2 text-capitalize">{{ row.name | translate }}</td>
                    <td class="text-xs-right body-2 mono">
                        {{ row.planned | currency(currency) }}
                    </td>
                    <td class="text-xs-right body-2 mono">{{ row.actual | currency(currency) }}</td>
                    <td class="text-xs-right percent mono">
                        <span
                            v-if="row.delta < 0"
                            :class="[
                                props.item.name == 'revenue'
                                    ? 'pink-text darken-1'
                                    : 'teal-text darken-1',
                            ]"
                        >
                            {{ row.percent }}
                            <v-icon
                                class="text-darken-3"
                                :class="[
                                    props.item.name == 'revenue'
                                        ? 'pink-text darken-1'
                                        : 'teal-text darken-1',
                                ]"
                            >
                                arrow_drop_down
                            </v-icon>
                        </span>
                        <span
                            v-else-if="row.delta > 0"
                            :class="[
                                props.item.name == 'revenue'
                                    ? 'teal-text darken-1'
                                    : 'pink-text darken-1',
                            ]"
                        >
                            {{ row.percent }}
                            <v-icon
                                :class="[
                                    props.item.name == 'revenue'
                                        ? 'teal-text darken-1'
                                        : 'pink-text darken-1 subheading',
                                ]"
                                class="text-darken-2"
                            >
                                arrow_drop_up
                            </v-icon>
                        </span>
                    </td>
                    <td class="text-xs-right mono">
                        <span
                            v-if="row.delta < 0"
                            :class="[
                                props.item.name == 'revenue'
                                    ? 'pink-text darken-1'
                                    : 'teal-text darken-1',
                            ]"
                        >
                            {{ row.delta | currency(currency) }}
                        </span>
                        <span
                            v-else-if="row.delta > 0"
                            :class="[
                                props.item.name == 'revenue'
                                    ? 'teal-text darken-1'
                                    : 'pink-text darken-1',
                            ]"
                        >
                            {{ row.delta | currency(currency) }}
                        </span>
                    </td>
                </tr>
            </template>
            <template slot="no-data" class="text-center">
                <div class="text-center">{{ 'no data' | translate }}</div>
            </template>
            <template slot="no-results" :value="true">
                <div class="text-center">{{ 'No matching records found' | translate }}</div>
            </template>
        </v-data-table>
    </v-card>
</template>

<style lang="scss" scoped>
.percent {
    .v-icon {
        $size: 13px;
        font-size: 13px !important;
        height: $size;
        width: $size;
        min-width: $size;
    }
}
.theme--light .month-row {
    background-color: #eee;
}
.theme--dark .month-row {
    background-color: #616161;
}
table.v-table thead td:not(:nth-child(1)),
table.v-table tbody td:not(:nth-child(1)),
table.v-table thead th:not(:nth-child(1)),
table.v-table tbody th:not(:nth-child(1)),
table.v-table thead td:first-child,
table.v-table tbody td:first-child,
table.v-table thead th:first-child,
table.v-table tbody th:first-child {
    padding: 8px !important;
}

table.v-table tbody td,
table.v-table tbody th {
    height: 38px !important;
}
//tr.pointer:hover {
//    background-color: rgba(63, 81, 181, 0.8) !important;
//    color: white !important;
//}
</style>
