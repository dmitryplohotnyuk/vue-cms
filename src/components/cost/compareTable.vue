<script>
import { mapActions } from 'vuex'

import format from 'date-fns/format'
import addMonths from 'date-fns/add_months'

import { toArray } from 'lodash'
import Sticky from 'vue-sticky-directive'

import VDataTable from '@/components/VDataTable'

var locales = {
    en: require('date-fns/locale/en'),
    ja: require('date-fns/locale/ja'),
}

function wrapArray(a) {
    if (Array.isArray(a)) return a
    return Array(a)
}

export default {
    name: 'CompareCostTable',
    components: { VDataTable },
    directives: {
        Sticky,
        resize: {
            componentUpdated: function(el, binding, vnode) {
                if (binding.value == 'filter') {
                    el.parentNode.style.width =
                        wrapArray(vnode.context.$refs['filtercell'])[0].$el.parentNode.clientWidth +
                        'px'
                } else if (binding.value == 'name') {
                    el.style.width =
                        wrapArray(vnode.context.$refs['namecell'])[0].clientWidth + 'px'
                } else {
                    el.parentNode.style.width =
                        wrapArray(vnode.context.$refs[`${binding.value}cell`])[0].parentNode
                            .clientWidth + 'px'
                }
            },
        },
    },
    props: {
        compare: {
            type: Object,
            required: true,
        },
        titles: {
            type: Array,
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
    },

    data() {
        return {
            sending: false,
            quarterly: false,
            expanded: {},
            loading: true,
            search: null,
            pagination: {
                limit: 3,
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
        perPage() {
            const perPage = [3, 6, 12, 24, -1]
            return perPage
                .filter(i => i < this.periodLength)
                .map(item => {
                    item = item == -1 ? this.periodLength : item
                    return { value: item, text: Number(item).toLocaleString(this.$root.lang) }
                })
        },

        months() {
            var data = []
            let max =
                this.pagination.offset + this.pagination.limit > this.periodLength
                    ? this.periodLength
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

        secondHeader() {
            let data = []
            this.titles.forEach(h => data.push(h))
            this.months.forEach(() => {
                this.titles.forEach(h => data.push(h))
            })
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
                },
                {
                    text: this.$t('Total'),
                    sortable: false,
                    align: 'right',
                    value: 'total',
                    name: 'total',
                },
            ]
            this.months.map(h => {
                headers.push({
                    text: h,
                    name: h,
                    sortable: false,
                    align: 'right',
                    value: 'price',
                })
            })
            return headers
        },

        rows() {
            let rows = []
            if (!this.compare.actual.length) return rows
            let categories = {}
            for (var i = 0; i < this.compare.actual.length; i++) {
                let record = this.compare.actual[i]
                let c = this.compare.actual[i].category
                // group label
                const name = this.$t(
                    (this.categories[c] && this.categories[c].title) || 'Initial Cost'
                )
                let categoryRow = categories[c]
                    ? categories[c]
                    : {
                          name,
                          category: c,
                          total: [],
                          totals: {},
                          children: [],
                          expandable: true,
                      }

                let row = this.getRow(categoryRow, record)

                categoryRow.children.push(row)

                categoryRow.total[0] = toArray(categoryRow.children).reduce((total, r) => {
                    return r.total[0] + total
                }, 0)
                categoryRow.total[1] = toArray(categoryRow.children).reduce((total, r) => {
                    return r.total[1] + total
                }, 0)
                categoryRow.total[2] = categoryRow.total[1] - categoryRow.total[0]

                categories[c] = categoryRow
            }
            // categoryRow.expandable = categoryRow.children.length > 1
            Object.keys(categories).forEach(c => {
                let totals = []
                // toArray(categories[c].totals).forEach(t => totals.push(...t))
                // FIXME: need to use array sum but need negative values
                totals = toArray(categories[c].totals).map(m => {
                    m.push(m[1] - m[0])
                    return m
                })
                categories[c].totals = []
                totals.forEach(t => categories[c].totals.push(...t))
                // categories[c].totals = totals
                rows.push(categories[c])
            })
            // eslint-disable-next-line
            this.loading = false
            return rows
        },
    },

    watch: {},

    mounted() {},

    methods: {
        ...mapActions(['resetError', 'saveCostMonthly']),
        _handleError() {
            this.sending = false
        },
        expand(props) {
            if (!props.item.expandable) return
            props.expanded = !props.expanded
        },
        getRow(categoryRow, record) {
            let row = {
                id: record.id,
                name: record.name,
                total: [],
                cost: record,
                monthly: [],
                category: record.category,
            }
            let groupedMonthly = {}
            ;[this.compare.planned.find(r => r.name == record.name), record].forEach(
                (cost, key) => {
                    cost = cost || {}
                    let all = toArray(cost.monthly).slice(0, Number(this.periodLength))

                    let rowTotal = all.reduce((total, c) => {
                        return total + (c.total != undefined ? c.total : c.price * c.quantity * 1)
                    }, 0)

                    row.total[key] = rowTotal
                    row.total[2] = row.total[1] - (row.total[0] || 0)

                    if (!all.length) {
                        all = Array(this.periodLength).fill({ total: 0 })
                    }
                    let monthly = all.slice(
                        this.pagination.offset,
                        this.pagination.offset + this.pagination.limit
                    )
                    for (var j = 0; j < monthly.length; j++) {
                        if (!categoryRow.totals[this.months[j]]) {
                            categoryRow.totals[this.months[j]] = Array(2).fill(0)
                        }
                        if (!groupedMonthly[this.months[j]]) {
                            groupedMonthly[this.months[j]] = []
                        }
                        let mtot =
                            monthly[j].total != undefined
                                ? monthly[j].total
                                : monthly[j].price * monthly[j].quantity
                        categoryRow.totals[this.months[j]][key] += mtot
                        groupedMonthly[this.months[j]].push(mtot)
                    }
                }
            )
            Object.keys(groupedMonthly).forEach(month => {
                groupedMonthly[month].push(groupedMonthly[month][1] - groupedMonthly[month][0])
                row.monthly.push(...groupedMonthly[month])
            })
            return row
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
                    return true
                } else if (children.length) {
                    item.children = children
                    return true
                }
                return false
            })
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
        <div class="v-datatable__actions" v-if="pagination.limit <= periodLength">
            <div class="v-datatable__actions__select">
                <span class="first-capitalize grey--text">
                    {{ 'months per page' | translate }}:
                </span>
                <v-select
                    v-model="pagination.limit"
                    hideDetails
                    :items="perPage"
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
                :disabled="pagination.offset + pagination.limit >= periodLength"
            >
                <v-icon>chevron_right</v-icon>
            </v-btn>
        </div>

        <div v-sticky sticky-offset="offset" class="cost-table-sticky-header">
            <v-data-table
                :headers="columns"
                :items="[]"
                hide-actions
                :loading="loading"
                :pagination.sync="pagination2"
                class="inset-shadows header-sticky"
            >
                <template slot="headers" slot-scope="props">
                    <tr>
                        <th
                            v-for="header in props.headers"
                            :key="header.text"
                            class="pl-3 pr-0"
                            :colspan="header.name == 'name' ? 0 : 2"
                        >
                            <v-text-field
                                v-if="header.name == 'name'"
                                v-model="search"
                                v-resize="'filter'"
                                :label="'filter' | translate"
                                append-icon="search"
                                single-line
                                clearable
                                hide-details
                                style="min-width: 150px"
                                class="text-capitalize search-cell pa-0"
                            />
                            <span v-else v-resize="header.name">{{ header.text }}</span>
                        </th>
                    </tr>
                    <tr style="height: 26px">
                        <th v-resize="'name'">&nbsp;</th>
                        <th
                            v-for="(h, i) in secondHeader"
                            :key="`sh${i}`"
                            class="text-capitalize"
                            :class="{ 'border-right': h == 'actual' }"
                        >
                            {{ h | translate }}
                        </th>
                    </tr>
                </template>
            </v-data-table>
        </div>
        <v-data-table
            :headers="columns"
            :items="rows"
            expand
            hide-actions
            item-key="name"
            :loading="loading"
            :custom-filter="filterRows"
            :search="search"
            :pagination.sync="pagination2"
            :class="{ 'inset-shadows': pagination.limit > 3 }"
        >
            <template slot="headers" slot-scope="props">
                <tr>
                    <th
                        v-for="header in props.headers"
                        :key="header.text"
                        class="pl-3 pr-0"
                        :colspan="header.name == 'name' ? 0 : 3"
                    >
                        <v-text-field
                            v-if="header.name == 'name'"
                            v-model="search"
                            ref="filtercell"
                            :label="'filter' | translate"
                            append-icon="search"
                            single-line
                            clearable
                            hide-details
                            style="min-width: 150px"
                            class="text-capitalize search-cell pa-0"
                        />
                        <span v-else-if="header.name == 'total'" ref="totalcell">
                            {{ header.text }}
                        </span>
                        <span v-else :ref="`${header.name}cell`">{{ header.text }}</span>
                    </th>
                </tr>
                <tr style="height: 26px">
                    <th ref="namecell"></th>
                    <th
                        v-for="(h, i) in secondHeader"
                        :key="`sh${i}`"
                        class="text-capitalize"
                        :class="{ 'border-right': h == 'difference' }"
                    >
                        {{ h | translate }}
                    </th>
                </tr>
            </template>

            <template slot="items" slot-scope="props">
                <tr @click="expand(props)" :class="{ pointer: props.item.expandable }">
                    <td class="name-cell body-2">
                        {{ props.item.name }}
                        <span class="right" v-if="props.item.expandable">
                            <transition name="fade" mode="out-in">
                                <v-icon :v-key="'down'" class="text-darken-3" v-if="props.expanded"
                                    >keyboard_arrow_down</v-icon
                                >
                                <v-icon :v-key="'right'" class="text-darken-3" v-else
                                    >keyboard_arrow_right</v-icon
                                >
                            </transition>
                        </span>
                    </td>
                    <td
                        v-for="(total, i) in props.item.total"
                        class="text-xs-right body-2 mono"
                        :key="`it${i}`"
                        :class="{ 'border-right': i == props.item.total.length - 1 }"
                    >
                        <span
                            :class="{
                                'red-text': i == props.item.total.length - 1 && total > 0,
                                'teal-text': i == props.item.total.length - 1 && total < 0,
                            }"
                            ><strong>{{ Math.abs(total) | currency(currency) }}</strong></span
                        >
                    </td>
                    <td
                        v-for="(total, i) in props.item.totals"
                        :key="`i${i}`"
                        class="text-xs-right body-2 mono"
                        :class="{ 'border-right': i % 3 == 2 }"
                    >
                        <span
                            :class="{
                                'red-text': i % 3 == 2 && total > 0,
                                'teal-text': i % 3 == 2 && total < 0,
                            }"
                            >{{ Math.abs(total) | currency(currency) }}</span
                        >
                    </td>
                </tr>
            </template>

            <template slot="expand" slot-scope="props">
                <tr
                    v-for="(row, i) in props.item.children"
                    :key="`${row.cost.id}${i}`"
                    class="expanded-row"
                >
                    <td class="name-cell pl-4">{{ row.name }}</td>
                    <td
                        v-for="(total, i) in row.total"
                        :key="`t${i}`"
                        class="text-xs-right font-weight-medium mono"
                        :class="{ 'border-right': i % 3 == 2 }"
                    >
                        <span
                            :class="{
                                'red-text': i % 3 == 2 && total > 0,
                                'teal-text': i % 3 == 2 && total < 0,
                            }"
                            >{{ Math.abs(total) | currency(currency) }}</span
                        >
                    </td>
                    <td
                        v-for="(m, i) in row.monthly"
                        :key="i"
                        class="text-xs-right price-cell mono"
                        :class="{ 'border-right': i % 3 == 2 }"
                    >
                        <span class="text-xs-right">
                            <span
                                v-if="m != 0"
                                :class="{
                                    'red-text': i % 3 == 2 && m > 0,
                                    'teal-text': i % 3 == 2 && m < 0,
                                }"
                                >{{ Math.abs(m) | currency(currency) }}</span
                            >
                            <span v-else>-</span>
                        </span>
                    </td>
                </tr>
            </template>
        </v-data-table>
    </div>
</template>

<style lang="css" scoped>
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
.border-right {
    border-top: none;
    border-right: 1px solid rgba(0, 0, 0, 0.1) !important;
}
</style>
