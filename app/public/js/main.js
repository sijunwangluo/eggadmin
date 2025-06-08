new Vue({
  el: '#app',
  data: {
    activeIndex: '1'
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    }
  }
}); 