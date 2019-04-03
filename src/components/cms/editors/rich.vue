<script>
import RichEditor from '@/components/cms/tinymce'

export default {
    components: {
        RichEditor,
    },
    props: ['block'],
    data() {
        return {}
    },
}
</script>

<template>
    <v-card v-if="block">
        <v-card-text>
            <v-layout row wrap>
                <v-flex xs12>
                    <v-switch
                        class="ma-0"
                        :label="'Enabled' | translate"
                        v-model="block.enabled"
                    ></v-switch>
                </v-flex>
                <v-flex xs12>
                    <v-subheader class="px-0 body-1 font-weight-regular mb-1" style="height: auto">
                        {{ 'Text' | translate }}
                    </v-subheader>
                    <v-card light flat>
                        <rich-editor v-model="block.settings.html" preset="block" />
                    </v-card>
                </v-flex>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<style lang="scss" scoped></style>
