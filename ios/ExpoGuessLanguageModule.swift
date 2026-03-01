import ExpoModulesCore
import NaturalLanguage

public class ExpoGuessLanguageModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoGuessLanguage")

    Property("isNativeAvailable") {
      return true
    }

    AsyncFunction("guessLanguage") { (text: String, maxResults: Int) -> [[String: Any]] in
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
}
