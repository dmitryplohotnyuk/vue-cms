<script>
export default {
    components: {},
    props: ['block'],
}
</script>

<template>
    <div v-if="block">
        <v-layout row wrap>
            <v-flex xs12>
                <v-text-field v-model="block.settings.text" :label="'Banner text' | translate" />
            </v-flex>
            <v-flex xs12>
                <v-text-field v-model="block.settings.text_size" :label="'Font size' | translate" />
            </v-flex>
            <v-flex xs12>
                <v-text-field
                    v-model="block.settings.button_text"
                    :label="'Button text' | translate"
                />
            </v-flex>
        </v-layout>
    </div>
</template>

<style lang="scss" scoped></style>
