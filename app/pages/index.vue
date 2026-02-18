```html
<template>
    <div>
        <v-main class="bg-background" style="min-height: 90vh">
            <v-container class="fill-height pb-16" style="min-height: 60vh">
                <v-row align="center" justify="center">
                    <v-col cols="12" md="6" class="justify-center">
                        <div>
                            <h1 class="text-h2 font-weight-black mb-6 line-height-1 shadow-glow">
                                Warehouse Mapping<br>
                                <span class="text-primary">Tool</span>

                            </h1>
                            <p class="text-h6 text-medium-emphasis mb-8">
                                Warehouse digital twin. Visualize storage mapping. If you still do not understand, most
                                probably this tool is not for you.
                            </p>
                            <div class="d-flex flex-wrap gap-4 justify-center">
                                <v-btn color="primary" to="/app" rounded="xl" elevation="8" size="x-large"
                                    class="px-8 text-none font-weight-bold" append-icon="mdi-arrow-right">
                                    Launch App
                                </v-btn>
                            </div>

                        </div>

                    </v-col>

                    <v-col cols="12" md="6" class="d-flex justify-center position-relative">
                        <div class="hero-visual-container mt-16">
                            <v-sheet width="240" height="240" rounded="xl"
                                class="bg-surface d-flex align-center justify-center overflow-hidden border-orange"
                                elevation="0">
                                <div class="grid-overlay"></div>
                                <div class="floating-cubes">
                                    <div class="cube cube-1"></div>
                                    <div class="cube cube-2"></div>
                                    <div class="cube cube-3"></div>
                                </div>
                                <v-icon icon="mdi-cube-scan" size="140" color="primary"
                                    class="z-index-1 opacity-20"></v-icon>

                                <!-- Floating UI Elements -->
                                <v-card width="180" class="position-absolute floating-card-1 pa-4" border rounded="lg">
                                    <div class="text-overline font-weight-bold">LOC-101-001-01</div>
                                    <v-chip color="secondary" size="small" class="font-weight-bold" variant="flat">
                                        FULL_PALLET_ZONE
                                    </v-chip>
                                </v-card>
                            </v-sheet>
                        </div>
                    </v-col>
                </v-row>
            </v-container>

            <!-- Stats Section -->
            <v-container class="py-16">
                <v-row>
                    <v-col cols="12" sm="4">
                        <v-card class="pa-6 text-center h-100" variant="outlined" rounded="xl">
                            <v-avatar color="primary" variant="tonal" size="64" class="mb-4">
                                <v-icon icon="mdi-file" size="32"></v-icon>
                            </v-avatar>
                            <div class="text-h4 font-weight-black mb-1">Upload Layout</div>
                            <div class="text-subtitle-1 font-weight-bold text-primary mb-2">Locations Data</div>
                            <div class="text-body-2 text-medium-emphasis">Upload your CSV file to get started. <br>
                                CSV file should only contain these headers: x, y, z, zone, name</div>
                        </v-card>
                    </v-col>

                    <v-col cols="12" sm="4">
                        <v-card class="pa-6 text-center h-100" variant="outlined" rounded="xl">
                            <v-avatar color="primary" variant="tonal" size="64" class="mb-4">
                                <v-icon icon="mdi-eye-outline" size="32"></v-icon>
                            </v-avatar>
                            <div class="text-h4 font-weight-black mb-1">Spot Anomaly</div>
                            <div class="text-subtitle-1 font-weight-bold text-primary mb-2">Zone Colors</div>
                            <div class="text-body-2 text-medium-emphasis">Each zone will be assigned a unique color.
                                Allows you to see if your warehouse mapping is aligned.</div>
                        </v-card>
                    </v-col>

                    <v-col cols="12" sm="4">
                        <v-card class="pa-6 text-center h-100" variant="outlined" rounded="xl">
                            <v-avatar color="primary" variant="tonal" size="64" class="mb-4">
                                <v-icon icon="mdi-rotate-3d" size="32"></v-icon>
                            </v-avatar>
                            <div class="text-h4 font-weight-black mb-1">Warehouse Visualizer</div>
                            <div class="text-subtitle-1 font-weight-bold text-primary mb-2">Location mapping to
                                coordinates</div>
                            <div class="text-body-2 text-medium-emphasis">Ya... just to show your warehouse</div>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>

        <v-footer>
            <v-container class="mt-4">
                <v-row class="mb-4">
                    <v-col cols="12" md="4">
                        <p>[
                            <v-btn variant="text" size="small" href="https://jonathanlawhh.com/" target="_blank">
                                <strong>Jonathan Law Hui Hao</strong>
                            </v-btn>
                            ]
                        </p>
                    </v-col>
                    <v-col cols="12" md="8">
                        <p class="text-right">
                            [
                            <v-btn variant="text" size="small" href="https://jonathanlawhh.com/works/ai/"
                                target="_blank">Other
                                Projects
                            </v-btn>
                            ,
                            <v-btn variant="text" size="small"
                                href="https://github.com/jonathanlawhh/warehouse-mapping-tool" target="_blank">Source
                                Code
                            </v-btn>
                            ,
                            <v-btn variant="text" size="small" href="https://jonathanlawhh.medium.com/"
                                target="_blank">Blog</v-btn>
                            ]
                        </p>
                    </v-col>
                </v-row>
            </v-container>
        </v-footer>

    </div>
</template>

<script setup lang="ts">
useHead({
    title: 'Warehouse Mapping Tool'
})
</script>

<style scoped>
.line-height-1 {
    line-height: 1.1;
}

.shadow-glow {
    text-shadow: 0 0 15px rgba(255, 77, 0, 0.6), 0 0 30px rgba(255, 77, 0, 0.2);
}

.hero-visual-container {
    perspective: 1000px;
}

.border-orange {
    border: 1px solid rgba(255, 77, 0, 0.5) !important;
    box-shadow: 0 0 20px rgba(255, 77, 0, 0.15);
}

.grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
        linear-gradient(rgba(255, 77, 0, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 77, 0, 0.1) 1px, transparent 1px);
    background-size: 30px 30px;
}

.floating-card-1 {
    top: 20px;
    right: -40px;
    animation: float 6s ease-in-out infinite;
    z-index: 2;
    border-color: rgba(255, 77, 0, 0.4) !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 77, 0, 0.1);
}

.floating-card-2 {
    bottom: 30px;
    left: -30px;
    animation: float 6s ease-in-out infinite reverse;
    z-index: 2;
    border-color: rgba(255, 77, 0, 0.4) !important;
}

@keyframes float {
    0% {
        transform: translateY(0px) rotate(0deg);
    }

    50% {
        transform: translateY(-20px) rotate(2deg);
    }

    100% {
        transform: translateY(0px) rotate(0deg);
    }
}

.cube {
    position: absolute;
    width: 40px;
    height: 40px;
    background: rgba(255, 95, 31, 0.4);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 95, 31, 0.8);
    border-radius: 4px;
}

.cube-1 {
    top: 100px;
    left: 100px;
    animation: orbit 8s infinite linear;
}

.cube-2 {
    top: 200px;
    left: 250px;
    animation: orbit 12s infinite linear reverse;
}

.cube-3 {
    top: 300px;
    left: 150px;
    animation: orbit 10s infinite linear;
}

@keyframes orbit {
    from {
        transform: rotate(0deg) translateX(40px) rotate(0deg);
    }

    to {
        transform: rotate(360deg) translateX(40px) rotate(-360deg);
    }
}

.z-index-1 {
    z-index: 1;
}

.opacity-20 {
    opacity: 0.2;
}
</style>
