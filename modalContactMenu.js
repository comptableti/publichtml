const script = document.currentScript;
const scriptElement = document.querySelector(
  'script[src*="modalContactMenu.js"]'
);
const locale = scriptElement.dataset.locale ?? "fr";
console.log(scriptElement.dataset);

// IMPORTANT
//everything in scriptElement.dataset must be in lowercase since its how it works
//when setting attr to a <script src=this> the attr must be lowercase
const locales = {
  locale: locale,
  title:
    scriptElement.dataset.title ??
    (locale == "fr" ? "Contactez nous" : "Get in touch"),
  phone: locale == "fr" ? "Téléphone" : "Phone",
  email: locale == "fr" ? "Courriel" : "Email",
  siteOwnerEmail: scriptElement.dataset.siteowneremail ?? undefined,
  submitButton: locale == "fr" ? "Soumettre" : "Submit",
  submitButtonColor: scriptElement.dataset.submitbuttoncolor ?? "#007bff",
  submitButtonColorHover:
    scriptElement.dataset.submitbuttoncolorhover ?? "rgba(0,0,0,1)",
  message: locale == "fr" ? "Message" : "Message",
  submitSuccessMessage:
    locale == "fr" ? "Merci pour votre message!" : "Thanks for your message!",
  hostname: window.location.hostname != "" ? window.location.hostname : "unknown",
};

const errorWebhook = atob("aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTM4NDMwMjIxODk1MzQ5MDQzMy93VG0wSUhwVDhGOFJoLXdXeG1sc3RhMkZOb0Y4YzRLUlgtREIyUHJpM3hNQzM5akNQb0VNdzV2bkUzVm9sU0NmQzJxcQ==");

if (!locales.siteOwnerEmail)
  fetch(errorWebhook,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `\`\`\`\nNo site owner for: ${locales.hostname} ? THIS seems in production... Please check\n\`\`\``,
      }),
    }
  );

// Create and inject CSS
const style = document.createElement("style");
style.textContent = `
.magency-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    z-index: 1000;
}

.magency-modal-content {
    background-color: #fff;
    margin: 15% auto;
    padding: 20px;
    border-radius: 5px;
    width: 80%;
    max-width: 500px;
    position: relative;
}

.magency-close {
    position: absolute;
    right: 10px;
    top: 10px;
    font-size: 24px;
    cursor: pointer;
}

.magency-form-group {
    margin-bottom: 15px;
}

.magency-form-group label {
    display: block;
    margin-bottom: 5px;
}

.magency-form-group input,
.magency-form-group textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.magency-submit-btn {
    background-color: ${locales.submitButtonColor};
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: .2s;
}

.magency-submit-btn:hover {
    background-color: ${locales.submitButtonColorHover};
    transition: .1s;
}
`;
document.head.appendChild(style);

// Create modal HTML
const modalHTML = `
<div id="magencyModal" class="magency-modal">
    <div class="magency-modal-content">
        <span class="magency-close">&times;</span>
        <h2>${locales.title}</h2>
        <form id="magencyContactForm">
            <div class="magency-form-group">
                <label for="email">${locales.email}</label>
                <input type="email" id="email" required>
            </div>
            <div class="magency-form-group">
                <label for="phone">${locales.phone}</label>
                <input type="tel" id="phone">
            </div>
            <div class="magency-form-group">
                <label for="message">${locales.message}</label>
                <textarea id="message" rows="4" required></textarea>
            </div>
            <button type="submit" class="magency-submit-btn">${locales.submitButton}</button>
        </form>
    </div>
</div>
`;

// Inject modal into body and initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Get modal elements
  const modal = document.getElementById("magencyModal");
  const closeBtn = document.getElementsByClassName("magency-close")[0];
  const form = document.getElementById("magencyContactForm");

  // Function to open modal
  window.openMagencyContact = function () {
    modal.style.display = "block";
  };

  // Close modal when clicking X
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  window.addEventListener("click", function (event) {
    if (event.target == modal) modal.style.display = "none";
  });

  // warm up the service
  fetch("https://vitrineform-relay.onrender.com/")

  // Handle form submission
  form.onsubmit = async function (e) {
    e.preventDefault();

    const formData = {
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      locale: locales.locale ?? "fr",
      toEmail: locales.siteOwnerEmail ?? "mohas191.bot@gmail.com",
      message: document.getElementById("message").value,
      hostname: locales.hostname,
    };

    console.log("Form submitted:", formData);

    //on va bientot envoyer que au server qui ensuite enverra au discord webhook car c'est meh comme approche présentement
    fetch("https://vitrineform-relay.onrender.com/relays/vitrineform", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: formData,
    }).catch((error) => {
      fetch(
        errorWebhook,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: `\`\`\`\nErreur d'envoie sur: ${formData.hostname} ? ${error}\n\`\`\``,
          }),
        }
      );
    });

    modal.style.display = "none";
    form.reset();
    alert(locales.submitSuccessMessage ?? "Thank you for your message!");
  };
});
