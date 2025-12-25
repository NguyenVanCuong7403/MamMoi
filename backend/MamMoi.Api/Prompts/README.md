# AI Prompt Templates

This folder contains customizable prompt templates for the AI recommendation system.

## Files

| File | Description | Placeholders |
|------|-------------|--------------|
| `ProfessionalPrompt.md` | Expert knowledge context with TreeType and GrowthStage data | `{{TreeTypeJson}}`, `{{StageJson}}` |
| `ModelAcknowledgment.md` | AI model's acknowledgment of understanding | (none) |
| `UserPrompt.md` | User request with tree data and weather | `{{ForDate}}`, `{{TreeJson}}`, `{{WeatherJson}}`, `{{OutputJsonFormat}}` |
| `OutputJsonSchema.json` | Expected JSON output format from AI | (none - this is the schema) |

## How to Edit

1. **Edit any `.txt` or `.json` file** using your preferred text editor
2. **Keep the placeholders** (e.g., `{{TreeTypeJson}}`) - they will be replaced with actual data at runtime
3. **Restart the application** after making changes

## Placeholder Reference

| Placeholder | Description |
|-------------|-------------|
| `{{TreeTypeJson}}` | JSON data of the tree type (name, tolerances, care guide, etc.) |
| `{{StageJson}}` | JSON data of current growth stage (watering, fertilizing, care instructions, etc.) |
| `{{TreeJson}}` | JSON data of the specific tree instance |
| `{{WeatherJson}}` | JSON data of current weather conditions |
| `{{ForDate}}` | Target date for recommendations (YYYY-MM-DD) |
| `{{OutputJsonFormat}}` | Content from OutputJsonSchema.json |

## Tips

- The prompts are in Vietnamese to get Vietnamese responses from AI
- You can modify the expert knowledge points in `ProfessionalPrompt.txt`
- Adjust the output schema in `OutputJsonSchema.json` to change response structure
