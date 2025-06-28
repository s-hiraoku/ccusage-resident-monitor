import SwiftUI

@main
struct CCUsageMonitorApp: App {
  @StateObject private var usageMonitor = UsageMonitor()
  
  var body: some Scene {
    MenuBarExtra("CCUsage", systemImage: "chart.bar.fill") {
      ContentView()
        .environmentObject(usageMonitor)
    }
    .menuBarExtraStyle(.window)
  }
}