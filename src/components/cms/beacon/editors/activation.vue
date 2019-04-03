<script>
export default {
    components: {},
    props: ['bannerCode'],
    data() {
        return {
            copied: false,
        }
    },
    computed: {
        code() {
            const { bannerCode } = this
            if (!bannerCode) return null
            /* eslint-disable-next-line no-useless-escape */
            return `<script>\n ${this.bannerCode}\n<\/script>`
        },
    },
    watch: {
        rawCode(rawCode) {
            this.block.jscode = rawCode
        },
    },
    methods: {
        copy() {
            const el = document.createElement('textarea')
            el.value = this.code
            document.body.appendChild(el)
            el.select()
            document.execCommand('copy')
            document.body.removeChild(el)
            this.copied = true
        },
        activate() {
            this.showCode = !this.showCode
            if (this.showCode) {
                this.$emit('activate')
            }
        },
    },
}
</script>

<template>
    <div v-if="bannerCode">
        <div class="text-right">
            <v-btn small color="primary" @click="copy" class="mx-0">
                {{ 'copy' | translate }}
            </v-btn>
        </div>
        <pre style="overflow-x: scroll" class="grey lighten-3 pa-3" ref="code">{{ code }}</pre>

        <v-snackbar v-model="copied" color="success" bottom>
            {{ 'Code was copied to clipboard!' | translate }}
        </v-snackbar>
    </div>
</template>

<style lang="scss" scoped></style>
