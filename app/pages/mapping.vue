<template>
    <div>
        <!-- Navigation Drawer for Controls -->
        <AppSidebar app-link="/equ" app-icon="mdi-forklift" width="340">
            <!-- Header Toolbar: Home + Action Icons (Upload, Download, Reset) -->
            <template #header>
                <div class="d-flex align-center justify-space-between mb-3">
                    <v-btn variant="tonal" color="primary" to="/" prepend-icon="mdi-home" size="small" rounded="lg" class="font-weight-bold">
                        Home
                    </v-btn>
                    <div class="d-flex align-center gap-1">
                        <v-tooltip text="Import Layout CSV" location="bottom">
                            <template #activator="{ props }">
                                <v-btn v-bind="props" icon="mdi-file-upload-outline" variant="text" size="small"
                                    color="primary" @click="showImportDialog = true"></v-btn>
                            </template>
                        </v-tooltip>
                        <v-tooltip text="Reset Camera" location="bottom">
                            <template #activator="{ props }">
                                <v-btn v-bind="props" icon="mdi-camera-retake-outline" variant="text" size="small"
                                    @click="resetView"></v-btn>
                            </template>
                        </v-tooltip>
                    </div>
                </div>

                <!-- Minimalist Metrics Bar -->
                <v-card color="primary" variant="tonal" class="pa-2 mb-3 rounded-lg border border-primary">
                    <div class="d-flex align-center justify-space-between">
                        <div class="text-center flex-grow-1">
                            <div class="text-caption font-weight-bold" style="font-size: 10px; opacity: 0.85;">TOTAL</div>
                            <div class="text-body-1 font-weight-bold">{{ filteredCount.toLocaleString() }}</div>
                        </div>
                        <v-divider vertical class="mx-1"></v-divider>
                        <div class="text-center flex-grow-1">
                            <div class="text-caption font-weight-bold" style="font-size: 10px; opacity: 0.85;">OCCUPIED</div>
                            <div class="text-body-1 font-weight-bold">
                                {{ filteredOccupiedCount.toLocaleString() }}
                                <span class="text-caption font-weight-regular" style="font-size: 11px; opacity: 0.9;">
                                    ({{ filteredCount ? Math.round((filteredOccupiedCount / filteredCount) * 100) : 0 }}%)
                                </span>
                            </div>
                        </div>
                        <v-divider vertical class="mx-1"></v-divider>
                        <div class="text-center flex-grow-1">
                            <div class="text-caption font-weight-bold" style="font-size: 10px; opacity: 0.85;">ZONES</div>
                            <div class="text-body-1 font-weight-bold">{{ filteredZoneCount }}</div>
                        </div>
                    </div>
                </v-card>
            </template>

            <!-- Main Filter Controls -->
            <template #default>
                <div class="d-flex flex-column gap-3 py-1">
                    <!-- Level Filter -->
                    <div>
                        <div class="d-flex justify-space-between align-center mb-1">
                            <span class="text-caption font-weight-bold text-uppercase text-medium-emphasis">Level</span>
                            <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
                                {{ levelFilter === 0 ? 'All Levels' : `Level ${levelFilter}` }}
                            </v-chip>
                        </div>
                        <v-slider v-model="levelFilter" :min="0" :max="maxLevels" :step="1" color="primary"
                            density="compact" hide-details @update:model-value="applyFilter" class="pa-2"></v-slider>
                    </div>

                    <!-- Zone Tier Selector & Filter -->
                    <div>
                        <div class="d-flex justify-space-between align-center mb-1">
                            <span class="text-caption font-weight-bold text-uppercase text-medium-emphasis">Zone Tier</span>
                            <span class="text-caption text-medium-emphasis">{{ zoneTierLabels[selectedZoneTier] }}</span>
                        </div>
                        <v-btn-toggle v-model="selectedZoneTier" mandatory density="compact" color="primary"
                            variant="outlined" divided class="w-100 d-flex mb-2" @update:model-value="onZoneTierChange">
                            <v-btn value="zone1" class="flex-grow-1 text-none px-0" size="small">Z1</v-btn>
                            <v-btn value="zone2" class="flex-grow-1 text-none px-0" size="small">Z2</v-btn>
                            <v-btn value="zone3" class="flex-grow-1 text-none px-0" size="small">Z3</v-btn>
                            <v-btn value="zone4" class="flex-grow-1 text-none px-0" size="small">Z4</v-btn>
                        </v-btn-toggle>

                        <v-autocomplete v-model="zoneValuesFilter" :items="availableZoneValues" density="compact" variant="outlined"
                            color="primary" multiple chips closable-chips clearable hide-details
                            :placeholder="`All ${zoneTierLabels[selectedZoneTier]} values`"
                            @update:model-value="applyFilter">
                            <template #chip="{ props, item }">
                                <v-chip v-bind="props" size="x-small" variant="tonal" color="primary" class="font-weight-medium">
                                    {{ item.title }}
                                </v-chip>
                            </template>
                        </v-autocomplete>
                    </div>

                    <!-- Occupancy Status -->
                    <div>
                        <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-1 mt-4">Occupancy</div>
                        <v-btn-toggle v-model="occupiedFilter" mandatory density="compact" color="primary"
                            variant="outlined" divided class="w-100 d-flex" @update:model-value="applyFilter">
                            <v-btn value="all" class="flex-grow-1 text-none" size="small">All</v-btn>
                            <v-btn value="occupied" class="flex-grow-1 text-none" size="small">Occupied</v-btn>
                            <v-btn value="empty" class="flex-grow-1 text-none" size="small">Empty</v-btn>
                        </v-btn-toggle>
                    </div>

                    <!-- Visualize Occupied Switch -->
                    <div class="d-flex align-center justify-space-between pt-1">
                        <span class="text-body-2 font-weight-medium">Visualize Occupancy</span>
                        <v-switch v-model="visualizeOccupied" color="primary" density="compact" hide-details
                            @update:model-value="updateColors"></v-switch>
                    </div>

                    <!-- Location Status -->
                    <div>
                        <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-1 mt-4">Location Status</div>
                        <v-btn-toggle v-model="enabledFilter" mandatory density="compact" color="primary"
                            variant="outlined" divided class="w-100 d-flex" @update:model-value="applyFilter">
                            <v-btn value="all" class="flex-grow-1 text-none" size="small">All</v-btn>
                            <v-btn value="enabled" class="flex-grow-1 text-none" size="small">Enabled</v-btn>
                            <v-btn value="disabled" class="flex-grow-1 text-none" size="small">Disabled</v-btn>
                        </v-btn-toggle>
                    </div>
                </div>
            </template>

            <!-- Sticky Footer: Anchored Block Card + Reset Camera -->
            <template #footer>
                <div class="pt-2 border-t mt-auto">
                    <v-expand-transition>
                        <div v-if="selectedData" class="mb-2">
                            <v-card variant="tonal" color="info" class="pa-2">
                                <div class="d-flex align-center justify-space-between mb-1">
                                    <span class="text-caption font-weight-bold text-uppercase">Anchored Block</span>
                                    <v-btn size="x-small" variant="text" icon="mdi-close" color="error" @click="clearAnchor"></v-btn>
                                </div>
                                <div class="text-body-2 font-weight-bold mb-1">{{ selectedData.name }}</div>
                                <div class="text-caption text-medium-emphasis" style="font-size: 11px;">
                                    Z1: {{ selectedData.zone1 || '-' }} • Z2: {{ selectedData.zone2 || '-' }}<br>
                                    Z3: {{ selectedData.zone3 || '-' }} • Z4: {{ selectedData.zone4 || '-' }}
                                </div>
                                <div class="text-caption mt-1">
                                    Status: 
                                    <span :class="selectedData.enabled ? 'text-success' : 'text-medium-emphasis'">
                                        {{ selectedData.enabled ? 'Enabled' : 'Disabled' }}
                                    </span>
                                </div>
                            </v-card>
                        </div>
                    </v-expand-transition>
                    <v-btn color="primary" variant="outlined" prepend-icon="mdi-camera-retake" @click="resetView" block size="small">
                        Reset Camera
                    </v-btn>
                </div>
            </template>
        </AppSidebar>

        <!-- Import Modal Dialog -->
        <v-dialog v-model="showImportDialog" max-width="520">
            <v-card class="pa-4 rounded-xl">
                <v-card-title class="d-flex align-center justify-space-between px-2 pt-1 pb-3">
                    <span class="text-h6 font-weight-bold">Import Layout CSV</span>
                    <v-btn icon="mdi-close" variant="text" size="small" @click="showImportDialog = false"></v-btn>
                </v-card-title>
                <v-card-text class="px-2 py-0">
                    <v-file-input label="Upload CSV File" prepend-icon="mdi-file-upload" accept=".csv"
                        variant="outlined" density="comfortable" hide-details class="mb-3"
                        @change="(e: any) => { handleCSVUpload(e); showImportDialog = false; }"></v-file-input>
                    <div class="pa-3 rounded-lg bg-surface-variant border mb-3">
                        <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-1">Expected Format</div>
                        <div class="text-caption font-mono text-medium-emphasis">
                            x, y, z, name, occupied, size_x, size_y, size_z, enabled, zone1, zone2, zone3, zone4
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions class="px-2 pb-1 d-flex justify-space-between">
                    <v-btn href="/template/mapping_template.csv" download target="_blank"
                        variant="text" size="small" color="primary" prepend-icon="mdi-download" class="font-weight-bold">
                        Download Template
                    </v-btn>
                    <v-btn variant="text" @click="showImportDialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Main Content (3D Canvas) -->
        <v-main class="bg-black pa-0">
            <AppOverlay position="bottom" padding="pa-3">
                <div class="d-flex align-center flex-wrap gap-2">
                    <v-icon color="info" class="mr-2">mdi-information</v-icon>
                    <div class="text-body-2">
                        Click block to <v-chip size="x-small" color="primary">Anchor Camera</v-chip>.
                        Use <v-chip size="x-small">W, A, S, D</v-chip> to fly.
                        Use <v-chip size="x-small">Q/E</v-chip> for up/down, <v-chip size="x-small">Shift</v-chip> for speed
                    </div>
                </div>
            </AppOverlay>
            <div ref="container" class="canvas-container">
                <!-- Tooltip Overlay -->
                <div v-if="hoveredData" class="custom-tooltip" :style="{
                    left: tooltipPos.x + 'px',
                    top: tooltipPos.y + 'px'
                }">
                    <div class="text-h6 mb-1">{{ hoveredData.name }}</div>
                    <div class="d-flex align-center flex-wrap gap-1 mb-1">
                        <v-chip :color="hoveredData.colorHex" size="small" class="font-weight-bold" variant="flat">
                            {{ getActiveZone(hoveredData) }}
                        </v-chip>
                        <v-chip :color="hoveredData.occupied ? 'error' : 'success'" size="small"
                            class="font-weight-bold" variant="flat">
                            {{ hoveredData.occupied ? 'Occupied' : 'Empty' }}
                        </v-chip>
                        <v-chip :color="hoveredData.enabled ? 'primary' : 'grey'" size="small"
                            class="font-weight-bold" variant="flat">
                            {{ hoveredData.enabled ? 'Enabled' : 'Disabled' }}
                        </v-chip>
                    </div>
                    <div class="text-caption text-medium-emphasis mt-1">
                        Z1: {{ hoveredData.zone1 || '-' }} | Z2: {{ hoveredData.zone2 || '-' }}<br>
                        Z3: {{ hoveredData.zone3 || '-' }} | Z4: {{ hoveredData.zone4 || '-' }}
                    </div>
                </div>
            </div>
        </v-main>
    </div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { onMounted, onBeforeUnmount, ref, reactive, shallowRef } from 'vue';

useHead({
    title: 'Mapping | Warehouse Mapping Tool'
});

const showImportDialog = ref(false);

const CONFIG = {
    boxSize: { width: 1.0, height: 1.0, depth: 1.0 },
    gapBetweenRacks: 1,
    gapBetweenCompartments: 0.4,
    gapBetweenLevels: 0.2,
    colors: {
        background: 0x0f172a, // Rich modern tech slate navy
        box: 0x1e293b,
        boxEdge: 0x38bdf8,
        floor: 0x1e293b,     // Clean matte studio floor
        disabled: 0x64748b,  // Grey default color for disabled locations
        disabledOccupied: 0x475569 // Darker grey when visualizeOccupied is enabled
    },
    rackSpacing: 8
};

const selectedZoneTier = ref<'zone1' | 'zone2' | 'zone3' | 'zone4'>('zone1');
const zoneTierLabels: Record<string, string> = {
    zone1: 'Zone 1',
    zone2: 'Zone 2',
    zone3: 'Zone 3',
    zone4: 'Zone 4'
};
const zoneValuesFilter = ref<string[]>([]);
const availableZoneValues = ref<string[]>([]);
const levelFilter = ref(0);
const occupiedFilter = ref('all');
const enabledFilter = ref('all');
const visualizeOccupied = ref(false);
const maxLevels = ref(1);
const locationData = shallowRef<any[]>([]);
const filteredCount = ref(0);
const filteredZoneCount = ref(0);
const filteredOccupiedCount = ref(0);
const hoveredData = ref<any>(null);
const tooltipPos = reactive({ x: 0, y: 0 });

function getActiveZone(data: any): string {
    if (!data) return '';
    return data[selectedZoneTier.value] || data.zone || '';
}

function onZoneTierChange() {
    zoneValuesFilter.value = [];
    updateColors();
    applyFilter();
}

const container = ref<HTMLElement | null>(null);
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;
let instancedMesh: THREE.InstancedMesh | null = null;
let floor: THREE.Mesh | null = null;
const instanceDataMap = new Map<number, any>();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const selectedData = ref<any>(null);
let selectedInstanceId = -1;
let selectionBoxMesh: THREE.LineSegments | null = null;
let pointerDownPos = { x: 0, y: 0 };
let isCameraTransitioning = false;
let cameraLerpProgress = 0;
const cameraStartPos = new THREE.Vector3();
const cameraEndPos = new THREE.Vector3();
const targetStartPos = new THREE.Vector3();
const targetEndPos = new THREE.Vector3();
let hoveredInstanceId = -1;
const originalColor = new THREE.Color();
const highlightColor = new THREE.Color(0xffffff);
const sharedMatrix = new THREE.Matrix4();
const defaultCamPos = new THREE.Vector3(15, 90, 150);

const keys = { w: false, a: false, s: false, d: false, q: false, e: false, shift: false };

function onKeyDown(event: KeyboardEvent) {
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
    const key = event.key.toLowerCase();
    if (key in keys) {
        keys[key as keyof typeof keys] = true;
    }
}

function onKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (key in keys) {
        keys[key as keyof typeof keys] = false;
    }
}

function initThree() {
    if (!container.value) return;

    const width = container.value.clientWidth;
    const height = container.value.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colors.background);

    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(15, 90, 150);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = false;
    container.value.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 600;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    // Uniform studio illumination (zero shadow, zero specular flare)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xe2e8f0, 0x1e293b, 1.1);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
    keyLight.position.set(60, 120, 80);
    keyLight.castShadow = false;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 0.5);
    fillLight.position.set(-60, 80, -60);
    fillLight.castShadow = false;
    scene.add(fillLight);

    // Completely matte, non-reflective floor with NO grid
    const floorGeometry = new THREE.PlaneGeometry(160, 160);
    const floorMaterial = new THREE.MeshBasicMaterial({
        color: CONFIG.colors.floor
    });
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    scene.add(floor);

    animate();
}

function renderLocations(locations: any[]) {
    if (!scene) return;

    clearAnchor();

    if (instancedMesh) {
        scene.remove(instancedMesh);
        instancedMesh.geometry.dispose();
        (instancedMesh.material as THREE.Material).dispose();
        instancedMesh = null;
    }

    instanceDataMap.clear();

    if (locations.length === 0) return;

    const geometry = new THREE.BoxGeometry(
        CONFIG.boxSize.width,
        CONFIG.boxSize.height,
        CONFIG.boxSize.depth
    );
    // Crisp, bright matte material without specular reflections
    const material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        reflectivity: 0
    });

    instancedMesh = new THREE.InstancedMesh(geometry, material, locations.length);

    const color = new THREE.Color();

    const compWidth = CONFIG.boxSize.depth + CONFIG.gapBetweenCompartments;
    const levelHeight = CONFIG.boxSize.height + CONFIG.gapBetweenLevels;

    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    let maxL = 0;
    const zoneSet = new Set<string>();

    for (let i = 0; i < locations.length; i++) {
        const data = locations[i];
        const r = data.x;
        const c = data.y;
        const l = data.z;

        const xPos = (r - 1) * CONFIG.rackSpacing;
        const zPos = (c - 1) * compWidth;
        const yPos = (CONFIG.boxSize.height / 2) + (l - 1) * levelHeight;

        const scaleX = data.size_x || 1;
        const scaleY = data.size_y || 1;
        const scaleZ = data.size_z || 1;

        const adjustedX = xPos + (scaleX - 1) * (CONFIG.boxSize.width / 2);
        const adjustedY = yPos + (scaleY - 1) * (CONFIG.boxSize.height / 2);
        const adjustedZ = zPos + (scaleZ - 1) * (CONFIG.boxSize.depth / 2);

        // Manual matrix composition (translation and scale)
        const te = sharedMatrix.elements;
        te[0] = scaleX; te[4] = 0; te[8] = 0; te[12] = adjustedX;
        te[1] = 0; te[5] = scaleY; te[9] = 0; te[13] = adjustedY;
        te[2] = 0; te[6] = 0; te[10] = scaleZ; te[14] = adjustedZ;
        te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;

        instancedMesh.setMatrixAt(i, sharedMatrix);

        const activeZone = getActiveZone(data);
        const zoneInfo = getZoneColor(activeZone, data.occupied, data.enabled);
        data.colorHex = zoneInfo.colorHex;
        color.setHex(zoneInfo.hex);
        instancedMesh.setColorAt(i, color);

        if (xPos < minX) minX = xPos;
        if (xPos > maxX) maxX = xPos;
        if (zPos < minZ) minZ = zPos;
        if (zPos > maxZ) maxZ = zPos;
        if (l > maxL) maxL = l;
        if (activeZone) zoneSet.add(activeZone);

        instanceDataMap.set(i, data);
    }

    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    instancedMesh.position.x = -centerX;
    instancedMesh.position.z = -centerZ;

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
    scene.add(instancedMesh);

    if (floor && scene) {
        const spanX = (maxX !== -Infinity && minX !== Infinity) ? (maxX - minX) : 0;
        const spanZ = (maxZ !== -Infinity && minZ !== Infinity) ? (maxZ - minZ) : 0;

        const floorWidth = Math.max(160, spanX + 160);
        const floorDepth = Math.max(160, spanZ + 160);

        floor.geometry.dispose();
        floor.geometry = new THREE.PlaneGeometry(floorWidth, floorDepth);
    }

    maxLevels.value = maxL;
    availableZoneValues.value = Array.from(zoneSet).sort();
    filteredCount.value = locations.length;
    filteredZoneCount.value = zoneSet.size;
    filteredOccupiedCount.value = locations.filter(l => l.occupied).length;
}

function getMax(arr: number[]): number {
    if (arr.length === 0) return 0;
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) max = arr[i];
    }
    return max;
}

function selectBlock(instanceId: number) {
    if (!instancedMesh || !scene || !controls || !camera) return;

    const data = instanceDataMap.get(instanceId);
    if (!data) return;

    selectedInstanceId = instanceId;
    selectedData.value = data;

    // Get block world position & scale from instanceMatrix and mesh position
    const mat = new THREE.Matrix4();
    instancedMesh.getMatrixAt(instanceId, mat);
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    mat.decompose(pos, quat, scale);
    pos.add(instancedMesh.position);

    // Create or update bounding box wireframe highlight
    if (selectionBoxMesh) {
        scene.remove(selectionBoxMesh);
        selectionBoxMesh.geometry.dispose();
        (selectionBoxMesh.material as THREE.Material).dispose();
        selectionBoxMesh = null;
    }

    const boxGeo = new THREE.BoxGeometry(
        CONFIG.boxSize.width * scale.x * 1.05,
        CONFIG.boxSize.height * scale.y * 1.05,
        CONFIG.boxSize.depth * scale.z * 1.05
    );
    const edges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        linewidth: 2,
        depthTest: false,
        transparent: true,
        opacity: 0.95
    });
    selectionBoxMesh = new THREE.LineSegments(edges, lineMat);
    selectionBoxMesh.renderOrder = 999;
    selectionBoxMesh.position.copy(pos);
    scene.add(selectionBoxMesh);

    // Transition camera to anchor onto the block
    targetStartPos.copy(controls.target);
    targetEndPos.copy(pos);

    cameraStartPos.copy(camera.position);
    const currentOffset = new THREE.Vector3().subVectors(camera.position, controls.target);
    const desiredDistance = THREE.MathUtils.clamp(currentOffset.length(), 20, 60);
    const dir = currentOffset.normalize();
    if (dir.lengthSq() < 0.001) {
        dir.set(0.5, 0.5, 1).normalize();
    }
    cameraEndPos.copy(pos).addScaledVector(dir, desiredDistance);

    cameraLerpProgress = 0;
    isCameraTransitioning = true;
}

function clearAnchor() {
    selectedData.value = null;
    selectedInstanceId = -1;
    if (selectionBoxMesh && scene) {
        scene.remove(selectionBoxMesh);
        selectionBoxMesh.geometry.dispose();
        (selectionBoxMesh.material as THREE.Material).dispose();
        selectionBoxMesh = null;
    }
}

function resetView() {
    clearAnchor();
    if (!controls || !camera) return;

    targetStartPos.copy(controls.target);
    targetEndPos.set(0, 0, 0);

    cameraStartPos.copy(camera.position);
    cameraEndPos.copy(defaultCamPos);

    cameraLerpProgress = 0;
    isCameraTransitioning = true;
}

const zoneColorCache = new Map<string, { hex: number, colorHex: string }>();
function getZoneColor(zoneName: string, isOccupied = false, isEnabled = true): { hex: number, colorHex: string } {
    const isDarkened = visualizeOccupied.value && isOccupied;
    // Disabled locations default to grey (CONFIG.colors.disabled)
    if (!isEnabled) {
        const hex = isDarkened ? CONFIG.colors.disabledOccupied : CONFIG.colors.disabled;
        return { hex, colorHex: isDarkened ? '#475569' : '#64748b' };
    }
    const cacheKey = `${zoneName}_${isDarkened ? 'occ' : 'default'}`;
    if (!zoneName) return { hex: CONFIG.colors.disabled, colorHex: '#64748b' };
    const cached = zoneColorCache.get(cacheKey);
    if (cached) return cached;

    let hash = 0;
    for (let i = 0; i < zoneName.length; i++) {
        hash = zoneName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    // When visualizeOccupied is ON and occupied: darker tone (34% lightness, 90% saturation). Default: bright zone color (58% lightness, 80% saturation)
    const lightness = isDarkened ? 34 : 58;
    const saturation = isDarkened ? 90 : 80;
    const color = new THREE.Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    const hex = color.getHex();
    const result = { hex, colorHex: '#' + color.getHexString() };
    zoneColorCache.set(cacheKey, result);
    return result;
}

function updateColors() {
    if (!instancedMesh) return;
    const color = new THREE.Color();
    const total = locationData.value.length;

    for (let i = 0; i < total; i++) {
        const data = instanceDataMap.get(i);
        if (!data) continue;
        const activeZone = getActiveZone(data);
        const zoneInfo = getZoneColor(activeZone, data.occupied, data.enabled);
        data.colorHex = zoneInfo.colorHex;
        if (i !== hoveredInstanceId) {
            color.setHex(zoneInfo.hex);
            instancedMesh.setColorAt(i, color);
        }
    }
    if (instancedMesh.instanceColor) {
        instancedMesh.instanceColor.needsUpdate = true;
    }
}

function applyFilter() {
    if (!instancedMesh) return;
    const compWidth = CONFIG.boxSize.depth + CONFIG.gapBetweenCompartments;
    const levelHeight = CONFIG.boxSize.height + CONFIG.gapBetweenLevels;
    const boxHeightHalf = CONFIG.boxSize.height / 2;

    let count = 0;
    let occupiedCount = 0;
    const activeZones = new Set<string>();
    const zonesInLevel = new Set<string>();
    const zoneFilterSet = new Set(zoneValuesFilter.value);
    const hasZoneFilter = zoneFilterSet.size > 0;
    const currentLevelFilter = levelFilter.value;
    const currentOccupiedFilter = occupiedFilter.value;
    const currentEnabledFilter = enabledFilter.value;
    const currentTier = selectedZoneTier.value;
    const dataList = locationData.value;
    const total = dataList.length;

    const te = sharedMatrix.elements;

    for (let i = 0; i < total; i++) {
        const data = dataList[i];
        const levelMatch = (currentLevelFilter === 0) || (data.z === currentLevelFilter);
        const locZone = data[currentTier] || data.zone || '';

        if (levelMatch && locZone) {
            zonesInLevel.add(locZone);
        }

        const zoneMatch = !hasZoneFilter || zoneFilterSet.has(locZone);

        const occupancyMatch =
            (currentOccupiedFilter === 'all') ||
            (currentOccupiedFilter === 'occupied' && data.occupied) ||
            (currentOccupiedFilter === 'empty' && !data.occupied);

        const enabledMatch =
            (currentEnabledFilter === 'all') ||
            (currentEnabledFilter === 'enabled' && data.enabled) ||
            (currentEnabledFilter === 'disabled' && !data.enabled);

        if (levelMatch && zoneMatch && occupancyMatch && enabledMatch) {
            count++;
            if (data.occupied) occupiedCount++;
            if (locZone) activeZones.add(locZone);
            const xPos = (data.x - 1) * CONFIG.rackSpacing;
            const yPos = boxHeightHalf + (data.z - 1) * levelHeight;
            const zPos = (data.y - 1) * compWidth;

            const scaleX = data.size_x || 1;
            const scaleY = data.size_y || 1;
            const scaleZ = data.size_z || 1;

            const adjustedX = xPos + (scaleX - 1) * (CONFIG.boxSize.width / 2);
            const adjustedY = yPos + (scaleY - 1) * (CONFIG.boxSize.height / 2);
            const adjustedZ = zPos + (scaleZ - 1) * (CONFIG.boxSize.depth / 2);

            te[0] = scaleX; te[4] = 0; te[8] = 0; te[12] = adjustedX;
            te[1] = 0; te[5] = scaleY; te[9] = 0; te[13] = adjustedY;
            te[2] = 0; te[6] = 0; te[10] = scaleZ; te[14] = adjustedZ;
            te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;
            instancedMesh.setMatrixAt(i, sharedMatrix);
        } else {
            // Set scale to 0
            te[0] = 0; te[4] = 0; te[8] = 0; te[12] = 0;
            te[1] = 0; te[5] = 0; te[9] = 0; te[13] = 0;
            te[2] = 0; te[6] = 0; te[10] = 0; te[14] = 0;
            te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;
            instancedMesh.setMatrixAt(i, sharedMatrix);
        }
    }
    filteredCount.value = count;
    filteredOccupiedCount.value = occupiedCount;
    filteredZoneCount.value = activeZones.size;
    availableZoneValues.value = Array.from(zonesInLevel).sort();
    instancedMesh.instanceMatrix.needsUpdate = true;
}

function animate() {
    if (!renderer || !scene || !camera) return;
    requestAnimationFrame(animate);

    if (keys.w || keys.a || keys.s || keys.d || keys.q || keys.e) {
        const flySpeed = keys.shift ? 8.0 : 3.0;
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);

        const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();

        if (keys.w) {
            camera.position.addScaledVector(forward, flySpeed);
            controls?.target.addScaledVector(forward, flySpeed);
        }
        if (keys.s) {
            camera.position.addScaledVector(forward, -flySpeed);
            controls?.target.addScaledVector(forward, -flySpeed);
        }
        if (keys.a) {
            camera.position.addScaledVector(right, -flySpeed);
            controls?.target.addScaledVector(right, -flySpeed);
        }
        if (keys.d) {
            camera.position.addScaledVector(right, flySpeed);
            controls?.target.addScaledVector(right, flySpeed);
        }
        if (keys.q) {
            camera.position.addScaledVector(camera.up, -flySpeed);
            controls?.target.addScaledVector(camera.up, -flySpeed);
        }
        if (keys.e) {
            camera.position.addScaledVector(camera.up, flySpeed);
            controls?.target.addScaledVector(camera.up, flySpeed);
        }
    }

    if (isCameraTransitioning && controls && camera) {
        cameraLerpProgress += 0.04;
        if (cameraLerpProgress >= 1) {
            cameraLerpProgress = 1;
            isCameraTransitioning = false;
        }
        // Smooth ease-out cubic
        const t = 1 - Math.pow(1 - cameraLerpProgress, 3);
        camera.position.lerpVectors(cameraStartPos, cameraEndPos, t);
        controls.target.lerpVectors(targetStartPos, targetEndPos, t);
    }

    controls?.update();

    raycaster.setFromCamera(mouse, camera);

    if (instancedMesh) {
        const intersection = raycaster.intersectObject(instancedMesh);
        if (intersection.length > 0) {
            const instanceId = intersection[0].instanceId!;
            if (hoveredInstanceId !== instanceId) {
                if (hoveredInstanceId !== -1) {
                    const oldData = instanceDataMap.get(hoveredInstanceId);
                    if (oldData) {
                        originalColor.set(oldData.colorHex);
                        instancedMesh.setColorAt(hoveredInstanceId, originalColor);
                    }
                }
                hoveredInstanceId = instanceId;
                hoveredData.value = instanceDataMap.get(instanceId);
                instancedMesh.setColorAt(hoveredInstanceId, highlightColor);
                instancedMesh.instanceColor!.needsUpdate = true;
                document.body.style.cursor = 'pointer';
            }
        } else {
            if (hoveredInstanceId !== -1) {
                const oldData = instanceDataMap.get(hoveredInstanceId);
                if (oldData) {
                    originalColor.set(oldData.colorHex);
                    instancedMesh.setColorAt(hoveredInstanceId, originalColor);
                    instancedMesh.instanceColor!.needsUpdate = true;
                }
                hoveredInstanceId = -1;
                hoveredData.value = null;
                document.body.style.cursor = 'default';
            }
        }
    }
    renderer.render(scene, camera);
}

function handleResize() {
    if (!camera || !renderer || !container.value) return;
    const width = container.value.clientWidth;
    const height = container.value.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function onPointerDown(event: MouseEvent) {
    pointerDownPos = { x: event.clientX, y: event.clientY };
}

function onPointerUp(event: MouseEvent) {
    const dist = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
    // Ignore drags
    if (dist > 5) return;
    if (!instancedMesh || !camera) return;

    // Use current raycaster to select clicked block
    const intersection = raycaster.intersectObject(instancedMesh);
    if (intersection.length > 0 && intersection[0].instanceId !== undefined) {
        const instanceId = intersection[0].instanceId;
        selectBlock(instanceId);
    }
}

function onPointerMove(event: MouseEvent) {
    if (!container.value) return;
    const rect = container.value.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    tooltipPos.x = event.clientX + 20;
    tooltipPos.y = event.clientY + 20;
}

function generateMockData() {
    const data = [];
    const whZones = ['NORTH_WH', 'SOUTH_WH'];
    for (let x = 1; x <= 6; x++) {
        const wh = whZones[x <= 3 ? 0 : 1];
        for (let y = 1; y <= 30; y++) {
            for (let z = 1; z <= 8; z++) {
                let zoneType = 'STORAGE';
                if (z <= 2) zoneType = 'PICKING';
                else if (z >= 7) zoneType = 'OVERFLOW';

                const z1 = wh;
                const z2 = zoneType;
                const z3 = `AISLE_${x.toString().padStart(2, '0')}`;
                const z4 = `BAY_${x}_${Math.ceil(y / 5)}`;

                data.push({
                    x: x, y: y, z: z,
                    zone1: z1,
                    zone2: z2,
                    zone3: z3,
                    zone4: z4,
                    zone: z1,
                    name: `LOC-${x.toString().padStart(2, '0')}-${y.toString().padStart(2, '0')}-${z}`,
                    occupied: Math.random() > 0.8,
                    size_x: 1,
                    size_y: 1,
                    size_z: 1,
                    enabled: Math.random() > 0.15
                });
            }
        }
    }
    return data;
}

function handleCSVUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.trim().split('\n');
        if (lines.length < 2) return;
        const results = [];
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const colMap: any = {};
        headers.forEach((h, i) => colMap[h] = i);
        for (let i = 1; i < lines.length; i++) {
            const vals = lines[i].split(',');
            if (vals.length < 5) continue;
            const occupiedVal = String(vals[colMap['occupied'] !== undefined ? colMap['occupied'] : 4] ?? '').toLowerCase().trim();
            const enabledRaw = colMap['enabled'] !== undefined ? String(vals[colMap['enabled']] ?? '').toLowerCase().trim() : '';
            const isEnabled = enabledRaw === '' ? true : (enabledRaw === '1' || enabledRaw === 'true' || enabledRaw === 'yes');

            const legacyZone = colMap['zone'] !== undefined ? String(vals[colMap['zone']] ?? '').toUpperCase().replaceAll('"', "").trim() : '';
            const z1 = colMap['zone1'] !== undefined ? String(vals[colMap['zone1']] ?? '').toUpperCase().replaceAll('"', "").trim() : legacyZone;
            const z2 = colMap['zone2'] !== undefined ? String(vals[colMap['zone2']] ?? '').toUpperCase().replaceAll('"', "").trim() : legacyZone;
            const z3 = colMap['zone3'] !== undefined ? String(vals[colMap['zone3']] ?? '').toUpperCase().replaceAll('"', "").trim() : legacyZone;
            const z4 = colMap['zone4'] !== undefined ? String(vals[colMap['zone4']] ?? '').toUpperCase().replaceAll('"', "").trim() : legacyZone;

            const nameIdx = colMap['name'] !== undefined ? colMap['name'] : (colMap['zone'] !== undefined ? 4 : 3);

            results.push({
                x: parseInt(vals[colMap['x'] ?? 0]) || 0,
                y: parseInt(vals[colMap['y'] ?? 1]) || 0,
                z: parseInt(vals[colMap['z'] ?? 2]) || 0,
                name: String(vals[nameIdx] ?? '').toUpperCase().replaceAll('"', "").trim(),
                occupied: occupiedVal === 'true' || occupiedVal === '1' || occupiedVal === 'yes',
                size_x: parseInt(vals[colMap['size_x']]) || 1,
                size_y: parseInt(vals[colMap['size_y']]) || 1,
                size_z: parseInt(vals[colMap['size_z']]) || 1,
                enabled: isEnabled,
                zone1: z1,
                zone2: z2,
                zone3: z3,
                zone4: z4,
                zone: z1 || legacyZone
            });
        }
        if (results.length > 0) {
            locationData.value = results;
            renderLocations(results);
        }
    };
    reader.readAsText(file);
}

onMounted(() => {
    initThree();
    locationData.value = generateMockData();
    renderLocations(locationData.value);
    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    if (container.value) {
        container.value.addEventListener('pointerdown', onPointerDown);
        container.value.addEventListener('pointerup', onPointerUp);
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    if (container.value) {
        container.value.removeEventListener('pointerdown', onPointerDown);
        container.value.removeEventListener('pointerup', onPointerUp);
    }
    clearAnchor();
    renderer?.dispose();
});
</script>

<style scoped>
.canvas-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    position: relative;
}

.custom-tooltip {
    position: fixed;
    pointer-events: none;
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 12px 16px;
    border-radius: 12px;
    color: white;
    z-index: 1000;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    min-width: 180px;
}
</style>
