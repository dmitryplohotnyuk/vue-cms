<script>
import LinksList from '@/components/cms/editors/linksList'

export default {
    components: {
        LinksList,
    },
    props: ['menu'],
}
</script>

<template>
    <v-card>
        <v-card-text>
            <v-layout row wrap>
                <v-flex xs12>
                    <v-text-field v-model="menu.title" :label="'Title' | translate" />
                </v-flex>
                <v-flex xs12>
                    <h3 class="subheading">{{ 'Menu items' | translate }}</h3>
                </v-flex>
            </v-layout>
        </v-card-text>
        <links-list :items="menu.items" />
    </v-card>
</template>

<style lang="scss" scoped></style>
