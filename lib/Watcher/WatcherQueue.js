class WatcherQueue {
  constructor(queue = []) {
    this.queue = queue;
  }

  getQueue() {
    return this.queue;
  }

  isWatched(filePath) {
    return this.queue.includes(filePath);
  }

  addToWatch(newFilePath) {
    this.queue.push(newFilePath);
  }

  remove(index) {
    if (index >= 0) {
      this.queue.splice(index, 1);

      return true;
    }

    return false;
  }

  findIndexPath(filePath) {
    return this.queue.findIndex(p => p === filePath);
  }
}

module.exports = WatcherQueue;
