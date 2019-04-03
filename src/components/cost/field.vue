<script>
import addMonths from 'date-fns/add_months'
import format from 'date-fns/format'
import ContactInput from '@/components/cost/contactInput'
import ProductInput from '@/components/cost/productInput'

var locales = {
    en: require('date-fns/locale/en'),
    ja: require('date-fns/locale/ja'),
}

export default {
    name: 'CostField',
    components: { ContactInput, ProductInput },
    filters: {
        formatValues(values) {
            return Object.keys(values).map(value => {
                return {
                    text: values[value],
                    value: Number(value),
                }
            })
        },
    },
    props: {
        title: {
            type: String,
            required: false,
        },
        field: {
            type: Object,
            required: true,
        },
        currency: {
            type: String,
            required: false,
        },
        projectLength: {
            type: [String, Number],
            required: false,
            default: 1,
        },
        projectStart: {
            type: [Date, String],
            required: false,
        },
        value: {
            required: false,
        },
        disabled: {
            required: false,
            default: false,
        },
        autofocus: {
            type: String,
            required: false,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        product: {
            type: Object,
            required: false,
        },
    },

    data() {
        return {
            proxy: {},
            datemenu: false,
        }
    },

    computed: {
        model: {
            get() {
                this.reset()
                if (this.proxy && this.field.type === 'currency') {
                    return Number(this.proxy).toFixed(this.currency == '￥' ? 0 : 2)
                }
                return this.proxy
            },
            set(value) {
                this.$nextTick(() => {
                    this.proxy = value
                })
            },
        },
        total() {
            return this.field.type != 'labor'
                ? this.proxy.price * this.proxy.quantity
                : this.getTotal()
        },
        months() {
            let months = []
            for (var i = 0; i < Number(this.projectLength); i++) {
                months.push(
                    format(addMonths(this.projectStart, i), 'YYYY/MM', {
                        locale: locales[this.$root.lang],
                    })
                )
            }
            return months
        },
        reduced_months() {
            let len = this.proxy
                ? this.proxy.start_from
                    ? Number(this.projectLength) - this.proxy.start_from
                    : Number(this.projectLength)
                : Number(this.projectLength)
            return Array.from({ length: len }, (x, i) => i + 1)
        },
        step() {
            if (this.currency == '￥') {
                return 1
            }
            return 0.01
        },
        max() {
            if (this.currency == '￥') {
                return 999999999999
            }
            return 999999999999.99
        },
    },

    watch: {
        value(val) {
            this.proxy = val
        },
        proxy(val) {
            this.$emit('input', val)
        },
        'model.price': function(val) {
            if (!this.model.quantity && val) {
                this.model.quantity = 1
            }
        },
        'model.start_from': function(val) {
            if (!this.model.duration && val) {
                this.model.duration = 1
            }
        },
        product: function(val) {
            this.proxy.price = val ? val.amount : null
        },
    },

    mounted() {
        // programmatically set focus on input
        setTimeout(() => {
            const el = this.$refs[this.autofocus]
            if (!(el && el.$el)) {
                return
            }
            const inputEl = el.$el.querySelector('input')
            if (!inputEl) {
                return
            }
            // prevent scroll on focus in firefox
            // source: https://stackoverflow.com/questions/4963053/focus-to-input-without-scrolling
            if (typeof window !== 'undefined') {
                const x = window.scrollX,
                    y = window.scrollY
                inputEl.focus({ preventScroll: true })
                inputEl.select()
                window.scrollTo(x, y)
            }
        }, 100)
        this.proxy = this.value
        if (this.proxy && this.proxy.price) {
            this.proxy.price = Number(this.proxy.price).toFixed(this.currency == '￥' ? 0 : 2)
        } else if (this.proxy && this.field.type == 'period' && !this.proxy.start_from) {
            this.proxy.start_from = 0
            this.proxy.duration = this.projectLength
        }
        if (this.field.type == 'date') {
            this.proxy = null
        }
    },
    methods: {
        reset() {
            if (this.field.type == 'period' && !this.proxy) {
                this.proxy = { start_from: null, duration: null }
            } else if (this.field.type == 'cost' && !this.proxy) {
                this.proxy = { price: null, quantity: null }
            }
        },
        translateValues(values) {
            return Object.keys(values).map(value => {
                return {
                    text: this.$t(values[value]),
                    value: value,
                }
            })
        },
        getTotal() {
            let total = Number(this.model.price * this.model.quantity)
            if (!this.model.meta) {
                return total
            }
            total += this.model.meta.overtime * 1 || 0
            total += this.model.meta.commuting * 1 || 0
            total += this.model.meta.welfare * 1 || 0
            total += this.model.meta.bonus * 1 || 0
            total += this.model.meta.retirement * 1 || 0
            return total
        },
    },
}
</script>

<template>
    <v-container :class="{ 'field-disabled': disabled }" fluid class="pa-0">
        <v-layout v-if="field.type == 'period'" row>
            <v-flex sm6>
                <v-select
                    v-model="model.start_from"
                    :id="field.title"
                    :label="field.title | translate"
                    :disabled="disabled"
                    class="text-capitalize"
                    dense
                    :items="months | formatValues"
                />
            </v-flex>
            <v-flex sm6>
                <v-select
                    v-model="model.duration"
                    :id="field.title2"
                    :label="field.title2 | translate"
                    class="text-capitalize"
                    :disabled="disabled"
                    dense
                    :items="reduced_months"
                >
                    <v-tooltip max-width="300" v-if="field.help" slot="append-outer" bottom>
                        <v-icon slot="activator" size="19" class="mt-1">help</v-icon>
                        <span>{{ field.help | translate }}</span>
                    </v-tooltip>
                </v-select>
            </v-flex>
        </v-layout>
        <v-layout v-else-if="field.type == 'select'" row>
            <v-flex sm12>
                <v-select
                    v-model="model"
                    :id="field.name"
                    :label="field.name | translate"
                    class="text-capitalize"
                    dense
                    :items="translateValues(field.values)"
                />
            </v-flex>
        </v-layout>
        <v-layout v-else-if="field.type == 'contact'" row>
            <v-flex sm12>
                <v-tooltip bottom :disabled="!readonly" max-width="300">
                    <contact-input
                        v-model="model"
                        :label="field.title | translate"
                        class="text-capitalize"
                        :required="field.required"
                        :readonly="readonly"
                        slot="activator"
                    />
                    <span v-if="readonly">
                        <span v-if="$root.lang == 'en'">
                            Currently, you cannot add Vendor or Customer to the shared project which
                            was not created by you. These fields are read-only for collaborators.
                        </span>
                        <span v-else>
                            現在、自身で作成されていない共有プロジェクトにベンダーや顧客を追加することはできません。
                            これらのフィールドは共同編集者には読み取り専用です。
                        </span>
                    </span>
                </v-tooltip>
            </v-flex>
        </v-layout>
        <v-layout v-else-if="field.type == 'product'" row>
            <v-flex sm12>
                <product-input
                    v-model="model"
                    :label="field.title | translate"
                    class="text-capitalize"
                    :required="field.required"
                    :readonly="readonly"
                />
            </v-flex>
        </v-layout>
        <v-layout v-else-if="field.type == 'date'" row>
            <v-flex sm12>
                <v-menu
                    v-model="datemenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    min-width="290px"
                >
                    <v-text-field
                        slot="activator"
                        v-model="model"
                        :label="field.title | translate"
                        class="text-capitalize"
                        readonly
                        :rules="[v => !!v || $t('Required Field')]"
                    />
                    <v-date-picker v-model="model" @input="datemenu = false" :min="projectStart" />
                </v-menu>
            </v-flex>
        </v-layout>
        <v-layout v-else-if="field.type == 'cost'" row wrap>
            <v-flex sm7>
                <v-text-field
                    ref="currency"
                    :id="field.title"
                    v-model="model.price"
                    :label="field.title | translate"
                    class="text-capitalize"
                    :preprend-icon="currency"
                    :disabled="disabled"
                    type="number"
                    min="0"
                    :rules="[v => !v || v <= 9999999999 || $t('10 digits maximum')]"
                    :max="max"
                    :step="step"
                />
            </v-flex>
            <v-flex sm5>
                <v-text-field
                    v-model="model.quantity"
                    :id="field.title2"
                    :label="field.title2 | translate"
                    :rules="[v => !v || v <= 65535 || $t('Max value is 65535')]"
                    class="text-capitalize"
                    :disabled="disabled"
                    type="number"
                    min="1"
                    step="1"
                >
                    <v-tooltip max-width="300" v-if="field.help" slot="append-outer" bottom>
                        <v-icon slot="activator" size="19" class="mt-1">help</v-icon>
                        <span>{{ field.help | translate }}</span>
                    </v-tooltip>
                </v-text-field>
            </v-flex>
            <v-flex sm12>
                <v-text-field
                    :label="'total' | translate"
                    id="total"
                    class="text-capitalize"
                    :value="total | currency(currency)"
                    readonly
                    disabled
                >
                    <v-tooltip max-width="300" slot="append-outer" bottom>
                        <v-icon slot="activator" size="19" class="mt-1">help</v-icon>
                        <span class="text-capitalize">{{ 'total cost' | translate }}</span>
                    </v-tooltip>
                </v-text-field>
            </v-flex>
        </v-layout>
        <v-layout v-else-if="field.type == 'labor'" row wrap>
            <v-flex sm6>
                <v-text-field
                    ref="currency"
                    :id="field.title"
                    v-model="model.price"
                    :label="field.title | translate"
                    class="text-capitalize"
                    :preprend-icon="currency"
                    :disabled="disabled"
                    type="number"
                    min="0"
                    :max="max"
                    :step="step"
                />
            </v-flex>
            <v-flex sm6 v-if="model.meta">
                <v-text-field
                    v-model="model.meta.overtime"
                    :label="'overtime' | translate"
                    :prefix="currency"
                    min="0"
                    :step="step"
                    :max="max"
                    type="number"
                    class="text-capitalize"
                />
            </v-flex>
            <v-flex sm6 v-if="model.meta">
                <v-text-field
                    v-model="model.meta.commuting"
                    :label="'commuting' | translate"
                    :prefix="currency"
                    min="0"
                    :step="step"
                    :max="max"
                    type="number"
                    class="text-capitalize"
                />
            </v-flex>
            <v-flex sm6 v-if="model.meta">
                <v-text-field
                    v-model="model.meta.welfare"
                    :label="'welfare' | translate"
                    :prefix="currency"
                    min="0"
                    :step="step"
                    :max="max"
                    type="number"
                    class="text-capitalize"
                />
            </v-flex>
            <v-flex sm6 v-if="model.meta">
                <v-text-field
                    v-model="model.meta.bonus"
                    :label="'bonus' | translate"
                    :prefix="currency"
                    min="0"
                    :step="step"
                    :max="max"
                    type="number"
                    class="text-capitalize"
                />
            </v-flex>
            <v-flex sm6 v-if="model.meta">
                <v-text-field
                    v-model="model.meta.retirement"
                    :label="'retirement' | translate"
                    :prefix="currency"
                    min="0"
                    :step="step"
                    :max="max"
                    type="number"
                    class="text-capitalize"
                />
            </v-flex>
            <v-flex sm12>
                <v-text-field
                    :label="'total' | translate"
                    id="total"
                    class="text-capitalize"
                    :value="total | currency(currency)"
                    readonly
                    disabled
                >
                    <v-tooltip max-width="300" slot="append-outer" bottom>
                        <v-icon slot="activator" size="19" class="mt-1">help</v-icon>
                        <span class="text-capitalize">{{ 'total cost' | translate }}</span>
                    </v-tooltip>
                </v-text-field>
            </v-flex>
        </v-layout>
        <div v-else>
            <v-text-field
                v-if="field.type == 'currency'"
                :id="field.title"
                v-model="model"
                :label="field.title | translate"
                :autofocus="field.name == autofocus"
                :disabled="disabled"
                :required="field.required"
                :prefix="currency"
                min="0"
                :step="step"
                :max="max"
                type="number"
                class="text-capitalize"
            >
                <v-tooltip max-width="300" v-if="field.help" slot="append-outer" bottom>
                    <v-icon slot="activator" size="19" class="mt-1">help</v-icon>
                    <span>{{ field.help | translate }}</span>
                </v-tooltip>
            </v-text-field>
            <v-text-field
                v-else
                :autofocus="field.name == autofocus"
                v-model="model"
                :id="field.title"
                :label="field.title | translate"
                :type="field.type"
                :required="field.required"
                :rules="field.required ? [v => !!v || $t('Required Field')] : []"
                class="text-capitalize"
            >
                <v-tooltip max-width="300" v-if="field.help" slot="append-outer" bottom>
                    <v-icon slot="activator" size="19" class="mt-1">help</v-icon>
                    <span>{{ field.help | translate }}</span>
                </v-tooltip>
            </v-text-field>
        </div>
    </v-container>
</template>
