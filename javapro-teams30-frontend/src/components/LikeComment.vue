<template lang="pug">
  .like-comment(:class="{active, fill}")
    template(v-if="comment")
      simple-svg(:filepath="'/static/img/comment.svg'" :width="width" :height="height")
      span(v-if="quantity >= 1" :style="{'font-size': fontSize}") {{quantity}}
    .like-comment__checkbox(v-else)
      input(type="checkbox" :checked="active" :id="randomStr" @change="onChange")
      label(:for="randomStr" :style="{'font-size': fontSize}")
        template(v-if="localQuantity >= 1") {{localQuantity}}
</template>

<script>
export default {
  name: 'Like',
  props: {
    quantity: Number,
    active: Boolean,
    fill: Boolean,
    width: {
      type: String,
      default: '12px'
    },
    height: {
      type: String,
      default: '12px'
    },
    fontSize: {
      type: String,
      default: '15px'
    },
    comment: Boolean,
    id: Number
  },
  data: () => ({
    randomStr: Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1),
    localQuantity: null,
    localActive: null
  }),
  watch: {
    quantity(val) {
      this.localQuantity = val
    },
    active(val) {
      this.localActive = val
    }
  },
  methods: {
    onChange() {
      this.$emit('liked', this.localActive)
      this.localActive ? this.localQuantity-- : this.localQuantity++
      this.localActive = !this.localActive
    }
  },
  mounted() {
    this.localQuantity = this.quantity
    this.localActive = this.active
  }
}
</script>

<style lang="stylus">
@import '../assets/stylus/base/vars.styl';

.like-comment {
  display: flex;
  align-items: center;

  &.fill {
    &:hover {
      .simple-svg {
        fill: wild-watermelon;

        path {
          stroke: wild-watermelon;
        }
      }
    }

    .simple-svg {
      fill: silver-sand;

      path {
        stroke: silver-sand;
      }
    }
  }

  &.active {
    &:hover {
      .simple-svg {
        fill: transparent;
      }
    }

    .simple-svg {
      fill: wild-watermelon;

      path {
        stroke: wild-watermelon;
      }
    }

    span {
      color: wild-watermelon;
    }
  }

  span {
    font-weight: 600;
    color: #AEAEBD;
    margin-left: 5px;
  }
}

.like-comment__checkbox {
  input {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
    &:focus-visible,
    &:hover,
    &:checked,
    &:active {
      & + label {
        background-image: url('/static/img/like-active.svg');
        color: wild-watermelon;
      }
    }

    &:focus-visible,
    &:hover {
      & + label {
        opacity: 0.5;
      }
    }

    &:checked,
    &:active {
      & + label {
        opacity: 1;
      }
    }
  }

  label {
    will-change: background-image;
    width: 18px;
    height: 16px;
    display: block;
    background: url('/static/img/like.svg') center no-repeat;
    background-size: 18px;
    padding-left: 25px;
    font-weight: 600;
    color: #AEAEBD;
    cursor: pointer;
    transition: background-image 0.3s, color 0.3s, opacity 0.3s;
  }
}
</style>
