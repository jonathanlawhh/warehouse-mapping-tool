# Warehouse Mapping Tool

[[`Warehouse Mapping Tool`](https://warehouse.jonathanlawhh.com/) [`My Website`](https://jonathanlawhh.com/)]


A high-performance, interactive 3D warehouse visualization and layout planning tool built with **Nuxt 4**, **Three.js**. Transform flat CSV logistics data into a vibrant, neon-themed digital twin. Built with Google Antigravity.

## ✨ Features

-   **⚡ High-Performance Rendering**: Uses `InstancedMesh` to render 10,000+ storage locations at 60 FPS.
-   **📁 Dynamic Layout Import**: Upload CSV files (`x, y, z, zone, name`) to instantly generate complex warehouse maps.
-   **🔍 Filtering**: 
    -   **Level**: Isolate specific vertical tiers of the rack system.
    -   **Zone**: Focus on specific operational areas (e.g., Picking, Storage, Overflow).

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.0.0 or higher)
-   npm (v9.0.0 or higher)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/jonathanlawhh/warehouse-mapping-tool.git
    cd warehouse-mapping-tool
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

## 📊 CSV Format

To import your own warehouse data, use a CSV file with the following headers:

| Header | Description | Data Type |
| :--- | :--- | :--- |
| `x` | Rack ID / X-Coordinate | Integer |
| `y` | Compartment ID / Y-Coordinate | Integer |
| `z` | Level ID / Z-Coordinate | Integer |
| `zone` | Functional area name (e.g. `PICKING_01`) | String |
| `name` | Location label (e.g. `LOC-01-05-02`) | String |

## 🛠️ Tech Stack

-   **Framework**: [Nuxt.js 4](https://nuxt.com/)
-   **UI Framework**: [Vuetify 3](https://vuetifyjs.com/)
-   **3D Engine**: [Three.js](https://threejs.org/)

