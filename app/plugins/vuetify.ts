
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default defineNuxtPlugin((nuxtApp) => {
    const vuetify = createVuetify({
        components,
        directives,
        theme: {
            defaultTheme: 'dark',
            themes: {
                dark: {
                    colors: {
                        primary: '#FF4D00', // Neon Orange
                        secondary: '#FF7F00',
                        accent: '#FF0000',
                        error: '#FF3D00',
                        info: '#00E5FF',
                        success: '#00E676',
                        warning: '#FFEA00',
                        background: '#020617', // Much darker slate/black
                        surface: '#0f172a',    // Deeper surface
                    }
                },
                light: {
                    colors: {
                        primary: '#FF5F1F',
                        secondary: '#FF8C00',
                        accent: '#FF4500',
                        error: '#FF5252',
                        info: '#2196F3',
                        success: '#4CAF50',
                        warning: '#FFC107',
                    }
                }
            }
        },
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: {
                mdi,
            },
        },
    })

    nuxtApp.vueApp.use(vuetify)
})
