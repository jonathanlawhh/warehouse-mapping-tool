<template>
    <v-navigation-drawer :model-value="true" location="left" permanent width="320" class="bg-surface-light border-r"
        elevation="0">
        <div class="pa-4">
            <v-btn block variant="flat" color="primary" to="/" prepend-icon="mdi-home" rounded="lg" class="mt-4">
                Main Page
            </v-btn>
            <slot></slot>
        </div>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
defineProps<{
    appLink?: string;
    appIcon?: string;
}>();
</script>
