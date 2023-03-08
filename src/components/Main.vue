<template>
  <div class="f w-full h-full">
    <div class="fa fc">
      <Suspense>
        <MsgView />
      </Suspense>

      <MsgSearch class="fn" />
    </div>

    <OptionView />
  </div>
</template>
