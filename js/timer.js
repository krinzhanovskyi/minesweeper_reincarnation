class Timer {
  constructor(onTick) {
    this.seconds = 0;
    this.intervalId = null;
    this.onTick = onTick;
  }

  start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.seconds++;
      this.onTick(this.seconds);
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.stop();
    this.seconds = 0;
    this.onTick(0);
  }
}
