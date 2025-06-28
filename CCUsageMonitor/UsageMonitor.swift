import Foundation
import SwiftUI

struct UsageData {
  let inputTokens: Int
  let outputTokens: Int
  let totalCost: Double
  let dailyLimit: Double?
  let dailyUsagePercentage: Double
  let lastUpdated: Date
  
  var totalTokens: Int {
    inputTokens + outputTokens
  }
}

class UsageMonitor: ObservableObject {
  @Published var currentUsage: UsageData?
  @Published var isMonitoring = false
  
  private var timer: Timer?
  private let ccusageService = CCUsageService()
  
  init() {
    refreshUsage()
  }
  
  func startMonitoring() {
    guard !isMonitoring else { return }
    
    isMonitoring = true
    timer = Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { _ in
      self.refreshUsage()
    }
    
    refreshUsage()
  }
  
  func stopMonitoring() {
    timer?.invalidate()
    timer = nil
    isMonitoring = false
  }
  
  func refreshUsage() {
    Task {
      do {
        let usage = try await ccusageService.fetchCurrentUsage()
        await MainActor.run {
          self.currentUsage = usage
        }
      } catch {
        print("Failed to fetch usage: \(error)")
      }
    }
  }
  
  deinit {
    stopMonitoring()
  }
}