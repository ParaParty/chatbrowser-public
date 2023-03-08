<template>
  <div>
    <label class="f jb ic gap-2">
      <span class="fn">
        <slot name="name" />
      </span>

      <slot />
    </label>
    <span class="pl-1 tx-sm tx-gray-600 font-light"><slot name="desc" /></span>
  </div>
</template>
