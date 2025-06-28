import SwiftUI

struct ContentView: View {
  @EnvironmentObject var usageMonitor: UsageMonitor
  
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack {
        Image(systemName: "chart.bar.fill")
          .foregroundColor(.blue)
        Text("Claude Code Usage")
          .font(.headline)
        Spacer()
      }
      
      Divider()
      
      if let usage = usageMonitor.currentUsage {
        UsageDisplayView(usage: usage)
      } else {
        HStack {
          ProgressView()
            .scaleEffect(0.8)
          Text("Loading usage data...")
            .foregroundColor(.secondary)
        }
      }
      
      Divider()
      
      HStack {
        Button("Refresh") {
          usageMonitor.refreshUsage()
        }
        
        Spacer()
        
        Button("Quit") {
          NSApplication.shared.terminate(nil)
        }
        .foregroundColor(.red)
      }
    }
    .padding()
    .frame(width: 280)
    .onAppear {
      usageMonitor.startMonitoring()
    }
  }
}

struct UsageDisplayView: View {
  let usage: UsageData
  
  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack {
        Text("Input Tokens:")
        Spacer()
        Text("\(usage.inputTokens)")
          .fontWeight(.semibold)
      }
      
      HStack {
        Text("Output Tokens:")
        Spacer()
        Text("\(usage.outputTokens)")
          .fontWeight(.semibold)
      }
      
      HStack {
        Text("Total Cost:")
        Spacer()
        Text("$\(usage.totalCost, specifier: "%.4f")")
          .fontWeight(.semibold)
          .foregroundColor(usage.totalCost > 10.0 ? .red : .primary)
      }
      
      if let limit = usage.dailyLimit {
        VStack(alignment: .leading, spacing: 4) {
          HStack {
            Text("Daily Progress:")
            Spacer()
            Text("\(Int(usage.dailyUsagePercentage))%")
              .fontWeight(.semibold)
              .foregroundColor(progressColor)
          }
          
          ProgressView(value: usage.dailyUsagePercentage / 100.0)
            .progressViewStyle(LinearProgressViewStyle(tint: progressColor))
        }
      }
      
      HStack {
        Image(systemName: "clock")
          .foregroundColor(.secondary)
        Text("Updated: \(usage.lastUpdated, formatter: timeFormatter)")
          .font(.caption)
          .foregroundColor(.secondary)
      }
    }
  }
  
  private var progressColor: Color {
    let percentage = usage.dailyUsagePercentage
    if percentage >= 90 { return .red }
    else if percentage >= 75 { return .orange }
    else { return .green }
  }
  
  private var timeFormatter: DateFormatter {
    let formatter = DateFormatter()
    formatter.timeStyle = .short
    return formatter
  }
}

#Preview {
  ContentView()
    .environmentObject(UsageMonitor())
}