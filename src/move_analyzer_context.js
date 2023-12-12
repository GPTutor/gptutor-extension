"use strict";
// Copyright (c) The Diem Core Contributors
// Copyright (c) The Move Contributors
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const vscode = require("vscode");
const lc = require("vscode-languageclient");
// const log_1 = require("./log");
const command_exists_1 = require("command-exists");
const vscode_1 = require("vscode");
/** Information passed along to each VS Code command defined by this extension. */
class Context {
  constructor(extensionContext, configuration, client = undefined) {
    this.extensionContext = extensionContext;
    this.configuration = configuration;
    this.client = client;
  }
  static create(extensionContext, configuration) {
    if (!(0, command_exists_1.sync)(configuration.serverPath)) {
      return new Error(
        `language server executable '${configuration.serverPath}' could not be found, so ` +
          "most extension features will be unavailable to you. Follow the instructions in " +
          "the sui-move-analyzer Visual Studio Code extension README to install the language " +
          "server."
      );
    }
    return new Context(extensionContext, configuration);
  }
  /**
   * Registers the given command with VS Code.
   *
   * "Registering" the function means that the VS Code machinery will execute it when the command
   * with the given name is requested by the user. The command names themselves are specified in
   * this extension's `package.json` file, under the key `"contributes.commands"`.
   */
  registerCommand(name, command) {
    const disposable = vscode.commands.registerCommand(
      `sui-move-analyzer.${name}`,
      async (...args) => {
        const ret = await command(this, ...args);
        return ret;
      }
    );
    this.extensionContext.subscriptions.push(disposable);
  }
  /**
   * Sets up additional language configuration that's impossible to do via a
   * separate language-configuration.json file. See [1] for more information.
   *
   * This code originates from [2](vscode-rust).
   *
   * [1]: https://github.com/Microsoft/vscode/issues/11514#issuecomment-244707076
   * [2]: https://github.com/rust-lang/vscode-rust/blob/660b412701fe2ea62fad180c40ee4f8a60571c61/src/extension.ts#L287:L287
   */
  configureLanguage() {
    const disposable = vscode.languages.setLanguageConfiguration("move", {
      onEnterRules: [
        {
          // Doc single-line comment
          // e.g. ///|
          beforeText: /^\s*\/{3}.*$/,
          action: {
            indentAction: vscode_1.IndentAction.None,
            appendText: "/// ",
          },
        },
        {
          // Parent doc single-line comment
          // e.g. //!|
          beforeText: /^\s*\/{2}!.*$/,
          action: {
            indentAction: vscode_1.IndentAction.None,
            appendText: "//! ",
          },
        },
      ],
    });
    this.extensionContext.subscriptions.push(disposable);
  }
  /**
   * Configures and starts the client that interacts with the language server.
   *
   * The "client" is an object that sends messages to the language server, which in Move's case is
   * the `sui-move-analyzer` executable. Unlike registered extension commands such as
   * `sui-move-analyzer.serverVersion`, which are manually executed by a VS Code user via the command
   * palette or menu, this client sends many of its messages on its own (for example, when it
   * starts, it sends the "initialize" request).
   *
   * To read more about the messages sent and responses received by this client, such as
   * "initialize," read [the Language Server Protocol specification](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#initialize).
   *
   * In order to synchronously wait for the client to be completely ready,
   * we need to mark the function as asynchronous
   **/
  async startClient() {
    const executable = {
      command: this.configuration.serverPath,
      options: { shell: true },
    };
    const serverOptions = {
      run: executable,
      debug: executable,
    };
    // The vscode-languageclient module reads a configuration option named
    // "<extension-name>.trace.server" to determine whether to log messages. If a trace output
    // channel is specified, these messages are printed there, otherwise they appear in the
    // output channel that it automatically created by the `LanguageClient` (in this extension,
    // that is 'Move Language Server'). For more information, see:
    // https://code.visualstudio.com/api/language-extensions/language-server-extension-guide#logging-support-for-language-server
    const traceOutputChannel = vscode.window.createOutputChannel(
      "Move Analyzer Language Server Trace"
    );
    const clientOptions = {
      documentSelector: [{ scheme: "file", language: "move" }],
      traceOutputChannel,
    };
    const client = new lc.LanguageClient(
      "sui-move-analyzer",
      "Move Language Server",
      serverOptions,
      clientOptions
    );

    // log_1.log.info('Starting client...');
    const disposable = client.start();
    this.extensionContext.subscriptions.push(disposable);
    this.client = client;
    console.log(client, client.onReady);
    // Wait for the Move Language Server initialization to complete,
    // especially the first symbol table parsing is completed
    await this.client.onReady();
  }
  /**
   * Returns the client that this extension interacts with.
   *
   * @returns lc.LanguageClient
   */
  getClient() {
    return this.client;
  }
} // Context
exports.Context = Context;
//# sourceMappingURL=context.js.map
