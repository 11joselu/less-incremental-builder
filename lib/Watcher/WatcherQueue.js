class WatcherQueue {
  constructor(queue, chokidarWatcher) {
    this.queue = queue;
    this.chokidarWatcher = chokidarWatcher;
  }

  getQueue() {
    return this.queue;
  }

  isWatched(filePath) {
    return this.queue.includes(filePath);
  }

  addToWatch(newFilePath) {
    this.queue.push(newFilePath);
    this.chokidarWatcher.add(newFilePath);
  }

  remove(index) {
    if (index >= 0) {
      this.queue.splice(index, 1);

      return true;
    }

    return false;
  }

  unwatchFile(filePath) {
    this.chokidarWatcher.unwatch(filePath);
  }

  findIndexPath(filePath) {
    return this.queue.findIndex(p => p === filePath);
  }
}

module.exports = WatcherQueue;
