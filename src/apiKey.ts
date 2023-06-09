import { window, env, Uri, ExtensionContext, workspace } from "vscode";
import { openAiIsActive } from "./openAi";
import * as vscode from "vscode";

export async function getApiKey(context: ExtensionContext, gptutor: any) {
  const options: {
    [key: string]: (context: ExtensionContext) => Promise<void>;
  } = {
    // "I have OpenAI API key": inputApiKey,
    "How to get API key?": getLink,
  };
  const quickPick = window.createQuickPick();
  quickPick.placeholder = "Paste Your OpenAI API Key Here.";
  quickPick.items = Object.keys(options).map((label) => ({ label }));
  quickPick.onDidChangeSelection((selection) => {
    if (selection[0]) {
      options[selection[0].label](context).catch(console.error);
    }
  });
  let choices = ["I have OpenAI API key", "How to get API key?"];
  quickPick.onDidChangeValue(() => {
    // INJECT user values into proposed values
    if (!choices.includes(quickPick.value))
      quickPick.items = [quickPick.value, ...choices].map((label) => ({
        label,
      }));
  });
  quickPick.onDidAccept(async () => {
    const selection = quickPick.activeItems[0];
    if (!selection) {
      try {
        if (
          !(await openAiIsActive(
            workspace.getConfiguration("gptutor").get("openAIApiKey")
          ))
        ) {
          throw new Error("Invalid API Key");
        }
      } catch (e) {
        window.showErrorMessage("You need to set API key to use GPTutor");
      }

      return;
    }
    let key = selection.label;
    if (await openAiIsActive(key)) {
      // context.globalState.update("OpenAI_API_KEY", key);
      workspace
        .getConfiguration("gptutor")
        .update("openAIApiKey", key, vscode.ConfigurationTarget.Global);
      context.workspaceState.update("invalidKey", NaN);

      gptutor.setOpenAiKey(key);
      window.showInformationMessage("API Key Saved");
    } else {
      window.showErrorMessage("Invalid API Key");
      context.workspaceState.update("invalidKey", true);
      getApiKey(context, gptutor);
      return;
    }

    quickPick.hide();
  });
  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}

// async function inputApiKey(context: ExtensionContext, invalidKey = false) {
//   const result = await window.showInputBox({
//     title: context.workspaceState.get("invalidKey", false)
//       ? "Invalid OpenAI API Key, Try again."
//       : "Input Your OpenAI API Key",
//     value: "",
//     placeHolder: "Paste My API Key",
//   });
//   if (await openAiIsActive(result)) {
//     context.globalState.update("OpenAI_API_KEY", result);
//     context.workspaceState.update("invalidKey", NaN);
//     window.showInformationMessage("API Key Saved");
//   } else {
//     window.showErrorMessage("Invalid API Key");
//     context.workspaceState.update("invalidKey", true);
//     getApiKey(context);
//     return;
//   }
// }

export async function getLink() {
  env.openExternal(Uri.parse("https://platform.openai.com/account/api-keys"));
}
