import { window, env, Uri, ExtensionContext } from "vscode";
import { openAiIsActive } from "./openAi";

export async function getApiKey(context: ExtensionContext) {
  const options: {
    [key: string]: (context: ExtensionContext) => Promise<void>;
  } = {
    "Enter My OpenAI API key": inputApiKey,
    "How to get API key?": getLink,
  };
  const quickPick = window.createQuickPick();
  quickPick.items = Object.keys(options).map((label) => ({ label }));
  quickPick.onDidChangeSelection((selection) => {
    if (selection[0]) {
      options[selection[0].label](context).catch(console.error);
    }
  });
  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}

async function inputApiKey(context: ExtensionContext, invalidKey = false) {
  const result = await window.showInputBox({
    title: context.workspaceState.get("invalidKey", false)
      ? "Invalid OpenAI API Key, Try again."
      : "Input Your OpenAI API Key",
    value: "",
    placeHolder: "Paste My API Key",
  });
  if (await openAiIsActive(result)) {
    context.globalState.update("OpenAI_API_KEY", result);
    context.workspaceState.update("invalidKey", NaN);
    window.showInformationMessage("API Key Saved");
  } else {
    window.showErrorMessage("Invalid API Key");
    context.workspaceState.update("invalidKey", true);
    getApiKey(context);
    return;
  }
}

async function getLink() {
  env.openExternal(Uri.parse("https://platform.openai.com/account/api-keys"));
}
