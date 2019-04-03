<script>
// Import TinyMCE
import 'tinymce/tinymce'

// A theme is also required
import 'tinymce/themes/silver/theme'

// Any plugins you want to use has to be imported
import 'tinymce/plugins/paste'
import 'tinymce/plugins/link'
import 'tinymce/plugins/table'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/autoresize'

// import vue-tinymce component
import Editor from '@tinymce/tinymce-vue'

export default {
    components: {
        Editor,
    },
    props: ['value', 'preset'],
    data() {
        return {
            model: this.value,
        }
    },
    computed: {
        // rich editor options
        editorOptions() {
            const options = { branding: false }
            if (this.preset == 'inline') {
                return {
                    ...options,
                    plugins: 'link paste fullscreen',
                    min_height: 200,
                    menubar: false,
                    inline: true,
                    toolbar1: 'fontsizeselect | fontselect ',
                    toolbar2: 'bold italic | forecolor backcolor | link removeformat',
                }
            }
            if (this.preset == 'block') {
                return {
                    ...options,
                    plugins: 'table link paste fullscreen',
                    min_height: 400,
                    toolbar: false,
                }
            }
            return {
                ...options,
                plugins: 'table link paste fullscreen autoresize',
                min_height: 300,
            }
        },
    },
    watch: {
        model: function modelWatcher() {
            //do something when model value changes
            this.$emit('input', this.model)
        },
    },
}
</script>

<template>
    <editor v-model="model" :init="editorOptions"></editor>
</template>

<style lang="scss" scoped></style>
