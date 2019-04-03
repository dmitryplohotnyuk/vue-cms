<script>
// import page from '@/components/csv/page'
// import history from '@/components/csv/history'
import CsvUpload from '@/components/csv/upload'

export default {
    name: 'Csv',

    components: {
        // page,
        CsvUpload,
    },

    data() {
        return {
            showDialog: false,
        }
    },

    props: {
        type: {
            type: String,
        },
    },

    computed: {
        mapping() {
            return this.$route.name === 'mapping'
        },
    },
}
</script>

<template>
    <Layout>
        <v-layout row>
            <v-flex xs12 sm6 offset-sm3 class="mt-3"> <csv-upload initialType="cogs" /> </v-flex>
        </v-layout>
    </Layout>
</template>
