<template>
    <div class="error-page d-flex align-center justify-center text-center fill-height bg-background">
        <v-container>
            <div class="error-code text-h1 font-weight-black text-primary mb-4">404</div>
            <h2 class="text-h4 font-weight-bold mb-6">Lost in the Warehouse?</h2>
            <p class="text-h6 text-medium-emphasis mb-10" style="max-width: 500px; margin: 0 auto;">
                The location you are looking for doesn't exist in our records.
                It might have been relocated or purged from the system.
            </p>
            <v-btn color="primary" size="x-large" rounded="xl" to="/" prepend-icon="mdi-home" elevation="8"
                class="px-8">
                Return to Safety
            </v-btn>
        </v-container>
    </div>
</template>

<script setup lang="ts">
defineProps({
    error: Object
})

useHead({
    title: '404 - Not Found'
})
</script>

<style scoped>
.error-page {
    min-height: 100vh;
    background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
}

.error-code {
    font-size: 10rem;
    line-height: 1;
    text-shadow: 0 0 20px rgba(255, 77, 0, 0.8), 0 0 40px rgba(255, 77, 0, 0.4);
    animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }

    50% {
        transform: scale(1.05);
        opacity: 0.8;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}
</style>
