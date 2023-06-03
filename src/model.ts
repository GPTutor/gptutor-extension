import { ExtensionContext, window } from "vscode";

export async function getModel(context: ExtensionContext) {
  const options: {
    [key: string]: (context: ExtensionContext) => Promise<void>;
  } = {
    "gpt-3.5-turbo (default)": setModel("gpt-3.5-turbo"),
    "gpt-4": setModel("gpt-4"),
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

function setModel(model: string) {
  return async function (context: ExtensionContext) {
    context.globalState.update("MODEL", model);
    window.showInformationMessage("Model Saved");
  };
}
