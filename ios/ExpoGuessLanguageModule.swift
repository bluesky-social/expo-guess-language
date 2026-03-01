import ExpoModulesCore
import NaturalLanguage

public class ExpoGuessLanguageModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoGuessLanguage")

    Property("isNativeAvailable") {
      return true
    }

    Function("guessLanguageSync") { (text: String, maxResults: Int) -> [[String: Any]] in
      return Self.detect(text: text, maxResults: maxResults)
    }

    AsyncFunction("guessLanguageAsync") { (text: String, maxResults: Int) -> [[String: Any]] in
      return Self.detect(text: text, maxResults: maxResults)
    }
  }

  private static func detect(text: String, maxResults: Int) -> [[String: Any]] {
    let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else { return [] }

    let recognizer = NLLanguageRecognizer()
    recognizer.processString(text)
    let hypotheses = recognizer.languageHypotheses(withMaximum: maxResults)
    recognizer.reset()

    let results = hypotheses
      .filter { $0.key != .undetermined }
      .sorted { $0.value > $1.value }
      .prefix(maxResults)
      .map { ["language": $0.key.rawValue, "confidence": $0.value] as [String: Any] }

    return Array(results)
  }
}
