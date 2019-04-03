<script>
import { mapState, mapGetters, mapActions } from 'vuex'

import CostField from '@/components/cost/field'
import formatCurrency from '@/utils/format-currency'
import ProductInput from '@/components/cost/productInput'
import KConfirm from '@/components/confirm'

const emptyCosts = {
    cogs: {
        planned: true,
        type: 'cogs',
        category: 'labor',
        direct: true,
        auto: false,
    },
    opex: {
        planned: true,
        type: 'opex',
        category: 'promotion',
        direct: true,
        auto: false,
        subcategory: 'other',
    },
    revenue: {
        planned: true,
        type: 'revenue',
        category: 'revenue',
        direct: true,
        auto: false,
        name: 'default',
    },
}

export default {
    components: { CostField, ProductInput, KConfirm },
    name: 'CostEditor',
    props: {
        edit: {
            type: Object,
            required: false,
        },
        initialType: {
            type: String,
            required: false,
            default: 'cogs',
        },
        expenses: {
            type: Boolean,
            default: false,
        },
        plan: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            record: {},
            periodField: {
                title: 'apply from',
                title2: 'months count',
                name: 'period',
                type: 'period',
                help: 'Period start and length',
            },
            showExtra: false,
            // use period of previous record for new record
            lastPeriod: null,
            type: this.initialType,
            valid: true,
        }
    },

    computed: {
        ...mapGetters(['currency']),
        ...mapState({
            user: state => state.account.user,
            project: state => state.projects.current,
            error: state => state.error,
        }),
        color() {
            return this.record.planned ? 'primary' : 'success'
        },
        categories() {
            switch (this.type) {
                case 'cogs':
                    return this.$store.state.projects.categories.cogs
                case 'cogm':
                    return this.$store.state.projects.categories.cogm
                case 'opex':
                    return this.$store.state.projects.categories.opex
                case 'revenue':
                    return this.$store.state.projects.categories.revenue
            }
            return []
        },
        category_titles() {
            return Object.keys(this.categories).map(k => {
                return {
                    ...this.categories[k],
                    title: this.$t(this.categories[k].title),
                    value: k,
                }
            })
        },
        category_fields() {
            return (
                this.categories[this.record.category] &&
                this.categories[this.record.category].fields
            )
        },
        category_noncost_fields() {
            return (
                this.category_fields &&
                this.category_fields.filter(f => {
                    return f.type != 'cost' && f.type != 'currency'
                })
            )
        },
        category_cost_fields() {
            return this.record.auto
                ? this.category_fields.filter(f => {
                      return f.type == 'cost' || f.type == 'currency'
                  })
                : []
        },
        is_editing() {
            return this.edit && this.edit.id
        },
        record_total() {
            return this.record.monthly && this.record.monthly.length
                ? this.record.monthly.slice(0, this.project.duration).reduce((total, c) => {
                      return total + (c.total != undefined ? c.total : c.price * c.quantity * 1)
                  }, 0)
                : 0
        },
        heading() {
            let heading = ''
            if (!this.record) return heading
            if (this.record.planned) {
                heading = this.is_editing ? 'record details' : 'add budget record'
            } else {
                heading = this.is_editing ? 'record details' : 'add actual record'
            }

            return heading
        },
    },

    watch: {
        edit: 'loadRecord',
        type(type) {
            // reset category if needed
            const categories = this.$store.state.projects.categories[type]
            if (!categories[this.record.category]) {
                this.record.category = Object.keys(categories)[0]
            }
            if (this.record && this.record.type !== type) {
                this.record.type = type
            }
        },
    },

    mounted() {
        this.record = Object.assign({}, emptyCosts[this.type])
        this.resetValidation()
    },

    tasks(t) {
        return {
            save: t(async function() {
                let { record } = this
                // prevent submitting with empty period
                if (
                    record.auto &&
                    (!record.period || !record.period.duration || record.period.start_from === null)
                ) {
                    record.period = { start_from: 0, duration: this.project.duration }
                }
                // remember last period
                this.lastPeriod = record.period

                this.resetError()

                let data = { project_id: this.project.id, record: this.record }
                let promise = this.record.id ? this.updateRecord(data) : this.addRecord(data)
                await promise.then(() => {
                    if (this.record.id) {
                        this.$emit('updated', this.record)
                    } else {
                        this.$emit('added', this.record)
                        let record = Object.assign({}, emptyCosts[this.type])
                        this.record = Object.assign(record, {
                            planned: this.record.planned,
                            category: this.record.category,
                            direct: this.record.direct,
                            auto: this.record.auto,
                            period: this.lastPeriod,
                        })
                        this.resetValidation()
                    }
                    this.$emit('reload')
                    if (this.record.id) {
                        this.$emit('close')
                    }
                })
            }).flow('drop'),

            clone: t(async function() {
                this.resetError()
                delete this.record.id
                this.record.name = this.record.name + ' ' + this.$t('copy')

                await this.addRecord({ project_id: this.project.id, record: this.record }).then(
                    record => {
                        this.$emit('added', this.record)
                        this.$emit('reload')
                        this.$emit('edit', record)
                    }
                )
            }).flow('drop'),

            remove: t(async function() {
                // TODO: add ability to undo for a couple of seconds?
                await this.deleteRecord({
                    project_id: this.project.id,
                    record_id: this.record.id,
                }).then(() => {
                    this.$emit('deleted', this.record)
                    this.$emit('reload')
                    this.$emit('close')
                })
            }).flow('drop'),
        }
    },

    methods: {
        ...mapActions(['resetError', 'addRecord', 'updateRecord', 'deleteRecord', 'handleError']),
        formatCurrency,
        resetValidation() {
            this.$nextTick(() => {
                this.$refs.form && this.$refs.form.resetValidation()
            })
        },
        tryToDelete() {
            this.resetError()
            if (!this.record.id) {
                this.remove.cancel()
                this.handleError('unknown record')
                return
            }
            this.remove.run()
        },
        loadRecord() {
            this.record =
                this.edit && this.edit.id
                    ? Object.assign({}, this.edit)
                    : Object.assign({}, emptyCosts[this.type])
            this.record.planned = this.record.id ? this.record.planned : this.plan

            let { record } = this
            if (
                record.auto &&
                (!record.period || !record.period.duration || record.period.start_from === null)
            ) {
                // set `apply from` and `month count`
                record.period = { ...this.lastPeriod }
            }
            if (this.expenses && this.edit && this.edit.type) {
                // set correct type
                this.type = this.edit.type
            }
            // this.$bus.$emit('expandCategory', this.record.category)
            this.resetValidation()
        },
        submit() {
            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.save.run()
        },
    },
}
</script>

<template>
    <v-card @keydown.esc="$emit('close')" min-width="380">
        <v-form @submit.prevent="submit" v-model="valid" ref="form" lazy-validation>
            <div class="white--text pb-0" :class="color">
                <div class="title font-weight-regular text-capitalize pa-3">
                    <v-layout align-center justify-space-between>
                        <v-flex>{{ heading | translate }}</v-flex>
                        <v-btn
                            class="white--text pull-right ma-0"
                            small
                            icon
                            @click="$emit('close')"
                        >
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-layout>
                </div>
                <v-select
                    v-if="record.type != 'revenue'"
                    v-model="record.category"
                    solo
                    :items="category_titles"
                    height="26px"
                    item-text="title"
                    :placeholder="'category' | translate"
                    item-value="value"
                    hide-details
                    class="mt-0 mb-0 mx-3 text-truncate"
                />
                <v-tooltip v-else bottom max-width="300">
                    <product-input
                        slot="activator"
                        v-model="record.product"
                        :label="'product' | translate"
                        class="mt-0 mb-0 mx-3 text-truncate text-capitalize"
                        :rules="[v => !!v || $t('Required Field')]"
                    />
                    <span v-if="$root.lang == 'en'">
                        Choose product from the drop-down menu or create new product by typing its
                        title and saving a record. You can manage Products in Product Manager later.
                    </span>
                    <span v-else>
                        ドロップダウンメニューからプロダクトを選択するか、直接タイトルを入力して記録を保存し新しいプロダクトを作成します。
                        後でプロダクト一覧でプロダクトを管理できます。
                    </span>
                </v-tooltip>
            </div>
            <v-container v-if="expenses" fluid class="darken-2 px-3 py-3" :class="color">
                <v-radio-group
                    v-model="type"
                    dark
                    :mandatory="true"
                    row
                    hide-details
                    class="ma-0 pa-0 radiobuttons"
                >
                    <v-tooltip max-width="300" bottom>
                        <v-radio
                            slot="activator"
                            key="cogs"
                            value="cogs"
                            :label="'COGS' | translate"
                            color="white"
                        />
                        <span>{{ 'Cost of Goods Sold' | translate }}</span>
                    </v-tooltip>
                    <v-tooltip max-width="300" bottom>
                        <v-radio
                            slot="activator"
                            key="opex"
                            value="opex"
                            :label="'OpEx' | translate"
                            color="white"
                        />
                        <span>{{ 'Operating Costs' | translate }}</span>
                    </v-tooltip>
                </v-radio-group>
            </v-container>
            <v-layout v-if="record.id" fluid class="darken-2 px-3 pb-2 pt-0" :class="color">
                <v-spacer />
                <div class="subheading white--text text-capitalize">
                    {{
                        'total: {total}'
                            | translate({ total: formatCurrency(record_total, currency) })
                    }}
                </div>
            </v-layout>
            <div class="content">
                <v-list v-if="categories.length != 0" class="pt-1 pb-2 px-0">
                    <v-list-tile
                        v-for="field in category_noncost_fields"
                        :key="field.name"
                        :disabled="false"
                    >
                        <cost-field
                            v-model="record[field.name]"
                            :project-length="project.duration"
                            :project-start="project.start_date"
                            autofocus="name"
                            :field="field"
                            :currency="currency"
                            :readonly="field.type == 'contact' && project.user_id != user.id"
                            :disabled="
                                (field.type == 'cost' || field.type == 'currency') &&
                                    is_editing &&
                                    !record.auto
                            "
                            style="width: 100%"
                        />
                    </v-list-tile>
                    <v-list-tile v-if="!record.auto && record.type == 'revenue' && !record.id">
                        <cost-field
                            v-model="record.date"
                            :project-length="project.duration"
                            :project-start="project.start_date"
                            :field="{ title: 'date', type: 'date' }"
                            style="width: 100%"
                        />
                    </v-list-tile>
                    <v-list-tile v-if="!record.auto && record.type == 'revenue' && !record.id">
                        <cost-field
                            v-model="record.cost"
                            :currency="currency"
                            :product="record.product"
                            :field="{ type: 'cost', title: 'product price', title2: 'quantity' }"
                            style="width: 100%"
                        />
                    </v-list-tile>
                    <v-list-tile>
                        <v-checkbox
                            v-model="record.auto"
                            class="text-capitalize mt-3 pt-1 pb-1"
                            :label="'auto-fill monthly data' | translate"
                            hide-details
                        >
                            <v-tooltip max-width="300" slot="append" bottom>
                                <v-icon slot="activator" size="19">help</v-icon>
                                <span>
                                    {{
                                        'Auto-fill based on monthly cost and selected period'
                                            | translate
                                    }}
                                </span>
                            </v-tooltip>
                        </v-checkbox>
                    </v-list-tile>
                    <v-list-tile
                        v-for="(field, i) in category_cost_fields"
                        :key="field.name"
                        :disabled="false"
                    >
                        <cost-field
                            v-model="record[field.name]"
                            :project-length="project.duration"
                            :project-start="project.start_date"
                            autofocus="name"
                            :field="field"
                            :currency="currency"
                            :disabled="
                                (field.type == 'cost' || field.type == 'currency') &&
                                    is_editing &&
                                    !record.auto
                            "
                            style="width: 100%"
                            v-show="i == 0 || showExtra"
                        />
                    </v-list-tile>
                    <v-list-tile
                        class="text-center"
                        v-if="
                            record.auto && category_cost_fields && category_cost_fields.length > 1
                        "
                    >
                        <v-btn flat block color="primary" @click="showExtra = !showExtra">
                            <v-icon :class="{ 'rot-90': !showExtra }">chevron_right</v-icon>
                            <span v-if="showExtra">{{ 'less' | translate }}</span>
                            <span v-else>{{ 'more' | translate }}</span>
                        </v-btn>
                    </v-list-tile>
                    <v-list-tile v-if="record.auto">
                        <cost-field
                            v-model="record.period"
                            :project-length="project.duration"
                            :project-start="project.start_date"
                            :field="periodField"
                            :currency="currency"
                            :disabled="is_editing && !record.auto"
                            style="width: 100%"
                        />
                    </v-list-tile>

                    <v-list-tile v-if="record.name || record.type != 'period'">
                        <v-btn
                            :disabled="remove.isActive || clone.isActive"
                            :loading="save.isActive"
                            type="submit"
                            class="mt-3 mx-0"
                            :class="color"
                            block
                        >
                            <span v-if="!is_editing">{{ 'add new record' | translate }}</span>
                            <span v-else>{{ 'update record' | translate }}</span>
                        </v-btn>
                    </v-list-tile>
                    <v-list-tile v-if="is_editing">
                        <v-layout>
                            <v-flex xs6>
                                <k-confirm
                                    title="Delete this record?"
                                    question="Deleting this record will remove all data associated with it."
                                    :max-width="600"
                                    @confirm="tryToDelete"
                                >
                                    <v-btn
                                        flat
                                        slot="button"
                                        color="danger"
                                        class="ml-0"
                                        block
                                        :loading="remove.isActive"
                                        :disabled="save.isActive || clone.isActive"
                                    >
                                        <v-icon>delete</v-icon>
                                        &nbsp;{{ 'delete record' | translate }}
                                    </v-btn>
                                </k-confirm>
                            </v-flex>
                            <v-flex xs6>
                                <v-btn
                                    v-if="record.name"
                                    :disabled="save.isActive || remove.isActive"
                                    :loading="clone.isActive"
                                    class="mr-0"
                                    flat
                                    color="accent"
                                    block
                                    @click="clone.run()"
                                >
                                    <v-icon>add_to_photos</v-icon>
                                    &nbsp;{{ 'duplicate record' | translate }}
                                </v-btn>
                            </v-flex>
                        </v-layout>
                    </v-list-tile>
                </v-list>
                <v-list v-else>
                    <v-list-tile>
                        <div class="note-block alert">{{ error }}</div>
                    </v-list-tile>
                </v-list>
            </div>
        </v-form>
    </v-card>
</template>

<style lang="scss">
.content {
    .v-list {
        padding: 19px 12px;
    }
    .v-list__tile {
        height: auto;
    }
}

.v-text-field.v-text-field--solo .v-input__control {
    min-height: 36px;
}

.radiobuttons {
    .v-input__slot {
        margin: 0;
    }
    .v-input__control {
        margin: 0 auto;

        .v-radio {
            flex: 1;
            margin: 0 20px;
            label {
                font-size: 14px;
                flex: 1;
            }
        }
    }
}
</style>
