// @ts-ignore
// Reference: https://github.com/mpociot/chatgpt-vscode/blob/main/media/main.js
function auto_grow(element) {
  setTimeout(() => {
    element.style.height = "5px";
    const max = window.innerHeight * 0.3;
    if (element.scrollHeight <= max) {
      element.style.height = element.scrollHeight + "px";
    } else {
      element.style.height = "30vh";
    }
  }, 300);
}

(function () {
  const vscode = acquireVsCodeApi();
  let response = "";

  window.onload = function () {
    var promptEle = document.getElementById("prompt-input");
    promptEle.value = "";
    setResponse();

    auto_grow(promptEle);
  };

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data;

    switch (message.type) {
      case "gptutor-set-answer": {
        response = message.value;
        setResponse();
        break;
      }
      case "gptutor-clear-answer": {
        response = "";
        break;
      }
      case "gptutor-set-prompt": {
        var promptEle = document.getElementById("prompt-input");
        promptEle.value = message.value;
        auto_grow(promptEle);
        break;
      }
    }
  });

  function fixCodeBlocks(response) {
    // Use a regular expression to find all occurrences of the substring in the string
    const REGEX_CODEBLOCK = new RegExp("```", "g");
    const matches = response.match(REGEX_CODEBLOCK);

    // Return the number of occurrences of the substring in the response, check if even
    const count = matches ? matches.length : 0;
    if (count % 2 === 0) {
      return response;
    } else {
      // else append ``` to the end to make the last code block complete
      return response.concat("\n```");
    }
  }

  function setResponse() {
    let codes = document.getElementsByTagName("Code");
    for (let i = 0; i < codes.length; i++) {
      code = codes[i];
      code.onclick = null;
    }
    var converter = new showdown.Converter({
      omitExtraWLInCodeBlocks: true,
      simplifiedAutoLink: true,
      excludeTrailingPunctuationFromURLs: true,
      literalMidWordUnderscores: true,
      simpleLineBreaks: true,
    });
    response = fixCodeBlocks(response);
    html = converter.makeHtml(response);
    document.getElementById("response").innerHTML = html;

    var preCodeBlocks = document.querySelectorAll("pre code");
    for (var i = 0; i < preCodeBlocks.length; i++) {
      preCodeBlocks[i].classList.add(
        "p-2",
        "my-2",
        "block",
        "overflow-x-scroll"
      );
    }

    var codeBlocks = document.querySelectorAll("code");
    for (var i = 0; i < codeBlocks.length; i++) {
      // Check if innertext starts with "Copy code"
      if (codeBlocks[i].innerText.startsWith("Copy code")) {
        codeBlocks[i].innerText = codeBlocks[i].innerText.replace(
          "Copy code",
          ""
        );
      }

      codeBlocks[i].classList.add(
        "inline-flex",
        "max-w-full",
        "overflow-hidden",
        "rounded-sm",
        "cursor-pointer"
      );

      codeBlocks[i].addEventListener("click", function (e) {
        e.preventDefault();
        vscode.postMessage({
          type: "codeSelected",
          value: this.innerText,
        });
      });

      const d = document.createElement("div");
      d.innerHTML = codeBlocks[i].innerHTML;
      codeBlocks[i].innerHTML = null;
      codeBlocks[i].appendChild(d);
      d.classList.add("code");
    }

    microlight.reset("code");
    codes = document.getElementsByTagName("Code");
    for (let i = 0; i < codes.length; i++) {
      code = codes[i];
      code.onclick = async (event) => {
        await navigator.clipboard.writeText(event.srcElement.innerText);
        vscode.postMessage({
          command: "log",
          text: "[GPTutor] Text Copied to Clipboard.",
        });
      };
    }

    //document.getElementById("response").innerHTML = document.getElementById("response").innerHTML.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }

  // Listen for keyup events on the prompt input element
  document
    .getElementById("prompt-input")
    .addEventListener("keyup", function (e) {
      // If the key that was pressed was the Enter key
      if (e.keyCode === 13) {
        vscode.postMessage({
          type: "prompt",
          value: this.value,
        });
      }
    });
})();
