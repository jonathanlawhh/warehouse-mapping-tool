/**
 * Simulator Logic and Configuration
 */

export const CONFIG = {
    // 40ft High Cube Container Dimensions (mm)
    container: {
        length: 12000,
        width: 2350,
        height: 2700,
        volume: 12000 * 2350 * 2700 / 1e9, // in m3
    },
    // Scale factor for 3D visualization (1 unit = 1 meter)
    scale: 0.001
};

export const INITIAL_GOODS = [
    { id: 'g1', name: 'Euro', length: 1200, width: 800, height: 800, weight: 450, color: '#4361ee' },
    { id: 'g2', name: 'Euro', length: 1250, width: 800, height: 800, weight: 800, color: '#4361ee' },
    { id: 'g3', name: 'Euro', length: 1250, width: 400, height: 800, weight: 25, color: '#4361ee' },
    { id: 'g4', name: 'Euro', length: 1200, width: 800, height: 800, weight: 1200, color: '#4361ee' },
    { id: 'g5', name: 'Half', length: 600, width: 600, height: 600, weight: 300, color: '#7209b7' },
    { id: 'g6', name: 'Half', length: 600, width: 600, height: 600, weight: 300, color: '#7209b7' },
    { id: 'g7', name: 'Half', length: 600, width: 600, height: 600, weight: 300, color: '#7209b7' },
    { id: 'g8', name: 'Long', length: 2500, width: 800, height: 500, weight: 800, color: '#4cc9f0' },
    { id: 'g9', name: 'Euro', length: 1200, width: 800, height: 800, weight: 450, color: '#4361ee' },
    { id: 'g10', name: 'Euro', length: 1250, width: 800, height: 800, weight: 800, color: '#4361ee' },
    { id: 'g11', name: 'Euro', length: 1250, width: 400, height: 800, weight: 25, color: '#4361ee' },
    { id: 'g12', name: 'Euro', length: 1200, width: 800, height: 800, weight: 1200, color: '#4361ee' },
    { id: 'g13', name: 'Half', length: 600, width: 600, height: 600, weight: 300, color: '#7209b7' },
    { id: 'g14', name: 'Half', length: 600, width: 600, height: 600, weight: 300, color: '#7209b7' },
    { id: 'g15', name: 'Half', length: 600, width: 600, height: 600, weight: 300, color: '#7209b7' },
    { id: 'g16', name: 'Long', length: 2500, width: 800, height: 500, weight: 800, color: '#4cc9f0' },
];

export class LoadingManager {
    constructor() {
        this.loadedGoods = [];
        this.totalVolume = 0; // m3
        this.totalWeight = 0; // kg
    }

    addGood(good, position) {
        // Validate boundaries
        if (!this.isWithinBoundaries(good, position)) {
            return { success: false, error: 'Outside container boundaries!' };
        }

        // Check for collisions with other goods
        if (this.isColliding(good, position)) {
            return { success: false, error: 'Collision detected with another item!' };
        }

        this.loadedGoods.push({ ...good, position });
        this.calculateTotals();
        return { success: true };
    }

    undoLastGood() {
        if (this.loadedGoods.length === 0) return null;
        const removed = this.loadedGoods.pop();
        this.calculateTotals();
        return removed;
    }

    isColliding(good, pos) {
        const halfL = good.length / 2;
        const halfW = good.width / 2;
        const halfH = good.height / 2;

        const g1 = {
            minX: pos.x - halfL, maxX: pos.x + halfL,
            minY: pos.y - halfH, maxY: pos.y + halfH,
            minZ: pos.z - halfW, maxZ: pos.z + halfW
        };

        // Added a small margin to allow stacking perfectly without float precision issues
        const margin = 0.2;

        for (const loaded of this.loadedGoods) {
            const hL = loaded.length / 2;
            const hW = loaded.width / 2;
            const hH = loaded.height / 2;
            const p = loaded.position;

            const g2 = {
                minX: p.x - hL, maxX: p.x + hL,
                minY: p.y - hH, maxY: p.y + hH,
                minZ: p.z - hW, maxZ: p.z + hW
            };

            // AABB Collision Detection with margin
            const overlapX = g1.minX < g2.maxX - margin && g1.maxX > g2.minX + margin;
            const overlapY = g1.minY < g2.maxY - margin && g1.maxY > g2.minY + margin;
            const overlapZ = g1.minZ < g2.maxZ - margin && g1.maxZ > g2.minZ + margin;

            if (overlapX && overlapY && overlapZ) {
                return true;
            }
        }
        return false;
    }

    isValidPlacement(good, position) {
        return this.isWithinBoundaries(good, position) && !this.isColliding(good, position);
    }

    isWithinBoundaries(good, pos) {
        const { length, width, height } = CONFIG.container;

        // Container boundaries (positions in space)
        const containerLeft = -length / 2;
        const containerRight = length / 2;
        const containerBack = -width / 2;
        const containerFront = width / 2;
        const containerBottom = 0;
        const containerTop = height;

        // Good boundaries (positions in space)
        const halfL = good.length / 2;
        const halfW = good.width / 2;
        const halfH = good.height / 2;

        const goodLeft = pos.x - halfL;
        const goodRight = pos.x + halfL;
        const goodBack = pos.z - halfW;
        const goodFront = pos.z + halfW;
        const goodBottom = pos.y - halfH;
        const goodTop = pos.y + halfH;

        return (
            goodLeft >= containerLeft &&
            goodRight <= containerRight &&
            goodBack >= containerBack &&
            goodFront <= containerFront &&
            goodBottom >= containerBottom &&
            goodTop <= containerTop
        );
    }

    calculateTotals() {
        this.totalVolume = this.loadedGoods.reduce((sum, g) => sum + (g.length * g.width * g.height), 0) / 1e9;
        this.totalWeight = this.loadedGoods.reduce((sum, g) => sum + g.weight, 0);
    }

    getUtilization() {
        return (this.totalVolume / CONFIG.container.volume) * 100;
    }

    reset() {
        this.loadedGoods = [];
        this.totalVolume = 0;
        this.totalWeight = 0;
    }
}
