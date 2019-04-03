<script>
module.exports = {
    props: ['landing', 'block', 'buildStyle'],
}
</script>

<template>
    <div class="pt-5 grid-lg" v-if="block && block.enabled">
        <div class="container mt-5" v-html="block.settings.html"></div>
    </div>
</template>
