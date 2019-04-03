<script>
export default {
    page() {
        return {
            title: this.$t('Page timeout'),
            meta: [
                {
                    name: 'description',
                    content: this.$t('The page timed out while loading.'),
                },
            ],
        }
    },
}
</script>

<template>
    <Layout>
        <h1 class="text-center">{{ 'The page timed out while loading' | translate }}</h1>
    </Layout>
</template>
