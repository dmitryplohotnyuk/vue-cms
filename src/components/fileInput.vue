<script>
export default {
    props: {
        value: {
            type: [Array, String],
        },
        accept: {
            type: String,
            default: '*',
        },
        label: {
            type: String,
            default: 'Please choose...',
        },
        required: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        multiple: {
            type: Boolean, // not yet possible because of data
            default: false,
        },
    },
    data() {
        return {}
    },

    methods: {
        getFormData(files) {
            const data = new FormData()
            ;[...files].forEach(file => {
                data.append('data', file, file.name) // currently only one file at a time
            })
            return data
        },
        onFocus() {
            if (!this.disabled) {
                this.$refs.fileInput.click()
            }
        },
        onFileChange($event) {
            const files = $event.target.files || $event.dataTransfer.files
            const form = this.getFormData(files)
            if (files) {
                if (files.length > 0) {
                    this.url = [...files].map(file => file.name).join(', ')
                    this.createImage(files[0])
                }
            }
            this.$emit('formData', form)
        },
        createImage(file) {
            let reader = new FileReader()
            reader.onload = event => {
                this.$emit('input', event.target.result)
            }
            reader.readAsDataURL(file)
        },
        clear() {
            const input = this.$refs.fileInput
            input.value = ''
            this.$emit('input', '')
        },
    },
}
</script>
<template>
    <div>
        <label>{{ label }}</label>
        <v-layout row wrap v-if="value">
            <v-flex xs12 class="pb-0">
                <div class="elevation-1">
                    <v-img contain height="100" :src="value" class="grey lighten-2"></v-img>
                    <v-toolbar dense flat>
                        <v-btn class="ma-0" flat block @click.native="onFocus">
                            {{ 'change' | translate }}
                        </v-btn>
                        <v-btn class="ma-0" flat block @click="clear">
                            {{ 'remove' | translate }}
                        </v-btn>
                    </v-toolbar>
                </div>
            </v-flex>
        </v-layout>
        <v-layout row wrap v-else align-center justify-center>
            <v-flex grow>
                <div class="grey lighten-3 text-xs-center py-2 elevation-1">
                    <v-btn class="my-5" dark color="primary" @click.native="onFocus">
                        {{ 'select image' | translate }}
                    </v-btn>
                </div>
            </v-flex>
        </v-layout>

        <input
            type="file"
            :accept="accept"
            :multiple="false"
            :disabled="disabled"
            ref="fileInput"
            @change="onFileChange"
        />
    </div>
</template>

<style lang="scss" scoped>
input[type='file'] {
    position: absolute;
    left: -99999px;
}
</style>
