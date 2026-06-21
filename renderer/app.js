const browseBtn =
  document.getElementById(
    "browseBtn"
  );

const generateBtn =
  document.getElementById(
    "generateBtn"
  );

const javaPathInput =
  document.getElementById(
    "javaPath"
  );

const status =
  document.getElementById(
    "status"
  );

const settingsSection =
  document.getElementById(
    "settingsSection"
  );

const saveSettingsBtn =
  document.getElementById(
    "saveSettingsBtn"
  );

window.addEventListener(
  "DOMContentLoaded",
  async () => {

    try {

      const settings =
        await window.agent
          .getSettings();

      const hasGemini =
        settings.geminiKey &&
        settings.geminiKey.trim() !== "";

      const hasRepo =
        settings.repoPath &&
        settings.repoPath.trim() !== "";

      if (
        hasGemini &&
        hasRepo
      ) {

        settingsSection.style.display =
          "none";

      } else {

        settingsSection.style.display =
          "block";

        document.getElementById(
          "geminiKey"
        ).value =
          settings.geminiKey || "";

        document.getElementById(
          "repoPath"
        ).value =
          settings.repoPath || "";
      }

    } catch (err) {

      console.error(err);

      settingsSection.style.display =
        "block";
    }
  }
);

saveSettingsBtn.addEventListener(
  "click",
  async () => {

    const geminiKey =
      document.getElementById(
        "geminiKey"
      ).value.trim();

    const repoPath =
      document.getElementById(
        "repoPath"
      ).value.trim();

    if (
      !geminiKey ||
      !repoPath
    ) {

      status.innerText =
        "Please enter Gemini Key and Repo Path.";

      return;
    }

    try {

      await window.agent
        .saveSettings({
          geminiKey,
          repoPath
        });

      settingsSection.style.display =
        "none";

      status.innerText =
        "✅ Settings Saved";

    } catch (err) {

      console.error(err);

      status.innerText =
        "❌ Failed to save settings";
    }
  }
);

browseBtn.addEventListener(
  "click",
  async () => {

    const filePath =
      await window.agent
        .browseFile();

    if (filePath) {

      javaPathInput.value =
        filePath;
    }
  }
);

generateBtn.addEventListener(
  "click",
  async () => {

    const url =
      document.getElementById(
        "url"
      ).value;

    const javaPath =
      javaPathInput.value;

    if (
      !url ||
      !javaPath
    ) {

      status.innerText =
        "Please provide URL and Java file.";

      return;
    }

    try {

      status.innerText =
        "Running Agent...";

      await window.agent.run({
        leetcodeUrl: url,
        javaInput: javaPath
      });

      status.innerText =
        "✅ Success!";

    } catch (err) {

      console.error(err);

      status.innerText =
        "❌ " + err.message;
    }
  }
);