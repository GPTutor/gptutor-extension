"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textDocumentDefinition = exports.textDocumentHover = exports.textDocumentCompletion = exports.textDocumentDocumentSymbol = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
/**
 * An LSP command textDocument/documentSymbol
 */
async function textDocumentDocumentSymbol(context, params) {
    const client = context.getClient();
    if (client === undefined) {
        return Promise.reject(new Error('No language client connected.'));
    }
    // Send the request to the language client.
    return client.sendRequest(vscode_languageclient_1.DocumentSymbolRequest.type, params);
}
exports.textDocumentDocumentSymbol = textDocumentDocumentSymbol;
/**
 * An LSP command textDocument/completion
 */
async function textDocumentCompletion(context, params) {
    const client = context.getClient();
    if (client === undefined) {
        return Promise.reject(new Error('No language client connected.'));
    }
    // Send the request to the language client.
    return client.sendRequest(vscode_languageclient_1.CompletionRequest.type, params);
}
exports.textDocumentCompletion = textDocumentCompletion;
/**
 * An LSP command textDocument/hover
 */
async function textDocumentHover(context, params) {
    const client = context.getClient();
    if (client === undefined) {
        return Promise.reject(new Error('No language client connected.'));
    }
    // Send the request to the language client.
    return client.sendRequest(vscode_languageclient_1.HoverRequest.method, params);
}
exports.textDocumentHover = textDocumentHover;
/**
 * An LSP command textDocument/definition
 */
async function textDocumentDefinition(context, params) {
    const client = context.getClient();
    if (client === undefined) {
        return Promise.reject(new Error('No language client connected.'));
    }
    // Send the request to the language client.
    return client.sendRequest(vscode_languageclient_1.DefinitionRequest.type, params);
}
exports.textDocumentDefinition = textDocumentDefinition;
//# sourceMappingURL=lsp_command.js.map