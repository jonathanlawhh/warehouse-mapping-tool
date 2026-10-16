<template>
    <v-navigation-drawer :model-value="true" location="left" permanent :width="width || 320" class="bg-surface-light border-r"
        elevation="0">
        <div class="d-flex flex-column h-100 pa-4">
            <slot name="header">
                <v-btn block variant="flat" color="primary" to="/" prepend-icon="mdi-home" rounded="lg" class="mb-3">
                    Main Page
                </v-btn>
            </slot>
            <div class="flex-grow-1 overflow-y-auto pr-1">
                <slot></slot>
            </div>
            <slot name="footer"></slot>
        </div>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
defineProps<{
    appLink?: string;
    appIcon?: string;
    width?: number | string;
}>();
</script>
