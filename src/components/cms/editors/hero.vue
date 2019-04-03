<script>
import RichEditor from '@/components/cms/tinymce'
import FileInput from '@/components/fileInput'
import OptionsMixin from '@/components/cms/editors/optionsMixin'

export default {
    mixins: [OptionsMixin],
    components: {
        FileInput,
        RichEditor,
    },
    props: {
        block: {
            type: Object,
        },
        compact: {
            type: Boolean,
            default: false,
        },
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
                    <file-input
                        :label="'Image' | translate"
                        v-model="block.settings.backgroundImage"
                    ></file-input>
                </v-flex>
                <v-flex xs12 v-if="!compact">
                    <v-select
                        :items="options.sizes"
                        v-model="block.settings.sectionHeight"
                        :label="'Section height' | translate"
                        class="text-capitalize"
                        :menu-props="{ contentClass: 'text-capitalize' }"
                    ></v-select>
                </v-flex>
                <v-flex xs12 v-if="!compact">
                    <v-select
                        :items="options.yAlignment"
                        v-model="block.settings.backgroundImageAlignment"
                        :label="'Image alignment' | translate"
                        class="text-capitalize"
                        :menu-props="{ contentClass: 'text-capitalize' }"
                    ></v-select>
                </v-flex>
                <v-flex xs12>
                    <v-subheader class="px-0 body-1 font-weight-regular mb-1" style="height: auto">
                        {{ 'Heading' | translate }}
                    </v-subheader>
                    <v-card light flat>
                        <rich-editor v-model="block.settings.heading" preset="inline" />
                    </v-card>
                </v-flex>
                <v-flex xs12 v-if="!compact">
                    <v-select
                        :items="options.sizes"
                        v-model="block.settings.headingSize"
                        :label="'Heading size' | translate"
                        class="text-capitalize"
                        :menu-props="{ contentClass: 'text-capitalize' }"
                    ></v-select>
                </v-flex>
                <v-flex xs12>
                    <v-subheader class="px-0 body-1 font-weight-regular mb-1" style="height: auto">
                        {{ 'Text' | translate }}
                    </v-subheader>
                    <v-card light flat>
                        <rich-editor v-model="block.settings.text" preset="inline" />
                    </v-card>
                </v-flex>
                <v-flex xs12 v-if="!compact">
                    <v-select
                        :items="options.sizes"
                        v-model="block.settings.textSize"
                        :label="'Font size' | translate"
                        class="text-capitalize"
                        :menu-props="{ contentClass: 'text-capitalize' }"
                    ></v-select>
                </v-flex>
                <v-flex xs12 v-if="!compact">
                    <v-text-field
                        v-model="block.settings.buttonLabel"
                        :label="'Button label' | translate"
                    ></v-text-field>
                </v-flex>
                <v-flex xs12 v-if="!compact">
                    <v-text-field
                        v-model="block.settings.buttonLink"
                        :label="'Button link' | translate"
                    ></v-text-field>
                </v-flex>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<style lang="scss" scoped></style>
