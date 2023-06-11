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
import { getApiKey } from "./apiKey";
import { openAiIsActive } from "./openAi";
import { CursorContext } from "./context/cursor.context";
import { GPTutor } from "./gptutor";
import { getModel } from "./model";
import * as fs from "fs";
import { supportedLanguages } from "./media/supportedProgrammingLanguages";
import { getCurrentPromptV2 } from "./getCurrentPromptV2";

// import { TextDocuments } from "vscode-languageserver";
// import { TextDocument } from "vscode-languageserver-textdocument";
// const documents = new TextDocuments(TextDocument);

function initConfig(context: ExtensionContext) {
  let src = context.workspaceState.get("src");

  let SourceConfigPath =
    context.extensionPath + "/" + src + "/media/prompt_config.json";

  if (!fs.existsSync(SourceConfigPath)) {
    fs.copyFileSync(
      SourceConfigPath.replace(
        "prompt_config.json",
        "example_prompt_config.json"
      ),
      SourceConfigPath
    );
  }
  context.subscriptions.push(
    commands.registerCommand("GPTutor Edit Prompts", async () => {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "gptutor.prompts"
      );
    })
  );
  // context.subscriptions.push(
  //   commands.registerCommand("GPTutor Reset Prompts Config", async () => {
  //     vscode.workspace
  //       .openTextDocument(configPath)
  //       .then((doc) => window.showTextDocument(doc));
  //   })
  // );
}

export function activate(context: ExtensionContext) {
  let src =
    vscode.ExtensionMode[context.extensionMode] === "Development"
      ? "src"
      : "out";
  context.workspaceState.update("src", src);
  const cursorContext = new CursorContext(context);
  const gptutor = new GPTutor(context, cursorContext);
  initConfig(context);

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
        .getConfiguration("gptutor")
        .get("openAIApiKey");

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

  // Set OpenAI API key
  context.subscriptions.push(
    commands.registerCommand("Set OpenAI API Key", async () => {
      await getApiKey(context, gptutor);
    })
  );
  // Delete OpenAI API key
  context.subscriptions.push(
    commands.registerCommand("Delete OpenAI API Key", async () => {
      // context.globalState.update("OpenAI_API_KEY", undefined);
      workspace
        .getConfiguration("gptutor")
        .update("openAIApiKey", "", vscode.ConfigurationTarget.Global);
      gptutor.setOpenAiKey("undefined");
      window.showInformationMessage(`OpenAI_API_KEY Deleted`);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("Set Model", async () => {
      await getModel(context);
    })
  );

  // show Hover provider when hovering over code
  // determine if cursor is selected Text or Hovering over some code
  context.subscriptions.push(
    languages.registerHoverProvider(supportedLanguages, {
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
        // const explainCommandUri = Uri.parse(`command:GPTutor Explain`);
        // const commentCommandUri = Uri.parse(`command:GPTutor Comment`);
        // const auditCommandUri = Uri.parse(`command:Audit GPTutor`);

        // const explainCommandUri = Uri.parse(
        //   `command:GPTutor Active?${encodeURIComponent(
        //     JSON.stringify({ mode: "explain" })
        //   )}`
        // );
        // const commentCommandUri = Uri.parse(
        //   `command:GPTutor Active?${encodeURIComponent(
        //     JSON.stringify({ mode: "comment" })
        //   )}`
        // );
        // const auditCommandUri = Uri.parse(
        //   `command:GPTutor Active?${encodeURIComponent(
        //     JSON.stringify({ mode: "audit" })
        //   )}`
        // );

        let config: any = vscode.workspace
          .getConfiguration("")
          .get("gptutor.prompts");
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
    })
  );
  context.subscriptions.push(
    commands.registerCommand("GPTutor Active", async (args) => {
      let config = workspace.getConfiguration("gptutor");
      let prompts: any = config.get("prompts");
      gptutor.active(args.mode);
    })
  );

  commands.executeCommand("Initialize GPTutor");
  // cursorContext.init();
}

// origin
async function getCurrentPrompt(cursorContext: CursorContext) {
  const editor: any = window.activeTextEditor;
  if (!editor) {
    window.showErrorMessage("No active editor");
    throw new Error("No active editor");
  }

  const document = editor.document;
  const languageId = document.languageId;

  const currentTextLines = document.getText().split("\n");
  const anchorPosition: any = cursorContext.anchorPosition;
  // const currentLine = currentTextLines[cursorContext.anchorPosition?.c];
  const question = `Question: why use ${cursorContext.currentText} at ${
    currentTextLines[anchorPosition.c]
  } in the ${document.languageId} code above?`;
  const codeContext = currentTextLines
    .slice(anchorPosition.c - 15, anchorPosition.c + 15)
    .join("\n");

  const definitionContext = await cursorContext.getDefinitionContext();
  const definitionContextPrompt = `The following is the source code of the line ${
    currentTextLines[anchorPosition.c]
  }:\n${definitionContext}`;
  return { languageId, question, codeContext, definitionContextPrompt };
}

export function deactivate() {}
