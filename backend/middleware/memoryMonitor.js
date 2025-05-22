const memoryMonitor = (req, res, next) => {
  const memoryUsage = process.memoryUsage()

  // Convert to MB for readability
  const memoryUsageMB = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024),
  }

  // Log memory usage if it's high
  if (memoryUsageMB.heapUsed > 500) {
    // Adjust threshold as needed
    console.warn(`HIGH MEMORY USAGE: ${req.method} ${req.originalUrl}`, memoryUsageMB)

    // Force garbage collection if available (requires --expose-gc flag)
    if (global.gc) {
      global.gc()
      console.log("Garbage collection triggered")
    }
  }

  next()
}

module.exports = memoryMonitor
