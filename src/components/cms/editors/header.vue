<script>
import RichEditor from '@/components/cms/tinymce'
import FileInput from '@/components/fileInput'
import LinksList from '@/components/cms/editors/linksList'

export default {
    components: {
        FileInput,
        LinksList,
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
                        <v-switch
                            class="ma-0"
                            :label="'Sticky' | translate"
                            v-model="block.settings.isSticky"
                        ></v-switch>
                    </v-flex>
                    <v-flex xs12>
                        <v-subheader
                            class="px-0 body-1 font-weight-regular mb-1"
                            style="height: auto"
                        >
                            {{ 'Brand name' | translate }}
                        </v-subheader>
                        <v-card light flat>
                            <rich-editor v-model="block.settings.brandName" preset="inline" />
                        </v-card>
                    </v-flex>
                    <v-flex xs12>
                        <file-input
                            :label="'Logo image' | translate"
                            v-model="block.settings.logoImage"
                        ></file-input>
                    </v-flex>
                    <v-flex xs12>
                        <v-slider
                            v-model="block.settings.logoImageWidth"
                            :label="'Custom logo width' | translate"
                            step="1"
                            min="50"
                            max="250"
                            thumb-label
                        ></v-slider>
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>

        <v-divider></v-divider>

        <v-card>
            <v-card-text>
                <v-layout row wrap>
                    <v-flex xs12>
                        <h3 class="subheading">{{ 'Menu items' | translate }}</h3>
                    </v-flex>
                </v-layout>
            </v-card-text>
            <links-list :items="block.settings.menu" />
        </v-card>
    </div>
</template>

<style lang="scss" scoped></style>
