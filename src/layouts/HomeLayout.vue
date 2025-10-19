<script setup></script>

<template>
  <v-layout>
    <app-navbar :sidebar-toggle="false" variant="home" />

    <v-main class="h-dvh">
      <slot />
    </v-main>
  </v-layout>
</template>
