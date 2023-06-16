/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
  window,
  commands,
  ExtensionContext,
  Uri,
  languages,
  Hover,
  MarkdownString,
  workspace,
} from "vscode";
import * as vscode from "vscode";
// const path = require('path');
import { openAiIsActive } from "./openAi";
import { CursorContext } from "./context/cursor.context";
import { GPTutor } from "./gptutor";
import * as fs from "fs";
import { getCurrentPromptV2 } from "./getCurrentPromptV2";

export function activate(context: ExtensionContext) {
  let src =
    vscode.ExtensionMode[context.extensionMode] === "Development"
      ? "src"
      : "out";
  context.workspaceState.update("src", src);
  const cursorContext = new CursorContext(context);
  const gptutor = new GPTutor(context, cursorContext);

  console.log(
    'Congratulations, your extension "gptutor-extension" is now active!'
  );
  let disposable = commands.registerCommand(
    "gptutor-extension.helloWorld",
    () => {
      window.showInformationMessage("Hello World from gptutor-extension!");
    }
  );

  gptutor.registerVscode();
  context.subscriptions.push(disposable);

  // Initialize GPTutor
  context.subscriptions.push(
    commands.registerCommand("Initialize GPTutor", async () => {
      console.log("Initialize GPTutor");
      let OPEN_AI_API_KEY: any = vscode.workspace
        .getConfiguration("")
        .get("GPTutor.openaiApiKey");
      // console.log(`OPEN_AI_API_KEY: ${OPEN_AI_API_KEY}`);

      if (await openAiIsActive(OPEN_AI_API_KEY)) {
        gptutor.setOpenAiKey(OPEN_AI_API_KEY);
        window.showInformationMessage(`GPTutor Activate Successfully!`);
      } else {
        window.showErrorMessage(
          "GPTutor Activate Failed because of Invalid OpenAI API Key!"
        );
      }
    })
  );
  context.subscriptions.push(
    commands.registerCommand("GPTutor Edit Prompts", async () => {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "GPTutor.prompts"
      );
    })
  );

  // Set OpenAI API key
  context.subscriptions.push(
    commands.registerCommand("Set OpenAI API Key", async () => {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "GPTutor.openaiApiKey"
      );
    })
  );
  // Delete OpenAI API key
  context.subscriptions.push(
    commands.registerCommand("Delete OpenAI API Key", async () => {
      // context.globalState.update("openaiApiKey", undefined);
      workspace
        .getConfiguration("")
        .update("GPTutor.openaiApiKey", "", vscode.ConfigurationTarget.Global);
      gptutor.setOpenAiKey("undefined");
      window.showInformationMessage(`openaiApiKey Deleted`);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("Set Model", async () => {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "GPTutor.openaiModel"
      );
    })
  );

  // show Hover provider when hovering over code
  // determine if cursor is selected Text or Hovering over some code
  context.subscriptions.push(
    languages.registerHoverProvider(
      { language: "*" },
      {
        provideHover(document, position, token) {
          if (!gptutor.isInited) {
            return new Hover([]);
          }

          const editor = window.activeTextEditor;
          if (!editor) {
            window.showErrorMessage("No active editor");
            return;
          }
          const codeBlockContent = new MarkdownString();
          codeBlockContent.appendCodeblock(`/** GPTutor (🤖,🤖) */`);
          codeBlockContent.appendCodeblock(
            cursorContext.currentText,
            document.languageId
          );

          let config: any = vscode.workspace
            .getConfiguration("")
            .get("GPTutor.prompts");
          let commands: any = {};
          let order: string[] = [];
          let specificLanguagePrompts =
            config.specificLanguage[document.languageId] || {};

          for (let key in specificLanguagePrompts) {
            if (order.includes(key)) {
              continue;
            }
            commands[key] = specificLanguagePrompts[key].display_name;
            order.push(key);
          }

          let prompts = config.global;

          for (let key in prompts) {
            if (order.includes(key)) {
              continue;
            }
            commands[key] = prompts[key].display_name;
            order.push(key);
          }
          let commandString = "";

          order.forEach((key) => {
            commandString += `[${commands[key]}](${Uri.parse(
              `command:GPTutor Active?${encodeURIComponent(
                JSON.stringify({ mode: key })
              )}`
            )})&nbsp;&nbsp;`;
          });

          const command = new MarkdownString(commandString);
          command.isTrusted = true;
          return new Hover([command]);
        },
      }
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "GPTutor Active",
      async (args = { mode: "explain" }) => {
        let config = workspace.getConfiguration("");
        let prompts: any = config.get("GPTutor.prompts");
        gptutor.active(args.mode);
      }
    )
  );

  commands.executeCommand("Initialize GPTutor");
}

export function deactivate() {}
