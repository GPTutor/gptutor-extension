import { ExtensionContext, window, workspace } from "vscode";
import * as vscode from "vscode";

let models = ["gpt-3.5-turbo", "gpt-4"];

export function setModel(model: string) {
  model = model.toLowerCase();
  if (models.includes(model)) {
    vscode.workspace
      .getConfiguration("")
      .update("GPTutor.openaiModel", model, vscode.ConfigurationTarget.Global);

    window.showInformationMessage("Model Saved");
  } else {
    window.showErrorMessage(`Invalid model name, should be ${models}`);
  }
}
