package expo.modules.expoguesslanguage

import android.os.Bundle
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.nl.languageid.LanguageIdentification
import com.google.mlkit.nl.languageid.LanguageIdentificationOptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoGuessLanguageModule : Module() {
  private val isPlayServicesAvailable: Boolean by lazy {
    val context = appContext.reactContext ?: return@lazy false
    GoogleApiAvailability.getInstance()
      .isGooglePlayServicesAvailable(context) == ConnectionResult.SUCCESS
  }

  private val languageIdentifier by lazy {
    val options = LanguageIdentificationOptions.Builder()
      .setConfidenceThreshold(0.01f)
      .build()
    LanguageIdentification.getClient(options)
  }

  override fun definition() = ModuleDefinition {
    Name("ExpoGuessLanguage")

    Property("isNativeAvailable") {
      return@Property isPlayServicesAvailable
    }

    AsyncFunction("guessLanguage") { text: String, maxResults: Int ->
      if (text.isBlank()) return@AsyncFunction emptyList<Bundle>()

      val task = languageIdentifier.identifyPossibleLanguages(text)
      val results = Tasks.await(task)

      results
        .filter { it.languageTag != "und" }
        .sortedByDescending { it.confidence }
        .map { result ->
          // Normalize to primary language subtag only (e.g. "ar-Latn" → "ar")
          val lang = result.languageTag.substringBefore('-')
          lang to result.confidence.toDouble()
        }
        // Merge duplicates after normalization (keep highest confidence)
        .groupBy({ it.first }, { it.second })
        .map { (lang, confidences) -> lang to confidences.max() }
        .sortedByDescending { it.second }
        .take(maxResults)
        .map { (lang, confidence) ->
          Bundle().apply {
            putString("language", lang)
            putDouble("confidence", confidence)
          }
        }
    }
  }
}
