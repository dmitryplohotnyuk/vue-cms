<script>
import RichEditor from '@/components/cms/tinymce'
import ColorPicker from '@/components/cms/editors/colorPicker'

export default {
    components: {
        ColorPicker,
        RichEditor,
    },
    props: ['block'],
}
</script>

<template>
    <div v-if="block">
        <v-card>
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
                        <v-subheader
                            class="px-0 body-1 font-weight-regular mb-1"
                            style="height: auto"
                        >
                            {{ 'Text' | translate }}
                        </v-subheader>
                        <v-card light flat>
                            <rich-editor v-model="block.settings.messageText" preset="inline" />
                        </v-card>
                    </v-flex>
                    <v-flex xs12>
                        <color-picker
                            v-model="block.settings.messageColorBg"
                            :label="'Bar' | translate"
                        />
                    </v-flex>
                    <v-flex xs12>
                        <color-picker
                            v-model="block.settings.messageColorText"
                            :label="'Text' | translate"
                        />
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
    </div>
</template>

<style lang="scss" scoped></style>
