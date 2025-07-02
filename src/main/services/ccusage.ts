import { spawn } from 'child_process';
import { CCUsageResponse, UsageData, CCUsageError } from '@shared/types';

export class CCUsageService {
  private readonly command = 'ccusage';
  
  async fetchCurrentUsage(): Promise<UsageData> {
    try {
      const output = await this.executeCommand([this.command, 'daily', '--json']);
      const response = this.parseJSON(output);
      
      // ccusageのdailyコマンドは今日の使用量を含む配列を返す
      const today = new Date().toISOString().split('T')[0];
      const todayUsage = response.daily?.find((d: any) => d.date === today) || {
        inputTokens: 0,
        outputTokens: 0,
        totalCost: 0
      };
      
      return {
        inputTokens: todayUsage.inputTokens || 0,
        outputTokens: todayUsage.outputTokens || 0,
        totalCost: todayUsage.totalCost || 0,
        dailyLimit: 20.0, // MVP: $20/日の固定制限
        dailyUsagePercentage: this.calculateUsagePercentage(todayUsage.totalCost || 0),
        lastUpdated: new Date(),
        totalTokens: (todayUsage.inputTokens || 0) + (todayUsage.outputTokens || 0)
      };
    } catch (error) {
      console.error('CCUsageService: Failed to fetch usage:', error);
      throw error;
    }
  }
  
  private executeCommand(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('CCUsageService: Executing command:', args.join(' '));
      
      const process = spawn('env', args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      let error = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      process.on('close', (code) => {
        console.log(`CCUsageService: Command exited with code ${code}`);
        console.log('CCUsageService: Output:', output);
        if (error) console.log('CCUsageService: Error:', error);
        
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`${CCUsageError.EXECUTION_FAILED}: ${error}`));
        }
      });
      
      process.on('error', (err) => {
        console.error('CCUsageService: Process error:', err);
        reject(new Error(`${CCUsageError.COMMAND_NOT_FOUND}: ${err.message}`));
      });
    });
  }
  
  private parseJSON(jsonString: string): CCUsageResponse {
    try {
      const trimmed = jsonString.trim();
      console.log('CCUsageService: Parsing JSON:', trimmed);
      return JSON.parse(trimmed);
    } catch (error) {
      console.error('CCUsageService: JSON parsing error:', error);
      console.error('CCUsageService: Raw JSON:', jsonString);
      throw new Error(CCUsageError.JSON_PARSING_FAILED);
    }
  }
  
  private calculateUsagePercentage(cost: number): number {
    // MVP: 仮の計算（$20/日を100%として計算）
    const dailyBudget = 20.0;
    return Math.min((cost / dailyBudget) * 100.0, 100.0);
  }
}