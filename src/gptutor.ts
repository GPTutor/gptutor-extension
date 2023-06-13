import { OpenAIApi } from "openai";
import * as vscode from "vscode";
import { DefaultOpenAiModel, GPTutorOpenAiProvider } from "./openAi";
import {
  GPTutorPromptType,
  getPrompt,
  getExplainRequestMsg,
  FirstAuditRequest,
  getAuditRequestMsg,
  FirstReplyForGpt3,
  CommentRequestMsg,
} from "./prompt";
import { getLink, getApiKey } from "./apiKey";
import { openAiIsActive } from "./openAi";
import { defaultCachePath } from "@vscode/test-electron/out/download";
import { getCurrentPromptV2 } from "./getCurrentPromptV2";
import { setModel } from "./model";
function html(strings: TemplateStringsArray, ...values: any[]) {
  const parsedString = strings.reduce((acc, curr, index) => {
    // Concatenate the current string literal with its interpolated value
    return acc + curr + (index < values.length ? values[index] : "");
  }, "");
  return parsedString;
}
export class GPTutor implements vscode.WebviewViewProvider {
  public static readonly viewType = "GPTutor.chatView";

  private openAiProvider!: GPTutorOpenAiProvider;
  private view?: vscode.WebviewView;

  private context!: vscode.ExtensionContext;
  private cursorContext: any;
  private currentResponse: string = "";
  private currentMessageNum = 0;
  private currentPrompt?: GPTutorPromptType;
  public isInited = false;

  constructor(_context: vscode.ExtensionContext, cursorContext: any) {
    this.context = _context;
    this.cursorContext = cursorContext;
    let channel = vscode.window.createOutputChannel("GPTutor");
    this.context.workspaceState.update("channel", channel);
    this.appendOutput("GPTutor is constructed.");
  }

  appendOutput(text: string) {
    let channel: any = this.context.workspaceState.get("channel");
    channel.appendLine(text);
    // channel.show(true);
    return true;
  }

  async registerVscode() {
    this.context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(GPTutor.viewType, this, {
        webviewOptions: { retainContextWhenHidden: true },
      })
    );

    await vscode.commands.executeCommand(`${GPTutor.viewType}.focus`);
  }

  setOpenAiKey(key: string) {
    this.openAiProvider = new GPTutorOpenAiProvider();
    this.openAiProvider.setApiKey(key);
    this.isInited = true;
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };
    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
    let OPEN_AI_API_KEY: any = vscode.workspace
      .getConfiguration("")
      .get("GPTutor.openaiApiKey");
    openAiIsActive(OPEN_AI_API_KEY).then((isActive) => {
      if (!isActive) {
        this.switchToSetKeyPanel();
      }
    });
    let currentModel: any = vscode.workspace
      .getConfiguration("")
      .get("GPTutor.openaiModel") as string;
    console.log(`current_model: ${currentModel}`);

    this.view.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "alert":
          vscode.window.showErrorMessage(message.text);
          return;
        case "log":
          vscode.window.showInformationMessage(message.text);
          return;
        case "edit-prompt":
          vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "GPTutor.prompts"
          );
          return;
        case "set-model":
          setModel(message.model);
          return;
        case "changeLanguage":
          // this.context.globalState.update("language", message.language);
          vscode.workspace
            .getConfiguration("")
            .update(
              "GPTutor.outputLanguage",
              message.language,
              vscode.ConfigurationTarget.Global
            );
          return;
        case "stop-generation":
          this.currentMessageNum++;
          break;
        case "switch-to-set-key-panel":
          vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "GPTutor.openaiApiKey"
          );
          break;
        case "submit-openai-api-key":
          let newKey = message.key;
          console.log(newKey);
          if (await openAiIsActive(newKey)) {
            // this.context.globalState.update("openaiApiKey", newKey);
            vscode.workspace
              .getConfiguration("")
              .update(
                "GPTutor.openaiApiKey",
                newKey,
                vscode.ConfigurationTarget.Global
              );
            this.setOpenAiKey(newKey);
            this.switchToMainPanel();

            vscode.window.showInformationMessage("OpenAI API Key add success!");
          } else {
            this.view?.webview.postMessage({
              type: "gptutor-invalid-openai-key",
            });
          }
      }
    }, undefined);
  }
  updateViewContent(new_text: string, total_text_so_far: string, options: any) {
    if (options.currentMessageNumber == options.gptutor.currentMessageNum) {
      options.view.webview.postMessage({
        type: "gptutor-set-answer",
        value: total_text_so_far,
      });
    }
  }
  public async active(mode: string) {
    this.currentPrompt = await getCurrentPromptV2(
      this.context,
      this.cursorContext
    );
    const model =
      (vscode.workspace
        .getConfiguration("")
        .get("GPTutor.openaiModel") as string) || DefaultOpenAiModel;

    if (!this.currentPrompt) {
      return;
    }
    if (!this.view) {
      await vscode.commands.executeCommand(`${GPTutor.viewType}.focus`);
    } else {
      this.view?.show?.(true);
    }

    this.currentResponse = "Loading......";

    this.view?.webview.postMessage({
      type: "gptutor-set-prompt",
      value: this.currentPrompt?.selectedCode || "",
    });
    this.view?.webview.postMessage({
      type: "gptutor-set-answer",
      value: this.currentResponse,
    });

    this.currentMessageNum++;
    let gptutor: any = this;
    this.view?.webview.postMessage({
      type: "show-stop-generation-button",
    });
    try {
      let currentMessageNumber = this.currentMessageNum;
      let config: any = vscode.workspace
        .getConfiguration("")
        .get("GPTutor.prompts");
      let prompts =
        config.specificLanguage[this.currentPrompt.languageId] || config.global;
      let prompt: any[] = prompts[mode].prompt;

      let outputLanguage: string =
        vscode.workspace.getConfiguration("").get("GPTutor.outputLanguage") ||
        "English";
      prompt.map((item, index) => {
        let content: string = item.content;
        content = content.replaceAll(
          "${languageId}",
          gptutor.currentPrompt.languageId || ""
        );
        content = content.replaceAll(
          "${auditContext}",
          gptutor.currentPrompt.auditContext || ""
        );
        content = content.replaceAll(
          "${codeContext}",
          gptutor.currentPrompt.codeContext || ""
        );
        content = content.replaceAll(
          "${selectedCode}",
          gptutor.currentPrompt.selectedCode
        );
        content = content.replaceAll("${outputLanguage}", outputLanguage);
        prompt[index].content = content;
      });
      prompt[prompt.length - 1].content +=
        config.appendixForSpecificLanguage[outputLanguage] || "";

      console.log("prompt", prompt);
      let completion: any = await this.openAiProvider.ask(
        model,
        prompt,
        this.updateViewContent, //
        { view: this.view, currentMessageNumber, gptutor }
      );
      this.currentResponse = completion || "";
      console.log({
        currentMessageNumber,
        explainResponse: this.currentResponse,
      });
      if (currentMessageNumber === this.currentMessageNum) {
        this.view?.webview.postMessage({
          type: "hide-stop-generation-button",
        });
      }
    } catch (error: any) {
      if (error?.message === "Request failed with status code 400") {
        vscode.window.showErrorMessage(
          "Request failed with status code 400. This may because the length is too long. You may select less code or use GPT-4 to avoid this problem."
        );
      } else if (
        error?.message === "Request failed with status code 404" &&
        (vscode.workspace
          .getConfiguration("")
          .get("GPTutor.openaiModel") as string) == "gpt-4"
      ) {
        vscode.window.showErrorMessage(
          "Your API Key is not supporting GPT-4, use GPT-3 or try another one"
        );
      } else if (error?.message === "Request failed with status code 401") {
        this.switchToSetKeyPanel();
        vscode.window
          .showErrorMessage(
            error?.message || "ERROR",
            "Set the key now",
            "How to get the key?"
          )
          .then((item) => {
            if (item === "How to get the key?") {
              getLink();
            } else if (item == "Set the key now") {
              this.switchToSetKeyPanel();
            }
          });
        getLink;
      } else if (error?.message.includes("429")) {
        vscode.window
          .showErrorMessage(
            error?.message + "\nYou may hit the API usage limit." || "ERROR",
            "Go to OpenAI Dashboard"
          )
          .then((item) => {
            if (item === "Go to OpenAI Dashboard") {
              vscode.env.openExternal(
                vscode.Uri.parse("https://platform.openai.com/account/api-keys")
              );
            }
          });
        getLink;
      } else {
        vscode.window.showErrorMessage(error?.message || "ERROR");
      }
    }
  }

  switchToSetKeyPanel() {
    this.view?.webview.postMessage({
      type: "gptutor-switch-to-set-key-panel",
      value: this.currentResponse,
    });
  }
  switchToMainPanel() {
    this.view?.webview.postMessage({
      type: "gptutor-switch-to-main-panel",
      value: this.currentResponse,
    });
  }

  private getHtmlForWebview(webview: vscode.Webview) {
    const extensionUri = this.context.extensionUri;

    let src = this.context.workspaceState.get("src", "out");
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, src, "media", "main.js")
    );
    const microlightUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        extensionUri,
        src,
        "media",
        "scripts",
        "microlight.min.js"
      )
    );
    const tailwindUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        extensionUri,
        src,
        "media",
        "scripts",
        "tailwind.min.js"
      )
    );
    const showdownUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        extensionUri,
        src,
        "media",
        "scripts",
        "showdown.min.js"
      )
    );
    const outputLanguage =
      vscode.workspace.getConfiguration("").get("GPTutor.outputLanguage") ||
      "English";

    return String(html`<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <script src="${tailwindUri}"></script>
          <script src="${showdownUri}"></script>
          <script src="${microlightUri}"></script>
          <style>
            .code {
              white-space: pre;
            }
            p {
              padding-top: 0.4rem;
              padding-bottom: 0.4rem;
            }
            ul,
            ol {
              list-style: initial !important;
              margin-left: 10px !important;
            }
            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
              font-weight: bold !important;
            }
            #prompt-input {
              width: 100%;
              word-wrap: break-word;
              height: 30vh;
            }
            .hr {
              margin: 1rem auto;
              opacity: 0.3;
            }
            #response {
              padding-top: 0;
              font-size: 0.8rem;
              line-height: 1rem;
            }
          </style>
        </head>
        <body>
          <div id="setOpenAI-API-Key-panel" class="hidden">
            <h2 class="text-2xl mb-4">You Need to set key to continue.</h2>

            <div class="mb-4">
              <label
                class="block text-white-700 text-sm font-bold mb-2"
                for="input-openai-api-key"
                >OpenAI API KEY</label
              >

              <input
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="input-openai-api-key"
                type="password"
                placeholder="Enter your OpenAI API Key"
              />

              <label
                class="block text-red-500 font-bold text-sm my-0 hidden"
                id="invalid-openai-api-key"
                >Invalid API Key.</label
              >
            </div>
            <div class="flex justify-center">
              <button
                id="submit-openai-api-key"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold mt-1 py-1 px-2 mx-2 rounded focus:outline-none focus:shadow-outline"
              >
                Submit OpenAI API Key
              </button>
            </div>
            <h3>How To Get API Key?</h3>
            <p>
              First, go to
              <a
                href="https://platform.openai.com/"
                class="text-blue-500 underline"
                >OpenAI Platform</a
              >
              and login or sign up. Then click on
              <u><strong>Personal</strong></u
              >, and select
              <a
                href="https://platform.openai.com/account/api-keys"
                class="text-blue-500 underline"
                ><u><strong>View API keys</strong></u></a
              >
              in the drop-down menu. Finally, you can click
              <u><strong>Create API Key</strong></u
              >, and then copy the key and paste it here at GPTutor.
            </p>
            <p>GPTutor doesn't own your key, the key will be stored locally.</p>
          </div>
          <div id="GPTutor-main">
            <div class="flex items-center">
              <!-- <label class="mr-2">Question:</label> -->
              <div class="mr-auto relative text-left">
                <button
                  class="text-white-500 hover:font-bold py-2 px-1 rounded dropdown-button"
                  id="dropdown-button"
                >
                  Settings ▼
                </button>
                <div
                  class="absolute left-0 -mt-1 w-48 bg-stone-600 rounded-md shadow-lg hidden dropdown-menu z-50"
                  id="dropdown-menu"
                >
                  <ul
                    class="py-1"
                    style="list-style-type: none!important; margin-left: 0px !important;"
                  >
                    <li
                      class="relative hover:bg-gray-100 px-2 py-1 hover:text-black cursor-pointer"
                    >
                      <span class="cursor-pointer" id="edit-prompt-in-setting"
                        >Edit Prompt</span
                      >
                    </li>

                    <li
                      class="relative hover:bg-gray-100 px-2 py-1 hover:text-black cursor-pointer"
                    >
                      <span class="cursor-pointer">Set Model</span>
                      <span
                        class="absolute right-2 top-1/2 transform -translate-y-1/2"
                        >▶</span
                      >

                      <div
                        class="absolute left-full top-0 mt-[-1] w-48 bg-stone-600 text-white rounded-md shadow-lg hidden"
                      >
                        <ul
                          class="py-0"
                          style="list-style-type: none!important; margin-left: 0px !important;"
                        >
                          <li id="set-model-gpt3.5">GPT-3.5-Turbo</li>
                          <li id="set-model-gpt4">GPT-4</li>
                        </ul>
                      </div>
                    </li>
                    <li
                      class="relative hover:bg-gray-100 px-2 py-1 hover:text-black cursor-pointer"
                    >
                      <span class="cursor-pointer">Change Language</span>
                      <span
                        class="absolute right-2 top-1/2 transform -translate-y-1/2"
                        >▶</span
                      >

                      <div
                        class="absolute left-full top-0 mt-[-1] w-48 bg-stone-600 text-white rounded-md shadow-lg hidden"
                      >
                        <ul
                          id="language-dropdown-menu-in-setting"
                          class="py-0"
                          style="list-style-type: none!important; margin-left: 0px !important;"
                        ></ul>
                      </div>
                    </li>
                    <li
                      class="relative hover:bg-gray-100 px-2 py-1 hover:text-black cursor-pointer"
                    >
                      <span class="cursor-pointer" id="switch-to-set-key-panel"
                        >Change API Key</span
                      >
                    </li>
                    <li
                      class="relative hover:bg-gray-100 px-2 py-1 hover:text-black cursor-pointer hidden"
                    >
                      <span class="cursor-pointer">Open History</span>

                      <div
                        class="absolute left-full top-0 mt-[-1] w-48 bg-stone-600 text-white rounded-md shadow-lg hidden"
                      >
                        <ul
                          class="py-0"
                          style="list-style-type: none!important; margin-left: 0px !important;"
                        >
                          <li>A</li>
                          <li>B</li>
                        </ul>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="ml-auto relative text-right z-20">
                <button
                  class="text-white-500 hover:font-bold py-2 px-1 rounded dropdown-button"
                  id="language-dropdown-button"
                >
                  ${outputLanguage} ▼
                </button>
                <div
                  class="absolute right-0 -mt-1 w-48 bg-stone-600 rounded-md shadow-lg hidden dropdown-menu"
                  id="language-dropdown-menu"
                >
                  <ul
                    class="py-1 text-left"
                    style="list-style-type: none!important; margin-left: 0px !important;"
                  ></ul>
                </div>
                <button
                  class="text-white-500 hover:font-bold py-2 px-2 rounded hidden"
                  id="edit-prompt"
                >
                  Edit Prompt
                </button>
              </div>
            </div>

            <textarea
              oninput="auto_grow(this)"
              class="h-30 w-full text-white bg-stone-700 p-2 text-sm"
              placeholder="Ask something"
              id="prompt-input"
            >
            </textarea>
            <hr class="hr" />
            <div class="flex items-center">
              <div class="mr-auto relative text-left">
                <label>Answer: </label>
              </div>

              <div class="ml-auto relative text-right">
                <button
                  class="text-white-500 hover:font-bold py-2 px-2 rounded hidden"
                  id="stop-generation-button"
                >
                  Stop
                </button>
              </div>
            </div>

            <div id="response" class="pt-4 text-sm"></div>

            <script src="${scriptUri}"></script>
          </div>
        </body>
      </html>`);
  }
}

export function deactivate() {}
