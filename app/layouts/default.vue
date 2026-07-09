<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
    <CartDrawer />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts"></script>
