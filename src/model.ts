import { ExtensionContext, window, workspace } from "vscode";
import * as vscode from "vscode";
import { DefaultOpenAiModel } from "./openAi";
let models = [
  "gpt-3.5-turbo",
  "gpt-4",
  "gpt-3.5-turbo-16k",
  "gpt-3.5-turbo-0301",
  "gpt-4-0314",
  "gpt-4-32k",
];

export function getModel() {
  return (
    (vscode.workspace
      .getConfiguration("")
      .get("GPTutor.openaiModel") as string) || DefaultOpenAiModel
  );
}

export async function setModel(model: string, verbose: boolean = true) {
  model = model.toLowerCase();
  if (models.includes(model)) {
    await vscode.workspace
      .getConfiguration("")
      .update("GPTutor.openaiModel", model, vscode.ConfigurationTarget.Global);
    if (verbose) window.showInformationMessage("Model Saved");
  } else {
    if (verbose)
      window.showErrorMessage(`Invalid model name, should be ${models}`);
  }
}
