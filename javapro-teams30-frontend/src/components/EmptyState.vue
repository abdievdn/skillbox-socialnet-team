<template>
  <div class="empty-state">
    {{text}}
    <img v-if="type" :src="imagePath[type]" alt="">
  </div>
</template>

<script>
export default {
  name: "EmptyState",
  props: ["text", "type"],
  data() {
    return {
      imagePath: {
        people: '/static/img/no-people.svg',
        messages: '/static/img/no-messages.svg',
      }
    }
  }
}
</script>

<style scoped lang="stylus">
@import '../assets/stylus/base/vars.styl';

.empty-state {
  background: #fff;
  box-shadow: standart-boxshadow;
  text-align: center;
  font-size: 20px;
  padding: 20px
  width: 100%;
}

img {
  margin-left: 5px;
}
</style>
