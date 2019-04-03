<script>
module.exports = {
    props: ['landing', 'block', 'buildStyle'],
}
</script>

<template>
    <div
        v-if="landing.page.type == 'page' && landing.page.content"
        v-html="landing.page.content"
        class="grid-lg container my-5"
    ></div>
    <div v-else class="flex-centered bg-secondary" style="min-height: 300px;">
        <h1 class="display-4">-- Content --</h1>
    </div>
</template>
