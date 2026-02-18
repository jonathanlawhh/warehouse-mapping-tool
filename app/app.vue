<template>
  <v-app>
    <NuxtPage />
  </v-app>
</template>

<style>
/* Code for Firefox */
::-moz-selection {
  color: #ffffff;
  background-color: #FF4D00;
}

::selection {
  color: #ffffff;
  background-color: #FF4D00;
}

::-webkit-scrollbar {
  width: 6px;
  height: 4px;
  background: #020617;
}

::-webkit-scrollbar-thumb {
  background: #FF4D00;
  border-radius: 2px;
}
</style>