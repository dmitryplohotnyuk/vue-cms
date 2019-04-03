<script>
export default {
    name: 'KDialog',
    props: {
        width: {
            type: [Number, String],
        },
        maxWidth: {
            type: [Number, String],
        },
        value: {
            default: false,
        },
        fullscreen: {
            default: false,
        },
        lazy: {
            default: true,
        },
        persistent: {
            default: false,
        },
    },
    data() {
        return {
            proxy: this.value,
            windowWidth: window.innerWidth,
        }
    },
    computed: {
        model: {
            get() {
                return this.proxy
            },
            set(value) {
                if (value == null) {
                    return
                }
                if (
                    value.constructor
                        .toString()
                        .match(/function (\w*)/)[1]
                        .toLowerCase() !== 'inputevent'
                ) {
                    this.$nextTick(() => {
                        this.proxy = value
                    })
                }
            },
        },
        useFullscreen() {
            return this.fullscreen || this.$vuetify.breakpoint.smAndDown
        },
    },
    watch: {
        value(val) {
            this.proxy = val
        },
        proxy(isActive) {
            this.$nextTick().then(() => {
                if (isActive) {
                    this.$emit('dialog-opened')
                } else {
                    this.$emit('dialog-closed')
                }
                this.$emit('input', isActive)
            })
        },
    },
    mounted() {
        this.proxy = this.value
        window.onresize = () => {
            this.windowWidth = window.innerWidth
        }
    },
    methods: {
        closeDialog() {
            // this.$emit('update:active', false)
            this.model = false
        },
    },
}
</script>
<template>
    <v-dialog
        v-model="model"
        :fullscreen="useFullscreen"
        :width="width"
        :max-width="maxWidth"
        :lazy="lazy"
        :persistent="persistent"
        @keydown.esc="closeDialog"
        :content-class="$vuetify.breakpoint.xs ? 'popover-fullscreen' : ''"
    >
        <slot /><slot name="activator" slot="activator" />
    </v-dialog>
</template>
