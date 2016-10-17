class Progress {
  constructor(totalPages, totalTime=5, currentTime=0) {
    this.currentSecond = currentTime * 60;
    this.limitSecond = totalTime * 60;
    
    this.setProgress("#progress-page", totalPages, 1);
    this.setProgress("#progress-time", this.limitSecond, this.currentSecond);
  }
  
  setProgress(selector, total, progress) {
    const percentage = (progress / total) * 100;
    document.querySelector(selector).style.width = `${percentage}%`;
  }
  
  process() {
    setTimeout(() => {
      this.currentSecond++;
      this.setProgress("#progress-time", this.limitSecond, this.currentSecond);
      if (this.currentSecond < this.limitSecond) {
        this.process();
      }
    }, 1000);
  }
}

module.exports = Progress
