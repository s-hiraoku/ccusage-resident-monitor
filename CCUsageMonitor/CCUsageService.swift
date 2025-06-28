import Foundation

struct CCUsageResponse: Codable {
  let inputTokens: Int
  let outputTokens: Int
  let totalCost: Double
  let date: String?
  
  enum CodingKeys: String, CodingKey {
    case inputTokens = "input_tokens"
    case outputTokens = "output_tokens" 
    case totalCost = "total_cost"
    case date
  }
}

enum CCUsageError: Error {
  case commandNotFound
  case executionFailed(String)
  case jsonParsingFailed
  case noData
}

class CCUsageService {
  private let ccusageCommand = "ccusage"
  
  func fetchCurrentUsage() async throws -> UsageData {
    let output = try await executeCommand([ccusageCommand, "daily", "--json"])
    let response = try parseJSON(output)
    
    return UsageData(
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      totalCost: response.totalCost,
      dailyLimit: nil, // MVP: 固定制限なし
      dailyUsagePercentage: calculateUsagePercentage(cost: response.totalCost),
      lastUpdated: Date()
    )
  }
  
  private func executeCommand(_ arguments: [String]) async throws -> String {
    return try await withCheckedThrowingContinuation { continuation in
      let process = Process()
      process.executableURL = URL(fileURLWithPath: "/usr/bin/env")
      process.arguments = arguments
      
      let pipe = Pipe()
      process.standardOutput = pipe
      process.standardError = pipe
      
      do {
        try process.run()
        
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        let output = String(data: data, encoding: .utf8) ?? ""
        
        process.waitUntilExit()
        
        if process.terminationStatus == 0 {
          continuation.resume(returning: output)
        } else {
          continuation.resume(throwing: CCUsageError.executionFailed(output))
        }
      } catch {
        continuation.resume(throwing: CCUsageError.commandNotFound)
      }
    }
  }
  
  private func parseJSON(_ jsonString: String) throws -> CCUsageResponse {
    guard let data = jsonString.data(using: .utf8) else {
      throw CCUsageError.jsonParsingFailed
    }
    
    do {
      let decoder = JSONDecoder()
      return try decoder.decode(CCUsageResponse.self, from: data)
    } catch {
      print("JSON parsing error: \(error)")
      print("Raw JSON: \(jsonString)")
      throw CCUsageError.jsonParsingFailed
    }
  }
  
  private func calculateUsagePercentage(cost: Double) -> Double {
    // MVP: 仮の計算（$20/日を100%として計算）
    let dailyBudget = 20.0
    return min((cost / dailyBudget) * 100.0, 100.0)
  }
}