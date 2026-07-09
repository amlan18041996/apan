<template>
  <div class="min-h-screen bg-background">
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
    <CartDrawer />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts"></script>
