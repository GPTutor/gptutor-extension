import { ExtensionContext, window, workspace } from "vscode";
import * as vscode from "vscode";
export async function getModel(context: ExtensionContext) {
  const options: {
    [key: string]: (context: ExtensionContext) => Promise<void>;
  } = {
    "gpt-3.5-turbo (default)": async () => {
      setModel("gpt-3.5-turbo");
    },
    "gpt-4": async () => {
      setModel("gpt-4");
    },
  };
  const quickPick = window.createQuickPick();
  quickPick.items = Object.keys(options).map((label) => ({ label }));
  quickPick.onDidChangeSelection((selection) => {
    if (selection[0]) {
      options[selection[0].label](context).catch(console.error);
    }
    quickPick.hide();
  });
  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}

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
