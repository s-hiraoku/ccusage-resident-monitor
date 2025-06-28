// swift-tools-version: 5.10
import PackageDescription

let package = Package(
  name: "CCUsageMonitor",
  platforms: [
    .macOS(.v13)
  ],
  products: [
    .executable(
      name: "CCUsageMonitor",
      targets: ["CCUsageMonitor"]
    )
  ],
  targets: [
    .executableTarget(
      name: "CCUsageMonitor",
      dependencies: [],
      path: "Sources"
    )
  ]
)