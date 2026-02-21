<template>
    <div>
        <!-- Navigation Drawer for Controls -->
        <v-navigation-drawer v-model="drawer" location="left" permanent width="320" class="bg-surface-light border-r"
            elevation="0">
            <div class="pa-4">
                <v-btn block variant="flat" color="primary" to="/" prepend-icon="mdi-home" rounded="lg" class="mt-4">
                    Main Page
                </v-btn>

                <div class="mb-6 mt-16">
                    <div class="text-overline mb-2">Import Layout</div>
                    <v-file-input label="Upload CSV File" prepend-icon="mdi-file-upload" accept=".csv"
                        variant="outlined" density="compact" hide-details @change="handleCSVUpload"></v-file-input>
                    <div class="text-caption mt-1 text-medium-emphasis">
                        Format: x, y, z, zone, name
                    </div>
                </div>

                <v-divider class="mb-6"></v-divider>

                <div class="mb-6">
                    <div class="text-overline mb-2">Quick Stats</div>
                    <v-row dense>
                        <v-col cols="6">
                            <v-card variant="tonal" class="pa-2 text-center" color="primary">
                                <div class="text-caption">Locations</div>
                                <div class="text-h6 font-weight-bold">{{ filteredCount }}</div>
                            </v-card>
                        </v-col>
                        <v-col cols="6">
                            <v-card variant="tonal" class="pa-2 text-center" color="secondary">
                                <div class="text-caption">Total Zones</div>
                                <div class="text-h6 font-weight-bold">{{ filteredZoneCount }}</div>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>

                <v-divider class="mb-6"></v-divider>

                <div class="mb-6">
                    <div class="text-overline mb-2">Filters</div>
                    <v-list-subheader>Level Filter</v-list-subheader>
                    <v-slider v-model="levelFilter" :min="0" :max="maxLevels" :step="1" class="px-2" color="primary"
                        thumb-label track-color="surface-variant" @update:model-value="applyFilter">
                        <template v-slot:append>
                            <div class="text-body-2 font-weight-bold" style="width: 40px">
                                {{ levelFilter === 0 ? 'All' : levelFilter }}
                            </div>
                        </template>
                    </v-slider>

                    <v-list-subheader>Zone Filter</v-list-subheader>
                    <v-autocomplete v-model="zoneFilter" :items="availableZones" density="compact" variant="outlined"
                        class="px-2" color="primary" multiple chips closable-chips clearable
                        placeholder="Search zones..." @update:model-value="applyFilter"></v-autocomplete>
                </div>

                <v-divider class="mb-6"></v-divider>

                <div class="mb-6">
                    <div class="text-overline mb-2">Controls</div>
                    <v-row dense>
                        <v-col cols="12">
                            <v-btn color="primary" variant="outlined" @click="resetView">Reset Camera</v-btn>
                        </v-col>
                    </v-row>
                </div>


            </div>
        </v-navigation-drawer>

        <!-- Main Content (3D Canvas) -->
        <v-main class="bg-black pa-0">
            <div ref="container" class="canvas-container">
                <!-- Tooltip Overlay -->
                <div v-if="hoveredData" class="custom-tooltip" :style="{
                    left: tooltipPos.x + 'px',
                    top: tooltipPos.y + 'px'
                }">
                    <div class="text-h6 mb-1">{{ hoveredData.name }}</div>
                    <v-chip :color="hoveredData.colorHex" size="small" class="font-weight-bold" variant="flat">
                        {{ hoveredData.zone }}
                    </v-chip>
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
    title: 'App | Warehouse Mapping Tool'
});

const CONFIG = {
    boxSize: { width: 1.0, height: 1.0, depth: 1.2 },
    gapBetweenRacks: 1,
    gapBetweenCompartments: 0.4,
    gapBetweenLevels: 0.2,
    colors: {
        background: 0x020617,
        box: 0x1e293b,
        boxEdge: 0x3b82f6,
        floor: '#676767',
        grid: 0x1e293b,
    },
    rackSpacing: 8
};

const drawer = ref(true);
const levelFilter = ref(0);
const zoneFilter = ref<string[]>([]);
const maxLevels = ref(1);
const availableZones = ref<string[]>([]);
const locationData = shallowRef<any[]>([]);
const filteredCount = ref(0);
const filteredZoneCount = ref(0);
const hoveredData = ref<any>(null);
const tooltipPos = reactive({ x: 0, y: 0 });

const container = ref<HTMLElement | null>(null);
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;
let instancedMesh: THREE.InstancedMesh | null = null;
const instanceDataMap = new Map<number, any>();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredInstanceId = -1;
const originalColor = new THREE.Color();
const highlightColor = new THREE.Color(0xffffff);
const sharedMatrix = new THREE.Matrix4();

function initThree() {
    if (!container.value) return;

    const width = container.value.clientWidth;
    const height = container.value.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colors.background);

    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(15, 90, 150);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.value.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 600;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const floorGeometry = new THREE.PlaneGeometry(1000, 400);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: CONFIG.colors.floor
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    scene.add(floor);

    animate();
}

function renderLocations(locations: any[]) {
    if (!scene) return;

    if (instancedMesh) {
        scene.remove(instancedMesh);
        instancedMesh.geometry.dispose();
        (instancedMesh.material as THREE.Material).dispose();
        instancedMesh = null;
        instanceDataMap.clear();
    }

    if (locations.length === 0) return;

    const geometry = new THREE.BoxGeometry(
        CONFIG.boxSize.width,
        CONFIG.boxSize.height,
        CONFIG.boxSize.depth
    );
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff
    });

    instancedMesh = new THREE.InstancedMesh(geometry, material, locations.length);
    const dummy = new THREE.Object3D();
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

        // Manual matrix composition (translation only, scale 1)
        const te = sharedMatrix.elements;
        te[0] = 1; te[4] = 0; te[8] = 0; te[12] = xPos;
        te[1] = 0; te[5] = 1; te[9] = 0; te[13] = yPos;
        te[2] = 0; te[6] = 0; te[10] = 1; te[14] = zPos;
        te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;

        instancedMesh.setMatrixAt(i, sharedMatrix);

        const zoneInfo = getZoneColor(data.zone);
        data.colorHex = zoneInfo.colorHex;
        color.setHex(zoneInfo.hex);
        instancedMesh.setColorAt(i, color);

        if (xPos < minX) minX = xPos;
        if (xPos > maxX) maxX = xPos;
        if (zPos < minZ) minZ = zPos;
        if (zPos > maxZ) maxZ = zPos;
        if (l > maxL) maxL = l;
        zoneSet.add(data.zone);

        instanceDataMap.set(i, data);
    }

    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    instancedMesh.position.x = -centerX;
    instancedMesh.position.z = -centerZ;

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

    scene.add(instancedMesh);

    maxLevels.value = maxL;
    availableZones.value = Array.from(zoneSet).sort();
    filteredCount.value = locations.length;
    filteredZoneCount.value = zoneSet.size;
}

function getMax(arr: number[]): number {
    if (arr.length === 0) return 0;
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) max = arr[i];
    }
    return max;
}

function resetView() {
    controls.reset()
}

const zoneColorCache = new Map<string, { hex: number, colorHex: string }>();
function getZoneColor(zoneName: string): { hex: number, colorHex: string } {
    if (!zoneName) return { hex: 0x64748b, colorHex: '#64748b' };
    const cached = zoneColorCache.get(zoneName);
    if (cached) return cached;

    let hash = 0;
    for (let i = 0; i < zoneName.length; i++) {
        hash = zoneName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = new THREE.Color(`hsl(${Math.abs(hash % 360)}, 70%, 50%)`);
    const hex = color.getHex();
    const result = { hex, colorHex: '#' + color.getHexString() };
    zoneColorCache.set(zoneName, result);
    return result;
}

function applyFilter() {
    if (!instancedMesh) return;
    const compWidth = CONFIG.boxSize.depth + CONFIG.gapBetweenCompartments;
    const levelHeight = CONFIG.boxSize.height + CONFIG.gapBetweenLevels;
    const boxHeightHalf = CONFIG.boxSize.height / 2;

    let count = 0;
    const activeZones = new Set<string>();
    const zonesInLevel = new Set<string>();
    const zoneFilterSet = new Set(zoneFilter.value);
    const hasZoneFilter = zoneFilterSet.size > 0;
    const currentLevelFilter = levelFilter.value;
    const dataList = locationData.value;
    const total = dataList.length;

    const te = sharedMatrix.elements;

    for (let i = 0; i < total; i++) {
        const data = dataList[i];
        const levelMatch = (currentLevelFilter === 0) || (data.z === currentLevelFilter);

        if (levelMatch) {
            zonesInLevel.add(data.zone);
        }

        const zoneMatch = !hasZoneFilter || zoneFilterSet.has(data.zone);

        if (levelMatch && zoneMatch) {
            count++;
            activeZones.add(data.zone);
            const xPos = (data.x - 1) * CONFIG.rackSpacing;
            const yPos = boxHeightHalf + (data.z - 1) * levelHeight;
            const zPos = (data.y - 1) * compWidth;

            te[0] = 1; te[4] = 0; te[8] = 0; te[12] = xPos;
            te[1] = 0; te[5] = 1; te[9] = 0; te[13] = yPos;
            te[2] = 0; te[6] = 0; te[10] = 1; te[14] = zPos;
            te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;
        } else {
            // Set scale to 0 by zeroing out the diagonal elements
            te[0] = 0; te[4] = 0; te[8] = 0; te[12] = 0;
            te[1] = 0; te[5] = 0; te[9] = 0; te[13] = 0;
            te[2] = 0; te[6] = 0; te[10] = 0; te[14] = 0;
            te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;
        }
        instancedMesh.setMatrixAt(i, sharedMatrix);
    }
    filteredCount.value = count;
    filteredZoneCount.value = activeZones.size;
    availableZones.value = Array.from(zonesInLevel).sort();
    instancedMesh.instanceMatrix.needsUpdate = true;
}

function animate() {
    if (!renderer || !scene || !camera) return;
    requestAnimationFrame(animate);
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
    for (let x = 1; x <= 6; x++) {
        for (let y = 1; y <= 30; y++) {
            for (let z = 1; z <= 8; z++) {
                let zoneType = 'STORAGE';
                if (z <= 2) zoneType = 'PICKING';
                else if (z >= 5) zoneType = 'OVERFLOW';
                data.push({
                    x: x, y: y, z: z,
                    zone: `${zoneType}_${x}`,
                    name: `LOC-${x.toString().padStart(2, '0')}-${y.toString().padStart(2, '0')}-${z}`
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
            results.push({
                x: parseInt(vals[colMap['x'] || 0]) || 0,
                y: parseInt(vals[colMap['y'] || 1]) || 0,
                z: parseInt(vals[colMap['z'] || 2]) || 0,
                zone: String(vals[colMap['zone'] || 3]).toUpperCase().replaceAll('"', "").trim(),
                name: String(vals[colMap['name'] || 4]).toUpperCase().replaceAll('"', "").trim()
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
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('pointermove', onPointerMove);
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
