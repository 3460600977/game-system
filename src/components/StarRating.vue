<template>
  <div class="star-rating">
    <Icon class="star" :type="STAR_ICON_MAP[item]" v-for="(item, index) in stars" :key="`${index}${item}`" />
  </div>
</template>

<script>
const STAR_ICON_MAP = {
  1: 'md-star',
  0.5: 'md-star-half',
  0: 'md-star-outline',
};

export default {
  props: {
    starNumber: {
      type: Number,
      default: 0,
    },
    maxNumber: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      STAR_ICON_MAP,
      stars: [],
    };
  },
  mounted() {
    this.drawStars();
  },
  methods: {
    drawStars() {
      const stars = new Array(this.maxNumber).fill(0);
      const numbers = this.starNumber.toString().split('.');
      const starsNum = parseInt(numbers[0], 10);
      for (let i = 0; i < starsNum; i += 1) {
        stars[i] = 1;
      }
      if (numbers[1]) {
        stars[starsNum] = 0.5;
      }
      this.stars = stars;
    },
  },
  watch: {
    starNumber() {
      this.drawStars();
    },
  },
};
</script>

<style lang="less" scoped>
.star-rating {
  display: inline-block;

  .star {
    color: #FDCC0D;
    font-size: 24px;
  }
}
</style>
