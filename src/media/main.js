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
  }, 100);
}

(function () {
  const vscode = acquireVsCodeApi();
  let response = "";

  function askGPTutorBtnClick() {
    let textarea = document.getElementById("prompt-input");
    // let input = textarea.value;
    // let button = document.getElementById("ask-gptutor-button");
    vscode.postMessage({
      command: "ask-gptutor",
      input: textarea.value,
    });
  }

  window.onload = async function () {
    {
      const dropdownMenu = document.getElementById("ask-gptutor-dropdown-menu");
      const dropdownButton = document.getElementById(
        "ask-gptutor-select-mode-button"
      );

      console.log(dropdownButton);
      dropdownButton.addEventListener("click", () => {
        const dropdownMenu = document.getElementById(
          "ask-gptutor-dropdown-menu"
        );

        dropdownMenu.classList.toggle("hidden");
      });
      vscode.postMessage({
        command: "init-chat-mods-options",
      });
    }
    {
      let textarea = document.getElementById("prompt-input");
      let div = document.getElementById("ask-gptutor-div");
      let button = document.getElementById("ask-gptutor-button");
      div.classList.add("hidden");
      function handleTextareaChange() {
        if (textarea.value.length > 0) {
          button.classList.remove("hidden");
        } else {
          button.classList.add("hidden");
        }
      }
      textarea.addEventListener("input", handleTextareaChange);
      button.addEventListener("click", askGPTutorBtnClick);
    }
    {
      document.getElementById("set-openai-temperature").onclick = function () {
        vscode.postMessage({
          command: "open-settings",
          setting: "GPTutor.openaiTemperature",
        });
      };
    }

    {
      let gpt35btn = document.getElementById("set-model-gpt3.5");
      let gpt4btn = document.getElementById("set-model-gpt4");
      let setModelEvent = (event) => {
        vscode.postMessage({
          command: "set-model",
          model: event.srcElement.innerText.toLowerCase(),
        });
      };
      gpt35btn.onclick = setModelEvent;
      gpt4btn.onclick = setModelEvent;
    }

    {
      let btn = document.getElementById("switch-to-set-key-panel");
      let switchToSetKeyPanel = (event) => {
        vscode.postMessage({
          command: "open-settings",
          setting: "GPTutor.openaiApiKey",
        });
      };
      btn.onclick = switchToSetKeyPanel;
    }

    var promptEle = document.getElementById("prompt-input");
    promptEle.value = "";
    setResponse();

    auto_grow(promptEle);

    document.getElementById("stop-generation-button").onclick = function (
      event
    ) {
      event.target.classList.add("hidden");
      vscode.postMessage({
        command: "stop-generation",
      });
    };
    document.getElementById("clear-output-button").onclick = function (event) {
      response = "";
      setResponse();
    };

    let editPromptEvent = () => {
      vscode.postMessage({
        command: "open-settings",
        setting: "GPTutor.prompts",
      });
    };
    var editPromptEle = document.getElementById("edit-prompt");
    var editPromptInSettingEle = document.getElementById(
      "edit-prompt-in-setting"
    );

    editPromptEle.onclick = editPromptEvent;
    editPromptInSettingEle.onclick = editPromptEvent;

    let subOpenAIKeyBtn = document.getElementById("submit-openai-api-key");
    subOpenAIKeyBtn.onclick = function () {
      let keyInput = document.getElementById("input-openai-api-key");
      vscode.postMessage({
        command: "submit-openai-api-key",
        key: keyInput.value,
      });
      keyInput.value = "";
    };

    {
      const dropdownButton = document.getElementById("dropdown-button");
      const dropdownMenu = document.getElementById("dropdown-menu");
      const dropdownMenuUl = dropdownMenu.getElementsByTagName("ul")[0];

      dropdownButton.addEventListener("click", () => {
        const dropdownMenus = document.getElementsByClassName("dropdown-menu");
        Array.from(dropdownMenus).forEach((menu) => {
          if (dropdownMenu != menu) menu.classList.add("hidden");
        });
        dropdownMenu.classList.toggle("hidden");
      });
      dropdownMenu.onclick = function (event) {
        dropdownMenu.classList.add("hidden");
      };

      // Get all dropdown items with nested dropdowns
      const dropdownItems = dropdownMenu.getElementsByClassName("relative");

      // Attach event listeners to each dropdown item
      Array.from(dropdownItems).forEach((item) => {
        const dropdownSubmenu = item.querySelector("div");
        const dropdownText = item.querySelector("span");
        let isMouseInButton = false;
        item.addEventListener("mouseover", () => {
          Array.from(dropdownItems).forEach((item_) => {
            let div = item_.querySelector("div");
            if (div) div.classList.add("hidden");
          });
          if (dropdownSubmenu) dropdownSubmenu.classList.remove("hidden");
          isMouseInButton = true;
        });

        Array.from(item.getElementsByTagName("li")).forEach((li) => {
          li.classList.add(
            "hover:bg-gray-100",
            "px-2",
            "py-1",
            "hover:text-black",
            "cursor-pointer"
          );
        });
      });
    }
    {
      const dropdownButton = document.getElementById(
        "language-dropdown-button"
      );
      const dropdownMenu = document.getElementById("language-dropdown-menu");
      const dropdownMenuUl = dropdownMenu.getElementsByTagName("ul")[0];
      const languageMenuInSetting = document.getElementById(
        "language-dropdown-menu-in-setting"
      );

      dropdownButton.addEventListener("click", () => {
        const dropdownMenus = document.getElementsByClassName("dropdown-menu");
        Array.from(dropdownMenus).forEach((menu) => {
          if (dropdownMenu != menu) menu.classList.add("hidden");
        });
        dropdownMenu.classList.toggle("hidden");
      });

      this.fetch(
        "https://raw.githubusercontent.com/GPTutor/gptutor-extension/main/package.json"
      )
        .then((response) => response.json())
        .then((data) => {
          let languages =
            data.contributes.configuration.properties["GPTutor.outputLanguage"][
              "enum"
            ];
          let languageBottonClickHandler = function (event) {
            vscode.postMessage({
              command: "changeLanguage",
              language: event.srcElement.innerText,
            });
            dropdownButton.innerHTML = `${event.srcElement.innerText} ▼`;
            dropdownMenu.classList.add("hidden");
          };
          languages.forEach((language) => {
            const li = document.createElement("li");
            li.textContent = language;
            li.classList.add(
              "hover:bg-gray-100",
              "hover:text-black",
              "px-2",
              "py-1",
              "cursor-pointer",
              "languageListElements"
            );
            li.onclick = languageBottonClickHandler;
            dropdownMenuUl.appendChild(li);
            let liInSetting = li.cloneNode(true);
            if (language.length > 21)
              liInSetting.innerText = language.slice(0, 19) + "...";
            liInSetting.onclick = languageBottonClickHandler;
            languageMenuInSetting.appendChild(liInSetting);
          });
        });
    }
    document.addEventListener("click", (event) => {
      const targetElement = event.target;
      if (
        !targetElement.closest(".dropdown-menu") &&
        !targetElement.closest(".dropdown-button")
      ) {
        const dropdownMenus = document.getElementsByClassName("dropdown-menu");
        Array.from(dropdownMenus).forEach((menu) => {
          menu.classList.add("hidden");
        });
      }
    });
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
      case "init-chat-mods-options": {
        const dropdownButton = document.getElementById(
          "ask-gptutor-select-mode-button"
        );
        dropdownButton.innerText = `${message.currentOption} ▼`;
        const dropdownMenu = document.getElementById(
          "ask-gptutor-dropdown-menu"
        );
        const dropdownMenuUl = dropdownMenu.getElementsByTagName("ul")[0];
        function chatBottonClickHandler(event) {
          console.log(event);
        }

        message.globalOptions.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          li.classList.add(
            "hover:bg-gray-100",
            "hover:text-black",
            "px-2",
            "py-1",
            "cursor-pointer",
            "languageListElements"
          );
          li.onclick = chatBottonClickHandler;
          dropdownMenuUl.appendChild(li);
          let liInSetting = li.cloneNode(true);
          if (item.length > 21)
            liInSetting.innerText = item.slice(0, 19) + "...";
          // liInSetting.onclick = chatBottonClickHandler;
          // languageMenuInSetting.appendChild(liInSetting);
        });
        {
          const hr = document.createElement("hr");
          dropdownMenuUl.appendChild(hr);
        }
        message.specLanguageOptions.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          li.classList.add(
            "hover:bg-gray-100",
            "hover:text-black",
            "px-2",
            "py-1",
            "cursor-pointer",
            "languageListElements"
          );
          li.onclick = chatBottonClickHandler;
          dropdownMenuUl.appendChild(li);
          let liInSetting = li.cloneNode(true);
          if (item.length > 21)
            liInSetting.innerText = item.slice(0, 19) + "...";
          // liInSetting.onclick = chatBottonClickHandler;
          // languageMenuInSetting.appendChild(liInSetting);
        });

        break;
      }
      case "gptutor-clear-answer": {
        response = "";
        setResponse();
        break;
      }
      case "gptutor-set-prompt": {
        var promptEle = document.getElementById("prompt-input");
        promptEle.value = message.value;
        auto_grow(promptEle);
        let button = document.getElementById("ask-gptutor-div");
        button.classList.add("hidden");
        break;
      }
      case "gptutor-switch-to-set-key-panel": {
        console.log("Please set your API key in the extension settings.");
        var setKeyPanel = document.getElementById("setOpenAI-API-Key-panel");
        setKeyPanel.classList.remove("hidden");
        var gptutorMain = document.getElementById("GPTutor-main");
        gptutorMain.classList.add("hidden");
        break;
      }
      case "gptutor-invalid-openai-key": {
        var setKeyPanel = document.getElementById("invalid-openai-api-key");
        setKeyPanel.classList.remove("hidden");
        break;
      }
      case "gptutor-switch-to-main-panel": {
        var setKeyPanel = document.getElementById("setOpenAI-API-Key-panel");
        setKeyPanel.classList.add("hidden");
        var setKeyPanel = document.getElementById("invalid-openai-api-key");
        setKeyPanel.classList.add("hidden");
        var gptutorMain = document.getElementById("GPTutor-main");
        gptutorMain.classList.remove("hidden");
        var promptEle = document.getElementById("prompt-input");
        promptEle.value = message.value;
        auto_grow(promptEle);
        break;
      }
      case "show-stop-generation-button": {
        let stopButton = window.document.getElementById(
          "stop-generation-button"
        );
        stopButton.classList.remove("hidden");
        break;
      }
      case "hide-stop-generation-button": {
        let stopButton = window.document.getElementById(
          "stop-generation-button"
        );
        stopButton.classList.add("hidden");
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
