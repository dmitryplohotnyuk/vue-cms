<script>
export default {
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
                            :disabled="true"
                        ></v-switch>
                    </v-flex>
                    <v-flex xs12>
                        <p class="text-capitalize">{{ 'template' | translate }}</p>
                        <v-radio-group v-model="block.settings.language" :mandatory="false">
                            <v-radio label="English" value="en"></v-radio>
                            <v-radio label="日本語" value="ja"></v-radio>
                        </v-radio-group>
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
    </div>
</template>

<style lang="scss" scoped></style>
