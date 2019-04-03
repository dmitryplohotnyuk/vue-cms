<template>
    <div class="vue-editable">
        <span
            v-show="!isEditing"
            class="vue-editable-value"
            :class="{ 'vue-editable-empty': isValueEmpty }"
            @click="startEditing"
            v-html="getHTMLValue()"
        />

        <div v-show="isEditing" class="vue-editable-control">
            <input
                v-if="type === 'text'"
                v-model="model"
                autofocus
                class="vue-editable-form-control"
                type="text"
                v-bind="attributes"
                @keydown="onKeyDown"
                @blur="stopEditing"
            />

            <textarea
                v-else-if="type === 'textarea'"
                v-model="model"
                class="vue-editable-form-control"
                v-bind="attributes"
                @blur="stopEditing"
            />

            <input
                v-else-if="type === 'number'"
                v-model="model"
                class="vue-editable-form-control"
                type="number"
                v-bind="attributes"
                @keydown="onKeyDown"
                @blur="stopEditing"
            />
        </div>
    </div>
</template>

<script>
import formatCurrency from '@/utils/format-currency'
import numbro from 'numbro'

export default {
    name: 'VueEditable',
    props: {
        value: {
            type: [String, Number, Array],
        },
        type: {
            type: String,
            required: false,
            default: 'text',
        },
        empty: {
            type: String,
            required: false,
            default: 'Empty',
        },
        placeholder: {
            type: String,
            required: false,
            default: '',
        },
        options: {
            type: Array,
            default: function() {
                return []
            },
        },
        suffix: {
            type: String,
            required: false,
            default: '',
        },
        format: {
            type: Boolean,
            required: false,
            default: false,
        },
        currency: {
            type: String,
            required: false,
        },
    },
    data() {
        return {
            isEditing: false,
            rawValue: this.value,
        }
    },
    computed: {
        isValueEmpty() {
            return this.rawValue === null || this.rawValue === undefined || this.rawValue === ''
        },
        // TODO: rewrite using mixing to avoid input attributes contaminating parent div
        attributes() {
            return {
                ...this.$attrs,
                type: this.type,
                placeholder: this.placeholder,
            }
        },
        model: {
            get() {
                return this.rawValue
            },
            set(value) {
                if (
                    value.constructor
                        .toString()
                        .match(/function (\w*)/)[1]
                        .toLowerCase() !== 'inputevent'
                ) {
                    this.$nextTick(() => {
                        this.rawValue = value
                    })
                }
            },
        },
    },
    watch: {
        options(newOptions) {
            this.rawValue = newOptions.find(o => {
                const v = Array.isArray(o) ? o[0] : o
                return v === this.rawValue
            })
        },
        rawValue(val) {
            this.$emit('input', val)
        },
        value(val) {
            this.rawValue = val
        },
    },
    mounted() {
        if (this.currency) {
            this.rawValue = Number(this.rawValue).toFixed(this.currency == '￥' ? 0 : 2)
        }
    },
    methods: {
        getHTMLValue() {
            if (this.isValueEmpty) {
                return this.empty
            }
            if (this.rawValue === undefined || this.rawValue === null) {
                return '?'
            }
            if (this.format && this.currency) {
                return formatCurrency(this.rawValue, this.currency) + this.suffix
            } else if (this.format) {
                return numbro(this.rawValue).format({ thousandSeparated: true })
            }
            return this.rawValue + this.suffix
        },
        startEditing(event) {
            this.isEditing = true
            let that = this
            that.$emit('start-editing', this.rawValue, this.name)
            setTimeout(function() {
                let inputs = Array.from(event.target.nextElementSibling.children)
                inputs.forEach(i => i.focus())
            }, 100)
        },
        stopEditing(event) {
            this.isEditing = false
            this.$emit('stop-editing', this.rawValue, this.name, event)
        },
        onKeyDown(e) {
            if (e.keyCode == 13) {
                this.isEditing = false
                this.$emit('stop-editing', this.rawValue, this.name)
            }
        },
    },
}
</script>

<style>
.vue-editable {
    color: #222;
}

.vue-editable:hover {
    /*    color: #666;*/
}

.vue-editable-value {
    cursor: pointer;
    white-space: pre-wrap;
    user-select: none;
}

.vue-editable-empty {
    color: #666;
    font-style: italic;
}

.vue-editable-control {
}

.vue-editable-form-control {
    padding: 5px;
    box-sizing: content-box;
    color: inherit;
    background-color: inherit;
    background-image: none;
    outline: none;
}
</style>
